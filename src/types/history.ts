import type { Shape } from './shape'
import type { FillPoint } from './fill'

// History entry type
export type HistoryAction = 'add' | 'update' | 'remove' | 'clear'

export interface HistoryEntry {
  id: string
  action: HistoryAction
  timestamp: number
  shapeId?: string
  shapeBefore?: Shape
  shapeAfter?: Shape
  shapesSnapshot?: Shape[]
  fillsSnapshot?: FillPoint[] // Snapshot of fills for undo/redo
}

export interface HistoryState {
  past: HistoryEntry[]
  present: Shape[]
  future: HistoryEntry[]
}
