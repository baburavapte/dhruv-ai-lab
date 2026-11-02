"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

// Shared materials for abyssal cavern, canyon portal, and deep seabed tectonic exit
const cavernMaterials = {
  cavernVault: new THREE.MeshStandardMaterial({
    color: "#0a1320",
    roughness: 0.85,
    metalness: 0.15,
    side: THREE.DoubleSide,
  }),
  stalactiteRock: new THREE.MeshStandardMaterial({
    color: "#0e1a2c",
    roughness: 0.75,
    metalness: 0.2,
  }),
  stalactiteGlowTip: new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    emissive: "#0099cc",
    emissiveIntensity: 0.9,
    roughness: 0.3,
  }),
  portalRock: new THREE.MeshStandardMaterial({
    color: "#060d17",
    roughness: 0.9,
    metalness: 0.1,
  }),
  seabedBasalt: new THREE.MeshStandardMaterial({
    color: "#0b121c",
    roughness: 0.8,
    metalness: 0.2,
  }),
  tectonicFracture: new THREE.MeshBasicMaterial({
    color: "#ff3b00",
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  }),
  crustalGlowCore: new THREE.MeshBasicMaterial({
    color: "#ffaa00",
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  }),
};

/**
 * AbyssCavern — Grand Abyssal Cavern, Geological Canyon Ascent Portal,
 * and the Deep Seabed Tectonic Fault Exit Boundary (post-dive).
 *
 * Spans:
 * - Abyss Cavern & Ascent Portal: Z: -510 to -575, Y: -24 to +2.
 * - Deep Seabed Fracture (Natural Exit Boundary): Z: -760 to -785, Y: -26.
 * Zero per-frame allocations in useFrame.
 */
export default function AbyssCavern() {
  const faultPulseRef = useRef<THREE.PointLight>(null);
  const fractureGroupRef = useRef<THREE.Group>(null);

  // Pre-generate overhead stalactite formations (14 formations in abyssal cavern)
  const stalactites = useMemo(() => {
    const list: { pos: [number, number, number]; height: number; rad: number }[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const z = THREE.MathUtils.lerp(-515.0, -555.0, u);
      const x = (i % 2 === 0 ? -1 : 1) * (5.5 + (i % 4) * 2.2);
      const y = -4.0 + (i % 3) * 1.5;
      list.push({
        pos: [x, y, z],
        height: 6.5 + (i % 3) * 2.5,
        rad: 1.2 + (i % 2) * 0.3,
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const p = worldProgressState.progress;

    // Geothermal mantle glow awakens only during the return dive plunge (p >= 212)
    let faultWeight = 0;
    if (p >= 212 && p <= 232) {
      faultWeight = Math.min(1, (p - 212) / 6);
    }

    if (fractureGroupRef.current) {
      fractureGroupRef.current.visible = faultWeight > 0.001;
      if (fractureGroupRef.current.visible) {
        fractureGroupRef.current.scale.set(
          1.0 + Math.sin(t * 1.5) * 0.1,
          1.0,
          1.0 + Math.sin(t * 1.2) * 0.08
        );
      }
    }

    if (faultPulseRef.current) {
      faultPulseRef.current.intensity = (5.5 + Math.sin(t * 1.2) * 1.8) * faultWeight;
    }
  });

  return (
    <group name="abyss-cavern-and-exit-boundary">
      {/* 1. Grand Cavern Arch Vault in the Deep Abyss (Z: -510 to -555) */}
      <mesh
        position={[0, -10, -535]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={cavernMaterials.cavernVault}
      >
        <cylinderGeometry args={[28, 28, 55, 16, 1, true, 0, Math.PI]} />
      </mesh>

      {/* 2. Overhead Stalactites with Bioluminescent Tips */}
      {stalactites.map((s, idx) => (
        <group key={`stalactite-${idx}`} position={s.pos} rotation={[Math.PI, 0, 0]}>
          <mesh position={[0, s.height * 0.5, 0]} material={cavernMaterials.stalactiteRock}>
            <coneGeometry args={[s.rad, s.height, 8]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={cavernMaterials.stalactiteGlowTip}>
            <coneGeometry args={[s.rad * 0.35, 1.2, 6]} />
          </mesh>
        </group>
      ))}

      {/* 3. Geological Canyon Ascent Portal (Exit from Cavern, Gateway to Open Water Ascent) */}
      <group position={[0, -12, -565]}>
        {/* Massive flanking portal pillars */}
        <mesh position={[-16, 0, 0]} material={cavernMaterials.portalRock}>
          <cylinderGeometry args={[4.5, 6.0, 24, 8]} />
        </mesh>
        <mesh position={[16, 0, 0]} material={cavernMaterials.portalRock}>
          <cylinderGeometry args={[4.5, 6.0, 24, 8]} />
        </mesh>
        {/* Overhead rock arch */}
        <mesh position={[0, 10, 0]} rotation={[0, 0, Math.PI / 2]} material={cavernMaterials.portalRock}>
          <cylinderGeometry args={[3.5, 3.5, 34, 8]} />
        </mesh>
      </group>

      {/* 4. Deep Seabed Tectonic Fault Fracture (Natural Exit Boundary awakened after the Dive at Z = -775) */}
      <group ref={fractureGroupRef} position={[0, -25.0, -775]} visible={false}>
        {/* Basalt fracture canyon walls flanking the fissure */}
        {[-8.5, 8.5].map((bx, bi) => (
          <mesh key={`seabed-wall-${bi}`} position={[bx, 4, 0]} material={cavernMaterials.seabedBasalt}>
            <boxGeometry args={[4, 10, 32]} />
          </mesh>
        ))}

        {/* Deep seabed fissure opening */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          material={cavernMaterials.tectonicFracture}
        >
          <planeGeometry args={[12, 30]} />
        </mesh>

        {/* Hot mantle glow core beneath the crack */}
        <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={cavernMaterials.crustalGlowCore}>
          <planeGeometry args={[7, 26]} />
        </mesh>

        {/* Deep Crustal Geothermal Light (Non-shadow-casting!) */}
        <pointLight
          ref={faultPulseRef}
          position={[0, 3.0, 0]}
          color="#ff5500"
          intensity={0}
          distance={50}
          castShadow={false}
        />
      </group>
    </group>
  );
}
