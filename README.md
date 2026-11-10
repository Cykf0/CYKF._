# Cykf._ — Interactive 3D Minecraft Portfolio

> A handcrafted, immersive 3D Minecraft-themed portfolio for **Saksham** (`Cykf._`), powered by Three.js, React Three Fiber, and Web Audio API.

---

## 🌟 Highlights

- **9 Handcrafted Interactive Biomes**:
  1. **Title / Welcome** — *Sunrise Village* with morning dawn lighting, cobblestone well, wheat fields, and white sheep.
  2. **Profile** — *Cherry Grove* with falling pink petals, stone lantern, pink sheep, and the real 3D player model.
  3. **Skills / Enchantments** — *Stronghold Library* with enchanted bookshelves, floating animated enchanting table with orbiting glyphs, and skill progress bars (V, IV, III).
  4. **Projects / Inventory** — *Abandoned Mineshaft* with dark cave ambience, wooden support arches, and an interactive 3D chest that creaks open to reveal project details.
  5. **Journey / Crafting** — *Snowy Mountain Peak* with snow-covered spruce trees, campfire with voxel smoke & sparks, and 3-step timeline crafting grid.
  6. **Advancements / Achievements** — *Deep Dark / Ancient City* with glowing cyan sculk blocks, floating catalyst particles, milestone tree, and toast popup notification.
  7. **Services / Trades** — *Village Market Interior* with a friendly 3D villager who tracks your cursor, makes classic "Hmm" vocal sounds, and offers project collaboration tiers.
  8. **Contact / Parchment** — *Lush Caves* with hanging glow berries, dripleaf pool, an animated swimming 3D axolotl, and a warm wax-sealed parchment letter with click-to-copy email.
  9. **Credits / The End** — *The End Dimension* with obsidian pillars, ender crystals emitting vertical purple beams, purple void particles, 3D Enderman, and a "Respawn" loop button.

- **True Minecraft Skin Pipeline**:
  - Automatically fetches the official skin for username `Cykf_` from Mojang/Crafatar APIs via `npm run skin`.
  - Full dual-layer skin support: Hat, Jacket, Left/Right Sleeves, Left/Right Pants overlays with pixel-perfect nearest-neighbor filtering and alpha clipping.
  - Automatic Classic (4px) vs. Slim/Alex (3px) arm width detection.
  - Articulated shoulder, hip, neck, and torso pivot joints.
  - Dynamic head & torso tracking that reacts smoothly to mouse cursor movement.
  - Floating 3D billboard nametag: `Cykf_`.
  - Real-time 8x8 face extraction for hotbar slot 2 and browser favicon.

- **Global Minecraft HUD**:
  - **Top-Left Info**: Brand `Cykf._`, dynamic biome name with custom accent color, in-game Day counter, and ticking clock.
  - **Status Bars**: 10 hearts with hurt damage flash, 10 hunger drumsticks, animated green XP bar with level badge and clickable XP orb pickups.
  - **9-Slot Hotbar**: Pixelated SVGs, selected slot border, item tooltips, slot numbers, and pagination indicators.
  - **Navigation**: Clickable edge arrows, keyboard hotkeys (`1`-`9`, `A`/`D`, `←`/`→`, `F` front-view toggle, `M` mute), smooth scroll wheel navigation, and URL hash routing (`#village`, `#profile`, `#enchantments`, `#chest`, `#crafting`, `#advancements`, `#trades`, `#connect`, `#end`).

- **100% Procedural & Compliant**:
  - **Zero copyrighted binary assets**: All block textures are generated procedurally on 16x16 HTML5 Canvases.
  - **Procedural Audio**: All sound effects (clicks, chest creak, enchantment chiming, villager "Hmm", toast jingle, XP orb pickup, portal warp) are synthesized in real-time via the Web Audio API.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI component architecture and state bindings |
| **Vite 6** | Ultra-fast development server & production bundler |
| **TypeScript** | Strict type safety across content, state, and 3D scenes |
| **Three.js** | 3D rendering engine, materials, geometries, and lighting |
| **@react-three/fiber** | Declarative Three.js scene graph inside React |
| **@react-three/drei** | Camera controls, 3D text (Troika), Billboard, and helpers |
| **Tailwind CSS** | Minecraft HUD styling, font rendering, responsive layout |
| **GSAP** | Smooth camera lerping and UI transitions |
| **Zustand** | Centralized in-memory reactive state store |
| **Web Audio API** | Real-time procedural 8-bit sound synthesis |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm or yarn

### Installation
```bash
# Clone or navigate to the repository
cd "e:/3d protfolio"

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Controls & Shortcuts

| Key / Action | Function |
|---|---|
| `1` – `9` | Jump directly to corresponding biome / hotbar slot |
| `A` / `←` | Previous biome |
| `D` / `→` | Next biome |
| `F` | Toggle Player Front / World View |
| `M` | Toggle Mute Sound FX |
| `Mouse Move` | Player head/torso and Villager head tracking |
| `Mouse Drag` | Subtle 3D parallax inspection |
| `Scroll Wheel` | Navigate between biomes |
| `Click Chest` | Open / Close project inventory modal (Scene 4) |
| `Click Villager` | Trigger villager "Hmm" sound effect (Scene 7) |
| `Click XP Bar` | Spawn interactive floating XP orb easter egg |

---

## ✏️ Customizing Content

All portfolio text, skills, projects, and personal contact links are consolidated in a single configuration file:
👉 **[`src/content.ts`](file:///src/content.ts)**

### 1. Personal Profile & Bio
Edit `CONTENT.profile`:
```ts
profile: {
  title: "Full-Stack Developer & Minecraft Creator",
  bio: "Hey! I'm Saksham, a passionate builder crafting immersive web applications and digital worlds.",
  location: "Earth",
  level: "Level 42",
  // ...
}
```

### 2. Enchantments / Skills
Edit `CONTENT.skills` to adjust skill names, levels (Roman numerals I–V), and descriptions:
```ts
{
  id: "typescript",
  name: "TypeScript Mastery",
  level: "V",
  progress: 95,
  description: "Advanced types, generics, and large-scale architectural design."
}
```

### 3. Projects (Chest Loot)
Edit `CONTENT.projects` to showcase your personal builds, repositories, and applications:
```ts
{
  id: "project-1",
  title: "Cloud Voxel Engine",
  slot: 1,
  rarity: "legendary", // common | rare | epic | legendary
  stack: ["Three.js", "WebGPU", "TypeScript"],
  description: "High-performance voxel engine running in modern web browsers.",
  github: "https://github.com/...",
  live: "https://...",
}
```

### 4. Journey / Timeline (Crafting Grid)
Edit `CONTENT.journey` with your education, career steps, or milestones:
```ts
{
  date: "2024 - Present",
  title: "Senior Builder",
  description: "Architecting web scale applications and 3D web experiences."
}
```

### 5. Services & Trades
Edit `CONTENT.trades` to configure the emerald trading menu:
```ts
{
  id: "fullstack",
  title: "Full-Stack Web App",
  cost: 64, // emeralds
  description: "End-to-end responsive web application tailored to your specifications."
}
```

### 6. Contact Information
Edit `CONTENT.contact`:
```ts
contact: {
  email: "your-email@example.com",
  github: "https://github.com/...",
  linkedin: "https://linkedin.com/in/...",
  instagram: "https://instagram.com/...",
}
```

---

## 👤 Updating the Player Skin

To change the 3D player skin:

### Method A — Fetch by Minecraft Username
```bash
# Run the automated fetch script with any valid Minecraft username:
npm run skin -- YourMinecraftUsername
```
The script will download the official 64x64 PNG from Mojang servers, save it to `public/skins/cykf.png`, and automatically update the in-game model, 8x8 hotbar avatar, and favicon.

### Method B — Manual File Swap
Place any standard 64x64 or 64x32 Minecraft skin file directly at:
```
public/skins/cykf.png
```
The engine automatically detects whether the skin uses Classic (4px) or Slim/Alex (3px) arm geometry based on pixel transparency in the right arm area.

---

## 📦 Production Build & Deployment

### Build
```bash
npm run build
```
This generates an optimized, minified bundle in the `dist/` directory.

### Preview Local Build
```bash
npm run preview
```

### Deploying to Vercel / Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy!

---

## 🎨 Asset & Audio License
- **Textures**: All block textures are procedurally generated at runtime using HTML5 2D Canvas. No Mojang textures or binary assets are distributed with this software.
- **Audio**: All sound effects are generated via mathematical oscillators (sine, square, triangle, noise) using the Web Audio API.

---

Designed and crafted for **Saksham** (`Cykf._`).
