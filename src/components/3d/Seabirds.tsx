"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shared materials for seabirds
const birdMaterials = {
  body: new THREE.MeshBasicMaterial({
    color: "#e8eff5",
    side: THREE.DoubleSide,
  }),
  wingTips: new THREE.MeshBasicMaterial({
    color: "#2b3947",
    side: THREE.DoubleSide,
  }),
};

interface BirdConfig {
  center: [number, number, number];
  radiusX: number;
  radiusZ: number;
  speed: number;
  phase: number;
  heightAmp: number;
  flapSpeed: number;
  scale: number;
}

const BIRD_CONFIGS: BirdConfig[] = [
  // High soaring thermal circle near open ocean & whale zone
  { center: [12, 24, -690], radiusX: 28, radiusZ: 34, speed: 0.35, phase: 0.0, heightAmp: 2.5, flapSpeed: 4.5, scale: 0.9 },
  { center: [12, 25, -690], radiusX: 25, radiusZ: 30, speed: 0.38, phase: 1.8, heightAmp: 2.0, flapSpeed: 5.0, scale: 0.8 },
  { center: [12, 26, -690], radiusX: 32, radiusZ: 38, speed: 0.32, phase: 3.4, heightAmp: 3.0, flapSpeed: 4.2, scale: 1.0 },

  // Gliding birds crossing above surface breakthrough zone
  { center: [-18, 18, -725], radiusX: 22, radiusZ: 26, speed: 0.42, phase: 0.8, heightAmp: 1.8, flapSpeed: 5.5, scale: 0.85 },
  { center: [-18, 19, -725], radiusX: 26, radiusZ: 30, speed: 0.40, phase: 2.5, heightAmp: 2.2, flapSpeed: 4.8, scale: 0.95 },
  { center: [-18, 17, -725], radiusX: 19, radiusZ: 23, speed: 0.45, phase: 4.2, heightAmp: 1.5, flapSpeed: 6.0, scale: 0.75 },

  // Coastline & cliff soaring flock
  { center: [25, 22, -765], radiusX: 30, radiusZ: 24, speed: 0.34, phase: 0.5, heightAmp: 2.8, flapSpeed: 4.6, scale: 0.9 },
  { center: [-20, 20, -780], radiusX: 24, radiusZ: 20, speed: 0.38, phase: 1.9, heightAmp: 2.0, flapSpeed: 5.2, scale: 0.85 },
  { center: [0, 26, -795], radiusX: 35, radiusZ: 28, speed: 0.30, phase: 3.1, heightAmp: 3.2, flapSpeed: 4.0, scale: 1.05 },
  { center: [15, 28, -805], radiusX: 20, radiusZ: 22, speed: 0.44, phase: 5.0, heightAmp: 1.8, flapSpeed: 5.8, scale: 0.8 },
  { center: [-28, 24, -815], radiusX: 26, radiusZ: 25, speed: 0.36, phase: 2.2, heightAmp: 2.4, flapSpeed: 4.9, scale: 0.9 },
  { center: [5, 23, -825], radiusX: 22, radiusZ: 18, speed: 0.40, phase: 4.0, heightAmp: 2.1, flapSpeed: 5.4, scale: 0.85 },
];

/**
 * Seabirds — Cinematic flock of coastal seabirds soaring and gliding
 * above the ocean surface, breaking waves, and coastal cliffs.
 *
 * Spans Z: -680 to -830, Y: 16 to 30.
 * Zero per-frame heap allocations in useFrame.
 */
export default function Seabirds() {
  const birdGroupsRef = useRef<(THREE.Group | null)[]>([]);
  const leftWingsRef = useRef<(THREE.Mesh | null)[]>([]);
  const rightWingsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < BIRD_CONFIGS.length; i++) {
      const g = birdGroupsRef.current[i];
      if (!g) continue;
      const cfg = BIRD_CONFIGS[i];

      const angle = t * cfg.speed + cfg.phase;
      const x = cfg.center[0] + Math.sin(angle) * cfg.radiusX;
      const z = cfg.center[2] + Math.cos(angle) * cfg.radiusZ;
      const y = cfg.center[1] + Math.sin(angle * 2.0) * cfg.heightAmp;

      g.position.set(x, y, z);

      // Tangent heading angle
      const dx = Math.cos(angle) * cfg.radiusX;
      const dz = -Math.sin(angle) * cfg.radiusZ;
      const heading = Math.atan2(dx, dz);

      // Natural bank into turns
      const roll = Math.sin(angle) * 0.22;
      const pitch = -Math.cos(angle * 2.0) * 0.08;
      g.rotation.set(pitch, heading, roll);

      // Wing flapping motion with gliding pauses
      const flapCycle = Math.sin(t * cfg.flapSpeed + cfg.phase);
      const flapAngle = flapCycle * 0.35;

      const lw = leftWingsRef.current[i];
      const rw = rightWingsRef.current[i];
      if (lw && rw) {
        lw.rotation.z = flapAngle;
        rw.rotation.z = -flapAngle;
      }
    }
  });

  return (
    <group name="coastal-seabirds-flock">
      {BIRD_CONFIGS.map((cfg, idx) => (
        <group
          key={`seabird-${idx}`}
          ref={(el) => {
            birdGroupsRef.current[idx] = el;
          }}
          scale={[cfg.scale, cfg.scale, cfg.scale]}
        >
          {/* Bird Fuselage Body */}
          <mesh material={birdMaterials.body} position={[0, 0, 0]}>
            <coneGeometry args={[0.22, 1.4, 4]} />
          </mesh>

          {/* Left Wing */}
          <mesh
            ref={(el) => {
              leftWingsRef.current[idx] = el;
            }}
            position={[-0.15, 0.05, 0.1]}
            rotation={[0, 0.15, 0]}
            material={birdMaterials.body}
          >
            <boxGeometry args={[1.5, 0.04, 0.45]} />
          </mesh>

          {/* Right Wing */}
          <mesh
            ref={(el) => {
              rightWingsRef.current[idx] = el;
            }}
            position={[0.15, 0.05, 0.1]}
            rotation={[0, -0.15, 0]}
            material={birdMaterials.body}
          >
            <boxGeometry args={[1.5, 0.04, 0.45]} />
          </mesh>

          {/* Tail Feathers */}
          <mesh position={[0, 0.05, -0.75]} rotation={[-0.15, 0, 0]} material={birdMaterials.wingTips}>
            <boxGeometry args={[0.45, 0.03, 0.6]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
