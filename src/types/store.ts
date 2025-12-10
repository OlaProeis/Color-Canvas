import type { Shape, StampSizePreset } from './shape'
import type { ToolType } from './tools'
import type { HistoryState } from './history'
import type { FillPoint } from './fill'
import type { BackgroundConfig } from './background'

// Canvas dimensions for coordinate conversion
export interface CanvasDimensions {
  width: number
  height: number
}

// Main application state interface
export interface AppState {
  shapes: Shape[]
  fills: FillPoint[] // Stored fill operations for replay
  currentTool: ToolType
  currentColor: string
  isColoringMode: boolean
  recentCustomColors: string[] // Last 5 custom colors picked by user
  history: HistoryState
  isDragging: boolean
  activeShapeId: string | null
  previewShape: Shape | null // Temporary shape during drawing
  dragStart: { x: number; y: number } | null // Starting point of current drag
  isFilling: boolean // True when a fill operation is in progress
  canvasDimensions: CanvasDimensions // Canvas size for relative coordinate conversion
  // Stamp tool state
  currentStampKey: string | null // Currently selected stamp ID
  currentStampSize: StampSizePreset // Current stamp size preset
  // Background layer state
  background: BackgroundConfig // Current background configuration
}
