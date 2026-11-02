"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Low-Poly Futuristic Pedestrian Figure
 */
function CyberCitizen({
  position,
  rotationY = 0,
  accentColor = "#00e5ff",
  isDroid = false,
}: {
  position: [number, number, number];
  rotationY?: number;
  accentColor?: string;
  isDroid?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {isDroid ? (
        // Hovering Service Droid
        <group position={[0, 1.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.35, 10, 10]} />
            <meshStandardMaterial color="#e0e8f0" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.32]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.08, 0.18, 0.3, 8]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
          </mesh>
        </group>
      ) : (
        // Humanoid Citizen
        <group>
          {/* Legs */}
          <mesh position={[-0.14, 0.45, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.9, 6]} />
            <meshStandardMaterial color="#111822" roughness={0.7} />
          </mesh>
          <mesh position={[0.14, 0.45, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.9, 6]} />
            <meshStandardMaterial color="#111822" roughness={0.7} />
          </mesh>
          {/* Torso / Jacket */}
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[0.55, 0.8, 0.3]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
          {/* Glowing Collar / Seam */}
          <mesh position={[0, 1.6, 0.16]}>
            <boxGeometry args={[0.25, 0.06, 0.04]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.0} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.85, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Master Cyber Crowd Component
 * Distributes citizens, researchers, and service droids on side terraces
 */
export default function CyberCrowd() {
  const people = useMemo(() => {
    const list = [];
    const colors = ["#00e5ff", "#ff007f", "#ff9100", "#7928ca", "#00f0ff"];

    // Left Terrace Pedestrians
    for (let z = -2510; z >= -2820; z -= 14) {
      const px = -13.5 + (Math.sin(z * 3.7) * 1.5);
      list.push({
        pos: [px, 0.4, z] as [number, number, number],
        rot: Math.sin(z) * Math.PI,
        col: colors[Math.abs(Math.floor(z)) % colors.length],
        droid: Math.abs(z) % 42 === 0,
      });
    }

    // Right Terrace Pedestrians
    for (let z = -2515; z >= -2820; z -= 16) {
      const px = 13.5 + (Math.cos(z * 2.9) * 1.5);
      list.push({
        pos: [px, 0.4, z] as [number, number, number],
        rot: Math.cos(z) * Math.PI,
        col: colors[Math.abs(Math.floor(z * 2)) % colors.length],
        droid: Math.abs(z) % 36 === 0,
      });
    }

    return list;
  }, []);

  return (
    <group name="cyber-crowd">
      {people.map((p, idx) => (
        <CyberCitizen
          key={`citizen-${idx}`}
          position={p.pos}
          rotationY={p.rot}
          accentColor={p.col}
          isDroid={p.droid}
        />
      ))}
    </group>
  );
}

