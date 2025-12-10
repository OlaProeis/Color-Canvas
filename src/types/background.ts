/**
 * Background Layer Types for Color Canvas
 *
 * Defines the configuration types for the background layer system,
 * supporting solid colors, gradients, illustrated scenes, and animations.
 */

// ============================================================================
// Background Type Enum
// ============================================================================

/**
 * Available background types
 */
export type BackgroundType = 'none' | 'solid' | 'gradient' | 'scene' | 'animated'

// ============================================================================
// Solid Background
// ============================================================================

/**
 * Configuration for solid color backgrounds
 */
export interface SolidBackgroundConfig {
  type: 'solid'
  color: string // Hex color string
}

// ============================================================================
// Gradient Background
// ============================================================================

/**
 * A single color stop in a gradient
 */
export interface GradientStop {
  offset: number // 0-1 position along the gradient
  color: string // Hex color
}

/**
 * Gradient modes
 */
export type GradientMode = 'linear' | 'radial'

/**
 * Configuration for gradient backgrounds
 */
export interface GradientBackgroundConfig {
  type: 'gradient'
  mode: GradientMode
  stops: GradientStop[]
  /** Angle in degrees for linear gradients (0 = top to bottom, 90 = left to right) */
  angle?: number
}

// ============================================================================
// Scene Background
// ============================================================================

/**
 * Available illustrated scene IDs
 */
export type SceneId = 'grass-sky' | 'underwater' | 'clouds' | 'sunset' | 'night-sky' | 'space'

/**
 * Configuration for illustrated scene backgrounds
 */
export interface SceneBackgroundConfig {
  type: 'scene'
  id: SceneId
  variant?: string // Optional variant within the scene
}

// ============================================================================
// Animated Background
// ============================================================================

/**
 * Available animation IDs
 */
export type AnimationId = 'waves' | 'twinkle-stars' | 'floating-clouds' | 'bubbles' | 'space'

/**
 * Animation intensity levels (keeps animations kid-friendly)
 */
export type AnimationIntensity = 'subtle' | 'medium'

/**
 * Configuration for animated backgrounds
 */
export interface AnimatedBackgroundConfig {
  type: 'animated'
  id: AnimationId
  /** Animation speed multiplier (0.5 = half speed, 2 = double speed) */
  speed?: number
  /** How prominent the animation is */
  intensity?: AnimationIntensity
}

// ============================================================================
// None Background (Transparent/White)
// ============================================================================

/**
 * Configuration for no background (white canvas)
 */
export interface NoneBackgroundConfig {
  type: 'none'
}

// ============================================================================
// Union Types
// ============================================================================

/**
 * All possible background configurations
 */
export type BackgroundConfig =
  | NoneBackgroundConfig
  | SolidBackgroundConfig
  | GradientBackgroundConfig
  | SceneBackgroundConfig
  | AnimatedBackgroundConfig

/**
 * Background state in the store
 */
export interface BackgroundState {
  config: BackgroundConfig
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * A preset background option for the UI
 */
export interface BackgroundPreset {
  id: string
  name: string
  config: BackgroundConfig
  /** Optional preview thumbnail data (base64 or CSS gradient string) */
  preview?: string
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default background configuration (none/white)
 */
export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'none',
}

// ============================================================================
// Preset Definitions
// ============================================================================

/**
 * Kid-friendly solid color presets
 */
export const SOLID_PRESETS: BackgroundPreset[] = [
  { id: 'white', name: 'White', config: { type: 'solid', color: '#FFFFFF' } },
  { id: 'off-white', name: 'Cream', config: { type: 'solid', color: '#FFF8E7' } },
  { id: 'soft-blue', name: 'Sky Blue', config: { type: 'solid', color: '#E3F2FD' } },
  { id: 'pale-yellow', name: 'Sunshine', config: { type: 'solid', color: '#FFF9C4' } },
  { id: 'light-pink', name: 'Cotton Candy', config: { type: 'solid', color: '#FCE4EC' } },
  { id: 'mint-green', name: 'Mint', config: { type: 'solid', color: '#E8F5E9' } },
  { id: 'lavender', name: 'Lavender', config: { type: 'solid', color: '#EDE7F6' } },
  { id: 'peach', name: 'Peach', config: { type: 'solid', color: '#FFECB3' } },
]

/**
 * Gradient background presets
 */
export const GRADIENT_PRESETS: BackgroundPreset[] = [
  {
    id: 'sky',
    name: 'Clear Sky',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#87CEEB' },
        { offset: 1, color: '#E0F7FA' },
      ],
    },
    preview: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)',
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#FFB74D' },
        { offset: 0.5, color: '#FFCC80' },
        { offset: 1, color: '#FFF8E1' },
      ],
    },
    preview: 'linear-gradient(180deg, #FFB74D 0%, #FFCC80 50%, #FFF8E1 100%)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#7B1FA2' },
        { offset: 0.4, color: '#E91E63' },
        { offset: 0.7, color: '#FF9800' },
        { offset: 1, color: '#FFEB3B' },
      ],
    },
    preview: 'linear-gradient(180deg, #7B1FA2 0%, #E91E63 40%, #FF9800 70%, #FFEB3B 100%)',
  },
  {
    id: 'underwater',
    name: 'Ocean',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#0288D1' },
        { offset: 0.5, color: '#4FC3F7' },
        { offset: 1, color: '#B3E5FC' },
      ],
    },
    preview: 'linear-gradient(180deg, #0288D1 0%, #4FC3F7 50%, #B3E5FC 100%)',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#FFCDD2' },
        { offset: 0.2, color: '#FFE0B2' },
        { offset: 0.4, color: '#FFF9C4' },
        { offset: 0.6, color: '#C8E6C9' },
        { offset: 0.8, color: '#BBDEFB' },
        { offset: 1, color: '#E1BEE7' },
      ],
    },
    preview:
      'linear-gradient(180deg, #FFCDD2 0%, #FFE0B2 20%, #FFF9C4 40%, #C8E6C9 60%, #BBDEFB 80%, #E1BEE7 100%)',
  },
  {
    id: 'night',
    name: 'Night Sky',
    config: {
      type: 'gradient',
      mode: 'linear',
      angle: 180,
      stops: [
        { offset: 0, color: '#1A237E' },
        { offset: 0.6, color: '#303F9F' },
        { offset: 1, color: '#5C6BC0' },
      ],
    },
    preview: 'linear-gradient(180deg, #1A237E 0%, #303F9F 60%, #5C6BC0 100%)',
  },
]

/**
 * Scene background presets
 */
export const SCENE_PRESETS: BackgroundPreset[] = [
  { id: 'grass-sky', name: 'Meadow', config: { type: 'scene', id: 'grass-sky' } },
  { id: 'underwater', name: 'Under the Sea', config: { type: 'scene', id: 'underwater' } },
  { id: 'clouds', name: 'Cloudy Day', config: { type: 'scene', id: 'clouds' } },
  { id: 'sunset', name: 'Sunset Hills', config: { type: 'scene', id: 'sunset' } },
  { id: 'night-sky', name: 'Starry Night', config: { type: 'scene', id: 'night-sky' } },
  { id: 'space', name: 'Outer Space', config: { type: 'scene', id: 'space' } },
]

/**
 * Animated background presets
 */
export const ANIMATED_PRESETS: BackgroundPreset[] = [
  {
    id: 'waves',
    name: 'Gentle Waves',
    config: { type: 'animated', id: 'waves', speed: 1, intensity: 'subtle' },
  },
  {
    id: 'twinkle-stars',
    name: 'Twinkle Stars',
    config: { type: 'animated', id: 'twinkle-stars', speed: 1, intensity: 'subtle' },
  },
  {
    id: 'floating-clouds',
    name: 'Drifting Clouds',
    config: { type: 'animated', id: 'floating-clouds', speed: 0.5, intensity: 'subtle' },
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    config: { type: 'animated', id: 'bubbles', speed: 1, intensity: 'subtle' },
  },
  {
    id: 'space',
    name: 'Space Journey',
    config: { type: 'animated', id: 'space', speed: 0.5, intensity: 'subtle' },
  },
]

/**
 * All presets grouped by type
 */
export const ALL_PRESETS = {
  solid: SOLID_PRESETS,
  gradient: GRADIENT_PRESETS,
  scene: SCENE_PRESETS,
  animated: ANIMATED_PRESETS,
}
