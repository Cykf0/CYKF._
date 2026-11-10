import * as THREE from 'three';
import { vanillaAtlas, TileUV } from './VanillaTextureAtlas';

export interface BlockFaceTextures {
  top?: string;
  bottom?: string;
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  all?: string;
  side?: string;
}

export interface BlockGeometryOptions {
  width?: number;
  height?: number;
  depth?: number;
  textures: BlockFaceTextures | string;
  biomeTint?: THREE.ColorRepresentation;
  aoLevels?: {
    top?: [number, number, number, number];
    bottom?: [number, number, number, number];
    north?: [number, number, number, number];
    south?: [number, number, number, number];
    east?: [number, number, number, number];
    west?: [number, number, number, number];
  };
}

// Classic Minecraft 4-level AO factors
const AO_FACTORS = [0.46, 0.65, 0.80, 1.00];

// Vanilla Directional Face Shading constants
const FACE_SHADING = {
  top: 1.0,
  northSouth: 0.8,
  eastWest: 0.6,
  bottom: 0.5,
};

/**
 * Creates a Minecraft block geometry with directional face shading,
 * per-vertex AO, biome tinting, and atlas UV mapping with zero bleeding.
 */
export function createVanillaBlockGeometry(options: BlockGeometryOptions): THREE.BufferGeometry {
  const {
    width = 1,
    height = 1,
    depth = 1,
    textures,
    biomeTint,
    aoLevels = {},
  } = options;

  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  // Resolve texture names for 6 faces:
  // Face 0: East (+X)
  // Face 1: West (-X)
  // Face 2: Top (+Y)
  // Face 3: Bottom (-Y)
  // Face 4: North (+Z)
  // Face 5: South (-Z)
  let eastTex = 'stone';
  let westTex = 'stone';
  let topTex = 'stone';
  let btmTex = 'stone';
  let northTex = 'stone';
  let southTex = 'stone';

  if (typeof textures === 'string') {
    eastTex = westTex = topTex = btmTex = northTex = southTex = textures;
  } else {
    const all = textures.all || 'stone';
    const side = textures.side || all;
    eastTex = textures.east || side;
    westTex = textures.west || side;
    northTex = textures.north || side;
    southTex = textures.south || side;
    topTex = textures.top || all;
    btmTex = textures.bottom || all;
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const tintColor = biomeTint ? new THREE.Color(biomeTint) : new THREE.Color(1, 1, 1);

  // Helper to append a quad face with directional shading and AO
  let vertexOffset = 0;
  const addFace = (
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number],
    normal: [number, number, number],
    tileName: string,
    baseLight: number,
    ao: [number, number, number, number] = [3, 3, 3, 3],
    applyTint = false
  ) => {
    const uvRect: TileUV = vanillaAtlas.getTileUV(tileName);

    // Quad vertices:
    // v0: top-left, v1: top-right, v2: bottom-left, v3: bottom-right
    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(
      ...normal,
      ...normal,
      ...normal,
      ...normal
    );

    // Atlas UVs (u0, v1 for top-left; u1, v1 for top-right, etc.)
    uvs.push(
      uvRect.u0, uvRect.v1,
      uvRect.u1, uvRect.v1,
      uvRect.u0, uvRect.v0,
      uvRect.u1, uvRect.v0
    );

    // Calculate vertex colors = baseLight * aoFactor * (applyTint ? tint : 1)
    const faceLightR = applyTint ? tintColor.r * baseLight : baseLight;
    const faceLightG = applyTint ? tintColor.g * baseLight : baseLight;
    const faceLightB = applyTint ? tintColor.b * baseLight : baseLight;

    for (let i = 0; i < 4; i++) {
      const aoFactor = AO_FACTORS[Math.min(3, Math.max(0, ao[i]))];
      colors.push(
        faceLightR * aoFactor,
        faceLightG * aoFactor,
        faceLightB * aoFactor
      );
    }

    // Classic Minecraft quad flip: if ao[0] + ao[3] < ao[1] + ao[2], flip diagonal split
    if (ao[0] + ao[3] < ao[1] + ao[2]) {
      indices.push(
        vertexOffset + 1, vertexOffset + 2, vertexOffset + 3,
        vertexOffset + 0, vertexOffset + 2, vertexOffset + 1
      );
    } else {
      indices.push(
        vertexOffset + 0, vertexOffset + 2, vertexOffset + 1,
        vertexOffset + 1, vertexOffset + 2, vertexOffset + 3
      );
    }

    vertexOffset += 4;
  };

  // Face 0: East (+X)
  addFace(
    [hw, hh, hd], [hw, hh, -hd], [hw, -hh, hd], [hw, -hh, -hd],
    [1, 0, 0],
    eastTex,
    FACE_SHADING.eastWest,
    aoLevels.east
  );

  // Face 1: West (-X)
  addFace(
    [-hw, hh, -hd], [-hw, hh, hd], [-hw, -hh, -hd], [-hw, -hh, hd],
    [-1, 0, 0],
    westTex,
    FACE_SHADING.eastWest,
    aoLevels.west
  );

  // Face 2: Top (+Y)
  addFace(
    [-hw, hh, -hd], [hw, hh, -hd], [-hw, hh, hd], [hw, hh, hd],
    [0, 1, 0],
    topTex,
    FACE_SHADING.top,
    aoLevels.top,
    topTex.includes('grass') || topTex.includes('leaves')
  );

  // Face 3: Bottom (-Y)
  addFace(
    [-hw, -hh, hd], [hw, -hh, hd], [-hw, -hh, -hd], [hw, -hh, -hd],
    [0, -1, 0],
    btmTex,
    FACE_SHADING.bottom,
    aoLevels.bottom
  );

  // Face 4: North (+Z)
  addFace(
    [-hw, hh, hd], [hw, hh, hd], [-hw, -hh, hd], [hw, -hh, hd],
    [0, 0, 1],
    northTex,
    FACE_SHADING.northSouth,
    aoLevels.north
  );

  // Face 5: South (-Z)
  addFace(
    [hw, hh, -hd], [-hw, hh, -hd], [hw, -hh, -hd], [-hw, -hh, -hd],
    [0, 0, -1],
    southTex,
    FACE_SHADING.northSouth,
    aoLevels.south
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  return geometry;
}
