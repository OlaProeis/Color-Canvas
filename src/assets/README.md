# Assets Directory

This directory contains static assets like images, fonts, and other media files.

## Usage

Import assets in components like this:

```vue
<script setup>
import logo from '@/assets/logo.png'
</script>

<template>
  <img :src="logo" alt="Logo" />
</template>
```

Vite will process and optimize these assets automatically.
