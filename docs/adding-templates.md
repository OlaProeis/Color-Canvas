# How to Add SVG Templates

## Quick Start

1. **Get/Create an SVG coloring page**
   - Use Fluxx AI generator or any SVG tool
   - Make sure it has black outlines and white/transparent fills

2. **Place the SVG file in a category folder:**
   ```
   public/templates/
   ├── animals/        ← Put animal templates here
   ├── vehicles/       ← Put vehicle templates here
   ├── nature/         ← Put nature templates here
   ├── fantasy/        ← Put fantasy templates here
   └── [etc]/
   ```

3. **Name your file with hyphens:**
   - ✅ `cute-puppy.svg` → Shows as "Cute Puppy"
   - ✅ `fire-truck.svg` → Shows as "Fire Truck"
   - ❌ `Cute Puppy.svg` → Avoid spaces
   - ❌ `cute_puppy.svg` → Use hyphens, not underscores

4. **Done!** The template appears automatically in the app.

## SVG Requirements

Your SVG files should:
- Have a `viewBox` attribute or `width`/`height`
- Use **black strokes** (`stroke="#000000"`)
- Have **transparent or white fills**
- Use **closed paths** for proper flood-fill coloring

### Good SVG Example:
```xml
<svg viewBox="0 0 800 600">
  <g fill="none" stroke="#000000" stroke-width="3">
    <circle cx="400" cy="300" r="100"/>
    <rect x="200" y="400" width="400" height="150"/>
  </g>
</svg>
```

## Available Categories

- `animals/` 🐾
- `vehicles/` 🚗
- `nature/` 🌿
- `buildings/` 🏠
- `objects/` ⭐
- `characters/` 🎭
- `food/` 🍕
- `abstract/` 🔷
- `fantasy/` 🦄

## Tips

**For AI-Generated SVGs:**
- Use outline/coloring book style
- Avoid complex gradients and effects
- Keep designs simple and kid-friendly
- Ensure paths are closed for flood-fill

**Auto Border Frame:**
- A black border is automatically added around SVG content
- The border shrinks to touch the actual drawn lines
- This prevents flood-fill from bleeding outside the template
- No need to add your own border - it's handled automatically!

**File Organization:**
- Keep related templates together
- Use descriptive names
- Can have multiple templates per category
- No limit on number of templates

**Testing:**
- SVGs appear immediately (no rebuild needed in dev mode)
- Click "Load Page" button to see your templates
- Test flood-fill to ensure outlines are properly closed

## Troubleshooting

**Template doesn't appear:**
- Check file is in correct folder (`public/templates/[category]/`)
- Check filename has `.svg` extension
- Check SVG file is valid XML

**Preview looks wrong:**
- Verify SVG has `viewBox` or `width`/`height`
- Check stroke colors are dark/visible
- Ensure SVG renders correctly in browser

**Flood-fill doesn't work:**
- Make sure paths are closed (no gaps in lines)
- Check stroke width isn't too thin
- Verify fills are transparent/white, not colored

## Example Workflow

1. Generate image with Fluxx AI
2. Convert to SVG using tool like Vector Magic or AI converter
3. Edit SVG if needed:
   - Change fills to white/transparent
   - Make strokes black
   - Simplify paths
4. Save as `my-template.svg`
5. Copy to `public/templates/animals/my-template.svg`
6. Refresh browser (or it auto-reloads)
7. Click "Load Page" → See your template!