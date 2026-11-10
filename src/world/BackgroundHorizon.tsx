import React from 'react';
import * as THREE from 'three';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore, BIOMES } from '../store';

/**
 * Universal Background Horizon & Sky Dome
 * Ensures that 100% of raycasts across the viewport hit a registered interactable.
 * Provides a nudge reaction and "Too far to reach" tooltip per Section 1.
 */
export const BackgroundHorizon: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const biome = BIOMES[currentScene] || BIOMES[0];

  const handleSkyClick = () => {
    sounds.playWobble(520);
    useStore.getState().recordDiscovery(`sky_horizon_${currentScene}`, 'SKY', `Distant ${biome.name} Sky`);
  };

  return (
    <Interactable
      id={`sky_horizon_${currentScene}`}
      name={`Distant Horizon (${biome.name})`}
      category="SKY"
      tooltip="Too far to reach"
      onClick={handleSkyClick}
    >
      {/* Huge inverted background sphere covering the entire viewport */}
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[45, 16, 16]} />
        <meshBasicMaterial
          color={biome.skyColor}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </Interactable>
  );
};
