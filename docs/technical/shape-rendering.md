# Shape Rendering System

## Overview

The shape rendering system provides a pure, testable API for rendering shapes on HTML5 Canvas. It supports all shape types (rectangle, circle, triangle, star, heart, line) with rotation transforms, and integrates reactively with the Pinia store.

## Key Files

- `src/utils/renderShapes.ts` - Pure rendering functions
- `src/components/Canvas.vue` - Canvas component with shape rendering integration
- `src/types/shape.ts` - Shape type definitions

## Implementation Details

### Pure Render Function

The core rendering function `renderShapes()` is a pure function with no side effects:

```typescript
renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  canvasWidth: number,
  canvasHeight: number,
  options?: RenderOptions
): void
```

**Features:**
- Clears canvas before drawing
- Supports configurable stroke color and width
- Processes shapes in order for proper z-index
- Handles rotation with proper transform center calculation

### Shape Drawing Functions

Each shape type has a dedicated drawing function:

- **Rectangle**: Uses `ctx.rect()` for drawing
- **Circle**: Uses `ctx.arc()` for drawing
- **Triangle**: Uses `ctx.beginPath()` + `moveTo`/`lineTo` for isosceles triangle
- **Star**: Uses `ctx.beginPath()` + calculated vertices for 5-pointed star
- **Heart**: Uses `ctx.bezierCurveTo()` for smooth heart curves
- **Line**: Uses `ctx.moveTo()`/`ctx.lineTo()` for straight lines

### Rotation Support

Shapes support rotation via the `rotation` property (in radians). The transform is applied with proper center calculation:

1. Translate to shape center
2. Rotate around center
3. Translate back
4. Draw shape at local coordinates

This ensures shapes rotate around their center point, not the top-left corner.

### Canvas Integration

The Canvas component automatically:
- Watches the `shapes` prop from the store
- Redraws when shapes array changes
- Redraws on window/canvas resize
- Maintains high-DPI rendering with `devicePixelRatio`

## Dependencies Used

- Vue 3 Composition API - Reactive component system
- HTML5 Canvas API - 2D rendering context
- TypeScript - Type safety for shape definitions

## Usage

### Basic Usage

```vue
<template>
  <Canvas :shapes="drawingStore.shapes" :padding="20" />
</template>

<script setup lang="ts">
import { useDrawingStore } from '@/stores'
import { Canvas } from '@/components'

const drawingStore = useDrawingStore()
</script>
```

### Manual Redraw

```typescript
const canvasRef = ref<CanvasRef | null>(null)

// Trigger manual redraw
canvasRef.value?.redraw()
```

### Rendering Specific Shapes

```typescript
import { renderShapes } from '@/utils/renderShapes'

const shapes: Shape[] = [
  {
    id: 'rect-1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    strokeColor: '#000000',
    strokeWidth: 2,
    rotation: Math.PI / 4, // 45 degrees
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

renderShapes(ctx, shapes, canvasWidth, canvasHeight, {
  strokeColor: '#FF0000',
  strokeWidth: 3,
})
```

## Performance Considerations

- Shapes are rendered in a single pass (O(n) complexity)
- Canvas transforms use `save()`/`restore()` to prevent leakage
- Deep watching of shapes array is required for reactivity
- Consider batching updates for large numbers of shapes (100+)

## Future Enhancements

- Optimized dirty rectangle rendering
- WebGL backend for performance-critical scenarios
- Shape grouping and layering

## Tests

Manual testing can be done via the running app:

1. Run `npm run dev`
2. Use the drawing tools to create shapes (rectangle, circle, triangle, star, heart, line)
3. Use the Magic slider + Generate button to create coloring pages
4. Verify shapes render correctly with rotation
5. Use undo/redo to verify re-rendering works
6. Resize the browser window to verify shapes scale correctly
7. Use the fill tool to color regions and verify fills persist through resize

