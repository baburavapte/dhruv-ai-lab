"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DNAHelix from "./DNAHelix";

interface NucleusProps {
  position?: [number, number, number];
}

const NUCLEUS_MATERIALS = {
  outerEnvelope: new THREE.MeshStandardMaterial({
    color: "#1a0836",
    emissive: "#311b92",
    emissiveIntensity: 0.5,
    roughness: 0.35,
    metalness: 0.6,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
  }),
  innerLamina: new THREE.MeshStandardMaterial({
    color: "#051329",
    emissive: "#004d61",
    emissiveIntensity: 0.4,
    roughness: 0.4,
    metalness: 0.7,
    transparent: true,
    opacity: 0.55,
  }),
  poreRing: new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    emissive: "#00838f",
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.8,
  }),
  poreTransporter: new THREE.MeshBasicMaterial({
    color: "#ff4081",
    toneMapped: false,
  }),
  chromatinFiber: new THREE.MeshBasicMaterial({
    color: "#7c4dff",
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  }),
  nucleolusCore: new THREE.MeshBasicMaterial({
    color: "#d500f9",
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
  }),
};

/**
 * Nucleus — Major Biological Landmark
 *
 * Gigantic 18m-diameter double-membraned organelle situated at [9.0, 4.5, -290.0].
 * Features semi-transparent nuclear envelope, 48 nuclear pore complexes,
 * fibrous chromatin network, pulsing nucleolus core, and the gigantic DNA helix inside.
 */
export default function Nucleus({ position = [9.0, 4.5, -290.0] }: NucleusProps) {
  const outerEnvelopeRef = useRef<THREE.Mesh>(null);
  const chromatinGroupRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  const materials = NUCLEUS_MATERIALS;

  // Pre-generate 48 Nuclear Pore Complexes evenly distributed across sphere surface
  const pores = useMemo(() => {
    const list: {
      pos: [number, number, number];
      quat: [number, number, number, number];
    }[] = [];
    const count = 48;
    const radius = 8.85;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * 2.39996323; // Golden angle in radians

      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;

      const norm = new THREE.Vector3(x, y, z).normalize();
      const pos = norm.clone().multiplyScalar(radius);

      dummy.position.copy(pos);
      dummy.quaternion.setFromUnitVectors(up, norm);
      dummy.updateMatrix();

      list.push({
        pos: [pos.x, pos.y, pos.z],
        quat: [dummy.quaternion.x, dummy.quaternion.y, dummy.quaternion.z, dummy.quaternion.w],
      });
    }
    return list;
  }, []);

  // Pre-generate chromatin looped fibers
  const chromatinLoops = useMemo(() => {
    const loops: [number, number, number, number, number, number, number][] = [
      [0, 0, 0, 4.5, 0.4, 0.6, 0.2],
      [-1.5, 1.2, -0.8, 5.2, -0.5, 0.3, 0.7],
      [1.8, -1.5, 1.0, 4.8, 0.3, -0.6, 0.4],
      [-0.8, -2.0, -1.2, 5.0, 0.7, 0.2, -0.5],
    ];
    return loops;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Subtle breathing motion of outer envelope
    if (outerEnvelopeRef.current) {
      outerEnvelopeRef.current.rotation.y += safeDelta * 0.08;
      outerEnvelopeRef.current.rotation.x += safeDelta * 0.04;
    }

    // Gentle rotation of chromatin network
    if (chromatinGroupRef.current) {
      chromatinGroupRef.current.rotation.y -= safeDelta * 0.12;
      chromatinGroupRef.current.rotation.z += safeDelta * 0.06;
    }

    // Pulsing core nucleolus illumination
    if (coreLightRef.current) {
      coreLightRef.current.intensity = 10.0 + Math.sin(t * 1.8) * 3.0;
    }
  });

  return (
    <group position={position} name="cellular-nucleus-landmark">
      {/* 1. Semi-Transparent Outer Nuclear Envelope (Radius = 8.8m) */}
      <mesh ref={outerEnvelopeRef} material={materials.outerEnvelope}>
        <sphereGeometry args={[8.8, 36, 36]} />
      </mesh>

      {/* 2. Inner Nuclear Lamina Sheen (Radius = 8.2m) */}
      <mesh material={materials.innerLamina}>
        <sphereGeometry args={[8.2, 28, 28]} />
      </mesh>

      {/* 3. Nuclear Pore Complexes distributed over surface */}
      {pores.map((p, idx) => (
        <group key={`pore-${idx}`} position={p.pos} quaternion={new THREE.Quaternion(...p.quat)}>
          {/* Pore octagonal/toroidal ring */}
          <mesh material={materials.poreRing}>
            <torusGeometry args={[0.55, 0.12, 8, 16]} />
          </mesh>
          {/* Central transporter plug */}
          <mesh material={materials.poreTransporter}>
            <sphereGeometry args={[0.22, 10, 10]} />
          </mesh>
        </group>
      ))}

      {/* 4. Fibrous Chromatin Loops */}
      <group ref={chromatinGroupRef}>
        {chromatinLoops.map(([x, y, z, r, rx, ry, rz], idx) => (
          <mesh
            key={`chromatin-${idx}`}
            position={[x, y, z]}
            rotation={[rx, ry, rz]}
            material={materials.chromatinFiber}
          >
            <torusGeometry args={[r, 0.08, 8, 32]} />
          </mesh>
        ))}
      </group>

      {/* 5. Dense Radiant Nucleolus Core (Radius = 2.4m) */}
      <mesh material={materials.nucleolusCore}>
        <sphereGeometry args={[2.4, 24, 24]} />
      </mesh>

      {/* 6. Enormous DNA Double Helix in the Nuclear Core */}
      <DNAHelix position={[0, 0, 0]} rotation={[0.4, 0.2, -0.3]} scale={1.15} />

      {/* 7. Non-shadow-casting Core Nucleus Illumination */}
      <pointLight
        ref={coreLightRef}
        color="#d500f9"
        intensity={10.0}
        distance={40}
        decay={2}
      />
      <pointLight
        color="#00e5ff"
        intensity={8.0}
        distance={35}
        decay={2}
        position={[0, 4, 0]}
      />
    </group>
  );
}
