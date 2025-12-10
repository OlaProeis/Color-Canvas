# Color Palette System

## Overview

The color palette provides 10 kid-friendly preset colors plus a custom color picker for filling shapes. It features large touch targets (≥44×44px), keyboard accessibility, recent custom colors history, and performance-optimized rendering with incremental fill caching.

## Key Files

- `src/constants/colors.ts` - Palette color definitions and accessibility guidelines
- `src/components/ColorPalette.vue` - Palette UI component with swatches
- `src/stores/drawingStore.ts` - `currentColor` state and `setCurrentColor` action
- `src/utils/floodFill.ts` - Flood fill algorithm with safeguards

## Palette Colors

| Color | Hex | Notes |
|-------|-----|-------|
| Red | `#FF6B6B` | Default color |
| Orange | `#FFA94D` | |
| Yellow | `#FFE066` | |
| Green | `#69DB7C` | |
| Blue | `#74C0FC` | |
| Purple | `#B197FC` | |
| Pink | `#F783AC` | |
| Brown | `#A67C52` | |
| Black | `#212529` | Dark, not pure black |
| White | `#FFFFFF` | Has visible border |

## Custom Color Picker

Beyond the 10 preset colors, users can pick any custom color using the native HTML color input.

### Features
- **Native color picker**: Uses `<input type="color">` for maximum compatibility
- **Recent colors**: Stores last 5 custom colors used (session only)
- **Visual indicator**: Custom colors show a small dot to distinguish from presets
- **Light color detection**: Light colors automatically get a visible border

### Color Flow (Custom)
```
User clicks 🎨 picker → Native color dialog opens → User picks color
                                                            ↓
ColorPalette emits 'customColor' → App.vue calls store.addCustomColor(hex)
                                                            ↓
                                   Color set as current + added to recentCustomColors
```

### Recent Colors Behavior
- Maximum 5 colors stored
- Most recent first
- Duplicates are moved to front (not added twice)
- Stored in memory only (not persisted between sessions)

## Architecture

### Color Flow (Preset)
```
User clicks swatch → ColorPalette emits 'select' → App.vue calls store.setCurrentColor(hex)
                                                                    ↓
User clicks fill tool on canvas → Canvas.vue reads store.currentColor → floodFill() uses color
```

### Component Structure
```vue
<ColorPalette 
  :selected-color="drawingStore.currentColor"
  :recent-custom-colors="drawingStore.recentCustomColors"
  @select="selectColor"
  @custom-color="addCustomColor"
/>
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedColor` | `string` | `''` | Currently selected color (hex) |
| `vertical` | `boolean` | `false` | Display in vertical column layout |
| `swatchSize` | `number` | `undefined` | Custom swatch size in pixels |
| `recentCustomColors` | `string[]` | `[]` | Recent custom colors to display |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `string` | Emitted when a preset or recent color is clicked |
| `customColor` | `string` | Emitted when a custom color is picked |

## Performance Optimizations

### Incremental Fill Caching
Instead of replaying ALL fills on every redraw, the system uses incremental caching:

1. **Base State Cache**: Stores canvas ImageData after shapes + fills are rendered
2. **Incremental Fills**: New fills are applied on top of the cache (1 flood fill)
3. **Full Rebuild**: Only when shapes change, fills are undone, or canvas resizes

| Operation | Before | After |
|-----------|--------|-------|
| Add fill #40 | 40 flood fills | 1 flood fill |
| Drawing preview | 40 flood fills | Cache restore only |

### History Limit
Undo history is limited to 10 entries to prevent memory bloat (each entry stores a full snapshot of fills).

## Flood Fill Safeguards

### Stroke Protection
Clicking on pure black strokes (RGB all < 20) is rejected to prevent filling stroke lines.

### Background Protection
Fills exceeding 30% of canvas area are rejected to prevent accidentally filling the entire background.

## Accessibility

### Touch Targets
- Minimum 44×44px per Apple HIG / Material Design guidelines
- 8px gap between swatches to prevent mis-taps

### Keyboard Navigation
- Tab to move between swatches
- Enter/Space to select
- Focus ring: 3px dark outline with 2px offset

### Visual Indicators
- Selected swatch: Scale 1.1x + double ring shadow + checkmark
- White swatch: 2px gray border for visibility

## Usage

```typescript
// In component
import { ColorPalette } from '@/components'
import { useDrawingStore } from '@/stores'

const store = useDrawingStore()

// Handle preset color selection
const handleColorSelect = (color: string) => {
  store.setCurrentColor(color)
}

// Handle custom color picker
const handleCustomColor = (color: string) => {
  store.addCustomColor(color) // Sets color AND adds to recent list
}
```

```vue
<ColorPalette 
  :selected-color="store.currentColor"
  :recent-custom-colors="store.recentCustomColors"
  @select="handleColorSelect"
  @custom-color="handleCustomColor"
/>
```

## Testing

### Preset Colors
1. **Visual**: Verify all 10 colors render correctly
2. **Selection**: Click swatch → verify `currentColor` updates
3. **Fill Integration**: Select color → use fill tool → verify fill uses selected color
4. **Accessibility**: Tab through swatches, verify focus ring visible
5. **Touch**: On mobile, verify swatches are large enough to tap accurately

### Custom Color Picker
1. **Picker Opens**: Click 🎨 button → native color dialog opens
2. **Color Applied**: Pick color → verify `currentColor` updates
3. **Recent Colors**: Pick color → verify it appears in recent colors
4. **No Duplicates**: Pick same color again → only one entry in recent list
5. **Max 5 Colors**: Pick 6+ colors → only 5 most recent shown
6. **Fill Integration**: Pick custom color → use fill tool → verify fill uses custom color
7. **Light Color Border**: Pick white/yellow → verify border is visible
8. **Both Modes**: Works in Drawing Mode and Coloring Mode
