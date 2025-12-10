import type {
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
  Shape,
} from '@/types'

/**
 * Represents a point in 2D space (logical canvas coordinates)
 */
export interface DragPoint {
  x: number
  y: number
}

/**
 * Canvas dimensions for coordinate conversion
 */
export interface CanvasDimensions {
  width: number
  height: number
}

// ============================================================================
// RELATIVE COORDINATE SYSTEM
// ============================================================================
// All shapes are stored with coordinates in the range [0, 1], representing
// percentages of the canvas dimensions. This ensures:
// - Shapes scale correctly when canvas resizes
// - Fills (stored as shape.fillColor) persist through zoom/resize
// - Consistent rendering across different screen sizes/DPRs
//
// Conversion happens at two points:
// 1. INPUT: When user draws → convert pixel coords to relative (0-1)
// 2. OUTPUT: When rendering → convert relative (0-1) back to pixels
// ============================================================================

/**
 * Convert a pixel coordinate to relative (0-1) coordinate
 * @param pixel - Pixel value
 * @param dimension - Canvas dimension (width or height)
 * @returns Relative value in range [0, 1]
 */
export function toRelative(pixel: number, dimension: number): number {
  if (!Number.isFinite(pixel) || !Number.isFinite(dimension) || dimension === 0) {
    return 0
  }
  return pixel / dimension
}

/**
 * Convert a relative (0-1) coordinate to pixel coordinate
 * @param relative - Relative value in range [0, 1]
 * @param dimension - Canvas dimension (width or height)
 * @returns Pixel value
 */
export function toAbsolute(relative: number, dimension: number): number {
  if (!Number.isFinite(relative) || !Number.isFinite(dimension)) {
    return 0
  }
  return relative * dimension
}

/**
 * Convert a point from pixel coordinates to relative coordinates
 */
export function pointToRelative(x: number, y: number, canvas: CanvasDimensions): DragPoint {
  return {
    x: toRelative(x, canvas.width),
    y: toRelative(y, canvas.height),
  }
}

/**
 * Convert a point from relative coordinates to pixel coordinates
 */
export function pointToAbsolute(x: number, y: number, canvas: CanvasDimensions): DragPoint {
  return {
    x: toAbsolute(x, canvas.width),
    y: toAbsolute(y, canvas.height),
  }
}

/**
 * Convert a shape from relative coordinates to absolute pixel coordinates
 * Used during rendering
 */
export function shapeToAbsolute<T extends Shape>(shape: T, canvas: CanvasDimensions): T {
  const baseAbsolute = {
    x: toAbsolute(shape.x, canvas.width),
    y: toAbsolute(shape.y, canvas.height),
  }

  switch (shape.type) {
    case 'rectangle':
    case 'triangle': {
      const s = shape as RectangleShape | TriangleShape
      return {
        ...shape,
        ...baseAbsolute,
        width: toAbsolute(s.width, canvas.width),
        height: toAbsolute(s.height, canvas.height),
      }
    }
    case 'circle': {
      const s = shape as CircleShape
      // Use the smaller dimension for radius to maintain aspect ratio
      const radiusDimension = Math.min(canvas.width, canvas.height)
      return {
        ...shape,
        ...baseAbsolute,
        radius: toAbsolute(s.radius, radiusDimension),
      }
    }
    case 'line': {
      // Line has x2, y2 as well
      const lineShape = shape as LineShape
      return {
        ...shape,
        ...baseAbsolute,
        x2: toAbsolute(lineShape.x2, canvas.width),
        y2: toAbsolute(lineShape.y2, canvas.height),
      }
    }
    case 'star': {
      const s = shape as StarShape
      // Use smaller dimension for radii to maintain aspect ratio
      const radiusDimension = Math.min(canvas.width, canvas.height)
      return {
        ...shape,
        ...baseAbsolute,
        outerRadius: toAbsolute(s.outerRadius, radiusDimension),
        innerRadius: toAbsolute(s.innerRadius, radiusDimension),
      }
    }
    case 'heart': {
      const s = shape as HeartShape
      return {
        ...shape,
        ...baseAbsolute,
        width: toAbsolute(s.width, canvas.width),
        height: toAbsolute(s.height, canvas.height),
      }
    }
    case 'stamp':
      // Stamps store position only, size is determined by preset
      return {
        ...shape,
        ...baseAbsolute,
      }
    case 'svg-background':
      // SVG backgrounds don't use relative coordinates - they calculate everything dynamically
      // Just return the shape as-is, rendering handles all positioning
      return shape
    default:
      return {
        ...shape,
        ...baseAbsolute,
      }
  }
}

/**
 * Convert a shape from absolute pixel coordinates to relative coordinates
 * Used when creating/updating shapes from user input
 */
export function shapeToRelative<T extends Shape>(shape: T, canvas: CanvasDimensions): T {
  const baseRelative = {
    x: toRelative(shape.x, canvas.width),
    y: toRelative(shape.y, canvas.height),
  }

  switch (shape.type) {
    case 'rectangle':
    case 'triangle': {
      const s = shape as RectangleShape | TriangleShape
      return {
        ...shape,
        ...baseRelative,
        width: toRelative(s.width, canvas.width),
        height: toRelative(s.height, canvas.height),
      }
    }
    case 'circle': {
      const s = shape as CircleShape
      // Use the smaller dimension for radius to maintain aspect ratio
      const radiusDimension = Math.min(canvas.width, canvas.height)
      return {
        ...shape,
        ...baseRelative,
        radius: toRelative(s.radius, radiusDimension),
      }
    }
    case 'line': {
      // Line has x2, y2 as well
      const lineShape = shape as LineShape
      return {
        ...shape,
        ...baseRelative,
        x2: toRelative(lineShape.x2, canvas.width),
        y2: toRelative(lineShape.y2, canvas.height),
      }
    }
    case 'star': {
      const s = shape as StarShape
      // Use smaller dimension for radii to maintain aspect ratio
      const radiusDimension = Math.min(canvas.width, canvas.height)
      return {
        ...shape,
        ...baseRelative,
        outerRadius: toRelative(s.outerRadius, radiusDimension),
        innerRadius: toRelative(s.innerRadius, radiusDimension),
      }
    }
    case 'heart': {
      const s = shape as HeartShape
      return {
        ...shape,
        ...baseRelative,
        width: toRelative(s.width, canvas.width),
        height: toRelative(s.height, canvas.height),
      }
    }
    case 'stamp':
      // Stamps store position only, size is determined by preset
      return {
        ...shape,
        ...baseRelative,
      }
    default:
      return {
        ...shape,
        ...baseRelative,
      }
  }
}

/**
 * Geometry Helper Functions
 *
 * These functions compute shape geometry from drag gestures.
 * They are pure functions (side-effect free) and independent of Vue/Pinia,
 * making them easily unit-testable.
 *
 * Test Scenarios:
 * - Normal drags: Standard drag from top-left to bottom-right
 * - Reversed drags: Drag from bottom-right to top-left (negative dimensions)
 * - Tiny drags: Very small movements (handled, validated at commit)
 * - Out-of-bounds: Coordinates outside canvas (clamped to valid values)
 * - Edge cases: NaN, Infinity, null, undefined (handled with validation)
 */

/**
 * Computes rectangle geometry from drag start and current points
 * Normalizes negative widths/heights to ensure top-left origin
 * Handles edge cases: reversed drags, tiny shapes, out-of-bounds coordinates
 *
 * @param startPoint - Starting point of the drag gesture
 * @param currentPoint - Current point of the drag gesture
 * @returns Rectangle geometry with normalized coordinates (always positive width/height)
 */
export function computeRectangleFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<
  RectangleShape,
  'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'rotation' | 'createdAt' | 'updatedAt'
> {
  // Validate inputs (handle NaN, Infinity, null, undefined)
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  // Normalize to ensure top-left origin (handles reversed drags)
  const x = Math.min(startX, currentX)
  const y = Math.min(startY, currentY)
  const width = Math.abs(currentX - startX)
  const height = Math.abs(currentY - startY)

  // Ensure non-negative dimensions (handles tiny/zero-size drags)
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    width: Math.max(0, Number.isFinite(width) ? width : 0),
    height: Math.max(0, Number.isFinite(height) ? height : 0),
  }
}

/**
 * Computes circle geometry from drag start and current points
 * Center is at start point, radius is distance to current point
 * No rotation needed for circles (they look the same from any angle)
 *
 * @param startPoint - Starting point (becomes circle center)
 * @param currentPoint - Current point (determines radius)
 * @returns Circle geometry with center and radius
 */
export function computeCircleFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<
  CircleShape,
  'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'rotation' | 'createdAt' | 'updatedAt'
> {
  // Validate inputs (handle NaN, Infinity, null, undefined)
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  // Calculate radius as distance from center to current point
  const dx = currentX - startX
  const dy = currentY - startY
  const radius = Math.sqrt(dx * dx + dy * dy)

  // No rotation for circles - they're symmetric
  return {
    x: Number.isFinite(startX) ? startX : 0,
    y: Number.isFinite(startY) ? startY : 0,
    radius: Math.max(0, Number.isFinite(radius) ? radius : 0),
  }
}

/**
 * Computes triangle geometry from drag start and current points
 * Creates an isosceles triangle centered at the start point, scaling outward
 * based on the distance to the current point (like circle behavior).
 * Rotation is based on the drag direction - drag direction points the top vertex.
 *
 * @param startPoint - Starting point (becomes triangle center)
 * @param currentPoint - Current point (determines size and rotation via distance/angle)
 * @returns Triangle geometry with position, dimensions, and rotation
 */
export function computeTriangleFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<TriangleShape, 'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'createdAt' | 'updatedAt'> {
  // Validate inputs (handle NaN, Infinity, null, undefined)
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  // Calculate size based on distance from center (like circle)
  const dx = currentX - startX
  const dy = currentY - startY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Triangle dimensions based on distance (uniform scaling)
  const width = distance * 2
  const height = distance * 2

  // Position: top-left corner of bounding box, centered on start point
  const x = startX - width / 2
  const y = startY - height / 3

  // Calculate rotation from drag direction
  // Triangle points UP by default, so we offset so dragging UP = 0 rotation
  const rotation = distance > 5 ? Math.atan2(dy, dx) + Math.PI / 2 : 0

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    width: Math.max(0, Number.isFinite(width) ? width : 0),
    height: Math.max(0, Number.isFinite(height) ? height : 0),
    rotation: Number.isFinite(rotation) ? rotation : 0,
  }
}

/**
 * Validates if a shape meets minimum size requirements
 * Used to prevent committing shapes that are too small to be useful
 *
 * Minimum sizes:
 * - Rectangle: 5px × 5px
 * - Circle: 5px radius
 * - Triangle: 10px width × 10px height (larger due to isosceles geometry)
 *
 * @param shape - Shape to validate
 * @returns true if shape meets minimum size requirements, false otherwise
 */
export function validateShapeSize(shape: Shape): boolean {
  // Validate shape exists and has required properties
  if (!shape || !shape.type) {
    return false
  }

  // Check for NaN/Infinity values
  const hasInvalidValues = (value: number) => !Number.isFinite(value) || value < 0

  switch (shape.type) {
    case 'rectangle':
      if (hasInvalidValues(shape.width) || hasInvalidValues(shape.height)) {
        return false
      }
      return shape.width >= 5 && shape.height >= 5

    case 'triangle':
      if (hasInvalidValues(shape.width) || hasInvalidValues(shape.height)) {
        return false
      }
      // Triangle requires larger minimum size (10px) due to isosceles geometry
      return shape.width >= 10 && shape.height >= 10

    case 'circle':
      if (hasInvalidValues(shape.radius)) {
        return false
      }
      return shape.radius >= 5

    case 'star':
      if (hasInvalidValues(shape.outerRadius) || hasInvalidValues(shape.innerRadius)) {
        return false
      }
      return shape.outerRadius >= 10 && shape.innerRadius >= 3

    case 'heart':
      if (hasInvalidValues(shape.width) || hasInvalidValues(shape.height)) {
        return false
      }
      return shape.width >= 10 && shape.height >= 10

    case 'line': {
      // Lines just need some minimum length
      const dx = shape.x2 - shape.x
      const dy = shape.y2 - shape.y
      const length = Math.sqrt(dx * dx + dy * dy)
      return length >= 5
    }

    default:
      // Unknown shape types pass validation (may be implemented later)
      return true
  }
}

/**
 * Computes star geometry from drag start and current points
 * Center is at start point, outer radius is distance to current point
 * Inner radius is 40% of outer radius (classic 5-pointed star)
 * Rotation is based on drag direction - one point faces the drag direction.
 *
 * @param startPoint - Starting point (becomes star center)
 * @param currentPoint - Current point (determines outer radius and rotation)
 * @returns Star geometry with center, radii, and rotation
 */
export function computeStarFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<StarShape, 'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'createdAt' | 'updatedAt'> {
  // Validate inputs
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  // Calculate outer radius as distance from center to current point
  const dx = currentX - startX
  const dy = currentY - startY
  const outerRadius = Math.sqrt(dx * dx + dy * dy)

  // Inner radius is 40% of outer for a classic 5-pointed star look
  const innerRadius = outerRadius * 0.4

  // Calculate rotation from drag direction
  // Star points UP by default, so offset so dragging UP = 0 rotation
  const rotation = outerRadius > 5 ? Math.atan2(dy, dx) + Math.PI / 2 : 0

  return {
    x: Number.isFinite(startX) ? startX : 0,
    y: Number.isFinite(startY) ? startY : 0,
    outerRadius: Math.max(0, Number.isFinite(outerRadius) ? outerRadius : 0),
    innerRadius: Math.max(0, Number.isFinite(innerRadius) ? innerRadius : 0),
    points: 5, // Classic 5-pointed star
    rotation: Number.isFinite(rotation) ? rotation : 0,
  }
}

/**
 * Computes heart geometry from drag start and current points
 * Creates a heart shape centered at the start point, scaling outward
 * based on the distance to the current point (like circle behavior).
 * Rotation is based on drag direction - the bottom point faces the drag direction.
 *
 * @param startPoint - Starting point (becomes heart center)
 * @param currentPoint - Current point (determines size and rotation via distance/angle)
 * @returns Heart geometry with position, dimensions, and rotation
 */
export function computeHeartFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<HeartShape, 'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'createdAt' | 'updatedAt'> {
  // Validate inputs
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  // Calculate size based on distance from center (like circle)
  const dx = currentX - startX
  const dy = currentY - startY
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Heart dimensions based on distance (uniform scaling)
  const width = distance * 2
  const height = distance * 2

  // Position: top-left corner of bounding box, centered on start point
  const x = startX - width / 2
  const y = startY - height / 2

  // Calculate rotation from drag direction
  // Heart points DOWN by default, so offset so dragging DOWN = 0 rotation
  const rotation = distance > 5 ? Math.atan2(dy, dx) - Math.PI / 2 : 0

  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    width: Math.max(0, Number.isFinite(width) ? width : 0),
    height: Math.max(0, Number.isFinite(height) ? height : 0),
    rotation: Number.isFinite(rotation) ? rotation : 0,
  }
}

/**
 * Computes line geometry from drag start and current points
 * Line goes from start point to current point
 *
 * @param startPoint - Starting point (line start)
 * @param currentPoint - Current point (line end)
 * @returns Line geometry with start and end coordinates
 */
export function computeLineFromDrag(
  startPoint: DragPoint,
  currentPoint: DragPoint
): Omit<
  LineShape,
  'id' | 'type' | 'strokeColor' | 'strokeWidth' | 'rotation' | 'createdAt' | 'updatedAt'
> {
  // Validate inputs
  const startX = Number.isFinite(startPoint.x) ? startPoint.x : 0
  const startY = Number.isFinite(startPoint.y) ? startPoint.y : 0
  const currentX = Number.isFinite(currentPoint.x) ? currentPoint.x : startX
  const currentY = Number.isFinite(currentPoint.y) ? currentPoint.y : startY

  return {
    x: Number.isFinite(startX) ? startX : 0,
    y: Number.isFinite(startY) ? startY : 0,
    x2: Number.isFinite(currentX) ? currentX : 0,
    y2: Number.isFinite(currentY) ? currentY : 0,
  }
}
