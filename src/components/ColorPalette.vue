<template>
  <div
    class="color-palette"
    :class="{ 'color-palette--vertical': vertical }"
    role="group"
    aria-label="Color palette"
  >
    <!-- Preset palette colors -->
    <button
      v-for="color in PALETTE_COLORS"
      :key="color.id"
      type="button"
      class="color-swatch"
      :class="{
        'color-swatch--selected': selectedColor === color.hex,
        'color-swatch--needs-border': color.needsBorder,
      }"
      :style="{
        backgroundColor: color.hex,
        width: swatchSize ? `${swatchSize}px` : undefined,
        height: swatchSize ? `${swatchSize}px` : undefined,
        minWidth: swatchSize ? `${swatchSize}px` : undefined,
        minHeight: swatchSize ? `${swatchSize}px` : undefined,
      }"
      :aria-label="`Select ${color.name} color`"
      :aria-pressed="selectedColor === color.hex"
      @click="selectColor(color.hex)"
    >
      <span v-if="selectedColor === color.hex" class="color-swatch__check" aria-hidden="true">
        ✓
      </span>
    </button>

    <!-- Recent custom colors -->
    <button
      v-for="(color, index) in recentCustomColors"
      :key="`custom-${index}`"
      type="button"
      class="color-swatch color-swatch--custom"
      :class="{
        'color-swatch--selected': selectedColor === color,
        'color-swatch--needs-border': isLightColor(color),
      }"
      :style="{
        backgroundColor: color,
        width: swatchSize ? `${swatchSize}px` : undefined,
        height: swatchSize ? `${swatchSize}px` : undefined,
        minWidth: swatchSize ? `${swatchSize}px` : undefined,
        minHeight: swatchSize ? `${swatchSize}px` : undefined,
      }"
      :aria-label="`Select recent custom color ${color}`"
      :aria-pressed="selectedColor === color"
      @click="selectColor(color)"
    >
      <span v-if="selectedColor === color" class="color-swatch__check" aria-hidden="true"> ✓ </span>
    </button>

    <!-- Custom color picker -->
    <label
      class="color-swatch color-swatch--picker"
      :style="{
        width: swatchSize ? `${swatchSize}px` : undefined,
        height: swatchSize ? `${swatchSize}px` : undefined,
        minWidth: swatchSize ? `${swatchSize}px` : undefined,
        minHeight: swatchSize ? `${swatchSize}px` : undefined,
      }"
      :aria-label="'Pick a custom color'"
    >
      <span class="color-swatch__picker-icon" aria-hidden="true">🎨</span>
      <input
        type="color"
        class="color-swatch__input"
        :value="selectedColor"
        @change="onCustomColorChange"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { PALETTE_COLORS } from '@/constants'

interface Props {
  /** Currently selected color (hex value) */
  selectedColor?: string
  /** Display colors in a single vertical column */
  vertical?: boolean
  /** Custom swatch size in pixels (overrides default) */
  swatchSize?: number
  /** Recent custom colors to display */
  recentCustomColors?: string[]
}

withDefaults(defineProps<Props>(), {
  selectedColor: '',
  vertical: false,
  swatchSize: undefined,
  recentCustomColors: () => [],
})

const emit = defineEmits<{
  /** Emitted when a color swatch is clicked */
  select: [color: string]
  /** Emitted when a custom color is picked */
  customColor: [color: string]
}>()

const selectColor = (color: string) => {
  emit('select', color)
}

/**
 * Handle custom color picker change
 * Uses 'change' event (not 'input') to only fire when user commits to a color
 * This prevents adding multiple near-identical colors while dragging
 */
const onCustomColorChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('customColor', input.value)
}

/**
 * Check if a color is light (needs dark border/checkmark)
 * Uses relative luminance calculation
 */
const isLightColor = (hex: string): boolean => {
  // Remove # if present
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.7
}
</script>

<style scoped>
.color-palette {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  max-width: 200px;
}

/* Vertical layout - single column, each color on its own row */
.color-palette--vertical {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: 0;
  max-width: none;
}

.color-palette--vertical .color-swatch {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  flex-shrink: 0;
}

.color-swatch {
  /* Minimum 44×44px touch target per accessibility guidelines */
  min-width: var(--touch-target-min);
  min-height: var(--touch-target-min);
  width: 100%;
  aspect-ratio: 1;

  /* Reset button styles */
  border: none;
  padding: 0;
  margin: 0;

  /* Visual styling */
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;

  /* Smooth transitions */
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);

  /* Default shadow for depth */
  box-shadow: var(--shadow-sm);
}

/* White swatch needs a visible border */
.color-swatch--needs-border {
  border: 2px solid var(--color-border-strong);
}

/* Hover state */
.color-swatch:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-md);
}

/* Focus state - visible ring for keyboard navigation */
.color-swatch:focus {
  outline: none;
}

.color-swatch:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Selected state */
.color-swatch--selected {
  transform: scale(1.12);
  box-shadow:
    0 0 0 3px var(--color-surface),
    0 0 0 5px var(--color-primary),
    var(--shadow-md);
}

.color-swatch--selected:hover {
  transform: scale(1.12);
}

/* Checkmark indicator for selected swatch */
.color-swatch__check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  text-shadow:
    0 0 2px rgba(0, 0, 0, 0.8),
    0 1px 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

/* Dark checkmark for light colors (yellow, white) */
.color-swatch--needs-border .color-swatch__check {
  color: var(--color-text);
  text-shadow: none;
}

/* Active/pressed state */
.color-swatch:active {
  transform: scale(0.95);
}

.color-swatch--selected:active {
  transform: scale(1.05);
}

/* Custom color picker button */
.color-swatch--picker {
  background: linear-gradient(
    135deg,
    #ff6b6b 0%,
    #ffa94d 16%,
    #ffe066 33%,
    #69db7c 50%,
    #74c0fc 66%,
    #b197fc 83%,
    #f783ac 100%
  );
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.color-swatch__picker-icon {
  font-size: 1.25rem;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* Hide the native color input but keep it functional */
.color-swatch__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

/* Custom colors indicator (subtle dot in corner) */
.color-swatch--custom::after {
  content: '';
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  background: var(--color-surface);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

/* Responsive: smaller touch targets on very small screens */
@media (max-width: 320px) {
  .color-palette {
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }

  .color-swatch {
    min-width: 40px;
    min-height: 40px;
  }

  .color-swatch__picker-icon {
    font-size: 1rem;
  }
}
</style>
