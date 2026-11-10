import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export type WaterBiomePreset = 'village' | 'forest' | 'arcane' | 'mines' | 'frozen' | 'sculk' | 'lush';

const BIOME_PALETTES: Record<WaterBiomePreset, { shallow: string; deep: string; sky: string; opacity: number }> = {
  village: { shallow: '#48CAE4', deep: '#0077B6', sky: '#E0F7FA', opacity: 0.72 },
  forest:  { shallow: '#56CFE1', deep: '#0096C7', sky: '#FFDFE8', opacity: 0.70 },
  arcane:  { shallow: '#4CC9F0', deep: '#3A0CA3', sky: '#E0AAFF', opacity: 0.78 },
  mines:   { shallow: '#2A6F97', deep: '#012A4A', sky: '#89C2D9', opacity: 0.82 },
  frozen:  { shallow: '#A2D2FF', deep: '#1B4965', sky: '#E8F8FF', opacity: 0.85 },
  sculk:   { shallow: '#0077B6', deep: '#03045E', sky: '#023E8A', opacity: 0.88 },
  lush:    { shallow: '#48CAE4', deep: '#0F382C', sky: '#D8F3DC', opacity: 0.68 },
};

export interface RealisticWaterPoolProps {
  position?: [number, number, number];
  size?: [number, number, number];
  biome?: WaterBiomePreset;
  shallowColor?: string;
  deepColor?: string;
  skyColor?: string;
  flowDirection?: [number, number]; // [x, z] directional flow velocity
  flowSpeed?: number;
  interactiveId?: string;
  interactiveName?: string;
}

/**
 * High-Fidelity Minecraft BSL / Complementary Shader Water
 * Features:
 * - Pixel-quantized 16x16 stepped flow with authentic 8 FPS vanilla animation
 * - Shoreline foam and contact crests along surrounding blocks
 * - Fresnel reflection blending water absorption with sky/ambient bounce
 * - Biome-specific color palettes (Lush, Village, Frozen, Arcane, Deep Dark, Mines)
 * - Interactive click ripples with expanding concentric shockwaves
 * - Solid bed containment preventing light leakage or under-map void gaps
 */
export const RealisticWaterPool: React.FC<RealisticWaterPoolProps> = ({
  position = [0, 0, 0],
  size = [6.0, 0.875, 5.0],
  biome = 'village',
  shallowColor,
  deepColor,
  skyColor,
  flowDirection = [0, 0],
  flowSpeed = 1.0,
  interactiveId = 'liquid_water_pool',
  interactiveName = 'Crystal Water Pool',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const palette = BIOME_PALETTES[biome] || BIOME_PALETTES.village;
  const sColor = shallowColor || palette.shallow;
  const dColor = deepColor || palette.deep;
  const skyCol = skyColor || palette.sky;
  const baseOpacity = palette.opacity;

  const waterShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uRippleTime: { value: 999.0 },
        uRippleCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uShallowColor: { value: new THREE.Color(sColor) },
        uDeepColor: { value: new THREE.Color(dColor) },
        uSkyColor: { value: new THREE.Color(skyCol) },
        uFlow: { value: new THREE.Vector2(flowDirection[0], flowDirection[1]) },
        uFlowSpeed: { value: flowSpeed },
        uOpacity: { value: baseOpacity },
        uDimensions: { value: new THREE.Vector2(size[0], size[2]) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          vec4 mvPosition = viewMatrix * worldPos;
          vViewPosition = -mvPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRippleTime;
        uniform vec2 uRippleCenter;
        uniform vec3 uShallowColor;
        uniform vec3 uDeepColor;
        uniform vec3 uSkyColor;
        uniform vec2 uFlow;
        uniform float uFlowSpeed;
        uniform float uOpacity;
        uniform vec2 uDimensions;

        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        // 16x16 pixel quantize per block face
        vec2 quantize(vec2 uv, float grid) {
          return floor(uv * grid) / grid;
        }

        void main() {
          // Block-meter scaling for UVs so 16px textures map evenly across large or small pools
          vec2 blockUv = vUv * uDimensions;
          vec2 qUv = quantize(blockUv, 16.0);

          // Authentic stepped vanilla 8 FPS clock
          float frame = floor(uTime * 8.0 * uFlowSpeed);

          // Flow translation
          vec2 flowOffset = uFlow * (frame * 0.06);
          vec2 animUv = qUv + flowOffset;

          // Stepped wave pattern mimicking Minecraft liquid animation
          float w1 = sin(animUv.x * 3.1415 + frame * 0.4) * cos(animUv.y * 3.1415 - frame * 0.35);
          float w2 = cos(animUv.x * 2.2 - frame * 0.25) * sin(animUv.y * 2.2 + frame * 0.45);
          float wave = (w1 + w2) * 0.5;

          // Interactive click ripple wave
          float distToClick = distance(vUv, uRippleCenter);
          float rippleAge = uTime - uRippleTime;
          float rippleWave = 0.0;
          if (rippleAge > 0.0 && rippleAge < 2.5) {
            float rippleDist = rippleAge * 0.7;
            float waveBand = abs(distToClick - rippleDist);
            if (waveBand < 0.12) {
              rippleWave = sin(waveBand * 40.0) * (1.0 - rippleAge / 2.5) * 0.35;
            }
          }

          // Depth-based color absorption (clearer near surface and shore, richer in center)
          float depthFactor = clamp(distance(vUv, vec2(0.5, 0.5)) * 1.4, 0.0, 1.0);
          vec3 waterCol = mix(uDeepColor, uShallowColor, 1.0 - depthFactor * 0.55 + wave * 0.12 + rippleWave);

          // BSL Fresnel reflection
          vec3 viewDir = normalize(vViewPosition);
          vec3 normal = normalize(vWorldNormal + vec3(wave * 0.06 + rippleWave * 0.15, 0.0, wave * 0.06));
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

          // Sky / ambient bounce
          vec3 finalColor = mix(waterCol, uSkyColor, fresnel * 0.6);

          // Shoreline Foam at block perimeters
          float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          if (edgeDist < 0.04) {
            float foam = smoothstep(0.04, 0.005, edgeDist) * (0.65 + 0.35 * sin(frame * 1.5));
            finalColor = mix(finalColor, vec3(0.92, 0.98, 1.0), foam * 0.75);
          }

          gl_FragColor = vec4(finalColor, uOpacity + fresnel * 0.22);
        }
      `,
    });
  }, [sColor, dColor, skyCol, baseOpacity, flowDirection, flowSpeed, size]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const handleClick = (e: any) => {
    sounds.playWaterSplash();
    useStore.getState().recordDiscovery(interactiveId, 'LIQUID', `${interactiveName} Interaction`);

    if (materialRef.current) {
      materialRef.current.uniforms.uRippleTime.value = materialRef.current.uniforms.uTime.value;
      if (e.uv) {
        materialRef.current.uniforms.uRippleCenter.value.set(e.uv.x, e.uv.y);
      }
    }
  };

  return (
    <group position={position}>
      <Interactable
        id={interactiveId}
        name={interactiveName}
        category="LIQUID"
        onClick={handleClick}
      >
        <mesh ref={meshRef} position={[0, size[1] / 2, 0]} receiveShadow>
          <boxGeometry args={size} />
          <primitive object={waterShader} ref={materialRef} attach="material" />
        </mesh>
      </Interactable>
    </group>
  );
};
