import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

/**
 * Pure Vanilla Minecraft Water Pool
 * Features:
 * - Quantized 16x16 texel sampling (no bilinear blur)
 * - Stepped frame animation (vanilla tick speed)
 * - Authentic Minecraft water colors with transparency (80% opacity)
 * - No smooth PBR specular gloss
 */
export const RealisticWaterPool: React.FC<{
  position?: [number, number, number];
  size?: [number, number, number];
  shallowColor?: string;
  deepColor?: string;
}> = ({
  position = [0, 0, 0],
  size = [6.5, 0.2, 5.5],
  shallowColor = '#3F76E4',
  deepColor = '#2A50A8',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Stepped pixel water shader
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
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uShallowColor;
        uniform vec3 uDeepColor;

        varying vec2 vUv;
        varying vec3 vViewPosition;

        // Quantize UV to 16x16 pixel grid per block tile
        vec2 quantize(vec2 uv, float grid) {
          return floor(uv * grid) / grid;
        }

        // Stepped pixel noise
        float pNoise(vec2 p, float t) {
          vec2 q = quantize(p, 16.0);
          float frame = floor(t * 8.0); // 8 FPS vanilla animation rate
          float n = sin(q.x * 24.0 + frame * 0.7) * cos(q.y * 24.0 - frame * 0.5);
          return abs(n);
        }

        void main() {
          float pattern = pNoise(vUv, uTime);
          vec3 col = mix(uDeepColor, uShallowColor, pattern * 0.7 + 0.3);

          // Subtle view-angle fresnel
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(viewDir.z, 0.0), 2.0);
          col = mix(col, vec3(0.7, 0.85, 1.0), fresnel * 0.3);

          gl_FragColor = vec4(col, 0.78);
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
      name="Lush Spring Water"
      category="LIQUID"
      position={position}
      onClick={() => {
        sounds.playWaterSplash();
        useStore.getState().recordDiscovery('liquid_water_pool', 'LIQUID', 'Lush Spring Water Splash');
      }}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={size} />
        <primitive object={waterShader} ref={materialRef} attach="material" />
      </mesh>
    </Interactable>
  );
};
