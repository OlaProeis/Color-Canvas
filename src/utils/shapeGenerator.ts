/**
 * Random Shape Generator
 *
 * Generates coloring page with overlapping rectangles.
 * All coordinates are in relative units (0-1) for canvas-independent storage.
 * Shapes can extend beyond canvas edges for a more natural, spread-out look.
 */

import type { Shape, RectangleShape } from '@/types'

/**
 * Generation configuration based on complexity level (0-1)
 */
export interface GenerationConfig {
  // Base number of shapes at complexity 0
  baseShapeCount: number
  // Additional shapes per complexity point (multiplied by 100)
  shapesPerComplexity: number
  // Size constraints that vary with complexity
  // At low complexity: larger shapes, fewer of them
  // At high complexity: smaller shapes, more of them
  minSizeAtLowComplexity: number
  maxSizeAtLowComplexity: number
  minSizeAtHighComplexity: number
  maxSizeAtHighComplexity: number
  // Rotation constraints
  allowRotation: boolean
  maxRotationDegrees: number
  // How much shapes can overflow beyond canvas (0.3 = 30% outside)
  overflowAmount: number
}

/**
 * Default generation configuration
 * Tuned for kid-friendly coloring pages with rectangles only
 */
export const DEFAULT_CONFIG: GenerationConfig = {
  baseShapeCount: 15,
  shapesPerComplexity: 60, // At complexity 1: 15 + 60 = 75 shapes (less cluttered)
  minSizeAtLowComplexity: 0.15, // 15% of canvas
  maxSizeAtLowComplexity: 0.45, // 45% of canvas
  minSizeAtHighComplexity: 0.08, // 8% of canvas
  maxSizeAtHighComplexity: 0.25, // 25% of canvas
  allowRotation: true,
  maxRotationDegrees: 30, // Moderate rotation for visual interest
  overflowAmount: 0.25, // Shapes can start 25% outside canvas
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

/**
 * Generate a random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Interpolate between two values based on complexity (0-1)
 */
function lerp(low: number, high: number, t: number): number {
  return low + (high - low) * t
}

// ============================================================================
// SHAPE GENERATION
// ============================================================================

/**
 * Calculate number of shapes to generate based on complexity
 */
export function calculateShapeCount(
  complexity: number,
  config: GenerationConfig = DEFAULT_CONFIG
): number {
  return Math.floor(config.baseShapeCount + complexity * config.shapesPerComplexity)
}

/**
 * Generate a single random rectangle
 * Returns shape in relative coordinates (0-1)
 * Shapes can extend beyond canvas edges for a spread-out look
 */
function generateRandomRectangle(complexity: number, config: GenerationConfig): RectangleShape {
  // Size varies with complexity: low = larger, high = smaller
  const minSize = lerp(config.minSizeAtLowComplexity, config.minSizeAtHighComplexity, complexity)
  const maxSize = lerp(config.maxSizeAtLowComplexity, config.maxSizeAtHighComplexity, complexity)

  const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const timestamp = Date.now()

  // Random rotation (in radians)
  const rotation = config.allowRotation
    ? (randomBetween(-config.maxRotationDegrees, config.maxRotationDegrees) * Math.PI) / 180
    : 0

  // Random size
  const width = randomBetween(minSize, maxSize)
  const height = randomBetween(minSize, maxSize)

  // Position: allow shapes to extend beyond canvas edges
  // Range: -overflow to (1 + overflow - width) so some part is always visible
  const overflow = config.overflowAmount
  const minX = -overflow
  const maxX = 1 + overflow - width
  const minY = -overflow
  const maxY = 1 + overflow - height

  const x = randomBetween(minX, maxX)
  const y = randomBetween(minY, maxY)

  return {
    id,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    strokeColor: '#000000',
    strokeWidth: 2.5,
    rotation,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

/**
 * Generate random rectangles for a coloring page
 *
 * @param complexity - Complexity level (0-1). Higher = more, smaller shapes
 * @param config - Optional custom configuration
 * @returns Array of rectangle shapes in relative coordinates
 */
export function generateRandomShapes(
  complexity: number,
  config: GenerationConfig = DEFAULT_CONFIG
): Shape[] {
  // Clamp complexity to valid range
  const clampedComplexity = Math.max(0, Math.min(1, complexity))

  const shapeCount = calculateShapeCount(clampedComplexity, config)
  const shapes: RectangleShape[] = []

  for (let i = 0; i < shapeCount; i++) {
    shapes.push(generateRandomRectangle(clampedComplexity, config))
  }

  return shapes
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that a rectangle has valid dimensions
 * Note: Positions can be outside 0-1 range (overflow is allowed)
 */
export function validateShapeBounds(shape: Shape): boolean {
  if (shape.type !== 'rectangle') {
    // For non-rectangles, just check they have an id
    return !!shape.id
  }

  // Rectangle: check positive dimensions
  return shape.width > 0 && shape.height > 0
}

/**
 * Validate an array of shapes
 * Returns array of invalid shape indices
 */
export function validateShapes(shapes: Shape[]): number[] {
  const invalidIndices: number[] = []

  shapes.forEach((shape, index) => {
    if (!validateShapeBounds(shape)) {
      invalidIndices.push(index)
    }
  })

  return invalidIndices
}
