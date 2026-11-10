import * as THREE from 'three';
import { textureManager } from './TextureManager';

/**
 * Creates custom BufferGeometry for complex multi-part vanilla Minecraft blocks
 * (Lanterns, Torches, Campfires, Chains) matching exact Mojang block JSON specifications.
 */

// Helper to append a cuboid with face-specific UVs into geometry buffers
export function addBoxFaceUV(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  min: [number, number, number],
  max: [number, number, number],
  faceUVs: {
    north: [number, number, number, number]; // [u0, v0, u1, v1] in 0-1 range
    south: [number, number, number, number];
    east: [number, number, number, number];
    west: [number, number, number, number];
    up: [number, number, number, number];
    down: [number, number, number, number];
  }
) {
  const [x0, y0, z0] = min;
  const [x1, y1, z1] = max;

  const addQuad = (
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number],
    n: [number, number, number],
    uvRect: [number, number, number, number]
  ) => {
    const vOffset = positions.length / 3;
    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(...n, ...n, ...n, ...n);
    const [u0, v0_c, u1, v1_c] = uvRect;
    // Top-left, top-right, bottom-left, bottom-right
    uvs.push(
      u0, 1 - v0_c,
      u1, 1 - v0_c,
      u0, 1 - v1_c,
      u1, 1 - v1_c
    );
    indices.push(
      vOffset + 0, vOffset + 2, vOffset + 1,
      vOffset + 2, vOffset + 3, vOffset + 1
    );
  };

  // Up (+Y)
  addQuad([x0, y1, z0], [x1, y1, z0], [x0, y1, z1], [x1, y1, z1], [0, 1, 0], faceUVs.up);
  // Down (-Y)
  addQuad([x0, y0, z1], [x1, y0, z1], [x0, y0, z0], [x1, y0, z0], [0, -1, 0], faceUVs.down);
  // North (+Z)
  addQuad([x0, y1, z1], [x1, y1, z1], [x0, y0, z1], [x1, y0, z1], [0, 0, 1], faceUVs.north);
  // South (-Z)
  addQuad([x1, y1, z0], [x0, y1, z0], [x1, y0, z0], [x0, y0, z0], [0, 0, -1], faceUVs.south);
  // East (+X)
  addQuad([x1, y1, z1], [x1, y1, z0], [x1, y0, z1], [x1, y0, z0], [1, 0, 0], faceUVs.east);
  // West (-X)
  addQuad([x0, y1, z0], [x0, y1, z1], [x0, y0, z0], [x0, y0, z1], [-1, 0, 0], faceUVs.west);
}

/**
 * Builds canonical Mojang Minecraft Lantern Geometry (template_lantern.json)
 * Exactly scaled to 16px grid:
 * - Base Cage: 6x7x6 px [5, 0, 5] to [11, 7, 11]
 * - Top Cap: 4x2x4 px [6, 7, 6] to [10, 9, 10]
 * - Hanging Ring: [6.5, 9, 8] to [9.5, 11, 8] rotated 45 deg
 * Grounded at Y=0 (or hanging from ceiling)
 */
export function createMojangLanternGeometry(hanging = false): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const s = 1 / 16;
  const yShift = hanging ? 1 * s : 0;

  // Convert 16px UV coords to 0-1
  const uv16 = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => {
    return [x0 / 16, y0 / 16, x1 / 16, y1 / 16];
  };

  // Element 1: Lantern Main Cage (6x7x6 px)
  addBoxFaceUV(
    positions, normals, uvs, indices,
    [-3 * s, 0 + yShift, -3 * s],
    [3 * s, 7 * s + yShift, 3 * s],
    {
      north: uv16(0, 2, 6, 9),
      south: uv16(0, 2, 6, 9),
      east: uv16(0, 2, 6, 9),
      west: uv16(0, 2, 6, 9),
      up: uv16(0, 9, 6, 15),
      down: uv16(0, 9, 6, 15),
    }
  );

  // Element 2: Lantern Top Cap (4x2x4 px)
  addBoxFaceUV(
    positions, normals, uvs, indices,
    [-2 * s, 7 * s + yShift, -2 * s],
    [2 * s, 9 * s + yShift, 2 * s],
    {
      north: uv16(1, 0, 5, 2),
      south: uv16(1, 0, 5, 2),
      east: uv16(1, 0, 5, 2),
      west: uv16(1, 0, 5, 2),
      up: uv16(1, 10, 5, 14),
      down: uv16(1, 10, 5, 14),
    }
  );

  // Element 3 & 4: Top Iron Loop Handle (Crossed diagonal quads)
  const addDiagQuad = (
    minX: number, minY: number, minZ: number,
    maxX: number, maxY: number, maxZ: number,
    uvRect: [number, number, number, number]
  ) => {
    const vOffset = positions.length / 3;
    positions.push(
      minX, maxY, minZ,
      maxX, maxY, maxZ,
      minX, minY, minZ,
      maxX, minY, maxZ
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    const [u0, v0_c, u1, v1_c] = uvRect;
    uvs.push(
      u0, 1 - v0_c,
      u1, 1 - v0_c,
      u0, 1 - v1_c,
      u1, 1 - v1_c
    );
    // Double-sided
    indices.push(
      vOffset + 0, vOffset + 2, vOffset + 1,
      vOffset + 2, vOffset + 3, vOffset + 1,
      vOffset + 1, vOffset + 2, vOffset + 0,
      vOffset + 3, vOffset + 2, vOffset + 1
    );
  };

  const ringBottom = (hanging ? 10 : 9) * s;
  const ringTop = ringBottom + (hanging ? 5 * s : 2 * s);
  addDiagQuad(-1.5 * s, ringBottom, -1.5 * s, 1.5 * s, ringTop, 1.5 * s, uv16(11, 1, 14, 3));
  addDiagQuad(-1.5 * s, ringBottom, 1.5 * s, 1.5 * s, ringTop, -1.5 * s, uv16(11, 10, 14, 12));

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/**
 * Builds canonical Mojang Minecraft Torch Geometry (template_torch.json)
 * - Wooden stick: 2x10x2 px from [7, 0, 7] to [9, 10, 9] (0.125 x 0.625 x 0.125m)
 * - Grounded at Y=0
 */
export function createMojangTorchGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const s = 1 / 16;
  const uv16 = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => {
    return [x0 / 16, y0 / 16, x1 / 16, y1 / 16];
  };

  addBoxFaceUV(
    positions, normals, uvs, indices,
    [-1 * s, 0, -1 * s],
    [1 * s, 10 * s, 1 * s],
    {
      north: uv16(7, 6, 9, 16),
      south: uv16(7, 6, 9, 16),
      east: uv16(7, 6, 9, 16),
      west: uv16(7, 6, 9, 16),
      up: uv16(7, 6, 9, 8),
      down: uv16(7, 13, 9, 15),
    }
  );

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/**
 * Builds canonical Wall Torch Geometry with -22.5 deg tilt and wall mount base
 */
export function createMojangWallTorchGeometry(): THREE.BufferGeometry {
  const baseTorch = createMojangTorchGeometry();
  baseTorch.rotateZ(-22.5 * (Math.PI / 180));
  baseTorch.translate(0.12, 0.1, 0);
  return baseTorch;
}

/**
 * Builds canonical Minecraft Iron Chain link (3x16 px crossed quads)
 */
export function createMojangChainGeometry(lengthMeters = 0.5): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const hw = 0.09375; // 3/16 / 2
  const addQuad = (
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number]
  ) => {
    const vOffset = positions.length / 3;
    positions.push(...v0, ...v1, ...v2, ...v3);
    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
    uvs.push(0, 1, 1, 1, 0, 0, 1, 0);
    indices.push(
      vOffset + 0, vOffset + 2, vOffset + 1,
      vOffset + 2, vOffset + 3, vOffset + 1,
      vOffset + 1, vOffset + 2, vOffset + 0,
      vOffset + 3, vOffset + 2, vOffset + 1
    );
  };

  // Quad 1: along X axis
  addQuad([-hw, lengthMeters, 0], [hw, lengthMeters, 0], [-hw, 0, 0], [hw, 0, 0]);
  // Quad 2: along Z axis
  addQuad([0, lengthMeters, -hw], [0, lengthMeters, hw], [0, 0, -hw], [0, 0, hw]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}
