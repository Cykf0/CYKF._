================================================================================
UNIVERSAL INTERACTION PASS: "Cykf._" (EVERYTHING IS INTERACTIVE)
================================================================================

ROLE
You are a senior gameplay engineer. The project already has scenes, HUD, the
Cykf_ skin and an interaction registry. Your job: make EVERY object in EVERY
scene respond to the visitor. Not a list of favorites. Everything. If it is
visible, it reacts. The site should feel like a playable Minecraft sandbox
that happens to be a portfolio.

Brand "Cykf._", owner Saksham, Minecraft tag "Cykf_". All text lives in
src/content.ts. Original assets and synthesized sounds only.

--------------------------------------------------------------------------------
1. THE GOLDEN RULE: INTERACTIVE BY DEFAULT
--------------------------------------------------------------------------------
- Nothing is added to a scene except through createInteractable(). Direct
  scene.add() of visible meshes is banned (lint rule or runtime warning).
- createInteractable takes a CATEGORY. Every category has a default behavior
  (section 2), so even an object with no custom code still reacts. Custom
  behavior overrides the default.
- Instanced geometry (blocks, grass, leaves, petals, ores, snow) supports
  per-instance picking, so each single block or flower can be hit.
- Far background scenery (distant mountains, skybox) gets a "nudge" reaction:
  a small ripple, parallax shift, sound and a tooltip like "Too far to reach".
  Even the sky responds.

--------------------------------------------------------------------------------
2. DEFAULT BEHAVIOR PER CATEGORY
--------------------------------------------------------------------------------
BLOCK (any terrain/structure voxel: dirt, stone, planks, bricks, leaves...)
  hover: outline on the single block + crack-preview
  click: wobble + material-specific sound (stone, wood, grass, gravel, snow)
  hold: mine it. Crack stages 0-9, break into particles tinted by its texture,
        drop a mini item that flies to the player, tiny XP
  right-click with a hotbar block: place a block of that type on the face
  Blocks regrow/respawn after 20s (or Reset World button) so scenes never
  get destroyed permanently. Falling blocks (sand, gravel) obey gravity.
  Water and lava blocks flow a few cells and settle (simple cellular fill).

PLANT (grass, flowers, leaves, vines, saplings, lily pads, berries, moss)
  hover: bend away from cursor
  click: shake + particles; flowers can be picked; leaves drop a few leaves;
  right-click: bone meal grows more plants.

MOB / ANIMAL (sheep, chickens, bees, bats, axolotl, villager, endermen,
fish, silverfish, and the player Cykf_)
  hover: look at cursor, small idle reaction
  click: signature sound + animation (hop, flap, spin, nod, teleport)
  right-click: interaction (shear, feed, trade, pet)
  hold/drag: pick up and carry, release to drop with a bounce
  Mobs flee, follow or wander depending on type. Hitting a mob causes a
  hurt flash, knockback and a heart particle or poof, never real death.

PROP / FURNITURE (chests, barrels, furnaces, beds, tables, bookshelves,
signs, item frames, lecterns, cauldrons, composters, bells, minecarts,
rails, ladders, doors, trapdoors, levers, buttons, pressure plates)
  hover: lift/glow
  click: open/close/toggle/ring/press with animation and sound
  everything that can hold items shows a small inventory of items from
  content.ts or fun facts
  doors and trapdoors open, levers and buttons trigger a visible effect
  elsewhere (lights, rails, hidden rooms).

LIGHT SOURCE (torches, lanterns, campfire, glowstone, sea lanterns, sculk,
magma, candles, end crystals, enchanting glyphs, the sun, the moon)
  click: toggle on/off. Light, shadows, bloom and the nearby surfaces update
  for real. Sun and moon can be dragged to change time of day.

ITEM / DROP (anything dropped, held or in the hotbar)
  hover: bob and tooltip
  click: pick up with a pop and fly-to-hotbar animation
  held items can be used (pickaxe mines faster, torch lights, lantern lights).

LIQUID (water, lava, pond)
  click: ripple with refraction; hold: bigger waves; drag: stir.
  Objects dropped in float or sink and splash.

PARTICLE / AMBIENT (petals, snow, dust, embers, spores, sculk glow, sparks)
  hover: gets attracted or repelled by the cursor (force field)
  click: burst; each catch or touch counts toward the discovery counter.

STRUCTURE (houses, towers, pillars, bridges, mine supports, islands)
  hover: whole structure subtly highlights
  click: knock sound, dust particles; right-click: zoom camera to it.

SKY / ENVIRONMENT (sun, moon, stars, clouds, aurora, void, fog)
  click: clouds puff, stars twinkle or shoot, fog thins briefly, lightning
  optional. All of it responds to cursor parallax.

UI ELEMENT (every HUD and panel piece: hearts, hunger icons, XP bar,
hotbar slots, arrows, pagination dots, key hints, clock, biome label,
logo letters, panel titles, rows, stat boxes, buttons, tooltips, icons)
  hover: tooltip and hover animation
  click: sound plus meaningful action. Examples: each heart pops and
  refills, each hunger drumstick is "eaten", each logo letter wobbles
  individually, each pagination dot jumps to its scene, the clock fast
  forwards time, the biome label shows a fun fact, the version text shows a
  changelog tooltip, each stat box replays its count-up.

THE PLAYER (Cykf_, every body part)
  head click: nod or shake; body click: emote; arms: swing; legs: kick;
  hat layer: toggle; nametag: toggles a username popup; drag to rotate the
  player; double click: jump; hold: sneak. Key E: inventory overlay.

--------------------------------------------------------------------------------
3. SANDBOX LAYER
--------------------------------------------------------------------------------
- Hotbar items are real tools: pickaxe (fast mining), blocks (placeable),
  torch (placeable light), emerald/ender pearl/compass/book (their own
  actions). Number keys select, wheel cycles.
- Every scene has a "Reset Scene" and a global "Reset World" button
  (also keyboard R) that restores everything.
- Physics lite: dropped items, gravity for sand/gravel, simple collisions,
  and knockback. Keep it cheap (no full physics engine unless a tier allows).
- Everything the visitor does is saved (localStorage) except the temporary
  destruction, which resets on reload.

--------------------------------------------------------------------------------
4. DISCOVERY AND REWARDS
--------------------------------------------------------------------------------
- Each unique interaction type per object category counts once as a
  discovery. HUD shows "Discoveries X/Y".
- Milestones (10, 25, 50, 100, 100%) pop advancement toasts and light up the
  Advancements panel. 100% unlocks the locked advancement.
- Rewards: XP orbs fly to the player, the level bar really fills, and
  collected items appear in the hotbar and E inventory.

--------------------------------------------------------------------------------
5. THE COVERAGE AUDIT (THE PROOF)
--------------------------------------------------------------------------------
Write scripts/coverage-audit.ts, run via "npm run audit:interactions":
1. For each of the 9 scenes, load it headless (or in a test route), then
   raycast a dense grid (e.g. 60x34) across the viewport at rest.
2. Every ray that hits a mesh or instance must resolve to a registered
   interactable. Any hit on an unregistered mesh = FAIL, list its name,
   scene and screen position.
3. Walk the DOM: every element in the HUD and panels must be focusable or
   have a registered hover/click handler. List any without one.
4. Output INTERACTION_COVERAGE.md with a table per scene:
   objects total, interactable, fallback-only, failures, and per-category
   counts. Target: 100% of hit objects registered, 0 failures.
5. Also output a per-object table: id, category, hover, click, right-click,
   hold, drag, keyboard, touch, sound, status.
Run the audit after each step and fix every failure before stopping.

--------------------------------------------------------------------------------
6. PERFORMANCE, INPUT AND ACCESSIBILITY
--------------------------------------------------------------------------------
- One throttled raycast per frame against an acceleration structure
  (three-mesh-bvh or chunked bounding boxes). Skip when the pointer is idle.
- Pool particles, sounds, tooltips and outlines. No per-frame allocation.
- Interaction effects scale with quality tier (Low: fewer particles, no
  physics, no liquid flow).
- Dispose everything on scene unmount. Test by switching scenes 50 times.
- Mouse, touch (tap, long press = right-click, drag) and keyboard (Tab to
  cycle, Enter to act) all work. Mobile shows brief pulsing hints.
- prefers-reduced-motion removes shake, flashing and heavy bursts.
- Mute toggle silences everything. Navigation, hotbar and arrows are never
  blocked by an interaction.

ACCEPTANCE CRITERIA
- INTERACTION_COVERAGE.md shows 0 failures in all 9 scenes.
- Any block, plant, mob, prop, light, liquid, sky element, particle, player
  body part and UI element reacts to hover and click.
- Blocks can be mined and placed, and the world resets cleanly.
- 60fps desktop, no console errors, no memory growth when switching scenes.