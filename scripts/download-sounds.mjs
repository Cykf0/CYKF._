import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/audio/sfx');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sfxToDownload = [
  { name: 'click.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft_click.mp3' },
  { name: 'button_click.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-aipha-1-2-6-button-click-sound.mp3' },
  { name: 'click_menu.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-click-menu.mp3' },
  { name: 'chest_open.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-sound-effects-chest-sound-effect.mp3' },
  { name: 'chest_close.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-chest-open-and-close.mp3' },
  { name: 'door_open.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-door-open.mp3' },
  { name: 'door_close.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-door-close.mp3' },
  { name: 'doors_wood.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-door-sound-effect.mp3' },
  { name: 'anvil_use.mp3', url: 'https://www.myinstants.com/media/sounds/anvil-minecraft.mp3' },
  { name: 'anvil_land.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-anvil-landing.mp3' },
  { name: 'villager_hmm.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-villager-sound-effect.mp3' },
  { name: 'villager_trade.mp3', url: 'https://www.myinstants.com/media/sounds/villager-complete-trade.mp3' },
  { name: 'villager_yes.mp3', url: 'https://www.myinstants.com/media/sounds/yes1.mp3' },
  { name: 'villager_death.mp3', url: 'https://www.myinstants.com/media/sounds/villager.mp3' },
  { name: 'xp_orb.mp3', url: 'https://www.myinstants.com/media/sounds/orb.mp3' },
  { name: 'xp_level_up.mp3', url: 'https://www.myinstants.com/media/sounds/levelup.mp3' },
  { name: 'item_pickup.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-item-pick-up-sound.mp3' },
  { name: 'item_drop.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-drop-block-sound-effect.mp3' },
  { name: 'eat.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-eat.mp3' },
  { name: 'eating.mp3', url: 'https://www.myinstants.com/media/sounds/nom-nom-nom_gPJiWn4.mp3' },
  { name: 'drink_potion.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-potion-drinking-sound-effect-1.mp3' },
  { name: 'hurt.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft_hit_soundmp3converter.mp3' },
  { name: 'steve_oof.mp3', url: 'https://www.myinstants.com/media/sounds/uh-steve-minecraft-online-audio-converter.mp3' },
  { name: 'water_splash.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-water-splash-sound-effect.mp3' },
  { name: 'water_splash2.mp3', url: 'https://www.myinstants.com/media/sounds/splashes-2-from-minecraft.mp3' },
  { name: 'water_bucket.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-waterbucket.mp3' },
  { name: 'lava.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-lava.mp3' },
  { name: 'lava_ambient.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-lava-noises.mp3' },
  { name: 'fire.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-fire.mp3' },
  { name: 'fire_ball.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-fire-ball.mp3' },
  { name: 'grass_step1.mp3', url: 'https://www.myinstants.com/media/sounds/grass-1-from-minecraft.mp3' },
  { name: 'grass_step2.mp3', url: 'https://www.myinstants.com/media/sounds/grass-2-from-minecraft.mp3' },
  { name: 'sand_step.mp3', url: 'https://www.myinstants.com/media/sounds/sand-1-from-minecraft.mp3' },
  { name: 'sand_step2.mp3', url: 'https://www.myinstants.com/media/sounds/sand-2-from-minecraft.mp3' },
  { name: 'stone_break.mp3', url: 'https://www.myinstants.com/media/sounds/breaking-stone-minecraft-sound-effect.mp3' },
  { name: 'wood_break.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-wood-break-place.mp3' },
  { name: 'glass_break.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-glass-break.mp3' },
  { name: 'tool_break.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-tool-break.mp3' },
  { name: 'pickaxe_hit.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-pickaxe-sound.mp3' },
  { name: 'portal_hum.mp3', url: 'https://www.myinstants.com/media/sounds/portal_EIeiKty.mp3' },
  { name: 'end_portal_activate.mp3', url: 'https://www.myinstants.com/media/sounds/end_portal_activation.mp3' },
  { name: 'teleport.mp3', url: 'https://www.myinstants.com/media/sounds/teleport1_Cw1ot9l.mp3' },
  { name: 'enderman_scream.mp3', url: 'https://www.myinstants.com/media/sounds/scream1.mp3' },
  { name: 'bow_shoot.mp3', url: 'https://www.myinstants.com/media/sounds/bow_shoot.mp3' },
  { name: 'bell.mp3', url: 'https://www.myinstants.com/media/sounds/bell-minecraft.mp3' },
  { name: 'sheep.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-sheep2.mp3' },
  { name: 'cow.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-cow.mp3' },
  { name: 'creeper_fuse.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-creeper-fuse-1.mp3' },
  { name: 'explosion.mp3', url: 'https://www.myinstants.com/media/sounds/creeper-explosion.mp3' },
  { name: 'tnt_explode.mp3', url: 'https://www.myinstants.com/media/sounds/tnt-explosion.mp3' },
  { name: 'zombie_groan.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-zombie-sounds.mp3' },
  { name: 'minecart.mp3', url: 'https://www.myinstants.com/media/sounds/quertyit-new-minecart-sound.mp3' },
  { name: 'cave_ambience1.mp3', url: 'https://www.myinstants.com/media/sounds/cave11_0QWMESM.mp3' },
  { name: 'cave_ambience2.mp3', url: 'https://www.myinstants.com/media/sounds/cave21.mp3' },
  { name: 'cave_drone.mp3', url: 'https://www.myinstants.com/media/sounds/minecraft-cave-sound-5.mp3' },
];

async function downloadAll() {
  console.log(`Starting download of ${sfxToDownload.length} sounds...`);
  let successCount = 0;
  for (const item of sfxToDownload) {
    const dest = path.join(outDir, item.name);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      if (!res.ok) {
        console.error(`Failed ${item.name}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 500) {
        console.error(`File too small (${buffer.length}b): ${item.name}`);
        continue;
      }
      fs.writeFileSync(dest, buffer);
      successCount++;
      console.log(`✓ Downloaded ${item.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
  console.log(`Finished! Successfully downloaded ${successCount}/${sfxToDownload.length} files.`);
}

downloadAll();
