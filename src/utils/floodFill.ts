/**
 * Simple flood fill algorithm using scanline approach
 * Fills a contiguous region of similar color with a new color
 */

/**
 * Parse a hex color string to RGB values
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return [0, 0, 0]
  }
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
}

/**
 * Check if two colors are similar within a tolerance
 */
function colorsMatch(
  r1: number,
  g1: number,
  b1: number,
  a1: number,
  r2: number,
  g2: number,
  b2: number,
  a2: number,
  tolerance: number
): boolean {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance &&
    Math.abs(a1 - a2) <= tolerance
  )
}

/**
 * Check if a color is very close to pure black (the stroke color)
 * Only rejects colors very close to #000000, allows dark palette colors like #212529
 * IMPORTANT: Transparent pixels (alpha = 0) are NOT strokes, even if RGB is (0,0,0)
 */
function isStrokeColor(r: number, g: number, b: number, a: number): boolean {
  // Transparent pixels are NOT strokes - they're empty/fillable areas
  // This is critical for the dual canvas architecture where white becomes transparent
  if (a < 128) {
    return false
  }
  // Only reject if ALL channels are below 20 (very close to pure black #000000)
  // This allows dark colors like #212529 (33, 37, 41) to be filled
  return r < 20 && g < 20 && b < 20
}

/**
 * Check if a color is near a stroke (dark, semi-opaque pixel that could be anti-aliased edge)
 * This catches the anti-aliased edges of strokes that aren't pure black
 */
function isNearStroke(r: number, g: number, b: number, a: number): boolean {
  // Very transparent pixels are not near strokes
  if (a < 64) {
    return false
  }
  // Dark pixels with decent alpha are likely stroke edges
  // This catches anti-aliased edges (e.g., RGB 30-80 with alpha 100-200)
  const brightness = (r + g + b) / 3
  return brightness < 60 && a > 100
}

/**
 * Check if any neighboring pixel is a stroke (for leak prevention)
 */
function hasStrokeNeighbor(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  // Check 8-connected neighbors
  const neighbors = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ]

  for (const [dx, dy] of neighbors) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const idx = (ny * width + nx) * 4
      if (isStrokeColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
        return true
      }
    }
  }
  return false
}

/**
 * Options for flood fill operation
 */
export interface FloodFillOptions {
  /** Color matching tolerance (0-255). Higher values fill more anti-aliased edge pixels. Default: 48 */
  tolerance?: number
  /** Optional fill mask to track which pixels have been filled (for transparency preservation) */
  fillMask?: Uint8Array
}

/**
 * Perform flood fill at the given coordinates
 *
 * @param ctx - Canvas 2D context
 * @param startX - X coordinate to start fill (in CSS pixels)
 * @param startY - Y coordinate to start fill (in CSS pixels)
 * @param fillColor - Hex color to fill with
 * @param options - Fill options including tolerance and optional fill mask
 * @returns Number of pixels filled
 */
export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  options: FloodFillOptions | number = {}
): number {
  // Support legacy signature: floodFill(ctx, x, y, color, tolerance)
  const opts: FloodFillOptions = typeof options === 'number' ? { tolerance: options } : options
  const tolerance = opts.tolerance ?? 48 // Reduced from 64 to prevent stroke edge leaking
  const fillMask = opts.fillMask
  const canvas = ctx.canvas
  const dpr = window.devicePixelRatio || 1

  // Convert CSS pixels to physical pixels
  const physicalX = Math.floor(startX * dpr)
  const physicalY = Math.floor(startY * dpr)
  const width = canvas.width
  const height = canvas.height

  // Bounds check
  if (physicalX < 0 || physicalX >= width || physicalY < 0 || physicalY >= height) {
    return 0
  }

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  // Get the color at the start position
  const startIdx = (physicalY * width + physicalX) * 4
  const startR = data[startIdx]
  const startG = data[startIdx + 1]
  const startB = data[startIdx + 2]
  const startA = data[startIdx + 3]

  // SAFEGUARD 1: Don't fill if clicking on a stroke (pure black with high alpha)
  if (isStrokeColor(startR, startG, startB, startA)) {
    return 0
  }

  // SAFEGUARD 2: Don't fill if clicking on anti-aliased stroke edge
  if (isNearStroke(startR, startG, startB, startA)) {
    return 0
  }

  // SAFEGUARD 3: Don't fill if the clicked pixel is adjacent to a stroke
  // This prevents filling thin white lines between strokes
  if (hasStrokeNeighbor(data, physicalX, physicalY, width, height)) {
    return 0
  }

  // Parse fill color
  const [fillR, fillG, fillB] = hexToRgb(fillColor)
  const fillA = 255

  // Don't fill if clicking on an area that's already very close to the fill color
  const SAME_COLOR_TOLERANCE = 10
  if (
    colorsMatch(startR, startG, startB, startA, fillR, fillG, fillB, fillA, SAME_COLOR_TOLERANCE)
  ) {
    return 0
  }

  // SAFEGUARD 4: Maximum fill area (15% of canvas) - reduced from 30%
  const totalPixels = width * height
  const maxFillPixels = Math.floor(totalPixels * 0.15)

  // SAFEGUARD 5: Maximum stack size to prevent memory exhaustion
  const maxStackSize = 500000 // 500K entries max

  // Scanline flood fill algorithm
  const stack: [number, number][] = [[physicalX, physicalY]]
  const visited = new Uint8Array(width * height)
  let pixelsFilled = 0
  let fillAborted = false

  while (stack.length > 0) {
    // SAFEGUARD 6: Check stack size to prevent memory crash
    if (stack.length > maxStackSize) {
      fillAborted = true
      break
    }

    const [x, y] = stack.pop()!
    const idx = y * width + x

    // Skip if already visited or out of bounds
    if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) {
      continue
    }

    const pixelIdx = idx * 4
    const r = data[pixelIdx]
    const g = data[pixelIdx + 1]
    const b = data[pixelIdx + 2]
    const a = data[pixelIdx + 3]

    // Check if this pixel matches the target color
    if (!colorsMatch(r, g, b, a, startR, startG, startB, startA, tolerance)) {
      continue
    }

    // SAFEGUARD 7: Don't fill pixels adjacent to strokes (prevents edge leaking)
    if (hasStrokeNeighbor(data, x, y, width, height)) {
      visited[idx] = 1 // Mark as visited but don't fill
      continue
    }

    // Mark as visited and fill
    visited[idx] = 1
    data[pixelIdx] = fillR
    data[pixelIdx + 1] = fillG
    data[pixelIdx + 2] = fillB
    data[pixelIdx + 3] = fillA
    pixelsFilled++

    // SAFEGUARD 4 check: Stop if fill area is too large
    if (pixelsFilled > maxFillPixels) {
      fillAborted = true
      break
    }

    // Add neighbors to stack (4-connected for tighter fill)
    stack.push([x + 1, y])
    stack.push([x - 1, y])
    stack.push([x, y + 1])
    stack.push([x, y - 1])
  }

  // If fill was aborted due to size or stack overflow, don't apply any changes
  if (fillAborted) {
    return 0
  }

  // Fill succeeded - now update the fill mask with visited pixels
  if (fillMask && pixelsFilled > 0) {
    for (let i = 0; i < visited.length; i++) {
      if (visited[i] === 1) {
        fillMask[i] = 1
      }
    }
  }

  // Put the modified image data back
  if (pixelsFilled > 0) {
    ctx.putImageData(imageData, 0, 0)
  }

  return pixelsFilled
}
