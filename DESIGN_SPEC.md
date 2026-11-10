# DESIGN SPECIFICATION: "Cykf._" Interactive 3D Minecraft Portfolio

## 1. Identity, Branding & Copy
- **Brand Title**: `Cykf._`
- **Owner**: `Saksham`
- **Minecraft Skin Username**: `Cykf_`
- **Version Tag**: `Cykf._ v1.0.0`
- **Page Title**: `Cykf._ | Saksham`
- **Favicon**: Dynamically cropped 8x8 face from `Cykf_` skin.
- **Copy Policy**: 100% placeholder-driven via `/src/content.ts`. Zero references to "Sanjai Builds" or external personal info.

---

## 2. Typography & Font System
- **Pixel Display Font**: `"Press Start 2P"` or `"Silkscreen"`
  - Used for: Brand logo, biome labels, panel main headers, slot numbers, XP level indicator, button labels.
  - Sizing: Brand header (13px), Biome title (12px), Panel Titles (14px), XP level (12px bold), Button text (12px), Slot numbers (10px).
- **Secondary / Body Font**: `"Space Grotesk"` or `"Inter"`
  - Used for: Bio descriptions, trade descriptions, project subtitles, recipe narratives, contact labels.
  - Sizing: Subtitles (11-12px), body copy (13px), metadata labels (10px small caps).
- **Pixelation Quality**:
  - `image-rendering: pixelated;` and `image-rendering: crisp-edges;` applied globally to all icons, canvas previews, and texture maps.

---

## 3. UI Color Palette & Visual System

### A. General Glass Panels (Scenes 2, 3, 4, 5, 6, 7)
- **Background**: `rgba(18, 18, 22, 0.78)` with `backdrop-filter: blur(14px)`.
- **Outer Border**: `1px solid rgba(255, 255, 255, 0.14)`.
- **Inner Bevel**: `box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.08), inset -1px -1px 0 rgba(0, 0, 0, 0.4)`.
- **Corners**: Stepped pixel corners (4px notched corners without smooth radius).

### B. Parchment Panel (Scene 8: Let's Connect)
- **Background**: `#EFE6CF` (warm vintage parchment paper texture).
- **Border**: `2px solid #6E5334`.
- **Inner Border**: `1px solid #C4B08F`.
- **Primary Text**: `#2C1E14` (deep espresso ink).
- **Label Text**: `#84684E` (faded ink small-caps).

### C. Buttons (Minecraft Stone Style)
- **Normal**: `#767676` background, top/left border `2px solid #ADADAD`, bottom/right border `2px solid #383838`.
- **Hover**: `#8C8C8C` background, top/left border `2px solid #C2C2C2`, bottom/right border `2px solid #2B2B2B`.
- **Active / Pressed**: `#636363` background, inverted bevel.
- **Text**: `#E0E0E0` with text-shadow `1px 1px 0 #222222`.

### D. Biome Accent Colors (Top-Left HUD)
| Biome | Color Code | Visual Role |
| :--- | :--- | :--- |
| **Village** (Scenes 1 & 7) | `#55FF55` | Vibrant Minecraft Grass Green |
| **Cherry Grove** (Scene 2) | `#FFAACC` | Pastel Sakura Cherry Blossom Pink |
| **Stronghold** (Scene 3) | `#B388FF` | Arcane Enchantment Purple |
| **Mineshaft** (Scene 4) | `#FFAA00` | Warm Torch & Ore Gold / Amber |
| **Snowy Peaks** (Scene 5) | `#70C5FF` | Glacial Ice / Sky Light Blue |
| **Deep Dark** (Scene 6) | `#00E5FF` | Glowing Sculk Cyan |
| **Lush Caves** (Scene 8) | `#55FF55` | Flora Vine / Moss Green |
| **The End** (Scene 9) | `#D670D6` | End Crystal / Chorus Violet |

---

## 4. Global HUD Specifications & Measurements

### A. Top-Left Info Box
- **Position**: `position: fixed; top: 20px; left: 24px; z-index: 40;`
- **Line 1**: `Cykf._ v1.0.0` (White `#FFFFFF`, 12px pixel font, drop shadow).
- **Line 2**: `Biome: <Biome Name>` (`Biome:` in `#AAAAAA`, Name in biome accent color).
- **Line 3**: `Day <N> · <HH:MM>` (Clock ticks in real time, increments with scene progression, `#CCCCCC`).

### B. Navigation Arrows
- **Position**: Vertically centered at `top: 50%; transform: translateY(-50%);`
- **Style**: White circular button (42px diameter), 2px dark border, black chevron `<` and `>`.
- **Visibility**: Left arrow hidden on Scene 1; Right arrow hidden on Scene 9.

### C. Bottom Status Bars & Hotbar
- **Container**: `position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); z-index: 40;`
- **Status Row** (Hearts & Hunger):
  - 10 Red Hearts (left): 9x9px pixel hearts, flashed white on Deep Dark damage.
  - 10 Hunger Drumsticks (right): 9x9px pixel drumsticks.
- **Experience Bar**:
  - Dimensions: 382px wide, 6px high.
  - Background: Dark olive `rgba(15, 35, 10, 0.85)` with 1px dark border.
  - Fill: Vibrant animated lime `#70E000` with subtle highlight stripe.
  - Level Number: Centered directly above bar, 12px bold pixel font, color `#80FF20`, black 2px outline.
- **Hotbar (9 Slots)**:
  - Width: 9 slots of 44x44px = ~400px total width.
  - Slot Background: `rgba(40, 40, 40, 0.75)` with Minecraft 2px bevel.
  - Selected Slot: Highlighted with a 3px crisp white frame, scaled up to 1.08x.
  - Slot Icons (16x16 / 24x24 pixel art):
    1. Grass Block (Village Sunrise)
    2. Player Head (Cherry Grove Profile)
    3. Enchanted Book (Stronghold Enchantments)
    4. Chest (Mineshaft Projects)
    5. Compass (Snowy Peaks Journey)
    6. Nether Star (Deep Dark Advancements)
    7. Emerald (Villager Trades)
    8. Book & Quill (Lush Caves Contact)
    9. Ender Pearl (The End)
- **Pagination Dots & Key Hints**:
  - Located directly under hotbar.
  - 9 small dots (active dot is solid filled with ring).
  - Key hint: `[1-9] Biome | [A/D] / [Scroll] Move | [F] Front Cam | [M] Sound`.

---

## 5. Player Model & Skin Engine (`Cykf_`)
- **Atlas Format**: Standard 64x64 PNG (supports 64x32 legacy with limb mirroring).
- **Skin Model**: Auto-detects 4px classic vs 3px slim arms (fallback to override in `content.ts`).
- **Body Parts**:
  - Head (8x8x8) + Hat Outer Layer (8.5x8.5x8.5 with `alphaTest: 0.5`)
  - Body (8x12x4) + Jacket Layer (8.5x12.5x4.5)
  - Right Arm (4x12x4 or 3x12x4) + Sleeve Layer
  - Left Arm (4x12x4 or 3x12x4) + Sleeve Layer
  - Right Leg (4x12x4) + Pant Layer
  - Left Leg (4x12x4) + Pant Layer
- **Joints & Hierarchy**:
  - Head pivots at neck `[0, 12, 0]`.
  - Arms pivot at shoulders `[±5 or ±6, 11, 0]`.
  - Legs pivot at hips `[±2, 0, 0]`.
- **Procedural Poses & Animations**:
  - Head tracks cursor within natural clamped angles (`yaw: ±45°`, `pitch: ±30°`).
  - Subtle breathing idle (chest scale and shoulder bob).
  - Walking swing animation during scene transitions (arm & leg counter-oscillation).
  - Wave animation on Scene 1.
  - Held items per scene (Diamond Pickaxe, Torch, Soul Lantern, etc.).
- **Nametag**:
  - Floating 3D billboard above player head.
  - Text: `Cykf_` in Minecraft white pixel font, semi-transparent black background.

---

## 6. Procedural Block & Voxel Engine
- **Texture Generation**: Canvas-based 16x16 pixel textures generated procedurally (Grass top/side/dirt, Cherry planks/leaves, Stone bricks, Bookshelf, Deepslate, Sculk, End stone, Obsidian, Oak planks, etc.).
- **Material Optimization**: Shared canvas texture atlas with `THREE.NearestFilter` and single instanced meshes per block type.
- **Fake Ambient Occlusion**: Pre-shaded vertex darkening on inner voxel corners.

---

## 7. Scene-by-Scene Specifications

### Scene 1: Village at Sunrise (Slot 1)
- **Environment**: Rolling grass terrain, oak village cottage with cobblestone foundation, wheat crops, yellow dandelion & red poppy flowers, procedural white sheep.
- **Lighting**: Low morning sun (elevation 15°, azimuth 110°), warm amber `#FFA534`, god rays filter, soft dawn fog `#7890AA`.
- **Player**: Right foreground holding Diamond Pickaxe, wave animation on page load.
- **UI**: Centered/left pixel title logo `Cykf._` with animated shine gradient sweep. Menu buttons: `Enter World`, `Player Profile`, `Villager's Trades`, `Join SMP` / `Connect`.

### Scene 2: Player Profile (Cherry Grove, Slot 2)
- **Environment**: Cherry blossom trees with pink leaf voxels, falling cherry petals (instanced particle system), petal carpet on grass.
- **Lighting**: Soft pastel daylight `#FFF5F8`, warm ambient, soft depth of field.
- **Player**: Standing facing camera, relaxed breathing pose.
- **UI**: Left panel `Player Profile` with dynamic skin avatar, bio, metadata grid (Role, Level, Server, Status, Player: Cykf_, Owner: Saksham).

### Scene 3: Enchantments (Stronghold Library, Slot 3)
- **Environment**: Stone brick walls, double-height bookshelves, hanging cyan sea lanterns, central Enchanting Table with obsidian base and red cloth. Floating open spellbook with hovering purple arcane glyphs.
- **Lighting**: Moody dungeon interior, purple glow hovering over pedestal, cyan point light from sea lanterns.
- **Player**: Standing nearby or inspecting shelves.
- **UI**: 7 skill bars (HTML/CSS, JavaScript, Astro/GSAP, Python, UI/UX, Blender, AI/Automation) with Roman numerals and cyan-to-purple gradient progress bars.

### Scene 4: Chest - Completed Builds (Mineshaft, Slot 4)
- **Environment**: Underground mineshaft corridor with oak beam arches, rails on stone floor, cobwebs, 4 wooden chests with interactive opening lids. Glowing ore veins embedded in walls: Diamond, Gold, Redstone, Emerald.
- **Lighting**: Dark cave ambient, warm flickering point light from player's held torch, ore emissive glows.
- **Player**: Holding lit torch with ember particles.
- **UI**: 12-slot inventory chest grid (6 completed builds with rarity color pips: Orange, Cyan, Yellow, Purple, White + 6 empty slots). Click opens detail modal.

### Scene 5: Crafting - The Journey (Snowy Peaks, Slot 5)
- **Environment**: High snow mountain cliff, 3D crackling campfire with voxel smoke column and sparks, distant mountain peaks, pine trees, falling snow flakes.
- **Lighting**: Alpine golden hour sunset, warm orange sunlight, cool blue shadow fill.
- **Player**: Seen from behind looking out at the panoramic vista.
- **UI**: 3 recipe rows (inputs + arrow + date + title + narrative description). Hover highlights ingredients.

### Scene 6: Advancements (Deep Dark, Slot 6)
- **Environment**: Ancient city ruins of deepslate bricks, glowing cyan sculk blocks and veins with pulsing glow, soul lanterns.
- **Lighting**: Very dark, deep fog `#050B10`, cyan sculk emissive point lights.
- **Player**: Standing on ledge holding soul lantern casting localized cyan light.
- **UI**: Right side panel with 4 completed advancements (gold frame + green check) and 1 locked advancement. Minecraft advancement toast popups on enter.

### Scene 7: Villager Trades (Village Interior, Slot 7)
- **Environment**: Oak/spruce tavern shop with counter, wooden trapdoors, lectern, chest full of emeralds, potted sapling, hanging warm lantern, wall item frames with emerald, diamond, and enchanted book.
- **NPC**: 3D Villager behind counter who turns head to look at mouse cursor and emits synthesized "hmm" sound on hover.
- **Player**: Standing across the counter.
- **UI**: 4 trade rows (emerald cost -> service) + 3 stat boxes (Builds, Clients, Countries) with animated count-up numbers + `Make an Offer` button.

### Scene 8: Let's Connect (Lush Caves, Slot 8)
- **Environment**: Lush cave cavern with ceiling sunbeam shafts, hanging vines with glow berries, moss carpet, underground pool with water ripples and caustics, water lily pads, animated swimming pink axolotl.
- **Lighting**: God rays streaming from ceiling opening, glowing berry point lights, cyan water bounce.
- **UI**: Left parchment paper panel: `Let's Connect`, Email, Location, LinkedIn, Instagram links with copy-to-clipboard, `To The End` button.

### Scene 9: The End (Slot 9)
- **Environment**: Floating end-stone islands over the cosmic dark void, towering obsidian pillars topped with glowing End Crystals shooting vertical purple beams, animated Endermen with glowing eyes, activated End Portal frame with starry cosmic void.
- **Lighting**: Pitch black void with purple crystal beams and portal particles.
- **Player**: Viewed from behind looking toward the End portal and cosmic horizon.
- **UI**: Centered end poem text: `THANKS FOR PLAYING / The End`, inspirational quote, `Respawn` button (fades to black, resets to Scene 1).

---

## 8. Audio Architecture (Procedural Web Audio API)
- No copyrighted Mojang audio files.
- Real-time synthesized sound generator:
  - Button Click: Short crisp wooden impulse.
  - Hotbar Switch: Sharp metallic tick.
  - Chest Open: Wooden creak and latch snap.
  - Enchant Chime: Multi-tone arpeggio with high reverb.
  - Villager "Hmm": 2-formant FM synthesis mimicking the classic villager vocal tone.
  - Toast Fanfare: Harmonized triumphant arpeggio.
  - Campfire / Ambience: Filtered noise generator with random crackle pops.
- Persistent mute toggle in Zustand & `localStorage`.
