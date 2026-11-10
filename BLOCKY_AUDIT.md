# BLOCKY_AUDIT.md: Comprehensive Blockiness & Vanilla Voxel Rendering Diagnostic

**Project**: "Cykf._" Interactive 3D Minecraft Portfolio  
**Audit Engineer**: Voxel-Rendering Engineer & Technical Artist  
**Identity**: Saksham (`Cykf_`)  
**Audit Timestamp**: 2026-11-10T22:40:00.000Z  
**Audit Status**: **DIAGNOSTIC COMPLETE — 9 MAJOR PROBLEM CATEGORIES IDENTIFIED FOR FIX**

---

## 1. SOURCE USAGE DECLARATION (ASSET PRIORITY REPORT)

As mandated by the asset pipeline priority order:
1. **/public/texturepack/**: Priority 1 (Vanilla Assets from user JAR). Folder structure initialized (`assets/minecraft/textures/...`); currently awaiting user-placed files. Ready for drop-in resource pack swapping with 0 code changes.
2. **Metabot.gg & Crafty.gg**: Priority 2. Metabot.gg crawled for all 1,654 items and indexed in `/public/items/index.json`. Provides isometric icons for items, hotbar, chest grid, dropped items, and inventory. Never wrapped around 3D cubes.
3. **Fallback Hand-Drawn 16x16 Pixel Grids**: Priority 3. All world block textures currently utilize deterministic, hand-placed 16x16 pixel grids adhering to canonical Minecraft Java Edition palettes (`stone`, `dirt`, `grass_block_top`, `grass_block_side`, `oak_planks`, etc.), logged in `MISSING_TEXTURES.md`.

---

## 2. CHECKLIST PROBLEM MATRIX

| Checklist Category | Problem Identified | Affected Assets / Components | Current State | Required Fix |
| :--- | :--- | :--- | :--- | :--- |
| **1. Smooth or Rounded Geometry** | Non-blocky smooth shapes present in world | `VolumetricLightShaft` (smooth cylinder), `CharacterContactShadow` (round blur blob), Scene 9 obsidian pillar (cylinder geometry) | Smooth curved primitives breaking Minecraft voxel rule | Replace cylinders with square voxel beams/pillars; remove soft round shadow blobs in favor of crisp block shading |
| **2. Stretched Block Geometries** | Single huge box instead of 1x1x1 integer voxel grid | Terrain in Scenes 1–9 (`args={[22, 1, 22]}`), Cottage walls (`[4.5, 2.5, 4.5]`), Mine walls (`[18, 5, 1]`) | A single 16x16 texture stretched across 22 meters, resulting in sub-pixel blur and non-16px density | Replace giant monolithic boxes with block-aligned voxel geometry or repeat UVs at 1.0/meter |
| **3. Non-Voxel Trees & Canopies** | Stretched trunks and arbitrary non-integer boxes | Scene 2 Cherry Tree trunk (`[0.8, 3.6, 0.8]`), foliage (`[3.8, 2.4, 3.8]`, `[1.6, 1.2, 1.6]`) | Trees are arbitrary scaled rectangles rather than 1x1x1 log blocks and clustered 1x1x1 leaves | Rebuild trees strictly from integer 1x1x1 logs and canonical 1x1x1 leaf clusters |
| **4. Wrong Block Heights** | Partial blocks lack exact vanilla fractional heights | Dirt path (`[1.5, 0.1, 7]`), Enchanting Table (`[1.5, 0.75, 1.5]`), Chest (`scale=0.5 [1.6, 0.8, 1.6]`) | Path is 0.1m flat strip instead of 15/16 (0.9375m); table is 1.5m wide instead of 1x1; chest is non-14px | Apply exact vanilla dimensions: Path & Farmland = 15/16 (0.9375), Slabs = 8/16 (0.5), Enchanting Table = 12/16 (0.75), Chest = 14x14x14 px (0.875) |
| **5. Missing Per-Face Textures** | Same texture applied to all 6 faces | Grass block sides showing plain green top; logs lacking ring tops; path lacking dirt underside | Grass block top texture applied to side without fringe; dirt path missing side transition | Implement full 6-face mapping: grass block (top tint, fringe side, dirt bottom), path (path_top, path_side, dirt_bottom), logs (bark side, ring ends) |
| **6. Plastic Sheen / Specular** | Metalness and roughness variation on base blocks | Scene 5 Alpine snow (`roughness=0.75, metalness=0.05`), Scene 4 ores (`metalness=0.8`) | Blocks reflect specular light like plastic or polished steel | Base blocks must have `roughness: 1.0, metalness: 0.0, no normal maps` (pure unlit matte) |
| **7. Smooth Lighting / Shading** | Standard Three.js PBR lighting without directional face bake | Scene terrain meshes using `MeshStandardMaterial` without vertex colors | Soft curved shadows across block faces instead of Top 1.0, N/S 0.8, E/W 0.6, Bottom 0.5 | Bake directional face shading and 4-level AO directly into vertex colors using `createVanillaBlockGeometry` |
| **8. Entity Model Proportions** | Non-vanilla box dimensions on props | Chest3D using `[1.6, 0.8, 1.6]` with `scale={0.5}`; Torches using arbitrary sizes | Non-canonical dimensions make mobs and props look distorted | Apply exact canonical box dimensions: Chest = 14x10x14 base + 14x5x14 lid + 2x4x1 latch; Torch = 2x10x2 px |
| **9. Water Alignment & Height** | Water pool modeled as thick block without stepped surface | Scene 8 Water pool (`[12, 0.8, 10]`) | Water surface at wrong height without block step | Align water to integer grid with top surface at 14/16 (0.875) height |

---

## 3. CLOSE-UP ASSET AUDIT DETAILS

### 1. Grass Block
- **Current State**: Rendered via `<boxGeometry args={[22, 1, 22]} />` with `blockMaterials.grassTop`.
- **Defects**: Texture stretched 22x horizontally; side faces show plain green grass instead of dirt with hanging green fringe; lacks directional face shading (top 1.0, sides 0.8/0.6, bottom 0.5); lacks 4-level vertex AO.
- **Action**: Convert to integer grid voxel structure or repeat UVs per 1x1 block with canonical 3-texture mapping (`grass_block_top`, `grass_block_side`, `dirt`).

### 2. Dirt Path
- **Current State**: Rendered via `<boxGeometry args={[1.5, 0.1, 7]} />`.
- **Defects**: Height is 0.1m above ground instead of exactly 15/16 (0.9375m) tall; lacks `dirt_path_side` and `dirt` bottom textures.
- **Action**: Set height to exact 15/16 (0.9375m) with `dirt_path_top` and `dirt_path_side`.

### 3. Dirt & Stone Wall
- **Current State**: Plain box geometries with unmapped side UVs.
- **Defects**: Texture stretches across walls larger than 1 unit; lacks baked vertex AO.
- **Action**: Ensure UV mapping is strictly 1:1 (16 pixels per 1x1 block face) with baked AO.

### 4. Oak & Cherry Planks
- **Current State**: Used in cottage walls and mineshaft beams.
- **Defects**: Planks stretched across non-integer dimensions (e.g. `[4.5, 2.5, 4.5]`).
- **Action**: Align plank structures to integer coordinates or 1:1 UV tiling so each 1x1 face shows exactly one 16x16 plank pattern.

### 5. Tree Trunks & Leaves
- **Current State**: Cherry tree in Scene 2 uses a stretched trunk (`0.8 x 3.6 x 0.8`) and non-voxel foliage boxes.
- **Defects**: Not constructed from 1x1x1 logs; leaves are arbitrary rectangular volumes rather than stepped cube clusters.
- **Action**: Rebuild tree with stacked 1x1x1 wood logs (`cherry_log` with bark side and ring ends) and 1x1x1 cherry leaf cube clusters in vanilla canopy layout.

### 6. Chest
- **Current State**: `Chest3D` uses `[1.6, 0.8, 1.6]` with `scale={0.5}`.
- **Defects**: Base is 0.8m wide instead of canonical 14/16m (0.875m); lid and latch do not match 14x14x14 pixel proportions.
- **Action**: Re-model with exact vanilla proportions: Base 14x10x14 px, Lid 14x5x14 px, Latch 2x4x1 px.

### 7. Water
- **Current State**: Scene 8 water pool uses arbitrary box geometry.
- **Defects**: Top surface is not at 14/16 (0.875m) height; lacks stepped block borders.
- **Action**: Block-align water with top surface at 14/16 height, animated vanilla water texture, opacity 0.78, no specular sheen.

### 8. Sheep & Villager
- **Current State**: Good box structure, but legs and wool layers have slight scale offsets.
- **Action**: Verify hard-edged vanilla box proportions, big nose for villager, 2-layer body for sheep (skin + curly wool).

### 9. Hotbar & GUI
- **Current State**: Hotbar uses integer 2x scaling (364px width); slot icons updated to local `/public/items/`.
- **Action**: Maintain integer scaling and ensure block items display as shaded isometric cubes and flat items as 16x16 sprites.

---

*Diagnostic audit completed. Proceeding with comprehensive voxel blockiness implementation.*
