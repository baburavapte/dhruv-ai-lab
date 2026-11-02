"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


const DEFAULT_COUNT = 480;
const _bioPositions = new Float32Array(DEFAULT_COUNT * 3);
const _bioColors = new Float32Array(DEFAULT_COUNT * 3);

// Generate deterministic static cytoplasm particles once at module load
(function initBiologicalParticles() {
  let state = 49201;
  const rand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  const colorCyan = new THREE.Color("#00e5ff");
  const colorTeal = new THREE.Color("#64ffda");
  const colorViolet = new THREE.Color("#b388ff");
  const colorGreen = new THREE.Color("#69f0ae");

  for (let i = 0; i < DEFAULT_COUNT; i++) {
    // Distributed through the vast cytoplasmic chamber (Z = -224 to -355)
    const z = THREE.MathUtils.lerp(-224.0, -355.0, rand());
    // Cylindrical dispersion within 36m radius
    const theta = rand() * Math.PI * 2;
    const r = 2.0 + rand() * 34.0;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r * 0.75 + 3.0;

    _bioPositions[i * 3] = x;
    _bioPositions[i * 3 + 1] = y;
    _bioPositions[i * 3 + 2] = z;

    const pick = rand();
    const c =
      pick < 0.35
        ? colorTeal
        : pick < 0.65
        ? colorCyan
        : pick < 0.85
        ? colorViolet
        : colorGreen;

    _bioColors[i * 3] = c.r;
    _bioColors[i * 3 + 1] = c.g;
    _bioColors[i * 3 + 2] = c.b;
  }
})();

/**
 * BiologicalParticles — Living Cytoplasmic Micro-Particle Atmosphere
 *
 * Implements drifting microscopic molecules and proteins across the living cell fluid.
 * Pure GPU points rendering with deterministic pre-baked Float32 buffers.
 * Zero per-frame allocations.
 */
export default function BiologicalParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05);
    if (pointsRef.current) {
      // Subtle laminar drift through the cytoplasmic fluid
      pointsRef.current.rotation.z += safeDelta * 0.012;
      pointsRef.current.rotation.y += safeDelta * 0.008;
    }
  });

  return (
    <points ref={pointsRef} name="cytoplasmic-micro-particles">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[_bioPositions, 3]} />
        <bufferAttribute attach="attributes-color" args={[_bioColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
