/**
 * Stamp Library - Kid-friendly SVG stamps for the Stickers/Stamps tool
 *
 * All stamps use a viewBox of 64x64 for consistent sizing.
 * Path data is designed to be rendered with Path2D on canvas.
 *
 * Categories: emoji, animals, nature, shapes, symbols
 */

// ============================================================================
// TYPES
// ============================================================================

export type StampCategory = 'emoji' | 'animals' | 'nature' | 'shapes' | 'symbols'

export type StampSizePreset = 'small' | 'medium' | 'large'

export interface StampDefinition {
  id: string
  name: string
  category: StampCategory
  icon: string // Emoji for UI preview
  // SVG path data for rendering on canvas
  paths: StampPath[]
  viewBox: { width: number; height: number }
}

export interface StampPath {
  d: string // SVG path data
  fill?: string // Fill color (default: currentColor/black)
  stroke?: string // Stroke color (optional)
  strokeWidth?: number
}

// ============================================================================
// SIZE PRESETS
// ============================================================================

export const STAMP_BASE_SIZE = 64 // Base size in pixels (matches viewBox)

export const STAMP_SIZE_SCALES: Record<StampSizePreset, number> = {
  small: 0.5, // 32px
  medium: 1.0, // 64px
  large: 1.5, // 96px
}

export function getStampSize(preset: StampSizePreset): number {
  return STAMP_BASE_SIZE * STAMP_SIZE_SCALES[preset]
}

// ============================================================================
// STAMPS: Emoji
// ============================================================================

const smileyStamp: StampDefinition = {
  id: 'smiley',
  name: 'Smiley',
  category: 'emoji',
  icon: '😊',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Face circle (filled white for flood fill to work)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (larger)
    { d: 'M22 22 A4 4 0 1 0 22 30 A4 4 0 1 0 22 22 Z', fill: '#000' },
    // Right eye (larger)
    { d: 'M42 22 A4 4 0 1 0 42 30 A4 4 0 1 0 42 22 Z', fill: '#000' },
    // Smile arc
    { d: 'M18 36 Q32 50 46 36', stroke: '#000', strokeWidth: 2.5 },
  ],
}

const heartEyesStamp: StampDefinition = {
  id: 'heart-eyes',
  name: 'Heart Eyes',
  category: 'emoji',
  icon: '😍',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Face circle (filled for flood fill)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left heart eye (larger, red)
    { d: 'M14 22 Q14 16 20 16 Q26 16 26 22 L20 32 L14 22 Z', fill: '#FF0000' },
    // Right heart eye (larger, red)
    { d: 'M38 22 Q38 16 44 16 Q50 16 50 22 L44 32 L38 22 Z', fill: '#FF0000' },
    // Big smile
    { d: 'M16 38 Q32 54 48 38', stroke: '#000', strokeWidth: 2.5 },
  ],
}

const laughingStamp: StampDefinition = {
  id: 'laughing',
  name: 'Laughing',
  category: 'emoji',
  icon: '😂',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Face circle (filled for flood fill)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left closed eye (arc, thicker)
    { d: 'M14 26 Q22 18 30 26', stroke: '#000', strokeWidth: 3 },
    // Right closed eye (arc, thicker)
    { d: 'M34 26 Q42 18 50 26', stroke: '#000', strokeWidth: 3 },
    // Open mouth laugh (filled)
    { d: 'M18 36 Q32 56 46 36 Q32 44 18 36 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    // Tear drop (blue)
    { d: 'M10 30 Q8 38 14 36 Q10 30 10 30 Z', fill: '#00BFFF' },
  ],
}

const coolStamp: StampDefinition = {
  id: 'cool',
  name: 'Cool',
  category: 'emoji',
  icon: '😎',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Face circle (filled for flood fill)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Sunglasses left lens (larger, rounded)
    { d: 'M8 20 L8 32 L28 32 L28 20 Z', fill: '#000', stroke: '#000', strokeWidth: 2 },
    // Sunglasses right lens (larger, rounded)
    { d: 'M36 20 L36 32 L56 32 L56 20 Z', fill: '#000', stroke: '#000', strokeWidth: 2 },
    // Sunglasses bridge
    { d: 'M28 26 L36 26', stroke: '#000', strokeWidth: 2.5 },
    // Smirk
    { d: 'M20 42 Q32 50 44 42', stroke: '#000', strokeWidth: 2.5 },
  ],
}

const winkStamp: StampDefinition = {
  id: 'wink',
  name: 'Wink',
  category: 'emoji',
  icon: '😉',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Face circle (filled for flood fill)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (open, larger)
    { d: 'M22 22 A4 4 0 1 0 22 30 A4 4 0 1 0 22 22 Z', fill: '#000' },
    // Right eye (winking - arc, thicker)
    { d: 'M36 26 Q44 22 52 26', stroke: '#000', strokeWidth: 3 },
    // Smile
    { d: 'M20 40 Q32 50 44 40', stroke: '#000', strokeWidth: 2.5 },
  ],
}

// ============================================================================
// STAMPS: Animals
// ============================================================================

const catStamp: StampDefinition = {
  id: 'cat',
  name: 'Cat',
  category: 'animals',
  icon: '🐱',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Left ear (filled, larger)
    { d: 'M10 20 L4 2 L24 14 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 1.5 },
    // Right ear (filled, larger)
    { d: 'M54 20 L60 2 L40 14 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 1.5 },
    // Face (filled for flood fill)
    {
      d: 'M32 14 A20 18 0 1 0 32 50 A20 18 0 1 0 32 14 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (larger cat eye)
    { d: 'M20 26 L26 30 L20 34 Z', fill: '#000' },
    // Right eye (larger cat eye)
    { d: 'M44 26 L38 30 L44 34 Z', fill: '#000' },
    // Nose (larger, pink)
    { d: 'M32 35 L28 40 L36 40 Z', fill: '#FF69B4' },
    // Mouth
    {
      d: 'M32 40 L32 44 M32 44 Q26 48 24 44 M32 44 Q38 48 40 44',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Whiskers left
    { d: 'M4 32 L18 34 M4 38 L18 38 M4 44 L18 42', stroke: '#000', strokeWidth: 1.5 },
    // Whiskers right
    { d: 'M60 32 L46 34 M60 38 L46 38 M60 44 L46 42', stroke: '#000', strokeWidth: 1.5 },
  ],
}

const dogStamp: StampDefinition = {
  id: 'dog',
  name: 'Dog',
  category: 'animals',
  icon: '🐶',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Left ear (floppy, filled, wider)
    { d: 'M6 22 Q-2 8 6 4 Q16 2 18 22 L6 22 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 1.5 },
    // Right ear (floppy, filled, wider)
    {
      d: 'M58 22 Q66 8 58 4 Q48 2 46 22 L58 22 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Face (filled for flood fill)
    {
      d: 'M32 12 A22 20 0 1 0 32 52 A22 20 0 1 0 32 12 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (larger)
    { d: 'M20 26 A5 5 0 1 0 20 36 A5 5 0 1 0 20 26 Z', fill: '#000' },
    // Right eye (larger)
    { d: 'M44 26 A5 5 0 1 0 44 36 A5 5 0 1 0 44 26 Z', fill: '#000' },
    // Nose (big oval)
    { d: 'M32 36 A7 5 0 1 0 32 46 A7 5 0 1 0 32 36 Z', fill: '#000' },
    // Tongue
    { d: 'M29 50 Q32 60 35 50', stroke: '#FF69B4', strokeWidth: 4 },
  ],
}

const bunnyStamp: StampDefinition = {
  id: 'bunny',
  name: 'Bunny',
  category: 'animals',
  icon: '🐰',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Left ear (wider, thinner stroke for better filling)
    {
      d: 'M18 6 Q10 4 12 26 Q14 32 26 28 Q30 6 18 6 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Right ear (wider, thinner stroke for better filling)
    {
      d: 'M46 6 Q54 4 52 26 Q50 32 38 28 Q34 6 46 6 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Face (filled for flood fill)
    {
      d: 'M32 28 A16 14 0 1 0 32 56 A16 14 0 1 0 32 28 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (larger for better visibility)
    { d: 'M24 36 A3 4 0 1 0 24 44 A3 4 0 1 0 24 36 Z', fill: '#000' },
    // Right eye (larger for better visibility)
    { d: 'M40 36 A3 4 0 1 0 40 44 A3 4 0 1 0 40 36 Z', fill: '#000' },
    // Nose
    { d: 'M32 47 A2 2 0 1 0 32 51 A2 2 0 1 0 32 47 Z', fill: '#FF69B4' },
    // Mouth
    { d: 'M32 51 L32 55 M29 55 L32 55 L35 55', stroke: '#000', strokeWidth: 1.5 },
  ],
}

const bearStamp: StampDefinition = {
  id: 'bear',
  name: 'Bear',
  category: 'animals',
  icon: '🐻',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Left ear (filled, larger)
    {
      d: 'M12 12 A10 10 0 1 0 12 32 A10 10 0 1 0 12 12 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Right ear (filled, larger)
    {
      d: 'M52 12 A10 10 0 1 0 52 32 A10 10 0 1 0 52 12 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Face (filled for flood fill)
    {
      d: 'M32 16 A20 22 0 1 0 32 60 A20 22 0 1 0 32 16 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Left eye (larger)
    { d: 'M22 30 A4 4 0 1 0 22 38 A4 4 0 1 0 22 30 Z', fill: '#000' },
    // Right eye (larger)
    { d: 'M42 30 A4 4 0 1 0 42 38 A4 4 0 1 0 42 30 Z', fill: '#000' },
    // Snout (filled)
    {
      d: 'M32 40 A10 8 0 1 0 32 56 A10 8 0 1 0 32 40 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 1.5,
    },
    // Nose (larger)
    { d: 'M32 43 A5 4 0 1 0 32 51 A5 4 0 1 0 32 43 Z', fill: '#000' },
  ],
}

const birdStamp: StampDefinition = {
  id: 'bird',
  name: 'Bird',
  category: 'animals',
  icon: '🐦',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Body (filled)
    {
      d: 'M32 24 A16 14 0 1 0 32 52 A16 14 0 1 0 32 24 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Head (filled)
    {
      d: 'M48 20 A10 10 0 1 0 48 40 A10 10 0 1 0 48 20 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Eye (larger - radius 4 for better visibility and to prevent accidental fill)
    { d: 'M52 26 A4 4 0 1 0 52 34 A4 4 0 1 0 52 26 Z', fill: '#000' },
    // Beak (filled)
    { d: 'M58 28 L68 32 L58 36 Z', fill: '#FFA500', stroke: '#000', strokeWidth: 1.5 },
    // Wing (filled)
    { d: 'M24 32 Q18 42 28 46 Q38 42 32 32 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 1.5 },
    // Tail feathers
    { d: 'M16 36 L4 30 M16 38 L2 38 M16 40 L4 46', stroke: '#000', strokeWidth: 2 },
    // Legs
    { d: 'M28 52 L28 60 L22 62 M28 60 L34 62', stroke: '#FFA500', strokeWidth: 2 },
    { d: 'M36 52 L36 60 L30 62 M36 60 L42 62', stroke: '#FFA500', strokeWidth: 2 },
  ],
}

// ============================================================================
// STAMPS: Nature
// ============================================================================

const flowerStamp: StampDefinition = {
  id: 'flower',
  name: 'Flower',
  category: 'nature',
  icon: '🌸',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Petals (5 circles around center, filled)
    {
      d: 'M32 8 A10 10 0 1 0 32 28 A10 10 0 1 0 32 8 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    {
      d: 'M46 20 A10 10 0 1 0 46 40 A10 10 0 1 0 46 20 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    {
      d: 'M40 40 A10 10 0 1 0 40 60 A10 10 0 1 0 40 40 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    {
      d: 'M24 40 A10 10 0 1 0 24 60 A10 10 0 1 0 24 40 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    {
      d: 'M18 20 A10 10 0 1 0 18 40 A10 10 0 1 0 18 20 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2,
    },
    // Center (filled)
    {
      d: 'M32 24 A8 8 0 1 0 32 40 A8 8 0 1 0 32 24 Z',
      fill: '#FFD700',
      stroke: '#000',
      strokeWidth: 2.5,
    },
  ],
}

const starStamp: StampDefinition = {
  id: 'star',
  name: 'Star',
  category: 'nature',
  icon: '⭐',
  viewBox: { width: 64, height: 64 },
  paths: [
    // 5-pointed star (filled)
    {
      d: 'M32 4 L38 24 L60 24 L42 38 L50 60 L32 46 L14 60 L22 38 L4 24 L26 24 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
  ],
}

const sunStamp: StampDefinition = {
  id: 'sun',
  name: 'Sun',
  category: 'nature',
  icon: '☀️',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Center circle (filled)
    {
      d: 'M32 18 A14 14 0 1 0 32 46 A14 14 0 1 0 32 18 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
    // Rays
    { d: 'M32 4 L32 14', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M32 50 L32 60', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M4 32 L14 32', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M50 32 L60 32', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M12 12 L20 20', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M44 44 L52 52', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M52 12 L44 20', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M20 44 L12 52', stroke: '#000', strokeWidth: 2.5 },
  ],
}

const cloudStamp: StampDefinition = {
  id: 'cloud',
  name: 'Cloud',
  category: 'nature',
  icon: '☁️',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Cloud puffs (filled, simpler path)
    {
      d: 'M16 40 A12 12 0 1 1 28 28 A14 14 0 1 1 48 28 A12 12 0 1 1 56 40 L16 40 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
  ],
}

const treeStamp: StampDefinition = {
  id: 'tree',
  name: 'Tree',
  category: 'nature',
  icon: '🌲',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Top triangle (filled)
    { d: 'M32 4 L44 24 L20 24 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    // Middle triangle (filled)
    { d: 'M32 16 L48 36 L16 36 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    // Bottom triangle (filled)
    { d: 'M32 28 L52 48 L12 48 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    // Trunk (filled)
    { d: 'M28 48 L28 60 L36 60 L36 48 Z', fill: '#8B4513', stroke: '#000', strokeWidth: 2 },
  ],
}

// ============================================================================
// STAMPS: Shapes
// ============================================================================

const heartStamp: StampDefinition = {
  id: 'heart',
  name: 'Heart',
  category: 'shapes',
  icon: '❤️',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Heart shape (filled)
    {
      d: 'M32 56 L8 32 Q8 8 32 16 Q56 8 56 32 L32 56 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
  ],
}

const diamondStamp: StampDefinition = {
  id: 'diamond',
  name: 'Diamond',
  category: 'shapes',
  icon: '💎',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Diamond outline (filled)
    { d: 'M32 4 L56 24 L32 60 L8 24 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2.5 },
    // Top facet
    { d: 'M32 4 L20 24 L44 24 Z', fill: '#E0F7FA', stroke: '#000', strokeWidth: 2 },
    // Inner lines
    { d: 'M20 24 L32 60 L44 24', stroke: '#000', strokeWidth: 2 },
  ],
}

const crownStamp: StampDefinition = {
  id: 'crown',
  name: 'Crown',
  category: 'shapes',
  icon: '👑',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Crown base (filled)
    {
      d: 'M8 52 L8 28 L20 40 L32 20 L44 40 L56 28 L56 52 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
    // Jewels
    { d: 'M32 28 A4 4 0 1 0 32 36 A4 4 0 1 0 32 28 Z', fill: '#FF0000' },
    { d: 'M20 40 A3 3 0 1 0 20 46 A3 3 0 1 0 20 40 Z', fill: '#00FF00' },
    { d: 'M44 40 A3 3 0 1 0 44 46 A3 3 0 1 0 44 40 Z', fill: '#0000FF' },
  ],
}

const balloonStamp: StampDefinition = {
  id: 'balloon',
  name: 'Balloon',
  category: 'shapes',
  icon: '🎈',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Balloon body (filled)
    {
      d: 'M32 4 A18 22 0 1 0 32 48 A18 22 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
    // Knot (filled)
    { d: 'M28 48 L32 54 L36 48 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    // String
    { d: 'M32 54 Q28 58 32 62', stroke: '#000', strokeWidth: 2 },
  ],
}

const musicNoteStamp: StampDefinition = {
  id: 'music-note',
  name: 'Music Note',
  category: 'shapes',
  icon: '🎵',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Note head (filled)
    { d: 'M20 44 A8 6 -30 1 0 20 56 A8 6 -30 1 0 20 44 Z', fill: '#000' },
    // Stem
    { d: 'M28 50 L28 12', stroke: '#000', strokeWidth: 3 },
    // Flag (filled)
    { d: 'M28 12 Q40 16 40 28 Q36 24 28 24 Z', fill: '#000', stroke: '#000', strokeWidth: 2.5 },
  ],
}

// ============================================================================
// STAMPS: Symbols
// ============================================================================

const thunderboltStamp: StampDefinition = {
  id: 'thunderbolt',
  name: 'Lightning',
  category: 'symbols',
  icon: '⚡',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Lightning bolt (filled)
    {
      d: 'M36 4 L16 32 L28 32 L24 60 L48 28 L36 28 L40 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
  ],
}

const rainbowStamp: StampDefinition = {
  id: 'rainbow',
  name: 'Rainbow',
  category: 'symbols',
  icon: '🌈',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Rainbow arcs (colored)
    { d: 'M4 56 A28 28 0 0 1 60 56', stroke: '#FF0000', strokeWidth: 4 },
    { d: 'M8 56 A24 24 0 0 1 56 56', stroke: '#FFA500', strokeWidth: 4 },
    { d: 'M12 56 A20 20 0 0 1 52 56', stroke: '#FFFF00', strokeWidth: 4 },
    { d: 'M16 56 A16 16 0 0 1 48 56', stroke: '#00FF00', strokeWidth: 4 },
    { d: 'M20 56 A12 12 0 0 1 44 56', stroke: '#0000FF', strokeWidth: 4 },
    { d: 'M24 56 A8 8 0 0 1 40 56', stroke: '#8B00FF', strokeWidth: 4 },
    // Clouds at ends (filled)
    { d: 'M4 52 A6 6 0 1 1 16 52 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
    { d: 'M48 52 A6 6 0 1 1 60 52 Z', fill: '#FFFFFF', stroke: '#000', strokeWidth: 2 },
  ],
}

const peaceStamp: StampDefinition = {
  id: 'peace',
  name: 'Peace',
  category: 'symbols',
  icon: '☮️',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Outer circle (filled)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
    // Vertical line
    { d: 'M32 4 L32 60', stroke: '#000', strokeWidth: 2.5 },
    // Diagonal lines
    { d: 'M32 32 L12 52', stroke: '#000', strokeWidth: 2.5 },
    { d: 'M32 32 L52 52', stroke: '#000', strokeWidth: 2.5 },
  ],
}

const checkmarkStamp: StampDefinition = {
  id: 'checkmark',
  name: 'Checkmark',
  category: 'symbols',
  icon: '✅',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Circle background (filled)
    {
      d: 'M32 4 A28 28 0 1 0 32 60 A28 28 0 1 0 32 4 Z',
      fill: '#FFFFFF',
      stroke: '#000',
      strokeWidth: 2.5,
    },
    // Checkmark
    { d: 'M16 32 L28 44 L48 20', stroke: '#00AA00', strokeWidth: 5 },
  ],
}

const exclamationStamp: StampDefinition = {
  id: 'exclamation',
  name: 'Wow!',
  category: 'symbols',
  icon: '❗',
  viewBox: { width: 64, height: 64 },
  paths: [
    // Main body (filled)
    { d: 'M28 8 L36 8 L34 40 L30 40 Z', fill: '#FF0000', stroke: '#000', strokeWidth: 2 },
    // Dot (filled)
    {
      d: 'M32 48 A5 5 0 1 0 32 58 A5 5 0 1 0 32 48 Z',
      fill: '#FF0000',
      stroke: '#000',
      strokeWidth: 1.5,
    },
  ],
}

// ============================================================================
// STAMP REGISTRY
// ============================================================================

/**
 * All available stamps organized by category
 */
export const stamps: StampDefinition[] = [
  // Emoji (5)
  smileyStamp,
  heartEyesStamp,
  laughingStamp,
  coolStamp,
  winkStamp,
  // Animals (5)
  catStamp,
  dogStamp,
  bunnyStamp,
  bearStamp,
  birdStamp,
  // Nature (5)
  flowerStamp,
  starStamp,
  sunStamp,
  cloudStamp,
  treeStamp,
  // Shapes (5)
  heartStamp,
  diamondStamp,
  crownStamp,
  balloonStamp,
  musicNoteStamp,
  // Symbols (5)
  thunderboltStamp,
  rainbowStamp,
  peaceStamp,
  checkmarkStamp,
  exclamationStamp,
]

/**
 * Get stamps by category
 */
export function getStampsByCategory(category: StampCategory): StampDefinition[] {
  return stamps.filter(s => s.category === category)
}

/**
 * Get a stamp by ID
 */
export function getStampById(id: string): StampDefinition | undefined {
  return stamps.find(s => s.id === id)
}

/**
 * Get all unique categories
 */
export function getStampCategories(): StampCategory[] {
  const categories = new Set(stamps.map(s => s.category))
  return Array.from(categories)
}

/**
 * Category metadata for UI display
 */
export const stampCategoryInfo: Record<StampCategory, { icon: string; label: string }> = {
  emoji: { icon: '😊', label: 'Emoji' },
  animals: { icon: '🐾', label: 'Animals' },
  nature: { icon: '🌸', label: 'Nature' },
  shapes: { icon: '💎', label: 'Shapes' },
  symbols: { icon: '⚡', label: 'Symbols' },
}
