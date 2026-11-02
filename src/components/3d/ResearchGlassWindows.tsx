"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface ResearchGlassWindowsProps {
  weight?: number;
}

// ---------------------------------------------------------------------------
// Procedural High-Res Canvas Texture Generators for Computational Windows
// ---------------------------------------------------------------------------

function drawCodeWindow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  headerTag: string,
  domainTitle: string,
  codeLines: Array<{ text: string; color: string; indent?: number }>,
  telemetry: Array<{ label: string; value: string; color?: string }>,
  time: number
) {
  // Clear with deep transparent tech background
  ctx.fillStyle = "rgba(4, 10, 22, 0.94)";
  ctx.fillRect(0, 0, width, height);

  // Subtle background technical grid
  ctx.strokeStyle = "rgba(0, 180, 255, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 32;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Outer technical border
  ctx.strokeStyle = "rgba(0, 229, 255, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Corner brackets
  const bLen = 28;
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(12, 12 + bLen);
  ctx.lineTo(12, 12);
  ctx.lineTo(12 + bLen, 12);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 12 - bLen, 12);
  ctx.lineTo(width - 12, 12);
  ctx.lineTo(width - 12, 12 + bLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(12, height - 12 - bLen);
  ctx.lineTo(12, height - 12);
  ctx.lineTo(12 + bLen, height - 12);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 12 - bLen, height - 12);
  ctx.lineTo(width - 12, height - 12);
  ctx.lineTo(width - 12, height - 12 - bLen);
  ctx.stroke();

  // Header Bar
  ctx.fillStyle = "rgba(10, 28, 54, 0.85)";
  ctx.fillRect(14, 14, width - 28, 52);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, 66);
  ctx.lineTo(width - 14, 66);
  ctx.stroke();

  // Blinking status dot
  const dotPulse = Math.sin(time * 3) > 0;
  ctx.fillStyle = dotPulse ? "#00e5ff" : "#007799";
  ctx.beginPath();
  ctx.arc(36, 40, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(headerTag, 52, 44);

  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "right";
  ctx.fillText(domainTitle, width - 36, 44);
  ctx.textAlign = "left";

  // Code Display Area
  const startY = 96;
  const lineHeight = 24;
  ctx.font = "14px 'Courier New', monospace";

  codeLines.forEach((line, idx) => {
    const y = startY + idx * lineHeight;
    if (y > height - 120) return;

    // Line number
    ctx.fillStyle = "#334155";
    ctx.fillText(String(idx + 1).padStart(2, "0"), 36, y);

    // Code line
    ctx.fillStyle = line.color;
    const indent = (line.indent || 0) * 18;
    ctx.fillText(line.text, 72 + indent, y);
  });

  // Subtle scanning sweep line
  const scanY = 70 + ((time * 60) % (height - 180));
  const grad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
  grad.addColorStop(0, "rgba(0, 229, 255, 0)");
  grad.addColorStop(0.5, "rgba(0, 229, 255, 0.08)");
  grad.addColorStop(1, "rgba(0, 229, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(14, scanY - 12, width - 28, 24);

  // Bottom Telemetry Bar
  const footerY = height - 80;
  ctx.fillStyle = "rgba(6, 18, 38, 0.9)";
  ctx.fillRect(14, footerY, width - 28, 66);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
  ctx.strokeRect(14, footerY, width - 28, 66);

  const colWidth = (width - 60) / telemetry.length;
  telemetry.forEach((t, i) => {
    const x = 32 + i * colWidth;
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText(t.label, x, footerY + 24);

    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = t.color || "#00e5ff";
    ctx.fillText(t.value, x, footerY + 48);
  });
}

function drawCentralCommandWindow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  // Dark deep background with high-tech radial glow
  ctx.fillStyle = "rgba(2, 6, 16, 0.96)";
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient radial glow behind central diagram
  const radGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    50,
    width / 2,
    height / 2,
    width / 2
  );
  radGrad.addColorStop(0, "rgba(0, 140, 255, 0.08)");
  radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer frame
  ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Header Banner
  ctx.fillStyle = "rgba(8, 24, 48, 0.9)";
  ctx.fillRect(18, 18, width - 36, 64);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
  ctx.beginPath();
  ctx.moveTo(18, 82);
  ctx.lineTo(width - 18, 82);
  ctx.stroke();

  // Subtle architectural branding
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText("DHRUV AI LAB // CENTRAL RESEARCH COMMAND & COHERENCE CORE", 44, 56);

  ctx.font = "12px 'Courier New', monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.textAlign = "right";
  ctx.fillText("SYSTEM CORE V4.8 // ONLINE", width - 44, 56);
  ctx.textAlign = "left";

  // Three Column Layout
  const colY = 100;
  const colH = height - 170;
  const colW1 = 360;
  const colW2 = width - 760;
  const colW3 = 340;

  // Left Section: Quantum Telemetry Readouts
  ctx.strokeStyle = "rgba(0, 180, 255, 0.15)";
  ctx.strokeRect(32, colY, colW1, colH);
  ctx.fillStyle = "rgba(10, 26, 50, 0.6)";
  ctx.fillRect(32, colY, colW1, 36);
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#00e5ff";
  ctx.fillText("QUANTUM STAGE TELEMETRY", 46, colY + 24);

  const qData = [
    { label: "MXC TEMPERATURE", val: `${(14.82 + Math.sin(time * 1.2) * 0.04).toFixed(2)} mK` },
    { label: "STILL PRESSURE", val: "1.24e-4 mbar" },
    { label: "RF COHERENCE (T1)", val: `${(194.2 + Math.sin(time * 0.8) * 1.5).toFixed(1)} μs` },
    { label: "DEPHASING (T2*)", val: `${(248.5 + Math.cos(time * 0.7) * 2.1).toFixed(1)} μs` },
    { label: "GATE FIDELITY", val: "99.982%" },
    { label: "TRAPPED QUBITS", val: "128 / 128 LOCKED" },
    { label: "DILUTION FLOW", val: "320 μmol/s" },
    { label: "MAGNETIC SHIELD", val: "-84.2 dB ATTEN" },
  ];

  qData.forEach((row, idx) => {
    const y = colY + 68 + idx * 36;
    ctx.font = "11px 'Courier New', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(row.label, 46, y);
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = idx === 0 ? "#ff9d2e" : idx % 2 === 0 ? "#38bdf8" : "#f1f5f9";
    ctx.textAlign = "right";
    ctx.fillText(row.val, 32 + colW1 - 18, y);
    ctx.textAlign = "left";
  });

  // Center Section: Neural Network Topology & Topological Pipeline
  const cx = 32 + colW1 + 24;
  ctx.strokeStyle = "rgba(0, 180, 255, 0.15)";
  ctx.strokeRect(cx, colY, colW2, colH);
  ctx.fillStyle = "rgba(10, 26, 50, 0.6)";
  ctx.fillRect(cx, colY, colW2, 36);
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#00e5ff";
  ctx.fillText("COHERENT NEURAL TOPOLOGY // LATENT VECTOR GRAPH", cx + 18, colY + 24);

  // Draw dynamic network graph nodes & connecting beams
  const nodeCount = 18;
  const centerX = cx + colW2 / 2;
  const centerY = colY + colH / 2 + 10;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2 + time * 0.08;
    const r = 90 + Math.sin(i * 1.5 + time) * 35;
    const nx = centerX + Math.cos(angle) * r;
    const ny = centerY + Math.sin(angle) * (r * 0.65);

    // Connections to adjacent nodes
    for (let j = i + 1; j < Math.min(i + 4, nodeCount); j++) {
      const angle2 = (j / nodeCount) * Math.PI * 2 + time * 0.08;
      const r2 = 90 + Math.sin(j * 1.5 + time) * 35;
      const nx2 = centerX + Math.cos(angle2) * r2;
      const ny2 = centerY + Math.sin(angle2) * (r2 * 0.65);

      ctx.strokeStyle = "rgba(0, 229, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx2, ny2);
      ctx.stroke();
    }

    // Node circle
    ctx.fillStyle = i % 3 === 0 ? "#ff8a1a" : "#00e5ff";
    ctx.beginPath();
    ctx.arc(nx, ny, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central hub node
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 18 + Math.sin(time * 3) * 4, 0, Math.PI * 2);
  ctx.stroke();

  // Right Section: Distributed Inference Channels
  const rx = cx + colW2 + 24;
  ctx.strokeStyle = "rgba(0, 180, 255, 0.15)";
  ctx.strokeRect(rx, colY, colW3, colH);
  ctx.fillStyle = "rgba(10, 26, 50, 0.6)";
  ctx.fillRect(rx, colY, colW3, 36);
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "#00e5ff";
  ctx.fillText("ACTIVE INFERENCE CHANNELS", rx + 16, colY + 24);

  const channels = [
    { name: "CH_01 // MULTIMODAL_EMBED", load: 0.82 },
    { name: "CH_02 // TRANSFORMER_DEC", load: 0.94 },
    { name: "CH_03 // LATENT_DIFFUSION", load: 0.68 },
    { name: "CH_04 // HNSW_VECTOR_RAG", load: 0.45 },
    { name: "CH_05 // QUANTUM_OPTIMIZER", load: 0.76 },
    { name: "CH_06 // CODE_SYNTHESIZER", load: 0.58 },
  ];

  channels.forEach((ch, idx) => {
    const y = colY + 64 + idx * 48;
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(ch.name, rx + 16, y);

    // Progress bar background
    const barW = colW3 - 32;
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(rx + 16, y + 8, barW, 10);

    // Filled progress
    const dynamicLoad = Math.min(1, Math.max(0.1, ch.load + Math.sin(time * 2 + idx) * 0.08));
    ctx.fillStyle = idx === 1 ? "#ff9d2e" : "#00e5ff";
    ctx.fillRect(rx + 16, y + 8, barW * dynamicLoad, 10);
  });

  // Global Status Footer
  const footY = height - 52;
  ctx.fillStyle = "rgba(6, 18, 38, 0.95)";
  ctx.fillRect(18, footY, width - 36, 36);
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(
    `TELEMETRY BUS: ACTIVE // BANDWIDTH: 1.8 TB/s // TOTAL PARAMS: 120B // PACKETS PROCESSED: ${Math.floor(
      1842000 + time * 120
    ).toLocaleString()}`,
    36,
    footY + 22
  );
}

// ---------------------------------------------------------------------------
// 3D Glass Window with Structural Framing & Behind-Glass Server Hardware
// ---------------------------------------------------------------------------

interface GlassWindowUnitProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  canvasTexture: THREE.CanvasTexture;
  materials: {
    glass: THREE.MeshPhysicalMaterial;
    frame: THREE.MeshStandardMaterial;
    edgeGlow: THREE.MeshBasicMaterial;
    serverChassis: THREE.MeshStandardMaterial;
    blueLed: THREE.MeshBasicMaterial;
    amberLed: THREE.MeshBasicMaterial;
    copperPipe: THREE.MeshStandardMaterial;
  };
  hasHardwareBehind?: boolean;
}

function GlassWindowUnit({
  position,
  rotation,
  width,
  height,
  canvasTexture,
  materials,
  hasHardwareBehind = true,
}: GlassWindowUnitProps) {
  const frameThickness = 0.28;
  const frameDepth = 0.45;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Behind-the-Glass 3D Computing Infrastructure (depth layer) */}
      {hasHardwareBehind && (
        <group position={[0, 0, -0.65]}>
          {/* Subtle blue cavity backlight */}
          <pointLight position={[0, 0, 0.2]} color="#00b4d8" intensity={3.5} distance={7.0} />

          {/* Dual Server Racks */}
          {[-width * 0.28, width * 0.28].map((rx, idx) => (
            <group key={`rack-${idx}`} position={[rx, 0, 0]}>
              {/* Rack Enclosure Frame */}
              <mesh position={[0, 0, 0]} material={materials.serverChassis}>
                <boxGeometry args={[width * 0.36, height * 0.88, 0.45]} />
              </mesh>
              {/* Server Blades with Status LEDs */}
              {Array.from({ length: 8 }).map((_, sIdx) => {
                const sy = -height * 0.38 + sIdx * (height * 0.1);
                return (
                  <group key={`blade-${sIdx}`} position={[0, sy, 0.23]}>
                    <mesh material={materials.serverChassis}>
                      <boxGeometry args={[width * 0.32, height * 0.07, 0.04]} />
                    </mesh>
                    {/* Blinking LEDs */}
                    <mesh position={[-width * 0.12, 0, 0.03]} material={materials.blueLed}>
                      <boxGeometry args={[0.04, 0.02, 0.01]} />
                    </mesh>
                    <mesh position={[-width * 0.08, 0, 0.03]} material={materials.amberLed}>
                      <boxGeometry args={[0.04, 0.02, 0.01]} />
                    </mesh>
                    <mesh position={[width * 0.1, 0, 0.03]} material={materials.blueLed}>
                      <boxGeometry args={[0.08, 0.02, 0.01]} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          ))}

          {/* Vertical Liquid Cooling Manifold Pipes */}
          {[-0.5, 0.5].map((px, i) => (
            <mesh key={`pipe-${i}`} position={[px, 0, 0.1]} material={materials.copperPipe}>
              <cylinderGeometry args={[0.06, 0.06, height * 0.95, 12]} />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Structural Window Frame (dark graphite metal beams) */}
      <group>
        {/* Top Beam */}
        <mesh position={[0, height / 2 + frameThickness / 2, 0]} material={materials.frame}>
          <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        </mesh>
        {/* Bottom Beam */}
        <mesh position={[0, -height / 2 - frameThickness / 2, 0]} material={materials.frame}>
          <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        </mesh>
        {/* Left Column */}
        <mesh position={[-width / 2 - frameThickness / 2, 0, 0]} material={materials.frame}>
          <boxGeometry args={[frameThickness, height, frameDepth]} />
        </mesh>
        {/* Right Column */}
        <mesh position={[width / 2 + frameThickness / 2, 0, 0]} material={materials.frame}>
          <boxGeometry args={[frameThickness, height, frameDepth]} />
        </mesh>

        {/* Central Vertical Mullion for wide windows */}
        {width > 10 && (
          <mesh position={[0, 0, 0]} material={materials.frame}>
            <boxGeometry args={[frameThickness * 0.8, height, frameDepth * 0.8]} />
          </mesh>
        )}

        {/* Illuminated Cyan Edge Strips around the frame */}
        <mesh position={[0, height / 2, frameDepth * 0.35]} material={materials.edgeGlow}>
          <boxGeometry args={[width, 0.03, 0.02]} />
        </mesh>
        <mesh position={[0, -height / 2, frameDepth * 0.35]} material={materials.edgeGlow}>
          <boxGeometry args={[width, 0.03, 0.02]} />
        </mesh>
        <mesh position={[-width / 2, 0, frameDepth * 0.35]} material={materials.edgeGlow}>
          <boxGeometry args={[0.03, height, 0.02]} />
        </mesh>
        <mesh position={[width / 2, 0, frameDepth * 0.35]} material={materials.edgeGlow}>
          <boxGeometry args={[0.03, height, 0.02]} />
        </mesh>
      </group>

      {/* 3. Architectural Tinted Glass Panel */}
      <mesh position={[0, 0, 0]} material={materials.glass}>
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* 4. Live Computational Display Plane (layered directly on the glass surface) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width - 0.08, height - 0.08]} />
        <meshBasicMaterial
          map={canvasTexture}
          transparent
          opacity={0.92}
          blending={THREE.NormalBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main ResearchGlassWindows Component
// ---------------------------------------------------------------------------

interface WindowResources {
  canvases: {
    c1: HTMLCanvasElement;
    c2: HTMLCanvasElement;
    c3: HTMLCanvasElement;
    c4: HTMLCanvasElement;
    cCenter: HTMLCanvasElement;
  };
  textures: {
    t1: THREE.CanvasTexture;
    t2: THREE.CanvasTexture;
    t3: THREE.CanvasTexture;
    t4: THREE.CanvasTexture;
    tCenter: THREE.CanvasTexture;
  };
  materials: {
    glass: THREE.MeshPhysicalMaterial;
    frame: THREE.MeshStandardMaterial;
    edgeGlow: THREE.MeshBasicMaterial;
    serverChassis: THREE.MeshStandardMaterial;
    blueLed: THREE.MeshBasicMaterial;
    amberLed: THREE.MeshBasicMaterial;
    copperPipe: THREE.MeshStandardMaterial;
  };
}

function initResources(): WindowResources {
  const c1 = document.createElement("canvas");
  c1.width = 1024;
  c1.height = 640;

  const c2 = document.createElement("canvas");
  c2.width = 1024;
  c2.height = 640;

  const c3 = document.createElement("canvas");
  c3.width = 896;
  c3.height = 640;

  const c4 = document.createElement("canvas");
  c4.width = 896;
  c4.height = 640;

  const cCenter = document.createElement("canvas");
  cCenter.width = 1536;
  cCenter.height = 768;

  const t1 = new THREE.CanvasTexture(c1);
  const t2 = new THREE.CanvasTexture(c2);
  const t3 = new THREE.CanvasTexture(c3);
  const t4 = new THREE.CanvasTexture(c4);
  const tCenter = new THREE.CanvasTexture(cCenter);

  [t1, t2, t3, t4, tCenter].forEach((t) => {
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
  });

  const materials = {
    glass: new THREE.MeshPhysicalMaterial({
      color: "#041022",
      transparent: true,
      opacity: 0.45,
      roughness: 0.12,
      metalness: 0.25,
      ior: 1.5,
    }),
    frame: new THREE.MeshStandardMaterial({
      color: "#0a1626",
      roughness: 0.35,
      metalness: 0.85,
    }),
    edgeGlow: new THREE.MeshBasicMaterial({
      color: "#00e5ff",
      toneMapped: false,
    }),
    serverChassis: new THREE.MeshStandardMaterial({
      color: "#061220",
      roughness: 0.42,
      metalness: 0.78,
    }),
    blueLed: new THREE.MeshBasicMaterial({
      color: "#38bdf8",
      toneMapped: false,
    }),
    amberLed: new THREE.MeshBasicMaterial({
      color: "#ff9d2e",
      toneMapped: false,
    }),
    copperPipe: new THREE.MeshStandardMaterial({
      color: "#c26d38",
      roughness: 0.22,
      metalness: 0.88,
    }),
  };

  return {
    canvases: { c1, c2, c3, c4, cCenter },
    textures: { t1, t2, t3, t4, tCenter },
    materials,
  };
}

function updateSingleCanvas(
  index: number,
  canvases: WindowResources["canvases"],
  textures: WindowResources["textures"],
  time: number
) {
  switch (index) {
    case 0: {
      const ctx1 = canvases.c1.getContext("2d");
      if (ctx1) {
        drawCodeWindow(
          ctx1,
          1024,
          640,
          "// RESEARCH CLUSTER :: NODE_CV_01",
          "COMPUTER VISION // SPATIAL ViT",
          [
            { text: "import torch", color: "#f472b6" },
            { text: "from torchvision.models import vision_transformer as vit", color: "#38bdf8" },
            { text: "", color: "#ffffff" },
            { text: "class SpatialExtractor(nn.Module):", color: "#38bdf8" },
            { text: "def __init__(self, in_ch=3, embed_dim=768, num_heads=12):", color: "#e2e8f0", indent: 1 },
            { text: "super().__init__()", color: "#e2e8f0", indent: 2 },
            { text: "self.patch_embed = PatchEmbed(img_size=384, patch_size=16)", color: "#cbd5e1", indent: 2 },
            { text: "self.blocks = nn.ModuleList([TransformerBlock(head=12) for _ in range(12)])", color: "#cbd5e1", indent: 2 },
            { text: "self.norm = LayerNorm(embed_dim)", color: "#cbd5e1", indent: 2 },
            { text: "", color: "#ffffff" },
            { text: "def forward(self, x: Tensor) -> tuple[Tensor, list[Tensor]]:", color: "#38bdf8", indent: 1 },
            { text: "tokens = self.patch_embed(x)", color: "#e2e8f0", indent: 2 },
            { text: "attn_maps = []", color: "#ff9d2e", indent: 2 },
            { text: "for block in self.blocks:", color: "#f472b6", indent: 2 },
            { text: "tokens, attn = block(tokens)", color: "#e2e8f0", indent: 3 },
            { text: "attn_maps.append(attn)", color: "#cbd5e1", indent: 3 },
            { text: "return self.norm(tokens), attention_maps", color: "#38bdf8", indent: 2 },
          ],
          [
            { label: "CUDA LOAD", value: `${Math.round(72 + Math.sin(time * 0.8) * 6)}%` },
            { label: "FRAME LATENCY", value: "14.2 ms" },
            { label: "PATCHES", value: "576 TOKENS" },
            { label: "CONFIDENCE", value: "0.984" },
          ],
          time
        );
        textures.t1.needsUpdate = true;
      }
      break;
    }
    case 1: {
      const ctx2 = canvases.c2.getContext("2d");
      if (ctx2) {
        drawCodeWindow(
          ctx2,
          1024,
          640,
          "// RESEARCH CLUSTER :: NODE_GENAI_02",
          "GENERATIVE AI // STREAMING RAG",
          [
            { text: "from typing import AsyncGenerator", color: "#f472b6" },
            { text: "from sanctum.vector import HNSWVectorStore", color: "#38bdf8" },
            { text: "from sanctum.inference import FlashAttentionV2", color: "#38bdf8" },
            { text: "", color: "#ffffff" },
            { text: "async def execute_rag_pipeline(query: str) -> AsyncGenerator:", color: "#38bdf8" },
            { text: "q_vector = await encoder.encode_async(query, device='cuda:0')", color: "#e2e8f0", indent: 1 },
            { text: "docs = await vector_store.similarity_search(", color: "#cbd5e1", indent: 1 },
            { text: "q_vector, top_k=12, metric='cosine', threshold=0.82", color: "#ff9d2e", indent: 2 },
            { text: ")", color: "#cbd5e1", indent: 1 },
            { text: "fused_context = reranker.cross_encode(docs, query)", color: "#cbd5e1", indent: 1 },
            { text: "async for token in llm.stream_generate(", color: "#f472b6", indent: 1 },
            { text: "prompt=build_reasoning_prompt(fused_context, query),", color: "#cbd5e1", indent: 2 },
            { text: "max_tokens=1024, temperature=0.72, top_p=0.94", color: "#ff9d2e", indent: 2 },
            { text: "):", color: "#cbd5e1", indent: 1 },
            { text: "yield token", color: "#38bdf8", indent: 2 },
          ],
          [
            { label: "TOKEN STREAM", value: `${Math.round(138 + Math.cos(time * 1.5) * 12)} tok/s` },
            { label: "KV-CACHE", value: "14.8 GB" },
            { label: "ATTN HEADS", value: "32 HEADS" },
            { label: "TOP-K MATCH", value: "12 CHUNKS" },
          ],
          time
        );
        textures.t2.needsUpdate = true;
      }
      break;
    }
    case 2: {
      const ctx3 = canvases.c3.getContext("2d");
      if (ctx3) {
        drawCodeWindow(
          ctx3,
          896,
          640,
          "// RESEARCH CLUSTER :: NODE_SYS_03",
          "AI SYSTEMS // DISTRIBUTED WORKERS",
          [
            { text: "import { DistributedScheduler } from '@sanctum/cluster';", color: "#f472b6" },
            { text: "", color: "#ffffff" },
            { text: "export const clusterManager = new DistributedScheduler({", color: "#38bdf8" },
            { text: "workerNodes: 64,", color: "#ff9d2e", indent: 1 },
            { text: "acceleratorType: 'NVIDIA-H100-SXM5-80GB',", color: "#cbd5e1", indent: 1 },
            { text: "interconnect: 'InfiniBand-NDR-400G',", color: "#cbd5e1", indent: 1 },
            { text: "shardingStrategy: 'tensor_parallel_degree_8',", color: "#38bdf8", indent: 1 },
            { text: "healthCheckIntervalMs: 50,", color: "#ff9d2e", indent: 1 },
            { text: "});", color: "#38bdf8" },
            { text: "", color: "#ffffff" },
            { text: "await clusterManager.allocateWorkers({", color: "#38bdf8" },
            { text: "pipeline: 'DistributedDiffusionTransformer',", color: "#cbd5e1", indent: 1 },
            { text: "precision: 'fp8_e4m3',", color: "#ff9d2e", indent: 1 },
            { text: "memoryThreshold: 0.85,", color: "#ff9d2e", indent: 1 },
            { text: "});", color: "#38bdf8" },
          ],
          [
            { label: "CLUSTER LOAD", value: `${Math.round(74 + Math.sin(time) * 4)}%` },
            { label: "ACTIVE NODES", value: "64 / 64", color: "#4ade80" },
            { label: "VRAM TOTAL", value: "5.12 TB" },
            { label: "P99 LATENCY", value: "18.4 ms" },
          ],
          time
        );
        textures.t3.needsUpdate = true;
      }
      break;
    }
    case 3: {
      const ctx4 = canvases.c4.getContext("2d");
      if (ctx4) {
        drawCodeWindow(
          ctx4,
          896,
          640,
          "// RESEARCH CLUSTER :: NODE_EXP_04",
          "EXPERIMENTS // GRADIENT OPTIMIZATION",
          [
            { text: "# Subatomic Neural Weight Synthesis", color: "#64748b" },
            { text: "# Optimization Step 184,200", color: "#64748b" },
            { text: "", color: "#ffffff" },
            { text: "loss = criterion(logits.view(-1, vocab), targets)", color: "#e2e8f0" },
            { text: "scaled_loss = grad_scaler.scale(loss / accum_steps)", color: "#38bdf8" },
            { text: "scaled_loss.backward()", color: "#f472b6" },
            { text: "", color: "#ffffff" },
            { text: "grad_scaler.unscale_(optimizer)", color: "#cbd5e1" },
            { text: "torch.nn.utils.clip_grad_norm_(params, max_norm=1.0)", color: "#cbd5e1" },
            { text: "grad_scaler.step(optimizer)", color: "#38bdf8" },
            { text: "grad_scaler.update()", color: "#38bdf8" },
            { text: "lr_scheduler.step(global_step)", color: "#f472b6" },
          ],
          [
            { label: "TRAIN STEP", value: "184,200" },
            { label: "LOSS", value: `${(0.482 - Math.min(0.05, time * 0.001)).toFixed(3)}`, color: "#4ade80" },
            { label: "GRAD NORM", value: "0.412" },
            { label: "LR VALUE", value: "1.4e-4" },
          ],
          time
        );
        textures.t4.needsUpdate = true;
      }
      break;
    }
    case 4: {
      const ctxCenter = canvases.cCenter.getContext("2d");
      if (ctxCenter) {
        drawCentralCommandWindow(ctxCenter, 1536, 768, time);
        textures.tCenter.needsUpdate = true;
      }
      break;
    }
  }
}

export default function ResearchGlassWindows({ weight = 1 }: ResearchGlassWindowsProps) {
  const lastUpdateTimeRef = useRef(0);
  const currentWindowIdxRef = useRef(0);
  const lastProgressRef = useRef(-1);
  const stationaryTimerRef = useRef(0);
  const [resources] = useState<WindowResources>(() => initResources());
  const resourcesRef = useRef(resources);

  // Initial draw and cleanup on unmount
  useEffect(() => {
    // Initial draw all 5 once
    for (let i = 0; i < 5; i++) {
      updateSingleCanvas(i, resourcesRef.current.canvases, resourcesRef.current.textures, 0);
    }
    const res = resourcesRef.current;
    return () => {
      Object.values(res.textures).forEach((t) => t.dispose());
      Object.values(res.materials).forEach((m) => m.dispose());
    };
  }, []);

  // Adaptive useFrame updates: NEVER update heavy 896x640 canvas textures during active camera flight.
  // When stationary (user stopped to inspect terminals), update at a calm 1.5s interval.
  // Completely eliminates GPU upload spikes and guarantees flat 60 FPS throughout traversal.
  useFrame((state, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.aiLab ?? 0);
    if (effWeight < 0.001) return;

    const currentP = worldProgressState.progress;
    const isMoving = Math.abs(currentP - lastProgressRef.current) > 0.002;
    lastProgressRef.current = currentP;

    if (isMoving) {
      // During active flight, never trigger CPU canvas redraws or GPU texture re-uploads
      stationaryTimerRef.current = 0;
      return;
    }

    stationaryTimerRef.current += delta;
    if (stationaryTimerRef.current < 0.6) return;

    const t = state.clock.getElapsedTime();
    if (t - lastUpdateTimeRef.current >= 1.5) {
      lastUpdateTimeRef.current = t;
      updateSingleCanvas(
        currentWindowIdxRef.current,
        resourcesRef.current.canvases,
        resourcesRef.current.textures,
        t
      );
      currentWindowIdxRef.current = (currentWindowIdxRef.current + 1) % 5;
    }
  });

  const { textures, materials } = resources;

  return (
    <group name="research-glass-windows">
      {/* ----------------------------------------------------------------- */}
      <GlassWindowUnit
        position={[-18.5, 5.2, -6.0]}
        rotation={[0, Math.PI / 2.6, 0]}
        width={11.5}
        height={7.2}
        canvasTexture={textures.t1}
        materials={materials}
        hasHardwareBehind={true}
      />

      {/* ----------------------------------------------------------------- */}
      {/* WINDOW 2: RIGHT WALL — GENERATIVE AI                              */}
      {/* ----------------------------------------------------------------- */}
      <GlassWindowUnit
        position={[18.5, 5.2, -6.0]}
        rotation={[0, -Math.PI / 2.6, 0]}
        width={11.5}
        height={7.2}
        canvasTexture={textures.t2}
        materials={materials}
        hasHardwareBehind={true}
      />

      {/* ----------------------------------------------------------------- */}
      {/* WINDOW 3: LEFT-REAR ANGLED WALL — AI SYSTEMS                      */}
      {/* ----------------------------------------------------------------- */}
      <GlassWindowUnit
        position={[-13.5, 5.2, -15.5]}
        rotation={[0, Math.PI / 5.5, 0]}
        width={9.2}
        height={6.6}
        canvasTexture={textures.t3}
        materials={materials}
        hasHardwareBehind={true}
      />

      {/* ----------------------------------------------------------------- */}
      {/* WINDOW 4: RIGHT-REAR ANGLED WALL — EXPERIMENTS                    */}
      {/* ----------------------------------------------------------------- */}
      <GlassWindowUnit
        position={[13.5, 5.2, -15.5]}
        rotation={[0, -Math.PI / 5.5, 0]}
        width={9.2}
        height={6.6}
        canvasTexture={textures.t4}
        materials={materials}
        hasHardwareBehind={true}
      />

      {/* ----------------------------------------------------------------- */}
      {/* WINDOW 5: MASSIVE CENTRAL REAR RESEARCH COMMAND DISPLAY           */}
      {/* (Directly behind the Quantum Computer Chandelier, above Rift Arch) */}
      {/* ----------------------------------------------------------------- */}
      <GlassWindowUnit
        position={[0, 7.4, -17.8]}
        rotation={[0, 0, 0]}
        width={18.2}
        height={6.6}
        canvasTexture={textures.tCenter}
        materials={materials}
        hasHardwareBehind={true}
      />

      {/* ----------------------------------------------------------------- */}
      {/* UPPER LEVEL MEZZANINE WINDOWS (Along the high perimeter balcony)  */}
      {/* ----------------------------------------------------------------- */}
      {[-16, 0, 16].map((x, i) => (
        <group key={`upper-bay-${i}`} position={[x, 10.8, -19.5]}>
          {/* Graphite Frame */}
          <mesh material={materials.frame}>
            <boxGeometry args={[10.5, 3.4, 0.35]} />
          </mesh>
          {/* Glass Face */}
          <mesh position={[0, 0, 0.18]} material={materials.glass}>
            <planeGeometry args={[10.2, 3.1]} />
          </mesh>
          {/* Cyan Glow Accent */}
          <mesh position={[0, -1.58, 0.2]} material={materials.edgeGlow}>
            <boxGeometry args={[10.2, 0.04, 0.02]} />
          </mesh>
          {/* Backlit Servers in Mezzanine Cavity */}
          <pointLight position={[0, 0, -0.6]} color="#00e5ff" intensity={2.0} distance={5.0} />
          {[-3.5, -1.2, 1.2, 3.5].map((sx, j) => (
            <mesh key={`server-blade-${j}`} position={[sx, 0, -0.5]} material={materials.serverChassis}>
              <boxGeometry args={[1.8, 2.6, 0.4]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
