import type {
  Shape,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
  StampShape,
} from '@/types'
import { shapeToAbsolute, type CanvasDimensions } from './shapeGeometry'
import { getStampById, getStampSize } from '@/data/stamps'
import type { SvgBackgroundShape } from './svgTemplateConverter'

export interface RenderOptions {
  strokeColor?: string
  strokeWidth?: number
  noClear?: boolean
  // If true, shapes are in relative (0-1) coordinates and need conversion
  // If false, shapes are already in absolute pixel coordinates (e.g., preview shapes)
  isRelative?: boolean
  // If true, only draw strokes (no fills) - used to redraw strokes on top of flood fills
  strokeOnly?: boolean
}

const DEFAULT_OPTIONS: Required<Omit<RenderOptions, 'noClear' | 'isRelative' | 'strokeOnly'>> = {
  strokeColor: '#000000',
  strokeWidth: 2.5, // Slightly thicker for smoother anti-aliased appearance
}

/**
 * Pure function that clears the canvas and renders all shapes
 *
 * Shapes can be in two coordinate systems:
 * - Relative (0-1): Stored shapes use percentages, pass isRelative: true
 * - Absolute (pixels): Preview shapes during drag, pass isRelative: false
 *
 * @param ctx - Canvas 2D rendering context
 * @param shapes - Array of shapes to render
 * @param canvasWidth - Width of the canvas (for clearing and coordinate conversion)
 * @param canvasHeight - Height of the canvas (for clearing and coordinate conversion)
 * @param options - Rendering options
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  canvasWidth: number,
  canvasHeight: number,
  options: RenderOptions = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const canvas: CanvasDimensions = { width: canvasWidth, height: canvasHeight }

  // Clear the entire canvas (unless noClear is true)
  if (!options.noClear) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  }

  // Set default stroke style with smooth line rendering
  ctx.strokeStyle = opts.strokeColor
  ctx.lineWidth = opts.strokeWidth
  ctx.lineCap = 'round' // Smooth line ends
  ctx.lineJoin = 'round' // Smooth corners

  // Render each shape
  for (const shape of shapes) {
    // Convert relative coords to absolute if needed
    const absoluteShape = options.isRelative !== false ? shapeToAbsolute(shape, canvas) : shape
    renderShape(ctx, absoluteShape, opts, options.strokeOnly, canvas)
  }
}

/**
 * Renders a single shape with proper transforms
 * @param strokeOnly - If true, only draw strokes (skip fills)
 * @param canvasDims - Logical canvas dimensions (for svg-background)
 */
function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  options: Required<Omit<RenderOptions, 'noClear' | 'isRelative' | 'strokeOnly'>>,
  strokeOnly: boolean = false,
  canvasDims?: { width: number; height: number }
): void {
  ctx.save()

  try {
    // Set stroke style from shape or options
    ctx.strokeStyle = shape.strokeColor || options.strokeColor
    ctx.lineWidth = shape.strokeWidth || options.strokeWidth

    // Apply rotation if needed (around the shape's center)
    // Different shapes have different center calculations:
    // - Star: x,y IS the center
    // - Circle: x,y IS the center (but no rotation needed)
    // - Rectangle, Triangle, Heart: x,y is top-left, center is offset
    // - Line: no rotation
    if (shape.rotation !== 0) {
      let centerX: number
      let centerY: number

      if (shape.type === 'star') {
        // Star: x,y is already the center
        centerX = shape.x
        centerY = shape.y
      } else if (shape.type === 'circle') {
        // Circle: x,y is center, but rotation doesn't matter for circles
        centerX = shape.x
        centerY = shape.y
      } else {
        // Rectangle, Triangle, Heart: x,y is top-left corner
        centerX = shape.x + getShapeWidth(shape) / 2
        centerY = shape.y + getShapeHeight(shape) / 2
      }

      ctx.translate(centerX, centerY)
      ctx.rotate(shape.rotation)
      ctx.translate(-centerX, -centerY)
    }

    // Draw based on shape type
    switch (shape.type) {
      case 'rectangle':
        drawRectangle(ctx, shape, strokeOnly)
        break
      case 'circle':
        drawCircle(ctx, shape, strokeOnly)
        break
      case 'triangle':
        drawTriangle(ctx, shape, strokeOnly)
        break
      case 'star':
        drawStar(ctx, shape, strokeOnly)
        break
      case 'heart':
        drawHeart(ctx, shape, strokeOnly)
        break
      case 'line':
        drawLine(ctx, shape)
        break
      case 'stamp':
        drawStamp(ctx, shape, strokeOnly)
        break
      case 'svg-background':
        drawSvgBackground(ctx, shape as SvgBackgroundShape, canvasDims)
        break
      default: {
        // This should never be reached if all shape types are handled above
        // Adding exhaustiveness check for future shape types
        const _exhaustiveCheck: never = shape
        console.warn(`Shape type ${(_exhaustiveCheck as Shape).type} not yet implemented`)
      }
    }
  } finally {
    ctx.restore()
  }
}

/**
 * Draws a rectangle shape
 * @param strokeOnly - If true, only draw the stroke
 */
function drawRectangle(
  ctx: CanvasRenderingContext2D,
  shape: RectangleShape,
  strokeOnly: boolean = false
): void {
  ctx.beginPath()
  ctx.rect(shape.x, shape.y, shape.width, shape.height)

  // Fill if shape has fillColor (unless strokeOnly)
  if (!strokeOnly && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draws a circle shape
 * @param strokeOnly - If true, only draw the stroke
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  shape: CircleShape,
  strokeOnly: boolean = false
): void {
  ctx.beginPath()
  ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)

  // Fill if shape has fillColor (unless strokeOnly)
  if (!strokeOnly && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draws a triangle shape (isosceles with base at bottom)
 * @param strokeOnly - If true, only draw the stroke
 */
function drawTriangle(
  ctx: CanvasRenderingContext2D,
  shape: TriangleShape,
  strokeOnly: boolean = false
): void {
  const topX = shape.x + shape.width / 2
  const topY = shape.y
  const bottomLeftX = shape.x
  const bottomLeftY = shape.y + shape.height
  const bottomRightX = shape.x + shape.width
  const bottomRightY = shape.y + shape.height

  ctx.beginPath()
  ctx.moveTo(topX, topY)
  ctx.lineTo(bottomLeftX, bottomLeftY)
  ctx.lineTo(bottomRightX, bottomRightY)
  ctx.closePath()

  // Fill if shape has fillColor (unless strokeOnly)
  if (!strokeOnly && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draws a star shape (5-pointed by default)
 * @param strokeOnly - If true, only draw the stroke
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  shape: StarShape,
  strokeOnly: boolean = false
): void {
  const { x, y, outerRadius, innerRadius, points } = shape
  const step = Math.PI / points // Angle between points

  ctx.beginPath()

  for (let i = 0; i < points * 2; i++) {
    // Alternate between outer and inner radius
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    // Start from top (-PI/2) and go clockwise
    const angle = -Math.PI / 2 + i * step
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  }

  ctx.closePath()

  // Fill if shape has fillColor (unless strokeOnly)
  if (!strokeOnly && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draws a heart shape using bezier curves
 * Based on MDN's heart example, scaled to fit bounding box
 * Uses 6 bezier curves for a proper symmetric heart shape
 * @param strokeOnly - If true, only draw the stroke
 */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  shape: HeartShape,
  strokeOnly: boolean = false
): void {
  const { x, y, width, height } = shape

  // Scale factors to map the standard heart to our bounding box
  // Original MDN heart fits in roughly 110x95 units, starting at (20,25)
  // We'll use normalized coordinates (0-1) then scale to width/height
  const cx = x + width / 2 // Center X

  ctx.beginPath()

  // Start at top center dip
  ctx.moveTo(cx, y + height * 0.15)

  // Top center dip curve (tiny curve at the top middle)
  ctx.bezierCurveTo(cx, y + height * 0.12, cx - width * 0.05, y, cx - width * 0.25, y)

  // Left lobe (top-left curve)
  ctx.bezierCurveTo(x, y, x, y + height * 0.4, x, y + height * 0.4)

  // Left side down to bottom point
  ctx.bezierCurveTo(x, y + height * 0.55, cx - width * 0.35, y + height * 0.77, cx, y + height)

  // Right side from bottom point up
  ctx.bezierCurveTo(
    cx + width * 0.35,
    y + height * 0.77,
    x + width,
    y + height * 0.55,
    x + width,
    y + height * 0.4
  )

  // Right lobe (top-right curve)
  ctx.bezierCurveTo(x + width, y + height * 0.4, x + width, y, cx + width * 0.25, y)

  // Back to top center dip
  ctx.bezierCurveTo(cx + width * 0.05, y, cx, y + height * 0.12, cx, y + height * 0.15)

  ctx.closePath()

  // Fill if shape has fillColor (unless strokeOnly)
  if (!strokeOnly && shape.fillColor) {
    ctx.fillStyle = shape.fillColor
    ctx.fill()
  }
  ctx.stroke()
}

/**
 * Draws a line shape
 * Lines don't have fill, only stroke
 */
function drawLine(ctx: CanvasRenderingContext2D, shape: LineShape): void {
  ctx.beginPath()
  ctx.moveTo(shape.x, shape.y)
  ctx.lineTo(shape.x2, shape.y2)
  ctx.stroke()
}

/**
 * Draws a stamp shape using SVG path data from the stamp registry
 * @param strokeOnly - If true, only draw strokes (skip fills)
 */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  shape: StampShape,
  strokeOnly: boolean = false
): void {
  const stampDef = getStampById(shape.stampKey)
  if (!stampDef) {
    console.warn(`Stamp not found: ${shape.stampKey}`)
    return
  }

  const size = getStampSize(shape.sizePreset)
  const viewBox = stampDef.viewBox
  const scale = size / viewBox.width

  ctx.save()

  // Move to stamp center position
  // shape.x, shape.y is the center of the stamp in absolute coords
  const offsetX = shape.x - size / 2
  const offsetY = shape.y - size / 2

  // Apply transforms
  ctx.translate(offsetX, offsetY)
  ctx.scale(scale, scale)

  // Apply stamp rotation if any
  if (shape.rotation !== 0) {
    const centerX = viewBox.width / 2
    const centerY = viewBox.height / 2
    ctx.translate(centerX, centerY)
    ctx.rotate(shape.rotation)
    ctx.translate(-centerX, -centerY)
  }

  // Helper to check if a color is white or near-white
  const isWhiteFill = (fill: string): boolean => {
    const upper = fill.toUpperCase()
    return upper === '#FFFFFF' || upper === '#FFF' || upper === 'WHITE'
  }

  // Render each path in the stamp
  for (const pathDef of stampDef.paths) {
    const path = new Path2D(pathDef.d)

    // Handle fill
    if (!strokeOnly && pathDef.fill) {
      // If stamp has a fillColor and this path is white, use the fillColor instead
      // This allows coloring the "background" areas of stamps while preserving
      // colored features like eyes, noses, and accents
      if (shape.fillColor && isWhiteFill(pathDef.fill)) {
        ctx.fillStyle = shape.fillColor
      } else {
        ctx.fillStyle = pathDef.fill
      }
      ctx.fill(path)
    }

    // Handle stroke
    if (pathDef.stroke) {
      ctx.strokeStyle = pathDef.stroke
      ctx.lineWidth = (pathDef.strokeWidth || 2) / scale // Compensate for scaling
      ctx.stroke(path)
    } else if (!pathDef.fill) {
      // If no explicit stroke or fill, use default stroke
      ctx.strokeStyle = shape.strokeColor || '#000000'
      ctx.lineWidth = (shape.strokeWidth || 2.5) / scale
      ctx.stroke(path)
    }
  }

  ctx.restore()
}

/**
 * Finds the tight bounding box of non-white content in an image
 * Scans from each edge inward to find where content starts
 * @returns Insets from each edge where content begins
 */
function findContentBounds(
  img: HTMLImageElement,
  width: number,
  height: number
): { top: number; bottom: number; left: number; right: number } {
  // Create offscreen canvas to analyze pixels
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const offCtx = offscreen.getContext('2d')

  if (!offCtx) {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  // Fill with white first, then draw image
  offCtx.fillStyle = 'white'
  offCtx.fillRect(0, 0, width, height)
  offCtx.drawImage(img, 0, 0, width, height)

  const imageData = offCtx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Threshold for "non-white" (account for anti-aliasing)
  // Pixel is considered content if any channel is below this
  const threshold = 250

  const isContentPixel = (x: number, y: number): boolean => {
    const idx = (y * width + x) * 4
    const r = data[idx]
    const g = data[idx + 1]
    const b = data[idx + 2]
    // Check if pixel is darker than threshold (has content)
    return r < threshold || g < threshold || b < threshold
  }

  // Find top edge (scan rows from top)
  let top = 0
  topSearch: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isContentPixel(x, y)) {
        top = y
        break topSearch
      }
    }
  }

  // Find bottom edge (scan rows from bottom)
  let bottom = 0
  bottomSearch: for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (isContentPixel(x, y)) {
        bottom = height - 1 - y
        break bottomSearch
      }
    }
  }

  // Find left edge (scan columns from left)
  let left = 0
  leftSearch: for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (isContentPixel(x, y)) {
        left = x
        break leftSearch
      }
    }
  }

  // Find right edge (scan columns from right)
  let right = 0
  rightSearch: for (let x = width - 1; x >= 0; x--) {
    for (let y = 0; y < height; y++) {
      if (isContentPixel(x, y)) {
        right = width - 1 - x
        break rightSearch
      }
    }
  }

  return { top, bottom, left, right }
}

/**
 * Draws an SVG background shape
 * This renders a cached SVG image at the specified bounds
 * Also draws a tight black border frame that touches the SVG content
 * @param canvasDims - Logical canvas dimensions (CSS pixels, not physical)
 */
function drawSvgBackground(
  ctx: CanvasRenderingContext2D,
  shape: SvgBackgroundShape,
  canvasDims?: { width: number; height: number }
): void {
  if (!shape.image) {
    console.warn('SVG background shape has no image loaded')
    return
  }

  // Use passed logical dimensions, NOT ctx.canvas.width/height (which are physical pixels)
  // The context has DPR scaling applied, so we work in logical coordinates
  const canvasWidth = canvasDims?.width ?? ctx.canvas.width
  const canvasHeight = canvasDims?.height ?? ctx.canvas.height

  // Calculate dimensions with margin (same as old template system)
  const availableWidth = canvasWidth * (1 - shape.margin * 2)
  const availableHeight = canvasHeight * (1 - shape.margin * 2)

  // Calculate scale to fit viewBox while maintaining aspect ratio
  const scaleX = availableWidth / shape.viewBox.width
  const scaleY = availableHeight / shape.viewBox.height
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = shape.viewBox.width * scale
  const scaledHeight = shape.viewBox.height * scale

  // Center in canvas
  const x = (canvasWidth - scaledWidth) / 2
  const y = (canvasHeight - scaledHeight) / 2

  // Draw the SVG image
  ctx.drawImage(shape.image, x, y, scaledWidth, scaledHeight)

  // Find tight bounds of the actual content
  const bounds = findContentBounds(shape.image, Math.round(scaledWidth), Math.round(scaledHeight))

  // Draw a tight black border frame that touches the SVG content
  // Add overlap to push the frame INTO the content area so it connects with the lines
  const overlap = 5
  const frameX = x + bounds.left + overlap
  const frameY = y + bounds.top + overlap
  const frameWidth = scaledWidth - bounds.left - bounds.right - overlap * 2
  const frameHeight = scaledHeight - bounds.top - bounds.bottom - overlap * 2

  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3 // Match typical SVG stroke width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)
  ctx.restore()
}

/**
 * Helper to get shape width for transform calculations
 */
function getShapeWidth(shape: Shape): number {
  switch (shape.type) {
    case 'rectangle':
    case 'triangle':
    case 'heart':
      return shape.width
    case 'circle':
      return shape.radius * 2
    case 'star':
      return shape.outerRadius * 2
    case 'line':
      return Math.abs(shape.x2 - shape.x)
    case 'stamp':
      return getStampSize(shape.sizePreset)
    case 'svg-background':
      // Return viewBox width (not scaled)
      return (shape as SvgBackgroundShape).viewBox.width
    default:
      return 0
  }
}

/**
 * Helper to get shape height for transform calculations
 */
function getShapeHeight(shape: Shape): number {
  switch (shape.type) {
    case 'rectangle':
    case 'triangle':
    case 'heart':
      return shape.height
    case 'circle':
      return shape.radius * 2
    case 'star':
      return shape.outerRadius * 2
    case 'line':
      return Math.abs(shape.y2 - shape.y)
    case 'stamp':
      return getStampSize(shape.sizePreset)
    case 'svg-background':
      // Return viewBox height (not scaled)
      return (shape as SvgBackgroundShape).viewBox.height
    default:
      return 0
  }
}
