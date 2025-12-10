# Color Canvas Documentation

## Overview

Color Canvas is a kid-friendly drawing and coloring web app where children can draw shapes, use templates, and color regions with intuitive touch-friendly tools.

**Version:** 0.1.0-beta

## Features

- ✅ Shape drawing tools (rectangle, circle, triangle, star, heart, line)
- ✅ Fill tool with pixel-accurate flood fill
- ✅ 10-color palette with custom color picker
- ✅ Recent custom colors history (up to 5)
- ✅ Undo/Redo functionality
- ✅ Clear canvas with confirmation
- ✅ Save as PNG
- ✅ Magic coloring page generator with complexity slider
- ✅ Drawing Mode / Coloring Mode toggle
- ✅ **Template Library** - 39 pre-made coloring pages across 8 categories
- ✅ **Canvas Zoom & Pan** - Scroll wheel zoom, pinch-to-zoom, right-click pan
- ✅ **Shape Eraser** - Click-to-delete with hover feedback and undo support
- ✅ **Drag-to-Rotate** - Set shape rotation during draw gesture (triangle, star, heart)
- ✅ **Background Layer System** - Solid colors, gradients, scenes, and animated backgrounds
- ✅ Responsive design with touch support
- ✅ Accessibility (keyboard navigation, focus states)

## Technical Documentation

### Core Systems

- [Store Usage Guide](./store-usage.md) - How to use the Pinia drawing store
- [Shape Rendering System](./technical/shape-rendering.md) - Canvas rendering implementation
- [Interactive Drawing Tools](./technical/interactive-drawing-tools.md) - Drawing tools implementation and usage
- [Interaction Model](./technical/interaction-model.md) - Unified pointer event handling and drawing tool design
- [Fill Tool Architecture](./technical/fill-tool-architecture.md) - Hybrid fill system with relative coordinates and pixel flood-fill
- [Background Layer System](./technical/background-layer-system.md) - Dual canvas architecture with animated backgrounds
- [Color Palette System](./technical/color-palette.md) - Color palette with custom picker and accessibility
- [Template Library](./technical/template-library.md) - Pre-made coloring templates system
- [Canvas Zoom & Pan](./technical/canvas-zoom-pan.md) - Zoom controls, scroll/pinch zoom, and right-click panning
- [Shape Eraser](./technical/shape-eraser.md) - Click-to-delete tool with hover feedback
- [Drag-to-Rotate](./technical/drag-to-rotate.md) - Rotation during shape drawing gesture
- [Edge Case Testing](./technical/edge-case-testing.md) - Testing guide for edge cases and regression checks

### Release History

- [Changelog](./changelog.md) - Version history and release notes

## Project Structure

```
src/
├── components/     # Vue components
│   ├── Canvas.vue              # Dual canvas (drawing + background)
│   ├── ColorPalette.vue        # Color selection
│   ├── BackgroundSelector.vue  # Background type picker
│   ├── TemplateLibrary.vue     # Template picker UI
│   ├── ConfirmDialog.vue       # Modal dialogs
│   └── BaseButton.vue          # Reusable button
├── stores/         # Pinia stores (appStore, drawingStore)
├── types/          # TypeScript type definitions
│   ├── shape.ts            # Shape types
│   ├── template.ts         # Template types
│   ├── background.ts       # Background config types & presets
│   └── ...
├── data/           # Static data
│   └── templates.ts        # 39 template definitions
├── utils/          # Utility functions
│   ├── renderShapes.ts         # Shape rendering
│   ├── backgroundRenderer.ts   # Background rendering (solid, gradient, scene, animated)
│   ├── shapeGeometry.ts        # Coordinate conversion
│   ├── shapeGenerator.ts       # Random page generation
│   ├── templateUtils.ts        # Template transformation
│   ├── floodFill.ts            # Flood fill algorithm
│   └── hitTest.ts              # Shape hit detection
├── constants/      # Application constants (colors)
└── assets/         # Static assets
```

## Getting Started

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes type checking) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint and auto-fix |
| `npm run lint:check` | Run ESLint without fixing |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without fixing |

## Tech Stack

- **Vue 3** - Component framework (Composition API)
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Pinia** - State management
- **HTML5 Canvas** - Dual canvas drawing and rendering (see [Background Layer System](./technical/background-layer-system.md))
