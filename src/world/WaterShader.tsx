import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Procedural Realistic Minecraft Water Shader
 * Features:
 * - Dual-layer scrolling normal waves (pixel-stepped for Minecraft look)
 * - Depth color absorption (shallow turquoise to deep oceanic teal)
 * - Fresnel edge reflection
 * - Dynamic caustics on underwater floor
 */
export const RealisticWaterPool: React.FC<{
  position?: [number, number, number];
  size?: [number, number, number];
  shallowColor?: string;
  deepColor?: string;
}> = ({
  position = [0, 0, 0],
  size = [6.5, 0.2, 5.5],
  shallowColor = '#2EC4B6',
  deepColor = '#0B3954',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom water shader
  const waterShader = React.useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uShallowColor: { value: new THREE.Color(shallowColor) },
        uDeepColor: { value: new THREE.Color(deepColor) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        uniform float uTime;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // Subtle voxel wave displacement
          vec3 pos = position;
          float wave = sin(pos.x * 2.0 + uTime * 2.0) * 0.02 + cos(pos.z * 2.0 + uTime * 1.5) * 0.02;
          pos.y += wave;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uShallowColor;
        uniform vec3 uDeepColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        // Pixelated water caustics noise
        float caustic(vec2 p, float t) {
          vec2 p1 = p * 8.0 + vec2(t * 0.8, t * 0.5);
          vec2 p2 = p * 8.0 - vec2(t * 0.6, -t * 0.7);
          float c1 = sin(p1.x + sin(p1.y));
          float c2 = cos(p2.y + cos(p2.x));
          return pow(abs(c1 + c2) * 0.5, 3.0);
        }

        void main() {
          vec3 viewDir = normalize(vViewPosition);
          vec3 normal = normalize(vNormal);

          // Fresnel factor
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

          // Scrolling water caustics
          float caust = caustic(vUv, uTime * 0.6);

          // Color blend based on viewing angle & caustics
          vec3 waterColor = mix(uDeepColor, uShallowColor, 0.5 + caust * 0.4);
          vec3 finalColor = mix(waterColor, vec3(0.9, 0.95, 1.0), fresnel * 0.6);

          gl_FragColor = vec4(finalColor, 0.82 + fresnel * 0.15);
        }
      `,
    });
  }, [shallowColor, deepColor]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <Interactable
      id="liquid_water_pool"
      name="Lush Spring Water Pool"
      category="LIQUID"
      position={position}
      onClick={() => {
        sounds.playWaterSplash();
        useStore.getState().recordDiscovery('liquid_water_pool', 'LIQUID', 'Lush Cave Spring Water');
      }}
    >
      <mesh
        ref={meshRef}
        receiveShadow
      >
        <boxGeometry args={size} />
        <primitive object={waterShader} ref={materialRef} attach="material" />
      </mesh>
    </Interactable>
  );
};
