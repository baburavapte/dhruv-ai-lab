"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

// Shared materials for ocean environment — realistic depth-dependent coloration
const envMaterials = {
  abyssAtmosphere: new THREE.MeshBasicMaterial({
    color: "#010610",
    side: THREE.BackSide,
  }),
  // Depth-stratified water volume layers (subtle, not flat color planes)
  upperWaterHaze: new THREE.MeshBasicMaterial({
    color: "#012a4d",
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  midWaterHaze: new THREE.MeshBasicMaterial({
    color: "#011830",
    transparent: true,
    opacity: 0.10,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),
  // Distant leviathan silhouette materials — dark, barely distinguishable from water
  leviathanBody: new THREE.MeshStandardMaterial({
    color: "#020810",
    roughness: 0.85,
    metalness: 0.08,
  }),
};

/**
 * OceanEnvironment — Atmospheric water volume, depth-dependent gradients,
 * and a distant colossal creature silhouette.
 *
 * MASTER REALISM PASS:
 * - Removed bioluminescent trim from leviathan (should be dark silhouette only)
 * - Subtle depth hazes for atmospheric perspective (not flat color planes)
 * - More natural creature anatomy
 * - Spans Z: -390 to -565.
 */
export default function OceanEnvironment() {
  const creatureGroupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  // Depth-stratified water volume baffles for atmospheric perspective
  const depthBaffles = useMemo(() => {
    return [
      { z: -405, y: -4, scale: 70, mat: envMaterials.upperWaterHaze },
      { z: -440, y: -9, scale: 80, mat: envMaterials.midWaterHaze },
      { z: -480, y: -14, scale: 90, mat: envMaterials.midWaterHaze },
      { z: -520, y: -18, scale: 100, mat: envMaterials.midWaterHaze },
    ];
  }, []);

  const envGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = worldProgressState.progress;
    if (envGroupRef.current) {
      envGroupRef.current.visible = p < 185;
      if (!envGroupRef.current.visible) return;
    }

    const t = state.clock.getElapsedTime();

    // Slow majestic drift — the creature is far away, barely visible
    if (creatureGroupRef.current) {
      creatureGroupRef.current.position.y = -4.0 + Math.sin(t * 0.2) * 1.8;
      creatureGroupRef.current.position.x = 38.0 + Math.cos(t * 0.15) * 3.0;
      creatureGroupRef.current.rotation.z = Math.sin(t * 0.2) * 0.03;
    }

    // Very slow tail stroke
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 0.4) * 0.12;
    }
  });

  return (
    <group ref={envGroupRef} name="ocean-environment">
      {/* Enormous Abyssal Water Volume Shell — deep ink black */}
      <mesh position={[0, -12, -475]} material={envMaterials.abyssAtmosphere}>
        <cylinderGeometry args={[70, 70, 200, 24, 1, true]} />
      </mesh>

      {/* Atmospheric Depth Haze Layers — subtle, not solid color */}
      {depthBaffles.map((b, idx) => (
        <mesh
          key={`baffle-${idx}`}
          position={[0, b.y, b.z]}
          material={b.mat}
          rotation={[0, 0, idx * 0.3]}
        >
          <ringGeometry args={[14, b.scale, 24]} />
        </mesh>
      ))}

      {/* Distant Colossal Creature Silhouette — barely visible dark shape in the haze */}
      <group ref={creatureGroupRef} position={[38, -4, -450]} rotation={[0, -0.35, 0]}>
        {/* Main Body — smooth fusiform shape (no bioluminescence, pure dark silhouette) */}
        <mesh material={envMaterials.leviathanBody} scale={[1, 1, 1]}>
          <capsuleGeometry args={[4.0, 22, 8, 12]} />
        </mesh>

        {/* Rostrum / Head */}
        <mesh position={[0, 13.0, 0]} material={envMaterials.leviathanBody}>
          <sphereGeometry args={[3.8, 10, 10]} />
        </mesh>

        {/* Caudal Tail Section */}
        <mesh ref={tailRef} position={[0, -14, 0]} material={envMaterials.leviathanBody}>
          <cylinderGeometry args={[1.8, 0.3, 9, 8]} />
          {/* Flukes */}
          <mesh position={[0, -5.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[9, 0.4, 2.8]} />
          </mesh>
        </mesh>

        {/* Pectoral Fins */}
        <mesh position={[-5.0, 3, 0]} rotation={[0, 0, 0.35]} material={envMaterials.leviathanBody}>
          <boxGeometry args={[7, 0.35, 2.2]} />
        </mesh>
        <mesh position={[5.0, 3, 0]} rotation={[0, 0, -0.35]} material={envMaterials.leviathanBody}>
          <boxGeometry args={[7, 0.35, 2.2]} />
        </mesh>
      </group>
    </group>
  );
}
