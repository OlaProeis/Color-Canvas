# Template Library

## Overview
The Template Library provides pre-made coloring page templates that kids can select and load onto the canvas. Templates are composed of primitive shapes (rectangles, circles, triangles, stars, hearts, lines) and automatically scale to fit the canvas with proper centering.

## Key Files
- `src/types/template.ts` - Type definitions for templates
- `src/data/templates.ts` - All 39 template definitions and registry
- `src/utils/templateUtils.ts` - Scaling, centering, and transformation utilities
- `src/components/TemplateLibrary.vue` - Full-screen picker UI component

## Template Categories

| Category | Count | Examples |
|----------|-------|----------|
| 🏠 Buildings | 3 | House, Fire Station, Castle |
| 🚗 Vehicles | 4 | Car, Rocket, Train, Sailboat |
| 🌿 Nature | 5 | Tree, Flower, Sun, Mountains, Rainbow |
| 🎭 Characters | 4 | Snowman, Robot, Princess, Pirate |
| 🐾 Animals | 5 | Fish, Butterfly, Rat, Farm, Owl |
| ⭐ Objects | 5 | Star, Heart, Balloon, Gift Box, Umbrella |
| 🍕 Food | 4 | Ice Cream, Cupcake, Birthday Cake, Pizza |
| 🔷 Abstract | 9 | Golden Spiral, Mandala, Yin Yang, etc. |

**Total: 39 templates**

## Data Model

### TemplateDefinition
```typescript
interface TemplateDefinition {
  id: string              // Unique identifier
  name: string            // Display name
  category: TemplateCategory
  icon: string            // Emoji for UI
  source: 'primitives' | 'svg'
  license: 'cc0' | 'mit' | 'attribution'
  viewBox: TemplateViewBox
  shapes: TemplateShape[]
}

interface TemplateViewBox {
  width: number   // Template coordinate system width
  height: number  // Template coordinate system height
}
```

### TemplateShape
Templates can use any of the standard shape types:
- `rectangle`, `circle`, `triangle`, `star`, `heart`, `line`
- Future: `path` type for SVG path data

Shapes in templates use the template's `viewBox` coordinate system (typically 100x100 or similar), which gets transformed to the canvas's relative (0-1) coordinate system when applied.

## Adding New Templates

### Step 1: Define the Template
Add to `src/data/templates.ts`:

```typescript
const myTemplate: TemplateDefinition = {
  id: 'my-template',
  name: 'My Template',
  category: 'objects',  // or other category
  icon: '🎨',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    createShape({ type: 'circle', x: 50, y: 50, radius: 30, rotation: 0 }),
    createShape({ type: 'rectangle', x: 20, y: 70, width: 60, height: 20, rotation: 0 }),
    // ... more shapes
  ],
}
```

### Step 2: Register the Template
Add to the `templates` array export:

```typescript
export const templates: TemplateDefinition[] = [
  // ... existing templates
  myTemplate,
]
```

### Design Guidelines
- Use **black strokes only** (`strokeColor: '#000000'`)
- Default `strokeWidth: 2` works well for most shapes
- Design for a ~100x100 viewBox (can vary)
- Keep shapes simple with **large colorable regions**
- Avoid very thin lines or tiny details (flood-fill struggles)

## Template Transformation

### How Templates are Applied

1. **Scale Calculation**: Template is scaled to fit canvas with 8% margin
2. **Centering**: Template is centered within the available space
3. **Coordinate Conversion**: ViewBox coords → Relative (0-1) coords

```typescript
// From templateUtils.ts
function applyTemplate(
  template: TemplateDefinition,
  canvasDimensions: { width: number; height: number },
  config?: TemplateApplyConfig
): Shape[]
```

### Coordinate Flow
```
Template ViewBox (e.g., 100x100)
       ↓
   Scale & Center
       ↓
Relative Coords (0-1)
       ↓
   (at render time)
       ↓
Absolute Pixels
```

## UI Component

### TemplateLibrary.vue
- Full-screen modal overlay
- Category tabs for filtering
- Grid of template cards with live canvas previews
- Selection state with "Use This Template" confirmation

### Preview Rendering
Each template card has a small canvas that renders a preview:
```typescript
const previewShapes = getTemplatePreview(template, width, height)
renderShapes(ctx, previewShapes, width, height, { isRelative: false })
```

## Store Integration

### drawingStore.applyTemplate()
```typescript
applyTemplate(template: TemplateDefinition) {
  // 1. Cancel any active drawing
  // 2. Save current state to history (for undo)
  // 3. Clear shapes and fills
  // 4. Transform template shapes to canvas coordinates
  // 5. Add shapes to store
}
```

### Undo Support
Loading a template creates a history entry with the previous state snapshot. Users can undo to restore their previous drawing.

## Mathematical Templates

The Abstract category includes templates using mathematical concepts:

| Template | Concept |
|----------|---------|
| Golden Spiral | Fibonacci-inspired circle arrangement |
| Mandala | 8-fold radial symmetry |
| Honeycomb | Hexagonal pattern approximation |
| Concentric Circles | Bullseye pattern |
| Triangle Mosaic | Triangular tessellation |
| Pinwheel | 6-fold rotational symmetry |
| Yin Yang | Balance symbol |
| Spiral Squares | Rotating nested squares |
| Starburst | Radiating lines with decorations |

## Dependencies Used
- Vue 3 Composition API
- Pinia store actions
- Canvas 2D rendering (`renderShapes`)
- Existing shape type system

## Testing

### Manual Tests
1. Open Template Library from sidebar
2. Browse categories and verify previews render
3. Select and load each template
4. Verify template centers and scales properly
5. Test flood-fill on template regions
6. Test undo after loading template
7. Test clear canvas removes template

### Responsive Tests
- Verify picker works on mobile (touch scrolling)
- Verify template cards are touchable
- Verify categories scroll horizontally on small screens
