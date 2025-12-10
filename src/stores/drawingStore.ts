import { defineStore } from 'pinia'
import type {
  Shape,
  AppState,
  ToolType,
  HistoryEntry,
  HistoryAction,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
  StampShape,
  StampSizePreset,
  FillPoint,
  TemplateDefinition,
  BackgroundConfig,
} from '@/types'
import { DEFAULT_BACKGROUND } from '@/types'
import {
  computeRectangleFromDrag,
  computeCircleFromDrag,
  computeTriangleFromDrag,
  computeStarFromDrag,
  computeHeartFromDrag,
  computeLineFromDrag,
  validateShapeSize,
  shapeToRelative,
  shapeToAbsolute,
  toRelative,
  type DragPoint,
  type CanvasDimensions,
} from '@/utils/shapeGeometry'
import { generateRandomShapes } from '@/utils/shapeGenerator'
import type { GenerationResult } from '@/types/generator'
import { applyTemplate as applyTemplateUtil } from '@/utils/templateUtils'
import { applySvgTemplate } from '@/utils/svgTemplateConverter'

// Limit undo history to prevent memory bloat with many fills
// Each history entry stores a full snapshot of all fills
const MAX_HISTORY_SIZE = 10

export const useDrawingStore = defineStore('drawing', {
  state: (): AppState => ({
    shapes: [],
    fills: [], // Pixel-based fills stored as click points for replay
    currentTool: 'rectangle',
    currentColor: '#FF6B6B',
    isColoringMode: false,
    recentCustomColors: [] as string[], // Last 5 custom colors picked by user
    history: {
      past: [],
      present: [],
      future: [],
    },
    isDragging: false,
    activeShapeId: null,
    previewShape: null,
    dragStart: null,
    isFilling: false, // Track fill operation progress
    // Canvas dimensions for coordinate conversion (set by Canvas component)
    canvasDimensions: { width: 800, height: 600 } as CanvasDimensions,
    // Stamp tool state
    currentStampKey: null, // No stamp selected initially
    currentStampSize: 'medium', // Default size preset
    // Background layer state
    background: DEFAULT_BACKGROUND, // Start with no background (white canvas)
  }),

  getters: {
    shapeCount: state => state.shapes.length,
    selectedShape: state => {
      if (!state.activeShapeId) return null
      return state.shapes.find(s => s.id === state.activeShapeId) || null
    },
    canUndo: state => state.history.past.length > 0,
    canRedo: state => state.history.future.length > 0,
    getShapeById: state => (id: string) => {
      return state.shapes.find(s => s.id === id)
    },
    // Get preview shape for rendering (already in absolute coords during drag)
    previewShapeForRender: state => {
      return state.previewShape
    },
    // Get shapes converted to absolute coordinates for rendering
    shapesForRender: state => {
      return state.shapes.map(shape => shapeToAbsolute(shape, state.canvasDimensions))
    },
  },

  actions: {
    // Tool and UI state actions
    setCurrentTool(tool: ToolType) {
      // Guard: Cancel any active drawing when switching tools
      if (this.isDragging) {
        this.cancelDrawing()
      }
      this.currentTool = tool
    },

    setCurrentColor(color: string) {
      this.currentColor = color
    },

    /**
     * Add a custom color and set it as current
     * Stores in recent custom colors (max 5, most recent first)
     */
    addCustomColor(color: string) {
      this.currentColor = color
      // Add to recent custom colors, remove duplicates, keep last 5
      this.recentCustomColors = [
        color,
        ...this.recentCustomColors.filter(c => c.toLowerCase() !== color.toLowerCase()),
      ].slice(0, 5)
    },

    setColoringMode(isColoring: boolean) {
      this.isColoringMode = isColoring
    },

    toggleColoringMode() {
      this.isColoringMode = !this.isColoringMode
      // Auto-select fill tool when entering Coloring Mode
      if (this.isColoringMode) {
        this.currentTool = 'fill'
      } else {
        // Reset to a drawing tool when leaving Coloring Mode
        // This prevents fill tool from staying active in Draw mode
        this.currentTool = 'rectangle'
      }
    },

    // Stamp tool actions
    setCurrentStampKey(stampKey: string | null) {
      this.currentStampKey = stampKey
    },

    setCurrentStampSize(size: StampSizePreset) {
      this.currentStampSize = size
    },

    // Background actions
    /**
     * Set the background configuration
     * Background changes do NOT go into undo history (design decision)
     * @param config - The new background configuration
     */
    setBackground(config: BackgroundConfig) {
      this.background = config
    },

    /**
     * Reset background to default (none/white)
     */
    resetBackground() {
      this.background = DEFAULT_BACKGROUND
    },

    /**
     * Add a stamp shape at the specified position
     * @param pixelX - X position in pixels (will be converted to relative)
     * @param pixelY - Y position in pixels (will be converted to relative)
     * @returns The created stamp shape or null if no stamp is selected
     */
    addStamp(pixelX: number, pixelY: number): StampShape | null {
      if (!this.currentStampKey) {
        return null
      }

      const now = Date.now()
      const stamp: StampShape = {
        id: `stamp-${now}-${Math.random()}`,
        type: 'stamp',
        stampKey: this.currentStampKey,
        sizePreset: this.currentStampSize,
        // Convert pixel position to relative (0-1) coordinates
        x: toRelative(pixelX, this.canvasDimensions.width),
        y: toRelative(pixelY, this.canvasDimensions.height),
        strokeColor: '#000000', // Stamps use black stroke by default
        strokeWidth: 2.5,
        rotation: 0,
        createdAt: now,
        updatedAt: now,
      }

      // Add to shapes via existing addShape (handles history)
      this.addShape(stamp)
      return stamp
    },

    // Set canvas dimensions (called by Canvas component on mount/resize)
    setCanvasDimensions(width: number, height: number) {
      this.canvasDimensions = { width, height }
    },

    // Helper to create history entry (includes fills snapshot for undo/redo)
    _createHistoryEntry(
      action: HistoryAction,
      shapeId?: string,
      shapeBefore?: Shape,
      shapeAfter?: Shape
    ): HistoryEntry {
      return {
        id: `${Date.now()}-${Math.random()}`,
        action,
        timestamp: Date.now(),
        shapeId,
        shapeBefore,
        shapeAfter,
        shapesSnapshot: [...this.shapes],
        fillsSnapshot: [...this.fills],
      }
    },

    // Trim history to prevent memory bloat
    _trimHistory() {
      while (this.history.past.length > MAX_HISTORY_SIZE) {
        this.history.past.shift() // Remove oldest entry
      }
    },

    // Shape lifecycle actions
    addShape(shape: Shape) {
      // Guard: Validate shape before adding
      if (!shape || !shape.id || !shape.type) {
        console.warn('Attempted to add invalid shape:', shape)
        return
      }

      // Guard: Ensure stroke width is set (default to 2.5px for smoother appearance)
      if (!shape.strokeWidth || shape.strokeWidth <= 0) {
        shape.strokeWidth = 2.5
      }

      // Guard: Ensure stroke color is set (default to black if missing)
      if (!shape.strokeColor) {
        shape.strokeColor = '#000000'
      }

      // Note: Size validation happens in commitDrawing() before coordinate conversion
      // Shapes here are already in relative coordinates (0-1)

      // Create history entry BEFORE modifying state (snapshot captures state before action)
      const entry = this._createHistoryEntry('add', shape.id, undefined, shape)
      this.shapes.push(shape)
      this.history.past.push(entry)
      this._trimHistory()
      this.history.present = [...this.shapes]
      // Clear future when new action is performed
      this.history.future = []
    },

    // Add a fill point (pixel-based flood fill that respects visual boundaries)
    // Stores click position in relative coords for replay on resize
    addFill(pixelX: number, pixelY: number) {
      const fill: FillPoint = {
        id: `fill-${Date.now()}-${Math.random()}`,
        x: toRelative(pixelX, this.canvasDimensions.width),
        y: toRelative(pixelY, this.canvasDimensions.height),
        color: this.currentColor,
      }

      // Create history entry BEFORE modifying state (snapshot captures state before action)
      const entry = this._createHistoryEntry('update')
      this.fills.push(fill)
      this.history.past.push(entry)
      this._trimHistory()
      this.history.present = [...this.shapes]
      this.history.future = []

      return fill
    },

    updateShape(id: string, patch: Partial<Shape>) {
      const index = this.shapes.findIndex(s => s.id === id)
      if (index === -1) return

      const shapeBefore = { ...this.shapes[index] }
      const shapeAfter: Shape = {
        ...this.shapes[index],
        ...patch,
        updatedAt: Date.now(),
      } as Shape

      this.shapes[index] = shapeAfter
      const entry = this._createHistoryEntry('update', id, shapeBefore, shapeAfter)
      this.history.past.push(entry)
      this._trimHistory()
      this.history.present = [...this.shapes]
      this.history.future = []
    },

    removeShape(id: string) {
      const index = this.shapes.findIndex(s => s.id === id)
      if (index === -1) return

      const shapeBefore = { ...this.shapes[index] }
      this.shapes.splice(index, 1)

      const entry = this._createHistoryEntry('remove', id, shapeBefore, undefined)
      this.history.past.push(entry)
      this._trimHistory()
      this.history.present = [...this.shapes]
      this.history.future = []

      // Clear active shape if it was removed
      if (this.activeShapeId === id) {
        this.activeShapeId = null
      }
    },

    /**
     * Set a shape's fill color (used for stamps and direct shape coloring)
     * This bypasses the pixel-based flood fill for more reliable coloring
     */
    setShapeFillColor(shapeId: string, color: string) {
      const index = this.shapes.findIndex(s => s.id === shapeId)
      if (index === -1) return

      const shapeBefore = { ...this.shapes[index] }
      const shapeAfter: Shape = {
        ...this.shapes[index],
        fillColor: color,
        updatedAt: Date.now(),
      } as Shape

      this.shapes[index] = shapeAfter

      const entry = this._createHistoryEntry('update', shapeId, shapeBefore, shapeAfter)
      this.history.past.push(entry)
      this._trimHistory()
      this.history.present = [...this.shapes]
      this.history.future = []
    },

    // History actions
    undo() {
      if (this.history.past.length === 0) return

      // Guard: Cancel any active drawing before undoing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      const lastEntry = this.history.past.pop()!
      this.history.future.unshift(lastEntry)

      // Restore previous state from snapshot (includes fills)
      if (lastEntry.shapesSnapshot) {
        this.shapes = [...lastEntry.shapesSnapshot]
        this.history.present = [...this.shapes]
      }
      if (lastEntry.fillsSnapshot) {
        this.fills = [...lastEntry.fillsSnapshot]
      }
    },

    redo() {
      if (this.history.future.length === 0) return

      // Guard: Cancel any active drawing before redoing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      const nextEntry = this.history.future.shift()!
      this.history.past.push(nextEntry)

      // For redo, we need to look at the NEXT entry's snapshot to know what state to restore to
      // Actually, we need to re-apply the action that was undone
      // The simplest approach: look at what the next past entry's snapshot should be

      // Apply the change based on action type
      if (nextEntry.action === 'add' && nextEntry.shapeAfter) {
        this.shapes.push(nextEntry.shapeAfter)
      } else if (nextEntry.action === 'remove' && nextEntry.shapeId) {
        const index = this.shapes.findIndex(s => s.id === nextEntry.shapeId)
        if (index !== -1) {
          this.shapes.splice(index, 1)
        }
      } else if (nextEntry.action === 'update') {
        // For update actions (including fills), restore from current state
        // We need to look ahead - the fills were added after the snapshot
        if (nextEntry.shapeAfter && nextEntry.shapeId) {
          const index = this.shapes.findIndex(s => s.id === nextEntry.shapeId)
          if (index !== -1) {
            this.shapes[index] = nextEntry.shapeAfter
          }
        }
      }

      // For fills redo: we need to add back the fill that was removed during undo
      // The snapshot stored the state BEFORE the action, so we need to figure out what was added
      // Simpler approach: store fills in the entry when it's a fill operation

      this.history.present = [...this.shapes]
    },

    // Clear all shapes and fills
    /**
     * Clear all shapes and fills from the canvas
     * @param resetBackground - If true, also reset background to default (white)
     */
    clearShapes(resetBackground: boolean = false) {
      // Guard: Cancel any active drawing before clearing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        action: 'clear',
        timestamp: Date.now(),
        shapesSnapshot: [...this.shapes],
        fillsSnapshot: [...this.fills],
      }
      this.history.past.push(entry)
      this.shapes = []
      this.fills = []
      this.history.present = []
      this.history.future = []
      this.activeShapeId = null
      // Ensure preview shape is also cleared
      this.previewShape = null

      // Optionally reset background
      if (resetBackground) {
        this.background = DEFAULT_BACKGROUND
      }
    },

    // Interaction state
    setDragging(isDragging: boolean) {
      this.isDragging = isDragging
    },

    setActiveShapeId(id: string | null) {
      this.activeShapeId = id
    },

    // Drawing operations
    startDrawing(startX: number, startY: number): string | null {
      // Only allow drawing with shape tools (not fill, select, eraser)
      const drawingTools: ToolType[] = ['rectangle', 'circle', 'triangle', 'star', 'heart', 'line']
      if (!drawingTools.includes(this.currentTool)) {
        return null
      }

      // Don't start if already drawing
      if (this.isDragging) {
        return null
      }

      const shapeId = `preview-${Date.now()}-${Math.random()}`
      const dragStart: DragPoint = { x: startX, y: startY }

      // Create initial preview shape based on tool type
      let previewShape: Shape | null = null

      // Shape strokes are always black (fills use currentColor)
      const STROKE_COLOR = '#000000'
      const STROKE_WIDTH = 2.5 // Slightly thicker for smoother anti-aliased appearance

      if (this.currentTool === 'rectangle') {
        previewShape = {
          id: shapeId,
          type: 'rectangle',
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as RectangleShape
      } else if (this.currentTool === 'circle') {
        previewShape = {
          id: shapeId,
          type: 'circle',
          x: startX,
          y: startY,
          radius: 0,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as CircleShape
      } else if (this.currentTool === 'triangle') {
        previewShape = {
          id: shapeId,
          type: 'triangle',
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as TriangleShape
      } else if (this.currentTool === 'star') {
        previewShape = {
          id: shapeId,
          type: 'star',
          x: startX,
          y: startY,
          outerRadius: 0,
          innerRadius: 0,
          points: 5,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as StarShape
      } else if (this.currentTool === 'heart') {
        previewShape = {
          id: shapeId,
          type: 'heart',
          x: startX,
          y: startY,
          width: 0,
          height: 0,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as HeartShape
      } else if (this.currentTool === 'line') {
        previewShape = {
          id: shapeId,
          type: 'line',
          x: startX,
          y: startY,
          x2: startX,
          y2: startY,
          strokeColor: STROKE_COLOR,
          strokeWidth: STROKE_WIDTH,
          rotation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as LineShape
      }

      if (!previewShape) {
        return null
      }

      this.isDragging = true
      this.activeShapeId = shapeId
      this.previewShape = previewShape
      this.dragStart = dragStart

      return shapeId
    },

    updateDrawing(currentX: number, currentY: number) {
      if (!this.isDragging || !this.previewShape || !this.dragStart) {
        return
      }

      const currentPoint: DragPoint = { x: currentX, y: currentY }
      let updatedShape: Shape | null = null

      if (this.currentTool === 'rectangle') {
        const geometry = computeRectangleFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as RectangleShape
      } else if (this.currentTool === 'circle') {
        const geometry = computeCircleFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as CircleShape
      } else if (this.currentTool === 'triangle') {
        const geometry = computeTriangleFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as TriangleShape
      } else if (this.currentTool === 'star') {
        const geometry = computeStarFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as StarShape
      } else if (this.currentTool === 'heart') {
        const geometry = computeHeartFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as HeartShape
      } else if (this.currentTool === 'line') {
        const geometry = computeLineFromDrag(this.dragStart, currentPoint)
        updatedShape = {
          ...this.previewShape,
          ...geometry,
          updatedAt: Date.now(),
        } as LineShape
      }

      if (updatedShape) {
        this.previewShape = updatedShape
      }
    },

    commitDrawing() {
      if (!this.isDragging || !this.previewShape) {
        this.cancelDrawing()
        return
      }

      // Guard: Validate shape size before committing (preview is in absolute coords)
      if (!validateShapeSize(this.previewShape)) {
        // Shape too small, cancel instead of committing
        this.cancelDrawing()
        return
      }

      // Guard: Ensure stroke width is set (default for smooth appearance)
      if (!this.previewShape.strokeWidth || this.previewShape.strokeWidth <= 0) {
        this.previewShape.strokeWidth = 2.5
      }

      // Convert from absolute (pixel) coords to relative (0-1) coords for storage
      // This ensures shapes scale correctly when canvas resizes
      const relativeShape = shapeToRelative(this.previewShape, this.canvasDimensions)

      // Create final shape (remove preview ID, use new ID)
      const finalShape: Shape = {
        ...relativeShape,
        id: `shape-${Date.now()}-${Math.random()}`,
      }

      // Add to store (this commits to history and triggers canvas redraw)
      // addShape() includes additional validation guards
      this.addShape(finalShape)

      // Clear drawing state (ensures no transient data remains)
      this.isDragging = false
      this.activeShapeId = null
      this.previewShape = null
      this.dragStart = null
    },

    cancelDrawing() {
      this.isDragging = false
      this.activeShapeId = null
      this.previewShape = null
      this.dragStart = null
    },

    /**
     * Generate a coloring page with random shapes
     * Clears existing shapes and fills, then generates new ones
     * @param complexity - 0-1, where 0 = few large shapes, 1 = many small shapes
     */
    generateColoringPage(complexity: number) {
      // Guard: Cancel any active drawing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      // Clamp complexity to valid range
      const clampedComplexity = Math.max(0, Math.min(1, complexity))

      // Create history entry for the clear operation (so we can undo)
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        action: 'clear',
        timestamp: Date.now(),
        shapesSnapshot: [...this.shapes],
        fillsSnapshot: [...this.fills],
      }
      this.history.past.push(entry)
      this._trimHistory()

      // Clear existing shapes and fills
      this.shapes = []
      this.fills = []
      this.activeShapeId = null
      this.previewShape = null

      // Generate new shapes (already in relative coordinates)
      const newShapes = generateRandomShapes(clampedComplexity)

      // Add all shapes (they're already in relative coords, so add directly)
      this.shapes = newShapes
      this.history.present = [...this.shapes]
      this.history.future = []
    },

    /**
     * Apply a themed generation result to the canvas
     * Used by the new Magic Generator with themes and styles
     * @param result - The generation result from themed generator
     */
    applyGenerationResult(result: GenerationResult) {
      // Guard: Cancel any active drawing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      // Create history entry (so we can undo)
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        action: 'clear',
        timestamp: Date.now(),
        shapesSnapshot: [...this.shapes],
        fillsSnapshot: [...this.fills],
      }
      this.history.past.push(entry)
      this._trimHistory()

      // Clear existing shapes and fills
      this.shapes = []
      this.fills = []
      this.activeShapeId = null
      this.previewShape = null

      // Apply the generated shapes (already in relative coordinates)
      this.shapes = result.shapes
      this.history.present = [...this.shapes]
      this.history.future = []
    },

    /**
     * Apply a template from the template library
     * Clears existing shapes and fills, then loads the template shapes
     * @param template - Template definition to apply
     */
    async applyTemplate(template: TemplateDefinition) {
      // Guard: Cancel any active drawing
      if (this.isDragging) {
        this.cancelDrawing()
      }

      // Create history entry (so we can undo)
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        action: 'clear',
        timestamp: Date.now(),
        shapesSnapshot: [...this.shapes],
        fillsSnapshot: [...this.fills],
      }
      this.history.past.push(entry)
      this._trimHistory()

      // Clear existing shapes and fills
      this.shapes = []
      this.fills = []
      this.activeShapeId = null
      this.previewShape = null

      let newShapes: Shape[]

      // Handle SVG templates differently
      if (template.source === 'path' && template.pathData) {
        try {
          newShapes = await applySvgTemplate(template, this.canvasDimensions, {
            margin: 0.08, // 8% margin on each side
          })
        } catch (error) {
          console.error('Failed to apply SVG template:', error)
          // Fall back to empty shapes
          newShapes = []
        }
      } else {
        // Apply primitive template - transforms shapes to fit canvas with margins
        newShapes = applyTemplateUtil(template, this.canvasDimensions, {
          margin: 0.08, // 8% margin on each side
        })
      }

      // Add all shapes
      this.shapes = newShapes
      this.history.present = [...this.shapes]
      this.history.future = []
    },
  },
})
