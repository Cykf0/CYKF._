import React from 'react';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  ChromaticAberration,
  HueSaturation,
  SMAA,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '../../store';

interface PostConfig {
  bloomIntensity: number;
  bloomThreshold: number;
  dofEnabled: boolean;
  dofTarget: number;
  dofFocalLength: number;
  dofBokehScale: number;
  vignetteDarkness: number;
  vignetteOffset: number;
  hue: number;
  saturation: number;
  chromaticAberration: number;
}

const SCENE_POST_PRESETS: PostConfig[] = [
  // Scene 1: Sunrise Village (Golden Hour)
  {
    bloomIntensity: 0.8,
    bloomThreshold: 0.82,
    dofEnabled: false,
    dofTarget: 6.0,
    dofFocalLength: 0.05,
    dofBokehScale: 1.5,
    vignetteDarkness: 0.45,
    vignetteOffset: 0.4,
    hue: 0.04,
    saturation: 0.12,
    chromaticAberration: 0.0006,
  },
  // Scene 2: Profile (Rose Sunset Spruce Shoreline Reference Match)
  {
    bloomIntensity: 1.6,
    bloomThreshold: 0.72,
    dofEnabled: false,
    dofTarget: 5.5,
    dofFocalLength: 0.08,
    dofBokehScale: 2.2,
    vignetteDarkness: 0.42,
    vignetteOffset: 0.38,
    hue: -0.04,
    saturation: 0.22,
    chromaticAberration: 0.0009,
  },
  // Scene 3: Stronghold Library (Mystic Purple / Arcane)
  {
    bloomIntensity: 1.8,
    bloomThreshold: 0.75,
    dofEnabled: false,
    dofTarget: 5.0,
    dofFocalLength: 0.06,
    dofBokehScale: 1.8,
    vignetteDarkness: 0.65,
    vignetteOffset: 0.3,
    hue: -0.1,
    saturation: 0.2,
    chromaticAberration: 0.001,
  },
  // Scene 4: Mineshaft (High Contrast Torchlit)
  {
    bloomIntensity: 1.4,
    bloomThreshold: 0.8,
    dofEnabled: false,
    dofTarget: 5.2,
    dofFocalLength: 0.05,
    dofBokehScale: 1.5,
    vignetteDarkness: 0.75,
    vignetteOffset: 0.25,
    hue: 0.02,
    saturation: 0.1,
    chromaticAberration: 0.001,
  },
  // Scene 5: Snowy Peaks (Crisp Alpine Sunset)
  {
    bloomIntensity: 1.1,
    bloomThreshold: 0.85,
    dofEnabled: false,
    dofTarget: 6.0,
    dofFocalLength: 0.05,
    dofBokehScale: 1.5,
    vignetteDarkness: 0.4,
    vignetteOffset: 0.4,
    hue: 0.02,
    saturation: 0.18,
    chromaticAberration: 0.0006,
  },
  // Scene 6: Deep Dark (Heavy Oppressive Cyan Glow)
  {
    bloomIntensity: 2.2,
    bloomThreshold: 0.68,
    dofEnabled: false,
    dofTarget: 5.5,
    dofFocalLength: 0.06,
    dofBokehScale: 2.0,
    vignetteDarkness: 0.85,
    vignetteOffset: 0.2,
    hue: 0.0,
    saturation: 0.25,
    chromaticAberration: 0.0015,
  },
  // Scene 7: Village Interior (Cozy Warm Sunlight)
  {
    bloomIntensity: 1.0,
    bloomThreshold: 0.82,
    dofEnabled: false,
    dofTarget: 4.8,
    dofFocalLength: 0.05,
    dofBokehScale: 1.5,
    vignetteDarkness: 0.5,
    vignetteOffset: 0.35,
    hue: 0.05,
    saturation: 0.15,
    chromaticAberration: 0.0007,
  },
  // Scene 8: Lush Caves (Humid Green-Teal Cavern)
  {
    bloomIntensity: 1.6,
    bloomThreshold: 0.75,
    dofEnabled: false,
    dofTarget: 5.2,
    dofFocalLength: 0.05,
    dofBokehScale: 1.8,
    vignetteDarkness: 0.6,
    vignetteOffset: 0.3,
    hue: -0.02,
    saturation: 0.2,
    chromaticAberration: 0.001,
  },
  // Scene 9: The End (Otherworldly Cosmic Void)
  {
    bloomIntensity: 2.5,
    bloomThreshold: 0.7,
    dofEnabled: false,
    dofTarget: 6.0,
    dofFocalLength: 0.05,
    dofBokehScale: 1.8,
    vignetteDarkness: 0.8,
    vignetteOffset: 0.25,
    hue: -0.15,
    saturation: 0.3,
    chromaticAberration: 0.0018,
  },
];

export const PostProcessingPipeline: React.FC = () => {
  const currentScene = useStore((s) => s.currentScene);
  const quality = useStore((s) => s.quality);

  if (quality === 'low') {
    return null;
  }

  const preset = SCENE_POST_PRESETS[currentScene] || SCENE_POST_PRESETS[0];

  if (quality === 'high') {
    if (preset.dofEnabled) {
      return (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={preset.bloomIntensity}
            luminanceThreshold={preset.bloomThreshold}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <DepthOfField
            focusDistance={0.02}
            focalLength={preset.dofFocalLength}
            bokehScale={preset.dofBokehScale}
            height={480}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(preset.chromaticAberration, preset.chromaticAberration)}
            radialModulation={true}
            modulationOffset={0.5}
          />
          <HueSaturation hue={preset.hue} saturation={preset.saturation} />
          <Vignette darkness={preset.vignetteDarkness} offset={preset.vignetteOffset} />
          <SMAA />
        </EffectComposer>
      );
    }

    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={preset.bloomIntensity}
          luminanceThreshold={preset.bloomThreshold}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(preset.chromaticAberration, preset.chromaticAberration)}
          radialModulation={true}
          modulationOffset={0.5}
        />
        <HueSaturation hue={preset.hue} saturation={preset.saturation} />
        <Vignette darkness={preset.vignetteDarkness} offset={preset.vignetteOffset} />
        <SMAA />
      </EffectComposer>
    );
  }

  // Medium Quality (Bloom + Color Grading + Vignette)
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={preset.bloomIntensity * 0.8}
        luminanceThreshold={preset.bloomThreshold}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <HueSaturation hue={preset.hue} saturation={preset.saturation} />
      <Vignette darkness={preset.vignetteDarkness} offset={preset.vignetteOffset} />
    </EffectComposer>
  );
};
