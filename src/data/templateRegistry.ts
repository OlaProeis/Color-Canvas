/**
 * Template Registry
 *
 * Combines hardcoded templates with file-based SVG templates
 * for a unified template system.
 */

import { templates as hardcodedTemplates } from './templates'
import { discoverSvgTemplates, svgMetadataToTemplateDefinition } from '@/utils/svgTemplateLoader'
import type { TemplateDefinition } from '@/types'

/**
 * Cached combined templates
 */
let cachedTemplates: TemplateDefinition[] | null = null

/**
 * Get all available templates (hardcoded + file-based SVG)
 * Results are cached after first load
 */
export async function getAllTemplates(): Promise<TemplateDefinition[]> {
  // Return cached if available
  if (cachedTemplates) {
    return cachedTemplates
  }

  try {
    // Discover SVG templates
    const svgMetadata = await discoverSvgTemplates()
    const svgTemplates = svgMetadata.map(svgMetadataToTemplateDefinition)

    // Combine with hardcoded templates
    cachedTemplates = [...hardcodedTemplates, ...svgTemplates]

    return cachedTemplates
  } catch (error) {
    console.error('Failed to discover SVG templates:', error)
    // Fall back to hardcoded templates only
    cachedTemplates = hardcodedTemplates
    return hardcodedTemplates
  }
}

/**
 * Get templates filtered by category
 */
export async function getTemplatesByCategory(
  category: TemplateDefinition['category']
): Promise<TemplateDefinition[]> {
  const allTemplates = await getAllTemplates()
  return allTemplates.filter(t => t.category === category)
}

/**
 * Get a template by ID
 */
export async function getTemplateById(id: string): Promise<TemplateDefinition | undefined> {
  const allTemplates = await getAllTemplates()
  return allTemplates.find(t => t.id === id)
}

/**
 * Get all unique categories from all templates
 */
export async function getCategories(): Promise<TemplateDefinition['category'][]> {
  const allTemplates = await getAllTemplates()
  const categories = new Set(allTemplates.map(t => t.category))
  return Array.from(categories)
}

/**
 * Clear the template cache (useful for hot reload during development)
 */
export function clearTemplateCache(): void {
  cachedTemplates = null
}
