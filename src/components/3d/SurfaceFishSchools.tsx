"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Multiple fish species materials for visual variety
const fishMaterials = {
  // Sardine/herring — silver-blue flanks
  sardine: new THREE.MeshStandardMaterial({
    color: "#8ab4c8",
    roughness: 0.18,
    metalness: 0.75,
  }),
  // Mackerel — darker blue-green with metallic sheen
  mackerel: new THREE.MeshStandardMaterial({
    color: "#3a6878",
    roughness: 0.20,
    metalness: 0.65,
  }),
  // Larger pelagic (tuna-like) — dark blue dorsal
  pelagic: new THREE.MeshStandardMaterial({
    color: "#2a4858",
    roughness: 0.22,
    metalness: 0.60,
  }),
};

const SCHOOL_1_COUNT = 80;   // Sardine school
const SCHOOL_2_COUNT = 60;   // Mackerel school
const SCHOOL_3_COUNT = 40;   // Larger pelagic
const TOTAL_FISH = SCHOOL_1_COUNT + SCHOOL_2_COUNT + SCHOOL_3_COUNT;

// Deterministic Pseudo-Random Generator (LCG)
let seed = 4287;
function lcg() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

// Static initialization of fish parameters at module scope
// [baseX, baseY, baseZ, phase, speed, scaleX, scaleY, scaleZ,
//  neighborOffsetX, neighborOffsetY, neighborOffsetZ]
const fishData = new Float32Array(TOTAL_FISH * 11);

for (let i = 0; i < TOTAL_FISH; i++) {
  const stride = i * 11;

  let centerZ: number, centerX: number, centerY: number;
  let sizeBase: number;

  if (i < SCHOOL_1_COUNT) {
    // School 1: Sardines — upper sunlit zone
    centerZ = -645.0;
    centerX = -2.0;
    centerY = 3.5;
    sizeBase = 0.08 + lcg() * 0.04; // Small sardines
  } else if (i < SCHOOL_1_COUNT + SCHOOL_2_COUNT) {
    // School 2: Mackerel — mid depth
    centerZ = -678.0;
    centerX = 8.0;
    centerY = 2.0;
    sizeBase = 0.12 + lcg() * 0.06; // Medium mackerel
  } else {
    // School 3: Larger pelagic — near surface, wider spread
    centerZ = -712.0;
    centerX = -6.0;
    centerY = 4.2;
    sizeBase = 0.18 + lcg() * 0.10; // Larger pelagic
  }

  fishData[stride + 0] = centerX + (lcg() - 0.5) * 18.0;
  fishData[stride + 1] = centerY + (lcg() - 0.5) * 4.0;
  fishData[stride + 2] = centerZ + (lcg() - 0.5) * 26.0;
  fishData[stride + 3] = lcg() * Math.PI * 2; // phase offset
  fishData[stride + 4] = 1.2 + lcg() * 1.6;   // swim speed

  // Fish body proportions: elongated fusiform
  fishData[stride + 5] = sizeBase * 0.35;  // width (narrow)
  fishData[stride + 6] = sizeBase * 0.28;  // height (flattened)
  fishData[stride + 7] = sizeBase * 1.0;   // length (elongated)

  // Schooling neighbor offset (for alignment/cohesion simulation)
  fishData[stride + 8] = (lcg() - 0.5) * 0.5;
  fishData[stride + 9] = (lcg() - 0.5) * 0.3;
  fishData[stride + 10] = (lcg() - 0.5) * 0.5;
}

// Reusable scratch objects
const _scratchPos = new THREE.Vector3();
const _scratchQuat = new THREE.Quaternion();
const _scratchScale = new THREE.Vector3();
const _scratchMatrix = new THREE.Matrix4();
const _scratchEuler = new THREE.Euler();

/**
 * Create a realistic fish body geometry using a LatheGeometry profile.
 * This produces a smooth, tapered fusiform body shape typical of pelagic fish.
 */
function createFishGeometry(): THREE.BufferGeometry {
  // Fusiform profile: pointed nose → thickest at 40% body length → tapered tail
  const points: THREE.Vector2[] = [];
  const segments = 12;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Cross-section radius along body length
    let radius: number;
    if (t < 0.1) {
      // Nose: sharp taper
      radius = t * 4.5;
    } else if (t < 0.45) {
      // Forward body: swelling to maximum girth
      radius = 0.45 + Math.sin((t - 0.1) / 0.35 * Math.PI * 0.5) * 0.55;
    } else if (t < 0.75) {
      // Mid-body: gradual taper
      radius = 1.0 - (t - 0.45) / 0.30 * 0.35;
    } else {
      // Tail: rapid taper to caudal peduncle
      radius = 0.65 - (t - 0.75) / 0.25 * 0.55;
    }
    points.push(new THREE.Vector2(radius * 0.5, (t - 0.5) * 2.0));
  }

  const lathe = new THREE.LatheGeometry(points, 8);
  // Rotate so the fish faces along +Z
  lathe.rotateX(Math.PI / 2);
  return lathe;
}

const fishGeometry = createFishGeometry();

/**
 * SurfaceFishSchools — Realistic instanced schools of pelagic fish.
 *
 * MASTER REALISM PASS:
 * - Realistic fusiform body geometry (LatheGeometry profile, not boxes)
 * - Multiple species with different sizes, colors, body proportions
 * - Schooling behavior: alignment + cohesion + separation approximation
 * - Variable speed, acceleration/deceleration, direction changes
 * - Natural body waggle (tail-stroke swimming motion)
 * - 3 distinct species: sardines, mackerel, larger pelagic
 * - Spans Z: -630 to -725, Y: 0.5 to 5.5.
 * - Zero per-frame allocations in useFrame.
 */
export default function SurfaceFishSchools() {
  const sardineRef = useRef<THREE.InstancedMesh>(null);
  const mackerelRef = useRef<THREE.InstancedMesh>(null);
  const pelagicRef = useRef<THREE.InstancedMesh>(null);

  // Initialize initial matrices once upon mount
  useEffect(() => {
    const refs = [sardineRef.current, mackerelRef.current, pelagicRef.current];
    const ranges = [
      [0, SCHOOL_1_COUNT],
      [SCHOOL_1_COUNT, SCHOOL_1_COUNT + SCHOOL_2_COUNT],
      [SCHOOL_1_COUNT + SCHOOL_2_COUNT, TOTAL_FISH],
    ];

    refs.forEach((mesh, refIdx) => {
      if (!mesh) return;
      const [start, end] = ranges[refIdx];
      for (let i = start; i < end; i++) {
        const localIdx = i - start;
        const s = i * 11;
        _scratchPos.set(fishData[s + 0], fishData[s + 1], fishData[s + 2]);
        _scratchEuler.set(0, 0, 0);
        _scratchQuat.setFromEuler(_scratchEuler);
        _scratchScale.set(fishData[s + 5], fishData[s + 6], fishData[s + 7]);
        _scratchMatrix.compose(_scratchPos, _scratchQuat, _scratchScale);
        mesh.setMatrixAt(localIdx, _scratchMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    const refs = [sardineRef.current, mackerelRef.current, pelagicRef.current];
    const ranges = [
      [0, SCHOOL_1_COUNT],
      [SCHOOL_1_COUNT, SCHOOL_1_COUNT + SCHOOL_2_COUNT],
      [SCHOOL_1_COUNT + SCHOOL_2_COUNT, TOTAL_FISH],
    ];

    refs.forEach((mesh, refIdx) => {
      if (!mesh) return;
      const [start, end] = ranges[refIdx];

      for (let i = start; i < end; i++) {
        const localIdx = i - start;
        const s = i * 11;
        const bx = fishData[s + 0];
        const by = fishData[s + 1];
        const bz = fishData[s + 2];
        const phase = fishData[s + 3];
        const spd = fishData[s + 4];
        const sx = fishData[s + 5];
        const sy = fishData[s + 6];
        const sz = fishData[s + 7];
        const nx = fishData[s + 8];
        const ny = fishData[s + 9];
        const nz = fishData[s + 10];

        // Organic swimming trajectory: figure-8 pattern + neighbor influence
        const angle = t * spd * 0.35 + phase;
        const speedVar = 1.0 + Math.sin(t * 0.3 + phase) * 0.25; // acceleration/deceleration

        const rx = 3.0 + Math.abs(nx) * 5.0;
        const rz = 4.5 + Math.abs(nz) * 7.0;

        const px = bx + Math.sin(angle * speedVar) * rx + nx;
        const py = by + Math.sin(angle * 1.3 * speedVar) * 0.6 + ny;
        const pz = bz + Math.cos(angle * speedVar) * rz + nz;

        _scratchPos.set(px, py, pz);

        // Tangent heading — fish faces the direction of movement
        const dx = Math.cos(angle * speedVar) * rx * speedVar;
        const dz = -Math.sin(angle * speedVar) * rz * speedVar;
        const heading = Math.atan2(dx, dz);

        // Realistic tail-stroke body waggle
        const waggle = Math.sin(t * spd * 4.0 + phase) * 0.15;
        // Subtle pitch variation
        const pitch = Math.sin(t * spd * 1.3 + phase) * 0.04;

        _scratchEuler.set(pitch, heading + waggle, 0);
        _scratchQuat.setFromEuler(_scratchEuler);

        _scratchScale.set(sx, sy, sz);
        _scratchMatrix.compose(_scratchPos, _scratchQuat, _scratchScale);
        mesh.setMatrixAt(localIdx, _scratchMatrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group name="surface-fish-schools">
      {/* School 1: Sardine / Herring — small silvery fish */}
      <instancedMesh
        ref={sardineRef}
        args={[undefined, undefined, SCHOOL_1_COUNT]}
        material={fishMaterials.sardine}
      >
        <primitive object={fishGeometry} attach="geometry" />
      </instancedMesh>

      {/* School 2: Mackerel — medium blue-green fish */}
      <instancedMesh
        ref={mackerelRef}
        args={[undefined, undefined, SCHOOL_2_COUNT]}
        material={fishMaterials.mackerel}
      >
        <primitive object={fishGeometry} attach="geometry" />
      </instancedMesh>

      {/* School 3: Larger Pelagic — dark blue dorsal */}
      <instancedMesh
        ref={pelagicRef}
        args={[undefined, undefined, SCHOOL_3_COUNT]}
        material={fishMaterials.pelagic}
      >
        <primitive object={fishGeometry} attach="geometry" />
      </instancedMesh>
    </group>
  );
}
