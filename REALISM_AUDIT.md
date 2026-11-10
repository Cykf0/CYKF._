# REALISM_AUDIT.md — Realism & Shader-Pack Fidelity Audit

**Date**: 2026-11-10  
**Project**: Cykf._ (Saksham's Minecraft Portfolio)  
**Target Quality**: Shader-pack tier Minecraft graphics (Complementary / BSL / SEUS style) while preserving voxel geometry, pixel-art textures, and 100% interactive performance.

---

## Executive Summary
The foundation of "Cykf._" is structurally complete: all 9 scenes, 3D voxel models, custom skin rendering for `Cykf_`, HUD, Web Audio synth, and navigation are fully implemented.
However, visual fidelity currently relies on standard unmapped diffuse textures, flat ambient lighting, basic background colors, and minimal post-processing.
This audit outlines the exact per-scene visual gaps and establishes the architecture for the **Realism Upgrade Pass**.

---

## Per-Scene Gap Analysis & Benchmark against `/reference`

### Scene 1: Sunrise Village (Title / Welcome)
- **Reference Look**: Golden hour dawn, low angled sun casting long, soft shadows; warm orange highlights on oak wood; cool teal shadows; volumetric god rays through trees; distant mountains fading in warm atmospheric haze; soft contact shadows under the cobblestone well.
- **Current State**: Static directional light, flat background color, basic materials without normals/roughness, no volumetric light shafts, no contact shadows.
- **Upgrades Required**:
  - Low-angle warm directional sun (PCFSoft shadows, tuned bias).
  - Procedural atmospheric sky dome with sun disk and drifting volumetric clouds.
  - Volumetric god rays streaming across the wheat field with dust motes.
  - Normal + roughness companion maps on oak planks, cobblestone, and farmland.
  - Contact shadow under the well, sheep, and fences.
  - Post-processing: warm color grading (lift shadows to teal, push highlights to golden amber), subtle bloom on the sun.

### Scene 2: Cherry Grove (Player Profile)
- **Reference Look**: Dreamy, bright, airy; soft pink bloom; translucent cherry leaf canopy catching backlighting (subsurface scattering); light shafts through pink leaves; instanced tall grass and pink flower blooms on grass; shallow depth-of-field focused on `Cykf_`; rim lighting on player silhouette.
- **Current State**: Opaque pink leaves, flat grass, no rim lighting on player, no depth of field, no bloom.
- **Upgrades Required**:
  - Foliage shader: wind sway vertex displacement, backlighting translucency (fake SSS) where leaves glow when backlit.
  - Instanced tall grass blades & pink petal tufts on the ground.
  - Subtle depth-of-field (bokeh) centered at the player model (`distance: 7.5`, shallow blur in background).
  - Rim light highlighting player's hair, shoulders, and outer jacket layer.
  - Floating cherry blossom petal particles with gentle rotational flutter and wind drift.
  - Soft pink bloom in post-processing.

### Scene 3: Stronghold Library (Skills / Enchantments)
- **Reference Look**: Moody, mystical stronghold; deep cold slate and stone brick walls with crisp carved normal maps; floating enchanting table with an emissive glowing book; orbiting magical purple glyph particles; warm torch and lantern point light with flicker contrasting against cold stone; dramatic vignette.
- **Current State**: Flat purple fill light, flat book material, static glyph particles without bloom, flat stone texture.
- **Upgrades Required**:
  - Procedural normal & roughness maps for stone bricks and carved bookshelves.
  - Point light at the enchanting table with subtle pulsating purple emissive glow.
  - Animated glowing rune particles with additive blending and strong bloom threshold.
  - Flickering warm torchlight on the stone columns casting soft dynamic shadows.
  - Heavy moody vignette and purple-blue shadow tinting.

### Scene 4: Abandoned Mineshaft (Projects / Chest)
- **Reference Look**: Dark, mysterious subterranean cavern; high contrast torchlight; rough wooden support beams with visible grain; glossy specular highlights on diamond, gold, and iron ore veins; volumetric torch haze; dust motes swirling in the air; interactive chest with metallic latch specular and warm rim.
- **Current State**: Even ambient lighting, ore blocks are flat diffuse, no dust motes, no torch flicker, no specular difference between stone and gem veins.
- **Upgrades Required**:
  - Procedural PBR companion maps for ores: high roughness for stone matrix, 0.1 roughness + 0.9 metalness/specular + subtle emissive for diamond/gold/redstone facets.
  - Dynamic flickering point light at the wall torches casting realistic contact shadows.
  - Volumetric dust particles catching the torch light.
  - Interactive chest: metallic roughness map on iron latch, wood grain normal on chest body, soft ground contact shadow.
  - Post-processing: high-contrast color grading, deep shadow crush, warm torch bloom.

### Scene 5: Snowy Mountain Peak (Journey / Crafting)
- **Reference Look**: High altitude crisp alpine peak; cool blue shadows contrasting with a rich orange sunset; sparkling snow material with blue SSS; 3D campfire with rising voxel smoke, glowing orange embers, and a warm flickering point light; gentle drifting snowfall particles; distant peaks lost in cool mountain mist.
- **Current State**: Flat white snow block material, static campfire without dynamic light, no snow sparkles, uniform lighting.
- **Upgrades Required**:
  - Procedural snow material: high roughness with subtle micro-specular sparkle and blue-tinted shadow absorption.
  - Dynamic point light inside the campfire with Perlin noise flicker (intensity 1.5 - 2.5) illuminating snow and player.
  - Upgraded campfire smoke: translucent soft rising voxel puffs that dissipate + glowing embers floating upwards.
  - Particle system for drifting snowfall with wind physics.
  - Height fog: cool alpine mist in valleys.

### Scene 6: Deep Dark / Ancient City (Advancements)
- **Reference Look**: Oppressive pitch-black cavern; eerie glowing cyan sculk veins and catalysts with high-intensity bloom; soul lantern casting cold cyan light; pulsing sculk animation; floating soul particles; sharp cyan rim light on player.
- **Current State**: Generic dark blue lighting, static sculk texture, no bloom, no soul lantern point light, no sculk pulse.
- **Upgrades Required**:
  - Sculk material: emissive map with animated sine/noise shader pulsing the cyan tendrils.
  - Soul lantern & catalyst point lights with cold cyan (#00f3ff) color and soft contact shadows.
  - Strong threshold-based bloom on all sculk and soul elements.
  - Rising soul particle system with soft additive glow.
  - Heavy black fog with close near-plane (`near: 5`, `far: 22`) for oppressive subterranean atmosphere.

### Scene 7: Village Market Interior (Trades / Services)
- **Reference Look**: Warm, cozy, sunlit wooden interior; strong directional sunlight slicing through the window slats creating distinct light beams (god rays) with illuminated dust particles; warm bounce light illuminating the ceiling; rich oak and birch grain normals; interactive villager with soft contact shadow.
- **Current State**: Flat interior lighting, no window light shaft, no dust particles, flat wood textures.
- **Upgrades Required**:
  - Volumetric sunbeam mesh/shader angling through the window opening with noise animated dust motes.
  - Warm directional light entering from the window + warm ground bounce hemisphere light.
  - Wood companion maps (normal + roughness) on tables, barrels, counters, and floor planks.
  - Contact shadow under the villager and furniture props.
  - Ambient occlusion in corners and under shelves.

### Scene 8: Lush Caves (Contact / Parchment)
- **Reference Look**: Deep humid biosphere; glowing amber glow berries illuminating hanging vines and mossy stone; translucent, reflective water pool with animated normal waves, Fresnel reflection, and caustic patterns projected on the stone basin; swimming axolotl with water wake ripples; water drip particles falling from ceiling stalactites.
- **Current State**: Flat blue box for water, static glow berries without illumination, no caustics, no ripples, flat moss.
- **Upgrades Required**:
  - Water shader: animated normal map wave distortion, Fresnel edge reflection, depth-based color absorption (teal gradient), shoreline edge foam, and animated caustic projection on pool floor.
  - Emissive glow berry clusters with individual point lights illuminating nearby leaves and moss.
  - Dripping water droplet particle emitter from ceiling stalactites into the pool with splash ripples.
  - Humid green-teal atmospheric fog.

### Scene 9: The End (Credits)
- **Reference Look**: Cosmic otherworldly void; dark obsidian pillars with micro-roughness and sharp specular edges; spinning ender crystals with blinding white-purple core bloom and vertical laser beams piercing into the sky; purple void particle swirls; Enderman with glowing purple eyes; cold purple rim lighting on player.
- **Current State**: Flat purple backdrop, basic obsidian blocks, low bloom, laser beam is a static cylinder.
- **Upgrades Required**:
  - End crystal: intense core bloom, pulsating emissive crystal shards, animated vertical beam with scrolling noise and outer glow cylinder.
  - Obsidian material: deep black, sharp normal cracks, high specular highlights on edges.
  - Swirling purple void particles rising and drifting.
  - Sharp purple rim light on player and Enderman.
  - Intense bloom on all ender elements; dark void fog.

---

## Technical Architecture for the Realism Pass

1. **Renderer & Tone Mapping**:
   - `WebGLRenderer`: `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmicToneMapping`, `toneMappingExposure = 1.0` (dynamically tuned per scene).
   - Shadow maps: `PCFSoftShadowMap`, shadow camera bounds tightly fitted per scene (`near: 0.5, far: 35`), bias tuned to `-0.0005` to prevent shadow acne and peter-panning.
   - Half-float render targets for high dynamic range bloom.

2. **Procedural PBR Material Engine (`src/world/blockMaterials.ts`)**:
   - Convert all 16x16 canvas textures into full PBR sets:
     - `map`: Base color sRGB.
     - `normalMap`: Sobel filter height-to-normal generation on canvas.
     - `roughnessMap`: Inverted luminance / tuned per block type (stone = 0.9, wood = 0.65, gems = 0.1, water = 0.05).
     - `metalnessMap`: Selective metalness for ores/metals.
     - `emissiveMap`: Masked glowing pixels (torches, glow berries, lanterns, sculk, crystals) with tuned emissive intensity.
     - `aoMap`: Edge corner ambient occlusion.
   - Nearest-neighbor filtering on all companion maps to preserve the authentic crisp pixel-art aesthetic.

3. **Post-Processing Stack (`src/world/PostProcessingPipeline.tsx`)**:
   - `@react-three/postprocessing` pipeline with per-scene dynamic presets:
     - `Bloom`: High threshold (0.85), smoothing, multi-pass bloom for glowing elements.
     - `DepthOfField`: Subtle bokeh tuned per scene (active on Cherry Grove, Stronghold, Village).
     - `Vignette`: Darkened cinematic borders.
     - `ToneMapping`: ACES Filmic.
     - `HueSaturation` & `ColorAverage`: Per-scene color grading.
     - `SMAA`: Screen-space anti-aliasing without blurring block textures.

4. **Dynamic Lighting & Volumetrics (`src/world/EnvironmentEffects.tsx`)**:
   - Animated light shafts (god rays) with noise dust motes.
   - Realistic flickering point lights (Perlin/simplex noise modulation on intensity & position).
   - Contact shadows (`ContactShadows` from `@react-three/drei`) under player, mobs, and prominent props.
   - Custom animated water shader (`src/world/WaterShader.tsx`).
   - Foliage wind sway vertex displacement (`src/world/FoliageMaterial.tsx`).
   - Sculk pulse shader (`src/world/SculkMaterial.tsx`).

5. **Performance Guardrails**:
   - Low / Med / High quality toggles in Zustand store.
   - Low: No DOF, no bloom, 1 shadow light, simple materials.
   - Med: Bloom, SSAO, 2 shadow lights.
   - High: Full PBR maps, DOF, volumetrics, bloom, shadow cascades.
   - FPS monitor with auto-fallback if average FPS drops below 35.

---
*Ready to proceed to Step 2: Global Foundation.*
