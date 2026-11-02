"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Creates high-detail procedural Roman flagstone / cobblestone texture.
 * Classic Roman basalt polygonal paving stones (Via Appia / Via Sacra style)
 * with carved stone curbs and deep mortar joints.
 */
function createCobblestoneTexture(): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = 1024;
  rCanvas.height = 1024;
  const rCtx = rCanvas.getContext("2d");

  if (!ctx || !rCtx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return { map: dummy, roughnessMap: dummy };
  }

  // Base warm weathered Roman basalt/limestone
  ctx.fillStyle = "#8a7e6d";
  ctx.fillRect(0, 0, 1024, 1024);

  rCtx.fillStyle = "#a0a0a0";
  rCtx.fillRect(0, 0, 1024, 1024);

  // Generate irregular polygonal flagstones
  const rows = 28;
  const cols = 24;
  const cellH = 1024 / rows;
  const cellW = 1024 / cols;

  for (let r = 0; r < rows; r++) {
    const y0 = r * cellH;
    for (let c = 0; c < cols; c++) {
      const x0 = c * cellW;
      const offsetX = ((r % 2) * cellW * 0.45 + (Math.sin(r * 2.3 + c) * 0.25 * cellW));
      const px = (x0 + offsetX) % 1024;
      const py = y0 + (Math.cos(c * 1.7 + r) * 0.15 * cellH);
      const pw = cellW * (0.82 + Math.sin(r * 3 + c * 5) * 0.14);
      const ph = cellH * (0.8 + Math.cos(r * 5 + c * 2) * 0.14);

      // Stone color variation: warm ochre, weathered grey, buff sandstone
      const stoneTone = Math.sin(r * 11 + c * 7);
      let stoneColor = "#928471";
      let roughnessVal = "#757575"; // moderate shine when hit by golden sun
      if (stoneTone > 0.4) {
        stoneColor = "#a39480";
        roughnessVal = "#656565";
      } else if (stoneTone < -0.3) {
        stoneColor = "#786d5e";
        roughnessVal = "#888888";
      } else if (stoneTone > 0.1) {
        stoneColor = "#9b8972";
        roughnessVal = "#6e6e6e";
      }

      ctx.fillStyle = stoneColor;
      rCtx.fillStyle = roughnessVal;

      // Draw rounded polygonal stone
      ctx.beginPath();
      rCtx.beginPath();
      const radius = 6;
      ctx.roundRect(px, py, pw, ph, radius);
      rCtx.roundRect(px, py, pw, ph, radius);
      ctx.fill();
      rCtx.fill();

      // Stone surface highlights & subtle bevel
      ctx.fillStyle = "rgba(255, 235, 200, 0.12)";
      ctx.fillRect(px + 2, py + 2, pw - 4, ph * 0.35);

      // Sunken joint / mortar shadow
      ctx.strokeStyle = "#4d4336";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 28);
  map.generateMipmaps = true;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 28);
  roughnessMap.generateMipmaps = true;

  return { map, roughnessMap };
}

/**
 * Animated Fountain Water Jets & Pool
 * Spouting geyser, 4 arching streams from lion spouts, and bubbling basin.
 */
function FountainWater({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const jetsRef = useRef<THREE.Points>(null);

  // Pool water shimmer
  useFrame((state) => {
    if (waterMeshRef.current) {
      const mat = waterMeshRef.current.material as THREE.MeshStandardMaterial;
      const t = state.clock.getElapsedTime();
      mat.roughness = 0.08 + Math.sin(t * 3.0) * 0.04;
    }
    if (jetsRef.current) {
      const posAttr = jetsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const t = state.clock.getElapsedTime() * 4.0;
      // Cycle droplet positions along vertical and arc paths
      for (let i = 0; i < arr.length; i += 3) {
        const seed = (i / 3) * 0.12;
        const phase = (t + seed) % 1.0;
        // Central upward cascading geyser
        if (i < 120 * 3) {
          const sprayR = phase * 0.48;
          arr[i + 0] = Math.cos(seed * 28) * sprayR;
          arr[i + 1] = 3.1 + Math.sin(phase * Math.PI) * 1.6 - phase * 0.8;
          arr[i + 2] = Math.sin(seed * 28) * sprayR;
        } else {
          // 4 arching lion streams
          const angle = Math.floor((i - 360) / 90) * (Math.PI / 2);
          const r = phase * 2.2;
          arr[i + 0] = Math.cos(angle) * r + Math.sin(seed * 10) * 0.06;
          arr[i + 1] = 2.3 + Math.sin(phase * Math.PI) * 0.75 - phase * 1.4;
          arr[i + 2] = Math.sin(angle) * r + Math.cos(seed * 10) * 0.06;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  const [particlePositions] = useMemo(() => {
    const count = 240;
    const pos = new Float32Array(count * 3);
    return [pos];
  }, []);

  return (
    <group position={position}>
      {/* Lower Basin Water Surface */}
      <mesh ref={waterMeshRef} position={[0, 0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.9, 32]} />
        <meshStandardMaterial
          color="#38a3a5"
          roughness={0.12}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Upper Bowl Water Surface */}
      <mesh position={[0, 1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 24]} />
        <meshStandardMaterial
          color="#57cc99"
          roughness={0.1}
          metalness={0.25}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Top Spire Water Surface */}
      <mesh position={[0, 2.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshStandardMaterial
          color="#80ed99"
          roughness={0.08}
          metalness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Water Jet Particles */}
      <points ref={jetsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color="#d8f3dc"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/**
 * Classical Tiered Roman Marble Fountain (Foreground Right)
 * Directly matching reference image:
 * Multi-tiered carved stone bowls, lion spouts, splashing water,
 * surrounded by terracotta pots with blooming magenta flowers.
 */
function ClassicalRomanFountain({
  position = [7.2, 0, -1825],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Octagonal Stepped Plinth Foundation */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[3.8, 4.0, 0.3, 16]} />
        <meshStandardMaterial color="#d8cbba" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[3.45, 3.6, 0.28, 16]} />
        <meshStandardMaterial color="#ded2c3" roughness={0.7} />
      </mesh>

      {/* Large Circular Main Basin Wall */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.55, 32, 1, true]} />
        <meshStandardMaterial color="#e5dad0" roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Molded Basin Lip */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.16, 12, 32]} />
        <meshStandardMaterial color="#f0e6dc" roughness={0.6} />
      </mesh>

      {/* Center Pedestal Base */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.85, 1.15, 1.1, 16]} />
        <meshStandardMaterial color="#ded1c0" roughness={0.7} />
      </mesh>

      {/* Lower Tier Carved Stone Bowl */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[1.5, 0.75, 0.38, 24]} />
        <meshStandardMaterial color="#eae0d5" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 10, 24]} />
        <meshStandardMaterial color="#f2e9e1" roughness={0.6} />
      </mesh>

      {/* Middle Carved Stem with 4 Lion Heads */}
      <mesh position={[0, 2.35, 0]}>
        <cylinderGeometry args={[0.42, 0.55, 0.65, 16]} />
        <meshStandardMaterial color="#dfd4c7" roughness={0.7} />
      </mesh>
      {/* Lion head spouts */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((ang, i) => (
        <mesh key={`lion-${i}`} position={[Math.cos(ang) * 0.48, 2.35, Math.sin(ang) * 0.48]} rotation={[0, -ang + Math.PI / 2, 0]}>
          <boxGeometry args={[0.22, 0.24, 0.18]} />
          <meshStandardMaterial color="#c2b09c" roughness={0.75} />
        </mesh>
      ))}

      {/* Upper Tier Carved Bowl */}
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.75, 0.38, 0.28, 20]} />
        <meshStandardMaterial color="#ece3d9" roughness={0.65} />
      </mesh>

      {/* Central Spouting Spire Finial */}
      <mesh position={[0, 3.05, 0]}>
        <coneGeometry args={[0.22, 0.55, 12]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Animated Water within the fountain */}
      <FountainWater position={[0, 0, 0]} />

      {/* Potted Flower Urns around Fountain Rim (Magenta & Violet blooms matching reference) */}
      {[
        [-3.2, 0.42, -1.2],
        [-2.8, 0.42, 1.8],
        [3.0, 0.42, -1.5],
        [2.6, 0.42, 2.0],
        [-1.2, 0.42, 3.1],
        [1.1, 0.42, -3.2],
      ].map(([fx, fy, fz], idx) => (
        <group key={`fountain-pot-${idx}`} position={[fx, fy, fz]}>
          {/* Terracotta Urn */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.32, 0.2, 0.6, 12]} />
            <meshStandardMaterial color="#c36b4a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <torusGeometry args={[0.33, 0.05, 8, 12]} />
            <meshStandardMaterial color="#bd6342" roughness={0.85} />
          </mesh>
          {/* Dense green foliage */}
          <mesh position={[0, 0.72, 0]} scale={[1.1, 0.75, 1.1]}>
            <dodecahedronGeometry args={[0.38, 1]} />
            <meshStandardMaterial color="#2d5a27" roughness={0.9} />
          </mesh>
          {/* Vibrant blooming magenta/purple petals */}
          <mesh position={[0, 0.85, 0]} scale={[1.15, 0.65, 1.15]}>
            <dodecahedronGeometry args={[0.35, 1]} />
            <meshStandardMaterial color={idx % 2 === 0 ? "#d81b60" : "#8e24aa"} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Roman Terracotta Amphora (Wine & Olive Oil Vessel)
 */
function Amphora({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Pointed bottom cone */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.44, 10]} />
        <meshStandardMaterial color="#b85d38" roughness={0.88} />
      </mesh>
      {/* Ovoid body */}
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color="#c26844" roughness={0.85} />
      </mesh>
      {/* Slender neck */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.38, 10]} />
        <meshStandardMaterial color="#b55833" roughness={0.88} />
      </mesh>
      {/* Flared rim */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.13, 0.08, 0.06, 10]} />
        <meshStandardMaterial color="#c56d49" roughness={0.85} />
      </mesh>
      {/* Left handle */}
      <mesh position={[-0.18, 0.82, 0]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
        <meshStandardMaterial color="#a74f2c" roughness={0.88} />
      </mesh>
      {/* Right handle */}
      <mesh position={[0.18, 0.82, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
        <meshStandardMaterial color="#a74f2c" roughness={0.88} />
      </mesh>
    </group>
  );
}

/**
 * Wooden Market Stall with Slanted Fabric Awning & Display Goods
 */
function MarketStall({
  position,
  rotation = [0, 0, 0],
  width = 4.5,
  depth = 2.8,
  awningColor = "#8c1322", // Roman crimson
  isStriped = false,
  goodsType = "mixed",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  depth?: number;
  awningColor?: string;
  isStriped?: boolean;
  goodsType?: "wine" | "fruit" | "pottery" | "mixed";
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Frame Timber Posts */}
      {/* 4 Corner Posts */}
      {[
        [-width / 2 + 0.15, -depth / 2 + 0.15, 3.2], // back-left (higher)
        [width / 2 - 0.15, -depth / 2 + 0.15, 3.2], // back-right
        [-width / 2 + 0.15, depth / 2 - 0.15, 2.4], // front-left (lower slope)
        [width / 2 - 0.15, depth / 2 - 0.15, 2.4], // front-right
      ].map(([px, pz, h], idx) => (
        <mesh key={`post-${idx}`} position={[px, h / 2, pz]}>
          <boxGeometry args={[0.14, h, 0.14]} />
          <meshStandardMaterial color="#533c2a" roughness={0.92} />
        </mesh>
      ))}

      {/* Top Crossbeams */}
      <mesh position={[0, 3.2, -depth / 2 + 0.15]}>
        <boxGeometry args={[width, 0.12, 0.12]} />
        <meshStandardMaterial color="#4a3524" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.4, depth / 2 - 0.15]}>
        <boxGeometry args={[width, 0.12, 0.12]} />
        <meshStandardMaterial color="#4a3524" roughness={0.92} />
      </mesh>

      {/* Slanted Fabric Awning Canopy */}
      {/* Slanted angle: from (0, 3.2, -depth/2) down to (0, 2.4, depth/2) */}
      <mesh
        position={[0, 2.82, 0]}
        rotation={[Math.atan2(0.8, depth), 0, 0]}
      >
        <planeGeometry args={[width + 0.4, Math.hypot(depth, 0.8) + 0.3]} />
        <meshStandardMaterial
          color={awningColor}
          roughness={0.75}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hanging Front Awning Scalloped Valance / Flap */}
      <mesh position={[0, 2.22, depth / 2 - 0.05]}>
        <planeGeometry args={[width + 0.3, 0.42]} />
        <meshStandardMaterial
          color={isStriped ? "#d4af37" : awningColor}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Market Display Table / Wooden Counter */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[width - 0.4, 0.95, depth - 0.6]} />
        <meshStandardMaterial color="#5c4430" roughness={0.95} />
      </mesh>
      {/* Tabletop Wooden Planks */}
      <mesh position={[0, 0.99, 0]}>
        <boxGeometry args={[width - 0.2, 0.06, depth - 0.4]} />
        <meshStandardMaterial color="#6a4f38" roughness={0.9} />
      </mesh>

      {/* Goods on Table & Floor */}
      {/* Amphorae cluster */}
      {(goodsType === "wine" || goodsType === "mixed") && (
        <>
          <Amphora position={[-width * 0.28, 1.02, -0.2]} scale={0.7} />
          <Amphora position={[-width * 0.18, 1.02, 0.15]} scale={0.72} rotation={[0, 0.5, 0.1]} />
          <Amphora position={[-width * 0.08, 1.02, -0.1]} scale={0.68} />
          {/* Amphorae leaning on ground next to stall */}
          <Amphora position={[-width / 2 - 0.35, 0, 0.4]} scale={0.85} rotation={[0.2, 0, -0.25]} />
          <Amphora position={[-width / 2 - 0.55, 0, -0.1]} scale={0.88} />
        </>
      )}

      {/* Fruit Baskets & Crates */}
      {(goodsType === "fruit" || goodsType === "mixed") && (
        <>
          {/* Crate of purple grapes */}
          <group position={[width * 0.22, 1.02, -0.1]}>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.75, 0.2, 0.55]} />
              <meshStandardMaterial color="#694d33" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.22, 0]} scale={[1, 0.6, 1]}>
              <sphereGeometry args={[0.26, 8, 8]} />
              <meshStandardMaterial color="#4a154b" roughness={0.5} />
            </mesh>
          </group>

          {/* Crate of golden citrus / oranges */}
          <group position={[width * 0.25, 1.02, 0.45]}>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.65, 0.2, 0.45]} />
              <meshStandardMaterial color="#694d33" roughness={0.95} />
            </mesh>
            <mesh position={[0, 0.21, 0]} scale={[1, 0.6, 1]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#e67e22" roughness={0.6} />
            </mesh>
          </group>

          {/* Bread loaves (Panis Quadratus) */}
          <group position={[0, 1.02, 0.3]}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.1, 12]} />
              <meshStandardMaterial color="#d4a373" roughness={0.9} />
            </mesh>
            <mesh position={[0.24, 0.06, -0.05]}>
              <cylinderGeometry args={[0.16, 0.16, 0.09, 12]} />
              <meshStandardMaterial color="#c29160" roughness={0.9} />
            </mesh>
          </group>
        </>
      )}

      {/* Terracotta Bowls & Plates */}
      {(goodsType === "pottery" || goodsType === "mixed") && (
        <>
          <mesh position={[-width * 0.35, 1.04, 0.35]}>
            <cylinderGeometry args={[0.24, 0.14, 0.12, 10]} />
            <meshStandardMaterial color="#b35431" roughness={0.7} />
          </mesh>
          <mesh position={[-width * 0.15, 1.03, 0.4]}>
            <cylinderGeometry args={[0.2, 0.12, 0.1, 10]} />
            <meshStandardMaterial color="#cf6a42" roughness={0.7} />
          </mesh>
        </>
      )}

      {/* Wooden Storage Barrel beside stall */}
      <mesh position={[width / 2 + 0.4, 0.55, 0.2]}>
        <cylinderGeometry args={[0.38, 0.34, 1.1, 12]} />
        <meshStandardMaterial color="#4d3826" roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * Authentic Roman Two-Wheeled Market Cart (Plaustrum / Carpentum)
 */
function RomanMarketCart({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden Bed / Chassis */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.8, 0.18, 3.2]} />
        <meshStandardMaterial color="#5a422d" roughness={0.92} />
      </mesh>
      {/* Side Slats */}
      <mesh position={[-0.85, 1.25, 0]}>
        <boxGeometry args={[0.08, 0.6, 3.2]} />
        <meshStandardMaterial color="#6e5138" roughness={0.9} />
      </mesh>
      <mesh position={[0.85, 1.25, 0]}>
        <boxGeometry args={[0.08, 0.6, 3.2]} />
        <meshStandardMaterial color="#6e5138" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.25, -1.55]}>
        <boxGeometry args={[1.8, 0.6, 0.08]} />
        <meshStandardMaterial color="#6e5138" roughness={0.9} />
      </mesh>

      {/* Heavy Timber Axle */}
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2.3, 10]} />
        <meshStandardMaterial color="#423020" roughness={0.95} />
      </mesh>

      {/* Left Large Spoke Wheel */}
      <group position={[-1.15, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer iron/wood rim */}
        <mesh>
          <torusGeometry args={[0.72, 0.07, 8, 20]} />
          <meshStandardMaterial color="#36291d" roughness={0.9} />
        </mesh>
        {/* Hub */}
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.22, 10]} />
          <meshStandardMaterial color="#503d2b" roughness={0.85} />
        </mesh>
        {/* Spokes */}
        {[0, 1, 2, 3].map((sp) => (
          <mesh key={`spoke-l-${sp}`} rotation={[0, 0, (sp * Math.PI) / 4]}>
            <boxGeometry args={[0.06, 1.35, 0.04]} />
            <meshStandardMaterial color="#654c36" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Right Large Spoke Wheel */}
      <group position={[1.15, 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <torusGeometry args={[0.72, 0.07, 8, 20]} />
          <meshStandardMaterial color="#36291d" roughness={0.9} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.22, 10]} />
          <meshStandardMaterial color="#503d2b" roughness={0.85} />
        </mesh>
        {[0, 1, 2, 3].map((sp) => (
          <mesh key={`spoke-r-${sp}`} rotation={[0, 0, (sp * Math.PI) / 4]}>
            <boxGeometry args={[0.06, 1.35, 0.04]} />
            <meshStandardMaterial color="#654c36" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Front Hitch Pole / Shafts */}
      <mesh position={[-0.45, 0.65, 2.4]} rotation={[0.18, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 2.0, 8]} />
        <meshStandardMaterial color="#553e2a" roughness={0.92} />
      </mesh>
      <mesh position={[0.45, 0.65, 2.4]} rotation={[0.18, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 2.0, 8]} />
        <meshStandardMaterial color="#553e2a" roughness={0.92} />
      </mesh>

      {/* Cargo inside cart: barrels, sacks, amphorae */}
      <mesh position={[-0.35, 1.35, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.3, 0.85, 12]} />
        <meshStandardMaterial color="#4a3625" roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 1.35, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.3, 0.85, 12]} />
        <meshStandardMaterial color="#503b29" roughness={0.9} />
      </mesh>
      {/* Grain burlap sacks */}
      <mesh position={[0, 1.25, 0.5]} scale={[1.1, 0.7, 0.9]}>
        <dodecahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#c2a677" roughness={0.95} />
      </mesh>
      <mesh position={[0.3, 1.22, 0.8]} scale={[1.0, 0.65, 0.85]}>
        <dodecahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color="#baa070" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Master Rome Street Component:
 * - Broad Cobblestone Avenue (Via Sacra) with raised curbs & drainage
 * - Classical Tiered Marble Fountain with animated jets (Foreground Right)
 * - Continuous Marketplace stalls with rich crimson, burgundy, and striped canopies
 * - Wooden merchant carts, amphorae clusters, and crates of Mediterranean produce
 */
export default function RomeStreet() {
  const { map, roughnessMap } = useMemo(() => createCobblestoneTexture(), []);

  // Marketplace stalls along both sides of Via Sacra:
  // Matching the bustling forum marketplace in the reference image
  const stalls = useMemo(
    () => [
      // Left side stalls
      {
        pos: [-6.4, 0, -1818] as [number, number, number],
        rot: [0, 0.08, 0] as [number, number, number],
        w: 4.8,
        d: 2.8,
        color: "#850d18", // deep crimson
        striped: false,
        type: "fruit" as const,
      },
      {
        pos: [-6.6, 0, -1838] as [number, number, number],
        rot: [0, 0.05, 0] as [number, number, number],
        w: 4.6,
        d: 2.8,
        color: "#b07d2b", // ochre / gold
        striped: true,
        type: "wine" as const,
      },
      {
        pos: [-6.7, 0, -1856] as [number, number, number],
        rot: [0, 0.04, 0] as [number, number, number],
        w: 5.0,
        d: 2.8,
        color: "#6b0f1a", // burgundy
        striped: false,
        type: "pottery" as const,
      },
      {
        pos: [-6.8, 0, -1876] as [number, number, number],
        rot: [0, 0.02, 0] as [number, number, number],
        w: 4.8,
        d: 2.8,
        color: "#dfcaa0", // cream linen
        striped: false,
        type: "mixed" as const,
      },
      {
        pos: [-6.9, 0, -1900] as [number, number, number],
        rot: [0, 0.01, 0] as [number, number, number],
        w: 5.2,
        d: 2.8,
        color: "#8c1322",
        striped: false,
        type: "wine" as const,
      },
      {
        pos: [-7.0, 0, -1926] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
        w: 5.0,
        d: 2.8,
        color: "#a87728",
        striped: true,
        type: "fruit" as const,
      },

      // Right side stalls (placed slightly further back to frame fountain)
      {
        pos: [6.8, 0, -1842] as [number, number, number],
        rot: [0, -0.05, 0] as [number, number, number],
        w: 4.6,
        d: 2.8,
        color: "#78101d", // rich burgundy
        striped: false,
        type: "fruit" as const,
      },
      {
        pos: [6.8, 0, -1862] as [number, number, number],
        rot: [0, -0.04, 0] as [number, number, number],
        w: 5.0,
        d: 2.8,
        color: "#e6c587", // striped ochre
        striped: true,
        type: "wine" as const,
      },
      {
        pos: [6.9, 0, -1884] as [number, number, number],
        rot: [0, -0.02, 0] as [number, number, number],
        w: 4.8,
        d: 2.8,
        color: "#941624",
        striped: false,
        type: "mixed" as const,
      },
      {
        pos: [7.0, 0, -1910] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
        w: 5.2,
        d: 2.8,
        color: "#dfcca8",
        striped: false,
        type: "pottery" as const,
      },
      {
        pos: [7.1, 0, -1936] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
        w: 4.8,
        d: 2.8,
        color: "#800e1b",
        striped: false,
        type: "fruit" as const,
      },
    ],
    []
  );

  return (
    <group name="rome-street">
      {/* 1. Main Cobblestone Avenue Surface (Via Sacra) */}
      <mesh position={[0, 0, -2015]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 470]} />
        <meshStandardMaterial
          map={map}
          roughnessMap={roughnessMap}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Widened Capitoline Forum Plaza extending seamlessly beneath the 44m Grand Staircase */}
      <mesh position={[0, 0.02, -2048]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[54, 48]} />
        <meshStandardMaterial
          map={map}
          roughnessMap={roughnessMap}
          roughness={0.68}
          metalness={0.08}
        />
      </mesh>

      {/* Paved approach road connecting from Prehistoric Exit (z: -1550 to -1780) */}
      <mesh position={[0, 0, -1665]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 230]} />
        <meshStandardMaterial
          map={map}
          roughnessMap={roughnessMap}
          roughness={0.75}
        />
      </mesh>

      {/* Raised Travertine Curbs lining both sides of the avenue */}
      {/* Left Curb */}
      <mesh position={[-7.5, 0.15, -2015]}>
        <boxGeometry args={[0.5, 0.3, 470]} />
        <meshStandardMaterial color="#cfc2b0" roughness={0.7} />
      </mesh>
      {/* Right Curb */}
      <mesh position={[7.5, 0.15, -2015]}>
        <boxGeometry args={[0.5, 0.3, 470]} />
        <meshStandardMaterial color="#cfc2b0" roughness={0.7} />
      </mesh>

      {/* Paved Pedestrian Walkways outside curbs */}
      {/* Left Sidewalk */}
      <mesh position={[-11.5, 0.28, -2015]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 470]} />
        <meshStandardMaterial color="#b8aba0" roughness={0.8} />
      </mesh>
      {/* Right Sidewalk */}
      <mesh position={[11.5, 0.28, -2015]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 470]} />
        <meshStandardMaterial color="#b8aba0" roughness={0.8} />
      </mesh>

      {/* 2. Classical Tiered Fountain (Foreground Right) */}
      <ClassicalRomanFountain position={[7.4, 0.28, -1822]} />

      {/* 3. Bustling Marketplace Stalls */}
      {stalls.map((s, idx) => (
        <MarketStall
          key={`stall-${idx}`}
          position={s.pos}
          rotation={s.rot}
          width={s.w}
          depth={s.d}
          awningColor={s.color}
          isStriped={s.striped}
          goodsType={s.type}
        />
      ))}

      {/* 4. Roman Wooden Market Carts */}
      <RomanMarketCart
        position={[-4.2, 0, -1824]}
        rotation={[0, 0.35, 0]}
      />
      <RomanMarketCart
        position={[4.6, 0, -1895]}
        rotation={[0, -0.42, 0]}
      />
      <RomanMarketCart
        position={[-4.5, 0, -1960]}
        rotation={[0, 0.25, 0]}
      />
    </group>
  );
}
