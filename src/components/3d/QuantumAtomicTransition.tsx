"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface QuantumAtomicTransitionProps {
  weight?: number;
}

/**
 * QuantumAtomicTransition — Physical transition bridge between Quantum Lab and Atomic World.
 *
 * Positioned along Z: -132 to -166.
 *
 * Sequence:
 * 1. Quantum Lab exit: camera follows the cryogenic microwave signal conduit.
 * 2. Lab architecture fades to black.
 * 3. Scale Shift: Quantum tunneling irises expand past camera, conveying the transition
 *    from macro laboratory scale to subatomic angstrom scale.
 * 4. Emerges into the wide Atomic World reveal.
 */
export default function QuantumAtomicTransition({ weight }: QuantumAtomicTransitionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const irisGroupRef = useRef<THREE.Group>(null);
  const transitionLightRef = useRef<THREE.PointLight>(null);

  const materials = useMemo(
    () => ({
      conduitOuter: new THREE.MeshStandardMaterial({
        color: "#080c18",
        roughness: 0.6,
        metalness: 0.8,
        side: THREE.BackSide,
      }),
      guideTubeGold: new THREE.MeshStandardMaterial({
        color: "#d4af37",
        roughness: 0.25,
        metalness: 0.95,
      }),
      coreCyan: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
      }),
      irisRingViolet: new THREE.MeshBasicMaterial({
        color: "#7c4dff",
        toneMapped: false,
        transparent: true,
        opacity: 0.75,
      }),
      irisRingCyan: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
        transparent: true,
        opacity: 0.8,
      }),
      irisRingMagenta: new THREE.MeshBasicMaterial({
        color: "#d500f9",
        toneMapped: false,
        transparent: true,
        opacity: 0.7,
      }),
    }),
    []
  );

  // Pre-configured iris ring positions along Z = -138 to -162
  const irisPositions = useMemo(
    () => [-138, -142, -146, -150, -154, -158, -162],
    []
  );

  useFrame((state, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.quantumToAtomic ?? 0);

    if (effWeight <= 0.001) return;

    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Dynamic rotation of scale transformation irises
    if (irisGroupRef.current) {
      irisGroupRef.current.children.forEach((child, idx) => {
        child.rotation.z += safeDelta * (0.4 + idx * 0.15) * (idx % 2 === 0 ? 1 : -1);
      });
    }

    // Coherent RF pulse intensity
    if (transitionLightRef.current) {
      transitionLightRef.current.intensity = (4.0 + Math.sin(t * 3.5) * 1.5) * effWeight;
    }
  });

  return (
    <group ref={groupRef} name="quantum-atomic-transition">
      {/* 1. Dark Quantum Tunneling Enclosure (Z = -134 to -165) */}
      <mesh position={[0, 2.9, -149.5]} rotation={[Math.PI / 2, 0, 0]} material={materials.conduitOuter}>
        <cylinderGeometry args={[4.2, 4.2, 31, 24, 1, true]} />
      </mesh>

      {/* 2. Coaxial Cryogenic Waveguide Lines along the conduit */}
      {[-1.2, 1.2].map((xOffset, idx) => (
        <group key={`guide-${idx}`} position={[xOffset, 2.9, -149.5]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={materials.guideTubeGold}>
            <cylinderGeometry args={[0.08, 0.08, 31, 16]} />
          </mesh>
          <mesh material={materials.coreCyan}>
            <cylinderGeometry args={[0.03, 0.03, 31.1, 12]} />
          </mesh>
        </group>
      ))}

      {/* 3. Scale Contraction Iris Rings (Contraction from macro to subatomic scale) */}
      <group ref={irisGroupRef}>
        {irisPositions.map((zPos, idx) => {
          const ringMat =
            idx % 3 === 0
              ? materials.irisRingCyan
              : idx % 3 === 1
              ? materials.irisRingViolet
              : materials.irisRingMagenta;
          const radius = 3.6 - (idx * 0.18); // Tapers inward to focus into subatomic realm
          return (
            <group key={`iris-${idx}`} position={[0, 2.9, zPos]}>
              <mesh material={ringMat}>
                <torusGeometry args={[radius, 0.045, 8, 32]} />
              </mesh>
              {/* Radial Energy Nodes */}
              {Array.from({ length: 6 }).map((_, nIdx) => {
                const angle = (nIdx / 6) * Math.PI * 2;
                return (
                  <mesh
                    key={`node-${nIdx}`}
                    position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                    material={materials.coreCyan}
                  >
                    <sphereGeometry args={[0.06, 8, 8]} />
                  </mesh>
                );
              })}
            </group>
          );
        })}
      </group>

      {/* 4. Transition Signal Light */}
      <pointLight
        ref={transitionLightRef}
        position={[0, 2.9, -149]}
        color="#7c4dff"
        distance={24}
        decay={2}
      />
    </group>
  );
}
