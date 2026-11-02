"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Aerodynamic Cyber Maglev Bullet Train
 * Sleek bullet nose, illuminated cyan window strip, and glowing magnetic levitation cushions
 */
function MaglevBulletTrain({
  length = 26,
  width = 3.2,
  height = 3.4,
}: {
  length?: number;
  width?: number;
  height?: number;
}) {
  return (
    <group>
      {/* Aerodynamic Train Body */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color="#e0e8f0" roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Aerodynamic Front Bullet Nose */}
      <mesh position={[0, height / 2, -length / 2 - 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[width / 2, 3.6, 12]} />
        <meshStandardMaterial color="#d0dbe5" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* Aerodynamic Rear Nose */}
      <mesh position={[0, height / 2, length / 2 + 1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[width / 2, 3.6, 12]} />
        <meshStandardMaterial color="#d0dbe5" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* Continuous Glowing Cyan Window Ribbon (Both Sides) */}
      {[-width / 2 - 0.05, width / 2 + 0.05].map((wx, wi) => (
        <mesh key={`mag-win-${wi}`} position={[wx, height * 0.65, 0]}>
          <boxGeometry args={[0.1, 0.85, length * 0.88]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00e5ff"
            emissiveIntensity={3.2}
          />
        </mesh>
      ))}

      {/* Magnetic Levitation Undercarriage Glow Strip */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[width * 0.8, 0.2, length * 0.95]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={4.0}
        />
      </mesh>
      <pointLight color="#00e5ff" intensity={1.8} distance={16} position={[0, -0.4, 0]} />
    </group>
  );
}

/**
 * Master Cyber Transit Component:
 * - Left Elevated Maglev Track & Train (Y = 15.0, Z: -2500 to -2850)
 * - Right Elevated Maglev Track & Train (Y = 14.0, Z: -2520 to -2860)
 * - Curved Pylon Piers rooting into the ground/promenade
 */
export default function CyberTransit() {
  const train1Ref = useRef<THREE.Group>(null);
  const train2Ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Train 1 travelling inbound towards city (Z: -2850 to -2500)
    if (train1Ref.current) {
      const zPos = -2850 + ((t * 32) % 350);
      train1Ref.current.position.z = zPos;
    }
    // Train 2 travelling outbound towards spaceport (Z: -2500 to -2850)
    if (train2Ref.current) {
      const zPos = -2500 - ((t * 26) % 350);
      train2Ref.current.position.z = zPos;
    }
  });

  return (
    <group name="cyber-transit">
      {/* 1. Left Elevated Maglev Track (X = -20.5, Y = 15.0, length 360m) */}
      <group position={[-20.5, 15.0, -2675]}>
        {/* Track Beam (Concrete/Titanium Guideway) */}
        <mesh>
          <boxGeometry args={[4.2, 1.4, 360]} />
          <meshStandardMaterial color="#131b26" roughness={0.45} metalness={0.8} />
        </mesh>
        {/* Central Electromagnetic Levitation Rail */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.2, 0.25, 360]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
        {/* Outer Guardrails with Neon Edge */}
        {[-2.1, 2.1].map((gx, gi) => (
          <mesh key={`left-track-rail-${gi}`} position={[gx, 0.85, 0]}>
            <boxGeometry args={[0.15, 0.5, 360]} />
            <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={2.2} />
          </mesh>
        ))}

        {/* Support Pylons down to ground level Y = 0 */}
        {[-150, -90, -30, 30, 90, 150].map((pz, pi) => (
          <group key={`track-pylon-l-${pi}`} position={[0, -7.5, pz]}>
            <mesh>
              <cylinderGeometry args={[1.2, 1.8, 15.0, 10]} />
              <meshStandardMaterial color="#1a2535" roughness={0.5} metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Animated Train 1 on Left Track */}
      <group ref={train1Ref} position={[-20.5, 16.0, -2600]}>
        <MaglevBulletTrain length={32} width={3.4} height={3.6} />
      </group>

      {/* 2. Right Elevated Maglev Track (X = 20.5, Y = 14.0, length 360m) */}
      <group position={[20.5, 14.0, -2675]}>
        <mesh>
          <boxGeometry args={[4.2, 1.4, 360]} />
          <meshStandardMaterial color="#131b26" roughness={0.45} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.2, 0.25, 360]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} />
        </mesh>
        {[-2.1, 2.1].map((gx, gi) => (
          <mesh key={`right-track-rail-${gi}`} position={[gx, 0.85, 0]}>
            <boxGeometry args={[0.15, 0.5, 360]} />
            <meshStandardMaterial color="#ff9100" emissive="#ff6d00" emissiveIntensity={2.4} />
          </mesh>
        ))}

        {[-150, -90, -30, 30, 90, 150].map((pz, pi) => (
          <group key={`track-pylon-r-${pi}`} position={[0, -7.0, pz]}>
            <mesh>
              <cylinderGeometry args={[1.2, 1.8, 14.0, 10]} />
              <meshStandardMaterial color="#1a2535" roughness={0.5} metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Animated Train 2 on Right Track */}
      <group ref={train2Ref} position={[20.5, 15.0, -2700]}>
        <MaglevBulletTrain length={28} width={3.4} height={3.6} />
      </group>
    </group>
  );
}

