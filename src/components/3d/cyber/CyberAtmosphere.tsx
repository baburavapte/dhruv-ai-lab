"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Cybernetic Atmosphere:
 * - Floating Holographic Dust Motes & Sparks
 * - Coordinated Cinematic Cyberpunk Lighting Hierarchy
 */
export default function CyberAtmosphere() {
  const pointsRef = useRef<THREE.Points>(null);

  const [particlePositions, particleColors] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cCyan = new THREE.Color("#00e5ff");
    const cMagenta = new THREE.Color("#ff007f");
    const cAmber = new THREE.Color("#ff9100");

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 44; // Across avenue
      pos[i * 3 + 1] = 1.0 + Math.random() * 24; // Above ground
      pos[i * 3 + 2] = -2490 - Math.random() * 370; // Along avenue

      const r = Math.random();
      const chosen = r < 0.5 ? cCyan : r < 0.8 ? cMagenta : cAmber;
      col[i * 3 + 0] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 350; i++) {
        pos[i * 3 + 1] += Math.sin(t * 1.5 + i) * 0.012;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="cyber-atmosphere">
      {/* 1. Floating Holographic Sparks and Motes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Coordinated Cinematic Lighting Hierarchy */}
      {/* Cool Cosmic / Starlight Directional Key Light from Upper Right */}
      <directionalLight
        position={[140, 220, -2700]}
        intensity={2.2}
        color="#c8e4ff"
      />

      {/* Cool Sky Hemisphere Light */}
      <hemisphereLight
        args={["#0c2540", "#030812", 0.85]}
      />

      {/* Atmospheric Cyan Fill Lights along Avenue */}
      <pointLight color="#00e5ff" intensity={1.8} distance={85} position={[-8, 12, -2560]} />
      <pointLight color="#00e5ff" intensity={1.8} distance={85} position={[8, 12, -2660]} />
      <pointLight color="#00e5ff" intensity={2.0} distance={95} position={[-8, 14, -2760]} />

      {/* Warm Magenta/Purple Garden Fill Lights */}
      <pointLight color="#ff007f" intensity={1.4} distance={60} position={[-14, 6, -2600]} />
      <pointLight color="#ff007f" intensity={1.4} distance={60} position={[14, 6, -2700]} />
    </group>
  );
}

