"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getAILabWorldOffset, worldProgressState } from "@/lib/worldProgress";
import ResearchGlassWindows from "./ResearchGlassWindows";
import SpaceObservationDome from "./SpaceObservationDome";
import QuantumComputerChandelier from "./QuantumComputerChandelier";

// Deterministic pseudo-random number generator for chamber data particles
function createPseudoRandom(seed = 5531) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Procedural Canvas Texture generator for holographic terminal displays
function createTerminalTexture(
  terminalId: string,
  title: string,
  subtitle: string,
  accentColor: string,
  secondaryColor: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#050b16";
  ctx.fillRect(0, 0, 512, 320);

  ctx.strokeStyle = "rgba(41, 182, 246, 0.12)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 320);
    ctx.stroke();
  }
  for (let y = 0; y < 320; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 480, 288);

  ctx.fillStyle = "rgba(8, 26, 46, 0.9)";
  ctx.fillRect(18, 18, 476, 44);

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(38, 40, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`${terminalId} // SANCTUM NODE`, 54, 44);

  ctx.fillStyle = accentColor;
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "right";
  ctx.fillText("ONLINE", 480, 44);
  ctx.textAlign = "left";

  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(title, 34, 102);

  ctx.font = "13px monospace";
  ctx.fillStyle = secondaryColor;
  ctx.fillText(subtitle, 34, 126);

  ctx.fillStyle = "rgba(11, 39, 64, 0.65)";
  ctx.fillRect(34, 146, 444, 108);
  ctx.strokeStyle = "rgba(85, 217, 255, 0.3)";
  ctx.strokeRect(34, 146, 444, 108);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 444; i += 12) {
    const px = 34 + i;
    const py = 200 + Math.sin(i * 0.05 + 1.2) * 24 + Math.cos(i * 0.09) * 12;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = accentColor;
  for (let b = 0; b < 16; b++) {
    const h = 10 + (b * 7) % 36;
    ctx.fillRect(44 + b * 26, 240 - h, 14, h);
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(18, 270, 476, 32);
  ctx.fillStyle = "#64748b";
  ctx.font = "11px monospace";
  ctx.fillText(`STATUS: TELEMETRY STREAMING // CODEC: ${accentHex}`, 34, 290);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// Procedural Canvas Texture for secondary diagnostic monitoring displays
function createDiagnosticTexture(label: string, code: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#06111f";
  ctx.fillRect(0, 0, 256, 160);

  ctx.strokeStyle = "#17618a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, 244, 148);

  ctx.fillStyle = "#00e5ff";
  ctx.font = "bold 11px monospace";
  ctx.fillText(label, 14, 24);

  ctx.fillStyle = "#55d9ff";
  ctx.font = "9px monospace";
  ctx.fillText(code, 14, 40);

  ctx.fillStyle = "rgba(41, 182, 246, 0.4)";
  for (let i = 0; i < 12; i++) {
    const barH = 12 + ((i * 11) % 40);
    ctx.fillRect(16 + i * 18, 120 - barH, 12, barH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

interface AIResearchChamberProps {
  weight?: number; // 0-1 smooth visibility weight
}

export default function AIResearchChamber({ weight }: AIResearchChamberProps) {
  const renderWeight = weight ?? 1;
  const chamberGroupRef = useRef<THREE.Group>(null);
  // References for dynamic animated chamber elements
  const returnRiftRef = useRef<THREE.Mesh>(null);
  const returnRiftLightRef = useRef<THREE.PointLight>(null);
  const dataParticlesRef = useRef<THREE.Points>(null);

  // 4 Primary Terminal refs
  const terminal1Ref = useRef<THREE.Group>(null);
  const terminal2Ref = useRef<THREE.Group>(null);
  const terminal3Ref = useRef<THREE.Group>(null);
  const terminal4Ref = useRef<THREE.Group>(null);

  // Chamber global light refs for smooth intensity modulation
  const labAmbientRef = useRef<THREE.AmbientLight>(null);
  const labDirLightRef = useRef<THREE.DirectionalLight>(null);
  const labPointLight1Ref = useRef<THREE.PointLight>(null);
  const labPointLight2Ref = useRef<THREE.PointLight>(null);

  // Procedural chamber data particles
  const particleCount = 200;
  const [particlePositions, particleSpeeds] = useMemo(() => {
    const random = createPseudoRandom(8841);
    const pos = new Float32Array(particleCount * 3);
    const sp = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = random() * Math.PI * 2;
      const r = 3.0 + random() * 22.0;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 0.5 + random() * 16.0;
      pos[i * 3 + 2] = -6.0 + Math.sin(angle) * r * 0.9;

      sp[i * 3] = (random() - 0.5) * 0.12;
      sp[i * 3 + 1] = 0.10 + random() * 0.35;
      sp[i * 3 + 2] = (random() - 0.5) * 0.12;
    }
    return [pos, sp];
  }, []);

  // Chamber materials (Deep Blues, Navy, Metallic Steel, Glass)
  const materials = useMemo(() => {
    return {
      // 1. LAB ENVIRONMENT (Deep Blues, Navy, Cool Steel, Dark Metal)
      floor: new THREE.MeshStandardMaterial({
        color: "#050b14",
        roughness: 0.14,
        metalness: 0.92,
      }),
      wallNavy: new THREE.MeshStandardMaterial({
        color: "#081a2e",
        roughness: 0.48,
        metalness: 0.58,
      }),
      wallDark: new THREE.MeshStandardMaterial({
        color: "#06111f",
        roughness: 0.62,
        metalness: 0.5,
      }),
      structuralSteel: new THREE.MeshStandardMaterial({
        color: "#123b5a",
        roughness: 0.32,
        metalness: 0.84,
      }),
      structuralPillars: new THREE.MeshStandardMaterial({
        color: "#0b2740",
        roughness: 0.36,
        metalness: 0.8,
      }),
      balconyDeck: new THREE.MeshStandardMaterial({
        color: "#0a192c",
        roughness: 0.28,
        metalness: 0.86,
      }),
      glassRailing: new THREE.MeshPhysicalMaterial({
        color: "#29b6f6",
        transparent: true,
        opacity: 0.32,
        roughness: 0.08,
        metalness: 0.1,
        ior: 1.45,
      }),
      daisPlatform: new THREE.MeshStandardMaterial({
        color: "#081524",
        roughness: 0.22,
        metalness: 0.88,
      }),
      daisTier2: new THREE.MeshStandardMaterial({
        color: "#0c1d32",
        roughness: 0.18,
        metalness: 0.92,
      }),
      workstationBody: new THREE.MeshStandardMaterial({
        color: "#081628",
        roughness: 0.36,
        metalness: 0.76,
      }),
      workstationBench: new THREE.MeshStandardMaterial({
        color: "#0b1e36",
        roughness: 0.25,
        metalness: 0.82,
      }),
      terminalBezel: new THREE.MeshStandardMaterial({
        color: "#050d18",
        roughness: 0.22,
        metalness: 0.94,
      }),
      cyanEmissive: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
      }),
      azureEmissive: new THREE.MeshBasicMaterial({
        color: "#29b6f6",
        toneMapped: false,
      }),
      subtleBlueEmissive: new THREE.MeshBasicMaterial({
        color: "#17618a",
        toneMapped: false,
      }),
      granitePlinth: new THREE.MeshStandardMaterial({
        color: "#181c24",
        roughness: 0.42,
        metalness: 0.38,
      }),
      stainlessSteel: new THREE.MeshStandardMaterial({
        color: "#7e8894",
        roughness: 0.22,
        metalness: 0.92,
      }),
      darkTitanium: new THREE.MeshStandardMaterial({
        color: "#2e3440",
        roughness: 0.32,
        metalness: 0.88,
      }),
      brassRF: new THREE.MeshStandardMaterial({
        color: "#c59f55",
        roughness: 0.24,
        metalness: 0.92,
      }),
      amberLed: new THREE.MeshBasicMaterial({
        color: "#ff9e24",
        toneMapped: false,
      }),
      entranceArch: new THREE.MeshStandardMaterial({
        color: "#0a1828",
        roughness: 0.38,
        metalness: 0.72,
      }),
      riftFire: new THREE.MeshBasicMaterial({
        color: "#ff5a0a",
        toneMapped: false,
      }),
    };
  }, []);

  // Procedural textures
  const termTextures = useMemo(() => {
    return {
      t1: createTerminalTexture(
        "TERMINAL 01",
        "COMPUTER VISION",
        "Spatial Reconstruction & Latent NeRFs",
        "#00e5ff",
        "#29b6f6",
        "#00E5FF"
      ),
      t2: createTerminalTexture(
        "TERMINAL 02",
        "GENERATIVE AI",
        "Diffusion Geometry & Autoregressive World Models",
        "#818cf8",
        "#55d9ff",
        "#818CF8"
      ),
      t3: createTerminalTexture(
        "TERMINAL 03",
        "AI SYSTEMS",
        "Multi-Agent Consensus & Quantum Logic Graphs",
        "#29b6f6",
        "#55d9ff",
        "#29B6F6"
      ),
      t4: createTerminalTexture(
        "TERMINAL 04",
        "EXPERIMENTS",
        "Live Subatomic Neural Weight Synthesis",
        "#ff9e24",
        "#ffc84a",
        "#FF9E24"
      ),
      diag1: createDiagnosticTexture("MXC TEMPERATURE", "12.42 mK // STABLE (+/-0.01)"),
      diag2: createDiagnosticTexture("RF COHERENCE", "T1: 212us // T2: 268us (AVG)"),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(termTextures).forEach((t) => t.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials, termTextures]);

  // Get AI Lab world position offset
  const labOffset = useMemo(() => getAILabWorldOffset(), []);

  // Zero-GC useFrame animation loop
  useFrame((state, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.aiLab ?? 0);

    // Smooth lighting modulation
    if (labAmbientRef.current) labAmbientRef.current.intensity = 1.8 * effWeight;
    if (labDirLightRef.current) labDirLightRef.current.intensity = 2.4 * effWeight;
    if (labPointLight1Ref.current) labPointLight1Ref.current.intensity = 6.5 * effWeight;
    if (labPointLight2Ref.current) labPointLight2Ref.current.intensity = 6.5 * effWeight;

    if (effWeight < 0.001) return;

    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // 1. Terminal Reactive Focus Proximity
    const updateTerminal = (
      termRef: React.RefObject<THREE.Group | null>,
      targetX: number,
      baseRotY: number
    ) => {
      if (termRef.current) {
        termRef.current.position.y = Math.sin(t * 1.8 + targetX) * 0.02;
        termRef.current.rotation.y = baseRotY + Math.sin(t * 0.6) * 0.01;
      }
    };

    updateTerminal(terminal1Ref, -4.2, 0.55);
    updateTerminal(terminal2Ref, 4.2, -0.55);
    updateTerminal(terminal3Ref, -4.2, 1.25);
    updateTerminal(terminal4Ref, 4.2, -1.25);

    // 2. Return Rift Swirl
    if (returnRiftRef.current) {
      returnRiftRef.current.rotation.z += safeDelta * 0.55;
    }
    if (returnRiftLightRef.current) {
      returnRiftLightRef.current.intensity =
        (6.5 + Math.sin(t * 3.5) * 1.6 + Math.cos(t * 7.2) * 0.8) * effWeight;
    }

    // 3. Chamber Data Particles
    if (dataParticlesRef.current) {
      const posAttr = dataParticlesRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        arr[idx] += particleSpeeds[idx] * safeDelta;
        arr[idx + 1] += particleSpeeds[idx + 1] * safeDelta;
        arr[idx + 2] += particleSpeeds[idx + 2] * safeDelta;

        if (arr[idx + 1] > 18.0) {
          arr[idx + 1] = 0.5;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={chamberGroupRef} name="ai-research-chamber" position={[labOffset.x, labOffset.y, labOffset.z]}>
      {/* ------------------------------------------------------------- */}
      {/* 1. LAYERED LIGHTING: BLUE LAB + CELESTIAL SPACE + GOLD BOUNCE */}
      {/* ------------------------------------------------------------- */}
      {/* Deep Blue Lab Ambient Light */}
      <ambientLight ref={labAmbientRef} color="#081a2e" intensity={1.8} />

      {/* Directional Key Lighting from Dome Openings */}
      <directionalLight ref={labDirLightRef} position={[0, 26, -6]} color="#29b6f6" intensity={2.4} />

      {/* Lateral Blue Accent Lights emphasizing chamber scale */}
      <pointLight ref={labPointLight1Ref} position={[-22, 9, -6]} color="#00e5ff" intensity={6.5} distance={42} />
      <pointLight ref={labPointLight2Ref} position={[22, 9, -6]} color="#00e5ff" intensity={6.5} distance={42} />

      {/* ------------------------------------------------------------- */}
      {/* 2. SPECTACULAR SPACE / GALAXY CEILING & OBSERVATION DOME      */}
      {/* ------------------------------------------------------------- */}
      <SpaceObservationDome weight={weight} />

      {/* ------------------------------------------------------------- */}
      {/* 3. MASSIVE GLASS RESEARCH WINDOWS & LIVE COMPUTATION DISPLAYS */}
      {/* ------------------------------------------------------------- */}
      <ResearchGlassWindows weight={weight} />

      {/* ------------------------------------------------------------- */}
      {/* 4. CENTRAL HERO: SUPERCONDUCTING QUANTUM CHANDELIER           */}
      {/* ------------------------------------------------------------- */}
      <QuantumComputerChandelier weight={weight} />

      {/* ------------------------------------------------------------- */}
      {/* 5. REFLECTIVE METALLIC FLOOR & CONCENTRIC TECH RINGS          */}
      {/* ------------------------------------------------------------- */}
      {/* Reflective Metallic Floor (R = 36m) */}
      <mesh position={[0, 0, -6]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floor}>
        <circleGeometry args={[36, 64]} />
      </mesh>

      {/* Floor Concentric Technological Rings (Cyan & Azure) */}
      {[12, 18, 24, 30].map((radius, i) => (
        <mesh
          key={`floor-ring-${i}`}
          position={[0, 0.012, -6]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={i % 2 === 0 ? materials.cyanEmissive : materials.subtleBlueEmissive}
        >
          <ringGeometry args={[radius, radius + 0.07, 64]} />
        </mesh>
      ))}

      {/* Radial Floor Conduits radiating outward from the quantum center */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <mesh
            key={`radial-floor-trace-${i}`}
            position={[Math.cos(angle) * 20, 0.014, -6 + Math.sin(angle) * 20]}
            rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
            material={materials.cyanEmissive}
          >
            <planeGeometry args={[0.06, 20]} />
          </mesh>
        );
      })}

      {/* ------------------------------------------------------------- */}
      {/* 6. MULTI-LEVEL RESEARCH FACILITY ARCHITECTURE                 */}
      {/* ------------------------------------------------------------- */}
      {/* Curved Cylindrical Perimeter Walls (Radius = 33m, Height = 18m) */}
      <mesh position={[0, 9, -6]} material={materials.wallNavy}>
        <cylinderGeometry args={[33, 33, 18, 48, 1, true]} />
      </mesh>

      {/* 16 Heavy Radial Columns rising from floor to dome arch springs */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const px = Math.cos(angle) * 32.5;
        const pz = -6 + Math.sin(angle) * 32.5;
        return (
          <group key={`column-${i}`} position={[px, 0, pz]} rotation={[0, -angle, 0]}>
            <mesh position={[0, 9, 0]} material={materials.structuralPillars}>
              <boxGeometry args={[1.4, 18, 1.8]} />
            </mesh>
            {/* Cyan edge-lit conduit on column face */}
            <mesh position={[0.72, 9, 0]} material={materials.cyanEmissive}>
              <boxGeometry args={[0.05, 17.6, 0.14]} />
            </mesh>
            {/* Upper cantilever truss bracket to dome spring */}
            <mesh position={[-1.4, 16.5, 0]} rotation={[0, 0, -0.6]} material={materials.structuralSteel}>
              <boxGeometry args={[1.0, 3.8, 1.4]} />
            </mesh>
          </group>
        );
      })}

      {/* LEVEL 2: Perimeter Catwalk Balcony (Y = 6.0m) */}
      <group position={[0, 6.0, -6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.balconyDeck}>
          <ringGeometry args={[26.5, 32.8, 48]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.cyanEmissive}>
          <ringGeometry args={[26.4, 26.5, 48]} />
        </mesh>
        <mesh position={[0, 0.55, 0]} material={materials.glassRailing}>
          <cylinderGeometry args={[26.5, 26.5, 1.1, 48, 1, true]} />
        </mesh>
        <mesh position={[0, 1.12, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.structuralSteel}>
          <ringGeometry args={[26.45, 26.55, 48]} />
        </mesh>
      </group>

      {/* LEVEL 3: Upper Research Observation Catwalk (Y = 13.5m) */}
      <group position={[0, 13.5, -6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.balconyDeck}>
          <ringGeometry args={[29.0, 32.8, 48]} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.azureEmissive}>
          <ringGeometry args={[28.9, 29.0, 48]} />
        </mesh>
        <mesh position={[0, 0.55, 0]} material={materials.glassRailing}>
          <cylinderGeometry args={[29.0, 29.0, 1.1, 48, 1, true]} />
        </mesh>
      </group>

      {/* Ceiling Gantry Suspension Rings (Integrated with Space Dome Base) */}
      <group position={[0, 17.5, -6]}>
        {[10, 18, 26].map((radius, i) => (
          <mesh
            key={`ceiling-truss-${i}`}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.cyanEmissive}
          >
            <ringGeometry args={[radius, radius + 0.12, 48]} />
          </mesh>
        ))}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={`ceiling-beam-${i}`}
              position={[Math.cos(angle) * 16, 0.2, Math.sin(angle) * 16]}
              rotation={[0, -angle, 0]}
              material={materials.structuralSteel}
            >
              <boxGeometry args={[0.65, 0.9, 28]} />
            </mesh>
          );
        })}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 7. ENTRANCE ARCHWAY (PORTAL THRESHOLD AT Z = 8.8)             */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, 8.8]}>
        {/* Left Entrance Wall Wing */}
        <mesh position={[-8.5, 4.0, 0.6]} material={materials.wallNavy}>
          <boxGeometry args={[10.2, 9.5, 0.6]} />
        </mesh>
        {/* Right Entrance Wall Wing */}
        <mesh position={[8.5, 4.0, 0.6]} material={materials.wallNavy}>
          <boxGeometry args={[10.2, 9.5, 0.6]} />
        </mesh>
        {/* Header Beam above portal arch */}
        <mesh position={[0, 7.2, 0.6]} material={materials.wallNavy}>
          <boxGeometry args={[7.2, 3.2, 0.6]} />
        </mesh>

        {/* Grand Arch Frame */}
        <mesh position={[0, 3.4, 0]} material={materials.entranceArch}>
          <torusGeometry args={[3.4, 0.5, 14, 36, Math.PI]} />
        </mesh>
        <mesh position={[-3.4, 1.7, 0]} material={materials.entranceArch}>
          <boxGeometry args={[1.0, 3.4, 1.0]} />
        </mesh>
        <mesh position={[3.4, 1.7, 0]} material={materials.entranceArch}>
          <boxGeometry args={[1.0, 3.4, 1.0]} />
        </mesh>

        {/* Cyan accent strip on entrance arch */}
        <mesh position={[0, 3.4, 0.15]}>
          <torusGeometry args={[3.3, 0.04, 8, 36, Math.PI]} />
          <meshBasicMaterial color="#00e5ff" toneMapped={false} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 8. MONUMENTAL CENTRAL TECHNICAL PLATFORM                      */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -6.0]}>
        {/* Tier 1 Base Platform (Radius = 9.4m) */}
        <mesh position={[0, 0.09, 0]} material={materials.daisPlatform}>
          <cylinderGeometry args={[9.0, 9.4, 0.18, 48]} />
        </mesh>
        <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.cyanEmissive}>
          <ringGeometry args={[8.9, 9.0, 48]} />
        </mesh>

        {/* Tier 2 Mid Raised Platform (Radius = 7.0m) */}
        <mesh position={[0, 0.26, 0]} material={materials.daisTier2}>
          <cylinderGeometry args={[6.7, 7.0, 0.18, 48]} />
        </mesh>
        <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.azureEmissive}>
          <ringGeometry args={[6.6, 6.7, 48]} />
        </mesh>

        {/* Tier 3 Inner Platform (Radius = 4.6m) */}
        <mesh position={[0, 0.44, 0]} material={materials.daisPlatform}>
          <cylinderGeometry args={[4.4, 4.6, 0.18, 48]} />
        </mesh>

        {/* Granite Optical Table / Vibration Isolation Plinth (Directly under QPU) */}
        <mesh position={[0, 0.70, 0]} material={materials.granitePlinth}>
          <cylinderGeometry args={[2.3, 2.4, 0.38, 36]} />
        </mesh>
        {/* Stainless Steel Plinth Top Plate with 25mm breadboard grid pattern */}
        <mesh position={[0, 0.90, 0]} material={materials.stainlessSteel}>
          <cylinderGeometry args={[2.2, 2.2, 0.05, 36]} />
        </mesh>

        {/* 4 Pneumatic Vibration Isolation Dampers supporting the Plinth */}
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((a, i) => (
          <group key={`damper-${i}`} position={[Math.cos(a) * 1.9, 0.58, Math.sin(a) * 1.9]}>
            <mesh material={materials.darkTitanium}>
              <cylinderGeometry args={[0.24, 0.26, 0.38, 16]} />
            </mesh>
            <mesh position={[0, 0.2, 0]} material={materials.stainlessSteel}>
              <cylinderGeometry args={[0.13, 0.13, 0.16, 16]} />
            </mesh>
            <mesh position={[0, 0.09, 0.25]} material={materials.brassRF}>
              <boxGeometry args={[0.11, 0.09, 0.06]} />
            </mesh>
          </group>
        ))}

        {/* Floor Service Trench & Umbilical Bellows Conduit */}
        <mesh position={[0, 0.55, 2.6]} rotation={[0.4, 0, 0]} material={materials.stainlessSteel}>
          <cylinderGeometry args={[0.16, 0.16, 1.3, 16]} />
        </mesh>

        {/* 4 Radial Access Stairs connecting floor to dais */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <group key={`access-ramp-${i}`} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.2, 8.0]} rotation={[-0.08, 0, 0]} material={materials.structuralSteel}>
              <boxGeometry args={[1.9, 0.22, 3.4]} />
            </mesh>
            <mesh position={[-0.96, 0.32, 8.0]} material={materials.cyanEmissive}>
              <boxGeometry args={[0.04, 0.04, 3.4]} />
            </mesh>
            <mesh position={[0.96, 0.32, 8.0]} material={materials.cyanEmissive}>
              <boxGeometry args={[0.04, 0.04, 3.4]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 9. 4 PRIMARY AI TERMINALS                                     */}
      {/* ------------------------------------------------------------- */}
      {/* TERMINAL 01: COMPUTER VISION */}
      <group ref={terminal1Ref} position={[-4.2, 0, -3.2]} rotation={[0, 0.55, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.workstationBody}>
          <boxGeometry args={[0.75, 1.3, 0.5]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={materials.cyanEmissive}>
          <boxGeometry args={[0.85, 0.06, 0.6]} />
        </mesh>
        <mesh position={[0, 1.5, 0.08]} rotation={[-0.35, 0, 0]} material={materials.terminalBezel}>
          <boxGeometry args={[1.4, 0.9, 0.06]} />
        </mesh>
        <mesh position={[0, 1.5, 0.12]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.34, 0.84]} />
          <meshBasicMaterial map={termTextures.t1} toneMapped={false} />
        </mesh>
      </group>

      {/* TERMINAL 02: GENERATIVE AI */}
      <group ref={terminal2Ref} position={[4.2, 0, -3.2]} rotation={[0, -0.55, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.workstationBody}>
          <boxGeometry args={[0.75, 1.3, 0.5]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={materials.azureEmissive}>
          <boxGeometry args={[0.85, 0.06, 0.6]} />
        </mesh>
        <mesh position={[0, 1.5, 0.08]} rotation={[-0.35, 0, 0]} material={materials.terminalBezel}>
          <boxGeometry args={[1.4, 0.9, 0.06]} />
        </mesh>
        <mesh position={[0, 1.5, 0.12]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.34, 0.84]} />
          <meshBasicMaterial map={termTextures.t2} toneMapped={false} />
        </mesh>
      </group>

      {/* TERMINAL 03: AI SYSTEMS */}
      <group ref={terminal3Ref} position={[-4.2, 0, -8.8]} rotation={[0, 1.25, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.workstationBody}>
          <boxGeometry args={[0.75, 1.3, 0.5]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={materials.cyanEmissive}>
          <boxGeometry args={[0.85, 0.06, 0.6]} />
        </mesh>
        <mesh position={[0, 1.5, 0.08]} rotation={[-0.35, 0, 0]} material={materials.terminalBezel}>
          <boxGeometry args={[1.4, 0.9, 0.06]} />
        </mesh>
        <mesh position={[0, 1.5, 0.12]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.34, 0.84]} />
          <meshBasicMaterial map={termTextures.t3} toneMapped={false} />
        </mesh>
      </group>

      {/* TERMINAL 04: EXPERIMENTS */}
      <group ref={terminal4Ref} position={[4.2, 0, -8.8]} rotation={[0, -1.25, 0]}>
        <mesh position={[0, 0.65, 0]} material={materials.workstationBody}>
          <boxGeometry args={[0.75, 1.3, 0.5]} />
        </mesh>
        <mesh position={[0, 0.04, 0]} material={materials.amberLed}>
          <boxGeometry args={[0.85, 0.06, 0.6]} />
        </mesh>
        <mesh position={[0, 1.5, 0.08]} rotation={[-0.35, 0, 0]} material={materials.terminalBezel}>
          <boxGeometry args={[1.4, 0.9, 0.06]} />
        </mesh>
        <mesh position={[0, 1.5, 0.12]} rotation={[-0.35, 0, 0]}>
          <planeGeometry args={[1.34, 0.84]} />
          <meshBasicMaterial map={termTextures.t4} toneMapped={false} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 10. REALISTIC RESEARCH WORKSTATIONS & CONTROL CONSOLES        */}
      {/* ------------------------------------------------------------- */}
      {[
        { x: -7.6, z: -4.0, rotY: 0.85 },
        { x: 7.6, z: -4.0, rotY: -0.85 },
        { x: -8.2, z: -7.5, rotY: 1.55 },
        { x: 8.2, z: -7.5, rotY: -1.55 },
        { x: -5.8, z: -11.8, rotY: 2.35 },
        { x: 5.8, z: -11.8, rotY: -2.35 },
      ].map((st, i) => (
        <group key={`sec-station-${i}`} position={[st.x, 0, st.z]} rotation={[0, st.rotY, 0]}>
          {/* Main Console Desk */}
          <mesh position={[0, 0.42, 0]} material={materials.workstationBench}>
            <boxGeometry args={[2.0, 0.84, 0.75]} />
          </mesh>
          <mesh position={[0, 0.02, 0]} material={materials.cyanEmissive}>
            <boxGeometry args={[2.08, 0.04, 0.82]} />
          </mesh>
          {/* Dual Multi-Monitor Setup */}
          {[-0.55, 0.55].map((mx, mIdx) => (
            <group key={`mon-${mIdx}`} position={[mx, 1.15, 0.05]} rotation={[-0.24, (mIdx === 0 ? 0.15 : -0.15), 0]}>
              <mesh material={materials.terminalBezel}>
                <boxGeometry args={[0.95, 0.58, 0.04]} />
              </mesh>
              <mesh position={[0, 0, 0.025]}>
                <planeGeometry args={[0.9, 0.52]} />
                <meshBasicMaterial map={(i + mIdx) % 2 === 0 ? termTextures.diag1 : termTextures.diag2} toneMapped={false} />
              </mesh>
            </group>
          ))}
          {/* Instrument Rack Cabinet beside desk */}
          <mesh position={[1.35, 0.7, 0]} material={materials.workstationBody}>
            <boxGeometry args={[0.55, 1.4, 0.7]} />
          </mesh>
          <mesh position={[1.35, 0.04, 0]} material={materials.azureEmissive}>
            <boxGeometry args={[0.6, 0.06, 0.75]} />
          </mesh>
          {/* Status LEDs on instrument rack */}
          {[0.3, 0.55, 0.8, 1.05].map((ly, lIdx) => (
            <mesh key={`rack-led-${lIdx}`} position={[1.35, ly, 0.36]} material={lIdx % 2 === 0 ? materials.cyanEmissive : materials.amberLed}>
              <boxGeometry args={[0.3, 0.03, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 11. FLOATING CHAMBER DATA PARTICLES                           */}
      {/* ------------------------------------------------------------- */}
      <points ref={dataParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          color="#55d9ff"
          transparent
          opacity={0.45 * renderWeight}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ------------------------------------------------------------- */}
      {/* 12. FORWARD RETURN CORRIDOR & VOLCANIC RIFT GATE (Z = -18.0)  */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -18.0]}>
        <mesh position={[0, 4.5, -0.6]} material={materials.wallNavy}>
          <boxGeometry args={[24, 10.5, 0.6]} />
        </mesh>
        <mesh position={[0, 3.5, 0]} material={materials.structuralPillars}>
          <torusGeometry args={[3.5, 0.5, 14, 36, Math.PI]} />
        </mesh>
        <mesh position={[-3.5, 1.75, 0]} material={materials.structuralPillars}>
          <boxGeometry args={[1.0, 3.5, 1.0]} />
        </mesh>
        <mesh position={[3.5, 1.75, 0]} material={materials.structuralPillars}>
          <boxGeometry args={[1.0, 3.5, 1.0]} />
        </mesh>
        <mesh position={[0, 3.5, 0.05]} material={materials.riftFire}>
          <torusGeometry args={[3.2, 0.12, 12, 36, Math.PI]} />
        </mesh>
        <mesh position={[0, 3.5, 0.08]} material={materials.cyanEmissive}>
          <torusGeometry args={[3.35, 0.04, 12, 36, Math.PI]} />
        </mesh>
        <mesh ref={returnRiftRef} position={[0, 3.3, 0.02]}>
          <circleGeometry args={[3.1, 32]} />
          <meshBasicMaterial color="#160604" />
        </mesh>
        <pointLight
          ref={returnRiftLightRef}
          position={[0, 3.0, 0.8]}
          color="#ff5a0a"
          intensity={6.5}
          distance={16}
          decay={2}
        />
      </group>
    </group>
  );
}
