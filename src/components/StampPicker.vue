<template>
  <div class="stamp-picker">
    <!-- Category Tabs -->
    <div class="stamp-picker__tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['tab-btn', { active: selectedCategory === cat }]"
        @click="selectedCategory = cat"
        :title="categoryInfo[cat].label"
      >
        <span class="tab-icon">{{ categoryInfo[cat].icon }}</span>
      </button>
    </div>

    <!-- Stamp Grid -->
    <div class="stamp-picker__grid">
      <button
        v-for="stamp in filteredStamps"
        :key="stamp.id"
        :class="['stamp-btn', { active: currentStampKey === stamp.id }]"
        @click="selectStamp(stamp.id)"
        :title="stamp.name"
      >
        <span class="stamp-icon">{{ stamp.icon }}</span>
      </button>
    </div>

    <!-- Size Selector -->
    <div class="stamp-picker__sizes">
      <span class="size-label">Size:</span>
      <button
        v-for="size in sizes"
        :key="size.value"
        :class="['size-btn', { active: currentStampSize === size.value }]"
        @click="selectSize(size.value)"
        :title="size.label"
      >
        {{ size.abbrev }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDrawingStore } from '@/stores'
import {
  getStampCategories,
  getStampsByCategory,
  stampCategoryInfo,
  type StampCategory,
  type StampSizePreset,
} from '@/data/stamps'

const drawingStore = useDrawingStore()

// Categories and info
const categories = getStampCategories()
const categoryInfo = stampCategoryInfo

// Selected category
const selectedCategory = ref<StampCategory>('emoji')

// Size options
const sizes: { value: StampSizePreset; abbrev: string; label: string }[] = [
  { value: 'small', abbrev: 'S', label: 'Small' },
  { value: 'medium', abbrev: 'M', label: 'Medium' },
  { value: 'large', abbrev: 'L', label: 'Large' },
]

// Computed: filtered stamps by category
const filteredStamps = computed(() => {
  return getStampsByCategory(selectedCategory.value)
})

// Computed: current stamp from store
const currentStampKey = computed(() => drawingStore.currentStampKey)
const currentStampSize = computed(() => drawingStore.currentStampSize)

// Select a stamp
const selectStamp = (stampId: string) => {
  drawingStore.setCurrentStampKey(stampId)
  // Ensure stamp tool is active
  if (drawingStore.currentTool !== 'stamp') {
    drawingStore.setCurrentTool('stamp')
  }
}

// Select a size
const selectSize = (size: StampSizePreset) => {
  drawingStore.setCurrentStampSize(size)
}
</script>

<style scoped>
.stamp-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-accent-dark);
  overflow: hidden;
}

/* Category Tabs */
.stamp-picker__tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  padding: 2px;
}

.tab-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Stamp Grid */
.stamp-picker__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
  padding: 4px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
}

.stamp-btn {
  aspect-ratio: 1;
  width: 100%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.stamp-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.stamp-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: inset 0 0 0 2px rgba(108, 99, 255, 0.3);
}

.stamp-icon {
  line-height: 1;
}

/* Size Selector */
.stamp-picker__sizes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.size-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: #92400e;
}

.size-btn {
  width: 32px;
  height: 28px;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.size-btn:hover {
  border-color: var(--color-primary-light);
  background: var(--color-primary-light);
}

.size-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .stamp-picker__grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stamp-btn {
    font-size: 1.1rem;
  }

  .tab-btn {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-xs);
  }
}
</style>
