import * as THREE from 'three';

/**
 * Builds a Three.js mesh group from procedural duct-geometry parameters
 * (the `meta` blob on a Product3DAsset). Supports the seeded shapes:
 * rectangular / round straights, elbows, and a generic fallback box.
 */
export function buildDuctMesh(meta: Record<string, unknown> | null | undefined): THREE.Object3D {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xb0b8c0,
    metalness: 0.85,
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  const shape = (meta?.['shape'] as string) ?? 'rectangular';
  const num = (k: string, d: number) => (typeof meta?.[k] === 'number' ? (meta[k] as number) : d);

  if (shape === 'round') {
    const r = num('diameter', 14) / 2;
    const len = num('length', 60);
    const geo = new THREE.CylinderGeometry(r, r, len, 48, 1, true);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.z = Math.PI / 2;
    group.add(mesh);
  } else if (shape === 'elbow') {
    const w = num('width', 24);
    const h = num('height', 12);
    const radius = Math.max(w, h);
    const tube = Math.min(w, h) / 2;
    const geo = new THREE.TorusGeometry(radius, tube, 24, 48, Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);
  } else {
    // rectangular straight (default)
    const w = num('width', 24);
    const h = num('height', 12);
    const len = num('length', 60);
    const geo = new THREE.BoxGeometry(len, h, w);
    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);
    // wireframe edges for a fabricated-sheet-metal look
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x37474f }),
    );
    group.add(edges);
  }

  // Center + scale the group to a comfortable viewport size.
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);
  return group;
}
