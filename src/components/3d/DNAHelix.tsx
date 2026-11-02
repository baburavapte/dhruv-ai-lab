"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DNAHelixProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const DNA_MATERIALS = {
  backboneTeal: new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    roughness: 0.25,
    metalness: 0.8,
    emissive: "#006064",
    emissiveIntensity: 0.8,
  }),
  backboneViolet: new THREE.MeshStandardMaterial({
    color: "#7c4dff",
    roughness: 0.25,
    metalness: 0.8,
    emissive: "#4a148c",
    emissiveIntensity: 0.8,
  }),
  basePairCyan: new THREE.MeshBasicMaterial({
    color: "#00bfa5",
    toneMapped: false,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  }),
  basePairMagenta: new THREE.MeshBasicMaterial({
    color: "#ff4081",
    toneMapped: false,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  }),
};

/**
 * DNAHelix — Monumental Macromolecular Genetic Engine
 *
 * Implements a gigantic, glowing double helix with antiparallel sugar-phosphate
 * backbones and nucleotide base pairs.
 * Zero per-frame allocations with precalculated transform matrices.
 */
export default function DNAHelix({
  position = [0, 0, 0],
  rotation = [0.2, 0, 0.1],
  scale = 1.0,
}: DNAHelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const helixRef = useRef<THREE.Group>(null);

  const materials = DNA_MATERIALS;

  // Pre-generate double helix coordinates and base-pair rungs
  const { rungTransforms, strand1Nodes, strand2Nodes } = useMemo(() => {
    const rungs: {
      pos: [number, number, number];
      quat: [number, number, number, number];
      len: number;
      type: "GC" | "AT";
    }[] = [];
    const s1: [number, number, number][] = [];
    const s2: [number, number, number][] = [];

    const numSteps = 42;
    const helixRadius = 3.2;
    const totalHeight = 22.0;

    const dummyObj = new THREE.Object3D();
    const upVec = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < numSteps; i++) {
      const t = i / numSteps;
      const y = (t - 0.5) * totalHeight;
      const theta = t * Math.PI * 6.0; // 3 full turns

      // Strand 1 position
      const x1 = Math.cos(theta) * helixRadius;
      const z1 = Math.sin(theta) * helixRadius;
      s1.push([x1, y, z1]);

      // Strand 2 position (opposite phase: theta + PI)
      const x2 = Math.cos(theta + Math.PI) * helixRadius;
      const z2 = Math.sin(theta + Math.PI) * helixRadius;
      s2.push([x2, y, z2]);

      // Base-pair connector bridging Strand 1 and Strand 2
      const start = new THREE.Vector3(x1, y, z1);
      const end = new THREE.Vector3(x2, y, z2);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();

      dummyObj.position.copy(mid);
      dummyObj.quaternion.setFromUnitVectors(upVec, dir.clone().normalize());
      dummyObj.updateMatrix();

      rungs.push({
        pos: [mid.x, mid.y, mid.z],
        quat: [dummyObj.quaternion.x, dummyObj.quaternion.y, dummyObj.quaternion.z, dummyObj.quaternion.w],
        len,
        type: i % 2 === 0 ? "GC" : "AT",
      });
    }

    return { rungTransforms: rungs, strand1Nodes: s1, strand2Nodes: s2 };
  }, []);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    if (helixRef.current) {
      helixRef.current.rotation.y += safeDelta * 0.28;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <group ref={helixRef}>
        {/* Strand 1: Cyan/Teal sugar-phosphate nucleotide nodes */}
        {strand1Nodes.map((pos, idx) => (
          <mesh key={`s1-${idx}`} position={pos} material={materials.backboneTeal}>
            <sphereGeometry args={[0.34, 14, 14]} />
          </mesh>
        ))}

        {/* Strand 2: Violet/Indigo sugar-phosphate nucleotide nodes */}
        {strand2Nodes.map((pos, idx) => (
          <mesh key={`s2-${idx}`} position={pos} material={materials.backboneViolet}>
            <sphereGeometry args={[0.34, 14, 14]} />
          </mesh>
        ))}

        {/* Base-pair hydrogen bond rungs */}
        {rungTransforms.map((r, idx) => (
          <mesh
            key={`rung-${idx}`}
            position={r.pos}
            quaternion={new THREE.Quaternion(...r.quat)}
            material={r.type === "GC" ? materials.basePairCyan : materials.basePairMagenta}
          >
            <cylinderGeometry args={[0.11, 0.11, r.len, 10]} />
          </mesh>
        ))}

        {/* Central genetic axis glow light */}
        <pointLight color="#00e5ff" intensity={6.0} distance={18} decay={2} />
      </group>
    </group>
  );
}
