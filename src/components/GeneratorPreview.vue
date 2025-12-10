<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="preview-overlay" @click.self="handleCancel">
        <div class="preview-modal">
          <!-- Header -->
          <div class="preview-header">
            <h2 class="preview-title">
              <span class="title-icon">✨</span>
              Preview
            </h2>
            <button class="close-btn" @click="handleCancel" aria-label="Close">✕</button>
          </div>

          <!-- Preview Canvas -->
          <div class="preview-canvas-container">
            <canvas
              ref="previewCanvas"
              class="preview-canvas"
              :width="canvasWidth"
              :height="canvasHeight"
            />
            <div v-if="isLoading" class="loading-overlay">
              <span class="loading-spinner">🎨</span>
              <span class="loading-text">Creating magic...</span>
            </div>
          </div>

          <!-- Info Bar -->
          <div class="preview-info">
            <span class="info-item">
              <span class="info-icon">{{ themeIcon }}</span>
              {{ themeName }}
            </span>
            <span class="info-item">
              <span class="info-icon">{{ styleIcon }}</span>
              {{ styleName }}
            </span>
            <span class="info-item">
              <span class="info-icon">🎨</span>
              {{ shapeCount }} shapes
            </span>
          </div>

          <!-- Actions -->
          <div class="preview-actions">
            <button class="action-btn try-again-btn" @click="handleTryAgain">
              <span class="action-icon">🔄</span>
              Try Again
            </button>
            <button class="action-btn use-btn" @click="handleUse">
              <span class="action-icon">✓</span>
              Use This
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { GenerationResult, Shape } from '@/types'
import { renderShapes } from '@/utils/renderShapes'
import { themeDisplayInfo, styleDisplayInfo } from '@/data/themeShapes'

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = defineProps<{
  visible: boolean
  result: GenerationResult | null
  onGenerate: () => GenerationResult
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'use', result: GenerationResult): void
}>()

// ============================================================================
// STATE
// ============================================================================

const previewCanvas = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(false)
const currentResult = ref<GenerationResult | null>(null)

// Preview canvas dimensions (smaller than full canvas)
const canvasWidth = 400
const canvasHeight = 300

// ============================================================================
// COMPUTED
// ============================================================================

const themeInfo = computed(() => {
  const theme = currentResult.value?.metadata.theme ?? 'random'
  return themeDisplayInfo.find(t => t.id === theme) ?? themeDisplayInfo[4]
})

const styleInfo = computed(() => {
  const style = currentResult.value?.metadata.style ?? 'scene'
  return styleDisplayInfo.find(s => s.id === style) ?? styleDisplayInfo[0]
})

const themeIcon = computed(() => themeInfo.value.icon)
const themeName = computed(() => themeInfo.value.name)
const styleIcon = computed(() => styleInfo.value.icon)
const styleName = computed(() => styleInfo.value.name)
const shapeCount = computed(() => currentResult.value?.shapes.length ?? 0)

// ============================================================================
// METHODS
// ============================================================================

function renderPreview(shapes: Shape[]) {
  if (!previewCanvas.value) return

  const ctx = previewCanvas.value.getContext('2d')
  if (!ctx) return

  // Clear and fill with white background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Render shapes
  renderShapes(ctx, shapes, canvasWidth, canvasHeight, {
    noClear: true,
    isRelative: true,
  })
}

function handleTryAgain() {
  isLoading.value = true

  // Small delay for visual feedback
  setTimeout(() => {
    try {
      const result = props.onGenerate()
      currentResult.value = result
      renderPreview(result.shapes)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      isLoading.value = false
    }
  }, 200)
}

function handleUse() {
  if (currentResult.value) {
    emit('use', currentResult.value)
  }
}

function handleCancel() {
  emit('close')
}

// ============================================================================
// WATCHERS
// ============================================================================

// When modal opens or result changes, render preview
watch(
  () => [props.visible, props.result],
  async ([visible, result]) => {
    if (visible && result) {
      currentResult.value = result as GenerationResult
      await nextTick()
      renderPreview((result as GenerationResult).shapes)
    }
  },
  { immediate: true }
)

// Generate initial preview when modal opens with no result
watch(
  () => props.visible,
  async visible => {
    if (visible && !props.result) {
      await nextTick()
      handleTryAgain()
    }
  }
)
</script>

<style scoped>
/* Overlay */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

/* Modal */
.preview-modal {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 2px solid #f59e0b;
}

.preview-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-icon {
  font-size: 1.5rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(146, 64, 14, 0.1);
  color: #92400e;
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(146, 64, 14, 0.2);
}

/* Canvas Container */
.preview-canvas-container {
  position: relative;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.preview-canvas {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  height: auto;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.loading-spinner {
  font-size: 2.5rem;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.loading-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #92400e;
}

/* Info Bar */
.preview-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: #6b7280;
}

.info-icon {
  font-size: 1rem;
}

/* Actions */
.preview-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.action-icon {
  font-size: 1.2rem;
}

.try-again-btn {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.try-again-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.use-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #059669;
  color: white;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.use-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .preview-modal {
    max-width: 100%;
    margin: var(--spacing-sm);
  }

  .preview-canvas-container {
    padding: var(--spacing-sm);
  }

  .preview-info {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>
