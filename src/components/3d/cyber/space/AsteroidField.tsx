"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Creates irregular faceted asteroid geometries using displaced icosahedrons
 * with crater dents and natural asteroid morphology
 */
function createAsteroidGeometries(): THREE.BufferGeometry[] {
  const geos: THREE.BufferGeometry[] = [];
  for (let g = 0; g < 4; g++) {
    const geo = new THREE.IcosahedronGeometry(1.0, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const noise =
        1.0 +
        (Math.sin(vx * 3.4 + g * 1.5) * 0.28 +
          Math.cos(vy * 2.9 + g * 2.2) * 0.22 +
          Math.sin(vz * 3.7 + g) * 0.18);
      pos.setXYZ(i, vx * noise, vy * noise, vz * noise);
    }
    geo.computeVertexNormals();
    geos.push(geo);
  }
  return geos;
}

/**
 * Curving 3D Asteroid Belt in the Lower-Right Foreground
 * Directly matching the reference image's rocky debris arc extending across deep space.
 */
export default function AsteroidField() {
  const geos = useMemo(() => createAsteroidGeometries(), []);
  const groupRef = useRef<THREE.Group>(null);

  // Generate 54 individual asteroids along a curving foreground-to-midground arc
  const asteroids = useMemo(() => {
    const list = [];
    const count = 54;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      // Curving arc across the lower right quadrant
      const angle = 0.15 + u * 1.35;
      const radius = 380 + Math.sin(u * Math.PI * 2.5) * 90;
      const x = 90 + Math.cos(angle) * radius + (Math.random() - 0.5) * 45;
      const y = -15 + Math.sin(u * 1.6) * 60 + (Math.random() - 0.5) * 40;
      const z = -3080 - u * 480 + (Math.random() - 0.5) * 80;

      // Foreground asteroids are larger (up to 24m), tapering into the distance
      const scale = 3.5 + (1.0 - u * 0.5) * (Math.random() * 16 + 5);
      const geoIdx = i % 4;
      const rotSpeed = [
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
      ] as [number, number, number];

      list.push({
        pos: [x, y, z] as [number, number, number],
        scale: [scale * (0.8 + Math.random() * 0.4), scale, scale * (0.8 + Math.random() * 0.4)] as [
          number,
          number,
          number
        ],
        rotSpeed,
        geoIdx,
      });
    }
    return list;
  }, []);

  const asteroidRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    asteroids.forEach((a, i) => {
      const mesh = asteroidRefs.current[i];
      if (mesh) {
        mesh.rotation.x += a.rotSpeed[0];
        mesh.rotation.y += a.rotSpeed[1];
        mesh.rotation.z += a.rotSpeed[2];
      }
    });
  });

  return (
    <group ref={groupRef} name="asteroid-field">
      {asteroids.map((a, idx) => (
        <mesh
          key={`asteroid-${idx}`}
          ref={(el) => {
            asteroidRefs.current[idx] = el;
          }}
          geometry={geos[a.geoIdx]}
          position={a.pos}
          scale={a.scale}
        >
          <meshStandardMaterial
            color="#5e5852"
            emissive="#322c26"
            emissiveIntensity={0.4}
            roughness={0.92}
            metalness={0.2}
            flatShading
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}
