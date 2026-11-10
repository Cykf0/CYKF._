import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { MiningOverlay } from './MiningOverlay';
import { FloatingItemDrops } from './FloatingItemDrops';
import { FlyingXpOrbs } from './FlyingXpOrbs';
import { useStore } from '../store';

/**
 * SceneInteractablesManager:
 * Hosts visual 3D interaction overlays (cracks, drops, orbs) and performs
 * throttled pointer raycasting (skipping when pointer is idle) per Section 6.
 */
export const SceneInteractablesManager: React.FC = () => {
  const { raycaster, scene, camera, pointer } = useThree();
  const lastPointer = useRef(new THREE.Vector2(-999, -999));
  const lastCheckTime = useRef(0);

  // Throttled raycasting: skip when pointer is idle
  useFrame((state) => {
    const now = performance.now();
    if (now - lastCheckTime.current < 60) return; // 16 Hz check for idle hover
    lastCheckTime.current = now;

    // Check if pointer has moved
    if (
      Math.abs(pointer.x - lastPointer.current.x) < 0.005 &&
      Math.abs(pointer.y - lastPointer.current.y) < 0.005
    ) {
      return; // Pointer is idle, skip expensive raycast
    }
    lastPointer.current.copy(pointer);

    // Cast ray to detect background or interactive object
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      const topHit = intersects[0].object;
      if (topHit.userData?.interactable) {
        // Set hover target
        useStore.getState().setHoverTarget(topHit.userData.interactable.name);
      }
    }
  });

  return (
    <group>
      <MiningOverlay />
      <FloatingItemDrops />
      <FlyingXpOrbs />
    </group>
  );
};
