// ============================================================================
// TEMPLATE SYSTEM: Pre-made coloring page templates
// ============================================================================
// Templates are curated scenes that load as a single, centered, large object
// on the canvas. They use black outlines only and work with existing flood-fill.
//
// Two types of templates:
// 1. Primitive-based: Composed using existing shapes (rectangle, circle, etc.)
// 2. Path-based: SVG path data for complex shapes (animals, detailed objects)
// ============================================================================

import type { Shape } from './shape'

/**
 * Template categories for organization in the picker UI
 */
export type TemplateCategory =
  | 'animals'
  | 'vehicles'
  | 'nature'
  | 'buildings'
  | 'objects'
  | 'characters'
  | 'food'
  | 'abstract'
  | 'fantasy'

/**
 * Source type for template data
 * - 'primitives': Uses existing shape types (rectangle, circle, etc.)
 * - 'path': Uses SVG path data (Path2D compatible)
 */
export type TemplateSource = 'primitives' | 'path'

/**
 * Path shape for SVG-based templates
 * Uses SVG path data string which is rendered via Path2D API
 *
 * Path coordinates are in the template's local coordinate system (viewBox).
 * They get scaled and centered when applied to the canvas.
 */
export interface PathShape {
  /** Unique identifier */
  id: string
  /** Type discriminator */
  type: 'path'
  /** SVG path data string (e.g., "M10 10 h 80 v 80 Z") */
  d: string
  /** Stroke color (always black for coloring pages) */
  strokeColor: string
  /** Stroke width in viewBox units */
  strokeWidth: number
  /** Optional fill color (usually none for coloring pages) */
  fillColor?: string
  /** Creation timestamp */
  createdAt: number
  /** Last update timestamp */
  updatedAt: number
}

/**
 * Union type for template shapes
 * Templates can contain both primitive shapes and path shapes
 */
export type TemplateShape = Shape | PathShape

/**
 * ViewBox dimensions for SVG-based templates
 * Defines the coordinate space of path data
 */
export interface TemplateViewBox {
  /** ViewBox width */
  width: number
  /** ViewBox height */
  height: number
  /** Optional X offset (default 0) */
  minX?: number
  /** Optional Y offset (default 0) */
  minY?: number
}

/**
 * Template definition - metadata and shape data for a coloring template
 *
 * Templates are stored with their own coordinate system (viewBox) and
 * get scaled/centered when applied to the canvas.
 */
export interface TemplateDefinition {
  /** Unique template identifier */
  id: string
  /** Display name (kid-friendly) */
  name: string
  /** Category for organization in picker */
  category: TemplateCategory
  /** Emoji icon for display */
  icon: string
  /** Path to thumbnail image for picker preview */
  thumbnailUrl?: string
  /** Source type */
  source: TemplateSource
  /**
   * ViewBox defining the template's coordinate system
   * Shapes are defined in these coordinates and scaled to fit canvas
   */
  viewBox: TemplateViewBox
  /**
   * Shape data for primitive-based templates
   * Coordinates are in viewBox space (will be scaled to fit canvas)
   */
  shapes?: TemplateShape[]
  /**
   * SVG path data for path-based templates
   * Single path string that gets rendered via Path2D
   */
  pathData?: string
  /** Attribution text (if required by license) */
  attribution?: string
  /** License info for reference */
  license?: 'cc0' | 'public-domain' | 'mit'
}

/**
 * Template registry - collection of available templates
 */
export interface TemplateRegistry {
  /** Version of the template format */
  version: string
  /** Array of template definitions */
  templates: TemplateDefinition[]
}

/**
 * Template loading state for UI
 */
export interface TemplateLoadingState {
  /** Whether the template picker is open */
  isOpen: boolean
  /** Currently selected template ID (for preview) */
  selectedId: string | null
  /** Loading indicator for template application */
  isApplying: boolean
}
