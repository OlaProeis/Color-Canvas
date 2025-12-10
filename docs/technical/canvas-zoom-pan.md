# Canvas Zoom and Pan System

## Overview

The canvas zoom and pan system provides smooth, GPU-accelerated zooming and panning for the drawing canvas. It uses CSS transforms for performance and maintains proper coordinate conversion so drawing and filling work correctly at any zoom level.

## Key Files

- `src/components/Canvas.vue` - All zoom/pan state, handlers, and UI controls

## Features

### Zoom Controls
- **Zoom In (+)** - Increases zoom by 25% steps
- **Zoom Out (−)** - Decreases zoom by 25% steps
- **Reset** - Click the percentage indicator to reset to 100%
- **Percentage Display** - Shows current zoom level (e.g., "150%")

### Zoom Interactions
- **Scroll Wheel** - Zoom toward cursor position (cursor-anchored)
- **Pinch-to-Zoom** - Two-finger pinch gesture on touch devices

### Pan Interactions
- **Right-Click Drag** - Hold right mouse button and drag to pan
- **Context Menu** - Disabled on canvas to enable right-click panning

## Implementation Details

### Zoom State

```typescript
// Zoom limits
const MIN_ZOOM = 0.5   // 50%
const MAX_ZOOM = 3     // 300%
const ZOOM_STEP = 0.25 // 25% per button click

// State
const zoom = ref(1)        // Current zoom level (1 = 100%)
const offsetX = ref(0)     // Pan offset X in pixels
const offsetY = ref(0)     // Pan offset Y in pixels
```

### CSS Transform Approach

The zoom is implemented using CSS transforms on a wrapper element, not by scaling the canvas itself. This:
- Uses GPU acceleration for smooth performance
- Doesn't affect the actual canvas resolution
- Keeps shape coordinates independent of zoom level

```vue
<div class="canvas-viewport">
  <div 
    class="canvas-transform-wrapper"
    :style="{ 
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
      transformOrigin: '0 0'
    }"
  >
    <canvas ref="canvasRef" />
  </div>
</div>
```

### Cursor-Anchored Zooming

When zooming with the scroll wheel, the point under the cursor stays stable:

```typescript
const zoomTowardPoint = (newZoom: number, point: { x: number; y: number }) => {
  const clampedZoom = clamp(newZoom, MIN_ZOOM, MAX_ZOOM)
  const scaleRatio = clampedZoom / zoom.value

  // Keep the point under cursor stable
  offsetX.value = point.x - scaleRatio * (point.x - offsetX.value)
  offsetY.value = point.y - scaleRatio * (point.y - offsetY.value)
  zoom.value = clampedZoom
}
```

### Coordinate Conversion

All drawing operations use `screenToCanvas()` to convert pointer coordinates to canvas coordinates, accounting for zoom and pan:

```typescript
const screenToCanvas = (screenX: number, screenY: number) => {
  return {
    x: (screenX - offsetX.value) / zoom.value,
    y: (screenY - offsetY.value) / zoom.value,
  }
}
```

### Pinch-to-Zoom Touch Handling

Two-finger pinch gestures are tracked using touch events:

```typescript
// Track distance between two touches
const getTouchDistance = (t1, t2) => {
  const dx = t2.x - t1.x
  const dy = t2.y - t1.y
  return Math.sqrt(dx * dx + dy * dy)
}

// Zoom based on pinch distance ratio
const scale = currentDistance / pinchStartDistance
const newZoom = clamp(pinchStartZoom * scale, MIN_ZOOM, MAX_ZOOM)
```

### Pan with Right-Click Drag

```typescript
// Start pan on right mouse button
if (event.button === 2) {
  isPanning.value = true
  panStartX.value = event.clientX
  panStartY.value = event.clientY
  panStartOffsetX.value = offsetX.value
  panStartOffsetY.value = offsetY.value
}

// Update offset during drag
const deltaX = event.clientX - panStartX.value
const deltaY = event.clientY - panStartY.value
offsetX.value = panStartOffsetX.value + deltaX
offsetY.value = panStartOffsetY.value + deltaY
```

## UI Components

### Zoom Controls

Located in the top-right corner of the canvas:

```vue
<div class="zoom-controls">
  <button class="zoom-btn" @click="zoomOut">−</button>
  <button class="zoom-indicator" @click="resetZoom">{{ zoomPercent }}%</button>
  <button class="zoom-btn" @click="zoomIn">+</button>
</div>
```

### Responsive Design

- Desktop: 36x36px buttons
- Mobile: Smaller buttons on small screens
- Touch devices: 44x44px minimum touch targets

## Integration Points

### Drawing at Zoom

All pointer handlers use `getLogicalCoordinates()` which internally calls `screenToCanvas()`:

```typescript
const getLogicalCoordinates = (event: PointerEvent) => {
  const rect = viewportRef.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  return screenToCanvas(screenX, screenY)
}
```

### Fill Tool at Zoom

The fill tool works correctly at any zoom level because coordinates are converted before being passed to the flood fill algorithm.

### Save as PNG

Saving exports the full logical canvas at original resolution, independent of zoom level.

## Dependencies

- Task 2: Responsive canvas (base canvas implementation)
- Task 8: Save as PNG (works at any zoom)
- Task 9: Clear canvas (works at any zoom)
- Task 13: Random generator (shapes render correctly when zoomed)
- Task 14: Coloring mode (fill works at any zoom)
- Task 16: Template library (templates render correctly when zoomed)

## Testing

1. **Zoom controls** - Verify +, −, and reset buttons work
2. **Scroll wheel** - Zoom toward cursor position
3. **Pinch-to-zoom** - Test on touch device
4. **Right-click pan** - Hold right button and drag
5. **Drawing at zoom** - Draw shapes at various zoom levels
6. **Filling at zoom** - Fill shapes at various zoom levels
7. **Coordinate accuracy** - Shapes appear where clicked regardless of zoom
