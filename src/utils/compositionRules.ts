/**
 * Composition Rules
 *
 * Layout algorithms for creating well-composed coloring pages.
 * Handles focal points, layering, spacing, and shape placement.
 */

import type { CompositionRules, GeneratorStyle, ThemeShapeDefinition } from '@/types/generator'

// ============================================================================
// TYPES
// ============================================================================

/**
 * A positioned shape ready for placement on the canvas
 */
export interface PlacedShape {
  /** Center X position (0-1 relative) */
  x: number
  /** Center Y position (0-1 relative) */
  y: number
  /** Width (0-1 relative) */
  width: number
  /** Height (0-1 relative) */
  height: number
  /** Rotation in radians */
  rotation: number
  /** Shape definition used */
  shapeDef: ThemeShapeDefinition
  /** Depth layer (0 = back, 1 = mid, 2 = front) */
  layer: number
}

/**
 * Bounding box for collision detection
 */
interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// ============================================================================
// DEFAULT COMPOSITION SETTINGS
// ============================================================================

export function getDefaultComposition(style: GeneratorStyle): CompositionRules {
  switch (style) {
    case 'scene':
      return {
        focalPoint: { x: 0.5, y: 0.5 },
        layering: true,
        density: 'medium',
        minSpacing: 0.02,
      }
    case 'mandala':
      return {
        focalPoint: { x: 0.5, y: 0.5 },
        layering: false, // Mandalas are flat
        density: 'dense',
        minSpacing: 0.01,
      }
    case 'kaleidoscope':
      return {
        focalPoint: { x: 0.5, y: 0.5 },
        layering: true, // Kaleidoscopes have overlapping layers
        density: 'dense',
        minSpacing: 0.005, // Very tight for overlap effect
      }
    case 'pattern':
      return {
        layering: false,
        density: 'dense',
        minSpacing: 0.02,
      }
    case 'mosaic':
      return {
        layering: true, // Mosaic has overlapping shapes
        density: 'dense',
        minSpacing: 0.01,
      }
    case 'freeform':
    default:
      return {
        layering: true,
        density: 'medium',
        minSpacing: 0.03,
      }
  }
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

/**
 * Seeded random number generator for reproducible results
 */
export class SeededRandom {
  private seed: number

  constructor(seed?: number) {
    this.seed = seed ?? Math.floor(Math.random() * 2147483647)
  }

  /** Get the current seed */
  getSeed(): number {
    return this.seed
  }

  /** Generate next random number (0-1) */
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }

  /** Random number between min and max */
  between(min: number, max: number): number {
    return min + this.next() * (max - min)
  }

  /** Random integer between min and max (inclusive) */
  intBetween(min: number, max: number): number {
    return Math.floor(this.between(min, max + 1))
  }

  /** Pick random item from array */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }

  /** Shuffle array in place */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  /** Weighted random selection */
  weightedPick<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = this.next() * totalWeight

    for (const item of items) {
      random -= item.weight
      if (random <= 0) return item
    }

    return items[items.length - 1]
  }
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

/**
 * Check if two bounding boxes overlap with minimum spacing
 */
function boxesOverlap(a: BoundingBox, b: BoundingBox, spacing: number): boolean {
  const aLeft = a.x - a.width / 2 - spacing
  const aRight = a.x + a.width / 2 + spacing
  const aTop = a.y - a.height / 2 - spacing
  const aBottom = a.y + a.height / 2 + spacing

  const bLeft = b.x - b.width / 2
  const bRight = b.x + b.width / 2
  const bTop = b.y - b.height / 2
  const bBottom = b.y + b.height / 2

  return !(aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom)
}

/**
 * Check if a shape overlaps with any placed shapes
 */
function checkOverlap(shape: BoundingBox, placed: PlacedShape[], spacing: number): boolean {
  for (const other of placed) {
    const otherBox: BoundingBox = {
      x: other.x,
      y: other.y,
      width: other.width,
      height: other.height,
    }
    if (boxesOverlap(shape, otherBox, spacing)) {
      return true
    }
  }
  return false
}

// ============================================================================
// POSITION GENERATION
// ============================================================================

/**
 * Generate a position influenced by focal point
 * Shapes are more likely to be placed near the focal point
 */
function generateFocalPosition(
  rng: SeededRandom,
  focalPoint: { x: number; y: number } | undefined,
  focalStrength: number = 0.3
): { x: number; y: number } {
  // Start with completely random position
  let x = rng.next()
  let y = rng.next()

  // If there's a focal point, bias toward it
  if (focalPoint) {
    const pullStrength = rng.next() * focalStrength
    x = x * (1 - pullStrength) + focalPoint.x * pullStrength
    y = y * (1 - pullStrength) + focalPoint.y * pullStrength
  }

  return { x, y }
}

/**
 * Generate position for a specific layer
 * Background: spread across canvas
 * Midground: more centered
 * Foreground: can be anywhere, including edges
 */
function generateLayeredPosition(
  rng: SeededRandom,
  layer: number,
  composition: CompositionRules
): { x: number; y: number } {
  const { focalPoint } = composition

  if (layer === 0) {
    // Background: spread out, less focal bias
    return generateFocalPosition(rng, focalPoint, 0.1)
  } else if (layer === 1) {
    // Midground: moderate focal bias
    return generateFocalPosition(rng, focalPoint, 0.4)
  } else {
    // Foreground: strong focal bias for details
    return generateFocalPosition(rng, focalPoint, 0.5)
  }
}

// ============================================================================
// SHAPE PLACEMENT
// ============================================================================

/**
 * Determine which layer a shape should go on based on preference
 */
function assignLayer(shapeDef: ThemeShapeDefinition, rng: SeededRandom): number {
  switch (shapeDef.layerPreference) {
    case 'background':
      return 0
    case 'midground':
      return 1
    case 'foreground':
      return 2
    case 'any':
    default:
      return rng.intBetween(0, 2)
  }
}

/**
 * Generate size for a shape based on its definition and layer
 */
function generateSize(
  shapeDef: ThemeShapeDefinition,
  layer: number,
  sizeMultiplier: number,
  rng: SeededRandom
): { width: number; height: number } {
  const { sizeRange, aspectRange } = shapeDef

  // Layer affects size: background larger, foreground smaller
  const layerMultiplier = layer === 0 ? 1.3 : layer === 1 ? 1.0 : 0.7

  const baseSize = rng.between(sizeRange.min, sizeRange.max)
  const size = baseSize * sizeMultiplier * layerMultiplier

  const aspect = rng.between(aspectRange.min, aspectRange.max)

  // Randomly decide if width or height is larger
  if (rng.next() > 0.5) {
    return { width: size * aspect, height: size }
  } else {
    return { width: size, height: size * aspect }
  }
}

/**
 * Generate rotation for a shape
 */
function generateRotation(shapeDef: ThemeShapeDefinition, rng: SeededRandom): number {
  if (!shapeDef.canRotate) return 0
  return rng.between(-shapeDef.maxRotation, shapeDef.maxRotation)
}

// ============================================================================
// MAIN PLACEMENT ALGORITHM
// ============================================================================

export interface PlacementOptions {
  /** Shape definitions to place */
  shapeDefs: ThemeShapeDefinition[]
  /** Target number of shapes */
  targetCount: number
  /** Composition rules */
  composition: CompositionRules
  /** Size multiplier from difficulty */
  sizeMultiplier: number
  /** Random seed for reproducibility */
  seed?: number
  /** Maximum placement attempts per shape */
  maxAttempts?: number
}

/**
 * Place shapes on the canvas using composition rules
 *
 * This is the main algorithm that:
 * 1. Selects shapes based on weights
 * 2. Assigns layers for depth
 * 3. Calculates positions with focal point bias
 * 4. Avoids overlaps while respecting minimum spacing
 * 5. Returns shapes sorted by layer (back to front)
 */
export function placeShapes(options: PlacementOptions): {
  shapes: PlacedShape[]
  seed: number
} {
  const { shapeDefs, targetCount, composition, sizeMultiplier, seed, maxAttempts = 50 } = options

  const rng = new SeededRandom(seed)
  const placed: PlacedShape[] = []
  const { minSpacing, density } = composition

  // Adjust spacing based on density
  const spacing =
    density === 'sparse' ? minSpacing * 2 : density === 'dense' ? minSpacing * 0.5 : minSpacing

  // Track shapes per layer for balanced distribution
  const layerCounts = [0, 0, 0]
  const targetPerLayer = Math.ceil(targetCount / 3)

  for (let i = 0; i < targetCount; i++) {
    // Select shape based on weights
    const shapeDef = rng.weightedPick(shapeDefs)

    // Assign layer (with some balancing)
    let layer = assignLayer(shapeDef, rng)

    // If layer is overfilled, try another
    if (composition.layering && layerCounts[layer] > targetPerLayer) {
      const underfilledLayers = [0, 1, 2].filter(l => layerCounts[l] < targetPerLayer)
      if (underfilledLayers.length > 0) {
        layer = rng.pick(underfilledLayers)
      }
    }

    // Generate size
    const { width, height } = generateSize(shapeDef, layer, sizeMultiplier, rng)

    // Generate rotation
    const rotation = generateRotation(shapeDef, rng)

    // Try to find a non-overlapping position
    let placed_this = false
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pos = composition.layering
        ? generateLayeredPosition(rng, layer, composition)
        : generateFocalPosition(rng, composition.focalPoint)

      const candidate: BoundingBox = {
        x: pos.x,
        y: pos.y,
        width,
        height,
      }

      // Check if position is valid (on canvas and not overlapping)
      const inBounds =
        pos.x - width / 2 > -0.1 &&
        pos.x + width / 2 < 1.1 &&
        pos.y - height / 2 > -0.1 &&
        pos.y + height / 2 < 1.1

      if (inBounds && !checkOverlap(candidate, placed, spacing)) {
        placed.push({
          x: pos.x,
          y: pos.y,
          width,
          height,
          rotation,
          shapeDef,
          layer,
        })
        layerCounts[layer]++
        placed_this = true
        break
      }
    }

    // If we couldn't place after max attempts, allow overlap for this shape
    if (!placed_this && placed.length < targetCount * 0.8) {
      const pos = generateFocalPosition(rng, composition.focalPoint, 0.2)
      placed.push({
        x: pos.x,
        y: pos.y,
        width,
        height,
        rotation,
        shapeDef,
        layer,
      })
      layerCounts[layer]++
    }
  }

  // Sort by layer (back to front) for proper rendering order
  placed.sort((a, b) => a.layer - b.layer)

  return {
    shapes: placed,
    seed: rng.getSeed(),
  }
}

// ============================================================================
// MANDALA-SPECIFIC PLACEMENT
// ============================================================================

export interface MandalaOptions {
  /** Shape definitions to use */
  shapeDefs: ThemeShapeDefinition[]
  /** Number of rings/layers */
  rings: number
  /** Shapes per ring (multiplied by ring number) */
  shapesPerRing: number
  /** Size multiplier */
  sizeMultiplier: number
  /** Random seed */
  seed?: number
}

/**
 * Generate shapes arranged in a mandala pattern
 * Radially symmetric with concentric rings
 */
export function generateMandalaPlacement(options: MandalaOptions): {
  shapes: PlacedShape[]
  seed: number
} {
  const { shapeDefs, rings, shapesPerRing, sizeMultiplier, seed } = options
  const rng = new SeededRandom(seed)
  const placed: PlacedShape[] = []

  const centerX = 0.5
  const centerY = 0.5
  const maxRadius = 0.4 // Leave margin

  for (let ring = 0; ring < rings; ring++) {
    // Each ring gets more shapes (or you could keep it constant)
    const shapesInRing = Math.floor(shapesPerRing * (ring + 1))
    const ringRadius = maxRadius * ((ring + 1) / rings)
    const angleStep = (2 * Math.PI) / shapesInRing

    // Pick a shape type for this ring (same for symmetry)
    const shapeDef = rng.weightedPick(shapeDefs)

    // Size decreases as rings go outward
    const ringSizeMultiplier = sizeMultiplier * (1 - ring * 0.15)
    const baseSize = rng.between(shapeDef.sizeRange.min, shapeDef.sizeRange.max)
    const size = baseSize * ringSizeMultiplier

    for (let i = 0; i < shapesInRing; i++) {
      const angle = angleStep * i - Math.PI / 2 // Start from top
      const x = centerX + Math.cos(angle) * ringRadius
      const y = centerY + Math.sin(angle) * ringRadius

      // Rotation points outward from center
      const rotation = shapeDef.canRotate ? angle + Math.PI / 2 : 0

      placed.push({
        x,
        y,
        width: size,
        height: size,
        rotation,
        shapeDef,
        layer: ring, // Ring number as layer
      })
    }
  }

  return {
    shapes: placed,
    seed: rng.getSeed(),
  }
}

// ============================================================================
// GRID PATTERN PLACEMENT
// ============================================================================

export interface GridOptions {
  /** Shape definitions to use */
  shapeDefs: ThemeShapeDefinition[]
  /** Number of columns */
  cols: number
  /** Number of rows */
  rows: number
  /** Size multiplier */
  sizeMultiplier: number
  /** Add slight randomness to positions */
  jitter: number
  /** Random seed */
  seed?: number
}

/**
 * Generate shapes in a grid pattern with optional jitter
 */
export function generateGridPlacement(options: GridOptions): {
  shapes: PlacedShape[]
  seed: number
} {
  const { shapeDefs, cols, rows, sizeMultiplier, jitter, seed } = options
  const rng = new SeededRandom(seed)
  const placed: PlacedShape[] = []

  const marginX = 0.1
  const marginY = 0.1
  const cellWidth = (1 - 2 * marginX) / cols
  const cellHeight = (1 - 2 * marginY) / rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const shapeDef = rng.weightedPick(shapeDefs)

      // Base position at cell center
      let x = marginX + cellWidth * (col + 0.5)
      let y = marginY + cellHeight * (row + 0.5)

      // Add jitter
      x += rng.between(-jitter, jitter) * cellWidth
      y += rng.between(-jitter, jitter) * cellHeight

      // Size fits within cell
      const maxCellSize = Math.min(cellWidth, cellHeight) * 0.8
      const baseSize = rng.between(shapeDef.sizeRange.min, shapeDef.sizeRange.max)
      const size = Math.min(baseSize * sizeMultiplier, maxCellSize)

      const rotation = generateRotation(shapeDef, rng)

      placed.push({
        x,
        y,
        width: size,
        height: size,
        rotation,
        shapeDef,
        layer: 0,
      })
    }
  }

  return {
    shapes: placed,
    seed: rng.getSeed(),
  }
}
