import { describe, it, expect } from 'vitest'
import {
  computeRectangleFromDrag,
  computeCircleFromDrag,
  computeTriangleFromDrag,
  validateShapeSize,
  type DragPoint,
} from '../shapeGeometry'
import type { RectangleShape, CircleShape, TriangleShape } from '@/types'

describe('computeRectangleFromDrag', () => {
  it('computes rectangle from normal drag (top-left to bottom-right)', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 50, y: 30 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(40)
    expect(result.height).toBe(20)
  })

  it('normalizes reversed drag (bottom-right to top-left)', () => {
    const start: DragPoint = { x: 50, y: 30 }
    const current: DragPoint = { x: 10, y: 10 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(40)
    expect(result.height).toBe(20)
  })

  it('handles tiny drags (very small movements)', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 11, y: 11 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(1)
    expect(result.height).toBe(1)
  })

  it('handles zero-size drag (same start and end point)', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 10, y: 10 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('handles out-of-bounds coordinates (negative)', () => {
    const start: DragPoint = { x: -10, y: -5 }
    const current: DragPoint = { x: 20, y: 15 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(-10)
    expect(result.y).toBe(-5)
    expect(result.width).toBe(30)
    expect(result.height).toBe(20)
  })

  it('handles invalid values (NaN)', () => {
    const start: DragPoint = { x: NaN, y: 10 }
    const current: DragPoint = { x: 50, y: 30 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(0)
    expect(result.y).toBe(10)
    expect(Number.isFinite(result.width)).toBe(true)
  })

  it('handles invalid values (Infinity)', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: Infinity, y: 30 }
    const result = computeRectangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(Number.isFinite(result.width)).toBe(true)
  })
})

describe('computeCircleFromDrag', () => {
  it('computes circle from normal drag', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 50, y: 10 }
    const result = computeCircleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.radius).toBe(40)
  })

  it('computes perfect circle (not ellipse) from diagonal drag', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 50, y: 30 }
    const result = computeCircleFromDrag(start, current)

    // Distance = sqrt((50-10)^2 + (30-10)^2) = sqrt(1600 + 400) = sqrt(2000) ≈ 44.72
    const expectedRadius = Math.sqrt(40 * 40 + 20 * 20)
    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.radius).toBeCloseTo(expectedRadius, 2)
  })

  it('handles tiny drags', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 11, y: 10 }
    const result = computeCircleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.radius).toBe(1)
  })

  it('handles zero-radius drag (same start and end point)', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 10, y: 10 }
    const result = computeCircleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.radius).toBe(0)
  })

  it('handles out-of-bounds coordinates', () => {
    const start: DragPoint = { x: -10, y: -5 }
    const current: DragPoint = { x: 20, y: 15 }
    const result = computeCircleFromDrag(start, current)

    expect(result.x).toBe(-10)
    expect(result.y).toBe(-5)
    expect(result.radius).toBeGreaterThan(0)
    expect(Number.isFinite(result.radius)).toBe(true)
  })

  it('handles invalid values (NaN)', () => {
    const start: DragPoint = { x: NaN, y: 10 }
    const current: DragPoint = { x: 50, y: 30 }
    const result = computeCircleFromDrag(start, current)

    expect(result.x).toBe(0)
    expect(result.y).toBe(10)
    expect(Number.isFinite(result.radius)).toBe(true)
  })
})

describe('computeTriangleFromDrag', () => {
  it('computes triangle from normal drag (downward)', () => {
    const start: DragPoint = { x: 50, y: 10 }
    const current: DragPoint = { x: 70, y: 40 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(50)
    expect(result.y).toBe(10)
    expect(result.width).toBe(40) // 2 * |70 - 50|
    expect(result.height).toBe(30) // 40 - 10
  })

  it('handles symmetric drag (centered)', () => {
    const start: DragPoint = { x: 50, y: 10 }
    const current: DragPoint = { x: 50, y: 40 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(50)
    expect(result.y).toBe(10)
    expect(result.width).toBe(0) // 2 * |50 - 50|
    expect(result.height).toBe(30)
  })

  it('handles upward drag (height becomes 0)', () => {
    const start: DragPoint = { x: 50, y: 40 }
    const current: DragPoint = { x: 70, y: 10 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(50)
    expect(result.y).toBe(40)
    expect(result.width).toBe(40)
    expect(result.height).toBe(0) // Clamped to 0 for upward drag
  })

  it('handles tiny drags', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 11, y: 11 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(2) // 2 * |11 - 10|
    expect(result.height).toBe(1)
  })

  it('handles zero-size drag', () => {
    const start: DragPoint = { x: 10, y: 10 }
    const current: DragPoint = { x: 10, y: 10 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(10)
    expect(result.y).toBe(10)
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })

  it('handles out-of-bounds coordinates', () => {
    const start: DragPoint = { x: -10, y: -5 }
    const current: DragPoint = { x: 20, y: 15 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(-10)
    expect(result.y).toBe(-5)
    expect(result.width).toBeGreaterThanOrEqual(0)
    expect(result.height).toBeGreaterThanOrEqual(0)
  })

  it('handles invalid values (NaN)', () => {
    const start: DragPoint = { x: NaN, y: 10 }
    const current: DragPoint = { x: 50, y: 30 }
    const result = computeTriangleFromDrag(start, current)

    expect(result.x).toBe(0)
    expect(result.y).toBe(10)
    expect(Number.isFinite(result.width)).toBe(true)
    expect(Number.isFinite(result.height)).toBe(true)
  })
})

describe('validateShapeSize', () => {
  it('validates rectangle above minimum size', () => {
    const shape: RectangleShape = {
      id: 'test',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 10,
      height: 10,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(true)
  })

  it('rejects rectangle below minimum size (5x5)', () => {
    const shape: RectangleShape = {
      id: 'test',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 3,
      height: 3,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(false)
  })

  it('validates circle above minimum size', () => {
    const shape: CircleShape = {
      id: 'test',
      type: 'circle',
      x: 10,
      y: 10,
      radius: 10,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(true)
  })

  it('rejects circle below minimum size (5px radius)', () => {
    const shape: CircleShape = {
      id: 'test',
      type: 'circle',
      x: 10,
      y: 10,
      radius: 3,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(false)
  })

  it('validates triangle above minimum size (10x10)', () => {
    const shape: TriangleShape = {
      id: 'test',
      type: 'triangle',
      x: 10,
      y: 10,
      width: 15,
      height: 15,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(true)
  })

  it('rejects triangle below minimum size (10x10)', () => {
    const shape: TriangleShape = {
      id: 'test',
      type: 'triangle',
      x: 10,
      y: 10,
      width: 8,
      height: 8,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(false)
  })

  it('rejects shapes with NaN values', () => {
    const shape: RectangleShape = {
      id: 'test',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: NaN,
      height: 10,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(false)
  })

  it('rejects shapes with Infinity values', () => {
    const shape: CircleShape = {
      id: 'test',
      type: 'circle',
      x: 10,
      y: 10,
      radius: Infinity,
      strokeColor: '#000',
      strokeWidth: 2,
      rotation: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(validateShapeSize(shape)).toBe(false)
  })

  it('rejects invalid shape objects', () => {
    expect(validateShapeSize(null as any)).toBe(false)
    expect(validateShapeSize(undefined as any)).toBe(false)
    expect(validateShapeSize({} as any)).toBe(false)
  })
})
