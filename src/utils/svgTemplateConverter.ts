/**
 * SVG to Shape Converter
 *
 * Converts SVG templates into drawable shapes by rendering them
 * as a background layer on the canvas.
 */

import type { TemplateDefinition, Shape, SvgBackgroundShape } from '@/types'
import type { CanvasDimensions } from './shapeGeometry'
import { loadSvgAsImage } from './svgTemplateLoader'

// Re-export SvgBackgroundShape for consumers that import from this file
export type { SvgBackgroundShape } from '@/types'

/**
 * Apply an SVG template to the canvas by creating a background shape
 *
 * @param template - SVG template definition
 * @param _canvas - Canvas dimensions (reserved for future use)
 * @param config - Configuration for margins
 * @returns Array containing a single SVG background shape
 */
export async function applySvgTemplate(
  template: TemplateDefinition,
  _canvas: CanvasDimensions,
  config: { margin?: number } = {}
): Promise<Shape[]> {
  if (template.source !== 'path' || !template.pathData) {
    throw new Error('Not an SVG template')
  }

  const margin = config.margin ?? 0.08
  const svgPath = template.pathData

  // Pre-load the SVG image
  const img = await loadSvgAsImage(svgPath)

  // Create SVG background shape with viewBox for dynamic scaling
  const timestamp = Date.now()
  const shape: SvgBackgroundShape = {
    id: `svg-bg-${timestamp}`,
    type: 'svg-background',
    svgPath,
    image: img,
    viewBox: {
      width: template.viewBox.width,
      height: template.viewBox.height,
    },
    margin,
    // Dummy x, y values (not used, but required by Shape interface)
    x: 0,
    y: 0,
    strokeColor: '#000000',
    strokeWidth: 0,
    rotation: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  return [shape]
}
