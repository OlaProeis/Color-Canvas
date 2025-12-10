<template>
  <div class="background-selector">
    <!-- Type Selector -->
    <div class="type-selector">
      <button
        v-for="typeOption in typeOptions"
        :key="typeOption.type"
        :class="['type-btn', { active: selectedType === typeOption.type }]"
        @click="selectType(typeOption.type)"
        :title="typeOption.label"
      >
        <span class="type-icon">{{ typeOption.icon }}</span>
        <span class="type-label">{{ typeOption.label }}</span>
      </button>
    </div>

    <!-- Preset Grid -->
    <div v-if="currentPresets.length > 0" class="preset-grid">
      <button
        v-for="preset in currentPresets"
        :key="preset.id"
        :class="['preset-btn', { active: isActivePreset(preset) }]"
        :style="{ background: getPresetBackground(preset) }"
        @click="selectPreset(preset)"
        :title="preset.name"
      >
        <span class="preset-name">{{ preset.name }}</span>
        <span v-if="isAnimatedPreset(preset)" class="animated-badge">✨</span>
      </button>
    </div>

    <!-- Reset Button -->
    <button
      v-if="!isNoneBackground"
      class="reset-btn"
      @click="resetBackground"
      title="Reset to white"
    >
      🔄 Reset to White
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDrawingStore } from '@/stores'
import type { BackgroundType, BackgroundPreset } from '@/types'
import {
  DEFAULT_BACKGROUND,
  SOLID_PRESETS,
  GRADIENT_PRESETS,
  SCENE_PRESETS,
  ANIMATED_PRESETS,
} from '@/types'
import { getBackgroundPreviewCSS } from '@/utils/backgroundRenderer'

const drawingStore = useDrawingStore()

// Type options for selector
const typeOptions: { type: BackgroundType; icon: string; label: string }[] = [
  { type: 'none', icon: '⬜', label: 'None' },
  { type: 'solid', icon: '🎨', label: 'Color' },
  { type: 'gradient', icon: '🌈', label: 'Gradient' },
  { type: 'scene', icon: '🏞️', label: 'Scene' },
  { type: 'animated', icon: '✨', label: 'Animated' },
]

// Current selected type (derived from store or manually selected)
const selectedType = ref<BackgroundType>(drawingStore.background.type)

// Watch store changes to sync selected type
watch(
  () => drawingStore.background.type,
  newType => {
    selectedType.value = newType
  }
)

// Get presets for current type
const currentPresets = computed((): BackgroundPreset[] => {
  switch (selectedType.value) {
    case 'solid':
      return SOLID_PRESETS
    case 'gradient':
      return GRADIENT_PRESETS
    case 'scene':
      return SCENE_PRESETS
    case 'animated':
      return ANIMATED_PRESETS
    default:
      return []
  }
})

// Check if current background is "none"
const isNoneBackground = computed(() => {
  return drawingStore.background.type === 'none'
})

// Select a type (shows presets for that type)
const selectType = (type: BackgroundType) => {
  selectedType.value = type

  // If selecting "none", apply immediately
  if (type === 'none') {
    drawingStore.setBackground(DEFAULT_BACKGROUND)
  }
  // Otherwise, just show the presets and let user pick one
}

// Select a preset
const selectPreset = (preset: BackgroundPreset) => {
  drawingStore.setBackground(preset.config)
}

// Reset to default (white/none)
const resetBackground = () => {
  selectedType.value = 'none'
  drawingStore.setBackground(DEFAULT_BACKGROUND)
}

// Get background CSS for preset preview
const getPresetBackground = (preset: BackgroundPreset): string => {
  if (preset.preview) {
    return preset.preview
  }
  return getBackgroundPreviewCSS(preset.config)
}

// Check if a preset is currently active
const isActivePreset = (preset: BackgroundPreset): boolean => {
  const current = drawingStore.background

  // Quick type check first
  if (current.type !== preset.config.type) {
    return false
  }

  // For each type, compare relevant properties
  switch (current.type) {
    case 'solid':
      return (
        preset.config.type === 'solid' &&
        current.color.toLowerCase() === preset.config.color.toLowerCase()
      )

    case 'gradient':
      // Compare gradient stops (simplified comparison)
      if (preset.config.type !== 'gradient') return false
      return JSON.stringify(current.stops) === JSON.stringify(preset.config.stops)

    case 'scene':
      return preset.config.type === 'scene' && current.id === preset.config.id

    case 'animated':
      return preset.config.type === 'animated' && current.id === preset.config.id

    default:
      return false
  }
}

// Check if preset is animated
const isAnimatedPreset = (preset: BackgroundPreset): boolean => {
  return preset.config.type === 'animated'
}
</script>

<style scoped>
.background-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Type Selector */
.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.type-btn {
  flex: 1;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 4px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.type-btn:hover {
  border-color: var(--color-primary-light);
  background: var(--color-background);
}

.type-btn.active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.type-icon {
  font-size: 1rem;
  line-height: 1;
}

.type-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.type-btn.active .type-label {
  color: var(--color-primary);
}

/* Preset Grid */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 2px;
}

.preset-btn {
  position: relative;
  aspect-ratio: 1.5;
  min-height: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-fast);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4px;
}

.preset-btn:hover {
  border-color: var(--color-primary-light);
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.preset-btn.active {
  border-color: var(--color-primary);
  border-width: 3px;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.2);
}

.preset-name {
  font-size: 9px;
  font-weight: 600;
  color: #333;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.animated-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Reset Button */
.reset-btn {
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
  background: var(--color-background);
}

/* Scrollbar styling for preset grid */
.preset-grid::-webkit-scrollbar {
  width: 4px;
}

.preset-grid::-webkit-scrollbar-track {
  background: transparent;
}

.preset-grid::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.preset-grid::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 640px) {
  .type-selector {
    gap: 2px;
  }

  .type-btn {
    min-width: 40px;
    padding: 4px 2px;
  }

  .type-icon {
    font-size: 0.9rem;
  }

  .type-label {
    font-size: 8px;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    max-height: 150px;
  }

  .preset-btn {
    min-height: 35px;
  }

  .preset-name {
    font-size: 8px;
    padding: 1px 4px;
  }
}
</style>
