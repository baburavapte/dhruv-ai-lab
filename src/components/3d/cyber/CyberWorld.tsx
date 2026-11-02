"use client";

import React from "react";
import * as THREE from "three";
import CyberPromenade from "./CyberPromenade";
import CyberSkyline from "./CyberSkyline";
import CyberGateway from "./CyberGateway";
import CyberHolograms from "./CyberHolograms";
import CyberTransit from "./CyberTransit";
import CyberSpaceSky from "./CyberSpaceSky";
import CyberCrowd from "./CyberCrowd";
import CyberAtmosphere from "./CyberAtmosphere";

/**
 * Orbital Departure Platform (Spaceport Launch Deck)
 * Extends forward from the Gateway at Z = -2850 to Z = -3050 at Y = 16.0
 * Overlooking the edge of the megacity into deep space and the colossal planet.
 */
function OrbitalDepartureDeck() {
  return (
    <group position={[0, 16.0, -2950]}>
      {/* Cantilevered Launch Promenade Deck */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[36.0, 0.4, 200.0]} />
        <meshStandardMaterial color="#0f1622" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Runway Centerline Neon Beacons */}
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={`runway-light-${i}`} position={[0, 0.05, -90 + i * 10]}>
          <boxGeometry args={[0.8, 0.05, 4.0]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.5} />
        </mesh>
      ))}

      {/* Runway Edge Warning Strobe Rails */}
      {[-18, 18].map((rx, ri) => (
        <mesh key={`deck-edge-${ri}`} position={[rx, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.8, 200.0]} />
          <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={2.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Master Cybernetic Space Frontier World Component
 * Combining:
 * - Monumental Cyberpunk Megacity
 * - Wet reflective promenade with cherry blossoms & waterfalls
 * - Hero DHRUV AI LAB holographic mega-display
 * - Elevated maglev monorail transit
 * - Monumental circular energy gateway
 * - Orbital spaceport launch deck
 * - Colossal Blue Planet dominating the skyline
 * - Orbital Space Station with rotating rings
 * - Spiral Galaxy, Moons, Spacecraft traffic, and Deep Space
 */
export default function CyberWorld() {
  return (
    <group name="world-cybernetic-space-frontier">
      {/* 1. Cinematic Atmosphere, Lighting & Holographic Dust Motes */}
      <CyberAtmosphere />

      {/* 2. Wet Reflective Promenade, Gardens, Cherry Blossoms & Waterfalls */}
      <CyberPromenade />

      {/* 3. Monumental Futuristic Skyscrapers, Atriums & Skybridges */}
      <CyberSkyline />

      {/* 4. Central Monumental Cyan Energy Gateway (Z = -2850) */}
      <CyberGateway position={[0, 16.0, -2850]} />

      {/* 5. Hero DHRUV AI LAB Hologram, Commander Statue & Protagonist */}
      <CyberHolograms />

      {/* 6. Elevated Maglev Transit Network & Animated Bullet Trains */}
      <CyberTransit />

      {/* 7. Orbital Departure Spaceport Deck (Z: -2850 to -3050) */}
      <OrbitalDepartureDeck />

      {/* 8. Colossal Planet, Orbital Station, Spiral Galaxy, Moons & Spacecraft */}
      <CyberSpaceSky />

      {/* 9. Pedestrian Citizens, Researchers & Service Droids */}
      <CyberCrowd />
    </group>
  );
}

