/**
 * Template Library - Pre-made coloring page templates
 *
 * All templates use a 100x100 viewBox coordinate system.
 * Shapes are scaled and centered when applied to the canvas.
 *
 * Sources: OpenClipart (public domain), original designs
 */

import type { TemplateDefinition, TemplateShape } from '@/types'

// ============================================================================
// HELPER: Create shape with defaults
// ============================================================================

let shapeIdCounter = 0

/**
 * Helper to create template shapes with default values for common properties.
 * Accepts shape-specific properties and injects defaults for:
 * - id, strokeColor, strokeWidth, createdAt, updatedAt
 */
function createShape(
  partial: {
    type: TemplateShape['type']
    x: number
    y: number
    rotation: number
    strokeWidth?: number
  } & Record<string, unknown>
): TemplateShape {
  const timestamp = Date.now()
  return {
    id: `template-shape-${shapeIdCounter++}`,
    strokeColor: '#000000',
    strokeWidth: partial.strokeWidth ?? 2,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...partial,
  } as TemplateShape
}

// ============================================================================
// TEMPLATES: Buildings
// ============================================================================

const houseTemplate: TemplateDefinition = {
  id: 'house-simple',
  name: 'House',
  category: 'buildings',
  icon: '🏠',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // House body (main rectangle)
    createShape({
      type: 'rectangle',
      x: 20,
      y: 40,
      width: 60,
      height: 50,
      rotation: 0,
    }),
    // Roof (triangle)
    createShape({
      type: 'triangle',
      x: 15,
      y: 10,
      width: 70,
      height: 32,
      rotation: 0,
    }),
    // Door (rectangle)
    createShape({
      type: 'rectangle',
      x: 42,
      y: 60,
      width: 16,
      height: 30,
      rotation: 0,
    }),
    // Left window (rectangle)
    createShape({
      type: 'rectangle',
      x: 26,
      y: 50,
      width: 12,
      height: 12,
      rotation: 0,
    }),
    // Right window (rectangle)
    createShape({
      type: 'rectangle',
      x: 62,
      y: 50,
      width: 12,
      height: 12,
      rotation: 0,
    }),
    // Chimney (rectangle)
    createShape({
      type: 'rectangle',
      x: 60,
      y: 5,
      width: 10,
      height: 20,
      rotation: 0,
    }),
  ],
}

/**
 * Fire Station - Building with garage door, tower, and fire truck hint
 */
const fireStationTemplate: TemplateDefinition = {
  id: 'fire-station',
  name: 'Fire Station',
  category: 'buildings',
  icon: '🚒',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 100 },
  shapes: [
    // Main building
    createShape({ type: 'rectangle', x: 10, y: 35, width: 80, height: 55, rotation: 0 }),
    // Roof
    createShape({ type: 'triangle', x: 5, y: 10, width: 90, height: 28, rotation: 0 }),
    // Tower on right
    createShape({ type: 'rectangle', x: 85, y: 15, width: 25, height: 75, rotation: 0 }),
    // Tower roof
    createShape({ type: 'triangle', x: 82, y: 0, width: 31, height: 18, rotation: 0 }),
    // Large garage door
    createShape({ type: 'rectangle', x: 25, y: 50, width: 35, height: 40, rotation: 0 }),
    // Garage door windows (3 small rectangles)
    createShape({ type: 'rectangle', x: 28, y: 53, width: 8, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 39, y: 53, width: 8, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 50, y: 53, width: 8, height: 8, rotation: 0 }),
    // Upper window
    createShape({ type: 'circle', x: 42, y: 30, radius: 8, rotation: 0 }),
    // Tower windows
    createShape({ type: 'rectangle', x: 92, y: 25, width: 10, height: 12, rotation: 0 }),
    createShape({ type: 'rectangle', x: 92, y: 45, width: 10, height: 12, rotation: 0 }),
    createShape({ type: 'rectangle', x: 92, y: 65, width: 10, height: 12, rotation: 0 }),
    // Bell on tower
    createShape({ type: 'circle', x: 97, y: 8, radius: 4, rotation: 0 }),
    // Side door
    createShape({ type: 'rectangle', x: 68, y: 60, width: 15, height: 30, rotation: 0 }),
    // Ground line
    createShape({ type: 'line', x: 0, y: 90, x2: 120, y2: 90, rotation: 0, strokeWidth: 2 }),
  ],
}

/**
 * Castle - Medieval castle with towers, walls and flag
 */
const castleTemplate: TemplateDefinition = {
  id: 'castle',
  name: 'Castle',
  category: 'buildings',
  icon: '🏰',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 100 },
  shapes: [
    // Main wall
    createShape({ type: 'rectangle', x: 25, y: 40, width: 70, height: 50, rotation: 0 }),
    // Left tower
    createShape({ type: 'rectangle', x: 10, y: 25, width: 25, height: 65, rotation: 0 }),
    // Right tower
    createShape({ type: 'rectangle', x: 85, y: 25, width: 25, height: 65, rotation: 0 }),
    // Left tower roof (triangle)
    createShape({ type: 'triangle', x: 7, y: 5, width: 31, height: 22, rotation: 0 }),
    // Right tower roof
    createShape({ type: 'triangle', x: 82, y: 5, width: 31, height: 22, rotation: 0 }),
    // Center tower (taller)
    createShape({ type: 'rectangle', x: 45, y: 15, width: 30, height: 75, rotation: 0 }),
    // Center tower roof
    createShape({ type: 'triangle', x: 42, y: -5, width: 36, height: 22, rotation: 0 }),
    // Gate (arched - approximated)
    createShape({ type: 'rectangle', x: 50, y: 55, width: 20, height: 35, rotation: 0 }),
    createShape({ type: 'circle', x: 60, y: 55, radius: 10, rotation: 0 }),
    // Left tower window
    createShape({ type: 'rectangle', x: 17, y: 40, width: 10, height: 15, rotation: 0 }),
    // Right tower window
    createShape({ type: 'rectangle', x: 93, y: 40, width: 10, height: 15, rotation: 0 }),
    // Battlements on wall (small rectangles on top)
    createShape({ type: 'rectangle', x: 28, y: 35, width: 8, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 40, y: 35, width: 8, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 72, y: 35, width: 8, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 84, y: 35, width: 8, height: 8, rotation: 0 }),
    // Flag on center tower
    createShape({ type: 'line', x: 60, y: -5, x2: 60, y2: -20, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'triangle', x: 60, y: -25, width: 15, height: 10, rotation: Math.PI / 2 }),
    // Ground
    createShape({ type: 'line', x: 0, y: 90, x2: 120, y2: 90, rotation: 0, strokeWidth: 2 }),
  ],
}

/**
 * Lighthouse - Coastal lighthouse with stripes and light beam
 */
const lighthouseTemplate: TemplateDefinition = {
  id: 'lighthouse',
  name: 'Lighthouse',
  category: 'buildings',
  icon: '🗼',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Main tower (tapered - approximated with rectangle)
    createShape({ type: 'rectangle', x: 30, y: 25, width: 40, height: 65, rotation: 0 }),
    // Tower stripes (horizontal lines)
    createShape({ type: 'line', x: 30, y: 35, x2: 70, y2: 35, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 30, y: 45, x2: 70, y2: 45, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 30, y: 55, x2: 70, y2: 55, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 30, y: 65, x2: 70, y2: 65, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 30, y: 75, x2: 70, y2: 75, rotation: 0, strokeWidth: 2 }),
    // Light room
    createShape({ type: 'rectangle', x: 32, y: 12, width: 36, height: 15, rotation: 0 }),
    // Light dome/roof
    createShape({ type: 'circle', x: 50, y: 12, radius: 18, rotation: 0 }),
    // Light (inner circle)
    createShape({ type: 'circle', x: 50, y: 18, radius: 6, rotation: 0 }),
    // Light beams
    createShape({ type: 'triangle', x: 5, y: 8, width: 25, height: 20, rotation: -Math.PI / 2 }),
    createShape({ type: 'triangle', x: 70, y: 28, width: 25, height: 20, rotation: Math.PI / 2 }),
    // Door
    createShape({ type: 'rectangle', x: 42, y: 75, width: 16, height: 15, rotation: 0 }),
    // Window
    createShape({ type: 'circle', x: 50, y: 50, radius: 6, rotation: 0 }),
    // Rocky base
    createShape({ type: 'circle', x: 25, y: 92, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 95, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 92, radius: 12, rotation: 0 }),
    // Waves
    createShape({ type: 'circle', x: 10, y: 98, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 90, y: 98, radius: 8, rotation: 0 }),
  ],
}

/**
 * Windmill - Dutch-style windmill with blades
 */
const windmillTemplate: TemplateDefinition = {
  id: 'windmill',
  name: 'Windmill',
  category: 'buildings',
  icon: '🏭',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Main body (tapered tower)
    createShape({ type: 'rectangle', x: 30, y: 35, width: 40, height: 55, rotation: 0 }),
    // Roof/cap
    createShape({ type: 'triangle', x: 25, y: 20, width: 50, height: 18, rotation: 0 }),
    // Blade hub (center)
    createShape({ type: 'circle', x: 50, y: 30, radius: 8, rotation: 0 }),
    // Blades (4 triangular blades)
    createShape({ type: 'triangle', x: 45, y: -5, width: 10, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 75, y: 25, width: 10, height: 30, rotation: Math.PI / 2 }),
    createShape({ type: 'triangle', x: 55, y: 65, width: 10, height: 30, rotation: Math.PI }),
    createShape({ type: 'triangle', x: 15, y: 35, width: 10, height: 30, rotation: -Math.PI / 2 }),
    // Blade frames (lines across each blade)
    createShape({ type: 'rectangle', x: 48, y: 0, width: 4, height: 25, rotation: 0 }),
    createShape({ type: 'rectangle', x: 58, y: 28, width: 25, height: 4, rotation: 0 }),
    createShape({ type: 'rectangle', x: 48, y: 38, width: 4, height: 25, rotation: 0 }),
    createShape({ type: 'rectangle', x: 17, y: 28, width: 25, height: 4, rotation: 0 }),
    // Door
    createShape({ type: 'rectangle', x: 42, y: 70, width: 16, height: 20, rotation: 0 }),
    // Windows
    createShape({ type: 'rectangle', x: 35, y: 45, width: 10, height: 12, rotation: 0 }),
    createShape({ type: 'rectangle', x: 55, y: 45, width: 10, height: 12, rotation: 0 }),
    // Ground
    createShape({ type: 'line', x: 10, y: 90, x2: 90, y2: 90, rotation: 0, strokeWidth: 2 }),
    // Tulips (Dutch touch!)
    createShape({ type: 'circle', x: 20, y: 85, radius: 4, rotation: 0 }),
    createShape({ type: 'line', x: 20, y: 85, x2: 20, y2: 90, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'circle', x: 80, y: 85, radius: 4, rotation: 0 }),
    createShape({ type: 'line', x: 80, y: 85, x2: 80, y2: 90, rotation: 0, strokeWidth: 2 }),
  ],
}

// ============================================================================
// TEMPLATES: Vehicles
// ============================================================================

const carTemplate: TemplateDefinition = {
  id: 'car-simple',
  name: 'Car',
  category: 'vehicles',
  icon: '🚗',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 60 },
  shapes: [
    // Car body (main rectangle)
    createShape({
      type: 'rectangle',
      x: 10,
      y: 25,
      width: 80,
      height: 25,
      rotation: 0,
    }),
    // Car top/cabin (rectangle)
    createShape({
      type: 'rectangle',
      x: 25,
      y: 8,
      width: 40,
      height: 20,
      rotation: 0,
    }),
    // Front wheel (circle)
    createShape({
      type: 'circle',
      x: 25,
      y: 50,
      radius: 8,
      rotation: 0,
    }),
    // Back wheel (circle)
    createShape({
      type: 'circle',
      x: 75,
      y: 50,
      radius: 8,
      rotation: 0,
    }),
    // Front window (rectangle)
    createShape({
      type: 'rectangle',
      x: 28,
      y: 12,
      width: 15,
      height: 12,
      rotation: 0,
    }),
    // Back window (rectangle)
    createShape({
      type: 'rectangle',
      x: 47,
      y: 12,
      width: 15,
      height: 12,
      rotation: 0,
    }),
    // Headlight (circle)
    createShape({
      type: 'circle',
      x: 85,
      y: 35,
      radius: 3,
      rotation: 0,
    }),
  ],
}

const rocketTemplate: TemplateDefinition = {
  id: 'rocket-simple',
  name: 'Rocket',
  category: 'vehicles',
  icon: '🚀',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 60, height: 100 },
  shapes: [
    // Rocket body (rectangle)
    createShape({
      type: 'rectangle',
      x: 15,
      y: 25,
      width: 30,
      height: 55,
      rotation: 0,
    }),
    // Nose cone (triangle)
    createShape({
      type: 'triangle',
      x: 10,
      y: 0,
      width: 40,
      height: 28,
      rotation: 0,
    }),
    // Left fin (triangle)
    createShape({
      type: 'triangle',
      x: 0,
      y: 65,
      width: 18,
      height: 25,
      rotation: 0,
    }),
    // Right fin (triangle)
    createShape({
      type: 'triangle',
      x: 42,
      y: 65,
      width: 18,
      height: 25,
      rotation: 0,
    }),
    // Window (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 42,
      radius: 8,
      rotation: 0,
    }),
    // Fire/exhaust (triangle pointing down)
    createShape({
      type: 'triangle',
      x: 18,
      y: 80,
      width: 24,
      height: 18,
      rotation: Math.PI, // Upside down
    }),
  ],
}

/**
 * Train - Steam locomotive with cars and smoke
 */
const trainTemplate: TemplateDefinition = {
  id: 'train',
  name: 'Train',
  category: 'vehicles',
  icon: '🚂',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 140, height: 80 },
  shapes: [
    // Engine body
    createShape({ type: 'rectangle', x: 5, y: 30, width: 35, height: 30, rotation: 0 }),
    // Engine cabin
    createShape({ type: 'rectangle', x: 30, y: 20, width: 20, height: 40, rotation: 0 }),
    // Cabin roof
    createShape({ type: 'rectangle', x: 28, y: 15, width: 24, height: 8, rotation: 0 }),
    // Smokestack
    createShape({ type: 'rectangle', x: 12, y: 15, width: 10, height: 18, rotation: 0 }),
    // Smokestack top
    createShape({ type: 'rectangle', x: 10, y: 10, width: 14, height: 7, rotation: 0 }),
    // Smoke puffs
    createShape({ type: 'circle', x: 17, y: 2, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 8, y: -5, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 25, y: -2, radius: 4, rotation: 0 }),
    // Engine wheels (3)
    createShape({ type: 'circle', x: 15, y: 62, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 35, y: 62, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 48, y: 62, radius: 6, rotation: 0 }),
    // Cabin window
    createShape({ type: 'rectangle', x: 35, y: 25, width: 10, height: 10, rotation: 0 }),
    // Cow catcher (front)
    createShape({ type: 'triangle', x: -5, y: 45, width: 15, height: 15, rotation: -Math.PI / 2 }),
    // First car (coal car)
    createShape({ type: 'rectangle', x: 55, y: 35, width: 25, height: 25, rotation: 0 }),
    createShape({ type: 'circle', x: 62, y: 62, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 62, radius: 6, rotation: 0 }),
    // Coal in car
    createShape({ type: 'circle', x: 62, y: 40, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 72, y: 42, radius: 5, rotation: 0 }),
    // Second car (passenger)
    createShape({ type: 'rectangle', x: 85, y: 30, width: 35, height: 30, rotation: 0 }),
    createShape({ type: 'circle', x: 95, y: 62, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 110, y: 62, radius: 6, rotation: 0 }),
    // Passenger windows
    createShape({ type: 'rectangle', x: 90, y: 35, width: 8, height: 12, rotation: 0 }),
    createShape({ type: 'rectangle', x: 102, y: 35, width: 8, height: 12, rotation: 0 }),
    // Track line
    createShape({ type: 'line', x: -5, y: 70, x2: 140, y2: 70, rotation: 0, strokeWidth: 3 }),
  ],
}

/**
 * Sailboat - Boat on water with sail and waves
 */
const sailboatTemplate: TemplateDefinition = {
  id: 'sailboat',
  name: 'Sailboat',
  category: 'vehicles',
  icon: '⛵',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Hull (boat bottom)
    createShape({ type: 'rectangle', x: 15, y: 60, width: 60, height: 15, rotation: 0 }),
    // Hull front curve (triangle)
    createShape({ type: 'triangle', x: 70, y: 55, width: 20, height: 20, rotation: Math.PI / 2 }),
    // Hull back
    createShape({ type: 'triangle', x: 5, y: 60, width: 15, height: 15, rotation: -Math.PI / 2 }),
    // Mast
    createShape({ type: 'line', x: 45, y: 10, x2: 45, y2: 60, rotation: 0, strokeWidth: 3 }),
    // Main sail (large triangle)
    createShape({ type: 'triangle', x: 48, y: 12, width: 35, height: 45, rotation: Math.PI / 2 }),
    // Front sail (smaller triangle)
    createShape({ type: 'triangle', x: 15, y: 18, width: 28, height: 38, rotation: -Math.PI / 2 }),
    // Flag on top
    createShape({ type: 'triangle', x: 45, y: 5, width: 12, height: 8, rotation: Math.PI / 2 }),
    // Cabin
    createShape({ type: 'rectangle', x: 35, y: 50, width: 20, height: 12, rotation: 0 }),
    // Porthole
    createShape({ type: 'circle', x: 45, y: 56, radius: 3, rotation: 0 }),
    // Water line
    createShape({ type: 'line', x: 0, y: 78, x2: 100, y2: 78, rotation: 0, strokeWidth: 2 }),
    // Waves
    createShape({ type: 'circle', x: 10, y: 82, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 30, y: 85, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 55, y: 82, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 85, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 95, y: 82, radius: 8, rotation: 0 }),
    // Sun in corner
    createShape({ type: 'circle', x: 85, y: 15, radius: 10, rotation: 0 }),
  ],
}

/**
 * Helicopter - Chopper with rotor blades
 */
const helicopterTemplate: TemplateDefinition = {
  id: 'helicopter',
  name: 'Helicopter',
  category: 'vehicles',
  icon: '🚁',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 80 },
  shapes: [
    // Main body (oval-ish)
    createShape({ type: 'circle', x: 45, y: 45, radius: 22, rotation: 0 }),
    // Cockpit window
    createShape({ type: 'circle', x: 35, y: 42, radius: 12, rotation: 0 }),
    // Tail boom
    createShape({ type: 'rectangle', x: 65, y: 40, width: 40, height: 10, rotation: 0 }),
    // Tail fin (vertical)
    createShape({ type: 'rectangle', x: 100, y: 25, width: 8, height: 20, rotation: 0 }),
    // Tail rotor hub
    createShape({ type: 'circle', x: 108, y: 28, radius: 4, rotation: 0 }),
    // Tail rotor blades
    createShape({ type: 'rectangle', x: 108, y: 15, width: 3, height: 25, rotation: 0 }),
    // Main rotor mast
    createShape({ type: 'rectangle', x: 43, y: 18, width: 4, height: 10, rotation: 0 }),
    // Main rotor hub
    createShape({ type: 'circle', x: 45, y: 15, radius: 6, rotation: 0 }),
    // Main rotor blades (long horizontal)
    createShape({ type: 'rectangle', x: 0, y: 13, width: 90, height: 4, rotation: 0 }),
    // Landing skids
    createShape({ type: 'line', x: 25, y: 67, x2: 65, y2: 67, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 30, y: 60, x2: 30, y2: 67, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 55, y: 60, x2: 55, y2: 67, rotation: 0, strokeWidth: 2 }),
    // Door
    createShape({ type: 'rectangle', x: 48, y: 38, width: 12, height: 18, rotation: 0 }),
    // Clouds
    createShape({ type: 'circle', x: 100, y: 55, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 110, y: 58, radius: 6, rotation: 0 }),
  ],
}

// ============================================================================
// TEMPLATES: Nature
// ============================================================================

const treeTemplate: TemplateDefinition = {
  id: 'tree-simple',
  name: 'Tree',
  category: 'nature',
  icon: '🌳',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Tree trunk (rectangle)
    createShape({
      type: 'rectangle',
      x: 30,
      y: 60,
      width: 20,
      height: 40,
      rotation: 0,
    }),
    // Foliage - bottom layer (triangle)
    createShape({
      type: 'triangle',
      x: 5,
      y: 35,
      width: 70,
      height: 35,
      rotation: 0,
    }),
    // Foliage - middle layer (triangle)
    createShape({
      type: 'triangle',
      x: 10,
      y: 18,
      width: 60,
      height: 30,
      rotation: 0,
    }),
    // Foliage - top layer (triangle)
    createShape({
      type: 'triangle',
      x: 15,
      y: 0,
      width: 50,
      height: 28,
      rotation: 0,
    }),
  ],
}

const flowerTemplate: TemplateDefinition = {
  id: 'flower-simple',
  name: 'Flower',
  category: 'nature',
  icon: '🌸',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Stem (line)
    createShape({
      type: 'line',
      x: 40,
      y: 45,
      x2: 40,
      y2: 95,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Left leaf (heart rotated)
    createShape({
      type: 'heart',
      x: 20,
      y: 60,
      width: 18,
      height: 15,
      rotation: -0.5,
    }),
    // Right leaf (heart rotated)
    createShape({
      type: 'heart',
      x: 42,
      y: 65,
      width: 18,
      height: 15,
      rotation: 0.5,
    }),
    // Center (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: 30,
      radius: 8,
      rotation: 0,
    }),
    // Petal top (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: 12,
      radius: 10,
      rotation: 0,
    }),
    // Petal right (circle)
    createShape({
      type: 'circle',
      x: 55,
      y: 25,
      radius: 10,
      rotation: 0,
    }),
    // Petal bottom-right (circle)
    createShape({
      type: 'circle',
      x: 50,
      y: 42,
      radius: 10,
      rotation: 0,
    }),
    // Petal bottom-left (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 42,
      radius: 10,
      rotation: 0,
    }),
    // Petal left (circle)
    createShape({
      type: 'circle',
      x: 25,
      y: 25,
      radius: 10,
      rotation: 0,
    }),
  ],
}

const sunTemplate: TemplateDefinition = {
  id: 'sun-simple',
  name: 'Sun',
  category: 'nature',
  icon: '☀️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Sun center (circle)
    createShape({
      type: 'circle',
      x: 50,
      y: 50,
      radius: 20,
      rotation: 0,
    }),
    // Ray - top
    createShape({
      type: 'line',
      x: 50,
      y: 5,
      x2: 50,
      y2: 25,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - bottom
    createShape({
      type: 'line',
      x: 50,
      y: 75,
      x2: 50,
      y2: 95,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - left
    createShape({
      type: 'line',
      x: 5,
      y: 50,
      x2: 25,
      y2: 50,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - right
    createShape({
      type: 'line',
      x: 75,
      y: 50,
      x2: 95,
      y2: 50,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - top-right
    createShape({
      type: 'line',
      x: 68,
      y: 18,
      x2: 82,
      y2: 32,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - bottom-right
    createShape({
      type: 'line',
      x: 68,
      y: 82,
      x2: 82,
      y2: 68,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - bottom-left
    createShape({
      type: 'line',
      x: 18,
      y: 68,
      x2: 32,
      y2: 82,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Ray - top-left
    createShape({
      type: 'line',
      x: 18,
      y: 32,
      x2: 32,
      y2: 18,
      rotation: 0,
      strokeWidth: 3,
    }),
  ],
}

/**
 * Mountain Scene - Mountains with trees and sun
 */
const mountainSceneTemplate: TemplateDefinition = {
  id: 'mountain-scene',
  name: 'Mountains',
  category: 'nature',
  icon: '🏔️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 100 },
  shapes: [
    // Sun
    createShape({ type: 'circle', x: 100, y: 18, radius: 12, rotation: 0 }),
    // Sun rays
    createShape({ type: 'line', x: 100, y: 0, x2: 100, y2: 5, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 115, y: 18, x2: 120, y2: 18, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 110, y: 8, x2: 115, y2: 3, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 110, y: 28, x2: 115, y2: 33, rotation: 0, strokeWidth: 2 }),
    // Back mountain (largest)
    createShape({ type: 'triangle', x: 25, y: 20, width: 80, height: 55, rotation: 0 }),
    // Snow cap on back mountain
    createShape({ type: 'triangle', x: 50, y: 20, width: 30, height: 20, rotation: 0 }),
    // Front mountain (left)
    createShape({ type: 'triangle', x: -5, y: 35, width: 60, height: 45, rotation: 0 }),
    // Snow cap
    createShape({ type: 'triangle', x: 12, y: 35, width: 22, height: 15, rotation: 0 }),
    // Front mountain (right)
    createShape({ type: 'triangle', x: 65, y: 40, width: 55, height: 40, rotation: 0 }),
    // Snow cap
    createShape({ type: 'triangle', x: 80, y: 40, width: 20, height: 13, rotation: 0 }),
    // Ground/grass line
    createShape({ type: 'rectangle', x: 0, y: 80, width: 120, height: 20, rotation: 0 }),
    // Trees (left)
    createShape({ type: 'rectangle', x: 8, y: 70, width: 4, height: 15, rotation: 0 }),
    createShape({ type: 'triangle', x: 2, y: 55, width: 16, height: 18, rotation: 0 }),
    createShape({ type: 'triangle', x: 3, y: 45, width: 14, height: 15, rotation: 0 }),
    // Trees (right)
    createShape({ type: 'rectangle', x: 108, y: 70, width: 4, height: 15, rotation: 0 }),
    createShape({ type: 'triangle', x: 102, y: 55, width: 16, height: 18, rotation: 0 }),
    createShape({ type: 'triangle', x: 103, y: 45, width: 14, height: 15, rotation: 0 }),
    // Cloud
    createShape({ type: 'circle', x: 25, y: 12, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 35, y: 10, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 45, y: 12, radius: 7, rotation: 0 }),
  ],
}

/**
 * Rainbow - Rainbow arc with clouds
 */
const rainbowTemplate: TemplateDefinition = {
  id: 'rainbow',
  name: 'Rainbow',
  category: 'nature',
  icon: '🌈',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 80 },
  shapes: [
    // Rainbow arcs (7 concentric half-circles approximated)
    // Outer arc (red)
    createShape({ type: 'circle', x: 60, y: 70, radius: 55, rotation: 0 }),
    // Orange
    createShape({ type: 'circle', x: 60, y: 70, radius: 48, rotation: 0 }),
    // Yellow
    createShape({ type: 'circle', x: 60, y: 70, radius: 41, rotation: 0 }),
    // Green
    createShape({ type: 'circle', x: 60, y: 70, radius: 34, rotation: 0 }),
    // Blue
    createShape({ type: 'circle', x: 60, y: 70, radius: 27, rotation: 0 }),
    // Indigo
    createShape({ type: 'circle', x: 60, y: 70, radius: 20, rotation: 0 }),
    // Violet (inner)
    createShape({ type: 'circle', x: 60, y: 70, radius: 13, rotation: 0 }),
    // Ground line to cut off bottom
    createShape({ type: 'rectangle', x: 0, y: 70, width: 120, height: 15, rotation: 0 }),
    // Left cloud
    createShape({ type: 'circle', x: 8, y: 62, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 20, y: 58, radius: 14, rotation: 0 }),
    createShape({ type: 'circle', x: 32, y: 62, radius: 11, rotation: 0 }),
    createShape({ type: 'circle', x: 14, y: 55, radius: 10, rotation: 0 }),
    // Right cloud
    createShape({ type: 'circle', x: 88, y: 62, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 100, y: 58, radius: 14, rotation: 0 }),
    createShape({ type: 'circle', x: 112, y: 62, radius: 11, rotation: 0 }),
    createShape({ type: 'circle', x: 106, y: 55, radius: 10, rotation: 0 }),
    // Sun peeking
    createShape({ type: 'circle', x: 60, y: 8, radius: 10, rotation: 0 }),
  ],
}

// ============================================================================
// TEMPLATES: Characters
// ============================================================================

const snowmanTemplate: TemplateDefinition = {
  id: 'snowman-simple',
  name: 'Snowman',
  category: 'characters',
  icon: '⛄',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Bottom ball (largest)
    createShape({
      type: 'circle',
      x: 40,
      y: 78,
      radius: 20,
      rotation: 0,
    }),
    // Middle ball
    createShape({
      type: 'circle',
      x: 40,
      y: 48,
      radius: 15,
      rotation: 0,
    }),
    // Head (top ball)
    createShape({
      type: 'circle',
      x: 40,
      y: 23,
      radius: 12,
      rotation: 0,
    }),
    // Hat brim (rectangle)
    createShape({
      type: 'rectangle',
      x: 24,
      y: 8,
      width: 32,
      height: 5,
      rotation: 0,
    }),
    // Hat top (rectangle)
    createShape({
      type: 'rectangle',
      x: 28,
      y: -5,
      width: 24,
      height: 14,
      rotation: 0,
    }),
    // Left eye (circle)
    createShape({
      type: 'circle',
      x: 35,
      y: 20,
      radius: 2,
      rotation: 0,
    }),
    // Right eye (circle)
    createShape({
      type: 'circle',
      x: 45,
      y: 20,
      radius: 2,
      rotation: 0,
    }),
    // Nose (triangle - carrot)
    createShape({
      type: 'triangle',
      x: 40,
      y: 23,
      width: 15,
      height: 6,
      rotation: Math.PI / 2, // Pointing right
    }),
    // Button 1
    createShape({
      type: 'circle',
      x: 40,
      y: 42,
      radius: 2.5,
      rotation: 0,
    }),
    // Button 2
    createShape({
      type: 'circle',
      x: 40,
      y: 50,
      radius: 2.5,
      rotation: 0,
    }),
    // Button 3
    createShape({
      type: 'circle',
      x: 40,
      y: 58,
      radius: 2.5,
      rotation: 0,
    }),
  ],
}

const robotTemplate: TemplateDefinition = {
  id: 'robot-simple',
  name: 'Robot',
  category: 'characters',
  icon: '🤖',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Head (rectangle)
    createShape({
      type: 'rectangle',
      x: 20,
      y: 5,
      width: 40,
      height: 30,
      rotation: 0,
    }),
    // Left antenna (line)
    createShape({
      type: 'line',
      x: 30,
      y: 0,
      x2: 30,
      y2: 5,
      rotation: 0,
      strokeWidth: 2,
    }),
    // Left antenna ball
    createShape({
      type: 'circle',
      x: 30,
      y: -2,
      radius: 3,
      rotation: 0,
    }),
    // Right antenna (line)
    createShape({
      type: 'line',
      x: 50,
      y: 0,
      x2: 50,
      y2: 5,
      rotation: 0,
      strokeWidth: 2,
    }),
    // Right antenna ball
    createShape({
      type: 'circle',
      x: 50,
      y: -2,
      radius: 3,
      rotation: 0,
    }),
    // Left eye (rectangle)
    createShape({
      type: 'rectangle',
      x: 26,
      y: 12,
      width: 10,
      height: 8,
      rotation: 0,
    }),
    // Right eye (rectangle)
    createShape({
      type: 'rectangle',
      x: 44,
      y: 12,
      width: 10,
      height: 8,
      rotation: 0,
    }),
    // Mouth (rectangle)
    createShape({
      type: 'rectangle',
      x: 30,
      y: 26,
      width: 20,
      height: 5,
      rotation: 0,
    }),
    // Body (rectangle)
    createShape({
      type: 'rectangle',
      x: 15,
      y: 38,
      width: 50,
      height: 40,
      rotation: 0,
    }),
    // Control panel (rectangle)
    createShape({
      type: 'rectangle',
      x: 25,
      y: 48,
      width: 30,
      height: 20,
      rotation: 0,
    }),
    // Left arm (rectangle)
    createShape({
      type: 'rectangle',
      x: 2,
      y: 42,
      width: 12,
      height: 8,
      rotation: 0,
    }),
    // Right arm (rectangle)
    createShape({
      type: 'rectangle',
      x: 66,
      y: 42,
      width: 12,
      height: 8,
      rotation: 0,
    }),
    // Left leg (rectangle)
    createShape({
      type: 'rectangle',
      x: 22,
      y: 80,
      width: 12,
      height: 18,
      rotation: 0,
    }),
    // Right leg (rectangle)
    createShape({
      type: 'rectangle',
      x: 46,
      y: 80,
      width: 12,
      height: 18,
      rotation: 0,
    }),
  ],
}

/**
 * Princess - Simple princess with crown and dress
 */
const princessTemplate: TemplateDefinition = {
  id: 'princess',
  name: 'Princess',
  category: 'characters',
  icon: '👸',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Head
    createShape({ type: 'circle', x: 40, y: 22, radius: 14, rotation: 0 }),
    // Crown base
    createShape({ type: 'rectangle', x: 28, y: 5, width: 24, height: 8, rotation: 0 }),
    // Crown points
    createShape({ type: 'triangle', x: 26, y: -2, width: 10, height: 9, rotation: 0 }),
    createShape({ type: 'triangle', x: 35, y: -4, width: 10, height: 11, rotation: 0 }),
    createShape({ type: 'triangle', x: 44, y: -2, width: 10, height: 9, rotation: 0 }),
    // Crown jewels
    createShape({ type: 'circle', x: 31, y: 2, radius: 2, rotation: 0 }),
    createShape({ type: 'circle', x: 40, y: 0, radius: 2, rotation: 0 }),
    createShape({ type: 'circle', x: 49, y: 2, radius: 2, rotation: 0 }),
    // Hair (sides)
    createShape({ type: 'circle', x: 25, y: 25, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 55, y: 25, radius: 8, rotation: 0 }),
    // Eyes
    createShape({ type: 'circle', x: 35, y: 20, radius: 2, rotation: 0 }),
    createShape({ type: 'circle', x: 45, y: 20, radius: 2, rotation: 0 }),
    // Smile
    createShape({ type: 'circle', x: 40, y: 26, radius: 4, rotation: 0 }),
    // Neck
    createShape({ type: 'rectangle', x: 36, y: 35, width: 8, height: 8, rotation: 0 }),
    // Dress body (triangle for ball gown)
    createShape({ type: 'triangle', x: 10, y: 42, width: 60, height: 55, rotation: Math.PI }),
    // Dress top
    createShape({ type: 'rectangle', x: 28, y: 42, width: 24, height: 15, rotation: 0 }),
    // Sleeves
    createShape({ type: 'circle', x: 22, y: 50, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 58, y: 50, radius: 8, rotation: 0 }),
    // Arms
    createShape({ type: 'line', x: 22, y: 58, x2: 22, y2: 70, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 58, y: 58, x2: 58, y2: 70, rotation: 0, strokeWidth: 3 }),
    // Hands
    createShape({ type: 'circle', x: 22, y: 72, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 58, y: 72, radius: 4, rotation: 0 }),
    // Dress decoration (bow)
    createShape({ type: 'circle', x: 40, y: 50, radius: 4, rotation: 0 }),
    createShape({ type: 'triangle', x: 32, y: 47, width: 10, height: 6, rotation: -Math.PI / 2 }),
    createShape({ type: 'triangle', x: 48, y: 53, width: 10, height: 6, rotation: Math.PI / 2 }),
  ],
}

/**
 * Pirate - Pirate with hat, eyepatch, and small ship
 */
const pirateTemplate: TemplateDefinition = {
  id: 'pirate',
  name: 'Pirate',
  category: 'characters',
  icon: '🏴‍☠️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Head
    createShape({ type: 'circle', x: 35, y: 28, radius: 14, rotation: 0 }),
    // Pirate hat base
    createShape({ type: 'rectangle', x: 18, y: 12, width: 34, height: 10, rotation: 0 }),
    // Hat top curve
    createShape({ type: 'circle', x: 35, y: 12, radius: 17, rotation: 0 }),
    // Skull on hat
    createShape({ type: 'circle', x: 35, y: 8, radius: 5, rotation: 0 }),
    // Eye patch
    createShape({ type: 'circle', x: 30, y: 26, radius: 4, rotation: 0 }),
    createShape({ type: 'line', x: 22, y: 22, x2: 38, y2: 30, rotation: 0, strokeWidth: 2 }),
    // Good eye
    createShape({ type: 'circle', x: 40, y: 26, radius: 2, rotation: 0 }),
    // Beard
    createShape({ type: 'circle', x: 35, y: 40, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 28, y: 38, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 42, y: 38, radius: 6, rotation: 0 }),
    // Body
    createShape({ type: 'rectangle', x: 22, y: 48, width: 26, height: 30, rotation: 0 }),
    // Belt
    createShape({ type: 'rectangle', x: 22, y: 60, width: 26, height: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 35, y: 62, radius: 3, rotation: 0 }),
    // Arms
    createShape({ type: 'rectangle', x: 10, y: 50, width: 14, height: 8, rotation: 0 }),
    createShape({ type: 'rectangle', x: 46, y: 50, width: 14, height: 8, rotation: 0 }),
    // Hook hand!
    createShape({ type: 'circle', x: 8, y: 60, radius: 5, rotation: 0 }),
    createShape({ type: 'line', x: 6, y: 58, x2: 3, y2: 65, rotation: 0, strokeWidth: 2 }),
    // Sword hand
    createShape({ type: 'circle', x: 62, y: 58, radius: 4, rotation: 0 }),
    createShape({ type: 'rectangle', x: 60, y: 62, width: 3, height: 20, rotation: 0 }),
    createShape({ type: 'rectangle', x: 56, y: 60, width: 10, height: 3, rotation: 0 }),
    // Legs
    createShape({ type: 'rectangle', x: 25, y: 78, width: 8, height: 18, rotation: 0 }),
    createShape({ type: 'rectangle', x: 37, y: 78, width: 8, height: 18, rotation: 0 }),
    // Boots
    createShape({ type: 'rectangle', x: 23, y: 92, width: 12, height: 6, rotation: 0 }),
    createShape({ type: 'rectangle', x: 35, y: 92, width: 12, height: 6, rotation: 0 }),
    // Small ship in background
    createShape({ type: 'rectangle', x: 70, y: 75, width: 25, height: 10, rotation: 0 }),
    createShape({ type: 'triangle', x: 85, y: 55, width: 10, height: 20, rotation: 0 }),
    createShape({ type: 'line', x: 85, y: 55, x2: 85, y2: 75, rotation: 0, strokeWidth: 2 }),
    // Water
    createShape({ type: 'line', x: 65, y: 88, x2: 100, y2: 88, rotation: 0, strokeWidth: 2 }),
  ],
}

/**
 * Astronaut - Space explorer with helmet and suit
 */
const astronautTemplate: TemplateDefinition = {
  id: 'astronaut',
  name: 'Astronaut',
  category: 'characters',
  icon: '👨‍🚀',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Helmet (large circle)
    createShape({ type: 'circle', x: 50, y: 25, radius: 20, rotation: 0 }),
    // Visor (inner circle)
    createShape({ type: 'circle', x: 50, y: 25, radius: 14, rotation: 0 }),
    // Face reflection (small circle in visor)
    createShape({ type: 'circle', x: 45, y: 22, radius: 4, rotation: 0 }),
    // Helmet attachment points
    createShape({ type: 'circle', x: 32, y: 30, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 68, y: 30, radius: 4, rotation: 0 }),
    // Body/suit (rounded rectangle-ish)
    createShape({ type: 'rectangle', x: 30, y: 42, width: 40, height: 40, rotation: 0 }),
    // Chest panel
    createShape({ type: 'rectangle', x: 38, y: 48, width: 24, height: 15, rotation: 0 }),
    // Chest buttons/lights
    createShape({ type: 'circle', x: 45, y: 53, radius: 3, rotation: 0 }),
    createShape({ type: 'circle', x: 55, y: 53, radius: 3, rotation: 0 }),
    createShape({ type: 'rectangle', x: 42, y: 58, width: 16, height: 3, rotation: 0 }),
    // Arms (puffy suit arms)
    createShape({ type: 'circle', x: 22, y: 55, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 78, y: 55, radius: 10, rotation: 0 }),
    // Gloves
    createShape({ type: 'circle', x: 15, y: 65, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 85, y: 65, radius: 6, rotation: 0 }),
    // Legs
    createShape({ type: 'rectangle', x: 33, y: 80, width: 12, height: 18, rotation: 0 }),
    createShape({ type: 'rectangle', x: 55, y: 80, width: 12, height: 18, rotation: 0 }),
    // Boots
    createShape({ type: 'circle', x: 39, y: 95, radius: 7, rotation: 0 }),
    createShape({ type: 'circle', x: 61, y: 95, radius: 7, rotation: 0 }),
    // Backpack (life support)
    createShape({ type: 'rectangle', x: 70, y: 45, width: 12, height: 25, rotation: 0 }),
    // Antenna on backpack
    createShape({ type: 'line', x: 76, y: 45, x2: 76, y2: 35, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'circle', x: 76, y: 33, radius: 3, rotation: 0 }),
    // Stars around
    createShape({
      type: 'star',
      x: 10,
      y: 15,
      outerRadius: 5,
      innerRadius: 2,
      points: 5,
      rotation: 0,
    }),
    createShape({
      type: 'star',
      x: 90,
      y: 20,
      outerRadius: 4,
      innerRadius: 1.5,
      points: 5,
      rotation: 0.3,
    }),
    createShape({
      type: 'star',
      x: 15,
      y: 85,
      outerRadius: 4,
      innerRadius: 1.5,
      points: 5,
      rotation: 0.5,
    }),
  ],
}

// ============================================================================
// TEMPLATES: Animals
// ============================================================================

const fishTemplate: TemplateDefinition = {
  id: 'fish-simple',
  name: 'Fish',
  category: 'animals',
  icon: '🐟',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 60 },
  shapes: [
    // Body (circle/oval - using circle for simplicity)
    createShape({
      type: 'circle',
      x: 45,
      y: 30,
      radius: 22,
      rotation: 0,
    }),
    // Tail (triangle)
    createShape({
      type: 'triangle',
      x: 65,
      y: 15,
      width: 30,
      height: 30,
      rotation: Math.PI / 2,
    }),
    // Eye (circle)
    createShape({
      type: 'circle',
      x: 32,
      y: 25,
      radius: 5,
      rotation: 0,
    }),
    // Pupil (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 24,
      radius: 2,
      rotation: 0,
    }),
    // Top fin (triangle)
    createShape({
      type: 'triangle',
      x: 35,
      y: 0,
      width: 25,
      height: 12,
      rotation: 0,
    }),
    // Bottom fin (triangle)
    createShape({
      type: 'triangle',
      x: 40,
      y: 50,
      width: 20,
      height: 10,
      rotation: Math.PI,
    }),
  ],
}

const butterflyTemplate: TemplateDefinition = {
  id: 'butterfly-simple',
  name: 'Butterfly',
  category: 'animals',
  icon: '🦋',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 80 },
  shapes: [
    // Body (rectangle narrow)
    createShape({
      type: 'rectangle',
      x: 47,
      y: 20,
      width: 6,
      height: 45,
      rotation: 0,
    }),
    // Head (circle)
    createShape({
      type: 'circle',
      x: 50,
      y: 15,
      radius: 6,
      rotation: 0,
    }),
    // Left antenna
    createShape({
      type: 'line',
      x: 47,
      y: 10,
      x2: 38,
      y2: 2,
      rotation: 0,
      strokeWidth: 2,
    }),
    // Right antenna
    createShape({
      type: 'line',
      x: 53,
      y: 10,
      x2: 62,
      y2: 2,
      rotation: 0,
      strokeWidth: 2,
    }),
    // Left top wing (heart)
    createShape({
      type: 'heart',
      x: 5,
      y: 15,
      width: 42,
      height: 35,
      rotation: -0.3,
    }),
    // Right top wing (heart)
    createShape({
      type: 'heart',
      x: 53,
      y: 15,
      width: 42,
      height: 35,
      rotation: 0.3,
    }),
    // Left bottom wing (circle)
    createShape({
      type: 'circle',
      x: 28,
      y: 55,
      radius: 15,
      rotation: 0,
    }),
    // Right bottom wing (circle)
    createShape({
      type: 'circle',
      x: 72,
      y: 55,
      radius: 15,
      rotation: 0,
    }),
  ],
}

const ratTemplate: TemplateDefinition = {
  id: 'rat-cute',
  name: 'Rat',
  category: 'animals',
  icon: '🐀',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 120, height: 80 },
  shapes: [
    // Body (large oval - using circle)
    createShape({
      type: 'circle',
      x: 55,
      y: 45,
      radius: 25,
      rotation: 0,
    }),
    // Head (circle, slightly smaller)
    createShape({
      type: 'circle',
      x: 25,
      y: 40,
      radius: 18,
      rotation: 0,
    }),
    // Snout (small circle)
    createShape({
      type: 'circle',
      x: 8,
      y: 45,
      radius: 8,
      rotation: 0,
    }),
    // Nose (tiny circle at tip)
    createShape({
      type: 'circle',
      x: 2,
      y: 45,
      radius: 3,
      rotation: 0,
    }),
    // Left ear (circle)
    createShape({
      type: 'circle',
      x: 18,
      y: 22,
      radius: 10,
      rotation: 0,
    }),
    // Right ear (circle)
    createShape({
      type: 'circle',
      x: 38,
      y: 20,
      radius: 10,
      rotation: 0,
    }),
    // Inner left ear (smaller circle)
    createShape({
      type: 'circle',
      x: 18,
      y: 22,
      radius: 5,
      rotation: 0,
    }),
    // Inner right ear (smaller circle)
    createShape({
      type: 'circle',
      x: 38,
      y: 20,
      radius: 5,
      rotation: 0,
    }),
    // Eye (circle)
    createShape({
      type: 'circle',
      x: 20,
      y: 38,
      radius: 4,
      rotation: 0,
    }),
    // Eye pupil
    createShape({
      type: 'circle',
      x: 19,
      y: 37,
      radius: 2,
      rotation: 0,
    }),
    // Whisker 1 (top left)
    createShape({
      type: 'line',
      x: 5,
      y: 40,
      x2: -12,
      y2: 35,
      rotation: 0,
      strokeWidth: 1.5,
    }),
    // Whisker 2 (middle left)
    createShape({
      type: 'line',
      x: 5,
      y: 45,
      x2: -15,
      y2: 45,
      rotation: 0,
      strokeWidth: 1.5,
    }),
    // Whisker 3 (bottom left)
    createShape({
      type: 'line',
      x: 5,
      y: 50,
      x2: -12,
      y2: 55,
      rotation: 0,
      strokeWidth: 1.5,
    }),
    // Front leg (small rectangle)
    createShape({
      type: 'rectangle',
      x: 35,
      y: 60,
      width: 8,
      height: 15,
      rotation: 0,
    }),
    // Back leg (small rectangle)
    createShape({
      type: 'rectangle',
      x: 65,
      y: 60,
      width: 10,
      height: 15,
      rotation: 0,
    }),
    // Tail start (line, curved effect with segments)
    createShape({
      type: 'line',
      x: 80,
      y: 45,
      x2: 95,
      y2: 50,
      rotation: 0,
      strokeWidth: 3,
    }),
    // Tail middle
    createShape({
      type: 'line',
      x: 95,
      y: 50,
      x2: 105,
      y2: 45,
      rotation: 0,
      strokeWidth: 2.5,
    }),
    // Tail end
    createShape({
      type: 'line',
      x: 105,
      y: 45,
      x2: 118,
      y2: 50,
      rotation: 0,
      strokeWidth: 2,
    }),
  ],
}

/**
 * Farm Scene - Barn with cow and fence
 */
const farmSceneTemplate: TemplateDefinition = {
  id: 'farm-scene',
  name: 'Farm',
  category: 'animals',
  icon: '🐄',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 130, height: 100 },
  shapes: [
    // Sun
    createShape({ type: 'circle', x: 110, y: 15, radius: 10, rotation: 0 }),
    // Barn body
    createShape({ type: 'rectangle', x: 70, y: 35, width: 45, height: 40, rotation: 0 }),
    // Barn roof
    createShape({ type: 'triangle', x: 65, y: 15, width: 55, height: 22, rotation: 0 }),
    // Barn door (large)
    createShape({ type: 'rectangle', x: 82, y: 50, width: 20, height: 25, rotation: 0 }),
    // Barn door arch
    createShape({ type: 'circle', x: 92, y: 50, radius: 10, rotation: 0 }),
    // Hay loft window
    createShape({ type: 'rectangle', x: 85, y: 25, width: 14, height: 10, rotation: 0 }),
    // Cow body
    createShape({ type: 'circle', x: 30, y: 60, radius: 18, rotation: 0 }),
    // Cow head
    createShape({ type: 'circle', x: 12, y: 55, radius: 12, rotation: 0 }),
    // Cow ears
    createShape({ type: 'circle', x: 5, y: 45, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 18, y: 43, radius: 5, rotation: 0 }),
    // Cow eye
    createShape({ type: 'circle', x: 8, y: 52, radius: 2, rotation: 0 }),
    // Cow nose
    createShape({ type: 'circle', x: 3, y: 60, radius: 4, rotation: 0 }),
    // Cow spots
    createShape({ type: 'circle', x: 25, y: 55, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 35, y: 62, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 28, y: 68, radius: 3, rotation: 0 }),
    // Cow legs
    createShape({ type: 'rectangle', x: 18, y: 72, width: 5, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 28, y: 72, width: 5, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 36, y: 72, width: 5, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 44, y: 72, width: 5, height: 15, rotation: 0 }),
    // Cow tail
    createShape({ type: 'line', x: 48, y: 58, x2: 55, y2: 65, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'circle', x: 56, y: 67, radius: 3, rotation: 0 }),
    // Fence posts
    createShape({ type: 'rectangle', x: 2, y: 80, width: 4, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 18, y: 80, width: 4, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 34, y: 80, width: 4, height: 15, rotation: 0 }),
    createShape({ type: 'rectangle', x: 50, y: 80, width: 4, height: 15, rotation: 0 }),
    // Fence rails
    createShape({ type: 'line', x: 2, y: 84, x2: 54, y2: 84, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 2, y: 90, x2: 54, y2: 90, rotation: 0, strokeWidth: 3 }),
    // Ground
    createShape({ type: 'line', x: 0, y: 95, x2: 130, y2: 95, rotation: 0, strokeWidth: 2 }),
  ],
}

/**
 * Owl - Detailed owl on a branch
 */
const owlTemplate: TemplateDefinition = {
  id: 'owl',
  name: 'Owl',
  category: 'animals',
  icon: '🦉',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Body (large oval)
    createShape({ type: 'circle', x: 50, y: 55, radius: 28, rotation: 0 }),
    // Head (circle)
    createShape({ type: 'circle', x: 50, y: 25, radius: 20, rotation: 0 }),
    // Left ear tuft
    createShape({ type: 'triangle', x: 30, y: 2, width: 12, height: 15, rotation: 0 }),
    // Right ear tuft
    createShape({ type: 'triangle', x: 58, y: 2, width: 12, height: 15, rotation: 0 }),
    // Left eye circle (large)
    createShape({ type: 'circle', x: 40, y: 22, radius: 10, rotation: 0 }),
    // Right eye circle (large)
    createShape({ type: 'circle', x: 60, y: 22, radius: 10, rotation: 0 }),
    // Left pupil
    createShape({ type: 'circle', x: 40, y: 22, radius: 5, rotation: 0 }),
    // Right pupil
    createShape({ type: 'circle', x: 60, y: 22, radius: 5, rotation: 0 }),
    // Inner pupil dots
    createShape({ type: 'circle', x: 40, y: 22, radius: 2, rotation: 0 }),
    createShape({ type: 'circle', x: 60, y: 22, radius: 2, rotation: 0 }),
    // Beak
    createShape({ type: 'triangle', x: 45, y: 28, width: 10, height: 10, rotation: Math.PI }),
    // Belly pattern (V shape made of lines)
    createShape({ type: 'line', x: 35, y: 45, x2: 50, y2: 70, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 65, y: 45, x2: 50, y2: 70, rotation: 0, strokeWidth: 2 }),
    // Wing pattern (left)
    createShape({ type: 'circle', x: 30, y: 55, radius: 12, rotation: 0 }),
    // Wing pattern (right)
    createShape({ type: 'circle', x: 70, y: 55, radius: 12, rotation: 0 }),
    // Feet
    createShape({ type: 'line', x: 40, y: 82, x2: 35, y2: 90, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 40, y: 82, x2: 40, y2: 92, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 40, y: 82, x2: 45, y2: 90, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 60, y: 82, x2: 55, y2: 90, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 60, y: 82, x2: 60, y2: 92, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'line', x: 60, y: 82, x2: 65, y2: 90, rotation: 0, strokeWidth: 3 }),
    // Branch
    createShape({ type: 'line', x: 10, y: 88, x2: 90, y2: 88, rotation: 0, strokeWidth: 5 }),
    // Branch texture
    createShape({ type: 'line', x: 15, y: 85, x2: 15, y2: 91, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 75, y: 85, x2: 75, y2: 91, rotation: 0, strokeWidth: 2 }),
    // Leaf on branch
    createShape({ type: 'heart', x: 80, y: 78, width: 12, height: 10, rotation: 0.5 }),
    // Moon in background
    createShape({ type: 'circle', x: 15, y: 15, radius: 12, rotation: 0 }),
  ],
}

// ============================================================================
// TEMPLATES: Objects
// ============================================================================

const starTemplate: TemplateDefinition = {
  id: 'star-large',
  name: 'Star',
  category: 'objects',
  icon: '⭐',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Single large star
    createShape({
      type: 'star',
      x: 50,
      y: 50,
      outerRadius: 45,
      innerRadius: 20,
      points: 5,
      rotation: 0,
    }),
  ],
}

const heartLargeTemplate: TemplateDefinition = {
  id: 'heart-large',
  name: 'Heart',
  category: 'objects',
  icon: '❤️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Single large heart
    createShape({
      type: 'heart',
      x: 10,
      y: 10,
      width: 80,
      height: 85,
      rotation: 0,
    }),
  ],
}

const balloonTemplate: TemplateDefinition = {
  id: 'balloon-simple',
  name: 'Balloon',
  category: 'objects',
  icon: '🎈',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 60, height: 100 },
  shapes: [
    // Balloon (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 30,
      radius: 25,
      rotation: 0,
    }),
    // Knot (triangle small)
    createShape({
      type: 'triangle',
      x: 24,
      y: 55,
      width: 12,
      height: 10,
      rotation: Math.PI,
    }),
    // String (line)
    createShape({
      type: 'line',
      x: 30,
      y: 62,
      x2: 30,
      y2: 98,
      rotation: 0,
      strokeWidth: 2,
    }),
  ],
}

/**
 * Gift Box - Present with bow and decorations
 */
const giftBoxTemplate: TemplateDefinition = {
  id: 'gift-box',
  name: 'Gift Box',
  category: 'objects',
  icon: '🎁',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Main box
    createShape({ type: 'rectangle', x: 15, y: 40, width: 70, height: 55, rotation: 0 }),
    // Box lid
    createShape({ type: 'rectangle', x: 10, y: 30, width: 80, height: 15, rotation: 0 }),
    // Vertical ribbon
    createShape({ type: 'rectangle', x: 42, y: 30, width: 16, height: 65, rotation: 0 }),
    // Horizontal ribbon
    createShape({ type: 'rectangle', x: 15, y: 55, width: 70, height: 12, rotation: 0 }),
    // Bow center
    createShape({ type: 'circle', x: 50, y: 20, radius: 8, rotation: 0 }),
    // Bow left loop
    createShape({ type: 'circle', x: 32, y: 18, radius: 12, rotation: 0 }),
    // Bow right loop
    createShape({ type: 'circle', x: 68, y: 18, radius: 12, rotation: 0 }),
    // Bow ribbon tails
    createShape({ type: 'triangle', x: 38, y: 25, width: 10, height: 15, rotation: 0.3 }),
    createShape({ type: 'triangle', x: 52, y: 25, width: 10, height: 15, rotation: -0.3 }),
    // Decorative dots on box
    createShape({ type: 'circle', x: 25, y: 50, radius: 3, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 50, radius: 3, rotation: 0 }),
    createShape({ type: 'circle', x: 25, y: 80, radius: 3, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 80, radius: 3, rotation: 0 }),
    // Stars decoration
    createShape({
      type: 'star',
      x: 28,
      y: 65,
      outerRadius: 5,
      innerRadius: 2,
      points: 5,
      rotation: 0,
    }),
    createShape({
      type: 'star',
      x: 72,
      y: 65,
      outerRadius: 5,
      innerRadius: 2,
      points: 5,
      rotation: 0,
    }),
  ],
}

/**
 * Umbrella - Open umbrella with rain
 */
const umbrellaTemplate: TemplateDefinition = {
  id: 'umbrella',
  name: 'Umbrella',
  category: 'objects',
  icon: '☂️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Umbrella canopy (scalloped edge with circles)
    createShape({ type: 'circle', x: 50, y: 30, radius: 35, rotation: 0 }),
    // Scallops along bottom edge
    createShape({ type: 'circle', x: 20, y: 40, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 35, y: 44, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 45, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 65, y: 44, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 80, y: 40, radius: 12, rotation: 0 }),
    // Umbrella sections (lines from center)
    createShape({ type: 'line', x: 50, y: 5, x2: 25, y2: 40, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 5, x2: 40, y2: 42, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 5, x2: 60, y2: 42, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 5, x2: 75, y2: 40, rotation: 0, strokeWidth: 2 }),
    // Top tip
    createShape({ type: 'circle', x: 50, y: 3, radius: 3, rotation: 0 }),
    // Handle (pole)
    createShape({ type: 'line', x: 50, y: 45, x2: 50, y2: 90, rotation: 0, strokeWidth: 4 }),
    // Handle curve
    createShape({ type: 'circle', x: 55, y: 92, radius: 8, rotation: 0 }),
    // Inner handle curve
    createShape({ type: 'circle', x: 55, y: 92, radius: 4, rotation: 0 }),
    // Rain drops
    createShape({ type: 'line', x: 10, y: 15, x2: 10, y2: 25, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 90, y: 20, x2: 90, y2: 30, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 5, y: 45, x2: 5, y2: 55, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 95, y: 50, x2: 95, y2: 60, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 12, y: 70, x2: 12, y2: 80, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 88, y: 75, x2: 88, y2: 85, rotation: 0, strokeWidth: 2 }),
    // Puddle
    createShape({ type: 'circle', x: 50, y: 98, radius: 20, rotation: 0 }),
  ],
}

// ============================================================================
// TEMPLATES: Food
// ============================================================================

const iceCreamTemplate: TemplateDefinition = {
  id: 'icecream-simple',
  name: 'Ice Cream',
  category: 'food',
  icon: '🍦',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 60, height: 100 },
  shapes: [
    // Cone (triangle)
    createShape({
      type: 'triangle',
      x: 10,
      y: 40,
      width: 40,
      height: 58,
      rotation: Math.PI,
    }),
    // Bottom scoop (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 35,
      radius: 18,
      rotation: 0,
    }),
    // Top scoop (circle)
    createShape({
      type: 'circle',
      x: 30,
      y: 12,
      radius: 15,
      rotation: 0,
    }),
  ],
}

const cupcakeTemplate: TemplateDefinition = {
  id: 'cupcake-simple',
  name: 'Cupcake',
  category: 'food',
  icon: '🧁',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 80, height: 100 },
  shapes: [
    // Wrapper base (rectangle)
    createShape({
      type: 'rectangle',
      x: 15,
      y: 50,
      width: 50,
      height: 45,
      rotation: 0,
    }),
    // Wrapper left side (triangle to make trapezoid effect)
    createShape({
      type: 'triangle',
      x: 8,
      y: 50,
      width: 15,
      height: 45,
      rotation: 0,
    }),
    // Wrapper right side (triangle)
    createShape({
      type: 'triangle',
      x: 57,
      y: 50,
      width: 15,
      height: 45,
      rotation: 0,
    }),
    // Frosting bottom (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: 42,
      radius: 22,
      rotation: 0,
    }),
    // Frosting middle (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: 25,
      radius: 18,
      rotation: 0,
    }),
    // Frosting top (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: 10,
      radius: 12,
      rotation: 0,
    }),
    // Cherry on top (circle)
    createShape({
      type: 'circle',
      x: 40,
      y: -2,
      radius: 6,
      rotation: 0,
    }),
  ],
}

/**
 * Birthday Cake - Layered cake with candles and decorations
 */
const birthdayCakeTemplate: TemplateDefinition = {
  id: 'birthday-cake',
  name: 'Birthday Cake',
  category: 'food',
  icon: '🎂',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Bottom layer (largest)
    createShape({ type: 'rectangle', x: 10, y: 65, width: 80, height: 25, rotation: 0 }),
    // Bottom layer top curve
    createShape({ type: 'circle', x: 50, y: 65, radius: 40, rotation: 0 }),
    // Middle layer
    createShape({ type: 'rectangle', x: 18, y: 42, width: 64, height: 25, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 42, radius: 32, rotation: 0 }),
    // Top layer (smallest)
    createShape({ type: 'rectangle', x: 28, y: 22, width: 44, height: 22, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 22, radius: 22, rotation: 0 }),
    // Frosting drips on bottom layer
    createShape({ type: 'circle', x: 20, y: 68, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 40, y: 70, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 60, y: 68, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 80, y: 70, radius: 6, rotation: 0 }),
    // Frosting drips on middle layer
    createShape({ type: 'circle', x: 30, y: 45, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 47, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 70, y: 45, radius: 4, rotation: 0 }),
    // Candles
    createShape({ type: 'rectangle', x: 35, y: 5, width: 4, height: 18, rotation: 0 }),
    createShape({ type: 'rectangle', x: 48, y: 3, width: 4, height: 20, rotation: 0 }),
    createShape({ type: 'rectangle', x: 61, y: 5, width: 4, height: 18, rotation: 0 }),
    // Flames
    createShape({ type: 'circle', x: 37, y: 2, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 0, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 63, y: 2, radius: 4, rotation: 0 }),
    // Decorations (cherries)
    createShape({ type: 'circle', x: 25, y: 55, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 58, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 75, y: 55, radius: 4, rotation: 0 }),
    // Plate
    createShape({ type: 'line', x: 5, y: 92, x2: 95, y2: 92, rotation: 0, strokeWidth: 3 }),
    createShape({ type: 'circle', x: 50, y: 92, radius: 48, rotation: 0 }),
  ],
}

/**
 * Pizza - Whole pizza with toppings
 */
const pizzaTemplate: TemplateDefinition = {
  id: 'pizza',
  name: 'Pizza',
  category: 'food',
  icon: '🍕',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Pizza base (circle)
    createShape({ type: 'circle', x: 50, y: 50, radius: 42, rotation: 0 }),
    // Crust edge (inner circle)
    createShape({ type: 'circle', x: 50, y: 50, radius: 36, rotation: 0 }),
    // Pizza slices (8 lines from center)
    createShape({ type: 'line', x: 50, y: 50, x2: 50, y2: 8, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 92, y2: 50, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 50, y2: 92, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 8, y2: 50, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 80, y2: 20, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 80, y2: 80, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 20, y2: 80, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 20, y2: 20, rotation: 0, strokeWidth: 2 }),
    // Pepperoni (circles scattered)
    createShape({ type: 'circle', x: 35, y: 25, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 65, y: 30, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 72, y: 55, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 60, y: 75, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 30, y: 70, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 25, y: 45, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 35, radius: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 45, y: 60, radius: 5, rotation: 0 }),
    // Mushrooms (small shapes)
    createShape({ type: 'circle', x: 40, y: 40, radius: 4, rotation: 0 }),
    createShape({ type: 'rectangle', x: 38, y: 40, width: 4, height: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 62, y: 62, radius: 4, rotation: 0 }),
    createShape({ type: 'rectangle', x: 60, y: 62, width: 4, height: 5, rotation: 0 }),
    createShape({ type: 'circle', x: 55, y: 22, radius: 4, rotation: 0 }),
    createShape({ type: 'rectangle', x: 53, y: 22, width: 4, height: 5, rotation: 0 }),
  ],
}

/**
 * Donut - Frosted donut with sprinkles
 */
const donutTemplate: TemplateDefinition = {
  id: 'donut',
  name: 'Donut',
  category: 'food',
  icon: '🍩',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Outer donut ring
    createShape({ type: 'circle', x: 50, y: 50, radius: 40, rotation: 0 }),
    // Donut hole
    createShape({ type: 'circle', x: 50, y: 50, radius: 15, rotation: 0 }),
    // Frosting edge (wavy effect with overlapping circles)
    createShape({ type: 'circle', x: 50, y: 15, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 70, y: 22, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 82, y: 40, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 82, y: 60, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 70, y: 78, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 85, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 30, y: 78, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 18, y: 60, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 18, y: 40, radius: 8, rotation: 0 }),
    createShape({ type: 'circle', x: 30, y: 22, radius: 8, rotation: 0 }),
    // Sprinkles (small rectangles scattered)
    createShape({ type: 'rectangle', x: 35, y: 25, width: 8, height: 3, rotation: 0.5 }),
    createShape({ type: 'rectangle', x: 55, y: 22, width: 8, height: 3, rotation: -0.3 }),
    createShape({ type: 'rectangle', x: 70, y: 35, width: 8, height: 3, rotation: 0.8 }),
    createShape({ type: 'rectangle', x: 72, y: 55, width: 8, height: 3, rotation: -0.5 }),
    createShape({ type: 'rectangle', x: 60, y: 70, width: 8, height: 3, rotation: 0.2 }),
    createShape({ type: 'rectangle', x: 40, y: 72, width: 8, height: 3, rotation: -0.4 }),
    createShape({ type: 'rectangle', x: 25, y: 60, width: 8, height: 3, rotation: 0.6 }),
    createShape({ type: 'rectangle', x: 22, y: 40, width: 8, height: 3, rotation: -0.2 }),
    createShape({ type: 'rectangle', x: 45, y: 35, width: 6, height: 2, rotation: 0.3 }),
    createShape({ type: 'rectangle', x: 58, y: 45, width: 6, height: 2, rotation: -0.6 }),
    createShape({ type: 'rectangle', x: 50, y: 62, width: 6, height: 2, rotation: 0.4 }),
    createShape({ type: 'rectangle', x: 32, y: 48, width: 6, height: 2, rotation: -0.1 }),
  ],
}

// ============================================================================
// TEMPLATES: Abstract (Mathematical Patterns)
// ============================================================================

// Golden Ratio constant φ ≈ 1.618
const PHI = 1.618033988749

/**
 * Golden Spiral - Fibonacci-inspired arrangement of circles
 * Uses the golden ratio for sizing
 */
const goldenSpiralTemplate: TemplateDefinition = {
  id: 'golden-spiral',
  name: 'Golden Spiral',
  category: 'abstract',
  icon: '🌀',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Largest circle (Fibonacci 13)
    createShape({
      type: 'circle',
      x: 65,
      y: 65,
      radius: 32,
      rotation: 0,
    }),
    // Second largest (Fibonacci 8)
    createShape({
      type: 'circle',
      x: 35,
      y: 55,
      radius: 20,
      rotation: 0,
    }),
    // Third (Fibonacci 5)
    createShape({
      type: 'circle',
      x: 45,
      y: 30,
      radius: 12,
      rotation: 0,
    }),
    // Fourth (Fibonacci 3)
    createShape({
      type: 'circle',
      x: 60,
      y: 35,
      radius: 8,
      rotation: 0,
    }),
    // Fifth (Fibonacci 2)
    createShape({
      type: 'circle',
      x: 58,
      y: 48,
      radius: 5,
      rotation: 0,
    }),
    // Sixth (Fibonacci 1)
    createShape({
      type: 'circle',
      x: 52,
      y: 45,
      radius: 3,
      rotation: 0,
    }),
    // Golden rectangle outline
    createShape({
      type: 'rectangle',
      x: 10,
      y: 15,
      width: 80,
      height: 80 / PHI,
      rotation: 0,
    }),
  ],
}

/**
 * Mandala - Radial symmetry pattern
 * 8-fold symmetry with circles
 */
const mandalaTemplate: TemplateDefinition = {
  id: 'mandala-simple',
  name: 'Mandala',
  category: 'abstract',
  icon: '☸️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Center circle
    createShape({
      type: 'circle',
      x: 50,
      y: 50,
      radius: 8,
      rotation: 0,
    }),
    // Middle ring
    createShape({
      type: 'circle',
      x: 50,
      y: 50,
      radius: 20,
      rotation: 0,
    }),
    // Outer ring
    createShape({
      type: 'circle',
      x: 50,
      y: 50,
      radius: 35,
      rotation: 0,
    }),
    // 8 petals around the middle (circles at 45° intervals)
    // Top
    createShape({ type: 'circle', x: 50, y: 25, radius: 8, rotation: 0 }),
    // Top-right
    createShape({ type: 'circle', x: 68, y: 32, radius: 8, rotation: 0 }),
    // Right
    createShape({ type: 'circle', x: 75, y: 50, radius: 8, rotation: 0 }),
    // Bottom-right
    createShape({ type: 'circle', x: 68, y: 68, radius: 8, rotation: 0 }),
    // Bottom
    createShape({ type: 'circle', x: 50, y: 75, radius: 8, rotation: 0 }),
    // Bottom-left
    createShape({ type: 'circle', x: 32, y: 68, radius: 8, rotation: 0 }),
    // Left
    createShape({ type: 'circle', x: 25, y: 50, radius: 8, rotation: 0 }),
    // Top-left
    createShape({ type: 'circle', x: 32, y: 32, radius: 8, rotation: 0 }),
    // Outer decorative circles (larger radius)
    createShape({ type: 'circle', x: 50, y: 10, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 78, y: 22, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 90, y: 50, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 78, y: 78, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 90, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 22, y: 78, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 10, y: 50, radius: 6, rotation: 0 }),
    createShape({ type: 'circle', x: 22, y: 22, radius: 6, rotation: 0 }),
  ],
}

/**
 * Honeycomb - Hexagonal pattern
 * Based on 60° geometry
 */
const honeycombTemplate: TemplateDefinition = {
  id: 'honeycomb',
  name: 'Honeycomb',
  category: 'abstract',
  icon: '🔷',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Center hexagon approximated with 6 triangles
    // Row 1 - center
    createShape({ type: 'circle', x: 50, y: 50, radius: 15, rotation: 0 }),
    // Row 1 - surrounding 6 hexagons
    createShape({ type: 'circle', x: 50, y: 20, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 76, y: 35, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 76, y: 65, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 80, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 24, y: 65, radius: 12, rotation: 0 }),
    createShape({ type: 'circle', x: 24, y: 35, radius: 12, rotation: 0 }),
    // Outer partial hexagons
    createShape({ type: 'circle', x: 50, y: -5, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 93, y: 25, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 93, y: 75, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 105, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 7, y: 75, radius: 10, rotation: 0 }),
    createShape({ type: 'circle', x: 7, y: 25, radius: 10, rotation: 0 }),
  ],
}

/**
 * Concentric Circles - Bullseye pattern
 * Uses even spacing
 */
const concentricCirclesTemplate: TemplateDefinition = {
  id: 'concentric-circles',
  name: 'Bullseye',
  category: 'abstract',
  icon: '🎯',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Center dot
    createShape({ type: 'circle', x: 50, y: 50, radius: 5, rotation: 0 }),
    // Ring 1
    createShape({ type: 'circle', x: 50, y: 50, radius: 12, rotation: 0 }),
    // Ring 2
    createShape({ type: 'circle', x: 50, y: 50, radius: 19, rotation: 0 }),
    // Ring 3
    createShape({ type: 'circle', x: 50, y: 50, radius: 26, rotation: 0 }),
    // Ring 4
    createShape({ type: 'circle', x: 50, y: 50, radius: 33, rotation: 0 }),
    // Ring 5
    createShape({ type: 'circle', x: 50, y: 50, radius: 40, rotation: 0 }),
    // Outer ring
    createShape({ type: 'circle', x: 50, y: 50, radius: 47, rotation: 0 }),
  ],
}

/**
 * Triangle Mosaic - Triangular tessellation
 */
const triangleMosaicTemplate: TemplateDefinition = {
  id: 'triangle-mosaic',
  name: 'Triangles',
  category: 'abstract',
  icon: '🔺',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 90 },
  shapes: [
    // Row 1 - pointing up
    createShape({ type: 'triangle', x: 5, y: 0, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 35, y: 0, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 65, y: 0, width: 30, height: 30, rotation: 0 }),
    // Row 1 - pointing down (between up triangles)
    createShape({ type: 'triangle', x: 20, y: 0, width: 30, height: 30, rotation: Math.PI }),
    createShape({ type: 'triangle', x: 50, y: 0, width: 30, height: 30, rotation: Math.PI }),
    // Row 2 - pointing up
    createShape({ type: 'triangle', x: 5, y: 30, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 35, y: 30, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 65, y: 30, width: 30, height: 30, rotation: 0 }),
    // Row 2 - pointing down
    createShape({ type: 'triangle', x: 20, y: 30, width: 30, height: 30, rotation: Math.PI }),
    createShape({ type: 'triangle', x: 50, y: 30, width: 30, height: 30, rotation: Math.PI }),
    // Row 3 - pointing up
    createShape({ type: 'triangle', x: 5, y: 60, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 35, y: 60, width: 30, height: 30, rotation: 0 }),
    createShape({ type: 'triangle', x: 65, y: 60, width: 30, height: 30, rotation: 0 }),
    // Row 3 - pointing down
    createShape({ type: 'triangle', x: 20, y: 60, width: 30, height: 30, rotation: Math.PI }),
    createShape({ type: 'triangle', x: 50, y: 60, width: 30, height: 30, rotation: Math.PI }),
  ],
}

/**
 * Pinwheel - Rotating triangles around a center
 * 6-fold rotational symmetry
 */
const pinwheelTemplate: TemplateDefinition = {
  id: 'pinwheel',
  name: 'Pinwheel',
  category: 'abstract',
  icon: '🎡',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Center circle
    createShape({ type: 'circle', x: 50, y: 50, radius: 8, rotation: 0 }),
    // 6 blades radiating out (triangles at 60° intervals)
    // Blade 0° (pointing right-up)
    createShape({ type: 'triangle', x: 50, y: 25, width: 35, height: 25, rotation: -0.5 }),
    // Blade 60°
    createShape({ type: 'triangle', x: 70, y: 38, width: 35, height: 25, rotation: 0.55 }),
    // Blade 120°
    createShape({ type: 'triangle', x: 70, y: 62, width: 35, height: 25, rotation: 1.6 }),
    // Blade 180°
    createShape({ type: 'triangle', x: 50, y: 75, width: 35, height: 25, rotation: 2.6 }),
    // Blade 240°
    createShape({ type: 'triangle', x: 30, y: 62, width: 35, height: 25, rotation: -2.1 }),
    // Blade 300°
    createShape({ type: 'triangle', x: 30, y: 38, width: 35, height: 25, rotation: -1.05 }),
    // Outer circle border
    createShape({ type: 'circle', x: 50, y: 50, radius: 45, rotation: 0 }),
  ],
}

/**
 * Yin Yang - Classic balance symbol
 * Uses mathematical curves approximated with circles
 */
const yinYangTemplate: TemplateDefinition = {
  id: 'yin-yang',
  name: 'Yin Yang',
  category: 'abstract',
  icon: '☯️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Outer circle
    createShape({ type: 'circle', x: 50, y: 50, radius: 45, rotation: 0 }),
    // Dividing line (approximated with shapes)
    // Top half circle (white side)
    createShape({ type: 'circle', x: 50, y: 27, radius: 22, rotation: 0 }),
    // Bottom half circle (black side)
    createShape({ type: 'circle', x: 50, y: 73, radius: 22, rotation: 0 }),
    // Small circle in top (dot in white)
    createShape({ type: 'circle', x: 50, y: 27, radius: 6, rotation: 0 }),
    // Small circle in bottom (dot in black)
    createShape({ type: 'circle', x: 50, y: 73, radius: 6, rotation: 0 }),
    // Center vertical line to suggest the S-curve
    createShape({
      type: 'line',
      x: 50,
      y: 5,
      x2: 50,
      y2: 50,
      rotation: 0,
      strokeWidth: 2,
    }),
    createShape({
      type: 'line',
      x: 50,
      y: 50,
      x2: 50,
      y2: 95,
      rotation: 0,
      strokeWidth: 2,
    }),
  ],
}

/**
 * Spiral Squares - Nested rotating squares
 * Each square is rotated 15° from the previous
 */
const spiralSquaresTemplate: TemplateDefinition = {
  id: 'spiral-squares',
  name: 'Spiral Squares',
  category: 'abstract',
  icon: '🔲',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Largest square (0°)
    createShape({ type: 'rectangle', x: 5, y: 5, width: 90, height: 90, rotation: 0 }),
    // Slightly smaller, rotated 10°
    createShape({ type: 'rectangle', x: 10, y: 10, width: 80, height: 80, rotation: 0.17 }),
    // More rotated
    createShape({ type: 'rectangle', x: 15, y: 15, width: 70, height: 70, rotation: 0.35 }),
    createShape({ type: 'rectangle', x: 20, y: 20, width: 60, height: 60, rotation: 0.52 }),
    createShape({ type: 'rectangle', x: 25, y: 25, width: 50, height: 50, rotation: 0.7 }),
    createShape({ type: 'rectangle', x: 30, y: 30, width: 40, height: 40, rotation: 0.87 }),
    createShape({ type: 'rectangle', x: 35, y: 35, width: 30, height: 30, rotation: 1.05 }),
    createShape({ type: 'rectangle', x: 40, y: 40, width: 20, height: 20, rotation: 1.22 }),
    // Center dot
    createShape({ type: 'circle', x: 50, y: 50, radius: 5, rotation: 0 }),
  ],
}

/**
 * Starburst - Radiating lines from center with decorative elements
 */
const starburstTemplate: TemplateDefinition = {
  id: 'starburst',
  name: 'Starburst',
  category: 'abstract',
  icon: '✴️',
  source: 'primitives',
  license: 'cc0',
  viewBox: { width: 100, height: 100 },
  shapes: [
    // Center circle
    createShape({ type: 'circle', x: 50, y: 50, radius: 10, rotation: 0 }),
    // Inner circle
    createShape({ type: 'circle', x: 50, y: 50, radius: 5, rotation: 0 }),
    // 12 rays (every 30°)
    createShape({ type: 'line', x: 50, y: 50, x2: 50, y2: 5, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 73, y2: 13, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 95, y2: 50, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 73, y2: 87, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 50, y2: 95, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 27, y2: 87, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 5, y2: 50, rotation: 0, strokeWidth: 2 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 27, y2: 13, rotation: 0, strokeWidth: 2 }),
    // Secondary shorter rays (at 15° offsets)
    createShape({ type: 'line', x: 50, y: 50, x2: 62, y2: 15, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 85, y2: 30, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 85, y2: 70, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 62, y2: 85, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 38, y2: 85, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 15, y2: 70, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 15, y2: 30, rotation: 0, strokeWidth: 1.5 }),
    createShape({ type: 'line', x: 50, y: 50, x2: 38, y2: 15, rotation: 0, strokeWidth: 1.5 }),
    // Decorative circles at cardinal points
    createShape({ type: 'circle', x: 50, y: 5, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 95, y: 50, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 50, y: 95, radius: 4, rotation: 0 }),
    createShape({ type: 'circle', x: 5, y: 50, radius: 4, rotation: 0 }),
    // Decorative diamonds at diagonal points
    createShape({ type: 'rectangle', x: 70, y: 10, width: 8, height: 8, rotation: Math.PI / 4 }),
    createShape({ type: 'rectangle', x: 70, y: 82, width: 8, height: 8, rotation: Math.PI / 4 }),
    createShape({ type: 'rectangle', x: 22, y: 82, width: 8, height: 8, rotation: Math.PI / 4 }),
    createShape({ type: 'rectangle', x: 22, y: 10, width: 8, height: 8, rotation: Math.PI / 4 }),
  ],
}

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

/**
 * All available templates organized by category
 */
export const templates: TemplateDefinition[] = [
  // Buildings (5)
  houseTemplate,
  fireStationTemplate,
  castleTemplate,
  lighthouseTemplate,
  windmillTemplate,
  // Vehicles (5)
  carTemplate,
  rocketTemplate,
  trainTemplate,
  sailboatTemplate,
  helicopterTemplate,
  // Nature (5)
  treeTemplate,
  flowerTemplate,
  sunTemplate,
  mountainSceneTemplate,
  rainbowTemplate,
  // Characters (5)
  snowmanTemplate,
  robotTemplate,
  princessTemplate,
  pirateTemplate,
  astronautTemplate,
  // Animals (5)
  fishTemplate,
  butterflyTemplate,
  ratTemplate,
  farmSceneTemplate,
  owlTemplate,
  // Objects (5)
  starTemplate,
  heartLargeTemplate,
  balloonTemplate,
  giftBoxTemplate,
  umbrellaTemplate,
  // Food (5)
  iceCreamTemplate,
  cupcakeTemplate,
  birthdayCakeTemplate,
  pizzaTemplate,
  donutTemplate,
  // Abstract (9)
  goldenSpiralTemplate,
  mandalaTemplate,
  honeycombTemplate,
  concentricCirclesTemplate,
  triangleMosaicTemplate,
  pinwheelTemplate,
  yinYangTemplate,
  spiralSquaresTemplate,
  starburstTemplate,
]

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: TemplateDefinition['category']
): TemplateDefinition[] {
  return templates.filter(t => t.category === category)
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): TemplateDefinition | undefined {
  return templates.find(t => t.id === id)
}

/**
 * Get all unique categories
 */
export function getCategories(): TemplateDefinition['category'][] {
  const categories = new Set(templates.map(t => t.category))
  return Array.from(categories)
}

/**
 * Category metadata for UI display
 */
export const categoryInfo: Record<TemplateDefinition['category'], { icon: string; label: string }> =
  {
    animals: { icon: '🐾', label: 'Animals' },
    vehicles: { icon: '🚗', label: 'Vehicles' },
    nature: { icon: '🌿', label: 'Nature' },
    buildings: { icon: '🏠', label: 'Buildings' },
    objects: { icon: '⭐', label: 'Objects' },
    characters: { icon: '🎭', label: 'Characters' },
    food: { icon: '🍕', label: 'Food' },
    abstract: { icon: '🔷', label: 'Abstract' },
    fantasy: { icon: '🦄', label: 'Fantasy' },
  }
