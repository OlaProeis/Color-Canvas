/**
 * Themed Shape Generator
 *
 * Main generator that creates themed coloring pages by:
 * 1. Selecting shapes based on theme palettes
 * 2. Applying composition rules for good layouts
 * 3. Converting abstract placements to actual Shape objects
 * 4. Supporting different generation styles (scene, mandala, pattern)
 */

import type {
  Shape,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
} from '@/types/shape'
import type {
  MagicGeneratorConfig,
  GeneratorTheme,
  GeneratorStyle,
  GeneratorDifficulty,
  GenerationResult,
} from '@/types/generator'
import { getTheme, getDifficultyParams } from '@/data/themeShapes'
import {
  placeShapes,
  generateMandalaPlacement,
  generateGridPlacement,
  getDefaultComposition,
  SeededRandom,
  type PlacedShape,
} from './compositionRules'

// ============================================================================
// SHAPE CONVERSION
// ============================================================================

/**
 * Convert a ThemeShapeType to a renderable Shape
 * Handles semantic shapes (oval, diamond, crescent) by mapping to primitives
 */
function convertToShape(placed: PlacedShape, rng: SeededRandom): Shape {
  const { x, y, width, height, rotation, shapeDef } = placed
  const now = Date.now()
  const id = `gen-${now}-${rng.intBetween(1000, 9999)}-${rng.intBetween(100, 999)}`

  const baseProps = {
    id,
    strokeColor: '#000000',
    strokeWidth: 2.5,
    rotation,
    createdAt: now,
    updatedAt: now,
  }

  switch (shapeDef.type) {
    case 'rectangle':
      return createRectangle(x, y, width, height, baseProps)

    case 'circle':
      return createCircle(x, y, Math.min(width, height) / 2, baseProps)

    case 'triangle':
      return createTriangle(x, y, width, height, baseProps)

    case 'star':
      return createStar(x, y, Math.min(width, height) / 2, baseProps, rng)

    case 'heart':
      return createHeart(x, y, width, height, baseProps)

    case 'oval':
      // Oval = elongated circle (we use an actual ellipse via rectangle-like logic)
      // For now, render as a wide/tall circle - the aspect ratio makes it look oval
      return createOval(x, y, width, height, baseProps)

    case 'diamond':
      // Diamond = rotated square
      return createDiamond(x, y, Math.min(width, height), baseProps)

    case 'crescent':
      // Crescent = we'll approximate with a heart for now (curved shape)
      // In a full implementation, this would be two overlapping circles
      return createCrescent(x, y, width, height, baseProps)

    case 'ring':
      // Ring = two concentric circles (we'll just use a circle for now)
      return createCircle(x, y, Math.min(width, height) / 2, baseProps)

    case 'wave':
    case 'spiral':
      // Complex shapes - fall back to simpler alternatives
      return createOval(x, y, width, height, baseProps)

    default:
      // Default to rectangle
      return createRectangle(x, y, width, height, baseProps)
  }
}

// ============================================================================
// SHAPE CREATORS
// ============================================================================

interface BaseShapeProps {
  id: string
  strokeColor: string
  strokeWidth: number
  rotation: number
  createdAt: number
  updatedAt: number
}

function createRectangle(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  base: BaseShapeProps
): RectangleShape {
  return {
    ...base,
    type: 'rectangle',
    // Convert from center to top-left (relative coords)
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}

function createCircle(
  centerX: number,
  centerY: number,
  radius: number,
  base: BaseShapeProps
): CircleShape {
  return {
    ...base,
    type: 'circle',
    x: centerX,
    y: centerY,
    radius,
    rotation: 0, // Circles don't need rotation
  }
}

function createTriangle(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  base: BaseShapeProps
): TriangleShape {
  return {
    ...base,
    type: 'triangle',
    // Triangle x,y is top-left of bounding box
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}

function createStar(
  centerX: number,
  centerY: number,
  outerRadius: number,
  base: BaseShapeProps,
  rng: SeededRandom
): StarShape {
  // Vary star points occasionally for interest
  const points = rng.next() > 0.7 ? rng.intBetween(4, 6) : 5

  return {
    ...base,
    type: 'star',
    x: centerX,
    y: centerY,
    outerRadius,
    innerRadius: outerRadius * 0.4, // Standard star proportions
    points,
  }
}

function createHeart(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  base: BaseShapeProps
): HeartShape {
  return {
    ...base,
    type: 'heart',
    // Heart x,y is top-left of bounding box
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  }
}

/**
 * Create an oval (ellipse) - rendered as a circle with stretched aspect
 * We use the rendering system's understanding of circles
 */
function createOval(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  base: BaseShapeProps
): CircleShape {
  // Use the average as radius, rotation will create visual oval effect
  // This is a simplification - true ovals would need a new shape type
  const radius = Math.max(width, height) / 2
  return {
    ...base,
    type: 'circle',
    x: centerX,
    y: centerY,
    radius,
    rotation: 0,
  }
}

/**
 * Create a diamond (rotated square)
 */
function createDiamond(
  centerX: number,
  centerY: number,
  size: number,
  base: BaseShapeProps
): RectangleShape {
  return {
    ...base,
    type: 'rectangle',
    x: centerX - size / 2,
    y: centerY - size / 2,
    width: size,
    height: size,
    rotation: Math.PI / 4, // 45 degrees
  }
}

/**
 * Create a crescent shape - approximated with a heart for now
 * A proper crescent would require a custom shape type
 */
function createCrescent(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  base: BaseShapeProps
): HeartShape {
  // Use heart as a curved shape approximation
  return {
    ...base,
    type: 'heart',
    x: centerX - width / 2,
    y: centerY - height / 2,
    width: width * 0.8,
    height: height * 0.8,
  }
}

// ============================================================================
// MAIN GENERATOR FUNCTIONS
// ============================================================================

/**
 * Generate shapes for a scene-style composition
 */
function generateSceneShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  const theme = getTheme(config.theme)
  const difficulty = getDifficultyParams(config.difficulty)
  const composition = config.composition

  // Calculate target shape count
  const targetCount = Math.floor(
    difficulty.shapeCount.min +
      Math.random() * (difficulty.shapeCount.max - difficulty.shapeCount.min)
  )

  // Place shapes using composition rules
  const { shapes: placedShapes, seed: usedSeed } = placeShapes({
    shapeDefs: theme.shapes,
    targetCount,
    composition,
    sizeMultiplier: difficulty.sizeMultiplier,
    seed,
  })

  // Convert to actual Shape objects
  const rng = new SeededRandom(usedSeed + 1) // Different seed for shape details
  const shapes: Shape[] = placedShapes.map(placed => convertToShape(placed, rng))

  return {
    shapes,
    metadata: {
      seed: usedSeed,
      theme: config.theme,
      style: config.style,
      difficulty: config.difficulty,
      shapeCount: shapes.length,
      generatedAt: Date.now(),
    },
  }
}

/**
 * Generate shapes in a mandala pattern
 */
function generateMandalaShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  const theme = getTheme(config.theme)
  const difficulty = getDifficultyParams(config.difficulty)

  // Mandala parameters based on difficulty
  const rings =
    config.difficulty === 'toddler'
      ? 2
      : config.difficulty === 'kid'
        ? 3
        : config.difficulty === 'teen'
          ? 4
          : 5

  const shapesPerRing =
    config.difficulty === 'toddler'
      ? 4
      : config.difficulty === 'kid'
        ? 5
        : config.difficulty === 'teen'
          ? 6
          : 8

  const { shapes: placedShapes, seed: usedSeed } = generateMandalaPlacement({
    shapeDefs: theme.shapes,
    rings,
    shapesPerRing,
    sizeMultiplier: difficulty.sizeMultiplier,
    seed,
  })

  const rng = new SeededRandom(usedSeed + 1)
  const shapes: Shape[] = placedShapes.map(placed => convertToShape(placed, rng))

  return {
    shapes,
    metadata: {
      seed: usedSeed,
      theme: config.theme,
      style: config.style,
      difficulty: config.difficulty,
      shapeCount: shapes.length,
      generatedAt: Date.now(),
    },
  }
}

/**
 * Generate shapes in a grid pattern
 */
function generatePatternShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  const theme = getTheme(config.theme)
  const difficulty = getDifficultyParams(config.difficulty)

  // Grid size based on difficulty
  const gridSize =
    config.difficulty === 'toddler'
      ? { cols: 3, rows: 3 }
      : config.difficulty === 'kid'
        ? { cols: 4, rows: 4 }
        : config.difficulty === 'teen'
          ? { cols: 5, rows: 5 }
          : { cols: 6, rows: 6 }

  const { shapes: placedShapes, seed: usedSeed } = generateGridPlacement({
    shapeDefs: theme.shapes,
    cols: gridSize.cols,
    rows: gridSize.rows,
    sizeMultiplier: difficulty.sizeMultiplier,
    jitter: 0.15, // Slight position randomness
    seed,
  })

  const rng = new SeededRandom(usedSeed + 1)
  const shapes: Shape[] = placedShapes.map(placed => convertToShape(placed, rng))

  return {
    shapes,
    metadata: {
      seed: usedSeed,
      theme: config.theme,
      style: config.style,
      difficulty: config.difficulty,
      shapeCount: shapes.length,
      generatedAt: Date.now(),
    },
  }
}

/**
 * Generate shapes in freeform style (improved random)
 */
function generateFreeformShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  // Freeform is like scene but with less strict composition
  const modifiedConfig: MagicGeneratorConfig = {
    ...config,
    composition: {
      ...config.composition,
      layering: false, // No layering
      density: 'medium',
    },
  }

  return generateSceneShapes(modifiedConfig, seed)
}

/**
 * Generate shapes in kaleidoscope pattern - like mandala but with more overlap
 * Creates dense, layered symmetrical patterns
 */
function generateKaleidoscopeShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  const theme = getTheme(config.theme)
  const difficulty = getDifficultyParams(config.difficulty)

  // More rings and shapes per ring for kaleidoscope effect
  const rings =
    config.difficulty === 'toddler'
      ? 3
      : config.difficulty === 'kid'
        ? 4
        : config.difficulty === 'teen'
          ? 5
          : 6

  const shapesPerRing =
    config.difficulty === 'toddler'
      ? 6
      : config.difficulty === 'kid'
        ? 8
        : config.difficulty === 'teen'
          ? 10
          : 12

  // Generate first layer
  const { shapes: placedShapes, seed: usedSeed } = generateMandalaPlacement({
    shapeDefs: theme.shapes,
    rings,
    shapesPerRing,
    sizeMultiplier: difficulty.sizeMultiplier,
    seed,
  })

  // Generate second overlapping layer (rotated slightly)
  const { shapes: overlayShapes } = generateMandalaPlacement({
    shapeDefs: theme.shapes,
    rings: Math.max(2, rings - 1),
    shapesPerRing: Math.max(4, shapesPerRing - 2),
    sizeMultiplier: difficulty.sizeMultiplier * 0.8,
    seed: usedSeed + 100,
  })

  // Rotate overlay shapes by half the angle between shapes
  const rotatedOverlay = overlayShapes.map(shape => ({
    ...shape,
    rotation: shape.rotation + Math.PI / shapesPerRing,
  }))

  const allPlaced = [...placedShapes, ...rotatedOverlay]
  const rng = new SeededRandom(usedSeed + 1)
  const shapes: Shape[] = allPlaced.map(placed => convertToShape(placed, rng))

  return {
    shapes,
    metadata: {
      seed: usedSeed,
      theme: config.theme,
      style: config.style,
      difficulty: config.difficulty,
      shapeCount: shapes.length,
      generatedAt: Date.now(),
    },
  }
}

/**
 * Generate shapes in mosaic pattern - interlocking shapes with overlaps
 * Creates a tessellated look with shapes that interlock
 */
function generateMosaicShapes(config: MagicGeneratorConfig, seed?: number): GenerationResult {
  const theme = getTheme(config.theme)
  const difficulty = getDifficultyParams(config.difficulty)

  // Grid size based on difficulty
  const gridSize =
    config.difficulty === 'toddler'
      ? { cols: 3, rows: 3 }
      : config.difficulty === 'kid'
        ? { cols: 4, rows: 4 }
        : config.difficulty === 'teen'
          ? { cols: 5, rows: 5 }
          : { cols: 6, rows: 6 }

  // Generate base grid
  const { shapes: baseShapes, seed: usedSeed } = generateGridPlacement({
    shapeDefs: theme.shapes,
    cols: gridSize.cols,
    rows: gridSize.rows,
    sizeMultiplier: difficulty.sizeMultiplier * 1.1, // Slightly larger
    jitter: 0.1,
    seed,
  })

  // Generate overlay grid (offset by half cell)
  const { shapes: overlayShapes } = generateGridPlacement({
    shapeDefs: theme.shapes,
    cols: gridSize.cols - 1,
    rows: gridSize.rows - 1,
    sizeMultiplier: difficulty.sizeMultiplier * 0.9,
    jitter: 0.15,
    seed: usedSeed + 50,
  })

  // Offset overlay shapes by half a cell
  const cellWidth = 1 / gridSize.cols
  const cellHeight = 1 / gridSize.rows
  const offsetOverlay = overlayShapes.map(shape => ({
    ...shape,
    x: shape.x + cellWidth / 2,
    y: shape.y + cellHeight / 2,
  }))

  const allPlaced = [...baseShapes, ...offsetOverlay]
  const rng = new SeededRandom(usedSeed + 1)
  const shapes: Shape[] = allPlaced.map(placed => convertToShape(placed, rng))

  return {
    shapes,
    metadata: {
      seed: usedSeed,
      theme: config.theme,
      style: config.style,
      difficulty: config.difficulty,
      shapeCount: shapes.length,
      generatedAt: Date.now(),
    },
  }
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate a themed coloring page
 *
 * This is the main entry point for the Magic Generator.
 * It coordinates theme selection, composition, and shape generation.
 *
 * @param config - Generation configuration
 * @param seed - Optional seed for reproducible results
 * @returns Generated shapes and metadata
 */
export function generateThemedShapes(
  config: MagicGeneratorConfig,
  seed?: number
): GenerationResult {
  switch (config.style) {
    case 'mandala':
      return generateMandalaShapes(config, seed)
    case 'kaleidoscope':
      return generateKaleidoscopeShapes(config, seed)
    case 'pattern':
      return generatePatternShapes(config, seed)
    case 'mosaic':
      return generateMosaicShapes(config, seed)
    case 'freeform':
      return generateFreeformShapes(config, seed)
    case 'scene':
    default:
      return generateSceneShapes(config, seed)
  }
}

/**
 * Create a default configuration
 */
export function createDefaultConfig(
  theme: GeneratorTheme = 'random',
  style: GeneratorStyle = 'scene',
  difficulty: GeneratorDifficulty = 'kid'
): MagicGeneratorConfig {
  return {
    theme,
    style,
    difficulty,
    composition: getDefaultComposition(style),
  }
}

/**
 * Quick generate with defaults - for backward compatibility
 */
export function quickGenerate(
  theme: GeneratorTheme = 'random',
  difficulty: GeneratorDifficulty = 'kid',
  seed?: number
): GenerationResult {
  const config = createDefaultConfig(theme, 'scene', difficulty)
  return generateThemedShapes(config, seed)
}
