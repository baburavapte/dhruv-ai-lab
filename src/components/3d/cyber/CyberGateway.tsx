"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Monumental Circular Cyan Energy Gateway
 * The iconic centerpiece of the Cybernetic Space Frontier.
 * Features:
 * - Massive multi-tiered concentric titanium rings
 * - Counter-rotating inner runic energy rings
 * - Radiant cyan plasma event horizon
 * - Heavy industrial support pylons solidly rooting into the plaza
 * - Particle inflow vortex
 */
export default function CyberGateway({
  position = [0, 16.0, -2850],
}: {
  position?: [number, number, number];
}) {
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const vortexRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (midRingRef.current) {
      midRingRef.current.rotation.z = t * 0.45;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.65;
    }
    if (vortexRef.current) {
      const mat = vortexRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(t * 2.5) * 0.12;
      }
    }
    if (glowLightRef.current) {
      glowLightRef.current.intensity = 3.5 + Math.sin(t * 3.0) * 0.6;
    }
  });

  const outerRadius = 22.0;

  return (
    <group position={position} name="cyber-gateway">
      {/* 1. Heavy Industrial Support Pylons (Meeting ground at Y = -16.0, world Y = 0) */}
      {/* Left Angular Support Pylon */}
      <group position={[-outerRadius - 1.5, -8.0, 0]}>
        {/* Main Pylon Column */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.22]}>
          <boxGeometry args={[4.2, 20.0, 5.5]} />
          <meshStandardMaterial color="#0b1016" roughness={0.4} metalness={0.85} />
        </mesh>
        {/* Foundation Plinth Base at ground Y = 0 */}
        <mesh position={[-2.2, -8.0, 0]}>
          <boxGeometry args={[8.0, 2.0, 8.0]} />
          <meshStandardMaterial color="#141c26" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Vertical Cyan Neon Strip on Pylon */}
        <mesh position={[0.2, 0, 2.8]} rotation={[0, 0, -0.22]}>
          <boxGeometry args={[0.3, 18.0, 0.2]} />
          <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.5} />
        </mesh>
      </group>

      {/* Right Angular Support Pylon */}
      <group position={[outerRadius + 1.5, -8.0, 0]}>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.22]}>
          <boxGeometry args={[4.2, 20.0, 5.5]} />
          <meshStandardMaterial color="#0b1016" roughness={0.4} metalness={0.85} />
        </mesh>
        <mesh position={[2.2, -8.0, 0]}>
          <boxGeometry args={[8.0, 2.0, 8.0]} />
          <meshStandardMaterial color="#141c26" roughness={0.6} metalness={0.7} />
        </mesh>
        <mesh position={[-0.2, 0, 2.8]} rotation={[0, 0, 0.22]}>
          <boxGeometry args={[0.3, 18.0, 0.2]} />
          <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.5} />
        </mesh>
      </group>

      {/* 2. Outer Structural Ring Chassis (Titanium Segmented Torus) */}
      <group ref={outerRingRef}>
        {/* Heavy Torus Outer Chassis */}
        <mesh>
          <torusGeometry args={[outerRadius, 2.2, 16, 64]} />
          <meshStandardMaterial color="#0d141d" roughness={0.35} metalness={0.9} />
        </mesh>
        {/* Segmented Clamping Collars */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const ang = (idx / 16) * Math.PI * 2;
          const cx = Math.cos(ang) * outerRadius;
          const cy = Math.sin(ang) * outerRadius;
          return (
            <group key={`collar-${idx}`} position={[cx, cy, 0]} rotation={[0, 0, ang]}>
              <mesh>
                <boxGeometry args={[3.2, 4.8, 4.8]} />
                <meshStandardMaterial color="#1a2535" roughness={0.45} metalness={0.85} />
              </mesh>
              {/* Radial Cyan Glowing Core Emitter */}
              <mesh position={[0, 0, 2.45]}>
                <boxGeometry args={[1.8, 1.8, 0.2]} />
                <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. Mid Counter-Rotating Energy Conduit Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[18.8, 0.9, 16, 48]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00b4d8"
          emissiveIntensity={3.0}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Inner Luminous Runic Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[16.2, 0.55, 16, 40]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00f0ff"
          emissiveIntensity={4.2}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* 5. Central Plasma Event Horizon Membrane (Camera passes through at Z = -2850) */}
      <mesh ref={vortexRef}>
        <circleGeometry args={[15.6, 48]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radiant Gateway Core Lights */}
      <pointLight ref={glowLightRef} color="#00e5ff" intensity={3.5} distance={75} />
      <pointLight color="#0077b6" intensity={2.0} distance={45} position={[0, 0, -8]} />
    </group>
  );
}

