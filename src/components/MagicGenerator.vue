<template>
  <div class="magic-generator">
    <!-- Style Selection - Compact Row -->
    <div class="style-row">
      <button
        v-for="style in styles"
        :key="style.id"
        @click="selectedStyle = style.id"
        :class="['style-btn', { active: selectedStyle === style.id }]"
        :title="style.description"
      >
        <span class="style-icon">{{ style.icon }}</span>
        <span class="style-name">{{ style.name }}</span>
      </button>
    </div>

    <!-- Detail Slider -->
    <div class="detail-row">
      <span class="detail-label">{{ currentDetailLabel }}</span>
      <input
        type="range"
        min="0"
        max="3"
        :value="detailIndex"
        @input="handleDetailChange"
        class="detail-slider"
      />
      <span class="shape-count">~{{ estimatedShapeCount }}</span>
    </div>

    <!-- Generate Buttons -->
    <div class="generate-row">
      <button class="generate-btn" @click="handleGenerate" :disabled="isGenerating">
        <span class="btn-icon">{{ isGenerating ? '⏳' : '🎲' }}</span>
        <span class="btn-text">{{ isGenerating ? '...' : 'Generate' }}</span>
      </button>
      <button
        v-if="hasGenerated"
        class="regenerate-btn"
        @click="handleRegenerate"
        :disabled="isGenerating"
        title="Try again"
      >
        🔄
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {
  GeneratorStyle,
  GeneratorDifficulty,
  MagicGeneratorConfig,
  GenerationResult,
} from '@/types/generator'
import { generateThemedShapes } from '@/utils/themedGenerator'
import { getDefaultComposition } from '@/utils/compositionRules'

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
  generate: [result: GenerationResult]
  regenerate: [result: GenerationResult]
}>()

// ============================================================================
// STATE
// ============================================================================

const selectedStyle = ref<GeneratorStyle>('mandala')
const selectedDifficulty = ref<GeneratorDifficulty>('kid')
const isGenerating = ref(false)
const hasGenerated = ref(false)

// ============================================================================
// DISPLAY DATA
// ============================================================================

// Only two styles now
const styles = [
  { id: 'mandala' as const, name: 'Mandala', icon: '🔷', description: 'Circular symmetry' },
  { id: 'kaleidoscope' as const, name: 'Kaleido', icon: '❄️', description: 'Overlapping symmetry' },
]

// Detail levels for slider
const detailLevels: { id: GeneratorDifficulty; label: string }[] = [
  { id: 'toddler', label: 'Simple' },
  { id: 'kid', label: 'Easy' },
  { id: 'teen', label: 'Medium' },
  { id: 'adult', label: 'Detailed' },
]

// ============================================================================
// COMPUTED
// ============================================================================

const detailIndex = computed(() => {
  return detailLevels.findIndex(d => d.id === selectedDifficulty.value)
})

const currentDetailLabel = computed(() => {
  return detailLevels[detailIndex.value]?.label ?? 'Easy'
})

const estimatedShapeCount = computed(() => {
  // Difficulty determines shape count in mandala/kaleidoscope patterns
  // Mandala/kaleidoscope styles create more shapes due to symmetry
  const rings =
    selectedDifficulty.value === 'toddler'
      ? 2
      : selectedDifficulty.value === 'kid'
        ? 3
        : selectedDifficulty.value === 'teen'
          ? 4
          : 5
  const shapesPerRing =
    selectedDifficulty.value === 'toddler'
      ? 4
      : selectedDifficulty.value === 'kid'
        ? 5
        : selectedDifficulty.value === 'teen'
          ? 6
          : 8
  let total = 0
  for (let r = 1; r <= rings; r++) {
    total += shapesPerRing * r
  }
  // Kaleidoscope has more overlap
  if (selectedStyle.value === 'kaleidoscope') {
    total = Math.floor(total * 1.5)
  }
  return total
})

const currentConfig = computed<MagicGeneratorConfig>(() => ({
  theme: 'random',
  style: selectedStyle.value,
  difficulty: selectedDifficulty.value,
  composition: getDefaultComposition(selectedStyle.value),
}))

// ============================================================================
// METHODS
// ============================================================================

function handleDetailChange(event: Event) {
  const target = event.target as HTMLInputElement
  const index = parseInt(target.value, 10)
  selectedDifficulty.value = detailLevels[index].id
}

function handleGenerate() {
  isGenerating.value = true

  window.setTimeout(() => {
    try {
      const result = generateThemedShapes(currentConfig.value)
      emit('generate', result)
      hasGenerated.value = true
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      isGenerating.value = false
    }
  }, 100)
}

function handleRegenerate() {
  isGenerating.value = true

  window.setTimeout(() => {
    try {
      const result = generateThemedShapes(currentConfig.value)
      emit('regenerate', result)
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      isGenerating.value = false
    }
  }, 100)
}

function generatePreview(): GenerationResult {
  return generateThemedShapes(currentConfig.value)
}

defineExpose({
  generatePreview,
  currentConfig,
})
</script>

<style scoped>
.magic-generator {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--radius-md);
  border: 2px solid #f59e0b;
}

/* Style Row */
.style-row {
  display: flex;
  gap: var(--spacing-xs);
}

.style-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 6px;
  border: 2px solid #fcd34d;
  border-radius: var(--radius-md);
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  min-width: 0; /* Allow shrinking */
}

.style-btn:hover {
  border-color: #f59e0b;
  background: #fffbeb;
}

.style-btn.active {
  border-color: #d97706;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
}

.style-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.style-name {
  font-size: 10px;
  font-weight: 600;
  color: #92400e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Detail Row */
.detail-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  min-width: 50px;
}

.detail-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #86efac, #fde047, #fdba74, #fca5a5);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.detail-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #92400e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: grab;
}

.detail-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #92400e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: grab;
}

.shape-count {
  font-size: 10px;
  font-weight: 600;
  color: #b45309;
  min-width: 28px;
  text-align: right;
}

/* Generate Row */
.generate-row {
  display: flex;
  gap: var(--spacing-xs);
}

.generate-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.5);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.regenerate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  padding: 8px;
  border: 2px solid #d97706;
  border-radius: var(--radius-md);
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.regenerate-btn:hover:not(:disabled) {
  background: #fef3c7;
  transform: rotate(180deg);
}

.regenerate-btn:disabled {
  opacity: 0.5;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
