/**
 * Magic Generator Types
 *
 * Configuration types for the redesigned Magic Generator that creates
 * themed, well-composed coloring pages instead of random shapes.
 */

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Available generation themes
 * Each theme has its own shape palette, color scheme, and composition rules
 */
export type GeneratorTheme =
  | 'sea' // Ocean creatures, waves, coral, shells
  | 'space' // Planets, stars, rockets, aliens
  | 'garden' // Flowers, butterflies, trees, sun
  | 'fantasy' // Castles, unicorns, dragons, fairies
  | 'random' // Mix of everything (improved random mode)

/**
 * Pattern/style types for generation
 */
export type GeneratorStyle =
  | 'scene' // Coherent themed scene with composition
  | 'mandala' // Radial symmetry, circular patterns
  | 'kaleidoscope' // Dense overlapping symmetry with more shapes
  | 'pattern' // Repetitive decorative patterns
  | 'mosaic' // Interlocking tessellated shapes
  | 'freeform' // Artistic scatter (improved random)

/**
 * Age-appropriate difficulty levels
 * Affects shape count, complexity, and region sizes
 */
export type GeneratorDifficulty =
  | 'toddler' // Ages 2-4: Few large shapes, big regions
  | 'kid' // Ages 5-8: Medium count, recognizable shapes
  | 'teen' // Ages 9-14: More shapes, some detail
  | 'adult' // 15+: Many shapes, intricate details

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Composition rules for layout generation
 */
export interface CompositionRules {
  /** Center of focus for the composition (0-1 relative coords) */
  focalPoint?: { x: number; y: number }
  /** Whether to use layered depth (background/mid/foreground) */
  layering: boolean
  /** How packed the shapes should be */
  density: 'sparse' | 'medium' | 'dense'
  /** Minimum spacing between shapes (0-1, percentage of canvas) */
  minSpacing: number
}

/**
 * Full configuration for the Magic Generator
 */
export interface MagicGeneratorConfig {
  theme: GeneratorTheme
  style: GeneratorStyle
  difficulty: GeneratorDifficulty
  composition: CompositionRules
}

// ============================================================================
// THEME SHAPE DEFINITIONS
// ============================================================================

/**
 * Types of shapes that can be generated for themes
 * Maps to actual Shape types plus semantic variations
 */
export type ThemeShapeType =
  // Basic primitives (map directly to Shape types)
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  // Semantic shapes (rendered as combinations or variations)
  | 'oval' // Elongated circle
  | 'diamond' // Rotated square
  | 'crescent' // Moon shape (two overlapping circles)
  | 'ring' // Donut shape (two circles)
  | 'wave' // Curved lines
  | 'spiral' // Spiral pattern

/**
 * Definition for a shape in a theme palette
 */
export interface ThemeShapeDefinition {
  /** Base shape type */
  type: ThemeShapeType
  /** Size range relative to canvas (0-1) */
  sizeRange: { min: number; max: number }
  /** Allowed aspect ratio range (width/height) */
  aspectRange: { min: number; max: number }
  /** Whether this shape can be rotated */
  canRotate: boolean
  /** Maximum rotation in radians (if canRotate is true) */
  maxRotation: number
  /** Layer preference: which depth level this shape prefers */
  layerPreference: 'background' | 'midground' | 'foreground' | 'any'
  /** Relative frequency weight (higher = more common) */
  weight: number
}

/**
 * Complete definition for a generation theme
 */
export interface ThemeDefinition {
  id: GeneratorTheme
  name: string
  description: string
  /** Shape types available in this theme with their settings */
  shapes: ThemeShapeDefinition[]
  /** Suggested colors for fills (for preview, not used in coloring pages) */
  previewColors: string[]
  /** Background style suggestions */
  backgroundStyle: 'plain' | 'gradient' | 'pattern'
}

// ============================================================================
// DIFFICULTY PARAMETERS
// ============================================================================

/**
 * Parameters that vary by difficulty level
 */
export interface DifficultyParams {
  /** Target number of shapes */
  shapeCount: { min: number; max: number }
  /** Size multiplier for shapes (higher = larger shapes) */
  sizeMultiplier: number
  /** Minimum region size for coloring (% of canvas) */
  minRegionSize: number
  /** Complexity of individual shapes (affects points in stars, etc.) */
  shapeComplexity: 'simple' | 'medium' | 'detailed'
  /** Whether to include small detail elements */
  includeDetails: boolean
}

// ============================================================================
// GENERATION OUTPUT
// ============================================================================

/**
 * Metadata about a generated scene for preview/display
 */
export interface GenerationMetadata {
  /** Unique seed for reproducibility */
  seed: number
  /** Theme used */
  theme: GeneratorTheme
  /** Style used */
  style: GeneratorStyle
  /** Difficulty used */
  difficulty: GeneratorDifficulty
  /** Actual number of shapes generated */
  shapeCount: number
  /** Generation timestamp */
  generatedAt: number
}

/**
 * Result of a generation operation
 */
export interface GenerationResult {
  /** The generated shapes */
  shapes: import('./shape').Shape[]
  /** Metadata about the generation */
  metadata: GenerationMetadata
}
