import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { interactionRegistry } from './InteractionRegistry';
import { MiningState } from './types';

// Procedurally generate the 10 Minecraft crack textures (stages 0 to 9)
function createCrackTextures(): THREE.CanvasTexture[] {
  const textures: THREE.CanvasTexture[] = [];
  const size = 32;

  // Crack fracture seed coordinates
  const crackLines = [
    [[16, 16], [14, 18], [12, 22]],
    [[16, 16], [18, 14], [22, 12]],
    [[16, 16], [15, 12], [14, 8]],
    [[16, 16], [19, 18], [24, 24]],
    [[12, 22], [8, 24], [4, 28]],
    [[22, 12], [26, 8], [30, 6]],
    [[14, 8], [10, 4], [6, 2]],
    [[24, 24], [28, 28], [31, 31]],
    [[14, 18], [10, 16], [6, 18]],
    [[18, 14], [22, 16], [26, 15]],
  ];

  for (let stage = 0; stage < 10; stage++) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'square';

    const numLines = Math.min(crackLines.length, stage + 1);
    for (let i = 0; i < numLines; i++) {
      const line = crackLines[i];
      ctx.beginPath();
      ctx.moveTo(line[0][0], line[0][1]);
      for (let j = 1; j < line.length; j++) {
        ctx.lineTo(line[j][0], line[j][1]);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    textures.push(tex);
  }

  return textures;
}

export const MiningOverlay: React.FC = () => {
  const [miningState, setMiningState] = useState<MiningState | null>(null);
  const crackTextures = useMemo(() => createCrackTextures(), []);

  useEffect(() => {
    return interactionRegistry.subscribeMining((state) => {
      setMiningState(state);
    });
  }, []);

  if (!miningState) return null;

  const currentTexture = crackTextures[miningState.stage] || crackTextures[0];

  return (
    <mesh position={miningState.position} renderOrder={999}>
      <boxGeometry args={[1.02, 1.02, 1.02]} />
      <meshBasicMaterial
        map={currentTexture}
        transparent
        opacity={0.88}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  );
};
