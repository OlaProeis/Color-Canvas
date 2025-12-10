# Shape Eraser Tool

## Overview

The Shape Eraser tool allows users to click on shapes to delete them, with visual hover feedback and full undo/redo support. It works at any zoom level and with all shape types.

## Key Files

- `src/App.vue` - Eraser tool button in toolbar
- `src/components/Canvas.vue` - Eraser interaction handlers (hover tracking, click-to-delete)
- `src/utils/hitTest.ts` - Shape hit detection (point-in-shape tests for all types)
- `src/utils/renderShapes.ts` - Highlight rendering for hovered shapes
- `src/stores/drawingStore.ts` - `removeShape` action with undo/redo support

## Implementation Details

### Tool Activation

The eraser is added as a tool type in `ToolType`:
```typescript
type ToolType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'heart' | 'line' | 'fill' | 'eraser'
```

When activated, the eraser changes canvas cursor to `crosshair`, and to `pointer` when hovering over a shape.

### Hit Testing

The `hitTestShapes` function detects which shape (if any) is under a given point:

- **Rectangle**: Simple bounding box check
- **Circle**: Distance from center ≤ radius
- **Triangle**: Ray-casting polygon algorithm
- **Star**: Bounding circle + ray-casting for polygon vertices
- **Heart**: Bounding box + approximate polygon hit test
- **Line**: Distance to line segment with stroke-width tolerance

Shapes are tested in reverse order (last drawn = topmost) so the eraser deletes the visually topmost shape.

### Hover Feedback

When the eraser tool is active:
1. `handlePointerMove` performs hit testing on every mouse move
2. `hoveredShapeId` ref tracks the shape under cursor
3. On change, `redraw()` re-renders the canvas with a red highlight stroke on the hovered shape

```typescript
// Highlight rendering in redraw()
if (hoveredShapeId.value && drawingStore.currentTool === 'eraser') {
  renderShapes(ctx.value, [hoveredShape], width, height, {
    noClear: true,
    isRelative: true,
    strokeOnly: true,
    strokeColor: '#EF4444',  // Red highlight
    strokeWidth: 4,
  })
}
```

### Click-to-Delete

When clicking with the eraser:
1. `handlePointerDown` calls `hitTestShapes` at click coordinates
2. If a shape is found, `drawingStore.removeShape(id)` is called
3. The shape is removed from the store and a history snapshot is recorded
4. Canvas automatically re-renders

### Undo/Redo Support

The `removeShape` action records history before deletion, so erased shapes can be restored with undo.

## Cursor Styles

```css
.canvas.eraser-tool {
  cursor: crosshair;
}
.canvas.eraser-hover {
  cursor: pointer;
}
```

## Dependencies

- Task 2: Responsive canvas (coordinate system)
- Task 17: Canvas zoom (coordinate conversion via `screenToCanvas`)

## Usage

1. Click the **🧹 Eraser** button in the toolbar
2. Hover over shapes to see them highlighted in red
3. Click a shape to delete it
4. Use **Undo** to restore deleted shapes

## Tests

Manual testing checklist:
- [ ] Eraser button activates/deactivates correctly
- [ ] Hover highlights appear on all shape types
- [ ] Click deletes the topmost shape
- [ ] Works correctly at different zoom levels
- [ ] Undo restores deleted shapes
- [ ] Redo re-deletes them
