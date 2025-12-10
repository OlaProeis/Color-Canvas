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
import { getStampSize } from '@/data/stamps'

/**
 * Test if a point is inside a shape
 * Returns the shape if hit, null otherwise
 *
 * @param shapes - Array of shapes (in relative 0-1 coordinates)
 * @param x - X coordinate in pixels
 * @param y - Y coordinate in pixels
 * @param canvas - Canvas dimensions for coordinate conversion
 */
export function hitTestShapes(
  shapes: Shape[],
  x: number,
  y: number,
  canvas: CanvasDimensions
): Shape | null {
  // Test shapes in reverse order (top-most first)
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i]
    // Convert shape to absolute coords for hit testing
    const absoluteShape = shapeToAbsolute(shape, canvas)
    if (isPointInShape(absoluteShape, x, y)) {
      return shape // Return the original shape (with relative coords)
    }
  }
  return null
}

/**
 * Test if a point is inside a single shape
 */
export function isPointInShape(shape: Shape, x: number, y: number): boolean {
  switch (shape.type) {
    case 'rectangle':
      return isPointInRectangle(shape, x, y)
    case 'circle':
      return isPointInCircle(shape, x, y)
    case 'triangle':
      return isPointInTriangle(shape, x, y)
    case 'star':
      return isPointInStar(shape, x, y)
    case 'heart':
      return isPointInHeart(shape, x, y)
    case 'line':
      return isPointNearLine(shape, x, y)
    case 'stamp':
      return isPointInStamp(shape, x, y)
    default:
      return false
  }
}

/**
 * Test if point is inside rectangle
 */
function isPointInRectangle(shape: RectangleShape, x: number, y: number): boolean {
  return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height
}

/**
 * Test if point is inside circle
 */
function isPointInCircle(shape: CircleShape, x: number, y: number): boolean {
  const dx = x - shape.x
  const dy = y - shape.y
  return dx * dx + dy * dy <= shape.radius * shape.radius
}

/**
 * Test if point is inside triangle using barycentric coordinates
 */
function isPointInTriangle(shape: TriangleShape, x: number, y: number): boolean {
  // Triangle vertices (same as in renderShapes.ts)
  const x1 = shape.x + shape.width / 2 // top
  const y1 = shape.y
  const x2 = shape.x // bottom left
  const y2 = shape.y + shape.height
  const x3 = shape.x + shape.width // bottom right
  const y3 = shape.y + shape.height

  // Compute barycentric coordinates
  const denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
  if (Math.abs(denom) < 0.0001) return false // Degenerate triangle

  const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denom
  const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denom
  const c = 1 - a - b

  // Point is inside if all barycentric coordinates are positive
  return a >= 0 && b >= 0 && c >= 0
}

/**
 * Test if point is inside star shape
 * Uses simplified bounding circle check for outer radius
 * and ray casting for more accurate polygon hit test
 */
function isPointInStar(shape: StarShape, x: number, y: number): boolean {
  const { x: cx, y: cy, outerRadius, innerRadius, points } = shape

  // Quick bounding circle check first
  const dx = x - cx
  const dy = y - cy
  const distSq = dx * dx + dy * dy
  if (distSq > outerRadius * outerRadius) return false

  // Build star polygon points for ray casting
  const step = Math.PI / points
  const vertices: { x: number; y: number }[] = []

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = -Math.PI / 2 + i * step
    vertices.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    })
  }

  // Ray casting algorithm
  return isPointInPolygon(x, y, vertices)
}

/**
 * Test if point is inside heart shape
 * Uses bounding box check + approximate polygon hit test
 */
function isPointInHeart(shape: HeartShape, x: number, y: number): boolean {
  const { x: hx, y: hy, width, height } = shape

  // Quick bounding box check
  if (x < hx || x > hx + width || y < hy || y > hy + height) {
    return false
  }

  // Build approximate heart polygon for ray casting
  // Sample points along the bezier curves used in renderShapes.ts
  const cx = hx + width / 2
  const vertices: { x: number; y: number }[] = []

  // Approximate the heart shape with polygon vertices
  // Left side (top to bottom)
  vertices.push({ x: cx, y: hy + height * 0.15 }) // top center dip
  vertices.push({ x: cx - width * 0.25, y: hy }) // left lobe top
  vertices.push({ x: hx + width * 0.1, y: hy + height * 0.1 }) // left lobe outer
  vertices.push({ x: hx, y: hy + height * 0.3 }) // left side upper
  vertices.push({ x: hx, y: hy + height * 0.4 }) // left side middle
  vertices.push({ x: hx + width * 0.1, y: hy + height * 0.6 }) // left side lower
  vertices.push({ x: cx, y: hy + height }) // bottom point

  // Right side (bottom to top)
  vertices.push({ x: hx + width - width * 0.1, y: hy + height * 0.6 }) // right side lower
  vertices.push({ x: hx + width, y: hy + height * 0.4 }) // right side middle
  vertices.push({ x: hx + width, y: hy + height * 0.3 }) // right side upper
  vertices.push({ x: hx + width - width * 0.1, y: hy + height * 0.1 }) // right lobe outer
  vertices.push({ x: cx + width * 0.25, y: hy }) // right lobe top

  return isPointInPolygon(x, y, vertices)
}

/**
 * Test if point is near a line segment (within tolerance)
 */
function isPointNearLine(shape: LineShape, x: number, y: number): boolean {
  const { x: x1, y: y1, x2, y2 } = shape

  // Use line thickness + tolerance for hit detection
  const tolerance = Math.max(10, (shape.strokeWidth || 2.5) * 2)

  // Calculate distance from point to line segment
  const lineLengthSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)

  if (lineLengthSq === 0) {
    // Line is a point
    const dist = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1))
    return dist <= tolerance
  }

  // Project point onto line segment
  const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / lineLengthSq))
  const projX = x1 + t * (x2 - x1)
  const projY = y1 + t * (y2 - y1)

  // Calculate distance from point to projection
  const dist = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY))
  return dist <= tolerance
}

/**
 * Test if point is inside stamp shape
 * Uses simple bounding box check since stamps are rectangular
 */
function isPointInStamp(shape: StampShape, x: number, y: number): boolean {
  const size = getStampSize(shape.sizePreset)
  const halfSize = size / 2

  // Stamp center is at shape.x, shape.y
  // Check if point is within the stamp's bounding box
  return (
    x >= shape.x - halfSize &&
    x <= shape.x + halfSize &&
    y >= shape.y - halfSize &&
    y <= shape.y + halfSize
  )
}

/**
 * Ray casting algorithm to test if point is inside polygon
 */
function isPointInPolygon(x: number, y: number, vertices: { x: number; y: number }[]): boolean {
  let inside = false
  const n = vertices.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x
    const yi = vertices[i].y
    const xj = vertices[j].x
    const yj = vertices[j].y

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}
