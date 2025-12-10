# Changelog

All notable changes to Color Canvas will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

#### PWA Support
- **Progressive Web App** - Install as app on mobile and desktop
- **Offline support** - Service worker caches assets for offline use
- **App icons** - Multiple sizes for various platforms (64x64 to 512x512)
- **Manifest configuration** - Theme color, background color, standalone display mode

#### Background Layer System (Task 23)
- **🎨 5 background types** - None, Solid, Gradient, Scene, Animated
- **Solid colors** - 6 kid-friendly preset colors
- **Gradient backgrounds** - 5 presets (sunrise, sunset, ocean, rainbow, sky)
- **Illustrated scenes** - 6 static scenes (grass-sky, underwater, clouds, sunset, night-sky, space)
- **Animated backgrounds** - 5 gentle animations (waves, twinkle-stars, floating-clouds, bubbles, space)
- **Dual Canvas Architecture** - Separate canvases for background and drawing
- **Alpha un-premultiplication** - Proper white-to-transparent conversion for clean edges
- **Full undo/redo support** - Background changes tracked in history
- **Background selector UI** - New collapsible section in sidebar with visual previews

### Changed

#### Canvas Architecture
- **Dual canvas system** - Background canvas (z-index: 1) + Drawing canvas (z-index: 2)
- **Flood fill compatibility** - Drawing canvas uses white background, converted to transparent for display
- **Animation efficiency** - Animation loop only updates background canvas
- **Dimension consistency** - All rendering functions now use actual canvas element dimensions instead of DOM-based calculations

#### Flood Fill Algorithm
- **Transparent pixel handling** - Transparent pixels (alpha < 128) no longer block fills
- **Dual canvas support** - Works correctly with white-to-transparent conversion
- **Fill mask system** - Tracks filled pixels to preserve them during white-to-transparent conversion
- **Deferred mask update** - Fill mask only updated after confirming fill succeeded (prevents mask corruption)

### Fixed

#### Fill Tool Bugs
- **Light-colored fills becoming transparent** - Fill mask now preserves all fill colors (pink, light blue, white, etc.) during white-to-transparent conversion
- **Previous fills turning see-through** - Fixed fill mask not being updated correctly; now properly tracks all filled pixels
- **Background disappearing when deleting filled shapes** - Fixed fill mask corruption when orphaned fills are aborted; mask is now only updated after fill succeeds

#### Background Rendering Bugs
- **Background partially missing after shape deletion** - Fixed dimension inconsistency between rendering functions; all now use actual canvas dimensions
- **Background not rendering after operations** - Added proper transform reset and DPR scaling in background layer rendering

---

### Added (Previous)

#### Shape Eraser Tool (Task 18)
- **🧹 Eraser button** in toolbar with distinctive pink styling
- **Click-to-delete** - Shape-based deletion using hit testing
- **Hover feedback** - Red highlight on erasable shapes, cursor changes
- **Full undo/redo support** - Deleted shapes can be restored
- **All shape types** - Works with rectangle, circle, triangle, star, heart, line

#### Drag-to-Rotate Drawing
- **Triangle, Star, Heart** now rotate based on drag direction during drawing
- Drag direction determines shape orientation
- Shapes stay fixed at click position while rotating

#### UI Improvements
- Removed redundant Colors/Fill sections from build sidebar
- Fixed horizontal scrollbar in coloring mode sidebar
- Cleaner, less cluttered drawing toolbar

---

## [0.1.0-beta.2] - 2025-12-08

### Added

#### Template Library (Task 16)
- **39 pre-made coloring templates** across 8 categories
- Categories: Buildings, Vehicles, Nature, Characters, Animals, Objects, Food, Abstract
- Full-screen picker UI with category tabs and live previews
- Templates auto-scale and center on canvas
- Undo support for loading templates
- Mathematical patterns: golden spiral, mandala, yin-yang, tessellation, fractal tree

#### Canvas Zoom & Pan (Task 17)
- **Scroll wheel zoom** - Cursor-anchored zooming (50% to 300%)
- **Pinch-to-zoom** - Two-finger gesture for mobile/tablet
- **Right-click pan** - Hold right mouse button and drag to pan
- **Zoom controls** - `+`, `−`, Reset buttons with percentage indicator
- **Coordinate correction** - Drawing and filling work correctly at any zoom level
- GPU-accelerated CSS transforms for smooth performance

---

## [0.1.0-beta] - 2025-12-07

### Initial Beta Release 🎨

First public beta of Color Canvas - a kid-friendly drawing and coloring web app.

### Features

#### Drawing Tools
- **6 Shape Tools**: Rectangle, Circle, Triangle, Star, Heart, Line
- **Drag-to-draw interaction** with real-time preview
- **Minimum size validation** to prevent tiny shapes
- **Relative coordinate system** ensures shapes scale with canvas resize

#### Fill Tool
- **Pixel-accurate flood fill** using scanline algorithm
- **High tolerance (128)** for anti-aliased edge pixels
- **Stroke protection** prevents filling black outline strokes
- **Background protection** limits fill to 30% of canvas area
- **Incremental caching** for performance (single flood fill per operation)

#### Color System
- **10 preset colors**: Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White
- **Custom color picker** with native HTML color input
- **Recent colors history** (up to 5 custom colors, session only)
- **Light color detection** adds visible borders automatically

#### Canvas Management
- **Save as PNG** with timestamped filename
- **Clear canvas** with confirmation dialog
- **Undo/Redo** (up to 10 history entries)
- **High-DPI display support**
- **Responsive canvas** that maintains aspect ratio

#### Magic Generator
- **Coloring page generator** creates random overlapping shapes
- **Complexity slider** (Simple → Complex)
- **Confirmation dialog** before replacing existing content

#### User Interface
- **Drawing Mode / Coloring Mode** toggle
- **Kid-friendly colors and typography**
- **Large touch targets** (≥44×44px per accessibility guidelines)
- **Keyboard navigation** with visible focus states
- **Responsive design** for desktop, tablet, and mobile

### Technical Notes

- Built with Vue 3, Vite, TypeScript, and Pinia
- Pure HTML5 Canvas rendering (no external canvas libraries)
- Pointer Events API for unified mouse and touch handling
- Fill operations use relative coordinates for resize persistence

---

## Future Releases

Planned features for upcoming versions:
- Stickers/Stamps tool with SVG icons
- Shape selection and editing
- Layer management
- Local storage persistence
- Touch gesture enhancements for mobile
