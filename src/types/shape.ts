// ============================================================================
// COORDINATE SYSTEM: All shapes use RELATIVE coordinates (0-1)
// ============================================================================
// Coordinates represent percentages of canvas dimensions:
// - x, y: Position as fraction of canvas width/height (0 = left/top, 1 = right/bottom)
// - width, height: Size as fraction of canvas dimensions
// - radius: Fraction of the smaller canvas dimension (for aspect-ratio preservation)
//
// This ensures shapes scale correctly when canvas resizes or zooms.
// Conversion to/from pixel coordinates happens in:
// - shapeGeometry.ts: shapeToRelative(), shapeToAbsolute()
// - renderShapes.ts: Converts to pixels before drawing
// - hitTest.ts: Converts to pixels before testing
// ============================================================================

// Base shape interface with common fields
export interface BaseShape {
  id: string
  type: ShapeType
  x: number // Relative X position (0-1, fraction of canvas width)
  y: number // Relative Y position (0-1, fraction of canvas height)
  strokeColor: string
  strokeWidth: number // In pixels (not relative)
  fillColor?: string // Optional fill color for coloring mode
  rotation: number // In radians
  createdAt: number
  updatedAt: number
}

// Shape type discriminator
export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'line'
  | 'stamp'
  | 'svg-background'

// Rectangle shape
export interface RectangleShape extends BaseShape {
  type: 'rectangle'
  width: number // Relative width (0-1, fraction of canvas width)
  height: number // Relative height (0-1, fraction of canvas height)
}

// Circle shape
export interface CircleShape extends BaseShape {
  type: 'circle'
  radius: number // Relative radius (0-1, fraction of min(canvasWidth, canvasHeight))
}

// Triangle shape (isosceles with top vertex at x, y)
export interface TriangleShape extends BaseShape {
  type: 'triangle'
  width: number // Relative width (0-1, fraction of canvas width)
  height: number // Relative height (0-1, fraction of canvas height)
}

// Star shape (for future implementation)
export interface StarShape extends BaseShape {
  type: 'star'
  outerRadius: number
  innerRadius: number
  points: number
}

// Heart shape (for future implementation)
export interface HeartShape extends BaseShape {
  type: 'heart'
  width: number
  height: number
}

// Line shape (for future implementation)
export interface LineShape extends BaseShape {
  type: 'line'
  x2: number
  y2: number
}

// Stamp/sticker shape - placed from stamp library
export type StampSizePreset = 'small' | 'medium' | 'large'

export interface StampShape extends BaseShape {
  type: 'stamp'
  stampKey: string // ID from stamp registry (e.g., 'smiley', 'cat')
  sizePreset: StampSizePreset // Size preset for rendering
}

// SVG Background shape - used for rendering SVG templates as a background layer
export interface SvgBackgroundShape extends BaseShape {
  type: 'svg-background'
  /** Path to the SVG file */
  svgPath: string
  /** Cached image (loaded lazily) */
  image?: HTMLImageElement
  /** ViewBox dimensions for proper scaling */
  viewBox: {
    width: number
    height: number
  }
  /** Margin to apply (fraction of canvas) */
  margin: number
}

// Discriminated union of all shape types
export type Shape =
  | RectangleShape
  | CircleShape
  | TriangleShape
  | StarShape
  | HeartShape
  | LineShape
  | StampShape
  | SvgBackgroundShape
