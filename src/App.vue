<template>
  <div id="app" :class="{ 'coloring-mode': drawingStore.isColoringMode }">
    <!-- App Header -->
    <header class="app-header">
      <div class="app-header__content">
        <!-- Logo/Title -->
        <div class="app-header__brand">
          <span class="app-header__icon">🎨</span>
          <h1 class="app-header__title">Color Canvas</h1>
        </div>

        <!-- Mode Toggle -->
        <BaseButton
          class="mode-toggle-btn"
          :variant="drawingStore.isColoringMode ? 'secondary' : 'primary'"
          @click="drawingStore.toggleColoringMode()"
        >
          {{ drawingStore.isColoringMode ? '✏️ Draw' : '🖌️ Color!' }}
        </BaseButton>
      </div>
    </header>

    <div class="app-content">
      <!-- Main Content Area -->
      <div class="main-area">
        <!-- Coloring Mode: Left Sidebar with Colors (Overlay) -->
        <aside
          v-if="drawingStore.isColoringMode"
          class="coloring-sidebar overlay-sidebar"
          :style="{ width: coloringSidebarWidth + 'px' }"
        >
          <div class="sidebar-section sidebar-section--colors">
            <ColorPalette
              :selected-color="drawingStore.currentColor"
              :vertical="true"
              :swatch-size="coloringSwatchSize"
              :recent-custom-colors="drawingStore.recentCustomColors"
              @select="selectColor"
              @custom-color="addCustomColor"
              class="coloring-palette"
            />
          </div>
          <BaseButton @click="saveAsPng" class="save-btn" variant="primary"> 💾 Save </BaseButton>
          <!-- Resize handle -->
          <div class="resize-handle resize-handle--right" @pointerdown="startResizeColoring"></div>
        </aside>

        <!-- Canvas Area -->
        <div class="canvas-wrapper">
          <Canvas ref="canvasRef" :padding="16" :shapes="drawingStore.shapes" />
        </div>

        <!-- Drawing Mode: Right Sidebar with Tools (Overlay) -->
        <aside
          v-if="!drawingStore.isColoringMode"
          class="tools-sidebar overlay-sidebar overlay-sidebar--right"
        >
          <div class="sidebar-scroll">
            <!-- Shapes Section (Collapsible) -->
            <div class="collapsible-section">
              <button
                class="section-header"
                :class="{ active: openSection === 'shapes' }"
                @click="toggleSection('shapes')"
              >
                <span class="section-icon">✏️</span>
                <span class="section-title">Shapes</span>
                <span class="section-arrow">{{ openSection === 'shapes' ? '▼' : '▶' }}</span>
              </button>
              <div v-if="openSection === 'shapes'" class="section-content">
                <div class="tool-grid">
                  <BaseButton
                    v-for="tool in shapeTools"
                    :key="tool.id"
                    @click="selectTool(tool.id)"
                    :class="['tool-btn', { active: drawingStore.currentTool === tool.id }]"
                    size="lg"
                  >
                    <span class="tool-icon">{{ tool.icon }}</span>
                    <span class="tool-label">{{ tool.label }}</span>
                  </BaseButton>
                </div>
                <BaseButton
                  @click="selectTool('eraser')"
                  :class="[
                    'tool-btn tool-btn--wide eraser-btn',
                    { active: drawingStore.currentTool === 'eraser' },
                  ]"
                  size="lg"
                >
                  <span class="tool-icon">🧹</span>
                  <span class="tool-label">Eraser</span>
                </BaseButton>
              </div>
            </div>

            <!-- Stamps Section (Collapsible) -->
            <div class="collapsible-section">
              <button
                class="section-header"
                :class="{ active: openSection === 'stamps' }"
                @click="toggleSection('stamps')"
              >
                <span class="section-icon">🎨</span>
                <span class="section-title">Stamps</span>
                <span class="section-arrow">{{ openSection === 'stamps' ? '▼' : '▶' }}</span>
              </button>
              <div v-if="openSection === 'stamps'" class="section-content">
                <StampPicker />
              </div>
            </div>

            <!-- Magic Generator Section (Collapsible) -->
            <div class="collapsible-section">
              <button
                class="section-header section-header--magic"
                :class="{ active: openSection === 'magic' }"
                @click="toggleSection('magic')"
              >
                <span class="section-icon">✨</span>
                <span class="section-title">Magic Generator</span>
                <span class="section-arrow">{{ openSection === 'magic' ? '▼' : '▶' }}</span>
              </button>
              <div v-if="openSection === 'magic'" class="section-content">
                <MagicGenerator
                  ref="magicGeneratorRef"
                  @generate="handleThemedGenerate"
                  @regenerate="handleRegenerate"
                />
              </div>
            </div>

            <!-- Templates Section (Collapsible) -->
            <div class="collapsible-section">
              <button
                class="section-header section-header--templates"
                :class="{ active: openSection === 'templates' }"
                @click="toggleSection('templates')"
              >
                <span class="section-icon">📚</span>
                <span class="section-title">Templates</span>
                <span class="section-arrow">{{ openSection === 'templates' ? '▼' : '▶' }}</span>
              </button>
              <div v-if="openSection === 'templates'" class="section-content">
                <BaseButton
                  @click="openTemplateLibrary"
                  class="template-button"
                  variant="secondary"
                >
                  📖 Load Page
                </BaseButton>
              </div>
            </div>

            <!-- Background Section (Collapsible) -->
            <div class="collapsible-section">
              <button
                class="section-header section-header--background"
                :class="{ active: openSection === 'background' }"
                @click="toggleSection('background')"
              >
                <span class="section-icon">🖼️</span>
                <span class="section-title">Background</span>
                <span class="section-arrow">{{ openSection === 'background' ? '▼' : '▶' }}</span>
              </button>
              <div v-if="openSection === 'background'" class="section-content">
                <BackgroundSelector />
              </div>
            </div>

            <!-- Action Buttons (Always visible at bottom) -->
            <div class="sidebar-actions">
              <div class="action-row">
                <BaseButton @click="undo" :disabled="!drawingStore.canUndo" size="sm">
                  ↩️
                </BaseButton>
                <BaseButton @click="redo" :disabled="!drawingStore.canRedo" size="sm">
                  ↪️
                </BaseButton>
                <BaseButton @click="clearShapes" variant="ghost" size="sm"> 🗑️ </BaseButton>
                <BaseButton @click="saveAsPng" variant="primary" size="sm"> 💾 </BaseButton>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Clear Confirmation Dialog -->
    <ConfirmDialog
      :visible="showClearConfirm"
      title="🗑️ Clear Canvas?"
      message="This will remove all shapes and fills. You can undo this!"
      confirm-text="Clear All"
      cancel-text="Keep Drawing"
      @confirm="confirmClear"
      @cancel="cancelClear"
    />

    <!-- Generate Coloring Page Confirmation Dialog -->
    <ConfirmDialog
      :visible="showGenerateConfirm"
      title="✨ Create New Coloring Page?"
      message="This will replace your current drawing with a new coloring page. You can undo this!"
      confirm-text="Generate!"
      cancel-text="Keep Drawing"
      @confirm="confirmGenerate"
      @cancel="cancelGenerate"
    />

    <!-- Template Library Modal -->
    <TemplateLibrary
      :visible="showTemplateLibrary"
      @close="showTemplateLibrary = false"
      @select="handleTemplateSelect"
    />

    <!-- Load Template Confirmation Dialog -->
    <ConfirmDialog
      :visible="showTemplateConfirm"
      title="📚 Load Template?"
      message="This will replace your current drawing with the selected template. You can undo this!"
      confirm-text="Load Template"
      cancel-text="Keep Drawing"
      @confirm="confirmTemplateLoad"
      @cancel="cancelTemplateLoad"
    />

    <!-- Welcome Modal -->
    <WelcomeModal ref="welcomeModalRef" />

    <!-- Info Button (bottom right) -->
    <button class="info-btn" @click="openWelcomeModal" title="About Color Canvas">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDrawingStore } from './stores'
import {
  BaseButton,
  Canvas,
  ColorPalette,
  ConfirmDialog,
  TemplateLibrary,
  StampPicker,
  MagicGenerator,
  BackgroundSelector,
  WelcomeModal,
  type CanvasRef,
} from './components'
import type { TemplateDefinition, GenerationResult } from './types'

const drawingStore = useDrawingStore()
const canvasRef = ref<CanvasRef | null>(null)
const showClearConfirm = ref(false)
const magicGeneratorRef = ref<InstanceType<typeof MagicGenerator> | null>(null)
const welcomeModalRef = ref<InstanceType<typeof WelcomeModal> | null>(null)

// Open welcome modal
const openWelcomeModal = () => {
  welcomeModalRef.value?.open()
}

// Template Library state
const showTemplateLibrary = ref(false)
const showTemplateConfirm = ref(false)
const pendingTemplate = ref<TemplateDefinition | null>(null)

// Collapsible sidebar sections - only one open at a time
type SidebarSection = 'shapes' | 'stamps' | 'magic' | 'templates' | 'background' | null
const openSection = ref<SidebarSection>('shapes')

const toggleSection = (section: SidebarSection) => {
  if (openSection.value === section) {
    openSection.value = null // Close if clicking the open one
  } else {
    openSection.value = section
    // Auto-select stamp tool when opening stamps section
    if (section === 'stamps') {
      drawingStore.setCurrentTool('stamp')
    }
  }
}

// ============================================================================
// Resizable Sidebar State
// ============================================================================
const COLORING_SIDEBAR_MIN = 70
const COLORING_SIDEBAR_MAX = 200
const COLORING_SIDEBAR_DEFAULT = 90

const coloringSidebarWidth = ref(COLORING_SIDEBAR_DEFAULT)
const isResizing = ref(false)

// Computed swatch size based on sidebar width
const coloringSwatchSize = computed(() => {
  // Scale swatch size proportionally with sidebar width
  // Min width 70 -> swatch 44px, Max width 200 -> swatch 80px
  const ratio =
    (coloringSidebarWidth.value - COLORING_SIDEBAR_MIN) /
    (COLORING_SIDEBAR_MAX - COLORING_SIDEBAR_MIN)
  return Math.round(44 + ratio * 36)
})

// Resize handlers for coloring sidebar
const startResizeColoring = (e: PointerEvent) => {
  e.preventDefault()
  isResizing.value = true
  document.addEventListener('pointermove', onResizeColoring)
  document.addEventListener('pointerup', stopResizeColoring)
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

const onResizeColoring = (e: PointerEvent) => {
  if (!isResizing.value) return
  // Sidebar is on the left, so width = mouse X position
  const newWidth = Math.min(COLORING_SIDEBAR_MAX, Math.max(COLORING_SIDEBAR_MIN, e.clientX))
  coloringSidebarWidth.value = newWidth
}

const stopResizeColoring = () => {
  isResizing.value = false
  document.removeEventListener('pointermove', onResizeColoring)
  document.removeEventListener('pointerup', stopResizeColoring)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Shape tools with icons and labels
const shapeTools = [
  { id: 'rectangle' as const, icon: '⬜', label: 'Rectangle' },
  { id: 'circle' as const, icon: '⭕', label: 'Circle' },
  { id: 'triangle' as const, icon: '🔺', label: 'Triangle' },
  { id: 'star' as const, icon: '⭐', label: 'Star' },
  { id: 'heart' as const, icon: '❤️', label: 'Heart' },
  { id: 'line' as const, icon: '➖', label: 'Line' },
]

// Magic generator confirmation state
const showGenerateConfirm = ref(false)
const pendingGenerateResult = ref<GenerationResult | null>(null)

const undo = () => {
  drawingStore.undo()
}

const redo = () => {
  drawingStore.redo()
}

// Show confirmation dialog before clearing
const clearShapes = () => {
  // Only show dialog if there's something to clear
  if (drawingStore.shapeCount > 0 || drawingStore.fills.length > 0) {
    showClearConfirm.value = true
  }
}

// Actually clear when user confirms
const confirmClear = () => {
  showClearConfirm.value = false
  drawingStore.clearShapes()
}

// Cancel clear dialog
const cancelClear = () => {
  showClearConfirm.value = false
}

// ============================================================================
// Themed Generator Handlers
// ============================================================================

// Handle generation from MagicGenerator component
const handleThemedGenerate = (result: GenerationResult) => {
  // If canvas has content, show confirmation dialog
  if (drawingStore.shapeCount > 0 || drawingStore.fills.length > 0) {
    pendingGenerateResult.value = result
    showGenerateConfirm.value = true
  } else {
    // No existing content, apply immediately
    applyGenerationResult(result)
  }
}

// Handle regenerate - skips confirmation, directly replaces content
const handleRegenerate = (result: GenerationResult) => {
  applyGenerationResult(result)
}

// Actually apply generation when user confirms
const confirmGenerate = () => {
  showGenerateConfirm.value = false
  if (pendingGenerateResult.value) {
    applyGenerationResult(pendingGenerateResult.value)
    pendingGenerateResult.value = null
  }
}

// Cancel generate dialog
const cancelGenerate = () => {
  showGenerateConfirm.value = false
  pendingGenerateResult.value = null
}

// Apply the themed generation result
const applyGenerationResult = (result: GenerationResult) => {
  drawingStore.applyGenerationResult(result)
}

// ============================================================================
// Template Library Handlers
// ============================================================================

// Open template library modal
const openTemplateLibrary = () => {
  showTemplateLibrary.value = true
}

// Handle template selection from library
const handleTemplateSelect = (template: TemplateDefinition) => {
  showTemplateLibrary.value = false

  // If canvas has content, show confirmation dialog
  if (drawingStore.shapeCount > 0 || drawingStore.fills.length > 0) {
    pendingTemplate.value = template
    showTemplateConfirm.value = true
  } else {
    // No existing content, apply immediately
    applyTemplate(template)
  }
}

// Confirm template load
const confirmTemplateLoad = () => {
  showTemplateConfirm.value = false
  if (pendingTemplate.value) {
    applyTemplate(pendingTemplate.value)
    pendingTemplate.value = null
  }
}

// Cancel template load
const cancelTemplateLoad = () => {
  showTemplateConfirm.value = false
  pendingTemplate.value = null
}

// Apply the selected template
const applyTemplate = async (template: TemplateDefinition) => {
  await drawingStore.applyTemplate(template)
}

const selectTool = (
  tool:
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'star'
    | 'heart'
    | 'line'
    | 'fill'
    | 'eraser'
    | 'stamp'
) => {
  drawingStore.setCurrentTool(tool)
}

const selectColor = (color: string) => {
  drawingStore.setCurrentColor(color)
}

const addCustomColor = (color: string) => {
  drawingStore.addCustomColor(color)
}

/**
 * Generates a timestamped filename for PNG export
 * Format: colorcanvas-YYYYMMDDTHHMMSS.png (ISO 8601 compact, local time)
 * Example: colorcanvas-20251207T143052.png
 */
const generatePngFilename = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `colorcanvas-${year}${month}${day}T${hours}${minutes}${seconds}.png`
}

/**
 * Detects if the browser is iOS Safari (where download attribute doesn't work)
 */
const isIosSafari = (): boolean => {
  const ua = navigator.userAgent
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
  return isIos && isSafari
}

/**
 * Detects if we're on a mobile device
 */
const isMobileDevice = (): boolean => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * Opens image in a new tab with save instructions (fallback for iOS Safari)
 */
const openImageWithSaveHint = (dataUrl: string, filename: string) => {
  // Create a new window/tab with the image and instructions
  const newWindow = window.open('', '_blank')
  if (!newWindow) {
    // Popup blocked - show alert with instructions
    alert('Please allow popups to save the image, or long-press on the canvas to save.')
    return
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${filename}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
          text-align: center;
        }
        .instructions {
          background: #fff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .instructions h2 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        .instructions p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      </style>
    </head>
    <body>
      <div class="instructions">
        <h2>📱 Save Your Drawing</h2>
        <p><strong>Long-press</strong> on the image below and select <strong>"Save Image"</strong></p>
      </div>
      <img src="${dataUrl}" alt="Your drawing">
    </body>
    </html>
  `)
  newWindow.document.close()
}

/**
 * Validation result for PNG export
 */
interface PngValidation {
  isValid: boolean
  isEmpty: boolean
  warnings: string[]
  info: {
    width: number
    height: number
    physicalWidth: number
    physicalHeight: number
    estimatedSizeKb: number
  }
}

/**
 * Validates the canvas content before export
 * Checks for empty canvas, reasonable size, and data integrity
 */
const validateCanvasForExport = (canvas: HTMLCanvasElement, dataUrl: string): PngValidation => {
  const warnings: string[] = []
  const dpr = window.devicePixelRatio || 1

  // Get canvas dimensions (logical and physical)
  const logicalWidth = canvas.width / dpr
  const logicalHeight = canvas.height / dpr
  const physicalWidth = canvas.width
  const physicalHeight = canvas.height

  // Estimate file size from data URL (base64 is ~33% larger than binary)
  // Data URL format: "data:image/png;base64,<data>"
  const base64Data = dataUrl.split(',')[1] || ''
  const estimatedSizeKb = Math.round((base64Data.length * 0.75) / 1024)

  // Check 1: Data URL is valid and not empty
  if (!dataUrl || !dataUrl.startsWith('data:image/png')) {
    warnings.push('Invalid PNG data URL generated')
    return {
      isValid: false,
      isEmpty: true,
      warnings,
      info: {
        width: logicalWidth,
        height: logicalHeight,
        physicalWidth,
        physicalHeight,
        estimatedSizeKb: 0,
      },
    }
  }

  // Check 2: Canvas has reasonable dimensions
  if (logicalWidth < 10 || logicalHeight < 10) {
    warnings.push(`Canvas is very small (${logicalWidth}x${logicalHeight}px)`)
  }

  // Check 3: File size sanity check
  // A completely white canvas still has some size due to PNG header
  // Very small = likely empty, very large = might be corrupted
  const MIN_SIZE_KB = 0.5 // PNG header alone is ~0.5KB
  const MAX_SIZE_MB = 50 // Reasonable max for a drawing app

  if (estimatedSizeKb < MIN_SIZE_KB) {
    warnings.push('PNG data appears corrupted (too small)')
  } else if (estimatedSizeKb > MAX_SIZE_MB * 1024) {
    warnings.push(
      `PNG is very large (${Math.round(estimatedSizeKb / 1024)}MB) - export may be slow`
    )
  }

  // Check 4: Detect if canvas appears empty (all white)
  // Sample a few pixels to check - full scan would be expensive
  let isEmpty = false
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (ctx) {
      // Sample 9 points across the canvas
      const samplePoints = [
        [0.25, 0.25],
        [0.5, 0.25],
        [0.75, 0.25],
        [0.25, 0.5],
        [0.5, 0.5],
        [0.75, 0.5],
        [0.25, 0.75],
        [0.5, 0.75],
        [0.75, 0.75],
      ]

      let allWhite = true
      for (const [xRatio, yRatio] of samplePoints) {
        const x = Math.floor(physicalWidth * xRatio)
        const y = Math.floor(physicalHeight * yRatio)
        const pixel = ctx.getImageData(x, y, 1, 1).data
        // Check if pixel is white (R=255, G=255, B=255) or nearly white
        if (pixel[0] < 250 || pixel[1] < 250 || pixel[2] < 250) {
          allWhite = false
          break
        }
      }

      if (allWhite) {
        isEmpty = true
        warnings.push('Canvas appears empty (no drawings detected)')
      }
    }
  } catch {
    // Ignore sampling errors - not critical
  }

  return {
    isValid: warnings.filter(w => w.includes('Invalid') || w.includes('corrupted')).length === 0,
    isEmpty,
    warnings,
    info: {
      width: logicalWidth,
      height: logicalHeight,
      physicalWidth,
      physicalHeight,
      estimatedSizeKb,
    },
  }
}

/**
 * Saves the canvas content as a PNG file
 * Uses toDataURL to get PNG data and triggers a download
 * Includes fallback for mobile browsers (especially iOS Safari)
 * Validates content before export
 */
const saveAsPng = () => {
  if (!canvasRef.value?.canvas) {
    console.error('Canvas not available for export')
    return
  }

  const canvas = canvasRef.value.canvas

  try {
    // Get PNG data URL from canvas
    const dataUrl = canvas.toDataURL('image/png')

    // Validate canvas content
    const validation = validateCanvasForExport(canvas, dataUrl)

    // Log validation info
    console.log('PNG Export Info:', {
      dimensions: `${validation.info.width}x${validation.info.height}px (logical)`,
      physicalDimensions: `${validation.info.physicalWidth}x${validation.info.physicalHeight}px (physical)`,
      estimatedSize: `${validation.info.estimatedSizeKb}KB`,
      isEmpty: validation.isEmpty,
    })

    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('PNG Export Warnings:', validation.warnings)
    }

    // Block export if data is invalid
    if (!validation.isValid) {
      alert('Unable to export canvas: ' + validation.warnings.join(', '))
      return
    }

    // Warn user if canvas is empty but still allow save
    if (validation.isEmpty) {
      const proceed = confirm('The canvas appears to be empty. Save anyway?')
      if (!proceed) {
        return
      }
    }

    // Generate timestamped filename
    const filename = generatePngFilename()

    // iOS Safari doesn't support the download attribute
    // Open in new tab with save instructions instead
    if (isIosSafari()) {
      openImageWithSaveHint(dataUrl, filename)
      console.log('iOS Safari detected - opened image in new tab for manual save')
      return
    }

    // Standard download approach for desktop and Android
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl

    // Append to body, click, and remove (needed for Firefox)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('Canvas saved as:', filename)

    // Show hint for mobile users (Android) where download might go to Downloads folder
    if (isMobileDevice()) {
      console.log('Mobile device detected - file should be in Downloads folder')
    }
  } catch (error) {
    console.error('Failed to save canvas as PNG:', error)
    // Fallback: try to open in new tab
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const filename = generatePngFilename()
      openImageWithSaveHint(dataUrl, filename)
    } catch {
      alert('Unable to save the canvas. Please try again.')
    }
  }
}

onMounted(() => {
  // Canvas ref and store are available after mount
})
</script>

<style>
/* ==========================================================================
   App Layout - Color Canvas
   ========================================================================== */

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  margin: 0;
  padding: 0;
  background: var(--color-background);
  overflow: hidden;
}

/* ==========================================================================
   App Header
   ========================================================================== */

.app-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, #0ea5e9 100%);
  padding: var(--spacing-sm) var(--spacing-md);
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  position: relative;
  z-index: 10;
}

.app-header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  gap: var(--spacing-md);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.app-header__icon {
  font-size: var(--font-size-2xl);
  line-height: 1;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.app-header__title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-on-dark);
  letter-spacing: -0.5px;
}

.mode-toggle-btn {
  border-radius: var(--radius-full) !important;
  padding: var(--spacing-sm) var(--spacing-lg) !important;
  font-weight: 700 !important;
  min-width: 100px;
}

/* Coloring Mode header style */
.coloring-mode .app-header {
  background: linear-gradient(135deg, var(--color-secondary) 0%, #f472b6 100%);
}

/* ==========================================================================
   Main Content Area
   ========================================================================== */

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* Important for flexbox children */
}

.main-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  position: relative; /* For overlay sidebars */
}

/* ==========================================================================
   Canvas Wrapper
   ========================================================================== */

.canvas-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Important for flexbox */
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  margin: var(--spacing-sm);
  box-shadow: var(--shadow-lg);
  /* Canvas takes full space, sidebars overlay */
  width: 100%;
  height: 100%;
}

/* ==========================================================================
   Tools Sidebar (Drawing Mode)
   ========================================================================== */

.tools-sidebar {
  display: flex;
  flex-direction: column;
  width: 210px;
  min-width: 190px;
  max-width: 250px;
  background: var(--color-surface);
  border-left: 2px solid var(--color-border);
  padding: 0;
}

/* Scrollable content area */
.sidebar-scroll {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xs);
  gap: var(--spacing-xs);
}

/* Right-side overlay positioning */
.overlay-sidebar--right {
  left: auto;
  right: 0;
}

/* Collapsible Sections */
.collapsible-section {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  transition: all var(--transition-fast);
  gap: 6px;
}

.section-header:hover {
  background: var(--color-border);
}

.section-header.active {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
}

.section-header--magic.active {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.section-header--templates.active {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.section-header--background.active {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
}

.section-icon {
  font-size: 1rem;
}

.section-header .section-title {
  flex: 1;
  text-align: left;
  margin: 0;
  font-size: 12px;
}

.section-arrow {
  font-size: 8px;
  opacity: 0.6;
}

.section-content {
  padding: var(--spacing-xs);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

/* Sidebar Actions (always visible) */
.sidebar-actions {
  padding: var(--spacing-xs);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
  background: var(--color-surface);
}

.sidebar-actions .action-row {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.sidebar-actions .action-row > * {
  flex: 1;
  min-width: 0;
  padding: 6px 4px !important;
  font-size: 1rem !important;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar-section--actions {
  gap: var(--spacing-sm);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tool Grid */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) !important;
  min-height: 64px !important;
}

.tool-btn--wide {
  width: 100%;
  flex-direction: row;
  gap: var(--spacing-sm);
  min-height: var(--touch-target-comfortable) !important;
}

.tool-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.tool-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: inherit;
}

/* Action Buttons */
.action-row {
  display: flex;
  gap: var(--spacing-sm);
}

.action-row > * {
  flex: 1;
}

/* ==========================================================================
   Magic Generator Section
   ========================================================================== */

/* Eraser Tool Button */
.eraser-btn {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
  border: 2px solid #f87171 !important;
}

.eraser-btn:hover {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%) !important;
}

.eraser-btn.active {
  background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%) !important;
  border-color: #dc2626 !important;
}

/* Stamp Tool Button */
.stamp-btn {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
  border: 2px solid #38bdf8 !important;
}

.stamp-btn:hover {
  background: linear-gradient(135deg, #bae6fd 0%, #7dd3fc 100%) !important;
}

.stamp-btn.active {
  background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%) !important;
  border-color: #0284c7 !important;
}

.template-button {
  width: 100%;
  font-size: var(--font-size-sm) !important;
}

.magic-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-label {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: #92400e;
}

.shape-count {
  font-size: var(--font-size-xs);
  color: #b45309;
  font-weight: 500;
}

.magic-slider {
  width: 100%;
  height: 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(to right, #86efac, #fde047, #fdba74, #fca5a5);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.magic-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-surface);
  cursor: grab;
  border: 3px solid #92400e;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}

.magic-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.magic-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.magic-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-surface);
  cursor: grab;
  border: 3px solid #92400e;
  box-shadow: var(--shadow-md);
}

.generate-button {
  width: 100%;
  font-size: var(--font-size-base) !important;
}

/* ==========================================================================
   Coloring Mode Sidebar
   ========================================================================== */

.coloring-sidebar {
  display: flex;
  flex-direction: column;
  width: 90px;
  background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%);
  border-right: 2px solid #fbcfe8;
  padding: var(--spacing-md) var(--spacing-sm);
  gap: var(--spacing-md);
  overflow-y: auto;
  overflow-x: hidden;
  align-items: center;
}

/* Overlay sidebar positioning */
.overlay-sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  box-shadow: var(--shadow-lg);
}

/* Resize handle */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: transparent;
  transition: background-color var(--transition-fast);
  z-index: 11;
}

.resize-handle:hover,
.resize-handle:active {
  background: rgba(108, 99, 255, 0.2);
}

.resize-handle--right {
  right: -4px;
}

.resize-handle--left {
  left: -4px;
}

.coloring-sidebar .save-btn {
  margin-top: auto;
  width: 100%;
  font-size: var(--font-size-sm) !important;
  padding: var(--spacing-sm) !important;
}

/* ==========================================================================
   Responsive - Tablet
   ========================================================================== */

@media (max-width: 900px) {
  .tools-sidebar {
    width: 190px;
    min-width: 170px;
  }

  .tool-btn {
    min-height: 48px !important;
  }

  .tool-icon {
    font-size: 1.1rem;
  }

  .section-header {
    padding: 6px 8px;
    font-size: 11px;
  }
}

/* ==========================================================================
   Responsive - Mobile
   ========================================================================== */

@media (max-width: 640px) {
  .app-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .app-header__title {
    font-size: var(--font-size-lg);
  }

  .app-header__icon {
    font-size: var(--font-size-xl);
  }

  .mode-toggle-btn {
    padding: var(--spacing-xs) var(--spacing-md) !important;
    font-size: var(--font-size-sm) !important;
    min-width: 80px;
  }

  /* Stack layout: canvas on top, controls below */
  .main-area {
    flex-direction: column;
  }

  .canvas-wrapper {
    flex: 1;
    min-height: 40vh;
    margin: var(--spacing-xs);
    border-radius: var(--radius-md);
  }

  .tools-sidebar.overlay-sidebar {
    /* On mobile, tools sidebar stays on right but narrower */
    width: 180px;
    min-width: 160px;
    max-width: 200px;
  }

  .sidebar-scroll {
    padding: 4px;
    gap: 4px;
  }

  .section-header {
    padding: 6px;
    font-size: 10px;
    gap: 4px;
  }

  .section-icon {
    font-size: 0.9rem;
  }

  .section-content {
    padding: 4px;
  }

  .sidebar-actions {
    padding: 4px;
  }

  .sidebar-actions .action-row > * {
    padding: 4px !important;
    font-size: 0.9rem !important;
  }

  .sidebar-section {
    flex: 1;
    min-width: 140px;
  }

  .sidebar-section--actions {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: 100%;
  }

  .action-row {
    flex: 1;
    min-width: 140px;
  }

  .tool-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .tool-btn {
    min-height: var(--touch-target-comfortable) !important;
    padding: var(--spacing-xs) !important;
  }

  .tool-icon {
    font-size: 1.25rem;
  }

  .tool-label {
    display: none;
  }

  /* Coloring mode mobile - stays on left side as overlay */
  .coloring-sidebar.overlay-sidebar {
    width: 70px !important; /* Fixed smaller width on mobile */
    border-right: 2px solid #fbcfe8;
    border-bottom: none;
  }

  .coloring-sidebar .resize-handle {
    display: none; /* Hide resize on mobile */
  }

  .coloring-sidebar .save-btn {
    padding: var(--spacing-xs) var(--spacing-sm) !important;
    font-size: var(--font-size-xs) !important;
  }
}

/* ==========================================================================
   Responsive - Small Mobile
   ========================================================================== */

@media (max-width: 380px) {
  .app-header__brand {
    gap: var(--spacing-xs);
  }

  .app-header__title {
    font-size: var(--font-size-base);
  }

  .tool-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .sidebar-section {
    min-width: 100%;
  }
}

/* ==========================================================================
   Info Button (Bottom Right)
   ========================================================================== */

.info-btn {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  z-index: 50;
}

.info-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.info-btn:active {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .info-btn {
    width: 36px;
    height: 36px;
    bottom: var(--spacing-sm);
    right: var(--spacing-sm);
  }
}
</style>
