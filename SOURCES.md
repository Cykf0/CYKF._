# SOURCES.md — Asset Sources & Provenance

**Project**: "Cykf._" 3D Minecraft Portfolio  
**Audit & Pipeline Timestamp**: 2026-11-10  

---

## 1. Primary Source: Official Mojang Vanilla Client JAR
- **Manifest URL**: `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`
- **Release Version**: `26.3` (Latest stable release package)
- **Package Metadata URL**: `https://piston-meta.mojang.com/v1/packages/9f67e10ed013deeaad20ac3c800652765d493408/26.3.json`
- **Client JAR Download URL**: `https://piston-data.mojang.com/v1/objects/e877b6a07acd633fb3bb475002175cec036e7b87/client.jar` (39.6 MB)
- **Extracted Files**: 11,603 official vanilla asset files extracted into `public/texturepack/assets/minecraft/`:
  - **Block Textures** (`assets/minecraft/textures/block/*.png`): 1,405 flat 16x16 PNG textures (grass_block_top, grass_block_side, dirt, dirt_path_top, dirt_path_side, stone, cobblestone, oak_planks, oak_log, oak_leaves, cherry_planks, cherry_leaves, sculk, moss_block, etc.)
  - **Item Textures** (`assets/minecraft/textures/item/*.png`): 831 flat 16x16 PNG item sprites
  - **Entity Textures** (`assets/minecraft/textures/entity/**`): Exact vanilla UV maps for Villager, Sheep, Chest, Enderman, Axolotl, End Crystal, Minecart, etc.
  - **Environment Textures** (`assets/minecraft/textures/environment/**`): `clouds.png`, `end_sky.png`, `sun.png`, `moon_phases.png`
  - **GUI & HUD Sprites** (`assets/minecraft/textures/gui/sprites/hud/**`): Hearts, hunger, armor, crosshair, experience bar, hotbar
  - **Particle Textures** (`assets/minecraft/textures/particle/**`): 301 authentic vanilla particle textures (smoke, flame, heart, crit, portal, enchant, snowflake, drip)
  - **Block Models & Font** (`assets/minecraft/models/**`, `assets/minecraft/font/**`)

---

## 2. Secondary Source: Metabot.gg & Crafty.gg Item Icons
- **Source 1**: `https://metabot.gg/en/minecraft/items/category/functional-blocks` (and all sibling categories: weapons, tools, combat, food, redstone, ingredients)
- **Source 2**: `https://crafty.gg/tools/item-ids`
- **Destination**: `/public/items/<minecraft_id>.png`
- **Total Local Icons**: 1,656 downloaded item icons
- **Usage**: Strictly reserved for 2D UI elements (Hotbar, Inventory modal, Chest Completed Builds grid, Villager trade rows, Journey recipe steps, Advancements tree, hover tooltips, and dropped item sprites). Never wrapped around 3D world blocks.

---

## 3. Fallback Mechanism (Priority 3)
- **Hand-drawn 16x16 pixel-grid vanilla palette fallbacks** inside `scripts/build-atlas.mjs`.
- **Current Status**: **0 fallbacks active** — all 55 packed atlas textures are authentic vanilla assets sourced directly from the Mojang client JAR.
