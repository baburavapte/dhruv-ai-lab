"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface AtomicCellularTransitionProps {
  weight?: number;
}

// Module-level static materials for Molecular / Chemical Transition (zero allocation)
const MOLECULAR_MATERIALS = {
  carbonNode: new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    roughness: 0.3,
    metalness: 0.7,
    emissive: "#005577",
    emissiveIntensity: 0.6,
  }),
  nitrogenNode: new THREE.MeshStandardMaterial({
    color: "#7c4dff",
    roughness: 0.3,
    metalness: 0.7,
    emissive: "#311b92",
    emissiveIntensity: 0.6,
  }),
  oxygenNode: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    roughness: 0.3,
    metalness: 0.6,
    emissive: "#004d40",
    emissiveIntensity: 0.5,
  }),
  covalentBond: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  }),
  peptideBackbone: new THREE.MeshStandardMaterial({
    color: "#18ffff",
    roughness: 0.2,
    metalness: 0.8,
    emissive: "#00b4d8",
    emissiveIntensity: 0.7,
  }),
  lipidPoreRing: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    roughness: 0.4,
    metalness: 0.6,
    emissive: "#003d33",
    emissiveIntensity: 0.5,
    side: THREE.DoubleSide,
  }),
  conduitOuter: new THREE.MeshStandardMaterial({
    color: "#020713",
    roughness: 0.7,
    metalness: 0.5,
    side: THREE.BackSide,
  }),
};

/**
 * AtomicCellularTransition — Dedicated Bridge from Atomic to Cellular World
 *
 * Positioned along Z: -188 to -226.
 *
 * Sequence:
 * 1. Subatomic orbitals condense into tetrahedral & hexagonal covalent molecular bonds (Z = -188 to -200).
 * 2. Covalent lattices fold into macromolecular helical peptide chains (Z = -200 to -212).
 * 3. Organic lipid precursors assemble into curved membrane sheets (Z = -212 to -224).
 * 4. Transmembrane ion-pore threshold at Z = -224 breaches directly into the Cellular World.
 */
export default function AtomicCellularTransition({ weight }: AtomicCellularTransitionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const molecularGroupRef = useRef<THREE.Group>(null);
  const peptideHelixRef = useRef<THREE.Group>(null);
  const poreRingRef = useRef<THREE.Group>(null);
  const transitionLightRef = useRef<THREE.PointLight>(null);

  const materials = MOLECULAR_MATERIALS;

  // Pre-generate molecular lattice coordinates (deterministic once)
  const latticeData = useMemo(() => {
    const nodes: { pos: [number, number, number]; type: "C" | "N" | "O" }[] = [];
    const bonds: { start: [number, number, number]; end: [number, number, number] }[] = [];

    // Ring 1: Hexagonal carbon ring at Z = -193
    const r1 = 2.2;
    const z1 = -193;
    const p1: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const theta = (i / 6) * Math.PI * 2;
      const x = Math.cos(theta) * r1;
      const y = Math.sin(theta) * r1 + 2.6;
      p1.push([x, y, z1]);
      nodes.push({ pos: [x, y, z1], type: i % 2 === 0 ? "C" : "N" });
    }
    for (let i = 0; i < 6; i++) {
      bonds.push({ start: p1[i], end: p1[(i + 1) % 6] });
    }

    // Ring 2: Tetrahedral glucose-like cluster at Z = -201
    const r2 = 2.8;
    const z2 = -201;
    const p2: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const theta = (i / 8) * Math.PI * 2 + 0.3;
      const x = Math.cos(theta) * r2;
      const y = Math.sin(theta) * r2 + 2.8;
      p2.push([x, y, z2]);
      nodes.push({ pos: [x, y, z2], type: i % 3 === 0 ? "O" : i % 3 === 1 ? "C" : "N" });
    }
    for (let i = 0; i < 8; i++) {
      bonds.push({ start: p2[i], end: p2[(i + 1) % 8] });
      if (i % 2 === 0) {
        bonds.push({ start: p2[i], end: [0, 2.8, z2 + 1.2] });
      }
    }
    nodes.push({ pos: [0, 2.8, z2 + 1.2], type: "C" });

    // Ring 3: Macromolecular complex at Z = -208
    const r3 = 3.2;
    const z3 = -208;
    for (let i = 0; i < 10; i++) {
      const theta = (i / 10) * Math.PI * 2;
      const x = Math.cos(theta) * r3;
      const y = Math.sin(theta) * r3 + 3.0;
      nodes.push({ pos: [x, y, z3], type: i % 2 === 0 ? "C" : "O" });
    }

    return { nodes, bonds };
  }, []);

  // Pre-generate peptide alpha-helix curve points
  const peptidePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const count = 36;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const theta = t * Math.PI * 8;
      const x = Math.cos(theta) * 1.6;
      const y = Math.sin(theta) * 1.6 + 3.0;
      const z = THREE.MathUtils.lerp(-203.0, -218.0, t);
      pts.push([x, y, z]);
    }
    return pts;
  }, []);

  useFrame((state, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.atomicToCellular ?? 0);

    if (groupRef.current) {
      if (effWeight <= 0.001) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      } else if (!groupRef.current.visible) {
        groupRef.current.visible = true;
      }
    }

    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Rotate molecular rings & peptide backbone
    if (molecularGroupRef.current) {
      molecularGroupRef.current.rotation.z += safeDelta * 0.35;
    }
    if (peptideHelixRef.current) {
      peptideHelixRef.current.rotation.z -= safeDelta * 0.45;
    }
    if (poreRingRef.current) {
      poreRingRef.current.rotation.z += safeDelta * 0.2;
    }

    // Modulate transition light intensity
    if (transitionLightRef.current) {
      transitionLightRef.current.intensity = (5.0 + Math.sin(t * 3.0) * 1.8) * effWeight;
    }

    // Material opacities
    materials.covalentBond.opacity = 0.65 * effWeight;
  });

  return (
    <group ref={groupRef} name="atomic-cellular-transition">
      {/* 1. Deep Organic Fluid Transition Enclosure (Z = -188 to -226) */}
      <mesh position={[0, 2.9, -207]} rotation={[Math.PI / 2, 0, 0]} material={materials.conduitOuter}>
        <cylinderGeometry args={[5.2, 5.8, 38, 24, 1, true]} />
      </mesh>

      {/* 2. Covalent Molecular Bond Lattices */}
      <group ref={molecularGroupRef}>
        {latticeData.nodes.map((node, idx) => (
          <mesh
            key={`mol-node-${idx}`}
            position={node.pos}
            material={
              node.type === "C"
                ? materials.carbonNode
                : node.type === "N"
                ? materials.nitrogenNode
                : materials.oxygenNode
            }
          >
            <sphereGeometry args={[0.22, 14, 14]} />
          </mesh>
        ))}

        {latticeData.bonds.map((b, idx) => {
          const startVec = new THREE.Vector3(...b.start);
          const endVec = new THREE.Vector3(...b.end);
          const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
          const dir = new THREE.Vector3().subVectors(endVec, startVec);
          const len = dir.length();
          const orient = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.clone().normalize()
          );
          return (
            <mesh
              key={`mol-bond-${idx}`}
              position={mid}
              quaternion={orient}
              material={materials.covalentBond}
            >
              <cylinderGeometry args={[0.04, 0.04, len, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* 3. Macromolecular Peptide Alpha-Helix (Z = -203 to -218) */}
      <group ref={peptideHelixRef}>
        {peptidePoints.map((pos, idx) => (
          <mesh key={`pep-${idx}`} position={pos} material={materials.peptideBackbone}>
            <sphereGeometry args={[0.16, 12, 12]} />
          </mesh>
        ))}
      </group>

      {/* 4. Transmembrane Pore / Ion Channel Boundary Archway at Z = -224 */}
      <group ref={poreRingRef} position={[0, 3.2, -224]}>
        {/* Outer lipid membrane lip */}
        <mesh material={materials.lipidPoreRing}>
          <torusGeometry args={[4.4, 0.28, 16, 48]} />
        </mesh>
        {/* Channel alpha-helix transmembrane columns */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const theta = (idx / 12) * Math.PI * 2;
          const x = Math.cos(theta) * 4.4;
          const y = Math.sin(theta) * 4.4;
          return (
            <mesh key={`col-${idx}`} position={[x, y, 0]} material={materials.carbonNode}>
              <cylinderGeometry args={[0.18, 0.18, 1.8, 12]} />
            </mesh>
          );
        })}
      </group>

      {/* 5. Bioluminescent Transition Light */}
      <pointLight
        ref={transitionLightRef}
        position={[0, 3.0, -206]}
        color="#00e5ff"
        intensity={5.0}
        distance={32}
        decay={2}
      />
    </group>
  );
}
