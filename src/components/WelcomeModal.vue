<template>
  <Teleport to="body">
    <div v-if="visible" class="welcome-overlay" @click.self="close">
      <div class="welcome-modal">
        <!-- Header -->
        <div class="welcome-header">
          <span class="welcome-icon">🎨</span>
          <h2 class="welcome-title">Welcome to Color Canvas!</h2>
        </div>

        <!-- Content -->
        <div class="welcome-content">
          <p class="welcome-intro">
            A fun drawing and coloring app for kids. Here's how to get started:
          </p>

          <div class="welcome-steps">
            <!-- Step 1 -->
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>✏️ Draw Mode</h3>
                <p>Start in <strong>Draw Mode</strong> to create your artwork:</p>
                <ul>
                  <li>Use <strong>shape tools</strong> (rectangle, circle, star, etc.)</li>
                  <li>Try the <strong>Magic Generator</strong> for instant coloring pages</li>
                  <li>Load a <strong>Template</strong> from the library</li>
                </ul>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>🖌️ Color Mode</h3>
                <p>Press the <strong>"Color!"</strong> button (top right) to switch modes:</p>
                <ul>
                  <li>Tap anywhere to <strong>fill with color</strong></li>
                  <li>Choose from <strong>10 preset colors</strong> or pick your own</li>
                  <li>Save your artwork as a <strong>PNG image</strong></li>
                </ul>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>💡 Tips</h3>
                <ul>
                  <li><strong>Zoom:</strong> Scroll wheel or pinch gesture</li>
                  <li><strong>Pan:</strong> Right-click and drag</li>
                  <li><strong>Undo:</strong> Made a mistake? Use the undo button!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="welcome-footer">
          <label class="dont-show-again">
            <input type="checkbox" v-model="dontShowAgain" />
            <span>Don't show this again</span>
          </label>

          <div class="welcome-actions">
            <a
              href="https://github.com/OlaProeis/Color-Canvas"
              target="_blank"
              rel="noopener noreferrer"
              class="github-link"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              GitHub
            </a>
            <button class="start-btn" @click="close">Let's Go! 🚀</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const STORAGE_KEY = 'color-canvas-welcome-dismissed'

const visible = ref(false)
const dontShowAgain = ref(false)

// Check if we should show the modal on mount
onMounted(() => {
  const dismissed = window.localStorage.getItem(STORAGE_KEY)
  if (dismissed !== 'true') {
    visible.value = true
  }
})

// Save preference when checkbox changes
watch(dontShowAgain, value => {
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
})

const close = () => {
  visible.value = false
}

// Expose method to open modal from outside
const open = () => {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
  backdrop-filter: blur(4px);
}

.welcome-modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 540px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.welcome-header {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  padding: var(--spacing-lg);
  text-align: center;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.welcome-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing-sm);
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.welcome-title {
  margin: 0;
  color: white;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  padding: var(--spacing-lg);
}

.welcome-intro {
  text-align: center;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-base);
}

.welcome-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.step {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--font-size-base);
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.step-content p {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.step-content ul {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.step-content li {
  margin-bottom: 4px;
}

.welcome-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.dont-show-again {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.dont-show-again input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.welcome-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.github-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.github-link:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.start-btn {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.start-btn:active {
  transform: translateY(0);
}

/* Mobile responsive */
@media (max-width: 640px) {
  .welcome-modal {
    max-height: 85vh;
  }

  .welcome-header {
    padding: var(--spacing-md);
  }

  .welcome-icon {
    font-size: 2.5rem;
  }

  .welcome-title {
    font-size: var(--font-size-xl);
  }

  .welcome-content {
    padding: var(--spacing-md);
  }

  .step {
    gap: var(--spacing-sm);
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-sm);
  }

  .welcome-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .welcome-actions {
    width: 100%;
    justify-content: space-between;
  }

  .start-btn {
    flex: 1;
  }
}
</style>
