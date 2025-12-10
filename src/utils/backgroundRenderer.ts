/**
 * Background Renderer for Color Canvas
 *
 * Renders background layers including solid colors, gradients,
 * illustrated scenes, and gentle animations.
 *
 * Design Principles:
 * - Kid-friendly: Gentle, non-distracting backgrounds
 * - Performance: Efficient rendering, minimal redraws for static backgrounds
 * - Animations: Smooth, subtle movements that don't overwhelm
 */

import type {
  BackgroundConfig,
  SolidBackgroundConfig,
  GradientBackgroundConfig,
  SceneBackgroundConfig,
  AnimatedBackgroundConfig,
} from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface RenderBackgroundOptions {
  /** Canvas width in logical pixels */
  width: number
  /** Canvas height in logical pixels */
  height: number
  /** Current animation time in milliseconds (for animated backgrounds) */
  time?: number
}

// ============================================================================
// Main Render Function
// ============================================================================

/**
 * Renders the background onto the canvas context
 * Call this BEFORE rendering shapes
 *
 * @param ctx - Canvas 2D rendering context
 * @param config - Background configuration
 * @param options - Render options including dimensions
 */
export function renderBackground(
  ctx: CanvasRenderingContext2D,
  config: BackgroundConfig,
  options: RenderBackgroundOptions
): void {
  const { width, height } = options

  switch (config.type) {
    case 'none':
      // White background (default canvas behavior)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      break

    case 'solid':
      renderSolidBackground(ctx, config, width, height)
      break

    case 'gradient':
      renderGradientBackground(ctx, config, width, height)
      break

    case 'scene':
      renderSceneBackground(ctx, config, width, height)
      break

    case 'animated':
      renderAnimatedBackground(ctx, config, width, height, options.time || 0)
      break

    default:
      // Fallback to white
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
  }
}

// ============================================================================
// Solid Background
// ============================================================================

function renderSolidBackground(
  ctx: CanvasRenderingContext2D,
  config: SolidBackgroundConfig,
  width: number,
  height: number
): void {
  ctx.fillStyle = config.color
  ctx.fillRect(0, 0, width, height)
}

// ============================================================================
// Gradient Background
// ============================================================================

function renderGradientBackground(
  ctx: CanvasRenderingContext2D,
  config: GradientBackgroundConfig,
  width: number,
  height: number
): void {
  let gradient

  if (config.mode === 'radial') {
    // Radial gradient from center
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.max(width, height) / 2
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
  } else {
    // Linear gradient
    const angle = config.angle ?? 180 // Default: top to bottom
    const radians = ((angle - 90) * Math.PI) / 180

    // Calculate gradient line endpoints
    const length = Math.sqrt(width * width + height * height)
    const centerX = width / 2
    const centerY = height / 2

    const x1 = centerX - (Math.cos(radians) * length) / 2
    const y1 = centerY - (Math.sin(radians) * length) / 2
    const x2 = centerX + (Math.cos(radians) * length) / 2
    const y2 = centerY + (Math.sin(radians) * length) / 2

    gradient = ctx.createLinearGradient(x1, y1, x2, y2)
  }

  // Add color stops
  for (const stop of config.stops) {
    gradient.addColorStop(stop.offset, stop.color)
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

// ============================================================================
// Scene Backgrounds (Illustrated)
// ============================================================================

function renderSceneBackground(
  ctx: CanvasRenderingContext2D,
  config: SceneBackgroundConfig,
  width: number,
  height: number
): void {
  switch (config.id) {
    case 'grass-sky':
      renderGrassSkyScene(ctx, width, height)
      break

    case 'underwater':
      renderUnderwaterScene(ctx, width, height)
      break

    case 'clouds':
      renderCloudsScene(ctx, width, height)
      break

    case 'sunset':
      renderSunsetScene(ctx, width, height)
      break

    case 'night-sky':
      renderNightSkyScene(ctx, width, height)
      break

    case 'space':
      renderSpaceScene(ctx, width, height)
      break

    default:
      // Fallback to white
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
  }
}

/**
 * Grass & Sky scene - gradient sky with green grass band at bottom
 */
function renderGrassSkyScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Sky gradient (top 75%)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.75)
  skyGradient.addColorStop(0, '#87CEEB') // Sky blue
  skyGradient.addColorStop(1, '#E0F7FA') // Light cyan

  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height * 0.75)

  // Grass (bottom 25%) with slight gradient
  const grassGradient = ctx.createLinearGradient(0, height * 0.75, 0, height)
  grassGradient.addColorStop(0, '#81C784') // Light green
  grassGradient.addColorStop(1, '#4CAF50') // Darker green

  ctx.fillStyle = grassGradient
  ctx.fillRect(0, height * 0.75, width, height * 0.25)

  // Rolling hills effect - subtle curves
  ctx.fillStyle = '#66BB6A'
  ctx.beginPath()
  ctx.moveTo(0, height * 0.78)
  ctx.quadraticCurveTo(width * 0.25, height * 0.72, width * 0.5, height * 0.78)
  ctx.quadraticCurveTo(width * 0.75, height * 0.84, width, height * 0.76)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()
}

/**
 * Underwater scene - blue gradient with faint bubbles
 */
function renderUnderwaterScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Water gradient
  const waterGradient = ctx.createLinearGradient(0, 0, 0, height)
  waterGradient.addColorStop(0, '#0288D1') // Deep blue
  waterGradient.addColorStop(0.4, '#29B6F6') // Medium blue
  waterGradient.addColorStop(1, '#B3E5FC') // Light blue

  ctx.fillStyle = waterGradient
  ctx.fillRect(0, 0, width, height)

  // Add subtle light rays from top
  ctx.save()
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 5; i++) {
    const x = width * (0.1 + i * 0.2)
    const rayGradient = ctx.createLinearGradient(x, 0, x, height * 0.8)
    rayGradient.addColorStop(0, '#FFFFFF')
    rayGradient.addColorStop(1, 'transparent')

    ctx.fillStyle = rayGradient
    ctx.beginPath()
    ctx.moveTo(x - 20, 0)
    ctx.lineTo(x + 20, 0)
    ctx.lineTo(x + 60, height * 0.8)
    ctx.lineTo(x - 60, height * 0.8)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  // Static decorative bubbles (seeded positions for consistency)
  ctx.save()
  ctx.globalAlpha = 0.3
  const bubblePositions = [
    { x: 0.1, y: 0.3, r: 8 },
    { x: 0.15, y: 0.6, r: 5 },
    { x: 0.25, y: 0.8, r: 10 },
    { x: 0.4, y: 0.5, r: 6 },
    { x: 0.6, y: 0.7, r: 12 },
    { x: 0.75, y: 0.4, r: 7 },
    { x: 0.85, y: 0.65, r: 9 },
    { x: 0.9, y: 0.85, r: 5 },
  ]

  for (const bubble of bubblePositions) {
    const bx = width * bubble.x
    const by = height * bubble.y
    const br = bubble.r

    // Bubble with highlight
    const bubbleGradient = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.3, 0, bx, by, br)
    bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    bubbleGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    bubbleGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')

    ctx.fillStyle = bubbleGradient
    ctx.beginPath()
    ctx.arc(bx, by, br, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/**
 * Clouds scene - sky gradient with soft cloud shapes
 */
function renderCloudsScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height)
  skyGradient.addColorStop(0, '#64B5F6') // Blue
  skyGradient.addColorStop(1, '#E3F2FD') // Very light blue

  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)

  // Draw fluffy clouds
  ctx.save()
  ctx.globalAlpha = 0.9

  // Cloud helper function
  const drawCloud = (cx: number, cy: number, scale: number) => {
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()

    // Main body circles
    ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2)
    ctx.arc(cx - 25 * scale, cy + 5 * scale, 20 * scale, 0, Math.PI * 2)
    ctx.arc(cx + 25 * scale, cy + 5 * scale, 25 * scale, 0, Math.PI * 2)
    ctx.arc(cx - 10 * scale, cy - 15 * scale, 20 * scale, 0, Math.PI * 2)
    ctx.arc(cx + 15 * scale, cy - 12 * scale, 22 * scale, 0, Math.PI * 2)

    ctx.fill()
  }

  // Position clouds across the sky
  drawCloud(width * 0.15, height * 0.2, 1.2)
  drawCloud(width * 0.5, height * 0.15, 1.5)
  drawCloud(width * 0.85, height * 0.25, 1.0)
  drawCloud(width * 0.3, height * 0.45, 0.8)
  drawCloud(width * 0.7, height * 0.5, 1.1)

  ctx.restore()
}

/**
 * Sunset hills scene - warm gradient with silhouette hills
 */
function renderSunsetScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Sunset gradient
  const sunsetGradient = ctx.createLinearGradient(0, 0, 0, height)
  sunsetGradient.addColorStop(0, '#FF7043') // Orange
  sunsetGradient.addColorStop(0.3, '#FFAB91') // Peach
  sunsetGradient.addColorStop(0.6, '#FFE0B2') // Light orange
  sunsetGradient.addColorStop(1, '#FFF8E1') // Cream

  ctx.fillStyle = sunsetGradient
  ctx.fillRect(0, 0, width, height)

  // Sun glow
  ctx.save()
  const sunX = width * 0.7
  const sunY = height * 0.35
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 100)
  sunGlow.addColorStop(0, 'rgba(255, 235, 59, 0.6)')
  sunGlow.addColorStop(0.5, 'rgba(255, 235, 59, 0.2)')
  sunGlow.addColorStop(1, 'transparent')

  ctx.fillStyle = sunGlow
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // Distant hills (lighter)
  ctx.fillStyle = 'rgba(120, 80, 100, 0.3)'
  ctx.beginPath()
  ctx.moveTo(0, height * 0.65)
  ctx.quadraticCurveTo(width * 0.2, height * 0.5, width * 0.4, height * 0.6)
  ctx.quadraticCurveTo(width * 0.6, height * 0.7, width * 0.8, height * 0.55)
  ctx.quadraticCurveTo(width * 0.9, height * 0.5, width, height * 0.6)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()

  // Closer hills (darker)
  ctx.fillStyle = 'rgba(80, 50, 70, 0.5)'
  ctx.beginPath()
  ctx.moveTo(0, height * 0.75)
  ctx.quadraticCurveTo(width * 0.15, height * 0.65, width * 0.3, height * 0.72)
  ctx.quadraticCurveTo(width * 0.5, height * 0.8, width * 0.7, height * 0.68)
  ctx.quadraticCurveTo(width * 0.85, height * 0.6, width, height * 0.72)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()
}

/**
 * Night sky scene - dark gradient with stars
 */
function renderNightSkyScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Night gradient
  const nightGradient = ctx.createLinearGradient(0, 0, 0, height)
  nightGradient.addColorStop(0, '#1A237E') // Deep indigo
  nightGradient.addColorStop(0.4, '#303F9F') // Indigo
  nightGradient.addColorStop(1, '#5C6BC0') // Lighter indigo

  ctx.fillStyle = nightGradient
  ctx.fillRect(0, 0, width, height)

  // Static stars (seeded positions for consistency)
  ctx.save()
  const starPositions = [
    { x: 0.1, y: 0.1, s: 2 },
    { x: 0.15, y: 0.3, s: 1.5 },
    { x: 0.2, y: 0.15, s: 1 },
    { x: 0.25, y: 0.4, s: 2.5 },
    { x: 0.35, y: 0.08, s: 1.5 },
    { x: 0.4, y: 0.25, s: 2 },
    { x: 0.45, y: 0.5, s: 1 },
    { x: 0.5, y: 0.12, s: 3 },
    { x: 0.55, y: 0.35, s: 1.5 },
    { x: 0.6, y: 0.2, s: 2 },
    { x: 0.65, y: 0.45, s: 1 },
    { x: 0.7, y: 0.08, s: 2.5 },
    { x: 0.75, y: 0.3, s: 1.5 },
    { x: 0.8, y: 0.18, s: 2 },
    { x: 0.85, y: 0.4, s: 1 },
    { x: 0.9, y: 0.1, s: 2 },
    { x: 0.95, y: 0.28, s: 1.5 },
  ]

  ctx.fillStyle = '#FFFFFF'
  for (const star of starPositions) {
    const sx = width * star.x
    const sy = height * star.y

    ctx.globalAlpha = 0.7 + Math.random() * 0.3
    ctx.beginPath()
    ctx.arc(sx, sy, star.s, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()

  // Moon glow
  ctx.save()
  const moonX = width * 0.8
  const moonY = height * 0.2
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 60)
  moonGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
  moonGlow.addColorStop(0.5, 'rgba(200, 200, 255, 0.3)')
  moonGlow.addColorStop(1, 'transparent')

  ctx.fillStyle = moonGlow
  ctx.beginPath()
  ctx.arc(moonX, moonY, 60, 0, Math.PI * 2)
  ctx.fill()

  // Moon
  ctx.fillStyle = '#FFF9C4'
  ctx.beginPath()
  ctx.arc(moonX, moonY, 20, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * Space scene - deep space with planets, stars, and nebula
 */
function renderSpaceScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Deep space gradient
  const spaceGradient = ctx.createRadialGradient(
    width * 0.3,
    height * 0.3,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height)
  )
  spaceGradient.addColorStop(0, '#1a1a2e') // Dark purple center
  spaceGradient.addColorStop(0.3, '#16213e') // Dark blue
  spaceGradient.addColorStop(0.7, '#0f0f23') // Very dark
  spaceGradient.addColorStop(1, '#000011') // Near black

  ctx.fillStyle = spaceGradient
  ctx.fillRect(0, 0, width, height)

  // Nebula glow (purple/pink)
  ctx.save()
  const nebulaGradient = ctx.createRadialGradient(
    width * 0.7,
    height * 0.4,
    0,
    width * 0.7,
    height * 0.4,
    width * 0.4
  )
  nebulaGradient.addColorStop(0, 'rgba(156, 39, 176, 0.3)')
  nebulaGradient.addColorStop(0.5, 'rgba(103, 58, 183, 0.15)')
  nebulaGradient.addColorStop(1, 'transparent')
  ctx.fillStyle = nebulaGradient
  ctx.fillRect(0, 0, width, height)

  // Second nebula (blue/cyan)
  const nebula2 = ctx.createRadialGradient(
    width * 0.2,
    height * 0.7,
    0,
    width * 0.2,
    height * 0.7,
    width * 0.35
  )
  nebula2.addColorStop(0, 'rgba(0, 188, 212, 0.2)')
  nebula2.addColorStop(0.5, 'rgba(33, 150, 243, 0.1)')
  nebula2.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula2
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // Stars - many small ones
  ctx.save()
  const starCount = 60
  for (let i = 0; i < starCount; i++) {
    const seed = i * 7919
    const x = ((seed * 13) % 1000) / 1000
    const y = ((seed * 17) % 1000) / 1000
    const size = 0.5 + ((seed * 3) % 20) / 10
    const brightness = 0.4 + ((seed * 7) % 60) / 100

    ctx.globalAlpha = brightness
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(width * x, height * y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // Planet 1 - Large ringed planet
  ctx.save()
  const planet1X = width * 0.75
  const planet1Y = height * 0.65
  const planet1R = Math.min(width, height) * 0.12

  // Planet glow
  const planetGlow = ctx.createRadialGradient(
    planet1X,
    planet1Y,
    planet1R,
    planet1X,
    planet1Y,
    planet1R * 1.5
  )
  planetGlow.addColorStop(0, 'rgba(255, 152, 0, 0.3)')
  planetGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = planetGlow
  ctx.beginPath()
  ctx.arc(planet1X, planet1Y, planet1R * 1.5, 0, Math.PI * 2)
  ctx.fill()

  // Planet body gradient
  const planetGradient = ctx.createRadialGradient(
    planet1X - planet1R * 0.3,
    planet1Y - planet1R * 0.3,
    0,
    planet1X,
    planet1Y,
    planet1R
  )
  planetGradient.addColorStop(0, '#FFB74D')
  planetGradient.addColorStop(0.5, '#FF9800')
  planetGradient.addColorStop(1, '#E65100')
  ctx.fillStyle = planetGradient
  ctx.beginPath()
  ctx.arc(planet1X, planet1Y, planet1R, 0, Math.PI * 2)
  ctx.fill()

  // Planet stripes
  ctx.globalAlpha = 0.3
  ctx.strokeStyle = '#FFE0B2'
  ctx.lineWidth = 3
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(planet1X, planet1Y, planet1R * (0.5 + i * 0.2), 0.2, Math.PI - 0.2)
    ctx.stroke()
  }

  // Ring
  ctx.globalAlpha = 0.6
  ctx.strokeStyle = '#FFCC80'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(planet1X, planet1Y, planet1R * 1.8, planet1R * 0.4, -0.3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // Planet 2 - Small blue planet
  ctx.save()
  const planet2X = width * 0.2
  const planet2Y = height * 0.25
  const planet2R = Math.min(width, height) * 0.05

  const planet2Gradient = ctx.createRadialGradient(
    planet2X - planet2R * 0.3,
    planet2Y - planet2R * 0.3,
    0,
    planet2X,
    planet2Y,
    planet2R
  )
  planet2Gradient.addColorStop(0, '#64B5F6')
  planet2Gradient.addColorStop(0.7, '#1976D2')
  planet2Gradient.addColorStop(1, '#0D47A1')
  ctx.fillStyle = planet2Gradient
  ctx.beginPath()
  ctx.arc(planet2X, planet2Y, planet2R, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Shooting star
  ctx.save()
  ctx.globalAlpha = 0.7
  const shootGradient = ctx.createLinearGradient(
    width * 0.15,
    height * 0.1,
    width * 0.25,
    height * 0.15
  )
  shootGradient.addColorStop(0, 'transparent')
  shootGradient.addColorStop(0.5, '#FFFFFF')
  shootGradient.addColorStop(1, 'transparent')
  ctx.strokeStyle = shootGradient
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width * 0.1, height * 0.08)
  ctx.lineTo(width * 0.25, height * 0.15)
  ctx.stroke()
  ctx.restore()
}

// ============================================================================
// Animated Backgrounds
// ============================================================================

function renderAnimatedBackground(
  ctx: CanvasRenderingContext2D,
  config: AnimatedBackgroundConfig,
  width: number,
  height: number,
  time: number
): void {
  const speed = config.speed ?? 1
  const intensity = config.intensity ?? 'subtle'

  switch (config.id) {
    case 'waves':
      renderWavesAnimation(ctx, width, height, time, speed, intensity)
      break

    case 'twinkle-stars':
      renderTwinkleStarsAnimation(ctx, width, height, time, speed, intensity)
      break

    case 'floating-clouds':
      renderFloatingCloudsAnimation(ctx, width, height, time, speed, intensity)
      break

    case 'bubbles':
      renderBubblesAnimation(ctx, width, height, time, speed, intensity)
      break

    case 'space':
      renderSpaceAnimation(ctx, width, height, time, speed, intensity)
      break

    default:
      // Fallback to white
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
  }
}

/**
 * Gentle waves animation - horizontal sine waves
 */
function renderWavesAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: 'subtle' | 'medium'
): void {
  // Ocean background gradient
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, height)
  oceanGradient.addColorStop(0, '#4FC3F7')
  oceanGradient.addColorStop(1, '#B3E5FC')

  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, 0, width, height)

  // Wave parameters
  const waveCount = intensity === 'subtle' ? 3 : 5
  const amplitude = intensity === 'subtle' ? 8 : 15
  const baseAlpha = intensity === 'subtle' ? 0.15 : 0.25

  // Draw multiple wave layers
  for (let w = 0; w < waveCount; w++) {
    const waveOffset = (w / waveCount) * height * 0.6 + height * 0.3
    const waveSpeed = (speed * (1 + w * 0.3) * time) / 1000
    const waveAmplitude = amplitude * (1 - w * 0.15)

    ctx.save()
    ctx.globalAlpha = baseAlpha * (1 - w * 0.2)
    ctx.fillStyle = '#FFFFFF'

    ctx.beginPath()
    ctx.moveTo(0, height)

    for (let x = 0; x <= width; x += 5) {
      const y = waveOffset + Math.sin((x / width) * Math.PI * 4 + waveSpeed) * waveAmplitude
      ctx.lineTo(x, y)
    }

    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }
}

/**
 * Twinkling stars animation
 */
function renderTwinkleStarsAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: 'subtle' | 'medium'
): void {
  // Night sky background
  const nightGradient = ctx.createLinearGradient(0, 0, 0, height)
  nightGradient.addColorStop(0, '#1A237E')
  nightGradient.addColorStop(0.5, '#303F9F')
  nightGradient.addColorStop(1, '#5C6BC0')

  ctx.fillStyle = nightGradient
  ctx.fillRect(0, 0, width, height)

  // Star positions (seeded for consistency)
  const starCount = intensity === 'subtle' ? 25 : 40
  const stars: { x: number; y: number; size: number; phase: number }[] = []

  // Generate consistent star positions using deterministic "random"
  for (let i = 0; i < starCount; i++) {
    const seed = i * 7919 // Prime number for pseudo-random distribution
    stars.push({
      x: ((seed * 13) % 1000) / 1000,
      y: ((seed * 17) % 700) / 1000, // Keep stars in upper 70%
      size: 1 + ((seed * 3) % 3),
      phase: (((seed * 11) % 100) / 100) * Math.PI * 2,
    })
  }

  // Draw twinkling stars
  ctx.save()
  const timeSeconds = (time * speed) / 1000

  for (const star of stars) {
    // Oscillating opacity for twinkle effect
    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(timeSeconds * 2 + star.phase))

    ctx.globalAlpha = twinkle
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(width * star.x, height * star.y, star.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Floating clouds animation
 */
function renderFloatingCloudsAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: 'subtle' | 'medium'
): void {
  // Sky background
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height)
  skyGradient.addColorStop(0, '#64B5F6')
  skyGradient.addColorStop(1, '#E3F2FD')

  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height)

  // Cloud helper
  const drawCloud = (cx: number, cy: number, scale: number, alpha: number) => {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FFFFFF'

    ctx.beginPath()
    ctx.arc(cx, cy, 30 * scale, 0, Math.PI * 2)
    ctx.arc(cx - 25 * scale, cy + 5 * scale, 20 * scale, 0, Math.PI * 2)
    ctx.arc(cx + 25 * scale, cy + 5 * scale, 25 * scale, 0, Math.PI * 2)
    ctx.arc(cx - 10 * scale, cy - 15 * scale, 20 * scale, 0, Math.PI * 2)
    ctx.arc(cx + 15 * scale, cy - 12 * scale, 22 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // Cloud positions that drift
  const timeSeconds = (time * speed) / 10000 // Very slow drift
  const cloudCount = intensity === 'subtle' ? 4 : 6

  const clouds = [
    { baseX: 0.1, y: 0.15, scale: 1.3, speed: 0.02, alpha: 0.9 },
    { baseX: 0.4, y: 0.25, scale: 1.0, speed: 0.015, alpha: 0.85 },
    { baseX: 0.7, y: 0.12, scale: 1.5, speed: 0.025, alpha: 0.9 },
    { baseX: 0.25, y: 0.4, scale: 0.8, speed: 0.018, alpha: 0.8 },
    { baseX: 0.55, y: 0.35, scale: 1.1, speed: 0.02, alpha: 0.85 },
    { baseX: 0.85, y: 0.3, scale: 0.9, speed: 0.022, alpha: 0.8 },
  ].slice(0, cloudCount)

  for (const cloud of clouds) {
    // Clouds drift right and wrap around
    const driftX = ((cloud.baseX + timeSeconds * cloud.speed) % 1.3) - 0.15
    drawCloud(width * driftX, height * cloud.y, cloud.scale, cloud.alpha)
  }
}

/**
 * Rising bubbles animation
 */
function renderBubblesAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: 'subtle' | 'medium'
): void {
  // Underwater background
  const waterGradient = ctx.createLinearGradient(0, 0, 0, height)
  waterGradient.addColorStop(0, '#0288D1')
  waterGradient.addColorStop(0.5, '#29B6F6')
  waterGradient.addColorStop(1, '#B3E5FC')

  ctx.fillStyle = waterGradient
  ctx.fillRect(0, 0, width, height)

  // Bubble configuration
  const bubbleCount = intensity === 'subtle' ? 12 : 20
  const timeSeconds = (time * speed) / 1000

  // Generate consistent bubble positions
  const bubbles: { x: number; startY: number; size: number; speed: number; wobble: number }[] = []

  for (let i = 0; i < bubbleCount; i++) {
    const seed = i * 7919
    bubbles.push({
      x: ((seed * 13) % 1000) / 1000,
      startY: ((seed * 17) % 1000) / 1000,
      size: 5 + ((seed * 3) % 10),
      speed: 0.05 + ((seed * 7) % 100) / 2000,
      wobble: (((seed * 11) % 100) / 100) * Math.PI * 2,
    })
  }

  // Draw bubbles
  ctx.save()

  for (const bubble of bubbles) {
    // Bubble rises and wraps
    const riseProgress = (bubble.startY + timeSeconds * bubble.speed) % 1.2
    const y = height * (1.1 - riseProgress)

    // Horizontal wobble
    const wobbleX = Math.sin(timeSeconds * 3 + bubble.wobble) * 10
    const x = width * bubble.x + wobbleX

    // Bubble with gradient
    const bubbleGradient = ctx.createRadialGradient(
      x - bubble.size * 0.3,
      y - bubble.size * 0.3,
      0,
      x,
      y,
      bubble.size
    )
    bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
    bubbleGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    bubbleGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')

    ctx.fillStyle = bubbleGradient
    ctx.beginPath()
    ctx.arc(x, y, bubble.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Animated space journey - flying through stars
 */
function renderSpaceAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  speed: number,
  intensity: 'subtle' | 'medium'
): void {
  // Deep space gradient
  const spaceGradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.8
  )
  spaceGradient.addColorStop(0, '#0a0a1a')
  spaceGradient.addColorStop(0.5, '#0f0f2a')
  spaceGradient.addColorStop(1, '#000008')

  ctx.fillStyle = spaceGradient
  ctx.fillRect(0, 0, width, height)

  // Animated nebula (slowly shifting colors)
  ctx.save()
  const timeSeconds = (time * speed) / 5000
  const nebulaHue = (timeSeconds * 20) % 360

  const nebula1 = ctx.createRadialGradient(
    width * (0.3 + Math.sin(timeSeconds * 0.5) * 0.1),
    height * (0.4 + Math.cos(timeSeconds * 0.3) * 0.1),
    0,
    width * 0.4,
    height * 0.5,
    width * 0.4
  )
  nebula1.addColorStop(0, `hsla(${nebulaHue}, 70%, 40%, 0.2)`)
  nebula1.addColorStop(0.5, `hsla(${(nebulaHue + 30) % 360}, 60%, 30%, 0.1)`)
  nebula1.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula1
  ctx.fillRect(0, 0, width, height)

  const nebula2 = ctx.createRadialGradient(
    width * (0.7 + Math.cos(timeSeconds * 0.4) * 0.1),
    height * (0.6 + Math.sin(timeSeconds * 0.6) * 0.1),
    0,
    width * 0.7,
    height * 0.6,
    width * 0.35
  )
  nebula2.addColorStop(0, `hsla(${(nebulaHue + 180) % 360}, 60%, 35%, 0.15)`)
  nebula2.addColorStop(0.6, `hsla(${(nebulaHue + 200) % 360}, 50%, 25%, 0.08)`)
  nebula2.addColorStop(1, 'transparent')
  ctx.fillStyle = nebula2
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // Flying stars (moving from center outward)
  ctx.save()
  const starCount = intensity === 'subtle' ? 40 : 60
  const centerX = width * 0.5
  const centerY = height * 0.5

  for (let i = 0; i < starCount; i++) {
    const seed = i * 7919
    const angle = (((seed * 13) % 1000) / 1000) * Math.PI * 2
    const baseDistance = ((seed * 17) % 1000) / 1000
    const starSpeed = 0.1 + ((seed * 7) % 100) / 500

    // Stars fly outward from center and wrap
    const animProgress = ((baseDistance + timeSeconds * starSpeed) % 1.2) / 1.2
    const distance = animProgress * Math.max(width, height) * 0.8

    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance

    // Stars get bigger and brighter as they "fly past"
    const size = 0.5 + animProgress * 2.5
    const alpha = Math.min(1, animProgress * 1.5) * (1 - animProgress * 0.3)

    // Star trail (streak effect)
    if (animProgress > 0.1) {
      const trailLength = Math.min(20, distance * 0.15)
      const trailGradient = ctx.createLinearGradient(
        x,
        y,
        centerX + Math.cos(angle) * (distance - trailLength),
        centerY + Math.sin(angle) * (distance - trailLength)
      )
      trailGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`)
      trailGradient.addColorStop(1, 'transparent')

      ctx.strokeStyle = trailGradient
      ctx.lineWidth = size * 0.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(
        centerX + Math.cos(angle) * (distance - trailLength),
        centerY + Math.sin(angle) * (distance - trailLength)
      )
      ctx.stroke()
    }

    // Star point
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // Occasional larger "close" stars with glow
  ctx.save()
  const largeStarCount = intensity === 'subtle' ? 3 : 5
  for (let i = 0; i < largeStarCount; i++) {
    const seed = (i + 100) * 7919
    const angle = (((seed * 13) % 1000) / 1000) * Math.PI * 2
    const baseDistance = ((seed * 17) % 1000) / 1000
    const starSpeed = 0.08 + ((seed * 7) % 100) / 800

    const animProgress = ((baseDistance + timeSeconds * starSpeed) % 1.0) / 1.0
    const distance = animProgress * Math.max(width, height) * 0.6

    const x = centerX + Math.cos(angle) * distance
    const y = centerY + Math.sin(angle) * distance

    const size = 2 + animProgress * 6
    const alpha = Math.min(1, animProgress * 2) * (1 - animProgress * 0.5)

    // Glow
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
    glowGradient.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.5})`)
    glowGradient.addColorStop(0.5, `rgba(150, 180, 255, ${alpha * 0.2})`)
    glowGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(x, y, size * 3, 0, Math.PI * 2)
    ctx.fill()

    // Core
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a background configuration requires animation
 */
export function isAnimatedBackground(config: BackgroundConfig): boolean {
  return config.type === 'animated'
}

/**
 * Get a CSS preview string for a background config (for thumbnails)
 */
export function getBackgroundPreviewCSS(config: BackgroundConfig): string {
  switch (config.type) {
    case 'none':
      return '#FFFFFF'

    case 'solid':
      return config.color

    case 'gradient': {
      const angle = config.angle ?? 180
      const stops = config.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')
      return config.mode === 'radial'
        ? `radial-gradient(circle, ${stops})`
        : `linear-gradient(${angle}deg, ${stops})`
    }

    case 'scene':
      // Return representative colors for scenes
      switch (config.id) {
        case 'grass-sky':
          return 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 60%, #81C784 60%, #4CAF50 100%)'
        case 'underwater':
          return 'linear-gradient(180deg, #0288D1 0%, #29B6F6 50%, #B3E5FC 100%)'
        case 'clouds':
          return 'linear-gradient(180deg, #64B5F6 0%, #E3F2FD 100%)'
        case 'sunset':
          return 'linear-gradient(180deg, #FF7043 0%, #FFAB91 30%, #FFE0B2 60%, #FFF8E1 100%)'
        case 'night-sky':
          return 'linear-gradient(180deg, #1A237E 0%, #303F9F 50%, #5C6BC0 100%)'
        case 'space':
          return 'radial-gradient(circle at 30% 30%, #1a1a2e 0%, #16213e 30%, #0f0f23 70%, #000011 100%)'
        default:
          return '#FFFFFF'
      }

    case 'animated':
      // Return base colors for animated backgrounds
      switch (config.id) {
        case 'waves':
          return 'linear-gradient(180deg, #4FC3F7 0%, #B3E5FC 100%)'
        case 'twinkle-stars':
          return 'linear-gradient(180deg, #1A237E 0%, #303F9F 50%, #5C6BC0 100%)'
        case 'floating-clouds':
          return 'linear-gradient(180deg, #64B5F6 0%, #E3F2FD 100%)'
        case 'bubbles':
          return 'linear-gradient(180deg, #0288D1 0%, #29B6F6 50%, #B3E5FC 100%)'
        case 'space':
          return 'radial-gradient(circle at 50% 50%, #0a0a1a 0%, #0f0f2a 50%, #000008 100%)'
        default:
          return '#FFFFFF'
      }

    default:
      return '#FFFFFF'
  }
}
