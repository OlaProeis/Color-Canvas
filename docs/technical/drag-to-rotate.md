# Drag-to-Rotate Drawing Interaction

## Overview

Scalable shapes (Triangle, Star, Heart) support rotation during the initial draw gesture. As you drag to set the size, the direction of the drag also sets the rotation angle. This allows users to orient shapes intuitively in a single gesture.

## Key Files

- `src/utils/shapeGeometry.ts` - `computeTriangleFromDrag`, `computeStarFromDrag`, `computeHeartFromDrag`
- `src/utils/renderShapes.ts` - Rotation transform application per shape type

## Implementation Details

### Rotation Calculation

Each shape computes rotation from the drag vector angle:

```typescript
const dx = currentX - startX
const dy = currentY - startY
const distance = Math.sqrt(dx * dx + dy * dy)
const rotation = distance > 5 ? Math.atan2(dy, dx) + offset : 0
```

The offset varies by shape to align the "natural" orientation with a downward drag:
- **Triangle**: `+ Math.PI / 2` (points up by default)
- **Star**: `+ Math.PI / 2` (points up by default)
- **Heart**: `- Math.PI / 2` (points down by default)

A minimum drag distance (5px) prevents erratic rotation on small movements.

### Center-Based vs Corner-Based Shapes

Shapes fall into two categories for rotation:

| Shape | x,y represents | Rotation Center |
|-------|----------------|-----------------|
| Circle | Center | (x, y) - no rotation needed |
| Star | Center | (x, y) |
| Triangle | Top-left corner | (x + width/2, y + height/2) |
| Heart | Top-left corner | (x + width/2, y + height/2) |
| Rectangle | Top-left corner | No rotation |
| Line | Start point | No rotation |

### Render Transform

In `renderShapes.ts`, rotation is applied correctly based on shape type:

```typescript
if (shape.rotation !== 0) {
  let centerX: number
  let centerY: number

  if (shape.type === 'star') {
    // Star: x,y is already the center
    centerX = shape.x
    centerY = shape.y
  } else if (shape.type === 'circle') {
    // Circle: rotation not visually meaningful
    centerX = shape.x
    centerY = shape.y
  } else {
    // Rectangle, Triangle, Heart: x,y is top-left corner
    centerX = shape.x + (getShapeWidth(shape) / 2)
    centerY = shape.y + (getShapeHeight(shape) / 2)
  }

  ctx.translate(centerX, centerY)
  ctx.rotate(shape.rotation)
  ctx.translate(-centerX, -centerY)
}
```

### Circle Exception

Circles don't need rotation since they're visually symmetric. The rotation calculation is omitted from `computeCircleFromDrag`.

## Shape Behaviors Summary

| Shape | Click Position | Sizing | Rotation |
|-------|---------------|--------|----------|
| Circle | Center | Drag distance = radius | ❌ Not needed |
| Star | Center | Drag distance = size | ✅ Drag direction |
| Triangle | Center | Drag distance = size | ✅ Drag direction |
| Heart | Center | Drag distance = size | ✅ Drag direction |
| Rectangle | Corner | Drag to opposite corner | ❌ Not supported |
| Line | Start point | Drag to end point | ❌ Not applicable |

## Usage

1. Select Triangle, Star, or Heart tool
2. Click where you want the shape's center
3. Drag outward to set size
4. The direction you drag determines rotation:
   - Drag up: Shape points up
   - Drag right: Shape points right
   - Drag down: Shape points down
   - etc.
5. Release to place the shape

## Tests

- [ ] Triangle rotates based on drag direction
- [ ] Star rotates and stays centered at click point
- [ ] Heart rotates and stays centered at click point
- [ ] Circle size works correctly (no rotation)
- [ ] Shapes render correctly after placement
- [ ] Works at all zoom levels
