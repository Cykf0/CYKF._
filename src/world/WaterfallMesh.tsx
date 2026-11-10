import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';

export interface WaterfallMeshProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  foamColor?: string;
  speed?: number;
  interactiveId?: string;
  interactiveName?: string;
}

/**
 * Animated Cascading Minecraft Waterfall with Volumetric Depth & Base Splash Mist
 */
export const WaterfallMesh: React.FC<WaterfallMeshProps> = ({
  position = [0, 0, 0],
  width = 2.4,
  height = 7.0,
  depth = 0.4,
  color = '#48CAE4',
  foamColor = '#E0F7FA',
  speed = 1.6,
  interactiveId = 'liquid_waterfall',
  interactiveName = 'Cascading Waterfall',
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mistPointsRef = useRef<THREE.Points>(null);

  // Vertical falling water shader
  const waterfallShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(color) },
        uFoamColor: { value: new THREE.Color(foamColor) },
        uSpeed: { value: speed },
        uDimensions: { value: new THREE.Vector2(width, height) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;

        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBaseColor;
        uniform vec3 uFoamColor;
        uniform float uSpeed;
        uniform vec2 uDimensions;

        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;

        vec2 quantize(vec2 uv, float grid) {
          return floor(uv * grid) / grid;
        }

        void main() {
          // Pixel stepped coordinates (16px per meter)
          vec2 blockUv = vUv * uDimensions;
          vec2 qUv = quantize(blockUv, 16.0);

          // Fast downward frame stepping (12 FPS vanilla waterfall)
          float frame = floor(uTime * 12.0 * uSpeed);

          // Downward streak pattern
          float streak1 = sin(qUv.x * 6.28 + frame * 0.5) * cos(qUv.y * 4.0 - frame * 1.2);
          float streak2 = cos(qUv.x * 12.56 - frame * 0.8) * sin(qUv.y * 8.0 - frame * 1.8);
          float combined = (streak1 + streak2) * 0.5;

          // White water foam streaks
          float foamThreshold = 0.35 + 0.15 * sin(qUv.x * 3.14 + frame * 0.3);
          float isFoam = step(foamThreshold, combined);

          // Extra foam at the very bottom (impact zone)
          float bottomImpact = smoothstep(0.25, 0.0, vUv.y);
          isFoam = max(isFoam, bottomImpact * 0.85);

          // Top crest rounding
          float topCrest = smoothstep(0.9, 1.0, vUv.y);
          isFoam = max(isFoam, topCrest * 0.4);

          vec3 finalColor = mix(uBaseColor, uFoamColor, isFoam);

          // Fresnel edge sheen
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 2.5);
          finalColor = mix(finalColor, vec3(1.0), fresnel * 0.4);

          float opacity = 0.78 + isFoam * 0.18 + fresnel * 0.15;
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
    });
  }, [color, foamColor, speed, width, height]);

  // Base Mist and Splash Particle System
  const { mistGeometry, mistMaterial } = useMemo(() => {
    const count = 35;
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * (width + 0.6);
      positions[i * 3 + 1] = Math.random() * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
      opacities[i] = Math.random();
      speeds[i] = 0.6 + Math.random() * 0.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const mat = new THREE.PointsMaterial({
      color: foamColor,
      size: 0.14,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { mistGeometry: geo, mistMaterial: mat };
  }, [width, foamColor]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    if (mistPointsRef.current) {
      const posAttr = mistPointsRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < posAttr.count; i++) {
        positions[i * 3 + 1] += delta * 0.9;
        if (positions[i * 3 + 1] > 1.2) {
          positions[i * 3 + 1] = 0.05;
          positions[i * 3 + 0] = (Math.random() - 0.5) * (width + 0.6);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const handleClick = () => {
    sounds.playWaterSplash();
    useStore.getState().recordDiscovery(interactiveId, 'LIQUID', `${interactiveName} Splash`);
  };

  return (
    <group position={position}>
      <Interactable
        id={interactiveId}
        name={interactiveName}
        category="LIQUID"
        onClick={handleClick}
      >
        {/* Volumetric Front & Back Flow Sheets */}
        <mesh position={[0, height / 2, depth / 2]} receiveShadow>
          <planeGeometry args={[width, height]} />
          <primitive object={waterfallShader} ref={materialRef} attach="material" />
        </mesh>
        <mesh position={[0, height / 2, -depth / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width, height]} />
          <primitive object={waterfallShader} attach="material" />
        </mesh>

        {/* Top Outflow Lip (Connects cleanly to source ledge) */}
        <mesh position={[0, height - 0.05, -depth * 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth * 2.5]} />
          <primitive object={waterfallShader} attach="material" />
        </mesh>

        {/* Bottom Impact Froth Box */}
        <mesh position={[0, 0.12, depth * 0.4]}>
          <boxGeometry args={[width + 0.4, 0.25, depth * 2.2]} />
          <meshBasicMaterial color={foamColor} transparent opacity={0.6} depthWrite={false} />
        </mesh>

        {/* Base Splash Particles */}
        <points ref={mistPointsRef} geometry={mistGeometry} material={mistMaterial} position={[0, 0.1, depth * 0.4]} />
      </Interactable>
    </group>
  );
};
