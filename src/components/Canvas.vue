<template>
  <div ref="containerRef" class="canvas-container">
    <!-- Zoom Controls -->
    <div class="zoom-controls">
      <button
        class="zoom-btn"
        @click="zoomOut"
        :disabled="zoom <= MIN_ZOOM"
        aria-label="Zoom out"
        title="Zoom out"
      >
        −
      </button>
      <button
        class="zoom-indicator"
        @click="resetZoom"
        aria-label="Reset zoom"
        title="Reset zoom to 100%"
      >
        {{ zoomPercent }}%
      </button>
      <button
        class="zoom-btn"
        @click="zoomIn"
        :disabled="zoom >= MAX_ZOOM"
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
    </div>

    <!-- Viewport for zoom/pan (captures wheel events) -->
    <div
      ref="viewportRef"
      :class="['canvas-viewport', { 'is-panning': isPanning }]"
      @wheel.prevent="handleWheel"
    >
      <!-- Wrapper that applies CSS transform for zoom/pan -->
      <div class="canvas-transform-wrapper" :style="transformStyle">
        <!-- DUAL CANVAS ARCHITECTURE -->
        <!-- Background Canvas (bottom): Renders backgrounds only, animations run here -->
        <canvas ref="bgCanvasRef" class="canvas-layer canvas-bg"></canvas>
        <!-- Drawing Canvas (top): White BG for flood fill, shapes & fills render here -->
        <canvas
          ref="canvasRef"
          :class="[
            'canvas-layer',
            'canvas-drawing',
            { 'fill-tool': drawingStore.currentTool === 'fill' },
            { 'eraser-tool': drawingStore.currentTool === 'eraser' },
            { 'eraser-hover': drawingStore.currentTool === 'eraser' && hoveredShapeId },
            { 'stamp-tool': drawingStore.currentTool === 'stamp' },
          ]"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useDrawingStore } from '@/stores'
import { renderShapes } from '@/utils/renderShapes'
import { floodFill } from '@/utils/floodFill'
import { toAbsolute } from '@/utils/shapeGeometry'
import { hitTestShapes } from '@/utils/hitTest'
import { renderBackground, isAnimatedBackground } from '@/utils/backgroundRenderer'
import type { Shape } from '@/types'

export interface CanvasRef {
  /** Drawing canvas (top layer) - shapes and fills render here */
  canvas: HTMLCanvasElement
  /** Drawing canvas context */
  ctx: CanvasRenderingContext2D | null
  /** Background canvas (bottom layer) - backgrounds render here */
  bgCanvas: HTMLCanvasElement
  /** Background canvas context */
  bgCtx: CanvasRenderingContext2D | null
  /** Redraw the canvas */
  redraw: () => void
  /** Reset zoom to 100% */
  resetZoom: () => void
  /** Get composite image data (both layers combined) for export */
  getCompositeImageData: () => ImageData | null
}

interface Props {
  padding?: number
  shapes?: Shape[]
}

const props = withDefaults(defineProps<Props>(), {
  padding: 0,
  shapes: () => [],
})

const drawingStore = useDrawingStore()

const containerRef = ref<HTMLDivElement | null>(null)
const viewportRef = ref<HTMLDivElement | null>(null)

// ============================================================================
// DUAL CANVAS ARCHITECTURE
// ============================================================================
// Background Canvas: Renders backgrounds only (static or animated)
// Drawing Canvas: White background for flood fill, shapes & fills render here
// White pixels in drawing canvas are converted to transparent for display
// This separation ensures:
// 1. Fill tool always works on white background
// 2. Animations never interfere with drawing operations
// 3. Clean separation of concerns
// ============================================================================

// Background canvas (bottom layer)
const bgCanvasRef = ref<HTMLCanvasElement | null>(null)
const bgCtx = ref<CanvasRenderingContext2D | null>(null)

// Drawing canvas (top layer)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const currentDpr = ref(1)

// ============================================================================
// ZOOM STATE
// ============================================================================
const MIN_ZOOM = 0.5 // 50%
const MAX_ZOOM = 3 // 300%
const ZOOM_STEP = 0.25 // 25% per button click
const WHEEL_ZOOM_SENSITIVITY = 0.001 // Scroll wheel sensitivity

const zoom = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

// Pinch-to-zoom state
const pinchStartDistance = ref(0)
const pinchStartZoom = ref(1)
const pinchStartCenter = ref({ x: 0, y: 0 })
const activeTouches = ref<Map<number, { x: number; y: number }>>(new Map())

// Pan state (right-click drag)
const isPanning = ref(false)
const panStartX = ref(0)
const panStartY = ref(0)
const panStartOffsetX = ref(0)
const panStartOffsetY = ref(0)

// Eraser hover state
const hoveredShapeId = ref<string | null>(null)

// Animation state for animated backgrounds
const animationFrameId = ref<number | null>(null)
const animationTime = ref(0)
const lastFrameTime = ref(0)

// Target frame rate for animations (lower = better performance, still smooth enough)
const ANIMATION_TARGET_FPS = 24
const ANIMATION_FRAME_INTERVAL = 1000 / ANIMATION_TARGET_FPS

// Computed zoom percentage for display
const zoomPercent = computed(() => Math.round(zoom.value * 100))

// Computed CSS transform style
const transformStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value})`,
  transformOrigin: '0 0',
}))

// ============================================================================
// PERFORMANCE: Canvas state caching with incremental fills
// ============================================================================
// Cache the "base state" (shapes + fills) to avoid expensive fill replays.
// When a new fill is added, apply it incrementally on top of the cache
// instead of replaying ALL fills from scratch.
const baseStateCache = ref<ImageData | null>(null)
const cacheValid = ref(false)
const cachedFillCount = ref(0) // Track how many fills are in the cache

// ============================================================================
// FILL MASK: Track which pixels have been filled
// ============================================================================
// This mask prevents filled pixels from being made transparent during the
// white-to-transparent conversion. Without it, light colors like white, pink,
// or light blue would become semi-transparent because their RGB values
// have high minimum values (which the old algorithm treated as "white blend").
// The mask is a Uint8Array with 1 byte per pixel: 0 = not filled, 1 = filled
const fillMask = ref<Uint8Array | null>(null)

// ============================================================================
// ZOOM HELPER FUNCTIONS
// ============================================================================

/**
 * Clamp a value between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Zoom in by one step (button click)
 */
const zoomIn = () => {
  const newZoom = clamp(zoom.value + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
  // Zoom toward center of viewport
  zoomTowardPoint(newZoom, getViewportCenter())
}

/**
 * Zoom out by one step (button click)
 */
const zoomOut = () => {
  const newZoom = clamp(zoom.value - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
  // Zoom toward center of viewport
  zoomTowardPoint(newZoom, getViewportCenter())
}

/**
 * Reset zoom to 100% and center the canvas
 */
const resetZoom = () => {
  zoom.value = 1
  centerCanvas()
}

/**
 * Center the canvas within the viewport at current zoom level
 */
const centerCanvas = () => {
  if (!viewportRef.value || !canvasRef.value) {
    offsetX.value = 0
    offsetY.value = 0
    return
  }

  const viewportRect = viewportRef.value.getBoundingClientRect()
  const { width: canvasWidth, height: canvasHeight } = getCanvasSize()

  // Calculate offset to center the scaled canvas
  const scaledWidth = canvasWidth * zoom.value
  const scaledHeight = canvasHeight * zoom.value

  offsetX.value = (viewportRect.width - scaledWidth) / 2
  offsetY.value = (viewportRect.height - scaledHeight) / 2
}

/**
 * Get the center point of the viewport
 */
const getViewportCenter = (): { x: number; y: number } => {
  if (!viewportRef.value) return { x: 0, y: 0 }
  const rect = viewportRef.value.getBoundingClientRect()
  return {
    x: rect.width / 2,
    y: rect.height / 2,
  }
}

/**
 * Zoom toward a specific point (keeps that point stable)
 * This is the key math for cursor-anchored zooming
 */
const zoomTowardPoint = (newZoom: number, point: { x: number; y: number }) => {
  const clampedZoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM)
  const scaleRatio = clampedZoom / zoom.value

  // Keep the point under cursor stable
  // Before zoom: point = offsetX + localX * zoom
  // After zoom:  point = newOffsetX + localX * newZoom
  // Therefore: newOffsetX = point - (point - offsetX) * scaleRatio
  offsetX.value = point.x - scaleRatio * (point.x - offsetX.value)
  offsetY.value = point.y - scaleRatio * (point.y - offsetY.value)
  zoom.value = clampedZoom
}

/**
 * Convert screen coordinates (relative to viewport) to canvas coordinates
 * Accounts for zoom and pan offset
 */
const screenToCanvas = (screenX: number, screenY: number): { x: number; y: number } => {
  return {
    x: (screenX - offsetX.value) / zoom.value,
    y: (screenY - offsetY.value) / zoom.value,
  }
}

/**
 * Handle mouse wheel zoom - zoom toward cursor position
 */
const handleWheel = (event: WheelEvent) => {
  // Get cursor position relative to viewport
  if (!viewportRef.value) return
  const rect = viewportRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Calculate new zoom level
  // Negative deltaY = scroll up = zoom in
  const factor = 1 + -event.deltaY * WHEEL_ZOOM_SENSITIVITY
  const newZoom = clamp(zoom.value * factor, MIN_ZOOM, MAX_ZOOM)

  // Zoom toward cursor
  zoomTowardPoint(newZoom, { x, y })
}

// ============================================================================
// PAN HANDLERS (Right-click drag)
// ============================================================================

/**
 * Start panning on right mouse button down
 */
const startPan = (event: PointerEvent) => {
  isPanning.value = true
  panStartX.value = event.clientX
  panStartY.value = event.clientY
  panStartOffsetX.value = offsetX.value
  panStartOffsetY.value = offsetY.value

  // Capture pointer for smooth panning
  if (viewportRef.value) {
    viewportRef.value.setPointerCapture(event.pointerId)
  }
}

/**
 * Update pan offset during drag
 */
const updatePan = (event: PointerEvent) => {
  if (!isPanning.value) return

  const deltaX = event.clientX - panStartX.value
  const deltaY = event.clientY - panStartY.value

  offsetX.value = panStartOffsetX.value + deltaX
  offsetY.value = panStartOffsetY.value + deltaY
}

/**
 * End panning
 */
const endPan = (event: PointerEvent) => {
  if (!isPanning.value) return

  isPanning.value = false

  if (viewportRef.value) {
    viewportRef.value.releasePointerCapture(event.pointerId)
  }
}

/**
 * Prevent context menu on right-click
 */
const handleContextMenu = (event: Event) => {
  event.preventDefault()
}

/**
 * Get distance between two touch points
 */
const getTouchDistance = (
  touch1: { x: number; y: number },
  touch2: { x: number; y: number }
): number => {
  const dx = touch2.x - touch1.x
  const dy = touch2.y - touch1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Get center point between two touch points
 */
const getTouchCenter = (
  touch1: { x: number; y: number },
  touch2: { x: number; y: number }
): { x: number; y: number } => {
  return {
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2,
  }
}

// ============================================================================
// CANVAS SIZE & RENDERING
// ============================================================================

const getCanvasSize = () => {
  if (!containerRef.value) {
    return { width: 0, height: 0 }
  }

  const container = containerRef.value
  const width = container.clientWidth - props.padding * 2
  const height = container.clientHeight - props.padding * 2

  return { width, height }
}

/**
 * Render the background layer on the background canvas
 * This is separate from the drawing canvas to avoid interference with flood fill
 */
const renderBackgroundLayer = () => {
  if (!bgCtx.value || !bgCanvasRef.value) return

  // Use actual canvas dimensions for consistency with drawing canvas
  const physicalWidth = bgCanvasRef.value.width
  const physicalHeight = bgCanvasRef.value.height
  const dpr = currentDpr.value
  const width = physicalWidth / dpr
  const height = physicalHeight / dpr

  // Guard: Don't render with invalid dimensions
  if (width <= 0 || height <= 0) return

  const backgroundConfig = drawingStore.background

  // Save context state to prevent any leakage
  bgCtx.value.save()

  // Reset transform and state to ensure clean render
  bgCtx.value.setTransform(1, 0, 0, 1, 0, 0)
  bgCtx.value.scale(dpr, dpr)
  bgCtx.value.globalAlpha = 1
  bgCtx.value.globalCompositeOperation = 'source-over'

  // Clear the entire background canvas first
  bgCtx.value.clearRect(0, 0, width, height)

  renderBackground(bgCtx.value, backgroundConfig, {
    width,
    height,
    time: animationTime.value,
  })

  // Restore context state
  bgCtx.value.restore()
}

/**
 * Rebuild the drawing layer cache (EXPENSIVE - replays all fills)
 * Called when shapes change, on resize, or when fills are removed (undo)
 *
 * DUAL CANVAS: This only updates the drawing canvas, not the background.
 * Drawing canvas has WHITE background so flood fill always works correctly.
 * White pixels are converted to transparent for display.
 *
 * Rendering order:
 * 1. White background (needed for flood fill to work)
 * 2. Shapes (creates boundaries for fills)
 * 3. Flood fills
 * 4. Shape strokes on top (covers fill bleed)
 * 5. Convert white to transparent
 */
const rebuildBaseState = () => {
  if (!ctx.value || !canvasRef.value) return

  const fills = drawingStore.fills
  // Use actual canvas dimensions for consistency
  const physicalWidth = canvasRef.value.width
  const physicalHeight = canvasRef.value.height
  const dpr = currentDpr.value
  const width = physicalWidth / dpr
  const height = physicalHeight / dpr

  // Reset the fill mask - create fresh or clear existing
  const totalPixels = physicalWidth * physicalHeight
  if (!fillMask.value || fillMask.value.length !== totalPixels) {
    fillMask.value = new Uint8Array(totalPixels)
  } else {
    // Clear existing mask
    fillMask.value.fill(0)
  }

  // 1. Start with WHITE background (required for flood fill to work correctly!)
  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, width, height)

  // 2. Render stored shapes (creates boundaries for fills)
  const storedShapes = props.shapes || []
  if (storedShapes.length > 0) {
    renderShapes(ctx.value, storedShapes, width, height, {
      noClear: true,
      isRelative: true,
    })
  }

  // 3. Replay all stored fills using flood fill
  // Uses high tolerance (128) to fill anti-aliased edge pixels
  // Pass fill mask so we track which pixels are filled
  for (const fill of fills) {
    // Convert relative position to absolute pixels
    const pixelX = toAbsolute(fill.x, width)
    const pixelY = toAbsolute(fill.y, height)

    // Apply flood fill at this position with high tolerance for edges
    // The fill mask gets populated with each fill
    floodFill(ctx.value, pixelX, pixelY, fill.color, {
      tolerance: 128,
      fillMask: fillMask.value,
    })
  }

  // 4. Re-render shape strokes ON TOP of fills
  // This covers any fill bleed into the anti-aliased edge area
  if (storedShapes.length > 0 && fills.length > 0) {
    renderShapes(ctx.value, storedShapes, width, height, {
      noClear: true,
      isRelative: true,
      strokeOnly: true, // Only draw strokes, not fills
    })
  }

  // 5. Cache the base state WITH WHITE BACKGROUND (before transparency conversion)
  // This is important so preview shapes can be drawn on white, then converted to transparent
  // Store at physical pixel resolution for proper DPR handling
  baseStateCache.value = ctx.value.getImageData(0, 0, physicalWidth, physicalHeight)
  cachedFillCount.value = fills.length
  cacheValid.value = true

  // Note: White-to-transparent conversion happens in redraw() AFTER preview shapes are drawn
}

/**
 * Convert white background to transparent using alpha un-premultiplication
 *
 * When shapes are drawn on white background, anti-aliased edges blend with white.
 * A gray pixel (200,200,200) is actually a semi-transparent black over white.
 *
 * IMPORTANT: Pixels marked in the fill mask are NEVER made transparent!
 * This ensures all fill colors (including white, gray, light colors) stay fully opaque.
 *
 * Math: result = alpha * foreground + (1-alpha) * white
 * For white background (255,255,255):
 *   - min(r,g,b) tells us how much white is blended in
 *   - alpha = 255 - min(r,g,b)
 *   - We reconstruct the original foreground color
 *
 * Examples:
 *   - White background pixel (not in mask) → fully transparent
 *   - White fill pixel (in mask) → stays white and opaque
 *   - Gray anti-aliasing (not in mask) → converted to semi-transparent black
 *   - Any color in mask → stays fully opaque
 */
const convertWhiteToTransparent = () => {
  if (!ctx.value || !canvasRef.value) return

  // Use actual canvas dimensions to ensure we process the entire canvas
  const physicalWidth = canvasRef.value.width
  const physicalHeight = canvasRef.value.height

  const imageData = ctx.value.getImageData(0, 0, physicalWidth, physicalHeight)
  const data = imageData.data
  const mask = fillMask.value

  for (let i = 0; i < data.length; i += 4) {
    // Calculate pixel index (i is byte index, divide by 4 for pixel index)
    const pixelIdx = i / 4

    // CRITICAL: Skip pixels that are in the fill mask - keep them fully opaque!
    // This ensures ALL fill colors work correctly, including white, gray, pink, etc.
    if (mask && mask[pixelIdx] === 1) {
      // This pixel was filled - keep it exactly as-is (fully opaque)
      continue
    }

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // For non-masked pixels, apply white-to-transparent conversion
    // The minimum RGB value tells us how much white is blended in
    const whiteAmount = Math.min(r, g, b)

    // Calculate alpha: more white = more transparent
    const alpha = 255 - whiteAmount

    if (alpha === 0) {
      // Pure white pixel → fully transparent (this is background)
      data[i + 3] = 0
    } else if (alpha < 255) {
      // Semi-transparent pixel - reconstruct original foreground color
      // by removing the white contribution
      // Formula: foreground = (result - whiteAmount) * (255 / alpha)
      const alphaFactor = 255 / alpha
      data[i] = Math.min(255, Math.round((r - whiteAmount) * alphaFactor))
      data[i + 1] = Math.min(255, Math.round((g - whiteAmount) * alphaFactor))
      data[i + 2] = Math.min(255, Math.round((b - whiteAmount) * alphaFactor))
      data[i + 3] = alpha
    }
    // else: alpha === 255 (pure black), pixel is fully opaque, keep as-is
  }

  ctx.value.putImageData(imageData, 0, 0)
}

/**
 * Apply a single fill incrementally on top of the existing cache (FAST)
 * Only called when a new fill is added (not on undo/resize)
 *
 * DUAL CANVAS: The cache stores shapes on WHITE background.
 * We apply the fill, save to cache (WHITE), then convert to transparent for display.
 * The fill mask is updated to track which pixels are filled (for transparency preservation).
 */
const applyIncrementalFill = (fill: { x: number; y: number; color: string }) => {
  if (!ctx.value || !canvasRef.value || !baseStateCache.value) return

  // Use actual canvas dimensions for consistency
  const physicalWidth = canvasRef.value.width
  const physicalHeight = canvasRef.value.height
  const dpr = currentDpr.value
  const width = physicalWidth / dpr
  const height = physicalHeight / dpr
  const storedShapes = props.shapes || []

  // Calculate expected mask size
  const totalPixels = physicalWidth * physicalHeight

  // CRITICAL: If mask size doesn't match (canvas resized), we can't do incremental fill
  // because the mask indices would be wrong. Fall back to full rebuild which replays all fills.
  if (!fillMask.value || fillMask.value.length !== totalPixels) {
    invalidateCache()
    redraw()
    return
  }

  // Restore current cache state (WHITE background - no conversion needed!)
  ctx.value.putImageData(baseStateCache.value, 0, 0)

  // Apply just the new fill (works correctly on white background)
  // Pass the fill mask so filled pixels are tracked
  const pixelX = toAbsolute(fill.x, width)
  const pixelY = toAbsolute(fill.y, height)
  floodFill(ctx.value, pixelX, pixelY, fill.color, {
    tolerance: 128,
    fillMask: fillMask.value,
  })

  // Re-render shape strokes on top
  if (storedShapes.length > 0) {
    renderShapes(ctx.value, storedShapes, width, height, {
      noClear: true,
      isRelative: true,
      strokeOnly: true,
    })
  }

  // Update cache with the new state (WHITE background)
  baseStateCache.value = ctx.value.getImageData(0, 0, physicalWidth, physicalHeight)
  cachedFillCount.value = drawingStore.fills.length

  // Convert to transparent for display (respects fill mask)
  convertWhiteToTransparent()
}

/**
 * Invalidate the cache - called when shapes change or canvas resizes
 */
const invalidateCache = () => {
  cacheValid.value = false
  baseStateCache.value = null
  cachedFillCount.value = 0
  // Clear the fill mask - it will be rebuilt when rebuildBaseState is called
  if (fillMask.value) {
    fillMask.value.fill(0)
  }
}

// ============================================================================
// ANIMATION LOOP (for animated backgrounds)
// ============================================================================

/**
 * Render a single animation frame
 *
 * DUAL CANVAS OPTIMIZATION:
 * For animated backgrounds, we ONLY update the background canvas.
 * The drawing canvas (shapes, fills) remains unchanged unless user draws.
 * This is extremely efficient - no flood fill replays needed!
 */
const renderAnimationFrame = () => {
  // Only update the background canvas - drawing canvas stays unchanged!
  renderBackgroundLayer()
}

/**
 * Start the animation loop for animated backgrounds
 */
const startAnimationLoop = () => {
  if (animationFrameId.value !== null) return // Already running

  lastFrameTime.value = performance.now()

  const animate = (currentTime: number) => {
    // Throttle to target FPS for better performance
    const elapsed = currentTime - lastFrameTime.value

    if (elapsed >= ANIMATION_FRAME_INTERVAL) {
      // Update animation time
      animationTime.value += elapsed
      lastFrameTime.value = currentTime

      // Render the animation frame
      renderAnimationFrame()
    }

    // Continue animation loop
    animationFrameId.value = requestAnimationFrame(animate)
  }

  animationFrameId.value = requestAnimationFrame(animate)
}

/**
 * Stop the animation loop
 */
const stopAnimationLoop = () => {
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
}

/**
 * Check if animation should be running and start/stop accordingly
 */
const updateAnimationState = () => {
  const shouldAnimate = isAnimatedBackground(drawingStore.background)

  if (shouldAnimate && animationFrameId.value === null) {
    startAnimationLoop()
  } else if (!shouldAnimate && animationFrameId.value !== null) {
    stopAnimationLoop()
  }
}

/**
 * Fast redraw using cache when available
 *
 * DUAL CANVAS:
 * - Background canvas: render background (handled by renderBackgroundLayer)
 * - Drawing canvas: restore from cache (WHITE background), add preview on top,
 *   then convert white to transparent for display
 *
 * IMPORTANT: The cache stores shapes on WHITE background (not transparent).
 * Preview shapes are drawn on white, THEN white is converted to transparent.
 * This ensures correct anti-aliasing for all shapes including previews.
 */
const redraw = () => {
  if (!ctx.value || !canvasRef.value) return

  // Use actual canvas dimensions for consistency
  const physicalWidth = canvasRef.value.width
  const physicalHeight = canvasRef.value.height
  const dpr = currentDpr.value
  const width = physicalWidth / dpr
  const height = physicalHeight / dpr

  // Always render the background layer (it's fast for static backgrounds)
  renderBackgroundLayer()

  // If drawing cache is invalid, rebuild it first
  if (!cacheValid.value || !baseStateCache.value) {
    rebuildBaseState()
  }

  // Restore drawing layer from cache (WHITE background - not yet transparent)
  if (baseStateCache.value) {
    ctx.value.putImageData(baseStateCache.value, 0, 0)
  }

  // Render preview shape if drawing (on white background - correct anti-aliasing!)
  const previewShape = drawingStore.previewShapeForRender
  if (previewShape) {
    renderShapes(ctx.value, [previewShape], width, height, {
      noClear: true,
      isRelative: false,
    })
  }

  // Render eraser hover highlight (also on white background)
  if (hoveredShapeId.value && drawingStore.currentTool === 'eraser') {
    const hoveredShape = props.shapes?.find(s => s.id === hoveredShapeId.value)
    if (hoveredShape) {
      // Draw highlighted version (red outline, thicker stroke)
      renderShapes(ctx.value, [hoveredShape], width, height, {
        noClear: true,
        isRelative: true,
        strokeOnly: true,
        strokeColor: '#EF4444', // Red highlight
        strokeWidth: 4,
      })
    }
  }

  // NOW convert white to transparent for display
  // This happens AFTER all shapes (including preview) are drawn on white
  // Ensures correct anti-aliasing for all shapes
  convertWhiteToTransparent()
}

const resizeCanvas = () => {
  if (!canvasRef.value || !ctx.value || !bgCanvasRef.value || !bgCtx.value) return

  const { width, height } = getCanvasSize()
  const dpr = window.devicePixelRatio || 1

  currentDpr.value = dpr
  const physicalWidth = width * dpr
  const physicalHeight = height * dpr

  // Resize BACKGROUND canvas
  bgCanvasRef.value.style.width = `${width}px`
  bgCanvasRef.value.style.height = `${height}px`
  bgCanvasRef.value.width = physicalWidth
  bgCanvasRef.value.height = physicalHeight

  // Re-apply context settings for background canvas
  bgCtx.value.scale(dpr, dpr)
  bgCtx.value.imageSmoothingEnabled = true
  bgCtx.value.imageSmoothingQuality = 'high'

  // Resize DRAWING canvas
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`
  canvasRef.value.width = physicalWidth
  canvasRef.value.height = physicalHeight

  // Re-apply context settings for drawing canvas
  ctx.value.scale(dpr, dpr)
  ctx.value.imageSmoothingEnabled = true
  ctx.value.imageSmoothingQuality = 'high'

  // Update store with canvas dimensions (for coordinate conversion)
  drawingStore.setCanvasDimensions(width, height)

  // Invalidate cache since canvas size changed
  invalidateCache()

  // Re-center canvas within viewport (maintains relative position)
  centerCanvas()

  // Redraw everything - shapes AND fills will scale correctly!
  redraw()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!canvasRef.value || !bgCanvasRef.value) return

  // Initialize BACKGROUND canvas context (opaque, no alpha needed)
  bgCtx.value = bgCanvasRef.value.getContext('2d', {
    willReadFrequently: false, // Background rarely needs pixel reading
    alpha: false, // Opaque for better performance
  })

  // Initialize DRAWING canvas context (needs alpha for transparency)
  ctx.value = canvasRef.value.getContext('2d', {
    willReadFrequently: true, // Flood fill needs frequent pixel reading
    alpha: true, // Needed for white-to-transparent conversion
  })

  // Enable high-quality image smoothing for both canvases
  if (bgCtx.value) {
    bgCtx.value.imageSmoothingEnabled = true
    bgCtx.value.imageSmoothingQuality = 'high'
  }
  if (ctx.value) {
    ctx.value.imageSmoothingEnabled = true
    ctx.value.imageSmoothingQuality = 'high'
  }

  resizeCanvas()

  // Watch for container resize
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(containerRef.value)
  }

  // Also watch window resize as fallback
  window.addEventListener('resize', resizeCanvas)

  // Attach pointer event listeners to VIEWPORT (for zoom-aware coordinates)
  if (viewportRef.value) {
    viewportRef.value.addEventListener('pointerdown', handlePointerDown, {
      passive: false,
    })
    viewportRef.value.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    })
    viewportRef.value.addEventListener('pointerup', handlePointerUp, {
      passive: false,
    })
    viewportRef.value.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    })
    viewportRef.value.addEventListener('pointercancel', handlePointerCancel, {
      passive: true,
    })

    // Touch event listeners for pinch-to-zoom
    viewportRef.value.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    viewportRef.value.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    viewportRef.value.addEventListener('touchend', handleTouchEnd, {
      passive: true,
    })

    // Prevent context menu for right-click panning
    viewportRef.value.addEventListener('contextmenu', handleContextMenu)
  }

  // Attach keyboard listener for Escape key
  window.addEventListener('keydown', handleKeyDown)

  // Check if animated background needs animation loop
  updateAnimationState()
})

onBeforeUnmount(() => {
  // Stop animation loop if running
  stopAnimationLoop()

  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', resizeCanvas)

  // Remove pointer event listeners from viewport
  if (viewportRef.value) {
    viewportRef.value.removeEventListener('pointerdown', handlePointerDown)
    viewportRef.value.removeEventListener('pointermove', handlePointerMove)
    viewportRef.value.removeEventListener('pointerup', handlePointerUp)
    viewportRef.value.removeEventListener('pointerleave', handlePointerLeave)
    viewportRef.value.removeEventListener('pointercancel', handlePointerCancel)

    // Remove touch event listeners
    viewportRef.value.removeEventListener('touchstart', handleTouchStart)
    viewportRef.value.removeEventListener('touchmove', handleTouchMove)
    viewportRef.value.removeEventListener('touchend', handleTouchEnd)

    // Remove context menu listener
    viewportRef.value.removeEventListener('contextmenu', handleContextMenu)
  }

  // Remove keyboard listener
  window.removeEventListener('keydown', handleKeyDown)
})

// Watch padding changes
watch(
  () => props.padding,
  () => {
    invalidateCache()
    resizeCanvas()
  }
)

// Watch shapes changes - invalidate cache and redraw drawing canvas
watch(
  () => props.shapes,
  () => {
    invalidateCache()
    // DUAL CANVAS: Always redraw drawing canvas (shapes live there)
    // For animated backgrounds, the animation loop handles the background canvas
    // but we still need to update the drawing canvas
    redraw()
  },
  { deep: true }
)

// Watch fills changes - use incremental fill when possible
watch(
  () => drawingStore.fills,
  newFills => {
    const currentLength = newFills?.length ?? 0
    const cachedLength = cachedFillCount.value

    if (currentLength > cachedLength && cacheValid.value && baseStateCache.value) {
      // New fill added - apply incrementally (FAST: just 1 flood fill)
      const newFill = newFills[currentLength - 1]
      applyIncrementalFill(newFill)
    } else if (currentLength !== cachedLength || !cacheValid.value) {
      // Fills removed (undo) or cache invalid - full rebuild needed
      invalidateCache()
      redraw()
    }
    // If currentLength === cachedLength and cache is valid, do nothing (already up to date)
  },
  { deep: true }
)

// Watch preview shape changes - just redraw (cache still valid)
// DUAL CANVAS: Preview is on the drawing canvas, always needs redraw
watch(
  () => drawingStore.previewShapeForRender,
  () => {
    redraw()
  }
)

// Watch isDragging - just redraw (cache still valid)
// DUAL CANVAS: Dragging affects drawing canvas
watch(
  () => drawingStore.isDragging,
  () => {
    redraw()
  }
)

// Watch tool changes - clear eraser hover state when switching tools
watch(
  () => drawingStore.currentTool,
  () => {
    if (hoveredShapeId.value) {
      hoveredShapeId.value = null
      redraw()
    }
  }
)

// Watch background changes - update animation state and redraw background
// DUAL CANVAS: Background changes ONLY affect the background canvas
// Drawing canvas is completely independent - no cache invalidation needed!
watch(
  () => drawingStore.background,
  () => {
    // Update animation state (start/stop loop as needed)
    updateAnimationState()

    // Render the new background (for static backgrounds)
    // For animated, the animation loop will handle it
    if (!isAnimatedBackground(drawingStore.background)) {
      renderBackgroundLayer()
    }
  },
  { deep: true }
)

/**
 * Converts pointer event coordinates to logical canvas coordinates
 * Accounts for zoom and pan offset
 */
const getLogicalCoordinates = (event: PointerEvent): { x: number; y: number } => {
  if (!viewportRef.value) return { x: 0, y: 0 }

  // Get position relative to viewport
  const rect = viewportRef.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top

  // Convert screen coords to canvas coords (accounting for zoom/pan)
  return screenToCanvas(screenX, screenY)
}

// ============================================================================
// PINCH-TO-ZOOM TOUCH HANDLERS
// ============================================================================

/**
 * Handle touch start - track touches for pinch-to-zoom
 */
const handleTouchStart = (event: TouchEvent) => {
  // Store all active touches
  for (let i = 0; i < event.touches.length; i++) {
    const touch = event.touches[i]
    if (!viewportRef.value) continue
    const rect = viewportRef.value.getBoundingClientRect()
    activeTouches.value.set(touch.identifier, {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    })
  }

  // Start pinch-to-zoom when 2 touches are detected
  if (event.touches.length === 2) {
    event.preventDefault()

    const touch1 = activeTouches.value.get(event.touches[0].identifier)
    const touch2 = activeTouches.value.get(event.touches[1].identifier)

    if (touch1 && touch2) {
      pinchStartDistance.value = getTouchDistance(touch1, touch2)
      pinchStartZoom.value = zoom.value
      pinchStartCenter.value = getTouchCenter(touch1, touch2)
    }
  }
}

/**
 * Handle touch move - perform pinch-to-zoom
 */
const handleTouchMove = (event: TouchEvent) => {
  // Update all touch positions
  for (let i = 0; i < event.touches.length; i++) {
    const touch = event.touches[i]
    if (!viewportRef.value) continue
    const rect = viewportRef.value.getBoundingClientRect()
    activeTouches.value.set(touch.identifier, {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    })
  }

  // Handle pinch-to-zoom with 2 touches
  if (event.touches.length === 2 && pinchStartDistance.value > 0) {
    event.preventDefault()

    const touch1 = activeTouches.value.get(event.touches[0].identifier)
    const touch2 = activeTouches.value.get(event.touches[1].identifier)

    if (touch1 && touch2) {
      const currentDistance = getTouchDistance(touch1, touch2)
      const currentCenter = getTouchCenter(touch1, touch2)

      // Calculate new zoom based on pinch distance ratio
      const scale = currentDistance / pinchStartDistance.value
      const newZoom = clamp(pinchStartZoom.value * scale, MIN_ZOOM, MAX_ZOOM)

      // Apply zoom toward pinch center
      zoomTowardPoint(newZoom, currentCenter)

      // Update pinch state for smooth continuous zooming
      pinchStartDistance.value = currentDistance
      pinchStartZoom.value = newZoom
      pinchStartCenter.value = currentCenter
    }
  }
}

/**
 * Handle touch end - clean up touch tracking
 */
const handleTouchEnd = (event: TouchEvent) => {
  // Remove ended touches
  for (let i = 0; i < event.changedTouches.length; i++) {
    activeTouches.value.delete(event.changedTouches[i].identifier)
  }

  // Reset pinch state when less than 2 touches remain
  if (activeTouches.value.size < 2) {
    pinchStartDistance.value = 0
    pinchStartZoom.value = zoom.value
  }
}

// ============================================================================
// DRAWING POINTER HANDLERS
// ============================================================================

/**
 * Handle pointer down - start drawing, fill, or pan
 */
const handlePointerDown = (event: PointerEvent) => {
  // Handle right-click for panning (mouse only)
  if (event.button === 2 && event.pointerType === 'mouse') {
    event.preventDefault()
    startPan(event)
    return
  }

  // Only handle primary button (left mouse, first touch)
  if (event.button !== 0 && event.pointerType === 'mouse') {
    return
  }

  // Only handle primary pointer (first touch)
  if (event.isPrimary === false) {
    return
  }

  // Don't start if already drawing or panning
  if (drawingStore.isDragging || isPanning.value) {
    return
  }

  const { x, y } = getLogicalCoordinates(event)

  // Handle eraser tool - click to delete shape
  if (drawingStore.currentTool === 'eraser') {
    event.preventDefault()

    const canvasDims = { width: getCanvasSize().width, height: getCanvasSize().height }
    const hitShape = hitTestShapes(props.shapes || [], x, y, canvasDims)

    if (hitShape) {
      drawingStore.removeShape(hitShape.id)
      hoveredShapeId.value = null
      // Cache invalidation and redraw will happen via watcher on shapes
    }
    return
  }

  // Handle stamp tool - click to place stamp
  if (drawingStore.currentTool === 'stamp') {
    event.preventDefault()

    // Only place if a stamp is selected
    if (drawingStore.currentStampKey) {
      drawingStore.addStamp(x, y)
      // Cache invalidation and redraw will happen via watcher on shapes
    }
    return
  }

  // Handle fill tool - check for stamps first, then fall back to pixel flood fill
  // IMPORTANT: Fill tool should ONLY work in coloring mode to prevent accidental fills
  if (drawingStore.currentTool === 'fill' && drawingStore.isColoringMode) {
    event.preventDefault()

    if (!ctx.value) return

    const canvasDims = { width: getCanvasSize().width, height: getCanvasSize().height }

    // First, check if user clicked on a stamp - use direct shape coloring instead of flood fill
    const hitShape = hitTestShapes(props.shapes || [], x, y, canvasDims)

    if (hitShape && hitShape.type === 'stamp') {
      // Direct stamp coloring - much more reliable than flood fill!
      drawingStore.setShapeFillColor(hitShape.id, drawingStore.currentColor)
      invalidateCache()
      redraw()
      return
    }

    // DUAL CANVAS: The canvas currently shows transparent state for display.
    // Restore the WHITE background state from cache before running flood fill TEST.
    if (baseStateCache.value) {
      ctx.value.putImageData(baseStateCache.value, 0, 0)
    }

    // Test if the fill would work (check the target pixel color)
    // We do a quick fill test without the mask, then let applyIncrementalFill do the real work
    const pixelsFilled = floodFill(ctx.value, x, y, drawingStore.currentColor, {
      tolerance: 128,
      // No fillMask here - this is just a test to see if fill is valid
    })

    if (pixelsFilled > 0) {
      // Fill is valid! Restore cache state and let the watcher do the proper fill with mask
      if (baseStateCache.value) {
        ctx.value.putImageData(baseStateCache.value, 0, 0)
      }
      convertWhiteToTransparent()

      // Store the fill point - the watcher will call applyIncrementalFill
      // which properly updates the mask and cache
      drawingStore.addFill(x, y)
    } else {
      // Fill failed - restore the transparent state for display
      convertWhiteToTransparent()
    }
    return
  }

  // Handle drawing tools (rectangle, circle, triangle)
  const shapeId = drawingStore.startDrawing(x, y)

  if (shapeId) {
    // Capture pointer for consistent tracking across move/up events
    if (viewportRef.value) {
      viewportRef.value.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    redraw()
  }
}

/**
 * Handle pointer move - update drawing, pan, or eraser hover
 */
const handlePointerMove = (event: PointerEvent) => {
  // Handle panning
  if (isPanning.value) {
    event.preventDefault()
    updatePan(event)
    return
  }

  // Handle eraser hover tracking
  if (drawingStore.currentTool === 'eraser' && !drawingStore.isDragging) {
    const { x, y } = getLogicalCoordinates(event)
    const canvasDims = { width: getCanvasSize().width, height: getCanvasSize().height }
    const hitShape = hitTestShapes(props.shapes || [], x, y, canvasDims)

    const newHoveredId = hitShape?.id || null
    if (newHoveredId !== hoveredShapeId.value) {
      hoveredShapeId.value = newHoveredId
      redraw()
    }
    return
  }

  if (!drawingStore.isDragging) {
    return
  }

  event.preventDefault()

  const { x, y } = getLogicalCoordinates(event)
  drawingStore.updateDrawing(x, y)
  redraw()
}

/**
 * Handle pointer up - commit drawing or end pan
 */
const handlePointerUp = (event: PointerEvent) => {
  // Handle end of panning
  if (isPanning.value) {
    endPan(event)
    return
  }

  if (!drawingStore.isDragging) {
    return
  }

  event.preventDefault()

  if (viewportRef.value) {
    viewportRef.value.releasePointerCapture(event.pointerId)
  }

  drawingStore.commitDrawing()
  redraw()
}

/**
 * Handle pointer leave - cancel drawing or clear eraser hover
 */
const handlePointerLeave = (event: PointerEvent) => {
  // Clear eraser hover state when leaving canvas
  if (hoveredShapeId.value) {
    hoveredShapeId.value = null
    redraw()
  }

  if (!drawingStore.isDragging) {
    return
  }

  if (viewportRef.value) {
    viewportRef.value.releasePointerCapture(event.pointerId)
  }

  drawingStore.cancelDrawing()
  redraw()
}

/**
 * Handle pointer cancel - cancel drawing
 */
const handlePointerCancel = (event: PointerEvent) => {
  if (!drawingStore.isDragging) {
    return
  }

  if (viewportRef.value) {
    viewportRef.value.releasePointerCapture(event.pointerId)
  }

  drawingStore.cancelDrawing()
  redraw()
}

/**
 * Handle Escape key - cancel drawing
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && drawingStore.isDragging) {
    drawingStore.cancelDrawing()
    redraw()
  }
}

/**
 * Get composite image data (both canvas layers combined) for export
 * This composites the background canvas with the drawing canvas
 */
const getCompositeImageData = (): ImageData | null => {
  if (!bgCanvasRef.value || !canvasRef.value) return null

  const { width, height } = getCanvasSize()
  const dpr = currentDpr.value

  // Create a temporary canvas for compositing
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width * dpr
  tempCanvas.height = height * dpr
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) return null

  // Scale for DPR
  tempCtx.scale(dpr, dpr)

  // Draw background canvas first
  tempCtx.drawImage(bgCanvasRef.value, 0, 0, width, height)

  // Draw drawing canvas on top (transparent white areas let background show)
  tempCtx.drawImage(canvasRef.value, 0, 0, width, height)

  // Return the composite image data
  return tempCtx.getImageData(0, 0, width * dpr, height * dpr)
}

// Expose ref API
defineExpose<CanvasRef>({
  get canvas() {
    return canvasRef.value!
  },
  get ctx() {
    return ctx.value
  },
  get bgCanvas() {
    return bgCanvasRef.value!
  },
  get bgCtx() {
    return bgCtx.value
  },
  redraw,
  resetZoom,
  getCompositeImageData,
})
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: inherit; /* Inherit from parent */
}

/* ==========================================================================
   Zoom Controls
   ========================================================================== */

.zoom-controls {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 4px;
  border: 1px solid var(--color-border);
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
  touch-action: manipulation;
}

.zoom-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-text-on-primary);
}

.zoom-btn:active:not(:disabled) {
  background: var(--color-primary);
  transform: scale(0.95);
}

.zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 36px;
  padding: 0 var(--spacing-xs);
  border: none;
  background: var(--color-background);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
  touch-action: manipulation;
}

.zoom-indicator:hover {
  background: var(--color-accent-light);
  color: var(--color-text);
}

.zoom-indicator:active {
  background: var(--color-accent);
  transform: scale(0.95);
}

/* ==========================================================================
   Canvas Viewport (for zoom/pan)
   ========================================================================== */

.canvas-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  /* NOTE: Do NOT use flexbox centering here!
     The canvas is positioned via CSS transform (offsetX, offsetY) in the transform wrapper.
     Flexbox centering would conflict with the coordinate conversion math. */
}

.canvas-viewport.is-panning {
  cursor: grabbing;
}

.canvas-viewport.is-panning * {
  cursor: grabbing !important;
}

.canvas-transform-wrapper {
  /* Transform is applied via inline style */
  /* Position is handled by transform offset calculation */
  will-change: transform;
  /* DUAL CANVAS: Position relative for absolute positioning of canvas layers */
  position: relative;
}

/* ==========================================================================
   DUAL CANVAS ARCHITECTURE
   Background canvas (bottom): Renders backgrounds only
   Drawing canvas (top): White BG → transparent, shapes & fills render here
   ========================================================================== */

.canvas-layer {
  display: block;
  touch-action: none;
  user-select: none;
  border-radius: var(--radius-sm);
}

/* Background canvas - positioned at bottom */
.canvas-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  /* Background canvas has subtle border for visual bounds */
  box-shadow: inset 0 0 0 1px var(--color-border);
}

/* Drawing canvas - positioned on top, receives all interactions */
.canvas-drawing {
  position: relative;
  z-index: 2;
  cursor: crosshair;
  /* Drawing canvas is transparent (white converted to transparent) */
  /* Background shows through from canvas-bg below */
}

.canvas-drawing.fill-tool {
  cursor: cell;
}

.canvas-drawing.eraser-tool {
  cursor: crosshair;
}

.canvas-drawing.eraser-hover {
  cursor: pointer;
}

.canvas-drawing.stamp-tool {
  cursor: copy;
}

/* Add subtle paper texture feel to the top canvas */
.canvas-drawing::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.03);
}

/* ==========================================================================
   Responsive - Mobile
   ========================================================================== */

@media (max-width: 640px) {
  .zoom-controls {
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    padding: 2px;
  }

  .zoom-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    font-size: 1.1rem;
  }

  .zoom-indicator {
    min-width: 44px;
    height: 32px;
    font-size: var(--font-size-xs);
  }
}

/* Touch-friendly larger targets for tablets */
@media (pointer: coarse) {
  .zoom-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
  }

  .zoom-indicator {
    height: 44px;
    min-width: 56px;
  }
}
</style>
