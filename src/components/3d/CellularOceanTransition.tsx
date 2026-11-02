"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

// Shared materials for zero-allocation rendering
const transitionMaterials = {
  poreRing: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    emissive: "#004d40",
    emissiveIntensity: 0.8,
    roughness: 0.35,
    metalness: 0.2,
  }),
  dissolvingLattice: new THREE.MeshStandardMaterial({
    color: "#007799",
    emissive: "#003344",
    emissiveIntensity: 0.6,
    roughness: 0.4,
    transparent: true,
    opacity: 0.75,
  }),
  vesicle: new THREE.MeshStandardMaterial({
    color: "#00bcd4",
    emissive: "#006064",
    emissiveIntensity: 0.7,
    roughness: 0.3,
    transparent: true,
    opacity: 0.8,
  }),
  aqueousFilament: new THREE.LineBasicMaterial({
    color: "#00838f",
    transparent: true,
    opacity: 0.65,
  }),
};

// Reusable scratch objects
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();
const _quat = new THREE.Quaternion();

/**
 * CellularOceanTransition — Biological scale expansion into the aquatic realm.
 *
 * Traversed between progress 134 and 146 along Z: -355 to -395.
 * The user emerges from the distal cell membrane pore as macromolecules
 * dissolve into fluid aqueous density, culminating in the vast deep ocean.
 */
export default function CellularOceanTransition() {
  const groupRef = useRef<THREE.Group>(null);
  const poreRingRef = useRef<THREE.Mesh>(null);
  const vesiclesInstRef = useRef<THREE.InstancedMesh>(null);

  // Pre-generate dissolving vesicle instances (48 particles)
  const vesicleData = useMemo(() => {
    const list: { basePos: [number, number, number]; scale: number; speed: number }[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const angle = u * Math.PI * 4 + i;
      const rad = 2.5 + (i % 7) * 0.8;
      const z = THREE.MathUtils.lerp(-356.0, -392.0, u);
      const y = THREE.MathUtils.lerp(3.2, -3.5, u) + Math.sin(angle) * 1.5;
      const x = Math.cos(angle) * rad;
      list.push({
        basePos: [x, y, z],
        scale: 0.18 + (i % 5) * 0.08,
        speed: 0.5 + (i % 4) * 0.3,
      });
    }
    return list;
  }, []);

  // Pre-generate dissolving filament curves connecting to deep ocean
  const filamentLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      const rad = 4.0;
      for (let s = 0; s <= 10; s++) {
        const u = s / 10;
        const z = THREE.MathUtils.lerp(-355.0, -394.0, u);
        const y = THREE.MathUtils.lerp(3.2, -4.0, u) + Math.sin(angle + u * Math.PI) * (rad * (1 + u * 1.5));
        const x = Math.cos(angle + u * Math.PI) * (rad * (1 + u * 1.5));
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      lines.push(geom);
    }
    return lines;
  }, []);

  useFrame((state, delta) => {
    const w = worldProgressState.weights.cellularToOcean ?? 0;
    if (groupRef.current) {
      if (w <= 0.001) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      }
      if (!groupRef.current.visible) groupRef.current.visible = true;
    }

    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Rotate exit pore ring
    if (poreRingRef.current) {
      poreRingRef.current.rotation.z += safeDelta * 0.25;
    }

    // Animate dissolving vesicles drifting into the aquatic volume
    if (vesiclesInstRef.current) {
      for (let i = 0; i < vesicleData.length; i++) {
        const v = vesicleData[i];
        const swayX = Math.sin(t * v.speed + i) * 0.4;
        const swayY = Math.cos(t * v.speed * 0.8 + i) * 0.35;
        _pos.set(v.basePos[0] + swayX, v.basePos[1] + swayY, v.basePos[2]);
        _scale.setScalar(v.scale * (1 + Math.sin(t * 1.5 + i) * 0.15));
        _quat.identity();
        _mat4.compose(_pos, _quat, _scale);
        vesiclesInstRef.current.setMatrixAt(i, _mat4);
      }
      vesiclesInstRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} name="cellular-to-ocean-transition">
      {/* Distal Transmembrane Exit Pore (Z = -355) */}
      <mesh
        ref={poreRingRef}
        position={[0, 3.2, -355.0]}
        material={transitionMaterials.poreRing}
      >
        <torusGeometry args={[5.2, 0.55, 16, 40]} />
      </mesh>

      {/* Aqueous Expansion Filaments */}
      {filamentLines.map((geom, idx) => (
        <primitive
          key={`filament-${idx}`}
          object={new THREE.Line(geom, transitionMaterials.aqueousFilament)}
        />
      ))}

      {/* Instanced Dissolving Vesicles */}
      <instancedMesh
        ref={vesiclesInstRef}
        args={[undefined, undefined, vesicleData.length]}
        material={transitionMaterials.vesicle}
      >
        <sphereGeometry args={[1, 12, 12]} />
      </instancedMesh>
    </group>
  );
}
