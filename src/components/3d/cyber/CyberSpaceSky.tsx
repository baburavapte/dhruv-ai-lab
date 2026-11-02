"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import CosmicStarfield from "./space/CosmicStarfield";
import CosmicNebulae from "./space/CosmicNebulae";
import SpiralGalaxies from "./space/SpiralGalaxies";
import RealisticPlanets from "./space/RealisticPlanets";
import AsteroidField from "./space/AsteroidField";

/**
 * The Colossal Orbital Space Station
 * Multi-ring orbital megastructure overlooking the planet and deep space
 */
function OrbitalSpaceStation({
  position = [280, 320, -3700],
}: {
  position?: [number, number, number];
}) {
  const stationRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.08;
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 0.12;
    if (stationRef.current) stationRef.current.rotation.y = 0.35 + Math.sin(t * 0.04) * 0.05;
  });

  return (
    <group ref={stationRef} position={position} rotation={[0.25, 0.35, -0.15]}>
      {/* Central Command Spire */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[5.5, 9.5, 140, 16]} />
        <meshStandardMaterial
          color="#c2d1e0"
          emissive="#557799"
          emissiveIntensity={0.6}
          roughness={0.35}
          metalness={0.85}
          fog={false}
        />
      </mesh>

      {/* Communications Apex Array */}
      <mesh position={[0, 78, 0]}>
        <cylinderGeometry args={[0.4, 1.2, 35, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} fog={false} />
      </mesh>
      <mesh position={[0, 95, 0]}>
        <sphereGeometry args={[1.8, 8, 8]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={4.0} fog={false} />
      </mesh>

      {/* Outer Massive Torus Habitat Ring (Radius 85m) */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[85, 4.2, 16, 64]} />
        <meshStandardMaterial
          color="#d4e0ec"
          emissive="#6688aa"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.8}
          fog={false}
        />
      </mesh>

      {/* Outer Ring Illuminated Window Ribbons */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[85, 4.4, 8, 64]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00e5ff"
          emissiveIntensity={3.2}
          wireframe
          fog={false}
        />
      </mesh>

      {/* Secondary Inner Gravitational Wheel (Radius 52m) */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[52, 2.8, 12, 48]} />
        <meshStandardMaterial
          color="#a0b3c6"
          emissive="#446688"
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.85}
          fog={false}
        />
      </mesh>

      {/* 6 Radiating Structural Spoke Pylons */}
      {Array.from({ length: 6 }).map((_, sidx) => {
        const ang = (sidx / 6) * Math.PI * 2;
        return (
          <group key={`station-spoke-${sidx}`} rotation={[0, 0, ang]}>
            <mesh position={[42.5, 0, 0]}>
              <boxGeometry args={[85, 2.2, 2.4]} />
              <meshStandardMaterial color="#1a2535" roughness={0.5} metalness={0.75} fog={false} />
            </mesh>
          </group>
        );
      })}

      {/* Docked Starships */}
      {[-35, 45, -75].map((offZ, oi) => (
        <group key={`docked-ship-${oi}`} position={[88, oi * 12 - 12, offZ]} rotation={[0, 0, 0.4]}>
          <mesh>
            <coneGeometry args={[2.5, 14, 8]} />
            <meshStandardMaterial color="#eef2f7" metalness={0.8} roughness={0.3} fog={false} />
          </mesh>
          <mesh position={[0, -7.2, 0]}>
            <sphereGeometry args={[1.2, 8, 8]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.5} fog={false} />
          </mesh>
        </group>
      ))}

      {/* Station Beacon Lights */}
      <pointLight color="#00e5ff" intensity={3.0} distance={220} />
      <pointLight color="#ffffff" intensity={2.2} distance={180} position={[0, 40, 0]} />
    </group>
  );
}

/**
 * Animated Interplanetary Spacecraft Cruiser
 */
function SpacecraftCruiser({
  speed = 18,
  routeRadius = 240,
  altitude = 180,
  centerZ = -3400,
}: {
  speed?: number;
  routeRadius?: number;
  altitude?: number;
  centerZ?: number;
}) {
  const shipRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (shipRef.current) {
      const ang = (t * speed * 0.015) % (Math.PI * 2);
      shipRef.current.position.x = 180 + Math.cos(ang) * routeRadius;
      shipRef.current.position.y = altitude + Math.sin(ang * 2) * 18;
      shipRef.current.position.z = centerZ + Math.sin(ang) * (routeRadius * 0.7);
      shipRef.current.rotation.y = -ang + Math.PI / 2;
    }
  });

  return (
    <group ref={shipRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[3.2, 18.0, 8]} />
        <meshStandardMaterial
          color="#e2ebf3"
          emissive="#446688"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.85}
          fog={false}
        />
      </mesh>
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[16.0, 0.4, 6.0]} />
        <meshStandardMaterial color="#0f1722" roughness={0.4} metalness={0.8} fog={false} />
      </mesh>
      {[-2.2, 2.2].map((tx, ti) => (
        <mesh key={`thruster-${ti}`} position={[tx, 0, 9.2]}>
          <cylinderGeometry args={[0.9, 1.2, 2.4, 8]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={4.5} fog={false} />
        </mesh>
      ))}
      <pointLight color="#00e5ff" intensity={1.5} distance={25} position={[0, 0, 10]} />
    </group>
  );
}

/**
 * Master Cybernetic Deep Space Environment
 * Combining:
 * 1. Dense natural starfield with spectral classifications & diffraction spike stars
 * 2. Multi-layer volumetric nebulae (indigo, violet, magenta, golden dust)
 * 3. Hero Milky Way spiral galaxy + multiple secondary galaxies & ellipticals
 * 4. Realistic planets (Colossal Blue planet with sunrise, Jupiter-like banded giant,
 *    Saturn-like ringed world, Mars-like rocky world, icy world & moons)
 * 5. Foreground 3D curving asteroid field
 * 6. Orbital space station and cruising spacecraft traffic
 */
export default function CyberSpaceSky() {
  return (
    <group name="cyber-space-sky">
      {/* 1. Deep Space Cosmic Starfield & Diffraction Spikes */}
      <CosmicStarfield />

      {/* 2. Layered Cosmic Nebulae (Indigo, Violet, Magenta, Golden clouds) */}
      <CosmicNebulae />

      {/* 3. Spiral Galaxies (Hero Milky Way + Face-on + Tilted + Edge-on + Ellipticals) */}
      <SpiralGalaxies />

      {/* 4. Realistic Planetary Bodies (Planet A, B, C, D, E & Moons) */}
      <RealisticPlanets />

      {/* 5. 3D Curving Asteroid Belt (Lower-Right Foreground) */}
      <AsteroidField />

      {/* 6. Orbital Space Station (Positioned gracefully in mid-left orbital plane without occluding galaxies) */}
      <OrbitalSpaceStation position={[-140, 110, -3500]} />

      {/* 7. Active Spacecraft Cruisers in deep space flight routes */}
      <SpacecraftCruiser speed={14} routeRadius={280} altitude={190} centerZ={-3300} />
      <SpacecraftCruiser speed={22} routeRadius={340} altitude={240} centerZ={-3500} />
      <SpacecraftCruiser speed={18} routeRadius={220} altitude={150} centerZ={-3100} />
    </group>
  );
}
