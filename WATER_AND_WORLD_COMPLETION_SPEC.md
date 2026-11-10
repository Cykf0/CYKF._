# SPECIFICATION: Complete Water Rebuild, Lava System & Full World Gap Elimination

**Status**: FINALIZED  
**Methodology**: GSD Spec-Driven Engineering  
**Scope**: All 9 Cykf._ Portfolio Worlds + Global Liquid & Architecture Systems  

---

## 1. Core Objectives

1. **Rebuild the Water System**:
   - Replace flat and static planes with high-fidelity, Minecraft BSL/Complementary-inspired animated pixel-art water shaders (`WaterShader.tsx`).
   - Implement continuous, gapless vertical & cascading waterfalls (`WaterfallMesh.tsx`) with animated UV downward flow, mist, and impact splashes.
   - Implement distinct water color palettes and shoreline foam for every biome:
     - Scene 1 (Sunrise Village): Fresh village river & well (`#3A86FF` -> `#0077B6`).
     - Scene 2 (Eternal Forest / Cherry): Cherry blossom reflective pond & stream (`#00B4D8` -> `#0077B6`).
     - Scene 3 (Arcane Library): Enchanted runic fountain & luminous pools (`#4CC9F0` -> `#3A0CA3`).
     - Scene 4 (Abandoned Mines): Cave groundwater stream alongside molten lava (`#1F4E5B` -> `#0D2127`).
     - Scene 5 (Frozen Frontier): Partially frozen alpine lake with translucent ice blocks (`#90E0EF` + ice).
     - Scene 6 (Deep Dark): Ancient subterranean sculk pool with dark reflections (`#03045E` -> `#001219`).
     - Scene 7 (Villager's Home): Village irrigation channels, stone well, and farm pond.
     - Scene 8 (Lost Paradise / Lush Caves): Multi-tiered continuous cascading waterfalls into deep crystal pool.
     - Scene 9 (Endless Void): End fountain / void portal basin with otherworldly purple-tinted liquid or star-void basin.

2. **Rebuild the Lava System (World 04 — Abandoned Mines)**:
   - Implement `LavaShader.tsx` with animated bubbling pixel-art magma flow, emissive intensity, and dynamic warm light falloff (`#FF4500` -> `#FF8C00`).
   - Implement `LavaWaterfall` with continuous vertical cascading flow from cave ceiling into magma pool.
   - Natural basalt, blackstone, obsidian, and magma block rock banks containing the lava.
   - Environmental heat effects: floating fiery magma ember particles, heat smoke, and dynamic lighting.
   - Ambient bubbling and sizzling lava sound integration.

3. **Eliminate All Unintentional Empty Gaps (Worlds 1–9)**:
   - Ground Foundation: Extend deep subterranean bedrock/deepslate layers (down to y = -2.0) across all scenes so no low-angle camera can see under the world.
   - Terrain Continuity: Eliminate all missing terrain chunks, holes between blocks, and unclosed cliff faces.
   - Structure Integrity: Seal all buildings, roofs, towers, bridges, and archways so no backfaces are missing or hollow.
   - Pathway & Bridge Connectivity: Ensure every road and wooden bridge connects solidly to terrain at both ends.
   - Environmental Enrichment: Add dense foliage, flowers, lanterns, fences, barrels, minecarts, and architectural details.

4. **Empirical Verification & Testing**:
   - Automated multi-angle inspection script (`scripts/audit-world-completion.mjs`) rendering every scene from default, high, low, and side angles.
   - Capture comparison screenshots proving zero voids and full visual fidelity.
   - Complete build and type checks.
