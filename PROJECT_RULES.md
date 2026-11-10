# PROJECT RULES: "Cykf._" 3D Minecraft Portfolio

## Core Methodology (GSD)
1. **Plan Before You Build**: Never write code without a finalized specification.
2. **State Is Sacred**: Update `STATE.md` after every milestone and task.
3. **Context Is Limited**: Prevent degradation through modular, clean components.
4. **Verify Empirically**: Every scene, texture, and player model must be tested and visually compared against reference screenshots.

## Identity & Branding Rules (STRICT OVERRIDE)
- **Brand Name**: `Cykf._` (NEVER use "Sanjai Builds" anywhere in code, HUD, title, meta, or docs).
- **Owner**: `Saksham` (use in profile bio, README, footer).
- **Minecraft Username**: `Cykf_` (used for skin download and 3D nametag).
- **Page Title**: `Cykf._ | Saksham`
- **Data Placeholders**: All personal data in `/src/content.ts` must use obvious TODO placeholders (`TODO_YOUR_EMAIL`, `TODO_YOUR_LOCATION`, etc.) so no fake information is published.

## Visual Fidelity Rules
- Layout, HUD, panels, fonts, colors, spacing, and lighting MUST match the references in `/reference`.
- Pixel-art textures and icons must use `image-rendering: pixelated` and `THREE.NearestFilter`.
- Procedural original voxel textures — NO copyrighted Mojang binary assets.
- Sound effects must be generated via Web Audio API or CC0 audio.
