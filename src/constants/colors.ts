/**
 * Color Palette Constants for Color Canvas
 *
 * This module defines the 10 fixed palette colors from the PRD.
 * These colors are designed for a kids drawing app with accessibility in mind.
 *
 * ## Accessibility Guidelines (WCAG-inspired)
 *
 * 1. **Contrast Requirements**
 *    - Selection indicator (border/outline) must have ≥3:1 contrast against swatch color
 *    - Focus rings must be visible against all swatch colors
 *    - White swatch needs a visible border to distinguish from background
 *
 * 2. **Color-Only Communication**
 *    - Never rely solely on color to convey information
 *    - Selected state uses border/ring in addition to any color change
 *    - Tooltips/aria-labels provide color names for screen readers
 *
 * 3. **Focus States**
 *    - All swatches must have visible focus indicators for keyboard navigation
 *    - Focus ring should be 2-3px and offset from the swatch
 *    - Use a dark ring (black/dark gray) that's visible on all colors
 *
 * 4. **Touch Targets**
 *    - Minimum 44×44px touch target size per Apple HIG / Material guidelines
 *    - Adequate spacing (8px+) between swatches to prevent mis-taps
 */

/**
 * Color definition with hex value and accessible name
 */
export interface PaletteColor {
  /** Unique identifier/key for the color */
  id: string
  /** Human-readable name (used for aria-label) */
  name: string
  /** Hex color value */
  hex: string
  /** Whether this color needs a border to be visible on white background */
  needsBorder: boolean
}

/**
 * The 10 default palette colors from the PRD
 * Order: Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White
 */
export const PALETTE_COLORS: readonly PaletteColor[] = [
  {
    id: 'red',
    name: 'Red',
    hex: '#FF6B6B',
    needsBorder: false,
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#FFA94D',
    needsBorder: false,
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#FFE066',
    needsBorder: false,
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#69DB7C',
    needsBorder: false,
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#74C0FC',
    needsBorder: false,
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#B197FC',
    needsBorder: false,
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#F783AC',
    needsBorder: false,
  },
  {
    id: 'brown',
    name: 'Brown',
    hex: '#A67C52',
    needsBorder: false,
  },
  {
    id: 'black',
    name: 'Black',
    hex: '#212529',
    needsBorder: false,
  },
  {
    id: 'white',
    name: 'White',
    hex: '#FFFFFF',
    needsBorder: true, // Needs border to be visible on white canvas/background
  },
] as const

/**
 * Default color (first in palette - Red)
 */
export const DEFAULT_COLOR = PALETTE_COLORS[0].hex

/**
 * Get a palette color by its ID
 */
export function getColorById(id: string): PaletteColor | undefined {
  return PALETTE_COLORS.find(color => color.id === id)
}

/**
 * Get a palette color by its hex value
 */
export function getColorByHex(hex: string): PaletteColor | undefined {
  return PALETTE_COLORS.find(color => color.hex.toLowerCase() === hex.toLowerCase())
}
