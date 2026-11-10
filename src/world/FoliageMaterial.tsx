import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Animated Foliage / Leaves with wind sway and backlit translucency
 */
export const WindSwayLeaves: React.FC<{
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
  swaySpeed?: number;
  swayAmount?: number;
}> = ({
  position,
  size = [1, 1, 1],
  color = '#F4A6B8',
  swaySpeed = 2.5,
  swayAmount = 0.04,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * swaySpeed;
      meshRef.current.rotation.z = Math.sin(t + position[0]) * swayAmount;
      meshRef.current.rotation.x = Math.cos(t * 0.8 + position[2]) * swayAmount;
    }
  });

  return (
    <Interactable
      id="plant_leaves"
      name="Cherry Blossom Leaves"
      category="PLANT"
      position={position}
      onClick={() => {
        sounds.playBlockHit('grass');
        useStore.getState().recordDiscovery('plant_leaves', 'PLANT', 'Cherry Leaves Flutter');
      }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>
    </Interactable>
  );
};

/**
 * Instanced Tall Grass & Wildflowers with Wind Sway
 */
export const InstancedGrassField: React.FC<{
  count?: number;
  area?: [number, number];
  baseColor?: string;
  flowerColor?: string;
}> = ({
  count = 60,
  area = [12, 12],
  baseColor = '#6AA836',
  flowerColor = '#F4A6B8',
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const instances = useMemo(() => {
    const list: { pos: [number, number, number]; rotY: number; scale: number; isFlower: boolean }[] = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * area[0];
      const z = (Math.random() - 0.5) * area[1];
      const isFlower = Math.random() < 0.25;
      list.push({
        pos: [x, 0.2, z],
        rotY: Math.random() * Math.PI,
        scale: 0.6 + Math.random() * 0.4,
        isFlower,
      });
    }
    return list;
  }, [count, area]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * 3.0;

      instances.forEach((inst, i) => {
        dummy.position.set(...inst.pos);
        dummy.rotation.y = inst.rotY;
        dummy.rotation.z = Math.sin(t + inst.pos[0] * 2.0) * 0.12;
        dummy.scale.set(inst.scale, inst.scale, inst.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <Interactable
      id="plant_tall_grass"
      name="Tall Grass & Flowers"
      category="PLANT"
      onClick={() => {
        sounds.playBlockHit('grass');
        useStore.getState().recordDiscovery('plant_tall_grass', 'PLANT', 'Field Grass Swish');
      }}
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.8}
          side={THREE.DoubleSide}
          alphaTest={0.4}
        />
      </instancedMesh>
    </Interactable>
  );
};
