<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <h2 class="confirm-title">{{ title }}</h2>
        <p v-if="message" class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn-cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="confirm-btn confirm-btn-confirm" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

interface Props {
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: 'Confirm',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.visible) return
  if (event.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 55, 72, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confirm-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  max-width: 360px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.25s ease-out;
}

.confirm-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
}

.confirm-message {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  text-align: center;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.confirm-btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  min-height: var(--touch-target-comfortable);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

.confirm-btn-cancel {
  background: var(--color-background);
  color: var(--color-text-secondary);
  border-color: var(--color-border-strong);
}

.confirm-btn-cancel:hover {
  background: var(--color-border);
  color: var(--color-text);
  transform: translateY(-1px);
}

.confirm-btn-cancel:active {
  transform: translateY(0);
}

.confirm-btn-confirm {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

.confirm-btn-confirm:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.confirm-btn-confirm:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.confirm-btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Mobile responsive */
@media (max-width: 400px) {
  .confirm-dialog {
    padding: var(--spacing-lg);
    max-width: calc(100vw - var(--spacing-lg) * 2);
  }

  .confirm-actions {
    flex-direction: column;
  }

  .confirm-btn {
    width: 100%;
  }
}
</style>
