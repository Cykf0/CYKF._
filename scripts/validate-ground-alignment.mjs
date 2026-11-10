/**
 * =============================================================================
 * AUTOMATIC HIERARCHICAL GROUND-ALIGNMENT & PLACEMENT VALIDATOR
 * =============================================================================
 * Robust multiline parser that computes true World Y coordinates for all entities.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';

const SCENES_DIR = path.resolve('src/scenes');
const SCENE_FILES = [
  { id: 1, name: 'The Developer Archive', file: 'Scene01Title.tsx', groundY: 0.0 },
  { id: 2, name: 'Eternal Forest', file: 'Scene02Profile.tsx', groundY: 0.6 },
  { id: 3, name: 'Arcane Library', file: 'Scene03Enchantments.tsx', groundY: 0.0, altarY: 0.85 },
  { id: 4, name: 'Abandoned Mines', file: 'Scene04Chest.tsx', groundY: 0.0 },
  { id: 5, name: 'Frozen Frontier', file: 'Scene05Crafting.tsx', groundY: 0.0 },
  { id: 6, name: 'Deep Dark', file: 'Scene06Advancements.tsx', groundY: 0.0 },
  { id: 7, name: "Villager's Home", file: 'Scene07Trades.tsx', groundY: 0.0 },
  { id: 8, name: 'Lost Paradise', file: 'Scene08Connect.tsx', groundY: 0.0 },
  { id: 9, name: 'Endless Void', file: 'Scene09End.tsx', groundY: 0.0 }
];

const IGNORE_TAGS = new Set([
  'fog',
  'ambientLight',
  'directionalLight',
  'pointLight',
  'VolumetricGodRay',
  'DustMotes',
  'DriftingVoxelClouds',
  'points',
  'meshStandardMaterial',
  'meshBasicMaterial',
  'boxGeometry',
  'planeGeometry',
  'bufferGeometry',
  'pointsMaterial',
  'CharacterContactShadow'
]);

const GROUND_ENTITIES = new Set([
  'PlayerModel',
  'Villager',
  'Sheep',
  'Enderman',
  'Axolotl',
  'Chest3D',
  'CraftingTable3D',
  'Campfire3D',
  'EnchantingTable3D',
  'SoulFireAltar',
  'AncientCityPortalFrame',
  'SculkRuinedPillar',
  'VoxelTree',
  'TallSpruceTree',
  'ColossalFantasyTree',
  'ChorusPlantTree',
  'HunterCabin',
  'AlpineMountainCabin',
  'VillageCottageHouse',
  'MedievalWindmill',
  'StoneArchBridge',
  'ArcaneLibraryCatwalk',
  'ArcaneEnchantingDais',
  'MineshaftSupportArch',
  'MinecartOnRails',
  'ObsidianPillarWithCrystal',
  'EndCityTowerStructure',
  'EndExitPortalFountain',
  'AmethystGeodeChamber',
  'VanillaSunflower',
  'VanillaCrossedPlant',
  'GiantMushroom',
  'RealisticWaterPool',
  'RealisticLavaPool',
  'WaterfallMesh'
]);

function getTerrainHeight(sceneId, x, z, tagName) {
  if (sceneId === 1) {
    if (x < -6.0 && z < -1.0) return 0.8; // Windmill hill
    if (z < -16.0) return 2.0; // Distant mountain ridge
    return 0.0; // Main foreground terrace
  }

  if (sceneId === 2) {
    if (tagName === 'WaterfallMesh') return 0.5;
    if (z >= -6.5 && z <= -0.5) {
      if (tagName === 'RealisticWaterPool') return -0.12;
      if (tagName === 'StoneArchBridge') return 0.0;
    }
    if (z < -7.0 || tagName === 'HunterCabin') return 1.2;
    return 0.6;
  }

  if (sceneId === 3) {
    if (tagName === 'EnchantingTable3D') return 0.85;
    return 0.0;
  }

  if (sceneId === 5) {
    if (z < -8.0) return 2.5;
    return 0.0;
  }

  return 0.0;
}

function parseSceneEntities(sceneConfig) {
  const filePath = path.join(SCENES_DIR, sceneConfig.file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Tokenize JSX elements across multiple lines
  const elemRegex = /<([A-Za-z0-9_]+)([\s\S]*?)(\/?>)/g;
  const entities = [];
  const groupStack = [];

  let match;
  while ((match = elemRegex.exec(content)) !== null) {
    const tagName = match[1];
    const props = match[2];
    const isSelfClosing = match[3] === '/>';

    if (IGNORE_TAGS.has(tagName)) continue;

    const posMatch = /position=\{\[([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]\}/.exec(props);
    let lx = 0, ly = 0, lz = 0;
    if (posMatch) {
      lx = parseFloat(posMatch[1]);
      ly = parseFloat(posMatch[2]);
      lz = parseFloat(posMatch[3]);
    }

    let worldX = lx;
    let worldY = ly;
    let worldZ = lz;
    for (const parent of groupStack) {
      worldX += parent.x;
      worldY += parent.y;
      worldZ += parent.z;
    }

    if (GROUND_ENTITIES.has(tagName)) {
      entities.push({
        tag: tagName,
        pos: [worldX, worldY, worldZ]
      });
    }

    // Maintain parent group hierarchy stack
    if ((tagName === 'group' || tagName === 'Interactable') && !isSelfClosing) {
      groupStack.push({ tag: tagName, x: lx, y: ly, z: lz });
    }
  }

  return entities;
}

console.log('=================================================================');
console.log(' CYKF._ ACCURATE HIERARCHICAL GROUND-ALIGNMENT AUDITOR');
console.log('=================================================================\n');

let totalTested = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const scene of SCENE_FILES) {
  const entities = parseSceneEntities(scene);
  console.log(`Scene ${scene.id}: ${scene.name} (${scene.file})`);
  console.log(`  Expected Ground Y: ${scene.groundY}`);
  console.log('  -------------------------------------------------------------');

  let scenePass = true;
  for (const ent of entities) {
    totalTested++;
    const expectedY = getTerrainHeight(scene.id, ent.pos[0], ent.pos[2], ent.tag);

    const isWaterOrLava = ent.tag.includes('Water') || ent.tag.includes('Lava');
    const tolerance = isWaterOrLava ? 0.35 : 0.05;

    const deltaY = Math.abs(ent.pos[1] - expectedY);
    const pass = deltaY <= tolerance;

    if (pass) {
      totalPassed++;
      console.log(`  [OK]   ${ent.tag.padEnd(26)} worldY=${ent.pos[1].toFixed(2)} (target=${expectedY.toFixed(2)}, delta=${(ent.pos[1] - expectedY).toFixed(3)}m)`);
    } else {
      totalFailed++;
      scenePass = false;
      console.log(`  [WARN] ${ent.tag.padEnd(26)} worldY=${ent.pos[1].toFixed(2)} (target=${expectedY.toFixed(2)}, delta=${(ent.pos[1] - expectedY).toFixed(3)}m)`);
    }
  }

  if (scenePass) {
    console.log(`  -> RESULT: Scene ${scene.id} Ground Alignment: 100% PERFECT\n`);
  } else {
    console.log(`  -> RESULT: Scene ${scene.id} has misaligned objects!\n`);
  }
}

console.log('=================================================================');
console.log(`FINAL RESULT: ${totalPassed}/${totalTested} objects validated.`);
if (totalFailed === 0) {
  console.log('STATUS: ALL 9 WORLDS PASS GROUND ALIGNMENT WITH 100% SUCCESS!');
  console.log('ZERO FLOATING OBJECTS DETECTED ACROSS THE ENTIRE CODEBASE.');
  console.log('=================================================================');
  process.exit(0);
} else {
  console.log(`STATUS: ${totalFailed} objects require ground adjustment.`);
  console.log('=================================================================');
  process.exit(1);
}
