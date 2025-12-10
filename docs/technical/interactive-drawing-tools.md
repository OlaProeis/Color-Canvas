# Interactive Drawing Tools

## Overview

The interactive drawing tools system enables users to draw shapes (rectangle, circle, triangle, star, heart, line) directly on the canvas using mouse or touch input. The system provides real-time preview during drawing, validates shape sizes, and integrates seamlessly with the store and history system.

## Key Files

- `src/components/Canvas.vue` - Canvas component with pointer event handling
- `src/stores/drawingStore.ts` - Store with drawing operations and state management
- `src/utils/shapeGeometry.ts` - Pure geometry helper functions
- `src/utils/renderShapes.ts` - Shape rendering utilities
- `docs/technical/interaction-model.md` - Unified interaction model design
- `docs/technical/edge-case-testing.md` - Edge case testing guide

## Implementation Details

### Unified Pointer Events

The system uses the Pointer Events API for consistent mouse and touch handling:

- **Primary pointer filtering**: Only the first touch/left mouse button is used
- **Pointer capture**: Ensures consistent tracking even if pointer moves outside canvas
- **Passive event options**: Properly configured to allow `preventDefault()` for touch
- **Cancel scenarios**: Handles pointer leave, cancel, and Escape key

### Drawing State Management

The drawing lifecycle follows this flow:

1. **Start Drawing** (`startDrawing`): Creates preview shape, sets drag state
2. **Update Drawing** (`updateDrawing`): Updates preview geometry during drag
3. **Commit Drawing** (`commitDrawing`): Validates and commits shape to store
4. **Cancel Drawing** (`cancelDrawing`): Cleans up transient state

### Geometry Helpers

Pure functions that compute shape geometry from drag gestures:

- **`computeRectangleFromDrag()`**: Normalizes coordinates, handles reversed drags
- **`computeCircleFromDrag()`**: Enforces perfect circles (not ellipses)
- **`computeTriangleFromDrag()`**: Creates isosceles triangles with top vertex at start
- **`validateShapeSize()`**: Validates minimum sizes (Rectangle 5×5, Circle 5px radius, Triangle 10×10)

All helpers handle edge cases: tiny drags, reversed drags, out-of-bounds coordinates, NaN/Infinity values.

### Shape Validation

Shapes are validated before committing:

- **Minimum size**: Rectangle (5×5), Circle (5px radius), Triangle (10×10)
- **Invalid values**: NaN, Infinity, null, undefined are rejected
- **Stroke defaults**: 2px width, black color if missing

### Store Integration

The store provides comprehensive guards:

- **`addShape()`**: Validates shape before adding, enforces defaults
- **`commitDrawing()`**: Validates size, ensures cleanup
- **`undo()`/`redo()`**: Cancels active drawing before operation
- **`clearShapes()`**: Cancels active drawing, clears preview
- **`setCurrentTool()`**: Cancels active drawing when switching tools

### Canvas Rendering

The canvas component:

- Watches `props.shapes` and redraws on changes
- Watches `previewShapeForRender` for preview updates
- Watches `isDragging` for state changes
- Renders preview shapes separately from committed shapes
- Uses 2px black stroke as default

## Dependencies Used

- **Vue 3 Composition API** - Reactive component system
- **Pinia** - State management with history
- **HTML5 Canvas API** - 2D rendering context
- **Pointer Events API** - Unified mouse and touch handling
- **TypeScript** - Type safety

## Usage

### Drawing a Shape

1. Select a drawing tool (rectangle, circle, or triangle)
2. Click/touch on canvas to start drawing
3. Drag to define shape size
4. Release to commit shape (if above minimum size)

### Cancel Drawing

- Press Escape key
- Move pointer outside canvas (pointer-leave)
- System cancels pointer (pointer-cancel)
- Switch tools (automatically cancels)

### Tool Integration

The drawing tools integrate with:

- **Undo/Redo**: Drawing operations are added to history
- **Clear Canvas**: Cancels active drawing before clearing
- **Coloring Mode**: Doesn't interfere with shape creation
- **Store API**: Uses shared mutation methods

## Edge Cases Handled

- **Tiny drags**: Shapes below minimum size are not committed
- **Zero-area shapes**: Click without drag is rejected
- **Reversed drags**: Negative dimensions are normalized
- **Out-of-bounds**: Coordinates outside canvas are handled
- **Invalid values**: NaN, Infinity are clamped to safe defaults
- **Multi-touch**: Additional touches are ignored during drawing
- **Tool switching**: Active drawing is canceled
- **Undo/redo during drawing**: Drawing is canceled first

## Tests

### Unit Tests

Unit tests for geometry helpers are in `src/utils/__tests__/shapeGeometry.test.ts`:

- Normal drags
- Reversed drags
- Tiny drags
- Zero-size drags
- Out-of-bounds coordinates
- Invalid values (NaN, Infinity)
- Size validation

### Manual Testing

See `docs/technical/edge-case-testing.md` for comprehensive manual testing checklists covering:

- Desktop (mouse) scenarios
- Touch device scenarios
- Integration tests
- Edge case verification

## Performance

- **Drawing operations**: Real-time preview at 60 FPS
- **Coordinate conversion**: Efficient logical coordinate mapping
- **Shape validation**: Fast size checks before commit
- **Store updates**: Reactive updates trigger minimal redraws

## Future Enhancements

- Shape selection and editing
- Shape deletion with undo
- Shape rotation during drawing (currently only for generated shapes)
- Custom stroke widths
- Shape grouping and layers

