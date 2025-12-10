/**
 * SVG Template Loader
 *
 * Discovers and loads SVG files from the public/templates folder structure.
 * Uses Vite's import.meta.glob for build-time discovery.
 */

import type { TemplateDefinition, TemplateCategory } from '@/types'

/**
 * SVG Template metadata extracted from file path and content
 */
export interface SvgTemplateMetadata {
  /** Unique ID derived from folder/filename */
  id: string
  /** Display name derived from filename */
  name: string
  /** Category derived from folder name */
  category: TemplateCategory
  /** Path to the SVG file */
  svgPath: string
  /** ViewBox extracted from SVG (or default) */
  viewBox: { width: number; height: number }
}

/**
 * Derive template name from filename
 * Example: "cute-cat.svg" -> "Cute Cat"
 */
function fileNameToTitle(fileName: string): string {
  return fileName
    .replace('.svg', '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Determine emoji icon based on category
 */
function getCategoryIcon(category: TemplateCategory): string {
  const iconMap: Record<TemplateCategory, string> = {
    animals: '🐾',
    vehicles: '🚗',
    nature: '🌿',
    buildings: '🏠',
    objects: '⭐',
    characters: '🎭',
    food: '🍕',
    abstract: '🔷',
    fantasy: '🦄', // Added fantasy
  }
  return iconMap[category] || '📄'
}

/**
 * Validate that folder name is a valid category
 */
function isValidCategory(category: string): category is TemplateCategory {
  const validCategories: TemplateCategory[] = [
    'animals',
    'vehicles',
    'nature',
    'buildings',
    'objects',
    'characters',
    'food',
    'abstract',
    'fantasy',
  ]
  return validCategories.includes(category as TemplateCategory)
}

/**
 * Extract viewBox from SVG content
 * Returns default if not found
 */
function extractViewBox(svgContent: string): { width: number; height: number } {
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/)
  if (viewBoxMatch) {
    const [, , , width, height] = viewBoxMatch[1].split(/\s+/)
    const w = parseFloat(width)
    const h = parseFloat(height)
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return { width: w, height: h }
    }
  }

  // Try width/height attributes
  const widthMatch = svgContent.match(/width=["'](\d+(?:\.\d+)?)["']/)
  const heightMatch = svgContent.match(/height=["'](\d+(?:\.\d+)?)["']/)
  if (widthMatch && heightMatch) {
    return {
      width: parseFloat(widthMatch[1]),
      height: parseFloat(heightMatch[1]),
    }
  }

  // Default fallback
  return { width: 800, height: 600 }
}

/**
 * Discover all SVG templates using Vite's import.meta.glob
 * This runs at build time and generates the template catalog
 */
export async function discoverSvgTemplates(): Promise<SvgTemplateMetadata[]> {
  // Use import.meta.glob to find all SVG files in public/templates
  // Use eager: false to avoid loading content, we just need the paths
  const svgModules = import.meta.glob<string>('/public/templates/**/*.svg')

  const templates: SvgTemplateMetadata[] = []

  for (const path of Object.keys(svgModules)) {
    try {
      // Extract category and filename from path
      // Example: /public/templates/animals/cat.svg
      const pathParts = path.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const categoryFolder = pathParts[pathParts.length - 2]

      // Validate category
      if (!isValidCategory(categoryFolder)) {
        console.warn(`Skipping SVG in invalid category folder: ${categoryFolder}`)
        continue
      }

      // Convert public path to URL path
      const svgPath = path.replace('/public', '')

      // Fetch the SVG to extract viewBox
      const response = await fetch(svgPath)
      const svgContent = await response.text()
      const viewBox = extractViewBox(svgContent)

      // Create template metadata
      const template: SvgTemplateMetadata = {
        id: `svg-${categoryFolder}-${fileName.replace('.svg', '')}`,
        name: fileNameToTitle(fileName),
        category: categoryFolder,
        svgPath,
        viewBox,
      }

      templates.push(template)
    } catch (error) {
      console.error(`Failed to load SVG template: ${path}`, error)
    }
  }

  return templates
}

/**
 * Load an SVG file and convert it to an Image for canvas rendering
 */
export async function loadSvgAsImage(svgPath: string): Promise<HTMLImageElement> {
  const response = await fetch(svgPath)
  const svgText = await response.text()

  // Convert SVG to data URL
  const blob = new Blob([svgText], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load SVG: ${svgPath}`))
    }
    img.src = url
  })
}

/**
 * Convert SVG template metadata to TemplateDefinition
 * for compatibility with existing template system
 */
export function svgMetadataToTemplateDefinition(metadata: SvgTemplateMetadata): TemplateDefinition {
  return {
    id: metadata.id,
    name: metadata.name,
    category: metadata.category,
    icon: getCategoryIcon(metadata.category),
    source: 'path', // Mark as SVG-based
    viewBox: metadata.viewBox,
    // Store SVG path in pathData field for now
    // We'll load the actual SVG content when needed
    pathData: metadata.svgPath,
    license: 'cc0',
  }
}

/**
 * Render an SVG template directly on a canvas
 * Used for preview rendering and template application
 */
export async function renderSvgTemplate(
  svgPath: string,
  canvas: HTMLCanvasElement,
  options: {
    /** Margin as fraction of canvas size */
    margin?: number
    /** Background color (null for transparent) */
    backgroundColor?: string | null
  } = {}
): Promise<void> {
  const { margin = 0.1, backgroundColor = 'white' } = options

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // Clear canvas
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Load SVG as image
  const img = await loadSvgAsImage(svgPath)

  // Calculate dimensions with margin
  const availableWidth = canvas.width * (1 - margin * 2)
  const availableHeight = canvas.height * (1 - margin * 2)

  // Calculate scale to fit image while maintaining aspect ratio
  const scaleX = availableWidth / img.width
  const scaleY = availableHeight / img.height
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = img.width * scale
  const scaledHeight = img.height * scale

  // Center in canvas
  const x = (canvas.width - scaledWidth) / 2
  const y = (canvas.height - scaledHeight) / 2

  // Draw image
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
}
