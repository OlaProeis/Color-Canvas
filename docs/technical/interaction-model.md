# Unified Interaction Model Design

## Overview

This document defines the unified interaction model for drawing tools in the Color Canvas app. The design ensures consistent behavior across mouse and touch input, with clear state management and coordinate handling.

## Core Principles

1. **Unified Pointer Events**: All interactions use the Pointer Events API for consistent mouse and touch handling
2. **Stateless Tools**: Tools are mostly stateless - drawing state is managed in the store
3. **Preview Before Commit**: Shapes are shown as previews during drawing, only committed on successful completion
4. **Coordinate Space**: All coordinates are in logical canvas space (devicePixelRatio-adjusted)

---

## Interaction Flow

### Standard Drawing Flow

```
1. pointerdown → Start drawing
   - Capture pointer
   - Create temporary preview shape
   - Set isDragging = true
   - Store dragStart coordinates

2. pointermove → Update preview
   - Update temporary shape dimensions
   - Redraw canvas with preview

3. pointerup → Commit shape
   - Add shape to store (commits to history)
   - Clear temporary preview
   - Set isDragging = false
   - Release pointer capture
```

### Cancel Scenarios

The drawing operation can be cancelled in several ways:

1. **Pointer leaves canvas** (`pointerleave` event)
   - Discard temporary shape
   - Set isDragging = false
   - Release pointer capture

2. **Escape key** (`keydown` with `key === 'Escape'`)
   - Discard temporary shape
   - Set isDragging = false
   - Release pointer capture (if active)

3. **Secondary button** (right-click or secondary touch)
   - Ignore event (don't start drawing)
   - If already drawing, cancel current operation

4. **Multiple pointers** (additional touch while drawing)
   - Ignore additional pointers
   - Continue with primary pointer

---

## Tool State API

### Store State (drawingStore)

```typescript
interface DrawingState {
  // Tool selection
  currentTool: ToolType  // 'rectangle' | 'circle' | 'triangle' | ...
  
  // Drawing state
  isDragging: boolean           // True during active drawing
  activeShapeId: string | null  // ID of shape being drawn/previewed
  
  // Shape data
  shapes: Shape[]               // Committed shapes only
  
  // ... other state
}
```

### Transient Drawing State

During drawing, a temporary shape exists that is:
- **Not in the store's `shapes` array** (until committed)
- **Rendered separately** as a preview overlay
- **Identified by `activeShapeId`** (temporary ID generated on pointerdown)

### Tool Actions

```typescript
// Start drawing
startDrawing(tool: ToolType, startX: number, startY: number): string
// Returns: temporary shape ID

// Update drawing
updateDrawing(shapeId: string, currentX: number, currentY: number): void

// Commit drawing
commitDrawing(shapeId: string): void

// Cancel drawing
cancelDrawing(shapeId: string): void
```

---

## Coordinate Space

### Logical vs Physical Coordinates

- **Physical Coordinates**: Raw pixel positions from pointer events
- **Logical Coordinates**: DevicePixelRatio-adjusted positions used by canvas

### Conversion Process

```typescript
// In Canvas component
function getLogicalCoordinates(event: PointerEvent): { x: number, y: number } {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  
  // Get physical coordinates relative to canvas
  const physicalX = event.clientX - rect.left
  const physicalY = event.clientY - rect.top
  
  // Convert to logical coordinates (accounting for DPR scaling)
  const logicalX = physicalX
  const logicalY = physicalY
  
  return { x: logicalX, y: logicalY }
}
```

**Note**: The Canvas component already handles DPR scaling in `resizeCanvas()`. The context is scaled by DPR, so logical coordinates match CSS pixel coordinates.

### Coordinate Rules

1. All tool functions receive **logical coordinates** (already DPR-adjusted)
2. Shape positions (`x`, `y`) are stored in **logical coordinate space**
3. Rendering uses logical coordinates directly (context is pre-scaled)

---

## Shape Creation Rules

### Rectangle Tool

- **Start point**: Top-left corner (`x`, `y`)
- **Dimensions**: `width = |currentX - startX|`, `height = |currentY - startY|`
- **Position adjustment**: If dragging left/up, adjust `x`/`y` to keep top-left origin
- **Minimum size**: 5px × 5px (discard if smaller on commit)

### Circle Tool

- **Center**: Start point (`x`, `y`)
- **Radius**: Distance from center to current point
- **Formula**: `radius = Math.sqrt((currentX - startX)² + (currentY - startY)²)`
- **Minimum size**: 5px radius (discard if smaller on commit)

### Triangle Tool

- **Start point**: Top vertex (`x`, `y`)
- **Base width**: `width = |currentX - startX| * 2`
- **Height**: `height = currentY - startY` (always positive, downward)
- **Position**: Top vertex at start point, base centered horizontally
- **Minimum size**: 10px width × 10px height (discard if smaller on commit)

---

## Stroke Style Rules

### Default Values

- **Stroke Color**: `#000000` (black)
- **Stroke Width**: `2px`
- **Fill**: None (stroke only for drawing tools)
- **Z-Order**: Shapes added later render on top (array order)

### Style Application

1. **Preview shapes**: Use `currentColor` from store (user-selected color)
2. **Committed shapes**: Store `strokeColor` and `strokeWidth` in shape data
3. **Rendering**: `renderShapes()` uses shape's stored style, falling back to defaults

### Style Override

- User can change `currentColor` during drawing (applies to next shape)
- Active drawing preview updates color if changed mid-draw
- Committed shapes retain their original color

---

## Event Handling

### Pointer Event Types

```typescript
// Primary events to handle
'pointerdown'  // Start drawing
'pointermove'  // Update preview
'pointerup'    // Commit shape
'pointerleave' // Cancel drawing
'pointercancel' // Cancel drawing (system-initiated)
```

### Event Filtering

```typescript
// Only handle primary button (left mouse, first touch)
if (event.button !== 0 && event.pointerType === 'mouse') {
  return // Ignore right-click, middle-click, etc.
}

// Only handle primary pointer (first touch)
if (event.isPrimary === false) {
  return // Ignore additional touches
}
```

### Keyboard Events

```typescript
// Cancel on Escape
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isDragging) {
    cancelDrawing()
  }
})
```

---

## Integration with Existing Components

### Canvas Component

The `Canvas.vue` component will:

1. **Attach pointer event listeners** to the canvas element
2. **Convert coordinates** from physical to logical space
3. **Call store actions** for drawing operations
4. **Render preview shapes** separately from committed shapes

### Drawing Store

The `drawingStore` will:

1. **Manage tool state** (`currentTool`, `isDragging`, `activeShapeId`)
2. **Create temporary shapes** during drawing
3. **Commit shapes** to history on completion
4. **Provide shape data** for rendering (committed + preview)

### Render System

The `renderShapes` utility will:

1. **Render committed shapes** from store
2. **Render preview shape** separately (if `activeShapeId` exists)
3. **Apply correct z-order** (preview always on top)

---

## State Transitions

### Idle → Drawing

```
Trigger: pointerdown on canvas with drawing tool selected
Actions:
  - setDragging(true)
  - Create temporary shape with activeShapeId
  - Store dragStart coordinates
  - Capture pointer
State: isDragging = true, activeShapeId = <temp-id>
```

### Drawing → Updating

```
Trigger: pointermove while isDragging
Actions:
  - Update temporary shape dimensions
  - Trigger canvas redraw
State: isDragging = true, activeShapeId = <temp-id>
```

### Drawing → Committed

```
Trigger: pointerup while isDragging
Actions:
  - Validate shape (minimum size)
  - addShape() to store (commits to history)
  - Clear activeShapeId
  - setDragging(false)
  - Release pointer capture
State: isDragging = false, activeShapeId = null
```

### Drawing → Cancelled

```
Trigger: pointerleave, pointercancel, or Escape key
Actions:
  - Discard temporary shape
  - Clear activeShapeId
  - setDragging(false)
  - Release pointer capture
State: isDragging = false, activeShapeId = null
```

---

## Error Handling

### Invalid States

1. **Drawing with no tool selected**: Ignore pointer events
2. **Drawing with non-drawing tool** (e.g., 'select'): Ignore pointer events
3. **Multiple simultaneous drawings**: Only allow one active drawing (ignore additional pointers)

### Validation

1. **Minimum size check**: Discard shapes smaller than minimum dimensions
2. **Coordinate bounds**: Clamp coordinates to canvas bounds if needed
3. **NaN/Infinity checks**: Validate all numeric values before committing

---

## Future Considerations

### Multi-touch Support

- Current design: Single-pointer only
- Future: Could support pinch-to-zoom, two-finger pan
- Implementation: Track multiple pointers, but only primary for drawing

### Undo During Drawing

- Current: Cancel discards shape (no undo needed)
- Future: Could allow undo of just-committed shape immediately

### Tool Switching During Drawing

- Current: Tool switch cancels active drawing
- Future: Could allow tool switch mid-draw (complex UX)

---

## Implementation Status

All items implemented in v0.1.0-beta:

- ✅ Pointer event handlers in Canvas component
- ✅ Coordinate conversion (physical → logical)
- ✅ Drawing state actions in drawingStore
- ✅ Preview shape rendering
- ✅ Cancel handlers (pointerleave, pointercancel, Escape key)
- ✅ Shape validation (minimum size)
- ✅ Keyboard event listener for Escape
- ✅ Mouse interactions tested
- ✅ Touch interactions tested
- ✅ Coordinate accuracy across DPR values

