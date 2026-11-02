"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Cybernetic Needle Spire Skyscraper
 * Slender monumental tower with tapering crown, antenna mast, and vertical light ribs
 */
function CyberNeedleSpire({
  position,
  height = 180,
  width = 24,
  depth = 26,
  accentColor = "#00e5ff",
}: {
  position: [number, number, number];
  height?: number;
  width?: number;
  depth?: number;
  accentColor?: string;
}) {
  return (
    <group position={position}>
      {/* Lower Main Tower Shaft */}
      <mesh position={[0, height * 0.35, 0]}>
        <boxGeometry args={[width, height * 0.7, depth]} />
        <meshStandardMaterial color="#0e141c" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Recessed Blue Glass Facade Bands */}
      <mesh position={[0, height * 0.35, depth / 2 + 0.1]}>
        <boxGeometry args={[width * 0.85, height * 0.65, 0.2]} />
        <meshStandardMaterial
          color="#061c30"
          emissive="#003355"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* Vertical Illuminating Corner Ribs */}
      {[-width / 2, width / 2].map((rx, ri) => (
        <mesh key={`rib-${ri}`} position={[rx, height * 0.35, depth / 2 + 0.2]}>
          <boxGeometry args={[0.4, height * 0.7, 0.4]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={3.0}
          />
        </mesh>
      ))}

      {/* Stepped Upper Crown (Y: height * 0.7 to height) */}
      <mesh position={[0, height * 0.82, 0]}>
        <boxGeometry args={[width * 0.65, height * 0.24, depth * 0.65]} />
        <meshStandardMaterial color="#141c26" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Needle Apex Spire with Glowing Beacon Tip */}
      <mesh position={[0, height + 16, 0]}>
        <cylinderGeometry args={[0.3, 1.4, 32, 8]} />
        <meshStandardMaterial color="#b0bec5" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Radiant Spire Beacon Tip */}
      <mesh position={[0, height + 32, 0]}>
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial
          color="#ff0055"
          emissive="#ff0055"
          emissiveIntensity={4.5}
        />
      </mesh>
      <pointLight color={accentColor} intensity={2.0} distance={45} position={[0, height * 0.75, depth / 2 + 3]} />
    </group>
  );
}

/**
 * Stepped Atrium Megatower with Multi-Tiered Illuminated Glass Decks
 */
function CyberAtriumComplex({
  position,
  width = 38,
  depth = 34,
  floors = 5,
  accentColor = "#7928ca",
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  floors?: number;
  accentColor?: string;
}) {
  const tiers = useMemo(() => {
    const list = [];
    const floorH = 26;
    for (let f = 0; f < floors; f++) {
      const u = f / floors;
      const tw = width * (1.0 - u * 0.38);
      const td = depth * (1.0 - u * 0.38);
      const ty = f * floorH + floorH / 2;
      list.push({ tw, td, ty, h: floorH, f });
    }
    return list;
  }, [width, depth, floors]);

  return (
    <group position={position}>
      {tiers.map((t) => (
        <group key={`tier-${t.f}`} position={[0, t.ty, 0]}>
          {/* Main Structural Block */}
          <mesh>
            <boxGeometry args={[t.tw, t.h, t.td]} />
            <meshStandardMaterial color="#0b1016" roughness={0.45} metalness={0.82} />
          </mesh>

          {/* Glowing Multi-Story Glass Window Ribbons */}
          <mesh position={[0, 0, t.td / 2 + 0.15]}>
            <boxGeometry args={[t.tw * 0.88, t.h * 0.65, 0.2]} />
            <meshStandardMaterial
              color="#0d2b45"
              emissive={t.f % 2 === 0 ? "#0088cc" : "#cc0088"}
              emissiveIntensity={0.5}
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>

          {/* Horizontal Floor Edge Neon Ring */}
          <mesh position={[0, t.h / 2, t.td / 2 + 0.25]}>
            <boxGeometry args={[t.tw + 0.6, 0.35, 0.35]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={2.8}
            />
          </mesh>
        </group>
      ))}

      {/* Cantilevered Observation Roof Platform */}
      <mesh position={[0, floors * 26 + 1.2, 0]}>
        <boxGeometry args={[width * 0.7, 2.4, depth * 0.7]} />
        <meshStandardMaterial color="#1a2535" roughness={0.3} metalness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Curved Blade Tower with Vertical Fins & Neon Accent Spines
 */
function CyberBladeTower({
  position,
  height = 210,
  width = 28,
  depth = 36,
  accentColor = "#00f0ff",
}: {
  position: [number, number, number];
  height?: number;
  width?: number;
  depth?: number;
  accentColor?: string;
}) {
  return (
    <group position={position}>
      {/* Aerodynamic Aerofoil Core */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0a0f16" roughness={0.38} metalness={0.85} />
      </mesh>

      {/* Front Curved Structural Prow / Fin */}
      <mesh position={[0, height / 2, depth / 2 + 1.2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 1.4, height, 12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={3.2}
        />
      </mesh>

      {/* Lateral Illuminated Window Columns */}
      {[-width / 2 - 0.1, width / 2 + 0.1].map((sx, si) => (
        <mesh key={`blade-win-${si}`} position={[sx, height / 2, 0]}>
          <boxGeometry args={[0.2, height * 0.85, depth * 0.75]} />
          <meshStandardMaterial
            color="#082035"
            emissive="#005577"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Rooftop Solar/Plasma Collector Ring */}
      <mesh position={[0, height + 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[8.5, 0.65, 12, 32]} />
        <meshStandardMaterial
          color="#ffd600"
          emissive="#ffab00"
          emissiveIntensity={2.5}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Illuminated Skybridge Connecting Distant Towers
 */
function CyberSkybridge({
  start,
  end,
  height = 5.5,
  width = 6.0,
}: {
  start: [number, number, number];
  end: [number, number, number];
  height?: number;
  width?: number;
}) {
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const midZ = (start[2] + end[2]) / 2;
  const len = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);

  return (
    <group position={[midX, midY, midZ]} rotation={[0, angle, 0]}>
      {/* Skybridge Core Tube */}
      <mesh>
        <boxGeometry args={[width, height, len]} />
        <meshStandardMaterial color="#121a24" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Glass Observation Strip */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width + 0.1, height * 0.55, len * 0.92]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#0099cc"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.15}
        />
      </mesh>
      {/* Under-glow Neon Rail */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[0.3, 0.2, len]} />
        <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.5} />
      </mesh>
    </group>
  );
}

/**
 * Master Cyber Skyline Component
 * Orchestrates monumental skyscrapers, tiered atriums, blade towers,
 * and high-altitude skybridges along both flanks of the central avenue.
 */
export default function CyberSkyline() {
  return (
    <group name="cyber-skyline">
      {/* =========================================================================
          LEFT FLANK SKYSCRAPERS (X: -26 to -75)
          ========================================================================= */}
      {/* 1. Foreground Left Monumental Blade Tower (Behind DHRUV AI LAB billboard) */}
      <CyberBladeTower
        position={[-32, 0, -2560]}
        height={220}
        width={32}
        depth={42}
        accentColor="#00e5ff"
      />

      {/* 2. Left Mid-Avenue Needle Spire */}
      <CyberNeedleSpire
        position={[-42, 0, -2630]}
        height={260}
        width={26}
        depth={28}
        accentColor="#ff007f"
      />

      {/* 3. Left Stepped Atrium Megatower */}
      <CyberAtriumComplex
        position={[-36, 0, -2700]}
        width={42}
        depth={38}
        floors={6}
        accentColor="#00e5ff"
      />

      {/* 4. Left Distant Super-Tall Needle Spire */}
      <CyberNeedleSpire
        position={[-48, 0, -2780]}
        height={280}
        width={30}
        depth={32}
        accentColor="#7928ca"
      />

      {/* 5. Left Gateway Flanking Pylon Tower */}
      <CyberBladeTower
        position={[-32, 0, -2840]}
        height={210}
        width={26}
        depth={34}
        accentColor="#00f0ff"
      />

      {/* Background Outer Left Skyscraper Clusters */}
      <CyberNeedleSpire position={[-75, 0, -2520]} height={190} width={34} depth={34} accentColor="#00b4d8" />
      <CyberAtriumComplex position={[-70, 0, -2620]} width={48} depth={44} floors={5} accentColor="#ff007f" />
      <CyberNeedleSpire position={[-80, 0, -2720]} height={240} width={36} depth={36} accentColor="#00f0ff" />
      <CyberBladeTower position={[-72, 0, -2820]} height={230} width={32} depth={36} accentColor="#7928ca" />

      {/* =========================================================================
          RIGHT FLANK SKYSCRAPERS (X: +26 to +75)
          Framing the view of the Colossal Planet & Orbital Station
          ========================================================================= */}
      {/* 1. Foreground Right Tiered Commercial Complex */}
      <CyberAtriumComplex
        position={[32, 0, -2550]}
        width={38}
        depth={36}
        floors={5}
        accentColor="#ff8800"
      />

      {/* 2. Right Mid-Avenue Blade Tower */}
      <CyberBladeTower
        position={[38, 0, -2630]}
        height={200}
        width={28}
        depth={36}
        accentColor="#00e5ff"
      />

      {/* 3. Right Needle Spire */}
      <CyberNeedleSpire
        position={[34, 0, -2710]}
        height={240}
        width={24}
        depth={28}
        accentColor="#ff007f"
      />

      {/* 4. Right Gateway Flanking Tower */}
      <CyberBladeTower
        position={[32, 0, -2840]}
        height={210}
        width={26}
        depth={34}
        accentColor="#00f0ff"
      />

      {/* Background Outer Right Skyscraper Clusters */}
      <CyberNeedleSpire position={[72, 0, -2540]} height={175} width={32} depth={32} accentColor="#ffaa00" />
      <CyberAtriumComplex position={[78, 0, -2650]} width={46} depth={42} floors={5} accentColor="#00e5ff" />
      <CyberNeedleSpire position={[75, 0, -2760]} height={230} width={32} depth={34} accentColor="#7928ca" />

      {/* =========================================================================
          HIGH-ALTITUDE SKYBRIDGES SPANNING THE MEGASTRUCTURES
          ========================================================================= */}
      {/* Left side Skybridges */}
      <CyberSkybridge start={[-32, 85, -2560]} end={[-42, 92, -2630]} />
      <CyberSkybridge start={[-42, 120, -2630]} end={[-36, 115, -2700]} />
      <CyberSkybridge start={[-36, 95, -2700]} end={[-48, 105, -2780]} />

      {/* Right side Skybridges */}
      <CyberSkybridge start={[32, 75, -2550]} end={[38, 82, -2630]} />
      <CyberSkybridge start={[38, 110, -2630]} end={[34, 105, -2710]} />
      <CyberSkybridge start={[34, 90, -2710]} end={[32, 95, -2840]} />
    </group>
  );
}

