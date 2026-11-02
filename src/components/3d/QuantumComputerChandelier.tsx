"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface QuantumComputerChandelierProps {
  weight?: number;
}

// Procedural texture for the Superconducting QPU Chip Face (64 Transmon Qubit Lattice)
function createQpuChipTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Dark dielectric silicon/sapphire substrate
  ctx.fillStyle = "#060911";
  ctx.fillRect(0, 0, 512, 512);

  // Polished gold ground plane & perimeter contact border
  ctx.strokeStyle = "#ffc84a";
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 484, 484);

  // 64 Gold Wirebond Pads along perimeter
  ctx.fillStyle = "#ffd54f";
  for (let i = 0; i < 16; i++) {
    const offset = 34 + i * 29;
    ctx.fillRect(offset, 18, 20, 12);
    ctx.fillRect(offset, 482, 20, 12);
    ctx.fillRect(18, offset, 12, 20);
    ctx.fillRect(482, offset, 12, 20);
  }

  // Coplanar Waveguide (CPW) RF lines feeding inward
  ctx.strokeStyle = "rgba(255, 200, 74, 0.85)";
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 16; i++) {
    const offset = 44 + i * 29;
    ctx.beginPath();
    ctx.moveTo(offset, 30);
    ctx.lineTo(offset, 110 + (i % 4) * 20);
    ctx.lineTo(256 + (i - 8) * 16, 178 + (i % 4) * 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset, 482);
    ctx.lineTo(offset, 402 - (i % 4) * 20);
    ctx.lineTo(256 + (i - 8) * 16, 334 - (i % 4) * 16);
    ctx.stroke();
  }

  // 8x8 Transmon Qubit Grid (Center)
  const gridSize = 8;
  const startX = 146;
  const startY = 146;
  const step = 31.5;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const qx = startX + c * step;
      const qy = startY + r * step;

      // Golden cross capacitor
      ctx.fillStyle = "#ffc84a";
      ctx.fillRect(qx - 5.5, qy - 1.8, 11, 3.6);
      ctx.fillRect(qx - 1.8, qy - 5.5, 3.6, 11);

      // Microscopic Josephson SQUID junction
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(qx - 2.5, qy - 2.5, 5, 5);

      // Meandering coplanar readout resonator trace
      if (c < gridSize - 1) {
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.beginPath();
        ctx.moveTo(qx + 5.5, qy);
        ctx.lineTo(qx + step - 5.5, qy);
        ctx.stroke();
      }
    }
  }

  // Scientific designation
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("DHRUV-Q64 // QUANTUM COHERENCE CORE", 256, 442);
  ctx.font = "bold 9px monospace";
  ctx.fillStyle = "#ffb74d";
  ctx.fillText("OPERATIONAL TEMP: 12.4 mK // FIDELITY: 99.982%", 256, 458);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function QuantumComputerChandelier({ weight = 1 }: QuantumComputerChandelierProps) {
  // Dynamic refs for animated light pulses, QPU breathing, and micro-motion
  const qpuGroupRef = useRef<THREE.Group>(null);
  const mxcGoldLightRef = useRef<THREE.PointLight>(null);
  const stillWarmLightRef = useRef<THREE.PointLight>(null);
  const upperGoldLightRef = useRef<THREE.PointLight>(null);
  const qubitHoloRef = useRef<THREE.Group>(null);
  const signalPulseMeshRef = useRef<THREE.Mesh>(null);

  // High-fidelity materials for the superconducting cryogenic chandelier
  const materials = useMemo(() => {
    return {
      // 1. Dominant Radiant Gold & Copper cryogenic materials
      brightGold: new THREE.MeshStandardMaterial({
        color: "#ffd54f",
        roughness: 0.1,
        metalness: 0.98,
        emissive: "#d97706",
        emissiveIntensity: 0.28,
      }),
      goldPlatedCopper: new THREE.MeshStandardMaterial({
        color: "#f59e0b",
        roughness: 0.14,
        metalness: 0.96,
        emissive: "#b45309",
        emissiveIntensity: 0.22,
      }),
      warmCopper: new THREE.MeshStandardMaterial({
        color: "#ea580c",
        roughness: 0.16,
        metalness: 0.94,
        emissive: "#7c2d12",
        emissiveIntensity: 0.15,
      }),
      polishedBronze: new THREE.MeshStandardMaterial({
        color: "#9a5828",
        roughness: 0.22,
        metalness: 0.92,
      }),
      brassRF: new THREE.MeshStandardMaterial({
        color: "#eab308",
        roughness: 0.18,
        metalness: 0.94,
      }),
      // 2. Structural & Shielding alloys
      stainlessSteel: new THREE.MeshStandardMaterial({
        color: "#94a3b8",
        roughness: 0.22,
        metalness: 0.9,
      }),
      darkTitanium: new THREE.MeshStandardMaterial({
        color: "#1e293b",
        roughness: 0.32,
        metalness: 0.88,
      }),
      cryopermShield: new THREE.MeshStandardMaterial({
        color: "#334155",
        roughness: 0.26,
        metalness: 0.92,
      }),
      coaxCopperJacket: new THREE.MeshStandardMaterial({
        color: "#ea580c",
        roughness: 0.25,
        metalness: 0.88,
      }),
      coaxSilverJacket: new THREE.MeshStandardMaterial({
        color: "#cbd5e1",
        roughness: 0.18,
        metalness: 0.94,
      }),
      // 3. Inspection glass & emissives
      inspectionGlass: new THREE.MeshPhysicalMaterial({
        color: "#38bdf8",
        transparent: true,
        opacity: 0.24,
        roughness: 0.05,
        metalness: 0.05,
        ior: 1.48,
        side: THREE.DoubleSide,
      }),
      amberGlowLed: new THREE.MeshBasicMaterial({
        color: "#ff9e24",
        toneMapped: false,
      }),
      cyanLed: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
      }),
      holoWireframe: new THREE.MeshBasicMaterial({
        color: "#38bdf8",
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        toneMapped: false,
      }),
      holoNode: new THREE.MeshBasicMaterial({
        color: "#ffc84a",
        toneMapped: false,
      }),
    };
  }, []);

  const qpuChipTexture = useMemo(() => createQpuChipTexture(), []);

  useEffect(() => {
    return () => {
      qpuChipTexture.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    };
  }, [materials, qpuChipTexture]);

  // Operational scientific cycle animation (Zero GC allocations)
  useFrame((state, delta) => {
    if (weight < 0.001) return;
    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // 1. Subtle vibration-isolation micro-motion (<0.5mm amplitude)
    if (qpuGroupRef.current) {
      qpuGroupRef.current.position.y = 2.65 + Math.sin(t * 0.9) * 0.006;
    }

    // 2. Qubit holographic state pulsation & precession
    if (qubitHoloRef.current) {
      qubitHoloRef.current.rotation.y += safeDelta * 0.14;
      const scale = 1.0 + Math.sin(t * 2.4) * 0.04;
      qubitHoloRef.current.scale.set(scale, scale, scale);
    }

    // 3. High-Intensity Golden / Amber Light Breathing Cycle
    // MXC Plate (Base, 15mK) - Deep radiant golden amber
    if (mxcGoldLightRef.current) {
      mxcGoldLightRef.current.intensity = (24.0 + Math.sin(t * 1.6) * 4.5) * weight;
    }
    // 1K Still Plate (Middle) - Warm golden core
    if (stillWarmLightRef.current) {
      stillWarmLightRef.current.intensity = (18.0 + Math.cos(t * 1.4) * 3.0) * weight;
    }
    // 4K Plate (Upper) - Radiant golden fill
    if (upperGoldLightRef.current) {
      upperGoldLightRef.current.intensity = (15.0 + Math.sin(t * 2.0) * 2.5) * weight;
    }

    // 4. Moving microwave packet pulse along vertical cable harness
    if (signalPulseMeshRef.current) {
      const pulseY = 3.8 + ((t * 2.2) % 9.0);
      signalPulseMeshRef.current.position.y = pulseY;
    }
  });

  if (weight < 0.001) return null;

  return (
    <group name="quantum-computer-chandelier" position={[0, 0, -6.0]}>
      {/* ------------------------------------------------------------- */}
      {/* 1. POWERFUL GOLDEN ILLUMINATION (HERO LIGHT OF THE SCENE)     */}
      {/* ------------------------------------------------------------- */}

      {/* Primary MXC Golden Light (Directly illuminates platform, floor, and QPU) */}
      <pointLight
        ref={mxcGoldLightRef}
        position={[0, 3.8, 0]}
        color="#ffc84a"
        intensity={24.0 * weight}
        distance={18.0}
        decay={2}
      />

      {/* Mid-Stage Amber Warm Light (1K Still & 100mK plates) */}
      <pointLight
        ref={stillWarmLightRef}
        position={[0, 7.8, 0]}
        color="#ff9e24"
        intensity={18.0 * weight}
        distance={18.0}
        decay={2}
      />

      {/* Upper 4K Flange Golden Glow */}
      <pointLight
        ref={upperGoldLightRef}
        position={[0, 11.2, 0]}
        color="#f59e0b"
        intensity={15.0 * weight}
        distance={20.0}
        decay={2}
      />

      {/* 50K Stage Warm Golden Ambient Fill */}
      <pointLight
        position={[0, 13.2, 0]}
        color="#d97706"
        intensity={12.0 * weight}
        distance={22.0}
        decay={2}
      />

      {/* Focused Golden Floor Spotlights (Creating rich golden light bounce on the dais) */}
      <spotLight
        position={[0, 12, 0]}
        target-position={[0, 0, 0]}
        color="#ffc84a"
        intensity={32.0 * weight}
        angle={0.65}
        penumbra={0.7}
        distance={18}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. SECTION A: INDUSTRIAL CEILING GANTRY & SUSPENSION TRUSS    */}
      {/* ------------------------------------------------------------- */}
      {/* Heavy Structural Suspension Turnbuckles / Tie-Rods (Y = 16.0 to 19.5m) */}
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((angle, i) => {
        const px = Math.cos(angle) * 3.1;
        const pz = Math.sin(angle) * 3.1;
        return (
          <group key={`turnbuckle-${i}`}>
            <mesh
              position={[px, 17.8, pz]}
              rotation={[0.32 * Math.sin(angle), 0, 0.32 * Math.cos(angle)]}
              material={materials.stainlessSteel}
            >
              <cylinderGeometry args={[0.09, 0.09, 3.8, 12]} />
            </mesh>
            <mesh position={[px * 0.88, 17.1, pz * 0.88]} material={materials.darkTitanium}>
              <cylinderGeometry args={[0.16, 0.16, 0.55, 8]} />
            </mesh>
            {/* Gold Accent Bracket */}
            <mesh position={[px * 0.88, 16.7, pz * 0.88]} material={materials.brightGold}>
              <cylinderGeometry args={[0.18, 0.18, 0.12, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* Central Vacuum Pumping Conduit (Stainless Steel & Gold Flanges) */}
      <mesh position={[0.9, 17.6, -0.6]} material={materials.stainlessSteel}>
        <cylinderGeometry args={[0.35, 0.35, 4.2, 24]} />
      </mesh>
      <mesh position={[0.9, 16.2, -0.6]} material={materials.brightGold}>
        <cylinderGeometry args={[0.42, 0.42, 0.16, 24]} />
      </mesh>

      {/* He3/He4 Gas Circulation Lines (Polished Pure Copper) */}
      {[-0.85, -0.4, 0.45].map((offset, i) => (
        <mesh key={`he-circ-line-${i}`} position={[offset, 17.8, 0.8]} material={materials.warmCopper}>
          <cylinderGeometry args={[0.06, 0.06, 4.0, 14]} />
        </mesh>
      ))}

      {/* Cable Raceways & Trusses */}
      {[-1.8, 1.8].map((x, i) => (
        <mesh key={`cable-tray-${i}`} position={[x, 18.2, 0]} material={materials.darkTitanium}>
          <boxGeometry args={[0.35, 0.22, 5.2]} />
        </mesh>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 3. SECTION B: 300 K TOP FLANGE & RF FEEDTHROUGHS              */}
      {/* ------------------------------------------------------------- */}
      {/* Massive 300K Flange (Diameter = 4.8m) */}
      <mesh position={[0, 15.6, 0]} material={materials.stainlessSteel}>
        <cylinderGeometry args={[2.4, 2.5, 0.28, 48]} />
      </mesh>
      <mesh position={[0, 15.75, 0]} material={materials.brightGold}>
        <cylinderGeometry args={[2.2, 2.2, 0.04, 48]} />
      </mesh>

      {/* Circular array of titanium perimeter bolts */}
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <mesh
            key={`flange-bolt-${i}`}
            position={[Math.cos(a) * 2.42, 15.76, Math.sin(a) * 2.42]}
            material={materials.darkTitanium}
          >
            <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          </mesh>
        );
      })}

      {/* 8 SMA RF Feedthrough Blocks around the Top Flange */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group
            key={`feedthrough-${i}`}
            position={[Math.cos(a) * 1.8, 15.82, Math.sin(a) * 1.8]}
            rotation={[0, -a, 0]}
          >
            <mesh material={materials.goldPlatedCopper}>
              <boxGeometry args={[0.46, 0.18, 0.32]} />
            </mesh>
            {[-0.14, 0, 0.14].map((ox, j) => (
              <mesh key={`sma-jack-${j}`} position={[ox, 0.1, 0]} material={materials.brightGold}>
                <cylinderGeometry args={[0.024, 0.024, 0.06, 8]} />
              </mesh>
            ))}
            <mesh position={[0, 0.1, 0.12]} material={materials.amberGlowLed}>
              <boxGeometry args={[0.025, 0.025, 0.025]} />
            </mesh>
          </group>
        );
      })}

      {/* Upper Polished Cryostat Vacuum Shroud (Partial Cutaway) */}
      <mesh position={[0, 13.8, 0]} rotation={[0, 0.7, 0]} material={materials.cryopermShield}>
        <cylinderGeometry args={[2.35, 2.22, 3.4, 36, 1, true, 0, Math.PI * 1.25]} />
      </mesh>
      <mesh position={[0, 13.8, 0]} rotation={[0, 0.7 + Math.PI * 1.25, 0]} material={materials.inspectionGlass}>
        <cylinderGeometry args={[2.35, 2.22, 3.4, 36, 1, true, 0, Math.PI * 0.75]} />
      </mesh>
      <mesh position={[0, 12.1, 0]} material={materials.brightGold}>
        <cylinderGeometry args={[2.3, 2.3, 0.16, 48, 1, true]} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION C: MULTI-STAGE DILUTION REFRIGERATOR CHANDELIER    */}
      {/* ------------------------------------------------------------- */}

      {/* Central Dilution Column Still Line (High-Purity Stainless Steel & Gold) */}
      <mesh position={[0, 8.4, 0]} material={materials.stainlessSteel}>
        <cylinderGeometry args={[0.16, 0.16, 9.8, 24]} />
      </mesh>

      {/* 6 Outer Structural Standoff Rods supporting the chandelier stages */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={`support-rod-${i}`}
            position={[Math.cos(a) * 1.05, 8.4, Math.sin(a) * 1.05]}
            material={materials.darkTitanium}
          >
            <cylinderGeometry args={[0.042, 0.042, 9.6, 12]} />
          </mesh>
        );
      })}

      {/* STAGE 1: 50 K PLATE (Y = 12.8m, Diameter = 4.0m) */}
      <group position={[0, 12.8, 0]}>
        <mesh material={materials.goldPlatedCopper}>
          <cylinderGeometry args={[1.98, 2.05, 0.14, 48]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={materials.brightGold}>
          <ringGeometry args={[1.95, 2.04, 48]} />
        </mesh>
        <mesh position={[0, 0.45, 0]} material={materials.warmCopper}>
          <cylinderGeometry args={[1.92, 1.92, 0.8, 40, 1, true]} />
        </mesh>
      </group>

      {/* STAGE 2: 4 K FLANGE (Y = 10.4m, Diameter = 3.4m) */}
      <group position={[0, 10.4, 0]}>
        <mesh material={materials.brightGold}>
          <cylinderGeometry args={[1.68, 1.74, 0.12, 44]} />
        </mesh>
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.warmCopper}>
          <ringGeometry args={[1.64, 1.72, 44]} />
        </mesh>
        {/* Cryogenic Attenuator Cylinders (16 around perimeter) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <mesh
              key={`attenuator-4k-${i}`}
              position={[Math.cos(a) * 1.45, -0.24, Math.sin(a) * 1.45]}
              material={i % 2 === 0 ? materials.brassRF : materials.brightGold}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.36, 12]} />
            </mesh>
          );
        })}
      </group>

      {/* STAGE 3: 0.8K / 1 K STILL PLATE (Y = 8.2m, Diameter = 2.8m) */}
      <group position={[0, 8.2, 0]}>
        <mesh material={materials.brightGold}>
          <cylinderGeometry args={[1.38, 1.44, 0.11, 40]} />
        </mesh>
        {/* Pure Copper Still Mixing Body */}
        <mesh position={[0, -0.32, 0]} material={materials.warmCopper}>
          <cylinderGeometry args={[0.46, 0.46, 0.55, 24]} />
        </mesh>
        {/* RF Isolators */}
        {[-0.92, 0.92].map((x, idx) => (
          <mesh key={`isolator-${idx}`} position={[x, -0.26, 0]} material={materials.brassRF}>
            <cylinderGeometry args={[0.18, 0.18, 0.44, 16]} />
          </mesh>
        ))}
      </group>

      {/* STAGE 4: 100 mK COLD PLATE (Y = 6.0m, Diameter = 2.4m) */}
      <group position={[0, 6.0, 0]}>
        <mesh material={materials.brightGold}>
          <cylinderGeometry args={[1.15, 1.2, 0.1, 40]} />
        </mesh>
        {/* Coiled Copper Capillary Heat Exchangers */}
        <mesh position={[0, 0.16, 0]} rotation={[0, 0.4, 0]} material={materials.warmCopper}>
          <torusGeometry args={[0.62, 0.038, 10, 32]} />
        </mesh>
        {/* Microwave Circulators around plate */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={`circulator-${i}`}
              position={[Math.cos(a) * 0.94, -0.18, Math.sin(a) * 0.94]}
              material={materials.brassRF}
            >
              <boxGeometry args={[0.14, 0.2, 0.09]} />
            </mesh>
          );
        })}
      </group>

      {/* STAGE 5: 15 mK MIXING CHAMBER (MXC) BASE PLATE (Y = 3.8m, Diameter = 2.0m) */}
      <group position={[0, 3.8, 0]}>
        {/* Pure Polished Solid Gold Mixing Chamber Disc */}
        <mesh material={materials.brightGold}>
          <cylinderGeometry args={[0.96, 1.02, 0.09, 36]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={materials.warmCopper}>
          <cylinderGeometry args={[0.38, 0.38, 0.4, 24]} />
        </mesh>
        {/* Ruthenium oxide cryogenic sensors & indicators */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a, i) => (
          <mesh
            key={`mxc-sensor-${i}`}
            position={[Math.cos(a) * 0.88, -0.04, Math.sin(a) * 0.88]}
            material={materials.amberGlowLed}
          >
            <sphereGeometry args={[0.022, 10, 10]} />
          </mesh>
        ))}
      </group>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECTION D: HIGH-DENSITY CRYOGENIC COAXIAL WIRING LOOMS     */}
      {/* ------------------------------------------------------------- */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((quadAngle, q) => {
        return (
          <group key={`loom-quad-${q}`} rotation={[0, quadAngle, 0]}>
            {/* 12 Individual coaxial lines running down the quad */}
            {Array.from({ length: 12 }).map((_, i) => {
              const radialDist = 0.52 + (i % 6) * 0.12;
              const lateralOffset = (Math.floor(i / 6) - 0.5) * 0.18;
              const isCopper = (i + q) % 2 === 0;
              return (
                <mesh
                  key={`coax-wire-${q}-${i}`}
                  position={[radialDist, 8.4, lateralOffset]}
                  material={isCopper ? materials.coaxCopperJacket : materials.coaxSilverJacket}
                >
                  <cylinderGeometry args={[0.012, 0.012, 9.6, 6]} />
                </mesh>
              );
            })}
            {/* Precision Gold Cable Combs at each thermal stage */}
            {[12.7, 10.3, 8.1, 5.9, 3.7].map((y, k) => (
              <mesh
                key={`cable-comb-${q}-${k}`}
                position={[0.82, y, 0]}
                material={materials.brightGold}
              >
                <boxGeometry args={[0.48, 0.035, 0.26]} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Copper braided thermal straps */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return (
          <mesh
            key={`thermal-strap-${i}`}
            position={[Math.cos(a) * 0.78, 7.1, Math.sin(a) * 0.78]}
            material={materials.warmCopper}
          >
            <cylinderGeometry args={[0.026, 0.026, 4.4, 8]} />
          </mesh>
        );
      })}

      {/* Animated Microwave Signal Pulse Packet (Traveling light packet) */}
      <mesh ref={signalPulseMeshRef} position={[0.72, 6.0, 0]} material={materials.amberGlowLed}>
        <sphereGeometry args={[0.05, 8, 8]} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* 6. SECTION E: THE QUANTUM PROCESSOR (QPU) ENCLOSURE           */}
      {/* ------------------------------------------------------------- */}
      <group ref={qpuGroupRef} position={[0, 2.7, 0]}>
        {/* Cryoperm / Mu-Metal Superconducting Magnetic Shield Can */}
        <mesh position={[0, 0.55, 0]} material={materials.cryopermShield}>
          <cylinderGeometry args={[0.56, 0.56, 0.7, 36, 1, true]} />
        </mesh>
        {/* Partial Cutaway Viewing Window */}
        <mesh position={[0, 0.55, 0]} rotation={[0, 0.8, 0]} material={materials.inspectionGlass}>
          <cylinderGeometry args={[0.562, 0.562, 0.7, 36, 1, true, 0, Math.PI * 0.75]} />
        </mesh>

        {/* Polished Gold Processor Carrier Housing */}
        <mesh position={[0, 0.55, 0]} material={materials.brightGold}>
          <boxGeometry args={[0.52, 0.52, 0.14]} />
        </mesh>

        {/* High-Resolution QPU Silicon/Sapphire Chip Face */}
        <mesh position={[0, 0.55, 0.08]}>
          <planeGeometry args={[0.48, 0.48]} />
          <meshStandardMaterial
            map={qpuChipTexture}
            roughness={0.16}
            metalness={0.85}
            emissive="#ffc84a"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Side Wirebond Pin Connectors */}
        {[-0.25, 0.25].map((x, i) => (
          <group key={`qpu-conn-${i}`} position={[x, 0.55, 0.02]}>
            {[-0.16, -0.05, 0.05, 0.16].map((y, j) => (
              <mesh
                key={`conn-pin-${j}`}
                position={[0, y, 0]}
                rotation={[0, 0, Math.PI / 2]}
                material={materials.brightGold}
              >
                <cylinderGeometry args={[0.016, 0.016, 0.07, 8]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Copper Cold Finger coupling QPU to MXC Plate */}
        <mesh position={[0, 0.98, 0]} material={materials.warmCopper}>
          <cylinderGeometry args={[0.18, 0.24, 0.58, 24]} />
        </mesh>

        {/* Holographic Qubit Coherence State Visualizer */}
        <group ref={qubitHoloRef} position={[0, -0.68, 0]}>
          <mesh material={materials.holoWireframe}>
            <boxGeometry args={[1.2, 0.65, 1.2]} />
          </mesh>
          {[
            [-0.38, 0, -0.38],
            [0.38, 0, -0.38],
            [-0.38, 0, 0.38],
            [0.38, 0, 0.38],
            [0, 0.2, 0],
            [0, -0.2, 0],
            [-0.2, 0, 0],
            [0.2, 0, 0],
          ].map((p, i) => (
            <mesh key={`qnode-${i}`} position={[p[0], p[1], p[2]]} material={materials.holoNode}>
              <sphereGeometry args={[0.032, 10, 10]} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
