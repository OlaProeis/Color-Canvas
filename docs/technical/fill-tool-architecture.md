# Fill Tool Architecture

## Overview

The fill tool allows users to color regions on the canvas by clicking. It uses a **hybrid approach** combining:
- **Relative coordinate system** for shape storage (ensures resize persistence)
- **Pixel-based flood fill** for visual boundary detection (respects overlapping shapes)
- **Fill replay on redraw** to maintain fills through canvas resize/zoom

## Key Design Decisions

### Why Relative Coordinates?

Shapes are stored using relative coordinates (0-1) instead of absolute pixels:

```typescript
// Shape coordinates are percentages of canvas dimensions
interface RectangleShape {
  x: number      // e.g., 0.125 (12.5% from left)
  y: number      // e.g., 0.25 (25% from top)
  width: number  // e.g., 0.25 (25% of canvas width)
  height: number // e.g., 0.167 (16.7% of canvas height)
}
```

**Benefits:**
- Shapes scale correctly when canvas resizes
- Works across different screen sizes and DPRs
- Enables future features like export at different resolutions

### Why Pixel-Based Flood Fill?

While shapes use relative coordinates, fills use pixel-based flood fill because:
- It naturally respects visual boundaries from overlapping shapes
- Users expect "coloring book" behavior where only the clicked region fills
- Overlapping shapes create multiple distinct fillable regions

### Why Store Fills as Click Points?

Fills are stored as click points with relative coordinates, not as pixel data:

```typescript
interface FillPoint {
  id: string
  x: number      // Relative X (0-1)
  y: number      // Relative Y (0-1)
  color: string  // Fill color
}
```

**On each redraw:**
1. Render all shapes (creates visual boundaries)
2. Replay each fill at its relative position using flood fill
3. Re-render strokes on top (covers anti-aliasing artifacts)

This approach ensures fills persist through resize while respecting shape boundaries.

## Key Files

| File | Purpose |
|------|---------|
| `src/types/fill.ts` | `FillPoint` interface definition |
| `src/types/store.ts` | `AppState` includes `fills` array |
| `src/stores/drawingStore.ts` | `addFill()` action, fills in history |
| `src/utils/floodFill.ts` | Scanline flood fill algorithm |
| `src/utils/shapeGeometry.ts` | Coordinate conversion helpers |
| `src/utils/renderShapes.ts` | Shape rendering with `strokeOnly` option |
| `src/components/Canvas.vue` | Fill replay in `redraw()` |

## Coordinate Conversion

### Shape Storage → Rendering

```typescript
// shapeGeometry.ts
export function shapeToAbsolute<T extends Shape>(shape: T, canvas: CanvasDimensions): T {
  return {
    ...shape,
    x: shape.x * canvas.width,
    y: shape.y * canvas.height,
    width: shape.width * canvas.width,
    height: shape.height * canvas.height,
  }
}
```

### User Input → Storage

```typescript
// shapeGeometry.ts
export function toRelative(pixel: number, dimension: number): number {
  return pixel / dimension
}
```

## Flood Fill Algorithm

The flood fill uses a scanline approach for efficiency:

```typescript
// floodFill.ts
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  options: FloodFillOptions | number = {}
): number

interface FloodFillOptions {
  tolerance?: number      // Color matching tolerance (0-255), default: 64
  fillMask?: Uint8Array   // Tracks filled pixels for transparency preservation
}
```

**Key features:**
- Non-recursive (uses stack to prevent stack overflow)
- Configurable tolerance for anti-aliased edges
- Returns pixel count for success detection
- Handles DPR scaling automatically
- **Fill mask support** - Tracks which pixels were filled to preserve them during white-to-transparent conversion

### Fill Mask System

The fill mask is critical for preserving fill colors during the white-to-transparent conversion:

```typescript
// Canvas.vue
const fillMask = ref<Uint8Array | null>(null)

// In rebuildBaseState() - create/reset mask
const totalPixels = physicalWidth * physicalHeight
fillMask.value = new Uint8Array(totalPixels)

// In floodFill() - mark filled pixels
if (fillMask) {
  fillMask[pixelIdx] = 1  // Only after fill succeeds!
}

// In convertWhiteToTransparent() - preserve filled pixels
if (mask && mask[pixelIdx] === 1) {
  continue  // Skip - keep this pixel opaque
}
```

**Why it matters:** Without the fill mask, light-colored fills (pink, light blue, etc.) would become semi-transparent during white-to-transparent conversion because the algorithm calculates transparency based on how "white" a pixel is.

### Large Fill Safeguard

The flood fill aborts if the filled area exceeds 30% of the canvas (likely clicked on background):

```typescript
const maxFillPixels = Math.floor(totalPixels * 0.3)

// During fill loop
if (pixelsFilled > maxFillPixels) {
  fillAborted = true
  break  // Exit loop, don't apply changes
}

// After loop - ONLY update mask if fill succeeded
if (!fillAborted && fillMask && pixelsFilled > 0) {
  for (let i = 0; i < visited.length; i++) {
    if (visited[i] === 1) {
      fillMask[i] = 1
    }
  }
}
```

**Critical:** The fill mask is only updated AFTER confirming the fill succeeded. This prevents corrupted masks when fills are aborted (e.g., when orphaned fill points try to flood the entire canvas).

## Render Pipeline

> **Note:** The canvas uses a **Dual Canvas Architecture** - see [Background Layer System](./background-layer-system.md) for details.

### Drawing Canvas Pipeline (shapes & fills)

```
rebuildBaseState():
  1. Reset fill mask (create fresh or clear existing)
  2. Fill with WHITE (required for flood fill)
  3. Render shapes (relative → absolute, creates boundaries)
  4. Replay fills (flood fill at each stored point, updates fill mask)
  5. Re-render strokes (covers fill bleed from anti-aliasing)
  6. Save to baseStateCache (WHITE background)
  7. Mark cache as valid

redraw():
  1. Render background to bgCanvas
  2. If cache invalid → rebuildBaseState()
  3. Restore baseStateCache to drawing canvas
  4. Render preview shape (if user is drawing)
  5. convertWhiteToTransparent() - respects fill mask!
```

### Incremental Fill (applyIncrementalFill)

For performance, new fills don't rebuild everything:

```
applyIncrementalFill(newFill):
  1. Verify fill mask size matches canvas (if not → full rebuild)
  2. Restore baseStateCache (has previous fills)
  3. Apply just the new flood fill (updates fill mask)
  4. Re-render strokes on top
  5. Update baseStateCache
  6. convertWhiteToTransparent()
```

### Background Canvas Pipeline (separate)

```
renderBackgroundLayer():
  1. Reset transform, apply DPR scale
  2. Clear entire background canvas
  3. Render background (solid, gradient, scene, or animated)
  
Animation loop (if animated):
  - Runs at 24 FPS
  - Only updates background canvas
  - Drawing canvas unchanged
```

### Dimension Consistency

All rendering functions use **actual canvas element dimensions** to prevent mismatches:

```typescript
// Instead of getCanvasSize() which reads from DOM
const physicalWidth = canvasRef.value.width
const physicalHeight = canvasRef.value.height
const width = physicalWidth / dpr
const height = physicalHeight / dpr
```

This ensures the fill mask, cache, and all rendering operations use exactly the same dimensions.

## History/Undo Support

Fills are integrated with undo/redo via snapshots:

```typescript
interface HistoryEntry {
  // ... other fields
  fillsSnapshot?: FillPoint[]  // Snapshot of fills for undo/redo
}
```

When undoing:
- Restore `fills` array from `fillsSnapshot`
- Redraw triggers fill replay automatically

## Anti-Aliasing Handling

Canvas shapes have anti-aliased edges (semi-transparent pixels). To prevent "halos":

1. **High tolerance (128)** in flood fill to fill edge pixels
2. **Re-render strokes on top** after fills to cover any bleed

```typescript
// Canvas.vue redraw()
// After fills...
if (storedShapes.length > 0 && fills.length > 0) {
  renderShapes(ctx, storedShapes, width, height, { 
    noClear: true,
    isRelative: true,
    strokeOnly: true  // Only strokes, no shape fills
  })
}
```

## Performance Considerations

- Fill tolerance of 128 balances edge coverage vs. fill accuracy
- Scanline algorithm is O(n) where n = filled pixels
- Fill replay on resize is fast (fills are just click points)
- Large fills (>10k pixels) could benefit from chunked processing

## Testing

### Basic Fill Scenarios
1. Draw overlapping shapes
2. Fill intersection region → only that region fills
3. Resize browser → fills persist and scale
4. Zoom in/out → fills remain correct
5. Undo/redo → fills restore correctly

### Fill Mask Scenarios
6. Fill multiple shapes with different colors → all stay opaque
7. Fill with light colors (pink, light blue, white) → colors stay fully visible
8. Fill same area twice with different colors → new color replaces old
9. Delete a filled shape → background stays intact
10. Delete multiple filled shapes → background remains clean

### Edge Cases
11. Click on black stroke → fill is rejected (no fill)
12. Click on empty background → fill is rejected (too large)
13. Fill near canvas edge → fill respects boundaries
14. Fill after canvas resize → mask is properly rebuilt

## Dual Canvas Compatibility

The fill tool works seamlessly with the [Background Layer System](./background-layer-system.md):

1. **Fill operates on white background** - Drawing canvas always has white background for fill to work
2. **White → transparent conversion** - After fill, white pixels become transparent
3. **Background shows through** - Transparent areas reveal the background canvas below
4. **Animations don't interfere** - Background canvas is completely separate from fill operations

### Transparent Pixel Handling

The flood fill algorithm was updated to handle transparent pixels correctly:

```typescript
// floodFill.ts - isStrokeColor()
function isStrokeColor(r, g, b, a) {
  // Transparent pixels (alpha < 128) are NOT strokes
  // This prevents transparent areas from blocking fills
  if (a < 128) return false
  
  // Only pure black is considered a stroke
  return r < 20 && g < 20 && b < 20
}
```

## Known Issues & Solutions

### Orphaned Fills (Shape Deletion)

**Problem:** When a shape is deleted, any fills that were inside it become "orphaned" - the fill points still exist but have no shape boundary.

**What happens:**
1. Shape is deleted from `shapes` array
2. Fill points remain in `fills` array
3. On rebuild, orphaned fills try to flood fill at their stored position
4. Without the shape boundary, the fill expands into the white background
5. The large fill safeguard aborts the fill (> 30% of canvas)
6. Fill is ignored, background stays clean

**The safeguard protects against this** by:
- Aborting fills that exceed 30% of canvas area
- NOT updating the fill mask when fills are aborted
- Keeping the white background properly transparent

### Fill Mask Corruption (Historical Bug)

**Problem:** The fill mask was being updated during the fill loop, before checking if the fill should be aborted. This corrupted the mask even for failed fills.

**Solution:** Fill mask is now only updated AFTER the fill loop completes successfully:

```typescript
// After fill loop completes
if (!fillAborted && fillMask && pixelsFilled > 0) {
  // Now safe to update mask
  for (let i = 0; i < visited.length; i++) {
    if (visited[i] === 1) fillMask[i] = 1
  }
}
```

## Future Improvements

- **Associate fills with shapes** - Remove fills when their containing shape is deleted
- **Chunked fill processing** for very large regions (prevent UI blocking)
- **Fill boundaries** as vector paths for perfect scaling (complex)
- **WebGL acceleration** for white-to-transparent conversion

> **Note:** Fill caching is already implemented via `baseStateCache` in Canvas.vue. The cache stores shapes on a white background, and `convertWhiteToTransparent()` is called before display. See [Background Layer System](./background-layer-system.md) for the full architecture.
