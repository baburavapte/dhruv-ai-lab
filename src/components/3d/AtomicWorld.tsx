"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface AtomicWorldProps {
  weight?: number;
}

const COUNT = 640;
const _particlePositions = new Float32Array(COUNT * 3);
const _particleColors = new Float32Array(COUNT * 3);

// Generate deterministic static buffers once at module load (Pure, zero render overhead)
(function initAtomicParticles() {
  let state = 8821;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  const colorA = new THREE.Color("#00e5ff");
  const colorB = new THREE.Color("#7c4dff");
  const colorC = new THREE.Color("#d500f9");

  for (let i = 0; i < COUNT; i++) {
    const u = rand();
    const v = rand();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Monumental subatomic scale: particles span up to 14 meters radius
    const r = 2.5 + rand() * 11.5;

    _particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    _particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    _particlePositions[i * 3 + 2] = r * Math.cos(phi);

    const mixVal = rand();
    const mixed = mixVal < 0.5
      ? colorA.clone().lerp(colorB, mixVal * 2)
      : colorB.clone().lerp(colorC, (mixVal - 0.5) * 2);

    _particleColors[i * 3] = mixed.r;
    _particleColors[i * 3 + 1] = mixed.g;
    _particleColors[i * 3 + 2] = mixed.b;
  }
})();

// Module-level static materials for Atomic World (zero-allocation, zero React ref lint errors)
const ATOMIC_MATERIALS = {
  nucleusGlow: new THREE.MeshBasicMaterial({
    color: "#d500f9",
    toneMapped: false,
    transparent: true,
    opacity: 1,
  }),
  proton: new THREE.MeshStandardMaterial({
    color: "#7c4dff",
    roughness: 0.25,
    metalness: 0.8,
    emissive: "#4a148c",
    emissiveIntensity: 0.8,
  }),
  neutron: new THREE.MeshStandardMaterial({
    color: "#00e5ff",
    roughness: 0.25,
    metalness: 0.8,
    emissive: "#006064",
    emissiveIntensity: 0.7,
  }),
  orbitalCyan: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  }),
  orbitalViolet: new THREE.MeshBasicMaterial({
    color: "#7c4dff",
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  }),
  orbitalMagenta: new THREE.MeshBasicMaterial({
    color: "#ff4081",
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  }),
  orbitalAzure: new THREE.MeshBasicMaterial({
    color: "#29b6f6",
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  }),
  electronNode: new THREE.MeshBasicMaterial({
    color: "#ffffff",
    toneMapped: false,
  }),
  latticeBond: new THREE.MeshBasicMaterial({
    color: "#536dfe",
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  }),
};

/**
 * AtomicWorld — Subatomic Orbitals & Probability Cloud Realm
 *
 * Core Principle:
 * COMPLETE SEPARATE WORLD.
 * Zero quantum lab elements. Zero consoles. Zero columns.
 * Center position: Z = -182.0.
 * Monumental subatomic scale.
 */
export default function AtomicWorld({ weight }: AtomicWorldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Group>(null);
  const orbital1Ref = useRef<THREE.Group>(null);
  const orbital2Ref = useRef<THREE.Group>(null);
  const orbital3Ref = useRef<THREE.Group>(null);
  const orbital4Ref = useRef<THREE.Group>(null);
  const wavePointsRef = useRef<THREE.Points>(null);

  // Light refs for smooth zero-garbage intensity modulation
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const pointLight1Ref = useRef<THREE.PointLight>(null);
  const pointLight2Ref = useRef<THREE.PointLight>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  const materials = ATOMIC_MATERIALS;

  useFrame((_, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.atomic ?? 0);

    // Smooth lighting modulation
    if (ambientLightRef.current) ambientLightRef.current.intensity = 1.8 * effWeight;
    if (pointLight1Ref.current) pointLight1Ref.current.intensity = 8.0 * effWeight;
    if (pointLight2Ref.current) pointLight2Ref.current.intensity = 6.0 * effWeight;
    if (coreLightRef.current) coreLightRef.current.intensity = 12.0 * effWeight;

    // Smooth material opacity modulation (zero visual pop)
    materials.orbitalCyan.opacity = 0.75 * effWeight;
    materials.orbitalViolet.opacity = 0.75 * effWeight;
    materials.orbitalMagenta.opacity = 0.65 * effWeight;
    materials.orbitalAzure.opacity = 0.60 * effWeight;
    materials.latticeBond.opacity = 0.50 * effWeight;
    materials.nucleusGlow.opacity = effWeight;

    if (groupRef.current) {
      if (effWeight <= 0.001) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      } else if (!groupRef.current.visible) {
        groupRef.current.visible = true;
      }
    }

    // Fluid orbital rotation around quantum axes
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += delta * 0.6;
      nucleusRef.current.rotation.x += delta * 0.4;
    }

    if (orbital1Ref.current) {
      orbital1Ref.current.rotation.z += delta * 1.1;
      orbital1Ref.current.rotation.x += delta * 0.5;
    }
    if (orbital2Ref.current) {
      orbital2Ref.current.rotation.y += delta * 0.9;
      orbital2Ref.current.rotation.z -= delta * 0.7;
    }
    if (orbital3Ref.current) {
      orbital3Ref.current.rotation.x += delta * 1.0;
      orbital3Ref.current.rotation.y -= delta * 0.5;
    }
    if (orbital4Ref.current) {
      orbital4Ref.current.rotation.z -= delta * 0.8;
      orbital4Ref.current.rotation.y += delta * 0.6;
    }

    if (wavePointsRef.current) {
      wavePointsRef.current.rotation.y += delta * 0.35;
      wavePointsRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 2.6, -182.0]} name="atomic-world-cluster">
      {/* ------------------------------------------------------------- */}
      {/* 1. ATOMIC REALM LIGHTING                                      */}
      {/* ------------------------------------------------------------- */}
      <ambientLight ref={ambientLightRef} color="#180838" intensity={1.8} />
      <pointLight ref={pointLight1Ref} color="#7c4dff" intensity={8.0} distance={38} decay={2} position={[0, 8, 0]} />
      <pointLight ref={pointLight2Ref} color="#00e5ff" intensity={6.0} distance={38} decay={2} position={[0, -6, 0]} />

      {/* ------------------------------------------------------------- */}
      {/* 2. ATOMIC NUCLEUS (Protons, Neutrons, Radiant Gluon Core)     */}
      {/* ------------------------------------------------------------- */}
      <group ref={nucleusRef}>
        {/* Radiant Core Sphere */}
        <mesh material={materials.nucleusGlow}>
          <sphereGeometry args={[0.55, 32, 32]} />
        </mesh>
        <pointLight ref={coreLightRef} color="#d500f9" intensity={12.0} distance={28} decay={2} />

        {/* 12-Nucleon Quantum Cluster */}
        {[
          [0.45, 0.35, 0.15, "proton"],
          [-0.42, 0.28, -0.22, "neutron"],
          [0.18, -0.45, 0.32, "proton"],
          [-0.32, -0.38, -0.35, "neutron"],
          [0.52, -0.15, -0.28, "proton"],
          [-0.45, 0.16, 0.48, "neutron"],
          [0.25, 0.48, -0.38, "neutron"],
          [-0.22, -0.48, 0.28, "proton"],
          [0.38, -0.32, -0.45, "neutron"],
          [-0.48, -0.18, -0.32, "proton"],
          [0.15, 0.52, 0.35, "proton"],
          [-0.35, 0.42, -0.25, "neutron"],
        ].map(([x, y, z, type], idx) => (
          <mesh
            key={`nucleon-${idx}`}
            position={[x as number, y as number, z as number]}
            material={type === "proton" ? materials.proton : materials.neutron}
          >
            <sphereGeometry args={[0.32, 20, 20]} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 3. MONUMENTAL ELECTRON PROBABILITY ORBITALS & HARMONIC SHELLS */}
      {/* ------------------------------------------------------------- */}
      {/* Orbital Shell 1 (Cyan s-orbital / inner ring, R = 3.5m) */}
      <group ref={orbital1Ref}>
        <mesh material={materials.orbitalCyan}>
          <torusGeometry args={[3.5, 0.045, 14, 80]} />
        </mesh>
        {/* Electron Probability Density Node */}
        <mesh position={[3.5, 0, 0]} material={materials.electronNode}>
          <sphereGeometry args={[0.14, 16, 16]} />
        </mesh>
        <pointLight position={[3.5, 0, 0]} color="#00e5ff" intensity={4.0} distance={10} />
      </group>

      {/* Orbital Shell 2 (Violet p-orbital / tilted ring, R = 6.0m) */}
      <group ref={orbital2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <mesh material={materials.orbitalViolet}>
          <torusGeometry args={[6.0, 0.05, 14, 80]} />
        </mesh>
        <mesh position={[0, 6.0, 0]} material={materials.electronNode}>
          <sphereGeometry args={[0.16, 16, 16]} />
        </mesh>
        <pointLight position={[0, 6.0, 0]} color="#7c4dff" intensity={4.5} distance={12} />
      </group>

      {/* Orbital Shell 3 (Magenta d-orbital / wide outer ring, R = 8.8m) */}
      <group ref={orbital3Ref} rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
        <mesh material={materials.orbitalMagenta}>
          <torusGeometry args={[8.8, 0.055, 14, 80]} />
        </mesh>
        <mesh position={[-8.8, 0, 0]} material={materials.electronNode}>
          <sphereGeometry args={[0.18, 16, 16]} />
        </mesh>
        <pointLight position={[-8.8, 0, 0]} color="#ff4081" intensity={5.0} distance={14} />
      </group>

      {/* Orbital Shell 4 (Azure hybrid orbital / monumental perimeter, R = 11.8m) */}
      <group ref={orbital4Ref} rotation={[Math.PI / 5, -Math.PI / 3, 0]}>
        <mesh material={materials.orbitalAzure}>
          <torusGeometry args={[11.8, 0.055, 14, 80]} />
        </mesh>
        <mesh position={[0, -11.8, 0]} material={materials.electronNode}>
          <sphereGeometry args={[0.2, 16, 16]} />
        </mesh>
        <pointLight position={[0, -11.8, 0]} color="#29b6f6" intensity={5.0} distance={16} />
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 4. QUANTUM PROBABILITY WAVEFUNCTION CLOUD                     */}
      {/* ------------------------------------------------------------- */}
      <points ref={wavePointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[_particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[_particleColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ------------------------------------------------------------- */}
      {/* 5. MOLECULAR BOND LATTICE (Positioned toward Cosmic Rift)      */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -10.0]}>
        {[
          [0, 2.5, -2.0, 0.5, 0.3, 0.2],
          [-2.8, -1.8, -1.5, -0.4, 0.6, 0.1],
          [2.8, -1.4, -2.5, 0.6, -0.3, 0.5],
          [0, -2.6, -3.0, -0.3, 0.2, -0.4],
        ].map(([x, y, z, rx, ry, rz], idx) => (
          <group key={`lattice-${idx}`} position={[x, y, z]} rotation={[rx, ry, rz]}>
            <mesh material={materials.latticeBond}>
              <cylinderGeometry args={[0.05, 0.05, 5.0, 12]} />
            </mesh>
            <mesh position={[0, 2.5, 0]} material={materials.orbitalCyan}>
              <sphereGeometry args={[0.3, 16, 16]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
