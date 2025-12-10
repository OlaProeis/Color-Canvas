# Background Layer System

## Overview

The background layer system allows users to set decorative backgrounds that render behind all shapes and fills. It supports solid colors, gradients, illustrated scenes, and gentle animations.

**Key Innovation:** The system uses a **Dual Canvas Architecture** to completely separate background rendering from shape/fill rendering, solving fundamental conflicts between animated backgrounds and the flood fill algorithm.

## Background Types

| Type | Description | Use Case |
|------|-------------|----------|
| **None** | Plain white canvas | Default, clean coloring surface |
| **Solid** | Single color fill | Simple colored backgrounds |
| **Gradient** | Linear or radial gradients | Sky, sunset, underwater effects |
| **Scene** | Illustrated static scenes | Grass-sky, clouds, night-sky, space |
| **Animated** | Gentle moving backgrounds | Waves, stars, floating clouds, bubbles |

## Dual Canvas Architecture

### The Problem

Animated backgrounds and flood fill don't work well together:

1. **Flood fill is pixel-based** - It samples the color at a point and fills similar colors
2. **Animations constantly change pixels** - Every frame has different colors
3. **Result:** Fill either fails (can't find boundaries) or fills everything

### The Solution

Two stacked canvas elements, each with a single responsibility:

```
┌─────────────────────────────────────────────────────────┐
│                Canvas Transform Wrapper                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │        Drawing Canvas (z-index: 2)                 │ │
│  │        ─────────────────────────────               │ │
│  │        • Shapes and strokes                        │ │
│  │        • Flood fills                               │ │
│  │        • WHITE background for fill algorithm       │ │
│  │        • Converted to transparent for display      │ │
│  ├────────────────────────────────────────────────────┤ │
│  │        Background Canvas (z-index: 1)              │ │
│  │        ─────────────────────────────               │ │
│  │        • Static or animated backgrounds            │ │
│  │        • Never touched by drawing tools            │ │
│  │        • Animation loop only updates this          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Canvas Configuration

```typescript
// Background canvas - opaque for better performance
bgCtx = bgCanvasRef.getContext('2d', { alpha: false })

// Drawing canvas - needs transparency
ctx = canvasRef.getContext('2d', { alpha: true })
```

## White-to-Transparent Conversion

### The Challenge

The flood fill algorithm requires an opaque background (white) to work correctly. But for the background layer to show through, the drawing canvas needs transparency.

Additionally, **light-colored fills** (pink, light blue, white, etc.) would become semi-transparent if we naively convert based on "whiteness" - we need to preserve them.

### The Solution: Fill Mask + Alpha Un-premultiplication

The system uses a **fill mask** to track which pixels were filled, then converts white to transparent while preserving filled areas:

```typescript
function convertWhiteToTransparent() {
  const imageData = ctx.getImageData(0, 0, physicalWidth, physicalHeight)
  const data = imageData.data
  const mask = fillMask.value  // Uint8Array tracking filled pixels

  for (let i = 0; i < data.length; i += 4) {
    const pixelIdx = i / 4
    
    // CRITICAL: Skip pixels in fill mask - keep them fully opaque!
    // This preserves light-colored fills (pink, white, etc.)
    if (mask && mask[pixelIdx] === 1) {
      continue
    }

    const r = data[i], g = data[i + 1], b = data[i + 2]

    // Calculate how much white is blended in
    const whiteAmount = Math.min(r, g, b)
    
    // New alpha is inverse of white amount
    const newAlpha = 255 - whiteAmount

    if (newAlpha === 0) {
      // Pure white → fully transparent
      data[i + 3] = 0
    } else if (newAlpha < 255) {
      // Un-premultiply: reconstruct original color
      data[i] = Math.round((r - whiteAmount) * (255 / newAlpha))
      data[i + 1] = Math.round((g - whiteAmount) * (255 / newAlpha))
      data[i + 2] = Math.round((b - whiteAmount) * (255 / newAlpha))
      data[i + 3] = newAlpha
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
}
```

### Why the Fill Mask is Critical

Without the fill mask, a light pink fill `rgb(255, 200, 200)`:
- `whiteAmount = min(255, 200, 200) = 200`
- `newAlpha = 255 - 200 = 55` (78% transparent!)

With the fill mask, the pixel is skipped entirely and stays fully opaque.

### Why Alpha Math Works

When you draw black on white with anti-aliasing, edge pixels become gray (e.g., `rgb(200, 200, 200)`). This gray is actually semi-transparent black blended with white:

```
result = alpha × foreground + (1 - alpha) × white
gray(200) = alpha × black(0) + (1 - alpha) × white(255)
alpha = (255 - 200) / 255 = 0.216

So rgb(200, 200, 200) → rgba(0, 0, 0, 0.216)
```

## Rendering Pipeline

### Static Backgrounds

```
rebuildBaseState():
  1. Reset fill mask (create/clear Uint8Array)
  2. Fill drawing canvas with WHITE
  3. Render all shapes (creates boundaries)
  4. Replay all flood fills (updates fill mask)
  5. Render strokes on top of fills
  6. Save to baseStateCache (WHITE background)
  7. Mark cache as valid

redraw():
  1. Render background to bgCanvas (uses actual canvas dimensions)
  2. If cache invalid → rebuildBaseState()
  3. Restore baseStateCache to drawing canvas
  4. Draw preview shapes (if drawing)
  5. convertWhiteToTransparent() - respects fill mask!

renderBackgroundLayer():
  1. Reset transform to identity
  2. Apply DPR scale
  3. Clear entire canvas
  4. Render background (solid, gradient, scene, or animated)
```

### Dimension Consistency

All rendering functions use **actual canvas element dimensions** instead of DOM-based calculations:

```typescript
// Ensures consistency across all operations
const physicalWidth = canvasRef.value.width
const physicalHeight = canvasRef.value.height
const width = physicalWidth / dpr
const height = physicalHeight / dpr
```

This prevents dimension mismatches between the fill mask, cache, and canvas rendering.

### Animated Backgrounds

```
Animation Loop (24 FPS):
  1. Update animation time
  2. renderBackgroundLayer() - updates bgCanvas only
  3. Drawing canvas unchanged (efficient!)

User Interaction:
  → Triggers normal redraw() on drawing canvas
  → Background continues animating independently
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/background.ts` | Type definitions and preset data |
| `src/utils/backgroundRenderer.ts` | All background rendering functions |
| `src/components/BackgroundSelector.vue` | UI for selecting backgrounds |
| `src/components/Canvas.vue` | Dual canvas implementation |
| `src/stores/drawingStore.ts` | Background state management |

## State Management

### Store Structure

```typescript
// drawingStore.ts
state: {
  background: {
    type: 'none' | 'solid' | 'gradient' | 'scene' | 'animated',
    // type-specific config...
  }
}

actions: {
  setBackground(config: BackgroundConfig)
  resetBackground()
}
```

### History Integration

Background changes are tracked in history:

```typescript
interface HistoryEntry {
  // ... other fields
  backgroundSnapshot?: BackgroundConfig
}
```

## Available Presets

### Solid Colors
- Off-white, Soft Blue, Pale Yellow, Light Pink, Mint Green, Lavender

### Gradients
- Sunrise (orange → yellow)
- Sunset (purple → orange → yellow)
- Ocean (dark blue → light blue)
- Rainbow (pastel spectrum)
- Sky (light blue → white)

### Scenes
- Grass & Sky - Green hills with blue sky
- Underwater - Blue depths with coral and seaweed
- Clouds - Fluffy white clouds on blue sky
- Sunset - Orange/purple sky with silhouettes
- Night Sky - Dark sky with stars and moon
- Space - Stars, nebulae, and planets

### Animated
- Waves - Gentle sine-wave ocean
- Twinkle Stars - Oscillating star opacity
- Floating Clouds - Slow-drifting clouds
- Bubbles - Rising bubbles
- Space Journey - Moving stars and nebulae

## Performance Considerations

### Animation Frame Rate
- Target: 24 FPS (gentle, not distracting)
- Only background canvas updates during animation
- Drawing canvas cached, restored instantly

### Memory Usage
- `baseStateCache` stores drawing canvas ImageData
- Background canvas has `alpha: false` (less memory)
- Animation state is minimal (just time value)

### Optimization Opportunities
- `convertWhiteToTransparent()` runs every redraw
- Could be optimized with WebGL or OffscreenCanvas
- Consider caching for static backgrounds

## Export (Save as PNG)

The `getCompositeImageData()` function combines both canvases:

```typescript
getCompositeImageData(): ImageData | null {
  // Create temporary canvas
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  
  // Draw background first
  tempCtx.drawImage(bgCanvas, 0, 0)
  
  // Draw shapes on top (already transparent)
  tempCtx.drawImage(canvas, 0, 0)
  
  return tempCtx.getImageData(0, 0, width, height)
}
```

## Flood Fill Compatibility

The flood fill algorithm was updated to handle transparent pixels:

```typescript
// floodFill.ts
function isStrokeColor(r, g, b, a) {
  // Transparent pixels are NOT strokes
  if (a < 128) return false
  
  // Only pure black is a stroke
  return r < 20 && g < 20 && b < 20
}
```

## UI Component

The `BackgroundSelector.vue` component provides:

- Type buttons (None, Solid, Gradient, Scene, Animated)
- Visual preset thumbnails using CSS previews
- Integration with drawing store
- Collapsible sidebar section

```vue
<BackgroundSelector />
```

## Testing Checklist

### Basic Functionality
- [ ] All 5 background types render correctly
- [ ] Drawing works on all background types
- [ ] Fill tool works on animated backgrounds
- [ ] Undo/redo restores background state
- [ ] Canvas resize updates both canvases
- [ ] Export includes background
- [ ] No white fringes on dark backgrounds
- [ ] Animations are smooth (24 FPS)
- [ ] Memory usage is stable over time

### Fill + Background Integration
- [ ] Multiple fills stay opaque (don't become transparent)
- [ ] Light-colored fills (pink, white, light blue) remain fully visible
- [ ] Deleting shapes doesn't affect background
- [ ] Deleting filled shapes doesn't corrupt background
- [ ] Background stays intact after undo/redo operations
- [ ] Fill mask is properly reset on canvas resize

