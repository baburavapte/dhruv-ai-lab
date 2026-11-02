"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CellMembraneProps {
  opacityMultiplier?: number;
}

// Module-level shared static materials for Cell Membrane
const MEMBRANE_MATERIALS = {
  outerLipidWall: new THREE.MeshStandardMaterial({
    color: "#03172e",
    emissive: "#003c52",
    emissiveIntensity: 0.65,
    roughness: 0.3,
    metalness: 0.55,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.92,
  }),
  innerPhospholipidLayer: new THREE.MeshStandardMaterial({
    color: "#003a54",
    emissive: "#006d85",
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.6,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  }),
  transmembraneBarrel: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    emissive: "#004d40",
    emissiveIntensity: 0.8,
    roughness: 0.25,
    metalness: 0.8,
  }),
  glycoproteinReceptor: new THREE.MeshStandardMaterial({
    color: "#7c4dff",
    emissive: "#4a148c",
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.75,
  }),
  ionCurrentNode: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  }),
  electricalPulse: new THREE.MeshBasicMaterial({
    color: "#69f0ae",
    toneMapped: false,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  }),
  membraneNode: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    toneMapped: false,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  }),
};

/**
 * CellMembrane — Massive Living Outer Biological Boundary
 *
 * Spans Z = -220 to -370 with radius 50-56m.
 * Encloses the Cellular World inside an organic, pulsing lipid bilayer envelope
 * with embedded transmembrane ion channel barrels, receptors, and action potential rings.
 */
export default function CellMembrane({ opacityMultiplier = 1 }: CellMembraneProps) {
  const outerWallRef = useRef<THREE.Mesh>(null);
  const innerWallRef = useRef<THREE.Mesh>(null);
  const channelGroupRef = useRef<THREE.Group>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);

  const materials = MEMBRANE_MATERIALS;

  // Pre-generate embedded transmembrane channel coordinates
  const channels = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const angle = u * Math.PI * 2;
      const z = THREE.MathUtils.lerp(-232.0, -352.0, (i % 9) / 9);
      const rad = 46 + Math.sin(u * Math.PI * 4) * 4;
      const x = Math.cos(angle) * rad;
      const y = Math.sin(angle) * rad * 0.75 + 3.0;
      list.push({
        pos: [x, y, z],
        rot: [Math.sin(u * 3), Math.cos(u * 2), angle],
        scale: 1.25 + (i % 3) * 0.25,
      });
    }
    return list;
  }, []);

  // Pre-generate electrical action-potential wave rings along the perimeter
  const pulseRings = useMemo(() => {
    return [-238, -268, -298, -328, -352];
  }, []);

  // Pre-generate peripheral membrane protein nodes
  const membraneNodes = useMemo(() => {
    const list: [number, number, number][] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const angle = u * Math.PI * 2;
      const rad = 48.0;
      const z = THREE.MathUtils.lerp(-230.0, -355.0, (i * 7) % 28 / 28);
      list.push([Math.cos(angle) * rad, Math.sin(angle) * rad * 0.75 + 3.0, z]);
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Subtle breathing wave across the living membrane walls
    if (outerWallRef.current) {
      outerWallRef.current.rotation.z += safeDelta * 0.012;
      const scaleSway = 1.0 + Math.sin(t * 0.7) * 0.008;
      outerWallRef.current.scale.set(scaleSway, scaleSway, 1.0);
    }
    if (innerWallRef.current) {
      innerWallRef.current.rotation.z -= safeDelta * 0.016;
    }

    // Rotate ion channel barrels
    if (channelGroupRef.current) {
      channelGroupRef.current.children.forEach((ch, idx) => {
        ch.rotation.y += safeDelta * (0.18 + idx * 0.02);
      });
    }

    // Modulate electrical pulses
    materials.electricalPulse.opacity = (0.4 + Math.sin(t * 2.4) * 0.25) * opacityMultiplier;
    materials.outerLipidWall.opacity = 0.92 * opacityMultiplier;
    materials.innerPhospholipidLayer.opacity = 0.55 * opacityMultiplier;
  });

  return (
    <group name="cell-membrane-system">
      {/* 1. Primary Outer Lipid Bilayer Capsule (Z = -220 to -370, R = 52m) */}
      <mesh
        ref={outerWallRef}
        position={[0, 3.0, -295]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.outerLipidWall}
      >
        <cylinderGeometry args={[52, 54, 150, 48, 1, true]} />
      </mesh>

      {/* 2. Inner Phospholipid Luminescent Sheen (R = 50m) */}
      <mesh
        ref={innerWallRef}
        position={[0, 3.0, -295]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.innerPhospholipidLayer}
      >
        <cylinderGeometry args={[49.5, 51.5, 148, 40, 1, true]} />
      </mesh>

      {/* 3. Embedded Transmembrane Ion Channel Complexes */}
      <group ref={channelGroupRef}>
        {channels.map((ch, idx) => (
          <group
            key={`channel-${idx}`}
            position={ch.pos}
            rotation={ch.rot}
            scale={[ch.scale, ch.scale, ch.scale]}
          >
            {/* Outer barrel protein subunit */}
            <mesh material={materials.transmembraneBarrel}>
              <cylinderGeometry args={[2.4, 2.4, 5.0, 16, 1, true]} />
            </mesh>
            {/* Embedded glycoprotein receptor crown */}
            <mesh position={[0, 2.5, 0]} material={materials.glycoproteinReceptor}>
              <torusGeometry args={[2.6, 0.25, 8, 24]} />
            </mesh>
            {/* Ion channel pore glow */}
            <mesh material={materials.ionCurrentNode}>
              <cylinderGeometry args={[0.7, 0.7, 5.2, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Electrical Action Potential Wave Rings (Circular hoops around perimeter) */}
      <group ref={pulseGroupRef}>
        {pulseRings.map((zPos, idx) => (
          <mesh
            key={`pulse-${idx}`}
            position={[0, 3.0, zPos]}
            rotation={[0, 0, 0]}
            material={materials.electricalPulse}
          >
            <torusGeometry args={[50.2, 0.45, 8, 64]} />
          </mesh>
        ))}
      </group>

      {/* 5. Peripheral Membrane Protein Nodes */}
      {membraneNodes.map((pos, idx) => (
        <mesh key={`mem-node-${idx}`} position={pos} material={materials.membraneNode}>
          <sphereGeometry args={[0.42, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
