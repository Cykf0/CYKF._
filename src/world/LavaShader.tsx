import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Interactable } from '../interaction/Interactable';
import { sounds } from '../audio/soundManager';
import { useStore } from '../store';
import { createVanillaBlockGeometry } from './VanillaBlockGeometry';
import { vanillaAtlas } from './VanillaTextureAtlas';

export interface RealisticLavaPoolProps {
  position?: [number, number, number];
  size?: [number, number, number]; // [width, height, depth]
  withBasin?: boolean;
  interactiveId?: string;
  interactiveName?: string;
}

/**
 * Authentic Minecraft Animated Molten Lava Shader with Stepped 6 FPS Frame Rate,
 * Emissive Glow, Heat Distortion, and Rising Ember Particles.
 */
export const RealisticLavaPool: React.FC<RealisticLavaPoolProps> = ({
  position = [0, 0, 0],
  size = [4.5, 0.875, 5.0],
  withBasin = true,
  interactiveId = 'liquid_lava_pool',
  interactiveName = 'Molten Magma Reservoir',
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const emberPointsRef = useRef<THREE.Points>(null);

  // Animated Viscous Lava Shader
  const lavaShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uDimensions: { value: new THREE.Vector2(size[0], size[2]) },
        uCoreColor: { value: new THREE.Color('#FFF066') }, // Hot core
        uLavaColor: { value: new THREE.Color('#FF4500') }, // Flowing orange
        uCrustColor: { value: new THREE.Color('#7A0000') }, // Dark cooling crust
        uDarkCrust: { value: new THREE.Color('#2A0000') }, // Solid rock crust
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
        uniform vec2 uDimensions;
        uniform vec3 uCoreColor;
        uniform vec3 uLavaColor;
        uniform vec3 uCrustColor;
        uniform vec3 uDarkCrust;

        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;

        vec2 quantize(vec2 uv, float grid) {
          return floor(uv * grid) / grid;
        }

        void main() {
          vec2 blockUv = vUv * uDimensions;
          vec2 qUv = quantize(blockUv, 16.0);

          // Sluggish 5 FPS Minecraft lava frame stepping
          float frame = floor(uTime * 5.0);

          // Viscous swirling magma noise
          float n1 = sin(qUv.x * 2.5 + frame * 0.25) * cos(qUv.y * 2.5 - frame * 0.2);
          float n2 = cos(qUv.x * 4.5 - frame * 0.35) * sin(qUv.y * 4.5 + frame * 0.3);
          float n3 = sin((qUv.x + qUv.y) * 3.0 + frame * 0.15);
          float lavaFlow = (n1 + n2 + n3) / 3.0; // [-1.0, 1.0]

          // Molten color gradient blending
          vec3 col = uLavaColor;
          if (lavaFlow > 0.35) {
            // Bright white-hot glowing veins
            float coreFactor = smoothstep(0.35, 0.75, lavaFlow);
            col = mix(uLavaColor, uCoreColor, coreFactor);
          } else if (lavaFlow < -0.2) {
            // Dark cooling obsidian crust
            float crustFactor = smoothstep(-0.2, -0.65, lavaFlow);
            col = mix(uLavaColor, mix(uCrustColor, uDarkCrust, crustFactor * 0.6), crustFactor);
          }

          // Emissive view grazing edge
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 3.0);
          col += uCoreColor * (fresnel * 0.25);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [size]);

  // Rising Lava Ember Particles
  const { emberGeometry, emberMaterial } = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * (size[0] * 0.85);
      positions[i * 3 + 1] = Math.random() * 0.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * (size[2] * 0.85);
      speeds[i] = 0.4 + Math.random() * 0.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: '#FFAA00',
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { emberGeometry: geo, emberMaterial: mat };
  }, [size]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }

    // Dynamic warm light flicker
    if (lightRef.current) {
      lightRef.current.intensity = 3.6 + Math.sin(t * 7.5) * 0.4 + Math.cos(t * 11.2) * 0.25;
    }

    // Rise ember sparks
    if (emberPointsRef.current) {
      const posAttr = emberPointsRef.current.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      for (let i = 0; i < posAttr.count; i++) {
        positions[i * 3 + 1] += delta * 0.7;
        // slight drift
        positions[i * 3 + 0] += Math.sin(t + i) * 0.003;
        if (positions[i * 3 + 1] > 1.8) {
          positions[i * 3 + 1] = 0.05;
          positions[i * 3 + 0] = (Math.random() - 0.5) * (size[0] * 0.85);
          positions[i * 3 + 2] = (Math.random() - 0.5) * (size[2] * 0.85);
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const handleClick = () => {
    sounds.playLava();
    useStore.getState().recordDiscovery(interactiveId, 'LIQUID', `${interactiveName} Sizzle`);
  };

  return (
    <group position={position}>
      {/* Basalt & Crying Obsidian Retaining Basin */}
      {withBasin && (
        <group>
          {/* Solid Sub-basin Foundation */}
          <mesh
            position={[0, -0.2, 0]}
            geometry={createVanillaBlockGeometry({
              width: size[0] + 0.8,
              height: size[1] + 0.4,
              depth: size[2] + 0.8,
              textures: 'crying_obsidian',
            })}
            material={vanillaAtlas.getSolidMaterial()}
          />
          {/* Surrounding Obsidian & Magma Rim */}
          <mesh
            position={[0, 0.08, 0]}
            geometry={createVanillaBlockGeometry({
              width: size[0] + 0.5,
              height: 0.35,
              depth: size[2] + 0.5,
              textures: 'crying_obsidian',
            })}
            material={vanillaAtlas.getSolidMaterial()}
          />
        </group>
      )}

      {/* Interactive Molten Lava Surface */}
      <Interactable
        id={interactiveId}
        name={interactiveName}
        category="LIQUID"
        onClick={handleClick}
      >
        <mesh position={[0, size[1] * 0.45, 0]}>
          <boxGeometry args={[size[0], size[1], size[2]]} />
          <primitive object={lavaShader} ref={materialRef} attach="material" />
        </mesh>
      </Interactable>

      {/* Floating Magma Embers */}
      <points
        ref={emberPointsRef}
        geometry={emberGeometry}
        material={emberMaterial}
        position={[0, size[1] * 0.48, 0]}
      />

      {/* Warm Radiating Cavern Firelight */}
      <pointLight
        ref={lightRef}
        position={[0, 1.4, 0]}
        color="#FF5500"
        intensity={3.8}
        distance={14}
        decay={2}
        castShadow
      />
    </group>
  );
};

export interface LavaWaterfallProps {
  position?: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  speed?: number;
  interactiveId?: string;
  interactiveName?: string;
}

/**
 * Continuous Cascading Molten Lava Column & Fall (Scene 4 Abandoned Mines)
 */
export const LavaWaterfall: React.FC<LavaWaterfallProps> = ({
  position = [0, 0, 0],
  width = 1.8,
  height = 6.5,
  depth = 0.5,
  speed = 0.8,
  interactiveId = 'liquid_lava_fall',
  interactiveName = 'Cascading Lava Fall',
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const lavaFallShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uDimensions: { value: new THREE.Vector2(width, height) },
        uCoreColor: { value: new THREE.Color('#FFF566') },
        uLavaColor: { value: new THREE.Color('#FF3700') },
        uCrustColor: { value: new THREE.Color('#8B0000') },
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
        uniform vec2 uDimensions;
        uniform vec3 uCoreColor;
        uniform vec3 uLavaColor;
        uniform vec3 uCrustColor;

        varying vec2 vUv;
        varying vec3 vViewPosition;
        varying vec3 vWorldNormal;

        vec2 quantize(vec2 uv, float grid) {
          return floor(uv * grid) / grid;
        }

        void main() {
          vec2 blockUv = vUv * uDimensions;
          vec2 qUv = quantize(blockUv, 16.0);

          // Downward viscous flow
          float frame = floor(uTime * 7.0);
          float streak1 = sin(qUv.x * 3.5 + frame * 0.4) * cos(qUv.y * 2.0 - frame * 0.8);
          float streak2 = cos(qUv.x * 7.0 - frame * 0.6) * sin(qUv.y * 4.0 - frame * 1.2);
          float flow = (streak1 + streak2) * 0.5;

          vec3 col = uLavaColor;
          if (flow > 0.25) {
            col = mix(uLavaColor, uCoreColor, smoothstep(0.25, 0.7, flow));
          } else if (flow < -0.2) {
            col = mix(uLavaColor, uCrustColor, smoothstep(-0.2, -0.6, flow));
          }

          // Extra bright molten impact at bottom
          float bottomGlow = smoothstep(0.25, 0.0, vUv.y);
          col = mix(col, uCoreColor, bottomGlow * 0.5);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [width, height]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const handleClick = () => {
    sounds.playLava();
    useStore.getState().recordDiscovery(interactiveId, 'LIQUID', `${interactiveName} Sizzle`);
  };

  return (
    <group position={position}>
      <Interactable
        id={interactiveId}
        name={interactiveName}
        category="LIQUID"
        onClick={handleClick}
      >
        {/* Volumetric Front & Back Lava Sheets */}
        <mesh position={[0, height / 2, depth / 2]}>
          <planeGeometry args={[width, height]} />
          <primitive object={lavaFallShader} ref={materialRef} attach="material" />
        </mesh>
        <mesh position={[0, height / 2, -depth / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[width, height]} />
          <primitive object={lavaFallShader} attach="material" />
        </mesh>

        {/* Top Magma Origin Overhang Lip */}
        <mesh position={[0, height - 0.02, -depth * 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth * 2.0]} />
          <primitive object={lavaFallShader} attach="material" />
        </mesh>

        {/* Bottom Magma Churn Basin */}
        <mesh position={[0, 0.1, depth * 0.3]}>
          <boxGeometry args={[width + 0.3, 0.25, depth * 1.8]} />
          <meshBasicMaterial color="#FF3700" />
        </mesh>

        <pointLight position={[0, height / 2, depth]} color="#FF4500" intensity={2.8} distance={8} decay={2} />
      </Interactable>
    </group>
  );
};
