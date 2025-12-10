// Fill operation stored as click point (for replay on resize)
// Uses relative coordinates (0-1) so fills scale with canvas
export interface FillPoint {
  id: string
  x: number // Relative X (0-1)
  y: number // Relative Y (0-1)
  color: string // Fill color
}
