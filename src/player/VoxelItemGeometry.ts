import * as THREE from 'three';
import { VoxelPixel, DIAMOND_PICKAXE_VOXELS, SOUL_TORCH_VOXELS } from './VoxelItemData';

/**
 * Builds an authentic extruded 3D Voxel item geometry from 16x16 pixel data.
 * Matches vanilla Minecraft third-person held item extrusion.
 */
export function create3DVoxelItemGeometry(
  voxels: VoxelPixel[],
  pivotX: number,
  pivotY: number,
  voxelSize = 0.42,
  depth = 0.38
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];

  const halfSize = voxelSize / 2;
  const halfDepth = depth / 2;

  // Cube face templates (2 triangles per face)
  const addFace = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    nx: number,
    ny: number,
    nz: number,
    r: number,
    g: number,
    b: number
  ) => {
    // Triangle 1: p0 -> p1 -> p2
    positions.push(...p0, ...p1, ...p2);
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    colors.push(r, g, b, r, g, b, r, g, b);

    // Triangle 2: p0 -> p2 -> p3
    positions.push(...p0, ...p2, ...p3);
    normals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
    colors.push(r, g, b, r, g, b, r, g, b);
  };

  for (const v of voxels) {
    const cx = (v.x - pivotX) * voxelSize;
    const cy = (v.y - pivotY) * voxelSize;
    const cz = 0;

    const x0 = cx - halfSize, x1 = cx + halfSize;
    const y0 = cy - halfSize, y1 = cy + halfSize;
    const z0 = cz - halfDepth, z1 = cz + halfDepth;

    const r = v.r, g = v.g, b = v.b;

    // Subtle face shading: top is bright (+10%), bottom is darker (-20%), sides neutral
    const topR = Math.min(1, r * 1.08), topG = Math.min(1, g * 1.08), topB = Math.min(1, b * 1.08);
    const botR = r * 0.75, botG = g * 0.75, botB = b * 0.75;
    const sideR = r * 0.9, sideG = g * 0.9, sideB = b * 0.9;

    // Front (+Z)
    addFace([x0, y1, z1], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], 0, 0, 1, r, g, b);
    // Back (-Z)
    addFace([x1, y1, z0], [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], 0, 0, -1, r, g, b);
    // Top (+Y)
    addFace([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], 0, 1, 0, topR, topG, topB);
    // Bottom (-Y)
    addFace([x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], 0, -1, 0, botR, botG, botB);
    // Right (+X)
    addFace([x1, y1, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], 1, 0, 0, sideR, sideG, sideB);
    // Left (-X)
    addFace([x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], -1, 0, 0, sideR, sideG, sideB);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geom;
}
