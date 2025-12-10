# Drawing Store Usage Guide

## Overview

The `useDrawingStore` Pinia store manages all drawing-related state including shapes, fills, tools, colors, modes, and history for undo/redo functionality.

## Importing Types

All types are available from the `@/types` barrel export:

```typescript
import type {
  Shape,
  RectangleShape,
  CircleShape,
  TriangleShape,
  StarShape,
  HeartShape,
  LineShape,
  FillPoint,
  ToolType,
  AppState,
} from '@/types'
```

## Accessing the Store in Components

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDrawingStore } from '@/stores'

const drawingStore = useDrawingStore()

// Use storeToRefs to maintain reactivity when destructuring
const { shapes, currentTool, currentColor, isColoringMode } =
  storeToRefs(drawingStore)

// Or access directly (automatically reactive)
const shapeCount = computed(() => drawingStore.shapeCount)
</script>
```

## Common Usage Patterns

### Drawing a New Shape

```typescript
import { useDrawingStore } from '@/stores'
import type { RectangleShape } from '@/types'

const drawingStore = useDrawingStore()

const newShape: RectangleShape = {
  id: `shape-${Date.now()}`,
  type: 'rectangle',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  strokeColor: '#000000',
  strokeWidth: 2,
  rotation: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

drawingStore.addShape(newShape)
```

### Updating a Shape

```typescript
// Update shape position
drawingStore.updateShape(shapeId, {
  x: 150,
  y: 150,
})

// Update shape color
drawingStore.updateShape(shapeId, {
  strokeColor: '#FF0000',
})
```

### Removing a Shape

```typescript
drawingStore.removeShape(shapeId)
```

### Changing Tools

```typescript
// Set specific tool
drawingStore.setCurrentTool('circle')

// Available tools: 'select', 'rectangle', 'circle', 'triangle', 'star', 'heart', 'line', 'fill', 'eraser'
```

### Changing Colors

```typescript
// Set a preset color
drawingStore.setCurrentColor('#FF6B6B') // Hex color
drawingStore.setCurrentColor('rgb(255, 107, 107)') // RGB color

// Add a custom color (also sets as current and stores in recent list)
drawingStore.addCustomColor('#8B5CF6') // Adds to recentCustomColors (max 5)
```

### Accessing Recent Custom Colors

```typescript
// Get the list of recently used custom colors (max 5, most recent first)
const recentColors = drawingStore.recentCustomColors

// Use in a component
<ColorPalette
  :selected-color="drawingStore.currentColor"
  :recent-custom-colors="drawingStore.recentCustomColors"
  @select="selectColor"
  @custom-color="addCustomColor"
/>
```

### Toggling Coloring Mode

```typescript
// Enable coloring mode (locks shape tools)
drawingStore.setColoringMode(true)

// Toggle coloring mode
drawingStore.toggleColoringMode()

// Disable coloring mode
drawingStore.setColoringMode(false)
```

### Undo/Redo Operations

```typescript
// Check if undo/redo is available
const canUndo = drawingStore.canUndo
const canRedo = drawingStore.canRedo

// Perform undo/redo
if (canUndo) {
  drawingStore.undo()
}

if (canRedo) {
  drawingStore.redo()
}
```

### Getting Shapes

```typescript
// Get all shapes
const allShapes = drawingStore.shapes

// Get shape by ID
const shape = drawingStore.getShapeById('shape-123')

// Get selected shape
const selected = drawingStore.selectedShape

// Get shape count
const count = drawingStore.shapeCount
```

### Clearing Canvas

```typescript
drawingStore.clearShapes()
```

### Adding Fills (Coloring)

```typescript
// Add a fill at a pixel position (converts to relative internally)
drawingStore.addFill(pixelX, pixelY)

// The fill uses the current color from drawingStore.currentColor
```

### Generating Coloring Pages

```typescript
// Generate random rectangles for coloring
// complexity: 0-1 (0 = few large shapes, 1 = many small shapes)
drawingStore.generateColoringPage(0.5)

// This clears existing shapes and generates new ones
// The operation is undoable
```

### Interactive Drawing Operations

```typescript
// Start drawing a shape (returns shape ID or null)
const shapeId = drawingStore.startDrawing(startX, startY)

// Update shape preview during drag
drawingStore.updateDrawing(currentX, currentY)

// Commit the shape (validates size, converts to relative coords)
drawingStore.commitDrawing()

// Cancel drawing without committing
drawingStore.cancelDrawing()
```

### Canvas Dimensions

```typescript
// Set canvas dimensions (called by Canvas component)
drawingStore.setCanvasDimensions(width, height)

// Shapes are stored in relative coords (0-1) and converted
// to absolute pixels using these dimensions for rendering
```

## Example: Complete Drawing Component

```vue
<template>
  <div>
    <button @click="drawRectangle">Draw Rectangle</button>
    <button @click="undo" :disabled="!canUndo">Undo</button>
    <button @click="redo" :disabled="!canRedo">Redo</button>
    <button @click="clear">Clear</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDrawingStore } from '@/stores'
import type { RectangleShape } from '@/types'

const drawingStore = useDrawingStore()
const { canUndo, canRedo } = storeToRefs(drawingStore)

const drawRectangle = () => {
  const shape: RectangleShape = {
    id: `rect-${Date.now()}`,
    type: 'rectangle',
    x: Math.random() * 400,
    y: Math.random() * 400,
    width: 100,
    height: 80,
    strokeColor: drawingStore.currentColor,
    strokeWidth: 2,
    rotation: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  drawingStore.addShape(shape)
}

const undo = () => {
  drawingStore.undo()
}

const redo = () => {
  drawingStore.redo()
}

const clear = () => {
  drawingStore.clearShapes()
}
</script>
```

## State Structure

```typescript
interface AppState {
  shapes: Shape[]                    // Array of all shapes (relative coords 0-1)
  fills: FillPoint[]                 // Array of fill click points for replay
  currentTool: ToolType              // Currently selected tool
  currentColor: string               // Current fill/stroke color
  isColoringMode: boolean            // Whether in coloring-only mode
  recentCustomColors: string[]       // Last 5 custom colors picked by user
  history: {
    past: HistoryEntry[]             // Undo stack (max 10 entries)
    present: Shape[]                 // Current state snapshot
    future: HistoryEntry[]           // Redo stack
  }
  isDragging: boolean                // Whether user is currently dragging
  activeShapeId: string | null       // Currently selected/active shape ID
  previewShape: Shape | null         // Shape being drawn (not yet committed)
  dragStart: { x: number, y: number } | null  // Starting point of drag
  isFilling: boolean                 // Whether fill operation is in progress
  canvasDimensions: {                // Canvas size for coordinate conversion
    width: number
    height: number
  }
}
```

