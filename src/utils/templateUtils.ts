/**
 * Template Utilities
 *
 * Functions to transform, scale, and center template shapes for rendering
 * on the canvas. Templates use a viewBox coordinate system that gets
 * transformed to the canvas's relative (0-1) coordinate system.
 */

import type {
  Shape,
  TemplateDefinition,
  TemplateShape,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
} from '@/types'
import type { CanvasDimensions } from './shapeGeometry'

/**
 * Configuration for template application
 */
export interface TemplateApplyConfig {
  /** Margin as fraction of canvas size (0.1 = 10% margin on each side) */
  margin?: number
  /** Scale multiplier (1.0 = fit to available space) */
  scale?: number
  /** Custom position offset (in relative coordinates) */
  offsetX?: number
  offsetY?: number
}

const DEFAULT_CONFIG: Required<TemplateApplyConfig> = {
  margin: 0.08, // 8% margin on each side
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
}

/**
 * Generate a unique shape ID
 */
function generateShapeId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Calculate the scale factor to fit template in canvas with margins
 *
 * @param template - Template definition with viewBox
 * @param canvas - Canvas dimensions
 * @param margin - Margin as fraction of canvas size
 * @returns Scale factor to apply to template coordinates
 */
export function calculateScaleFactor(
  template: TemplateDefinition,
  canvas: CanvasDimensions,
  margin: number = DEFAULT_CONFIG.margin
): number {
  const { viewBox } = template

  // Available space after margins
  const availableWidth = canvas.width * (1 - margin * 2)
  const availableHeight = canvas.height * (1 - margin * 2)

  // Calculate scale to fit template in available space
  const scaleX = availableWidth / viewBox.width
  const scaleY = availableHeight / viewBox.height

  // Use the smaller scale to ensure template fits entirely
  return Math.min(scaleX, scaleY)
}

/**
 * Calculate the offset to center template in canvas
 *
 * @param template - Template definition with viewBox
 * @param canvas - Canvas dimensions
 * @param scaleFactor - Scale factor being applied
 * @param margin - Margin as fraction of canvas size
 * @returns Offset coordinates in pixels
 */
export function calculateCenterOffset(
  template: TemplateDefinition,
  canvas: CanvasDimensions,
  scaleFactor: number,
  _margin: number = DEFAULT_CONFIG.margin
): { offsetX: number; offsetY: number } {
  const { viewBox } = template

  // Scaled template dimensions
  const scaledWidth = viewBox.width * scaleFactor
  const scaledHeight = viewBox.height * scaleFactor

  // Center in available space
  const offsetX = (canvas.width - scaledWidth) / 2
  const offsetY = (canvas.height - scaledHeight) / 2

  return { offsetX, offsetY }
}

/**
 * Transform a single shape from template viewBox coordinates to
 * canvas relative (0-1) coordinates
 */
function transformShape(
  shape: TemplateShape,
  scaleFactor: number,
  offsetX: number,
  offsetY: number,
  canvas: CanvasDimensions,
  viewBox: { width: number; height: number }
): Shape {
  const timestamp = Date.now()
  const baseTransform = {
    id: generateShapeId(),
    strokeColor: shape.strokeColor || '#000000',
    strokeWidth: shape.strokeWidth || 2.5,
    rotation: 'rotation' in shape ? shape.rotation : 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  // Path shapes are not supported in the primitive system
  // They would need special handling with Path2D
  if (shape.type === 'path') {
    console.warn('Path shapes not yet supported in template conversion')
    // Return a placeholder rectangle
    return {
      ...baseTransform,
      type: 'rectangle',
      x: offsetX / canvas.width,
      y: offsetY / canvas.height,
      width: (viewBox.width * scaleFactor) / canvas.width,
      height: (viewBox.height * scaleFactor) / canvas.height,
    } as RectangleShape
  }

  // Transform coordinates based on shape type
  switch (shape.type) {
    case 'rectangle': {
      const s = shape as RectangleShape
      // Transform position: scale and offset, then convert to relative
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      const absWidth = s.width * scaleFactor
      const absHeight = s.height * scaleFactor

      return {
        ...baseTransform,
        type: 'rectangle',
        x: absX / canvas.width,
        y: absY / canvas.height,
        width: absWidth / canvas.width,
        height: absHeight / canvas.height,
        fillColor: s.fillColor,
      } as RectangleShape
    }

    case 'circle': {
      const s = shape as CircleShape
      // Circle center is transformed
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      // Radius uses the smaller canvas dimension for consistency
      const radiusDimension = Math.min(canvas.width, canvas.height)
      const absRadius = s.radius * scaleFactor

      return {
        ...baseTransform,
        type: 'circle',
        x: absX / canvas.width,
        y: absY / canvas.height,
        radius: absRadius / radiusDimension,
        fillColor: s.fillColor,
      } as CircleShape
    }

    case 'triangle': {
      const s = shape as TriangleShape
      // Triangle uses bounding box position (top-left of bounding box)
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      const absWidth = s.width * scaleFactor
      const absHeight = s.height * scaleFactor

      return {
        ...baseTransform,
        type: 'triangle',
        x: absX / canvas.width,
        y: absY / canvas.height,
        width: absWidth / canvas.width,
        height: absHeight / canvas.height,
        fillColor: s.fillColor,
      } as TriangleShape
    }

    case 'star': {
      const s = shape as StarShape
      // Star center is transformed
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      // Radii use the smaller canvas dimension
      const radiusDimension = Math.min(canvas.width, canvas.height)
      const absOuterRadius = s.outerRadius * scaleFactor
      const absInnerRadius = s.innerRadius * scaleFactor

      return {
        ...baseTransform,
        type: 'star',
        x: absX / canvas.width,
        y: absY / canvas.height,
        outerRadius: absOuterRadius / radiusDimension,
        innerRadius: absInnerRadius / radiusDimension,
        points: s.points,
        fillColor: s.fillColor,
      } as StarShape
    }

    case 'heart': {
      const s = shape as HeartShape
      // Heart uses bounding box position
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      const absWidth = s.width * scaleFactor
      const absHeight = s.height * scaleFactor

      return {
        ...baseTransform,
        type: 'heart',
        x: absX / canvas.width,
        y: absY / canvas.height,
        width: absWidth / canvas.width,
        height: absHeight / canvas.height,
        fillColor: s.fillColor,
      } as HeartShape
    }

    case 'line': {
      const s = shape as LineShape
      // Transform both endpoints
      const absX = s.x * scaleFactor + offsetX
      const absY = s.y * scaleFactor + offsetY
      const absX2 = s.x2 * scaleFactor + offsetX
      const absY2 = s.y2 * scaleFactor + offsetY

      return {
        ...baseTransform,
        type: 'line',
        x: absX / canvas.width,
        y: absY / canvas.height,
        x2: absX2 / canvas.width,
        y2: absY2 / canvas.height,
      } as LineShape
    }

    default:
      console.warn(`Unknown shape type: ${(shape as Shape).type}`)
      return shape as Shape
  }
}

/**
 * Apply a template to the canvas - transforms all shapes from template
 * viewBox coordinates to canvas relative coordinates
 *
 * @param template - Template definition
 * @param canvas - Canvas dimensions
 * @param config - Optional configuration for margins, scale, offset
 * @returns Array of shapes ready to add to the drawing store
 */
export function applyTemplate(
  template: TemplateDefinition,
  canvas: CanvasDimensions,
  config: TemplateApplyConfig = {}
): Shape[] {
  const opts = { ...DEFAULT_CONFIG, ...config }

  // Get shapes from template
  const templateShapes = template.shapes || []

  if (templateShapes.length === 0) {
    console.warn(`Template "${template.id}" has no shapes`)
    return []
  }

  // Calculate transformation parameters
  const scaleFactor = calculateScaleFactor(template, canvas, opts.margin) * opts.scale
  const { offsetX, offsetY } = calculateCenterOffset(template, canvas, scaleFactor, opts.margin)

  // Apply custom offsets
  const finalOffsetX = offsetX + opts.offsetX * canvas.width
  const finalOffsetY = offsetY + opts.offsetY * canvas.height

  // Transform all shapes
  const transformedShapes = templateShapes.map(shape =>
    transformShape(shape, scaleFactor, finalOffsetX, finalOffsetY, canvas, template.viewBox)
  )

  return transformedShapes
}

/**
 * Get a preview of how a template would look at specific dimensions
 * Returns the shapes in absolute pixel coordinates (for preview rendering)
 *
 * @param template - Template definition
 * @param previewWidth - Preview canvas width
 * @param previewHeight - Preview canvas height
 * @param margin - Margin fraction
 * @returns Array of shapes in pixel coordinates
 */
export function getTemplatePreview(
  template: TemplateDefinition,
  previewWidth: number,
  previewHeight: number,
  margin: number = 0.1
): Shape[] {
  const canvas: CanvasDimensions = { width: previewWidth, height: previewHeight }
  const shapes = applyTemplate(template, canvas, { margin })

  // Convert from relative back to absolute for preview
  // (Normally the canvas does this during rendering)
  return shapes.map(shape => {
    const result = { ...shape }

    switch (shape.type) {
      case 'rectangle':
      case 'triangle':
      case 'heart': {
        const s = shape as RectangleShape | TriangleShape | HeartShape
        return {
          ...result,
          x: s.x * canvas.width,
          y: s.y * canvas.height,
          width: s.width * canvas.width,
          height: s.height * canvas.height,
        }
      }
      case 'circle': {
        const s = shape as CircleShape
        const radiusDim = Math.min(canvas.width, canvas.height)
        return {
          ...result,
          x: s.x * canvas.width,
          y: s.y * canvas.height,
          radius: s.radius * radiusDim,
        }
      }
      case 'star': {
        const s = shape as StarShape
        const radiusDim = Math.min(canvas.width, canvas.height)
        return {
          ...result,
          x: s.x * canvas.width,
          y: s.y * canvas.height,
          outerRadius: s.outerRadius * radiusDim,
          innerRadius: s.innerRadius * radiusDim,
        }
      }
      case 'line': {
        const s = shape as LineShape
        return {
          ...result,
          x: s.x * canvas.width,
          y: s.y * canvas.height,
          x2: s.x2 * canvas.width,
          y2: s.y2 * canvas.height,
        }
      }
      default:
        return result as Shape
    }
  })
}

/**
 * Validate that a template has all required fields and valid shapes
 */
export function validateTemplate(template: TemplateDefinition): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!template.id) errors.push('Missing template ID')
  if (!template.name) errors.push('Missing template name')
  if (!template.category) errors.push('Missing template category')
  if (!template.viewBox) errors.push('Missing viewBox')

  if (template.viewBox) {
    if (template.viewBox.width <= 0) errors.push('Invalid viewBox width')
    if (template.viewBox.height <= 0) errors.push('Invalid viewBox height')
  }

  if (!template.shapes || template.shapes.length === 0) {
    if (!template.pathData) {
      errors.push('Template has no shapes or pathData')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
