/**
 * Theme Shape Definitions
 *
 * Defines the shape palettes, weights, and characteristics for each
 * generation theme. These determine what shapes appear and how they
 * look in each themed coloring page.
 */

import type {
  ThemeDefinition,
  ThemeShapeDefinition,
  DifficultyParams,
  GeneratorDifficulty,
  GeneratorTheme,
} from '@/types/generator'

// ============================================================================
// HELPER: Create shape definition with defaults
// ============================================================================

function createShapeDef(
  type: ThemeShapeDefinition['type'],
  overrides: Partial<ThemeShapeDefinition> = {}
): ThemeShapeDefinition {
  return {
    type,
    sizeRange: { min: 0.08, max: 0.25 },
    aspectRange: { min: 0.7, max: 1.3 },
    canRotate: true,
    maxRotation: Math.PI / 6, // 30 degrees
    layerPreference: 'any',
    weight: 1,
    ...overrides,
  }
}

// ============================================================================
// SEA THEME
// ============================================================================

export const seaTheme: ThemeDefinition = {
  id: 'sea',
  name: '🌊 Ocean',
  description: 'Underwater world with fish, shells, and coral',
  previewColors: ['#87CEEB', '#4169E1', '#00CED1', '#F0E68C', '#FF7F50', '#40E0D0'],
  backgroundStyle: 'gradient',
  shapes: [
    // Fish bodies (ovals in various sizes)
    createShapeDef('oval', {
      sizeRange: { min: 0.1, max: 0.3 },
      aspectRange: { min: 1.5, max: 2.5 }, // Elongated
      weight: 3,
      layerPreference: 'midground',
    }),
    // Shells (fan-shaped triangles)
    createShapeDef('triangle', {
      sizeRange: { min: 0.06, max: 0.15 },
      aspectRange: { min: 0.8, max: 1.2 },
      weight: 2,
      layerPreference: 'foreground',
    }),
    // Bubbles
    createShapeDef('circle', {
      sizeRange: { min: 0.03, max: 0.1 },
      canRotate: false,
      weight: 4,
      layerPreference: 'any',
    }),
    // Starfish
    createShapeDef('star', {
      sizeRange: { min: 0.08, max: 0.18 },
      weight: 2,
      layerPreference: 'foreground',
    }),
    // Coral branches (rectangles)
    createShapeDef('rectangle', {
      sizeRange: { min: 0.05, max: 0.15 },
      aspectRange: { min: 0.3, max: 0.6 }, // Tall and thin
      weight: 2,
      layerPreference: 'background',
    }),
    // Hearts (decorative sea hearts)
    createShapeDef('heart', {
      sizeRange: { min: 0.05, max: 0.12 },
      weight: 1,
      layerPreference: 'foreground',
    }),
    // Wave elements (curved lines via crescent)
    createShapeDef('crescent', {
      sizeRange: { min: 0.15, max: 0.4 },
      aspectRange: { min: 2, max: 4 },
      weight: 1,
      layerPreference: 'background',
    }),
  ],
}

// ============================================================================
// SPACE THEME
// ============================================================================

export const spaceTheme: ThemeDefinition = {
  id: 'space',
  name: '🚀 Space',
  description: 'Cosmic adventure with planets, stars, and rockets',
  previewColors: ['#1a1a2e', '#16213e', '#FFD700', '#FF6B6B', '#9333EA', '#22D3EE'],
  backgroundStyle: 'pattern', // Starfield dots
  shapes: [
    // Planets (various sized circles)
    createShapeDef('circle', {
      sizeRange: { min: 0.12, max: 0.35 },
      canRotate: false,
      weight: 3,
      layerPreference: 'midground',
    }),
    // Stars (5-pointed)
    createShapeDef('star', {
      sizeRange: { min: 0.05, max: 0.2 },
      weight: 5,
      layerPreference: 'any',
    }),
    // Rocket bodies (tall rectangles)
    createShapeDef('rectangle', {
      sizeRange: { min: 0.1, max: 0.25 },
      aspectRange: { min: 0.3, max: 0.5 }, // Tall
      weight: 2,
      layerPreference: 'midground',
    }),
    // Rocket fins (triangles)
    createShapeDef('triangle', {
      sizeRange: { min: 0.05, max: 0.12 },
      weight: 2,
      layerPreference: 'midground',
    }),
    // Moons (crescents)
    createShapeDef('crescent', {
      sizeRange: { min: 0.08, max: 0.2 },
      weight: 2,
      layerPreference: 'background',
    }),
    // Asteroid shapes (diamonds)
    createShapeDef('diamond', {
      sizeRange: { min: 0.05, max: 0.12 },
      weight: 2,
      layerPreference: 'foreground',
    }),
    // Planet rings (ovals)
    createShapeDef('oval', {
      sizeRange: { min: 0.2, max: 0.4 },
      aspectRange: { min: 2, max: 3 },
      weight: 1,
      layerPreference: 'midground',
    }),
  ],
}

// ============================================================================
// GARDEN THEME
// ============================================================================

export const gardenTheme: ThemeDefinition = {
  id: 'garden',
  name: '🌸 Garden',
  description: 'Beautiful garden with flowers, butterflies, and sunshine',
  previewColors: ['#86EFAC', '#FDE047', '#F472B6', '#A78BFA', '#FB923C', '#38BDF8'],
  backgroundStyle: 'gradient',
  shapes: [
    // Flower centers
    createShapeDef('circle', {
      sizeRange: { min: 0.05, max: 0.15 },
      canRotate: false,
      weight: 3,
      layerPreference: 'midground',
    }),
    // Flower petals (ovals around center)
    createShapeDef('oval', {
      sizeRange: { min: 0.04, max: 0.12 },
      aspectRange: { min: 1.5, max: 2.5 },
      weight: 5,
      layerPreference: 'midground',
    }),
    // Butterfly wings (hearts)
    createShapeDef('heart', {
      sizeRange: { min: 0.06, max: 0.15 },
      weight: 3,
      layerPreference: 'foreground',
    }),
    // Sun rays (triangles)
    createShapeDef('triangle', {
      sizeRange: { min: 0.08, max: 0.2 },
      aspectRange: { min: 0.5, max: 0.8 },
      weight: 2,
      layerPreference: 'background',
    }),
    // Leaves (ovals)
    createShapeDef('oval', {
      sizeRange: { min: 0.05, max: 0.15 },
      aspectRange: { min: 2, max: 3 },
      weight: 3,
      layerPreference: 'background',
    }),
    // Stars (sparkles)
    createShapeDef('star', {
      sizeRange: { min: 0.03, max: 0.08 },
      weight: 2,
      layerPreference: 'foreground',
    }),
    // Clouds (overlapping circles concept - use ovals)
    createShapeDef('oval', {
      sizeRange: { min: 0.15, max: 0.3 },
      aspectRange: { min: 1.5, max: 2.5 },
      weight: 1,
      layerPreference: 'background',
    }),
  ],
}

// ============================================================================
// FANTASY THEME
// ============================================================================

export const fantasyTheme: ThemeDefinition = {
  id: 'fantasy',
  name: '🏰 Fantasy',
  description: 'Magical kingdom with castles, unicorns, and dragons',
  previewColors: ['#A78BFA', '#F472B6', '#FFD700', '#60A5FA', '#34D399', '#FB923C'],
  backgroundStyle: 'gradient',
  shapes: [
    // Castle towers (rectangles)
    createShapeDef('rectangle', {
      sizeRange: { min: 0.1, max: 0.25 },
      aspectRange: { min: 0.3, max: 0.5 }, // Tall towers
      weight: 2,
      layerPreference: 'background',
    }),
    // Castle turret tops (triangles)
    createShapeDef('triangle', {
      sizeRange: { min: 0.05, max: 0.15 },
      aspectRange: { min: 0.8, max: 1.2 },
      weight: 3,
      layerPreference: 'background',
    }),
    // Magic stars
    createShapeDef('star', {
      sizeRange: { min: 0.05, max: 0.18 },
      weight: 4,
      layerPreference: 'any',
    }),
    // Hearts (love/magic)
    createShapeDef('heart', {
      sizeRange: { min: 0.06, max: 0.15 },
      weight: 3,
      layerPreference: 'foreground',
    }),
    // Gems (diamonds)
    createShapeDef('diamond', {
      sizeRange: { min: 0.05, max: 0.12 },
      weight: 3,
      layerPreference: 'foreground',
    }),
    // Sun/moon (circles)
    createShapeDef('circle', {
      sizeRange: { min: 0.1, max: 0.25 },
      canRotate: false,
      weight: 2,
      layerPreference: 'background',
    }),
    // Dragon wings (triangles)
    createShapeDef('triangle', {
      sizeRange: { min: 0.1, max: 0.2 },
      aspectRange: { min: 1.2, max: 2 },
      weight: 1,
      layerPreference: 'midground',
    }),
    // Magical swirls (crescents)
    createShapeDef('crescent', {
      sizeRange: { min: 0.08, max: 0.2 },
      weight: 2,
      layerPreference: 'foreground',
    }),
  ],
}

// ============================================================================
// RANDOM/MIX THEME
// ============================================================================

export const randomTheme: ThemeDefinition = {
  id: 'random',
  name: '🎲 Mix',
  description: 'A fun mix of all shapes for creative coloring',
  previewColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  backgroundStyle: 'plain',
  shapes: [
    createShapeDef('rectangle', { weight: 3 }),
    createShapeDef('circle', { weight: 3, canRotate: false }),
    createShapeDef('triangle', { weight: 3 }),
    createShapeDef('star', { weight: 3 }),
    createShapeDef('heart', { weight: 3 }),
    createShapeDef('oval', { weight: 2, aspectRange: { min: 1.3, max: 2 } }),
    createShapeDef('diamond', { weight: 2 }),
  ],
}

// ============================================================================
// THEME REGISTRY
// ============================================================================

export const themeRegistry: Record<GeneratorTheme, ThemeDefinition> = {
  sea: seaTheme,
  space: spaceTheme,
  garden: gardenTheme,
  fantasy: fantasyTheme,
  random: randomTheme,
}

export function getTheme(themeId: GeneratorTheme): ThemeDefinition {
  return themeRegistry[themeId]
}

export function getAllThemes(): ThemeDefinition[] {
  return Object.values(themeRegistry)
}

// ============================================================================
// DIFFICULTY PARAMETERS
// ============================================================================

export const difficultyParams: Record<GeneratorDifficulty, DifficultyParams> = {
  toddler: {
    shapeCount: { min: 6, max: 12 },
    sizeMultiplier: 1.5, // Larger shapes
    minRegionSize: 0.08, // 8% of canvas minimum
    shapeComplexity: 'simple',
    includeDetails: false,
  },
  kid: {
    shapeCount: { min: 12, max: 25 },
    sizeMultiplier: 1.2,
    minRegionSize: 0.05, // 5% minimum
    shapeComplexity: 'medium',
    includeDetails: false,
  },
  teen: {
    shapeCount: { min: 25, max: 45 },
    sizeMultiplier: 1.0,
    minRegionSize: 0.03, // 3% minimum
    shapeComplexity: 'medium',
    includeDetails: true,
  },
  adult: {
    shapeCount: { min: 40, max: 75 },
    sizeMultiplier: 0.8, // Smaller shapes
    minRegionSize: 0.02, // 2% minimum
    shapeComplexity: 'detailed',
    includeDetails: true,
  },
}

export function getDifficultyParams(difficulty: GeneratorDifficulty): DifficultyParams {
  return difficultyParams[difficulty]
}

// ============================================================================
// THEME DISPLAY INFO
// ============================================================================

export interface ThemeDisplayInfo {
  id: GeneratorTheme
  name: string
  icon: string
  description: string
}

export const themeDisplayInfo: ThemeDisplayInfo[] = [
  { id: 'sea', name: 'Ocean', icon: '🌊', description: 'Fish, shells, coral' },
  { id: 'space', name: 'Space', icon: '🚀', description: 'Planets, stars, rockets' },
  { id: 'garden', name: 'Garden', icon: '🌸', description: 'Flowers, butterflies' },
  { id: 'fantasy', name: 'Fantasy', icon: '🏰', description: 'Castles, unicorns' },
  { id: 'random', name: 'Mix', icon: '🎲', description: 'All shapes' },
]

export interface StyleDisplayInfo {
  id: import('@/types/generator').GeneratorStyle
  name: string
  icon: string
  description: string
}

export const styleDisplayInfo: StyleDisplayInfo[] = [
  { id: 'mandala', name: 'Mandala', icon: '🔷', description: 'Circular symmetry' },
  { id: 'kaleidoscope', name: 'Kaleidoscope', icon: '❄️', description: 'Overlapping symmetry' },
]

export interface DetailDisplayInfo {
  id: GeneratorDifficulty
  name: string
  icon: string
  description: string
}

export const detailDisplayInfo: DetailDisplayInfo[] = [
  { id: 'toddler', name: 'Simple', icon: '⭐', description: 'Few large shapes' },
  { id: 'kid', name: 'Easy', icon: '🌟', description: 'Medium shapes' },
  { id: 'teen', name: 'Medium', icon: '✨', description: 'More shapes' },
  { id: 'adult', name: 'Detailed', icon: '💫', description: 'Many shapes' },
]

// Keep old name for backwards compatibility
export const difficultyDisplayInfo = detailDisplayInfo
