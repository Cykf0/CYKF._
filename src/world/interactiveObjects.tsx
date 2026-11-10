import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { sounds } from '../audio/soundManager';

/**
 * 3D Interactive Minecraft Chest with animated open lid
 */
export const Chest3D: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  initiallyOpen?: boolean;
}> = ({ position = [0, 0, 0], rotation = [0, 0, 0], initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const lidRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (lidRef.current) {
      const targetAngle = isOpen ? -Math.PI * 0.45 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.damp(lidRef.current.rotation.x, targetAngle, 8, delta);
    }
  });

  const toggleChest = (e: any) => {
    e.stopPropagation();
    sounds.playChestOpen();
    setIsOpen(!isOpen);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={0.5}
      onClick={toggleChest}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Chest Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
      </mesh>
      {/* Base Inner Black Hole */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.4, 0.7, 1.4]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Chest Animated Lid (Hinged at back z=-0.7, y=0.8) */}
      <group ref={lidRef} position={[0, 0.8, -0.7]}>
        {/* Lid Top Box centered at z=+0.7 relative to hinge */}
        <mesh position={[0, 0.2, 0.7]} castShadow>
          <boxGeometry args={[1.6, 0.4, 1.6]} />
          <meshStandardMaterial color="#A06935" roughness={0.8} />
        </mesh>
        {/* Silver Latch at front */}
        <mesh position={[0, 0.05, 1.55]} castShadow>
          <boxGeometry args={[0.2, 0.35, 0.1]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * 3D Enchanting Table with Floating Spellbook and Glyph Particles
 */
export const EnchantingTable3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const bookRef = useRef<THREE.Group>(null);
  const leftPageRef = useRef<THREE.Group>(null);
  const rightPageRef = useRef<THREE.Group>(null);
  const glyphsRef = useRef<THREE.Points>(null);

  // Generate random glyph particle positions
  const glyphParticles = React.useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 1.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.5 + Math.random() * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (bookRef.current) {
      // Gentle floating bob and slow spin
      bookRef.current.position.y = 1.3 + Math.sin(t * 2) * 0.08;
      bookRef.current.rotation.y = t * 0.5;
    }
    if (leftPageRef.current && rightPageRef.current) {
      // Subtle page flapping
      leftPageRef.current.rotation.y = -0.4 + Math.sin(t * 4) * 0.05;
      rightPageRef.current.rotation.y = 0.4 - Math.sin(t * 4) * 0.05;
    }
    if (glyphsRef.current) {
      glyphsRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Obsidian Table Base (3/4 block high = 0.75) */}
      <mesh position={[0, 0.375, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.75, 1.5]} />
        <meshStandardMaterial color="#191522" roughness={0.8} />
      </mesh>

      {/* Red Diamond Velvet Cloth Top */}
      <mesh position={[0, 0.76, 0]}>
        <boxGeometry args={[1.4, 0.04, 1.4]} />
        <meshStandardMaterial color="#991515" roughness={0.7} />
      </mesh>

      {/* 4 Diamond Corners */}
      {[
        [-0.65, 0.65, -0.65],
        [0.65, 0.65, -0.65],
        [-0.65, 0.65, 0.65],
        [0.65, 0.65, 0.65],
      ].map(([cx, cy, cz], idx) => (
        <mesh key={idx} position={[cx, cy, cz]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial color="#55FFFF" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* Purple Mystical Point Light */}
      <pointLight color="#B388FF" intensity={3.5} distance={12} decay={2} position={[0, 1.5, 0]} />

      {/* Floating Open Book */}
      <group
        ref={bookRef}
        position={[0, 1.3, 0]}
        scale={0.18}
        onClick={() => sounds.playEnchantChime()}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        {/* Book Spine */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 3.2, 0.4]} />
          <meshStandardMaterial color="#881B1B" roughness={0.6} />
        </mesh>

        {/* Left Open Cover + Page */}
        <group ref={leftPageRef} position={[-0.3, 0, 0]} rotation={[0, -0.4, 0]}>
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[2.4, 3.0, 0.15]} />
            <meshStandardMaterial color="#F3E5C8" roughness={0.9} />
          </mesh>
        </group>

        {/* Right Open Cover + Page */}
        <group ref={rightPageRef} position={[0.3, 0, 0]} rotation={[0, 0.4, 0]}>
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[2.4, 3.0, 0.15]} />
            <meshStandardMaterial color="#F3E5C8" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Hovering Arcane Glyph Particles */}
      <points ref={glyphsRef} position={[0, 0.5, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[glyphParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#CC66FF" transparent opacity={0.85} />
      </points>
    </group>
  );
};

/**
 * 3D Campfire with animated voxel smoke and sparks (Snowy Peaks Scene)
 */
export const Campfire3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const fireRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Points>(null);

  // Smoke particles
  const smokeParticles = React.useMemo(() => {
    const count = 25;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = 0.5 + (i / count) * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (fireRef.current) {
      fireRef.current.scale.y = 0.9 + Math.sin(t * 12) * 0.15;
    }
    if (smokeRef.current) {
      const positions = smokeRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 25; i++) {
        // Move upward
        positions[i * 3 + 1] += 0.02;
        // Drift with wind
        positions[i * 3] += Math.sin(t + i) * 0.005;
        // Reset when too high
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = 0.5;
          positions[i * 3] = (Math.random() - 0.5) * 0.3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
      }
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group
      position={position}
      onClick={() => sounds.playClick()}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* 4 Wooden Logs Base */}
      <mesh position={[0, 0.12, 0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.12, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>

      {/* Animated Fire Flame Voxels */}
      <group ref={fireRef} position={[0, 0.3, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.5]} />
          <meshBasicMaterial color="#FF6600" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.3, 0.7, 0.3]} />
          <meshBasicMaterial color="#FFDD00" />
        </mesh>
      </group>

      {/* Warm Fire Point Light */}
      <pointLight color="#FF9933" intensity={3.5} distance={15} decay={2} position={[0, 0.8, 0]} />

      {/* Rising Smoke Particles */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[smokeParticles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.18} color="#DCDCDC" transparent opacity={0.65} />
      </points>
    </group>
  );
};

/**
 * 3D End Crystal with Spinning Cubes and Purple Laser (The End Scene)
 */
export const EndCrystal3D: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const outerCubeRef = useRef<THREE.Mesh>(null);
  const innerCubeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.x = t * 1.2;
      outerCubeRef.current.rotation.y = t * 0.8;
    }
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.x = -t * 1.5;
      innerCubeRef.current.rotation.y = -t * 1.0;
    }
  });

  return (
    <group position={position}>
      {/* Bedrock Base Plate */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.6, 0.2, 1.6]} />
        <meshStandardMaterial color="#2B2B2B" roughness={0.9} />
      </mesh>

      {/* Outer Glass Cube */}
      <mesh ref={outerCubeRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.35} roughness={0.1} />
      </mesh>

      {/* Inner Glowing Purple Crystal Cube */}
      <mesh ref={innerCubeRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshBasicMaterial color="#CC44FF" />
      </mesh>

      {/* Vertical Purple Beacon Beam into sky */}
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 30, 8]} />
        <meshBasicMaterial color="#CC44FF" transparent opacity={0.7} />
      </mesh>

      <pointLight color="#D670D6" intensity={4} distance={20} decay={2} position={[0, 2, 0]} />
    </group>
  );
};
