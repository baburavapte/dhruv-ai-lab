"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Creates the high-detail procedural DHRUV AI LAB Holographic Mega-Display texture.
 * Features:
 * - Glowing futuristic geometric logo
 * - "DHRUV AI LAB" bold glowing typography
 * - AI Humanoid Wireframe Face / Neural Network nodes
 * - "AI • ML • GenAI • Robotics • Space Tech" feature badges
 */
function createDhruvAiLabDisplayTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep midnight cyber backdrop
  ctx.fillStyle = "#040b14";
  ctx.fillRect(0, 0, 1024, 1024);

  // Digital grid background
  ctx.strokeStyle = "rgba(0, 229, 255, 0.12)";
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x < 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Glowing triangular prism logo
  ctx.save();
  ctx.translate(512, 190);
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 35;
  ctx.strokeStyle = "#00f0ff";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, -90);
  ctx.lineTo(85, 60);
  ctx.lineTo(-85, 60);
  ctx.closePath();
  ctx.stroke();

  // Inner purple core
  ctx.fillStyle = "#ff007f";
  ctx.beginPath();
  ctx.arc(0, 10, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // "DHRUV" Header
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 96px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DHRUV", 512, 330);

  // "AI LAB" Sub-Header
  ctx.fillStyle = "#00f0ff";
  ctx.font = "900 84px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("AI LAB", 512, 420);

  // Stylized Holographic AI Humanoid Face Profile & Neural Nodes
  ctx.save();
  ctx.translate(512, 600);
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3;

  // Head contour curve
  ctx.beginPath();
  ctx.arc(0, -20, 110, Math.PI * 0.75, Math.PI * 1.85);
  ctx.lineTo(95, 30);
  ctx.lineTo(40, 110);
  ctx.lineTo(-50, 110);
  ctx.stroke();

  // Neural network nodes and synaptic connections
  const nodes = [
    [-60, -40], [-20, -70], [30, -50], [60, -10],
    [-40, 10], [10, 0], [40, 40], [-10, 60],
    [-70, 20], [0, -20], [70, 30], [20, 80],
  ];

  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 2;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const dist = Math.hypot(dx, dy);
      if (dist < 85) {
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }
  }

  // Glowing synaptic node points
  nodes.forEach(([nx, ny]) => {
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.arc(nx, ny, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Tech Badges Box (AI • ML • GenAI • Robotics • Space Tech)
  ctx.save();
  ctx.translate(512, 850);
  ctx.shadowColor = "#ff007f";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "rgba(10, 25, 45, 0.85)";
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 4;
  ctx.roundRect(-440, -50, 880, 120, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AI  •  ML  •  GenAI  •  ROBOTICS  •  SPACE TECH", 0, 25);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  return tex;
}

/**
 * Hero Classical/Futuristic Commander Pedestal Statue
 * Directly matching reference image left foreground
 */
function CommanderPedestalStatue({
  position = [-14.0, 0.35, -2545],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Stepped Granite/Titanium Base Plinth */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[4.4, 1.2, 4.4]} />
        <meshStandardMaterial color="#1a2432" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* Molded Pedestal Shaft */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[3.4, 2.6, 3.4]} />
        <meshStandardMaterial color="#212d3d" roughness={0.5} metalness={0.75} />
      </mesh>

      {/* Golden SPQR / AI Laureled Emblem Plaque on Pedestal */}
      <mesh position={[0, 2.5, 1.72]}>
        <boxGeometry args={[1.8, 1.8, 0.1]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Heroic Commander Figure (Sculpted in White Titanium Ceramic) */}
      <group position={[0, 3.8, 0]}>
        {/* Robed Body / Cuirass */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.7, 0.9, 3.6, 12]} />
          <meshStandardMaterial color="#e8eff5" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 3.9, 0]}>
          <sphereGeometry args={[0.5, 12, 12]} />
          <meshStandardMaterial color="#e8eff5" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Golden Laurel Wreath */}
        <mesh position={[0, 4.2, 0]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.55, 0.1, 8, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Uplifted Spear / Comm-Staff */}
        <mesh position={[0.9, 3.2, 0.3]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.06, 0.06, 6.2, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Lone Protagonist in Cybernetic Trenchcoat
 * Standing in the center of the avenue walking toward the gateway
 * Directly matching reference image center foreground
 */
function CyberProtagonist({
  position = [0, 0.05, -2532],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Lower Legs */}
      <mesh position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 1.0, 8]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.8} />
      </mesh>

      {/* Long Flowing Trenchcoat Body */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 1.5, 10]} />
        <meshStandardMaterial color="#1a1c24" roughness={0.7} />
      </mesh>

      {/* Cybernetic Spine Seam Glowing Amber (Matching Reference Back Illumination) */}
      <mesh position={[0, 1.45, -0.42]}>
        <boxGeometry args={[0.06, 1.4, 0.04]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff5500" emissiveIntensity={3.5} />
      </mesh>

      {/* Shoulders & Torso */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[0.85, 0.45, 0.45]} />
        <meshStandardMaterial color="#181a22" roughness={0.65} />
      </mesh>

      {/* Head & Collar */}
      <mesh position={[0, 2.65, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#1e1815" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * 3D Rotating Holographic Hypercube Display (Right Promenade)
 */
function HolographicRotatingDisplay({
  position = [14.0, 6.0, -2640],
}: {
  position?: [number, number, number];
}) {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef1.current) {
      meshRef1.current.rotation.x = t * 0.6;
      meshRef1.current.rotation.y = t * 0.8;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = -t * 0.7;
      meshRef2.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Pedestal Base */}
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[1.4, 1.8, 1.2, 12]} />
        <meshStandardMaterial color="#111822" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Holographic Emitter Projector Ring */}
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.15, 8, 24]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3.0} />
      </mesh>

      {/* Outer Rotating Wireframe Cube */}
      <mesh ref={meshRef1}>
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        <meshBasicMaterial color="#00f0ff" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Inner Rotating Octahedron */}
      <mesh ref={meshRef2}>
        <octahedronGeometry args={[1.8]} />
        <meshBasicMaterial color="#ff007f" wireframe transparent opacity={0.85} />
      </mesh>

      <pointLight color="#00e5ff" intensity={1.5} distance={14} />
    </group>
  );
}

/**
 * Master Cyber Holograms Component
 * Orchestrates the hero DHRUV AI LAB holographic mega-billboard,
 * the commander pedestal statue, the walking protagonist,
 * and commercial holographic AI telemetry displays.
 */
export default function CyberHolograms() {
  const dhruvTex = useMemo(() => createDhruvAiLabDisplayTexture(), []);

  return (
    <group name="cyber-holograms">
      {/* 1. HERO DHRUV AI LAB Holographic Mega-Billboard (Foreground Left) */}
      <group position={[-13.8, 16.5, -2544]} rotation={[0, 0.38, 0]}>
        {/* Heavy Architectural Beveled Display Frame */}
        <mesh position={[0, 0, -0.6]}>
          <boxGeometry args={[16.8, 24.8, 1.2]} />
          <meshStandardMaterial color="#0a0f18" roughness={0.35} metalness={0.9} />
        </mesh>
        {/* Glowing Cyan Outer Border Neon */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[17.2, 25.2, 0.15]} />
          <meshStandardMaterial color="#00ffff" emissive="#00e5ff" emissiveIntensity={3.8} />
        </mesh>

        {/* The Radiant Holographic Screen Face */}
        <mesh position={[0, 0, 0.15]}>
          <planeGeometry args={[16.2, 24.0]} />
          <meshBasicMaterial map={dhruvTex} side={THREE.DoubleSide} />
        </mesh>

        {/* Powerful Cyan Ambient Billboard Fill Light */}
        <pointLight color="#00e5ff" intensity={4.2} distance={42} position={[4, 0, 6]} />
      </group>

      {/* 2. Hero Commander Pedestal Statue (Left Foreground) */}
      <CommanderPedestalStatue position={[-11.5, 0.35, -2536]} />

      {/* 3. Lone Cybernetic Protagonist Figure (Avenue Center) */}
      <CyberProtagonist position={[0, 0.05, -2524]} />

      {/* 4. 3D Rotating Holographic Hypercube Telemetry Display (Right Promenade) */}
      <HolographicRotatingDisplay position={[14.2, 5.5, -2630]} />
      <HolographicRotatingDisplay position={[-14.2, 5.5, -2740]} />
    </group>
  );
}
