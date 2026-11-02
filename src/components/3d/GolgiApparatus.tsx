"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GolgiApparatusProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const GOLGI_MATERIALS = {
  cisternaMembrane: new THREE.MeshStandardMaterial({
    color: "#1a237e",
    emissive: "#283593",
    emissiveIntensity: 0.65,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  }),
  cisternaRimGlow: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    toneMapped: false,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  }),
  vesicleMembrane: new THREE.MeshStandardMaterial({
    color: "#00bfa5",
    emissive: "#004d40",
    emissiveIntensity: 0.8,
    roughness: 0.25,
    metalness: 0.75,
  }),
  cargoProtein: new THREE.MeshBasicMaterial({
    color: "#ff4081",
    toneMapped: false,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  }),
};

/**
 * GolgiApparatus — The Cellular Packaging & Secretory Landmark
 *
 * Positioned at [-11.0, 3.2, -325.0].
 * Features 6 stacked curved crescent cisternae, glowing marginal rims,
 * and budding secretory vesicles carrying fluorescent cargo packets.
 */
export default function GolgiApparatus({
  position = [-11.0, 3.2, -325.0],
  rotation = [0.25, 0.55, -0.15],
}: GolgiApparatusProps) {
  const groupRef = useRef<THREE.Group>(null);
  const vesicleGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const materials = GOLGI_MATERIALS;

  // Pre-generate 6 stacked curved cisternae layers with crescent arc curvature
  const cisternaeLayers = useMemo(() => {
    const list: {
      yOffset: number;
      width: number;
      depth: number;
      arcRadius: number;
    }[] = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const yOffset = (t - 0.5) * 4.8;
      const width = 7.5 - Math.abs(t - 0.5) * 1.8;
      const depth = 4.2 - Math.abs(t - 0.5) * 1.2;
      const arcRadius = 4.5 + t * 0.8;
      list.push({ yOffset, width, depth, arcRadius });
    }
    return list;
  }, []);

  // Pre-generate budding & secretory transport vesicles
  const vesicles = useMemo(() => {
    const list: {
      basePos: [number, number, number];
      driftSpeed: number;
      radius: number;
    }[] = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const angle = u * Math.PI * 2;
      const r = 3.6 + (i % 4) * 1.4;
      const x = Math.cos(angle) * r;
      const y = (Math.sin(angle) * 2.0) + ((i % 3) - 1) * 1.2;
      const z = Math.sin(u * Math.PI * 3) * 2.2 + (i * 0.25);
      list.push({
        basePos: [x, y, z],
        driftSpeed: 0.4 + (i % 3) * 0.25,
        radius: 0.28 + (i % 3) * 0.08,
      });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    if (groupRef.current) {
      groupRef.current.rotation.y += safeDelta * 0.06;
      groupRef.current.position.y = position[1] + Math.sin(t * 1.1) * 0.12;
    }

    if (vesicleGroupRef.current) {
      vesicleGroupRef.current.children.forEach((child, idx) => {
        const v = vesicles[idx];
        if (v) {
          child.position.x = v.basePos[0] + Math.sin(t * v.driftSpeed + idx) * 0.5;
          child.position.y = v.basePos[1] + Math.cos(t * v.driftSpeed * 0.8 + idx) * 0.35;
          child.position.z = v.basePos[2] + Math.sin(t * v.driftSpeed * 1.1) * 0.6;
        }
      });
    }

    if (lightRef.current) {
      lightRef.current.intensity = 5.5 + Math.sin(t * 2.2) * 1.5;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} name="golgi-apparatus-landmark">
      {/* 1. Stacked Curved Crescent Cisternae */}
      {cisternaeLayers.map((layer, idx) => (
        <group key={`cisterna-${idx}`} position={[0, layer.yOffset, 0]}>
          {/* Main cisterna curved membrane body */}
          <mesh material={materials.cisternaMembrane}>
            <boxGeometry args={[layer.width, 0.38, layer.depth]} />
          </mesh>
          {/* Glowing marginal rim lines */}
          <mesh position={[0, 0, layer.depth * 0.5]} rotation={[0, 0, Math.PI / 2]} material={materials.cisternaRimGlow}>
            <cylinderGeometry args={[0.12, 0.12, layer.width * 0.95, 8]} />
          </mesh>
          {/* Lateral cisterna terminal bulbs */}
          {[-layer.width * 0.5, layer.width * 0.5].map((xRim, rIdx) => (
            <mesh key={`bulb-${rIdx}`} position={[xRim, 0, 0]} material={materials.vesicleMembrane}>
              <sphereGeometry args={[0.5, 12, 12]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 2. Budding & Secretory Transport Vesicles with Fluorescent Cargo */}
      <group ref={vesicleGroupRef}>
        {vesicles.map((v, idx) => (
          <group key={`vesicle-${idx}`} position={v.basePos}>
            <mesh material={materials.vesicleMembrane}>
              <sphereGeometry args={[v.radius, 10, 10]} />
            </mesh>
            <mesh material={materials.cargoProtein}>
              <sphereGeometry args={[v.radius * 0.45, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Non-shadow-casting Localized Luminescence */}
      <pointLight
        ref={lightRef}
        color="#7c4dff"
        intensity={5.5}
        distance={28}
        decay={2}
      />
    </group>
  );
}
