# Magic Generator - Technical Documentation

## Overview

The Magic Generator creates themed, well-composed coloring pages with intentional layouts instead of random shape scatter. It supports multiple themes, styles, and difficulty levels.

## Architecture

### Type System (`src/types/generator.ts`)

```typescript
// Core configuration types
type GeneratorTheme = 'sea' | 'space' | 'garden' | 'fantasy' | 'random'
type GeneratorStyle = 'scene' | 'mandala' | 'pattern' | 'freeform'
type GeneratorDifficulty = 'toddler' | 'kid' | 'teen' | 'adult'

interface MagicGeneratorConfig {
  theme: GeneratorTheme
  style: GeneratorStyle
  difficulty: GeneratorDifficulty
  composition: CompositionRules
}
```

### Theme System (`src/data/themeShapes.ts`)

Each theme defines:
- **Shape palette** - Which shapes appear and their characteristics
- **Size ranges** - How large shapes can be relative to canvas
- **Layer preferences** - Background, midground, or foreground placement
- **Weights** - How frequently each shape appears
- **Rotation constraints** - Whether and how much shapes can rotate

#### Available Themes

| Theme | Icon | Primary Shapes | Style |
|-------|------|----------------|-------|
| Sea | 🌊 | Fish (ovals), bubbles, stars, shells | Underwater world |
| Space | 🚀 | Planets, stars, rockets, moons | Cosmic adventure |
| Garden | 🌸 | Flowers, butterflies, leaves, sun | Beautiful nature |
| Fantasy | 🏰 | Castles, gems, stars, hearts | Magical kingdom |
| Random | 🎲 | Mix of all basic shapes | Creative variety |

### Difficulty Parameters

| Level | Ages | Shape Count | Size | Details |
|-------|------|-------------|------|---------|
| Toddler | 2-4 | 6-12 | Large (1.5x) | Simple, big regions |
| Kid | 5-8 | 12-25 | Medium (1.2x) | Recognizable shapes |
| Teen | 9-14 | 25-45 | Normal (1x) | Some detail |
| Adult | 15+ | 40-75 | Small (0.8x) | Intricate |

### Composition System (`src/utils/compositionRules.ts`)

#### Key Algorithms

1. **Placement Algorithm** - Places shapes with:
   - Focal point bias (shapes cluster toward center of interest)
   - Layer-based depth (background, midground, foreground)
   - Collision avoidance with configurable spacing
   - Weighted random selection

2. **Mandala Generator** - Creates radially symmetric patterns:
   - Concentric rings of shapes
   - Same shape type per ring for symmetry
   - Size decreases toward outer rings

3. **Grid Generator** - Organized grid patterns:
   - Configurable rows and columns
   - Optional position jitter for natural feel
   - Size fits within grid cells

#### Seeded Random

All generation uses a seeded PRNG for reproducibility:

```typescript
const rng = new SeededRandom(seed)
// Generate with same seed = same result
```

### Shape Generator (`src/utils/themedGenerator.ts`)

Main entry point:

```typescript
function generateThemedShapes(
  config: MagicGeneratorConfig,
  seed?: number
): GenerationResult

// Quick usage
function quickGenerate(
  theme: GeneratorTheme,
  difficulty: GeneratorDifficulty,
  seed?: number
): GenerationResult
```

## UI Components

### MagicGenerator.vue

The main generator panel with:
- **Theme selector** - Grid of themed buttons with icons
- **Style selector** - Scene, Mandala, Pattern, or Freeform
- **Difficulty selector** - 4 levels with age guidance
- **Shape count indicator** - Shows estimated output
- **Generate button** - Triggers generation

### GeneratorPreview.vue (Future)

Preview modal for:
- Showing generated result before applying
- "Try Again" button for regeneration
- "Use This" to apply to canvas

## Store Integration

The drawing store has a new action:

```typescript
// In drawingStore.ts
applyGenerationResult(result: GenerationResult) {
  // Creates undo point
  // Clears canvas
  // Applies generated shapes
}
```

## Flow Diagram

```
User selects: Theme → Style → Difficulty
        ↓
Click "Generate!"
        ↓
MagicGenerator emits 'generate' event
        ↓
If canvas has content → Show confirmation dialog
        ↓
applyGenerationResult(result)
        ↓
Shapes appear on canvas (can undo)
```

## Extending the System

### Adding a New Theme

1. Create theme definition in `themeShapes.ts`:

```typescript
export const newTheme: ThemeDefinition = {
  id: 'newtheme',
  name: '🎯 New Theme',
  description: 'Description here',
  previewColors: ['#color1', '#color2'],
  backgroundStyle: 'plain',
  shapes: [
    createShapeDef('circle', { weight: 3 }),
    // ... more shapes
  ],
}
```

2. Add to registry:

```typescript
export const themeRegistry = {
  // ... existing
  newtheme: newTheme,
}
```

3. Add display info:

```typescript
export const themeDisplayInfo = [
  // ... existing
  { id: 'newtheme', name: 'New', icon: '🎯', description: 'Your theme' },
]
```

4. Update type in `generator.ts`:

```typescript
type GeneratorTheme = 'sea' | 'space' | 'garden' | 'fantasy' | 'random' | 'newtheme'
```

### Adding Custom Shapes

The system maps semantic shapes to primitives. To add truly custom shapes:

1. Add new ShapeType to `types/shape.ts`
2. Add rendering logic to `renderShapes.ts`
3. Add to theme shape definitions

## Files Reference

| File | Purpose |
|------|---------|
| `types/generator.ts` | Type definitions |
| `data/themeShapes.ts` | Theme definitions and display info |
| `utils/compositionRules.ts` | Layout algorithms |
| `utils/themedGenerator.ts` | Main generation logic |
| `components/MagicGenerator.vue` | UI component |
| `components/GeneratorPreview.vue` | Preview modal |

