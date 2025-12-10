<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled },
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  variant: 'default',
  size: 'md',
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.base-button {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  /* Sizing - comfortable touch targets */
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);

  /* Typography */
  font-family: inherit;
  font-size: var(--font-size-base);
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;

  /* Visual */
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;

  /* Transitions */
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);

  /* Remove default button styles */
  -webkit-appearance: none;
  appearance: none;
}

/* ========== Size Variants ========== */

.base-button--sm {
  min-height: 36px;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.base-button--md {
  min-height: var(--touch-target-min);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
}

.base-button--lg {
  min-height: 52px;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-lg);
}

/* ========== Style Variants ========== */

/* Default - soft surface with border */
.base-button--default {
  background: var(--color-surface);
  border-color: var(--color-border-strong);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.base-button--default:hover:not(.base-button--disabled) {
  background: var(--color-background);
  border-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.base-button--default:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Primary - main CTA, vibrant */
.base-button--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-color: var(--color-primary-dark);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-md);
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button--primary:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Secondary - accent color */
.base-button--secondary {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
  border-color: var(--color-secondary-dark);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-md);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: linear-gradient(135deg, var(--color-secondary-light) 0%, var(--color-secondary) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button--secondary:active:not(.base-button--disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Ghost - minimal style */
.base-button--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-text-secondary);
}

.base-button--ghost:hover:not(.base-button--disabled) {
  background: var(--color-background);
  color: var(--color-text);
}

/* ========== States ========== */

/* Disabled */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Focus */
.base-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Active state for tool buttons (applied via .active class from parent) */
.base-button.active {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-dark) 100%
  ) !important;
  border-color: var(--color-primary-dark) !important;
  color: var(--color-text-on-primary) !important;
  box-shadow:
    var(--shadow-md),
    inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  transform: scale(1.02);
}

.base-button.active:hover {
  transform: scale(1.02);
}
</style>
