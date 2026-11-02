"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SNOW_COUNT = 200;
const PLANKTON_COUNT = 80; // Reduced — bioluminescence should be sparse

const _snowPositions = new Float32Array(SNOW_COUNT * 3);
const _snowSpeeds = new Float32Array(SNOW_COUNT * 3);

const _planktonPositions = new Float32Array(PLANKTON_COUNT * 3);
const _planktonSpeeds = new Float32Array(PLANKTON_COUNT * 3);

// Deterministic static initialization of ocean particles at module load
(function initOceanParticles() {
  let seed = 83921;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Marine Snow — organic detritus drifting down
  for (let i = 0; i < SNOW_COUNT; i++) {
    _snowPositions[i * 3] = (rand() - 0.5) * 40;
    _snowPositions[i * 3 + 1] = THREE.MathUtils.lerp(-2.0, -25.0, rand());
    _snowPositions[i * 3 + 2] = THREE.MathUtils.lerp(-390.0, -560.0, rand());

    _snowSpeeds[i * 3] = (rand() - 0.5) * 0.08;
    _snowSpeeds[i * 3 + 1] = -(0.15 + rand() * 0.25); // slow downwards
    _snowSpeeds[i * 3 + 2] = -(0.06 + rand() * 0.12); // gentle current
  }

  // Bioluminescent Plankton — sparse, isolated specks in the dark
  for (let i = 0; i < PLANKTON_COUNT; i++) {
    _planktonPositions[i * 3] = (rand() - 0.5) * 32;
    _planktonPositions[i * 3 + 1] = THREE.MathUtils.lerp(-4.0, -22.0, rand());
    _planktonPositions[i * 3 + 2] = THREE.MathUtils.lerp(-400.0, -550.0, rand());

    _planktonSpeeds[i * 3] = (rand() - 0.5) * 0.12;
    _planktonSpeeds[i * 3 + 1] = (rand() - 0.5) * 0.10;
    _planktonSpeeds[i * 3 + 2] = -(0.08 + rand() * 0.15);
  }
})();

/**
 * OceanParticles — Marine Snow and sparse bioluminescent plankton.
 *
 * MASTER REALISM PASS:
 * - Marine snow: smaller, more numerous, slower drift (organic detritus)
 * - Bioluminescent plankton: SPARSE (80 particles, not 120)
 * - Plankton glow is subtle (lower opacity, smaller size)
 * - NOT neon blue — muted cool-white with slight blue tint
 * - The abyss must remain DARK — plankton are isolated living organisms
 * - Spans Z: -390 to -565, Y: -2 to -26.
 * - Zero per-frame allocations in useFrame.
 */
export default function OceanParticles() {
  const marineSnowRef = useRef<THREE.Points>(null);
  const planktonRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.05);

    // Update Marine Snow positions
    if (marineSnowRef.current) {
      const posAttr = marineSnowRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < SNOW_COUNT; i++) {
        const idx = i * 3;
        arr[idx] += _snowSpeeds[idx] * safeDelta;
        arr[idx + 1] += _snowSpeeds[idx + 1] * safeDelta;
        arr[idx + 2] += _snowSpeeds[idx + 2] * safeDelta;

        // Reset if fallen below seabed or past boundary
        if (arr[idx + 1] < -26.0) {
          arr[idx + 1] = -2.0;
        }
        if (arr[idx + 2] < -565.0) {
          arr[idx + 2] = -390.0;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update Bioluminescent Plankton
    if (planktonRef.current) {
      const posAttr = planktonRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < PLANKTON_COUNT; i++) {
        const idx = i * 3;
        arr[idx] += _planktonSpeeds[idx] * safeDelta;
        arr[idx + 1] += _planktonSpeeds[idx + 1] * safeDelta;
        arr[idx + 2] += _planktonSpeeds[idx + 2] * safeDelta;

        if (arr[idx + 2] < -560.0) {
          arr[idx + 2] = -395.0;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="ocean-particles">
      {/* Marine Snow — natural organic detritus, small, white */}
      <points ref={marineSnowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[_snowPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.10}
          color="#8aa0b4"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Bioluminescent Plankton — sparse, subtle, organic */}
      <points ref={planktonRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[_planktonPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#5aafcc"
          transparent
          opacity={0.50}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
