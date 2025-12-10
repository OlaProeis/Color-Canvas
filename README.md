# Color Canvas

A kid-friendly drawing and coloring web app where children can draw shapes, color regions, and create artwork with intuitive touch-friendly tools.

**Version:** 0.1.0-beta

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3-646cff?logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Drawing Tools
- **6 Shape Tools** - Rectangle, Circle, Triangle, Star, Heart, Line
- **Drag-to-draw** interaction with real-time preview
- **Drag-to-rotate** - Triangle, Star, Heart rotate based on drag direction
- **Shape Eraser** - Click shapes to delete with hover feedback
- **Stamps** - Place pre-made decorative stamps on canvas

### Coloring
- **Flood Fill Tool** - Pixel-accurate coloring with anti-aliased edges
- **10 Preset Colors** - Kid-friendly color palette
- **Custom Color Picker** - Pick any color, recent colors remembered

### Templates & Generation
- **Template Library** - 39 pre-made coloring pages across categories (Animals, Vehicles, Fantasy, Nature, Abstract)
- **Magic Generator** - Create random coloring pages with theme selection and complexity slider

### Backgrounds
- **5 Background Types** - None, Solid Colors, Gradients, Illustrated Scenes, Animated
- **Animated Backgrounds** - Gentle animations (waves, twinkling stars, floating clouds, bubbles, space)

### Canvas Controls
- **Zoom & Pan** - Scroll wheel zoom (50%-300%), pinch-to-zoom, right-click pan
- **Undo/Redo** - Up to 10 history entries
- **Save as PNG** - Export artwork with timestamped filename

### User Experience
- **Drawing/Coloring Modes** - Toggle between creating and coloring
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Touch Support** - Large touch targets, gesture-friendly
- **PWA Support** - Install as app, works offline
- **Accessibility** - Keyboard navigation, focus states

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Vue 3** - Composition API with TypeScript
- **Vite** - Build tool and dev server
- **TypeScript** - Full type safety
- **Pinia** - State management
- **HTML5 Canvas** - Dual canvas architecture (background + drawing layers)
- **PWA** - Service worker for offline support

## Documentation

See the [docs folder](./docs/index.md) for detailed technical documentation:

- [Store Usage Guide](./docs/store-usage.md)
- [Shape Rendering System](./docs/technical/shape-rendering.md)
- [Fill Tool Architecture](./docs/technical/fill-tool-architecture.md)
- [Background Layer System](./docs/technical/background-layer-system.md)
- [Canvas Zoom & Pan](./docs/technical/canvas-zoom-pan.md)
- [Template Library](./docs/technical/template-library.md)
- [Interaction Model](./docs/technical/interaction-model.md)

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint and auto-fix |
| `npm run lint:check` | Check linting without fixing |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests with Vitest |

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
