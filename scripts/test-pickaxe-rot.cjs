const THREE = require('three');

// Local pickaxe axes in 2D sprite geometry:
// Handle vector: from pivot (4, 3.5) to head (12, 12) -> dx = 8, dy = 8.5
const vHead = new THREE.Vector3(1, 1, 0).normalize();
// Blade curve vector: perpendicular to handle in XY
const vBlade = new THREE.Vector3(-1, 1, 0).normalize();
// Normal of the 2D plane: +Z
const vNormal = new THREE.Vector3(0, 0, 1);

// We want in hand coordinate space (where +Z is character forward, +X is character right, +Y is character up):
// Target:
// - vHead should point forward (+Z) and slightly downward (-Y): e.g. [0.1, -0.4, 0.9].normalize()
// - vNormal should face outward to the right (+X) or slightly forward: e.g. [1, 0, 0]
// - vBlade should be roughly vertical: [0, 1, 0]

function testEuler(rx, ry, rz) {
  const euler = new THREE.Euler(rx, ry, rz, 'XYZ');
  const h = vHead.clone().applyEuler(euler);
  const b = vBlade.clone().applyEuler(euler);
  const n = vNormal.clone().applyEuler(euler);
  return { h, b, n };
}

// Let's test a candidate:
// 1. Roll Z by -PI/4 (-0.785): aligns vHead to +X
// 2. Yaw Y by -PI/2 (-1.57): brings +X to +Z (forward), and +Z normal to +X (outward)
// 3. Pitch X by -0.35: tilts +Z downward towards -Y
const res = testEuler(-0.35, -1.57, -0.785);
console.log('Candidate 1:', JSON.stringify({
  headForward: res.h.z.toFixed(2),
  headDown: res.h.y.toFixed(2),
  normalRight: res.n.x.toFixed(2)
}));

// What if the blade curve should curve towards the body or away?
console.log('Blade direction:', res.b);
