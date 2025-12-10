import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLInputElement: 'readonly',
        CanvasRenderingContext2D: 'readonly',
        ResizeObserver: 'readonly',
        // Additional browser globals for Canvas interactions
        PointerEvent: 'readonly',
        TouchEvent: 'readonly',
        WheelEvent: 'readonly',
        KeyboardEvent: 'readonly',
        ImageData: 'readonly',
        Path2D: 'readonly',
        Image: 'readonly',
        // Animation/timing globals
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Other common browser globals
        navigator: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        fetch: 'readonly'
      }
    },
    plugins: {
      vue,
      '@typescript-eslint': ts,
      prettier
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: ['dist', 'node_modules', '*.config.js']
  }
]

