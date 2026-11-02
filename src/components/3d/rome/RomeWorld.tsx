"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import RomeArchitecture from "./RomeArchitecture";
import RomeStreet from "./RomeStreet";
import RomeCrowd from "./RomeCrowd";
import RomeAtmosphere from "./RomeAtmosphere";

/**
 * Golden-Hour Mediterranean Sky Dome
 * Warm golden sunlight, soft cumulus clouds, and atmospheric horizon glow
 */
function RomeSkyDome() {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Golden-Hour Mediterranean Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0.0, "#1956b8"); // Deep azure zenith
    grad.addColorStop(0.3, "#3d7edc"); // Afternoon Mediterranean sky
    grad.addColorStop(0.55, "#7fa9e8"); // Soft blue-gold transition
    grad.addColorStop(0.72, "#e5b478"); // Golden amber warmth
    grad.addColorStop(0.86, "#f8d39e"); // Luminous golden hour horizon glow
    grad.addColorStop(1.0, "#fff0db"); // Radiant horizon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Radiant Golden Sun on Upper Left
    const sunX = 520;
    const sunY = 540;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 360);
    sunGrad.addColorStop(0.0, "rgba(255, 255, 245, 1.0)");
    sunGrad.addColorStop(0.12, "rgba(255, 245, 210, 0.9)");
    sunGrad.addColorStop(0.35, "rgba(255, 220, 150, 0.45)");
    sunGrad.addColorStop(0.7, "rgba(255, 200, 130, 0.15)");
    sunGrad.addColorStop(1.0, "rgba(255, 190, 120, 0.0)");
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Majestic Golden-Lit Cumulus Clouds (matching reference image)
    const cloudClusters = [
      // Major cloud bank over temple and right side
      { x: 920, y: 380, count: 18, baseR: 95 },
      { x: 1380, y: 340, count: 24, baseR: 110 },
      { x: 1720, y: 400, count: 16, baseR: 90 },
      { x: 380, y: 320, count: 14, baseR: 85 },
      { x: 680, y: 280, count: 15, baseR: 80 },
    ];

    cloudClusters.forEach((cluster) => {
      // Cloud shadow/underside (warm peach-amber)
      ctx.fillStyle = "rgba(224, 168, 128, 0.42)";
      for (let i = 0; i < cluster.count; i++) {
        const ox = (Math.sin(i * 1.7) * 0.9) * cluster.baseR * 1.8;
        const oy = (Math.cos(i * 2.3) * 0.4 + 0.25) * cluster.baseR;
        const r = cluster.baseR * (0.65 + Math.sin(i * 3.1) * 0.35);
        ctx.beginPath();
        ctx.arc(cluster.x + ox, cluster.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cloud sunlit illuminated top (glowing warm cream/white)
      ctx.fillStyle = "rgba(255, 248, 235, 0.65)";
      for (let i = 0; i < cluster.count; i++) {
        const ox = (Math.sin(i * 1.7) * 0.9) * cluster.baseR * 1.8;
        const oy = (Math.cos(i * 2.3) * 0.4 - 0.25) * cluster.baseR;
        const r = cluster.baseR * (0.6 + Math.sin(i * 3.1) * 0.3);
        ctx.beginPath();
        ctx.arc(cluster.x + ox, cluster.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, -2050]}>
      <sphereGeometry args={[1600, 32, 24]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/**
 * Rolling Italian Countryside & Hillside Terrain
 * Rolling hills, stone pines, and olive groves surrounding Imperial Rome
 */
function RomeSurroundingTerrain() {
  return (
    <group position={[0, -2, -2050]}>
      {/* Distant Hills Left (Behind Aqueduct) */}
      <mesh position={[-160, 18, -120]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[140, 55, 16]} />
        <meshStandardMaterial color="#8a7c5b" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[-240, 24, -40]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[180, 75, 16]} />
        <meshStandardMaterial color="#7a6e50" roughness={0.95} flatShading />
      </mesh>

      {/* Capitoline Hill Massif directly supporting Grand Temple */}
      <mesh position={[0, 12, -280]}>
        <cylinderGeometry args={[85, 140, 42, 24]} />
        <meshStandardMaterial color="#948465" roughness={0.88} flatShading />
      </mesh>

      {/* Distant Hills Right (Behind Colosseum) */}
      <mesh position={[180, 20, -140]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[160, 65, 16]} />
        <meshStandardMaterial color="#887858" roughness={0.92} flatShading />
      </mesh>
      <mesh position={[260, 26, 40]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[190, 80, 16]} />
        <meshStandardMaterial color="#7a6e50" roughness={0.95} flatShading />
      </mesh>

      {/* Surrounding Ground Plane (Fields, Grass, Terraces) */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color="#786c4a" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Imperial Golden Triumphal Dimensional Rift
 * Inside the Temple of Jupiter sanctuary at z = -2330.
 * Radiates golden dimensional energy to seamlessly loop the camera
 * back into the Dragon Fortress at progress 364..370.
 */
function ImperialTempleRift() {
  const portalRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.8;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 1.1;
    }
  });

  return (
    <group ref={portalRef} position={[0, 27.5, -2262]}>
      {/* Outer Golden Dimensional Torus Ring */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[5.5, 0.28, 16, 48]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffb300"
          emissiveIntensity={1.8}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Inner Counter-Rotating Runed Ring */}
      <mesh ref={ringRef2}>
        <torusGeometry args={[4.4, 0.22, 16, 40]} />
        <meshStandardMaterial
          color="#ffe082"
          emissive="#ffa000"
          emissiveIntensity={2.2}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Center Radiant Event Horizon Membrane */}
      <mesh>
        <circleGeometry args={[4.1, 32]} />
        <meshBasicMaterial
          color="#fff8e1"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Golden Rift Light */}
      <pointLight color="#ffd54f" intensity={3.5} distance={38} />
    </group>
  );
}

/**
 * Master Ancient Rome World Component
 * Orchestrates:
 * - Golden-Hour Lighting (Directional Sun, Sky Hemisphere, Colonnade Fill)
 * - Mediterranean Sky Dome
 * - Rolling Italian Hills Terrain
 * - Colosseum, Aqueduct, Grand Temple, Insulae, Colonnades, Statues
 * - Cobblestone Avenue, Fountain, Marketplace Stalls, Carts, Amphorae
 * - Roman Citizens and Legionaries
 * - SPQR Banners, Cypress Trees, Sun Dust Motes
 * - Sanctuary Dimensional Rift Return
 */
export default function RomeWorld() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <group name="world-ancient-rome">
      {/* 1. Golden-Hour Sunlight (Low Angle from Left / West) */}
      <directionalLight
        ref={dirLightRef}
        color="#fff4d5"
        intensity={3.2}
        position={[-85, 95, -1960]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
        shadow-camera-near={10}
        shadow-camera-far={420}
        shadow-camera-left={-85}
        shadow-camera-right={85}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
      />

      {/* 2. Sky & Ambient Light */}
      <hemisphereLight
        args={["#ffe6bf", "#826647", 0.95]}
      />

      {/* 3. Warm Colonnade & Marketplace Fill Light */}
      <pointLight
        color="#ffaa55"
        intensity={1.2}
        distance={120}
        position={[-8, 12, -1845]}
      />
      <pointLight
        color="#ffaa55"
        intensity={1.2}
        distance={120}
        position={[8, 12, -1885]}
      />
      <pointLight
        color="#ffd180"
        intensity={1.8}
        distance={140}
        position={[0, 28, -2260]}
      />

      {/* 4. Mediterranean Golden Sky Dome */}
      <RomeSkyDome />

      {/* 5. Surrounding Countryside & Capitoline Terrain */}
      <RomeSurroundingTerrain />

      {/* 6. Monumental Roman Architecture (Colosseum, Temple, Aqueduct, Insulae) */}
      <RomeArchitecture />

      {/* 7. Cobblestone Avenue, Classical Fountain & Bustling Marketplace */}
      <RomeStreet />

      {/* 8. Roman Legionaries & Citizens */}
      <RomeCrowd />

      {/* 9. SPQR Banners, Cypress Trees & Sunbeam Dust Motes */}
      <RomeAtmosphere />

      {/* 10. Sanctuary Dimensional Rift Loop Return */}
      <ImperialTempleRift />
    </group>
  );
}
