<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="template-library-overlay" @click.self="$emit('close')">
        <div class="template-library">
          <!-- Header -->
          <header class="template-library__header">
            <h2 class="template-library__title">📚 Choose a Template</h2>
            <button class="template-library__close" @click="$emit('close')" aria-label="Close">
              ✕
            </button>
          </header>

          <!-- Category Tabs -->
          <nav class="template-library__tabs">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="['tab-btn', { active: selectedCategory === cat }]"
              @click="selectedCategory = cat"
            >
              <span class="tab-icon">{{ categoryInfo[cat].icon }}</span>
              <span class="tab-label">{{ categoryInfo[cat].label }}</span>
            </button>
          </nav>

          <!-- Template Grid -->
          <div class="template-library__content">
            <div class="template-grid">
              <button
                v-for="template in filteredTemplates"
                :key="template.id"
                :class="['template-card', { selected: selectedTemplateId === template.id }]"
                @click="selectTemplate(template)"
              >
                <div class="template-card__preview">
                  <canvas
                    :ref="el => setCanvasRef(template.id, el as HTMLCanvasElement)"
                    class="template-card__canvas"
                    width="120"
                    height="120"
                  ></canvas>
                </div>
                <div class="template-card__info">
                  <span class="template-card__icon">{{ template.icon }}</span>
                  <span class="template-card__name">{{ template.name }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <footer class="template-library__footer">
            <BaseButton variant="ghost" @click="$emit('close')"> Cancel </BaseButton>
            <BaseButton variant="primary" :disabled="!selectedTemplateId" @click="confirmSelection">
              🎨 Use This Template
            </BaseButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { categoryInfo } from '@/data/templates'
import { getAllTemplates, getCategories } from '@/data/templateRegistry'
import { getTemplatePreview } from '@/utils/templateUtils'
import { renderShapes } from '@/utils/renderShapes'
import { renderSvgTemplate } from '@/utils/svgTemplateLoader'
import type { TemplateDefinition, TemplateCategory } from '@/types'
import BaseButton from './BaseButton.vue'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [template: TemplateDefinition]
}>()

// State
const templates = ref<TemplateDefinition[]>([])
const categories = ref<TemplateCategory[]>([])
const selectedCategory = ref<TemplateCategory | null>(null)
const selectedTemplateId = ref<string | null>(null)
const loading = ref(true)

// Canvas refs for preview rendering
const canvasRefs = new Map<string, HTMLCanvasElement>()

const setCanvasRef = (id: string, el: HTMLCanvasElement | null) => {
  if (el) {
    canvasRefs.set(id, el)
  } else {
    canvasRefs.delete(id)
  }
}

// Load templates and categories
const loadTemplates = async () => {
  loading.value = true
  try {
    templates.value = await getAllTemplates()
    categories.value = await getCategories()
    if (categories.value.length > 0 && !selectedCategory.value) {
      selectedCategory.value = categories.value[0]
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  } finally {
    loading.value = false
  }
}

// Filtered templates by category
const filteredTemplates = computed(() => {
  if (!selectedCategory.value) return []
  return templates.value.filter(t => t.category === selectedCategory.value)
})

// Get selected template
const selectedTemplate = computed(() => {
  if (!selectedTemplateId.value) return null
  return templates.value.find(t => t.id === selectedTemplateId.value) || null
})

// Select a template
const selectTemplate = (template: TemplateDefinition) => {
  selectedTemplateId.value = template.id
}

// Confirm selection and emit
const confirmSelection = () => {
  if (selectedTemplate.value) {
    emit('select', selectedTemplate.value)
  }
}

// Render preview for a template on its canvas
const renderPreview = async (templateId: string) => {
  const canvas = canvasRefs.get(templateId)
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const template = templates.value.find(t => t.id === templateId)
  if (!template) return

  const width = canvas.width
  const height = canvas.height

  try {
    // Check if this is an SVG template
    if (template.source === 'path' && template.pathData) {
      // SVG template - render directly from file
      await renderSvgTemplate(template.pathData, canvas, {
        margin: 0.1,
        backgroundColor: 'white',
      })
    } else {
      // Primitive template - use existing rendering
      // Clear canvas with white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      // Get preview shapes (in absolute coordinates)
      const previewShapes = getTemplatePreview(template, width, height, 0.1)

      // Render shapes
      renderShapes(ctx, previewShapes, width, height, {
        noClear: true,
        isRelative: false, // Preview shapes are already in absolute coords
        strokeWidth: 1.5,
      })
    }
  } catch (error) {
    console.error(`Failed to render preview for ${templateId}:`, error)
    // Draw error indicator
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#ef4444'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Preview error', width / 2, height / 2)
  }
}

// Render all visible previews when modal opens or category changes
const renderAllPreviews = async () => {
  await nextTick()
  for (const template of filteredTemplates.value) {
    await renderPreview(template.id)
  }
}

// Watch for visibility and category changes
watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      // Reset selection when opening
      selectedTemplateId.value = null
      await loadTemplates()
      await renderAllPreviews()
    }
  }
)

watch(selectedCategory, () => {
  renderAllPreviews()
})

onMounted(async () => {
  if (props.visible) {
    await loadTemplates()
    await renderAllPreviews()
  }
})
</script>

<style scoped>
.template-library-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.template-library {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.template-library__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.template-library__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.template-library__close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.template-library__close:hover {
  background: var(--color-error);
  color: white;
}

/* Category Tabs */
.template-library__tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid transparent;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-light);
}

.tab-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.tab-icon {
  font-size: var(--font-size-base);
}

/* Template Grid */
.template-library__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: var(--spacing-md);
}

@media (max-width: 700px) {
  .template-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 500px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Template Card */
.template-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 3px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.template-card:hover {
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.template-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.3);
}

.template-card__preview {
  aspect-ratio: 1;
  background: white;
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
}

.template-card__canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.template-card__info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-sm);
}

.template-card__icon {
  font-size: var(--font-size-lg);
}

.template-card__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

/* Footer */
.template-library__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .template-library,
.modal-leave-active .template-library {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .template-library,
.modal-leave-to .template-library {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .template-library-overlay {
    padding: 0;
  }

  .template-library {
    max-width: 100%;
    max-height: 100%;
    height: 100%;
    border-radius: 0;
  }

  .template-library__header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .template-library__title {
    font-size: var(--font-size-lg);
  }

  .template-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .tab-label {
    display: none;
  }

  .tab-btn {
    padding: var(--spacing-sm);
  }

  .tab-icon {
    font-size: var(--font-size-lg);
  }
}
</style>
