# Edge Case Testing Guide

This document outlines edge cases and testing scenarios for the drawing tools to ensure robust behavior across all input conditions.

## Minimum Size Thresholds

| Shape Type | Minimum Size | Validation Rule |
|------------|--------------|-----------------|
| Rectangle  | 5px × 5px    | width >= 5 AND height >= 5 |
| Circle     | 5px radius   | radius >= 5 |
| Triangle   | 10px × 10px  | width >= 10 AND height >= 10 |

**Behavior**: Shapes below these thresholds are **not committed** to the store. The preview is shown during drag, but the shape is discarded on pointer-up if it's too small.

## Edge Case Scenarios

### 1. Tiny Drags

**Scenario**: Very small mouse/touch movements (1-4px)

**Expected Behavior**:
- Preview shape appears during drag
- Shape is **not committed** if below minimum size
- No error or console warning (silent rejection)
- Drawing state is properly cleaned up

**Test Steps**:
1. Select rectangle tool
2. Click and drag less than 5px in any direction
3. Release pointer
4. Verify: Shape does not appear in store, canvas is cleared

### 2. Zero-Area Shapes

**Scenario**: Click without dragging (same start and end point)

**Expected Behavior**:
- Preview shape has zero dimensions
- Shape is **not committed** (fails size validation)
- Drawing state is cleaned up

**Test Steps**:
1. Select any drawing tool
2. Click (pointer-down) without moving
3. Release (pointer-up) immediately
4. Verify: No shape added, store shape count unchanged

### 3. Reversed Drags

**Scenario**: Dragging from bottom-right to top-left (negative dimensions)

**Expected Behavior**:
- Rectangle: Normalized to top-left origin with positive width/height
- Circle: Works correctly (radius is always positive)
- Triangle: Height clamped to 0 if dragging upward

**Test Steps**:
1. Select rectangle tool
2. Start drag at (100, 100)
3. Drag to (50, 50) (up and left)
4. Release
5. Verify: Rectangle appears with top-left at (50, 50), width=50, height=50

### 4. Out-of-Bounds Coordinates

**Scenario**: Drag starts or ends outside canvas bounds

**Expected Behavior**:
- Coordinates are calculated relative to canvas (may be negative or exceed canvas size)
- Shapes are created with these coordinates (not clamped)
- Rendering handles out-of-bounds shapes (may be partially visible or invisible)

**Test Steps**:
1. Select rectangle tool
2. Start drag outside canvas (e.g., in negative coordinates)
3. Drag into canvas
4. Release
5. Verify: Shape is created with correct geometry, may be partially visible

### 5. Drag Starting Outside, Ending Inside

**Scenario**: Pointer-down outside canvas, pointer-move/up inside

**Expected Behavior**:
- Drawing does not start (pointer-down must be on canvas)
- No preview shape appears
- No shape is committed

**Test Steps**:
1. Select rectangle tool
2. Click outside canvas area
3. Drag into canvas
4. Release inside canvas
5. Verify: No shape created, no drawing state

### 6. Drag Starting Inside, Ending Outside

**Scenario**: Pointer-down on canvas, pointer-move/up outside

**Expected Behavior**:
- Drawing starts normally
- Preview updates with out-of-bounds coordinates
- On pointer-up outside: Shape is committed with out-of-bounds coordinates
- On pointer-leave: Drawing is canceled, shape is not committed

**Test Steps**:
1. Select rectangle tool
2. Click inside canvas
3. Drag outside canvas
4. Release outside canvas
5. Verify: Shape is created (may be partially visible)

**Test Steps (Cancel)**:
1. Select rectangle tool
2. Click inside canvas
3. Drag outside canvas
4. Move pointer away (pointer-leave event)
5. Verify: Drawing canceled, no shape created

### 7. Invalid Input Values

**Scenario**: NaN, Infinity, null, undefined in coordinates

**Expected Behavior**:
- Geometry helpers handle invalid values gracefully
- Invalid values are clamped to 0 or safe defaults
- Shapes with invalid dimensions fail validation
- No crashes or console errors

**Implementation**: Handled in `shapeGeometry.ts` with `Number.isFinite()` checks

### 8. Multi-Touch During Drawing

**Scenario**: Additional touch while drawing is active

**Expected Behavior**:
- Additional touches are ignored (only primary pointer is used)
- Drawing continues with original pointer
- No interference with active drawing

**Test Steps**:
1. Select rectangle tool
2. Start drawing with one finger
3. Place second finger on screen
4. Continue dragging with first finger
5. Release first finger
6. Verify: Only one shape created, second touch ignored

### 9. Tool Switching During Drawing

**Scenario**: User switches tool while actively drawing

**Expected Behavior**:
- Active drawing is canceled
- Preview shape is cleared
- Drawing state is reset
- New tool is selected

**Test Steps**:
1. Select rectangle tool
2. Start drawing
3. Switch to circle tool (while dragging)
4. Verify: Drawing canceled, no shape created, circle tool active

### 10. Undo/Redo During Drawing

**Scenario**: User triggers undo/redo while actively drawing

**Expected Behavior**:
- Active drawing is canceled first
- Then undo/redo operation proceeds
- No orphaned preview shapes

**Test Steps**:
1. Select rectangle tool
2. Start drawing
3. Press undo (or click undo button)
4. Verify: Drawing canceled, undo proceeds normally

## Manual Testing Checklist

### Desktop (Mouse)

- [ ] **Normal Drawing**: Draw rectangle, circle, triangle - shapes appear correctly
- [ ] **Tiny Drags**: Drag < 5px - shape not committed
- [ ] **Zero Drag**: Click without moving - no shape created
- [ ] **Reversed Drag**: Drag right-to-left, bottom-to-top - normalized correctly
- [ ] **Out-of-Bounds**: Drag partially outside canvas - shape created correctly
- [ ] **Escape Key**: Press Escape while drawing - drawing canceled
- [ ] **Right-Click**: Right-click during drawing - ignored (no context menu)
- [ ] **Tool Switch**: Switch tools while drawing - drawing canceled
- [ ] **Undo/Redo**: Undo/redo while drawing - drawing canceled first
- [ ] **Clear Canvas**: Clear while drawing - drawing canceled first
- [ ] **Stroke Style**: Verify all shapes render with 2px black stroke
- [ ] **Z-Order**: Draw multiple shapes - later shapes render on top

### Touch Devices

- [ ] **Normal Drawing**: Draw shapes with touch - works correctly
- [ ] **Tiny Drags**: Very small touch movements - shape not committed
- [ ] **Multi-Touch**: Place second finger while drawing - ignored
- [ ] **Scroll Prevention**: Drawing prevents page scroll
- [ ] **Zoom Prevention**: Drawing prevents pinch-to-zoom
- [ ] **Pointer Leave**: Move finger off screen - drawing canceled
- [ ] **Pointer Cancel**: System cancels pointer - drawing canceled
- [ ] **Touch Accuracy**: Coordinates are accurate on high-DPI screens

### Integration Tests

- [ ] **Store Integration**: Shapes appear in store after commit
- [ ] **History Integration**: Undo/redo works with drawn shapes
- [ ] **Canvas Redraw**: Canvas redraws when shapes change
- [ ] **Preview Rendering**: Preview shape appears during drag
- [ ] **Validation**: Shapes below minimum size are rejected
- [ ] **Cleanup**: No orphaned preview shapes after operations

## Known Edge Behaviors

### Upward Triangle Drags

**Behavior**: When dragging upward (currentY < startY), triangle height becomes 0.

**Reason**: Triangle convention requires height to be positive (downward from top vertex).

**Expected**: Triangle collapses to a line/point, fails size validation, not committed.

### Out-of-Bounds Shapes

**Behavior**: Shapes can be created with coordinates outside canvas bounds.

**Reason**: Coordinates are not clamped to canvas bounds (allows creative freedom).

**Expected**: Shapes render partially visible or completely off-screen.

### Minimum Size Validation

**Behavior**: Validation happens at commit time, not during drag.

**Reason**: Allows preview of small shapes, but prevents committing unusable shapes.

**Expected**: Preview shows small shapes, but they're discarded on commit if too small.

## Testing Commands

```bash
# Run unit tests (when test framework is set up)
npm test

# Run linter
npm run lint

# Run type checker
npm run build

# Start dev server for manual testing
npm run dev
```

## Future Test Framework Setup

To enable automated testing, add Vitest:

```bash
npm install -D vitest @vue/test-utils
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

