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
  tiled?: boolean;
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
export const FACE_SHADING = {
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
    tiled = true,
    aoLevels = {},
  } = options;

  const hw = width / 2;
  const hh = height / 2;
  const hd = depth / 2;

  // Resolve texture names for 6 faces:
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

    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(...normal, ...normal, ...normal, ...normal);

    uvs.push(
      uvRect.u0, uvRect.v1,
      uvRect.u1, uvRect.v1,
      uvRect.u0, uvRect.v0,
      uvRect.u1, uvRect.v0
    );

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

    if (ao[0] + ao[3] < ao[1] + ao[2]) {
      indices.push(
        vertexOffset + 0, vertexOffset + 3, vertexOffset + 1,
        vertexOffset + 0, vertexOffset + 2, vertexOffset + 3
      );
    } else {
      indices.push(
        vertexOffset + 0, vertexOffset + 2, vertexOffset + 1,
        vertexOffset + 2, vertexOffset + 3, vertexOffset + 1
      );
    }

    vertexOffset += 4;
  };

  const isMultiBlock = tiled !== false && (width > 1.05 || height > 1.05 || depth > 1.05);

  if (!isMultiBlock) {
    // Single block or sub-block quad per face
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
  } else {
    // Multi-block structure: Strictly subdivide each face into 1x1m voxel tiles!
    // Prevents ALL texture stretching, ensures uniform 16px/m pixel density across all worlds.
    const nx = Math.max(1, Math.round(width));
    const ny = Math.max(1, Math.round(height));
    const nz = Math.max(1, Math.round(depth));

    const dx = width / nx;
    const dy = height / ny;
    const dz = depth / nz;

    const isTopFoliage = topTex.includes('grass') || topTex.includes('leaves');

    // Face 2: Top (+Y)
    for (let ix = 0; ix < nx; ix++) {
      const x0 = -hw + ix * dx;
      const x1 = x0 + dx;
      for (let iz = 0; iz < nz; iz++) {
        const z0 = -hd + iz * dz;
        const z1 = z0 + dz;
        addFace(
          [x0, hh, z0], [x1, hh, z0], [x0, hh, z1], [x1, hh, z1],
          [0, 1, 0],
          topTex,
          FACE_SHADING.top,
          aoLevels.top,
          isTopFoliage
        );
      }
    }

    // Face 3: Bottom (-Y)
    for (let ix = 0; ix < nx; ix++) {
      const x0 = -hw + ix * dx;
      const x1 = x0 + dx;
      for (let iz = 0; iz < nz; iz++) {
        const z0 = -hd + iz * dz;
        const z1 = z0 + dz;
        addFace(
          [x0, -hh, z1], [x1, -hh, z1], [x0, -hh, z0], [x1, -hh, z0],
          [0, -1, 0],
          btmTex,
          FACE_SHADING.bottom,
          aoLevels.bottom
        );
      }
    }

    // Face 4: North (+Z)
    for (let ix = 0; ix < nx; ix++) {
      const x0 = -hw + ix * dx;
      const x1 = x0 + dx;
      for (let iy = 0; iy < ny; iy++) {
        const y0 = -hh + iy * dy;
        const y1 = y0 + dy;
        addFace(
          [x0, y1, hd], [x1, y1, hd], [x0, y0, hd], [x1, y0, hd],
          [0, 0, 1],
          northTex,
          FACE_SHADING.northSouth,
          aoLevels.north
        );
      }
    }

    // Face 5: South (-Z)
    for (let ix = 0; ix < nx; ix++) {
      const x0 = -hw + ix * dx;
      const x1 = x0 + dx;
      for (let iy = 0; iy < ny; iy++) {
        const y0 = -hh + iy * dy;
        const y1 = y0 + dy;
        addFace(
          [x1, y1, -hd], [x0, y1, -hd], [x1, y0, -hd], [x0, y0, -hd],
          [0, 0, -1],
          southTex,
          FACE_SHADING.northSouth,
          aoLevels.south
        );
      }
    }

    // Face 0: East (+X)
    for (let iz = 0; iz < nz; iz++) {
      const z0 = -hd + iz * dz;
      const z1 = z0 + dz;
      for (let iy = 0; iy < ny; iy++) {
        const y0 = -hh + iy * dy;
        const y1 = y0 + dy;
        addFace(
          [hw, y1, z1], [hw, y1, z0], [hw, y0, z1], [hw, y0, z0],
          [1, 0, 0],
          eastTex,
          FACE_SHADING.eastWest,
          aoLevels.east
        );
      }
    }

    // Face 1: West (-X)
    for (let iz = 0; iz < nz; iz++) {
      const z0 = -hd + iz * dz;
      const z1 = z0 + dz;
      for (let iy = 0; iy < ny; iy++) {
        const y0 = -hh + iy * dy;
        const y1 = y0 + dy;
        addFace(
          [-hw, y1, z0], [-hw, y1, z1], [-hw, y0, z0], [-hw, y0, z1],
          [-1, 0, 0],
          westTex,
          FACE_SHADING.eastWest,
          aoLevels.west
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  return geometry;
}

/**
 * Constructs a fully tiled 1x1 integer voxel terrain geometry.
 * Completely eliminates texture stretching across large areas:
 * Every 1x1 block face receives exactly one 16x16 texture tile with baked directional shading.
 */
export function createVoxelTerrainGeometry(
  width: number,
  depth: number,
  textures: BlockFaceTextures | string,
  height = 1,
  biomeTint?: THREE.ColorRepresentation
): THREE.BufferGeometry {
  const wInt = Math.max(1, Math.round(width));
  const dInt = Math.max(1, Math.round(depth));
  const hInt = Math.max(1, Math.round(height));
  const hw = wInt / 2;
  const hd = dInt / 2;

  let topTex = 'grass_block_top';
  let sideTex = 'grass_block_side';
  let btmTex = 'dirt';

  if (typeof textures === 'string') {
    topTex = sideTex = btmTex = textures;
  } else {
    topTex = textures.top || textures.all || 'grass_block_top';
    sideTex = textures.side || textures.north || textures.all || 'grass_block_side';
    btmTex = textures.bottom || textures.all || 'dirt';
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const tintColor = biomeTint ? new THREE.Color(biomeTint) : new THREE.Color(1, 1, 1);
  let vertexOffset = 0;

  const addQuad = (
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number],
    normal: [number, number, number],
    tileName: string,
    baseLight: number,
    applyTint = false
  ) => {
    const uvRect = vanillaAtlas.getTileUV(tileName);

    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(...normal, ...normal, ...normal, ...normal);

    uvs.push(
      uvRect.u0, uvRect.v1,
      uvRect.u1, uvRect.v1,
      uvRect.u0, uvRect.v0,
      uvRect.u1, uvRect.v0
    );

    const faceR = applyTint ? tintColor.r * baseLight : baseLight;
    const faceG = applyTint ? tintColor.g * baseLight : baseLight;
    const faceB = applyTint ? tintColor.b * baseLight : baseLight;

    for (let i = 0; i < 4; i++) {
      colors.push(faceR, faceG, faceB);
    }

    indices.push(
      vertexOffset + 0, vertexOffset + 2, vertexOffset + 1,
      vertexOffset + 2, vertexOffset + 3, vertexOffset + 1
    );

    vertexOffset += 4;
  };

  // 1. Tiled Top Faces at Y = 0 (Every 1x1 block face gets its own 16x16 tile)
  const isTopFoliage = topTex.includes('grass') || topTex.includes('leaves');
  for (let x = -hw; x < hw; x++) {
    for (let z = -hd; z < hd; z++) {
      addQuad(
        [x, 0, z], [x + 1, 0, z], [x, 0, z + 1], [x + 1, 0, z + 1],
        [0, 1, 0],
        topTex,
        FACE_SHADING.top,
        isTopFoliage
      );
    }
  }

  // 2. North/South Perimeter Sides (+Z and -Z) - Subdivided 1x1 per vertical meter!
  for (let y = 0; y < hInt; y++) {
    const yTop = -y;
    const yBtm = -(y + 1);

    for (let x = -hw; x < hw; x++) {
      // North (+Z)
      addQuad(
        [x, yTop, hd], [x + 1, yTop, hd], [x, yBtm, hd], [x + 1, yBtm, hd],
        [0, 0, 1],
        sideTex,
        FACE_SHADING.northSouth
      );
      // South (-Z)
      addQuad(
        [x + 1, yTop, -hd], [x, yTop, -hd], [x + 1, yBtm, -hd], [x, yBtm, -hd],
        [0, 0, -1],
        sideTex,
        FACE_SHADING.northSouth
      );
    }
  }

  // 3. East/West Perimeter Sides (+X and -X) - Subdivided 1x1 per vertical meter!
  for (let y = 0; y < hInt; y++) {
    const yTop = -y;
    const yBtm = -(y + 1);

    for (let z = -hd; z < hd; z++) {
      // East (+X)
      addQuad(
        [hw, yTop, z + 1], [hw, yTop, z], [hw, yBtm, z + 1], [hw, yBtm, z],
        [1, 0, 0],
        sideTex,
        FACE_SHADING.eastWest
      );
      // West (-X)
      addQuad(
        [-hw, yTop, z], [-hw, yTop, z + 1], [-hw, yBtm, z], [-hw, yBtm, z + 1],
        [-1, 0, 0],
        sideTex,
        FACE_SHADING.eastWest
      );
    }
  }

  // 4. Bottom Faces at Y = -hInt
  for (let x = -hw; x < hw; x++) {
    for (let z = -hd; z < hd; z++) {
      addQuad(
        [x, -hInt, z + 1], [x + 1, -hInt, z + 1], [x, -hInt, z], [x + 1, -hInt, z],
        [0, -1, 0],
        btmTex,
        FACE_SHADING.bottom
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  return geometry;
}

/**
 * Exact Vanilla Dirt Path Geometry (15/16 height = 0.9375m)
 * Tiled 1x1 quads with dirt_path_top, dirt_path_side, and dirt bottom
 */
export function createVoxelPathGeometry(width: number, length: number): THREE.BufferGeometry {
  const wInt = Math.max(1, Math.round(width));
  const lInt = Math.max(1, Math.round(length));
  const h = 15 / 16; // 0.9375m canonical height

  return createVoxelTerrainGeometry(wInt, lInt, {
    top: 'dirt_path_top',
    side: 'dirt_path_side',
    bottom: 'dirt'
  }, h);
}

/**
 * Exact Vanilla Slab Geometry (8/16 height = 0.5m)
 */
export function createVoxelSlabGeometry(textures: BlockFaceTextures | string): THREE.BufferGeometry {
  return createVanillaBlockGeometry({
    width: 1,
    height: 8 / 16,
    depth: 1,
    textures
  });
}

/**
 * Exact Vanilla Carpet Geometry (1/16 height = 0.0625m)
 */
export function createVoxelCarpetGeometry(textureName: string): THREE.BufferGeometry {
  return createVanillaBlockGeometry({
    width: 1,
    height: 1 / 16,
    depth: 1,
    textures: textureName
  });
}

/**
 * Crossed Quads Geometry for flowers, saplings, tall grass
 */
export function createCrossedQuadsGeometry(tileName: string, biomeTint?: THREE.ColorRepresentation): THREE.BufferGeometry {
  const uvRect = vanillaAtlas.getTileUV(tileName);
  const tintColor = biomeTint ? new THREE.Color(biomeTint) : new THREE.Color(1, 1, 1);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const addQuad = (
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number]
  ) => {
    const vOffset = positions.length / 3;
    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    uvs.push(
      uvRect.u0, uvRect.v1,
      uvRect.u1, uvRect.v1,
      uvRect.u0, uvRect.v0,
      uvRect.u1, uvRect.v0
    );
    for (let i = 0; i < 4; i++) {
      colors.push(tintColor.r, tintColor.g, tintColor.b);
    }
    // Double sided indices
    indices.push(
      vOffset + 0, vOffset + 2, vOffset + 1,
      vOffset + 1, vOffset + 2, vOffset + 3,
      vOffset + 1, vOffset + 2, vOffset + 0,
      vOffset + 3, vOffset + 2, vOffset + 1
    );
  };

  // Diagonal Quad 1 (-0.5, -0.5) to (+0.5, +0.5)
  addQuad([-0.4, 0.9, -0.4], [0.4, 0.9, 0.4], [-0.4, 0, -0.4], [0.4, 0, 0.4]);

  // Diagonal Quad 2 (-0.4, +0.4) to (+0.4, -0.4)
  addQuad([-0.4, 0.9, 0.4], [0.4, 0.9, -0.4], [-0.4, 0, 0.4], [0.4, 0, -0.4]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);

  return geo;
}
