"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MITO_MATERIALS = {
  outerCapsule: new THREE.MeshStandardMaterial({
    color: "#003d4d",
    emissive: "#004d61",
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0.78,
  }),
  innerCristae: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    emissive: "#00695c",
    emissiveIntensity: 0.85,
    roughness: 0.25,
    metalness: 0.8,
    side: THREE.DoubleSide,
  }),
  atpSynthesisMatrix: new THREE.MeshBasicMaterial({
    color: "#ffab00",
    toneMapped: false,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  }),
  protonParticle: new THREE.MeshBasicMaterial({
    color: "#64ffda",
    toneMapped: false,
  }),
};

interface SingleMitochondrionProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  lightColor?: string;
}

function SingleMitochondrion({
  position,
  rotation,
  scale = 1.0,
  lightColor = "#00e5ff",
}: SingleMitochondrionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cristaeGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const materials = MITO_MATERIALS;

  // Pre-generate 7 cristae folds (transverse invaginations across capsule)
  const cristaeFolds = useMemo(() => {
    const folds: { z: number; width: number; height: number; rotY: number }[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) * 2 - 1; // [-1, 1]
      const z = t * 4.6;
      const taper = Math.cos(t * Math.PI * 0.45);
      folds.push({
        z,
        width: 3.2 * taper,
        height: 2.2 * taper,
        rotY: (i % 2 === 0 ? 1 : -1) * 0.15,
      });
    }
    return folds;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    if (groupRef.current) {
      groupRef.current.rotation.y += safeDelta * 0.1;
      // Subtle organic respiration pulse
      const breathe = 1.0 + Math.sin(t * 1.5 + position[2]) * 0.015;
      groupRef.current.scale.set(scale * breathe, scale * breathe, scale);
    }

    if (cristaeGroupRef.current) {
      cristaeGroupRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 5.0 + Math.sin(t * 2.5 + position[0]) * 1.5;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* 1. Outer Membrane Capsule (Length: 12m, Width: 4.8m) */}
      <mesh material={materials.outerCapsule}>
        {/* Approximated using scaled sphere for smooth bean-like organic form */}
        <sphereGeometry args={[2.4, 24, 24]} />
      </mesh>
      {/* Elongated body */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.outerCapsule}>
        <cylinderGeometry args={[2.35, 2.35, 6.4, 24, 1, false]} />
      </mesh>
      <mesh position={[0, 0, 3.2]} material={materials.outerCapsule}>
        <sphereGeometry args={[2.35, 20, 20]} />
      </mesh>
      <mesh position={[0, 0, -3.2]} material={materials.outerCapsule}>
        <sphereGeometry args={[2.35, 20, 20]} />
      </mesh>

      {/* 2. Inner Folded Membrane (Cristae) */}
      <group ref={cristaeGroupRef}>
        {cristaeFolds.map((fold, idx) => (
          <group key={`cristae-${idx}`} position={[0, 0, fold.z]} rotation={[0, fold.rotY, 0]}>
            {/* Curved invagination sheet */}
            <mesh material={materials.innerCristae}>
              <boxGeometry args={[fold.width, 0.22, 0.8]} />
            </mesh>
            {/* Glowing ATP Synthase complex rim */}
            <mesh position={[0, 0.15, 0]} material={materials.atpSynthesisMatrix}>
              <sphereGeometry args={[0.18, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Proton / ATP carrier particle clusters at poles */}
      {[-4.2, 4.2].map((zOffset, idx) => (
        <group key={`proton-cluster-${idx}`} position={[0, 0, zOffset]}>
          {Array.from({ length: 4 }).map((_, pIdx) => {
            const angle = (pIdx / 4) * Math.PI * 2;
            return (
              <mesh
                key={`p-${pIdx}`}
                position={[Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0]}
                material={materials.protonParticle}
              >
                <sphereGeometry args={[0.1, 6, 6]} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* 4. Localized Bioluminescent Energy Light (Non-shadow-casting) */}
      <pointLight
        ref={lightRef}
        color={lightColor}
        intensity={5.0}
        distance={24}
        decay={2}
      />
    </group>
  );
}

/**
 * Mitochondria — Network of Gigantic Energy Factories
 *
 * Distributed naturally through the cytoplasmic space:
 * - Mitochondrion Alpha: near ER & entry threshold (Z = -258)
 * - Mitochondrion Beta: opposite Nucleus (Z = -305)
 * - Mitochondrion Gamma: near Golgi & boundary (Z = -338)
 */
export default function Mitochondria() {
  return (
    <group name="mitochondria-energy-network">
      {/* 1. Mitochondrion Alpha (Near ER / Entrance) */}
      <SingleMitochondrion
        position={[-10.0, 5.0, -262.0]}
        rotation={[0.3, 0.6, -0.2]}
        scale={1.15}
        lightColor="#00e5ff"
      />

      {/* 2. Mitochondrion Beta (Mid-Space Landmark opposite Nucleus) */}
      <SingleMitochondrion
        position={[10.0, 2.5, -326.0]}
        rotation={[-0.4, -0.5, 0.3]}
        scale={1.25}
        lightColor="#64ffda"
      />

      {/* 3. Mitochondrion Gamma (Deep-Space Factory near Exit) */}
      <SingleMitochondrion
        position={[-8.5, 1.5, -346.0]}
        rotation={[0.2, 0.7, -0.1]}
        scale={1.1}
        lightColor="#00bfa5"
      />
    </group>
  );
}
