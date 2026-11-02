"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpaceObservationDomeProps {
  weight?: number;
}

// Deterministic random generator for consistent cosmic distribution
function createSeededRandom(seed = 9923) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Creates high-res procedural texture for the large oceanic/teal gas giant (Planet A).
 */
function createPlanetATexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Deep oceanic turquoise & sapphire base gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#082f49");
  bgGrad.addColorStop(0.2, "#0369a1");
  bgGrad.addColorStop(0.45, "#0284c7");
  bgGrad.addColorStop(0.55, "#0ea5e9");
  bgGrad.addColorStop(0.8, "#0369a1");
  bgGrad.addColorStop(1, "#082f49");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Atmospheric zonal cloud bands & storm vortexes
  const rand = createSeededRandom(4127);
  for (let y = 0; y < 512; y += 4) {
    const bandIntensity = (Math.sin(y * 0.08) * 0.5 + 0.5) * (Math.sin(y * 0.02) * 0.5 + 0.5);
    const alpha = (0.15 + bandIntensity * 0.45 + rand() * 0.1).toFixed(3);
    const isCyan = rand() > 0.4;
    ctx.fillStyle = isCyan ? `rgba(186, 230, 253, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    
    // Wave distortion across longitudes
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 32) {
      const dy = Math.sin((x / 1024) * Math.PI * 6 + y * 0.1) * 3.5;
      ctx.lineTo(x, y + dy);
    }
    ctx.lineTo(1024, y + 4);
    ctx.lineTo(0, y + 4);
    ctx.fill();
  }

  // Great Azure Storm Oval (analogous to Jupiter's red spot)
  const ovalX = 640;
  const ovalY = 280;
  const ovalGrad = ctx.createRadialGradient(ovalX, ovalY, 8, ovalX, ovalY, 65);
  ovalGrad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
  ovalGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.7)");
  ovalGrad.addColorStop(1, "rgba(3, 105, 161, 0)");
  ctx.fillStyle = ovalGrad;
  ctx.beginPath();
  ctx.ellipse(ovalX, ovalY, 70, 36, -0.15, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates high-res procedural texture for the ringed golden/amber gas world (Planet B).
 */
function createPlanetBTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 256);
  bgGrad.addColorStop(0, "#451a03");
  bgGrad.addColorStop(0.25, "#78350f");
  bgGrad.addColorStop(0.5, "#b45309");
  bgGrad.addColorStop(0.75, "#d97706");
  bgGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Fine atmospheric latitudinal banding
  for (let y = 0; y < 256; y += 3) {
    const wave = Math.sin(y * 0.12) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(254, 243, 199, ${(wave * 0.35 + 0.05).toFixed(3)})`;
    ctx.fillRect(0, y, 512, 2.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates texture for Planet B's rings with concentric Cassini divisions.
 */
function createRingsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, 512, 64);
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "rgba(217, 119, 6, 0)");
  grad.addColorStop(0.12, "rgba(245, 158, 11, 0.4)");
  grad.addColorStop(0.28, "rgba(251, 191, 36, 0.85)");
  grad.addColorStop(0.48, "rgba(254, 243, 199, 0.95)");
  // Cassini division gap
  grad.addColorStop(0.52, "rgba(10, 15, 25, 0.05)");
  grad.addColorStop(0.56, "rgba(10, 15, 25, 0.05)");
  grad.addColorStop(0.62, "rgba(245, 158, 11, 0.7)");
  grad.addColorStop(0.85, "rgba(217, 119, 6, 0.45)");
  grad.addColorStop(1, "rgba(180, 83, 9, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function SpaceObservationDome({ weight = 1 }: SpaceObservationDomeProps) {
  // Animation refs for planetary rotation
  const planetAGroupRef = useRef<THREE.Group>(null);
  const planetBGroupRef = useRef<THREE.Group>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const milkyWayRef = useRef<THREE.Points>(null);

  // 1. Celestial Starfield Buffer (1400 stars with varied distances, magnitudes and colors)
  const [starPositions, starColors] = useMemo(() => {
    const starCount = 1400;
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    const rand = createSeededRandom(7721);
    const colorChoices = [
      new THREE.Color("#ffffff"), // Pure bright white
      new THREE.Color("#93c5fd"), // Soft blue
      new THREE.Color("#38bdf8"), // Vivid cyan
      new THREE.Color("#c084fc"), // Distant violet
      new THREE.Color("#fef08a"), // Warm yellow star
      new THREE.Color("#fed7aa"), // Warm amber
    ];

    for (let i = 0; i < starCount; i++) {
      // Hemisphere distribution above the laboratory (Y > 10, distance 55 to 110m)
      const theta = rand() * Math.PI * 2;
      const phi = rand() * Math.PI * 0.42; // Upper dome elevation angle
      const r = 65 + rand() * 45;

      const x = Math.cos(theta) * Math.cos(phi) * r;
      const y = Math.sin(phi) * r + 10;
      const z = -6.0 + Math.sin(theta) * Math.cos(phi) * r;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color variation
      const c = colorChoices[Math.floor(rand() * colorChoices.length)];
      const dim = 0.5 + rand() * 0.5;
      col[i * 3] = c.r * dim;
      col[i * 3 + 1] = c.g * dim;
      col[i * 3 + 2] = c.b * dim;
    }

    return [pos, col];
  }, []);

  // 2. Milky Way Galactic Ribbon (Dense luminous particle band crossing the sky)
  const [milkyPositions, milkyColors] = useMemo(() => {
    const count = 900;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const rand = createSeededRandom(3189);
    const ribbonColorCore = new THREE.Color("#e0f2fe");
    const ribbonColorCyan = new THREE.Color("#38bdf8");
    const ribbonColorViolet = new THREE.Color("#818cf8");
    const ribbonColorMagenta = new THREE.Color("#c084fc");

    for (let i = 0; i < count; i++) {
      // Spline curve along sky: from [-50, 28, -50] to [45, 36, 30]
      const t = (i / count) * 2 - 1; // -1 to 1
      const spreadX = (rand() - 0.5) * 16 * (1 - Math.abs(t) * 0.3);
      const spreadY = (rand() - 0.5) * 8;
      const spreadZ = (rand() - 0.5) * 14;

      const baseX = t * 60 + spreadX;
      const baseY = 28 + Math.cos(t * 1.5) * 10 + spreadY;
      const baseZ = -6.0 + t * 45 + spreadZ;

      pos[i * 3] = baseX;
      pos[i * 3 + 1] = baseY;
      pos[i * 3 + 2] = baseZ;

      // Color gradient from cyan to violet/magenta along galactic dust lane
      const blend = (t + 1) * 0.5;
      const tempColor = new THREE.Color();
      if (blend < 0.4) {
        tempColor.copy(ribbonColorCyan).lerp(ribbonColorCore, blend / 0.4);
      } else if (blend < 0.75) {
        tempColor.copy(ribbonColorCore).lerp(ribbonColorViolet, (blend - 0.4) / 0.35);
      } else {
        tempColor.copy(ribbonColorViolet).lerp(ribbonColorMagenta, (blend - 0.75) / 0.25);
      }

      const lum = 0.4 + rand() * 0.6;
      col[i * 3] = tempColor.r * lum;
      col[i * 3 + 1] = tempColor.g * lum;
      col[i * 3 + 2] = tempColor.b * lum;
    }

    return [pos, col];
  }, []);

  // 3. Procedural Planet Textures & Materials
  const planetResources = useMemo(() => {
    const texPlanetA = createPlanetATexture();
    const texPlanetB = createPlanetBTexture();
    const texRings = createRingsTexture();

    return {
      texPlanetA,
      texPlanetB,
      texRings,
      matPlanetA: new THREE.MeshStandardMaterial({
        map: texPlanetA,
        roughness: 0.75,
        metalness: 0.1,
        fog: false, // Ensures crisp visibility through observation glass dome
      }),
      matPlanetAtmosphere: new THREE.MeshBasicMaterial({
        color: "#38bdf8",
        transparent: true,
        opacity: 0.28,
        side: THREE.BackSide,
        fog: false,
      }),
      matPlanetB: new THREE.MeshStandardMaterial({
        map: texPlanetB,
        roughness: 0.82,
        metalness: 0.15,
        fog: false,
      }),
      matRings: new THREE.MeshBasicMaterial({
        map: texRings,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        fog: false,
      }),
      matMoon: new THREE.MeshStandardMaterial({
        color: "#94a3b8",
        roughness: 0.88,
        metalness: 0.1,
        fog: false,
      }),
      matDomeGlass: new THREE.MeshPhysicalMaterial({
        color: "#082f49",
        transparent: true,
        opacity: 0.22,
        roughness: 0.08,
        metalness: 0.12,
        ior: 1.45,
        side: THREE.DoubleSide,
      }),
      matDomeRibs: new THREE.MeshStandardMaterial({
        color: "#111827",
        roughness: 0.35,
        metalness: 0.85,
      }),
      matDomeEdgeGlow: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
      }),
    };
  }, []);

  // Cleanup textures on unmount
  useEffect(() => {
    return () => {
      planetResources.texPlanetA.dispose();
      planetResources.texPlanetB.dispose();
      planetResources.texRings.dispose();
      planetResources.matPlanetA.dispose();
      planetResources.matPlanetAtmosphere.dispose();
      planetResources.matPlanetB.dispose();
      planetResources.matRings.dispose();
      planetResources.matMoon.dispose();
      planetResources.matDomeGlass.dispose();
      planetResources.matDomeRibs.dispose();
      planetResources.matDomeEdgeGlow.dispose();
    };
  }, [planetResources]);

  // Subtle slow planetary rotation loop (Zero GC allocations)
  useFrame((_, delta) => {
    if (weight < 0.001) return;
    const safeDelta = Math.min(delta, 0.05);

    if (planetAGroupRef.current) {
      planetAGroupRef.current.rotation.y += safeDelta * 0.015;
    }
    if (planetBGroupRef.current) {
      planetBGroupRef.current.rotation.y += safeDelta * 0.018;
    }
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += safeDelta * 0.01;
    }
    if (milkyWayRef.current) {
      milkyWayRef.current.rotation.y += safeDelta * 0.002;
    }
  });

  if (weight < 0.001) return null;

  return (
    <group name="space-observation-dome">
      {/* ------------------------------------------------------------- */}
      {/* 1. DEEP SPACE SKY DOME & CELESTIAL BACKGROUND                 */}
      {/* ------------------------------------------------------------- */}

      {/* Deep Navy/Black Cosmic Backdrop Shell (R = 105m) */}
      <mesh position={[0, 16, -6]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[105, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshBasicMaterial color="#02050e" side={THREE.BackSide} fog={false} />
      </mesh>

      {/* Dense Starfield Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.88 * weight}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          fog={false}
        />
      </points>

      {/* Luminous Milky Way Galactic Band */}
      <points ref={milkyWayRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[milkyPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[milkyColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.32}
          vertexColors
          transparent
          opacity={0.65 * weight}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
          fog={false}
        />
      </points>

      {/* Cosmic Nebula Cloud Sprites (Subtle glowing dust clouds) */}
      {[
        { pos: [-38, 38, -48], color: "#1e1b4b", scale: 42 },
        { pos: [28, 44, -38], color: "#0c4a6e", scale: 38 },
        { pos: [8, 52, -18], color: "#311042", scale: 48 },
      ].map((nebula, idx) => (
        <mesh key={`nebula-${idx}`} position={nebula.pos as [number, number, number]}>
          <sphereGeometry args={[nebula.scale, 16, 16]} />
          <meshBasicMaterial
            color={nebula.color}
            transparent
            opacity={0.14 * weight}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 2. CELESTIAL BODIES (PLANETS & MOON)                          */}
      {/* ------------------------------------------------------------- */}

      {/* PLANET A: Large Oceanic / Teal Gas Giant (Right Upper Sky) */}
      <group position={[26, 44, -38]}>
        <group ref={planetAGroupRef} rotation={[0.2, 0.4, 0.15]}>
          <mesh material={planetResources.matPlanetA}>
            <sphereGeometry args={[11.2, 48, 36]} />
          </mesh>
          {/* Subtle Outer Atmosphere Glow */}
          <mesh material={planetResources.matPlanetAtmosphere}>
            <sphereGeometry args={[11.8, 36, 24]} />
          </mesh>
        </group>
      </group>

      {/* MOON: Rocky Cratered Satellite orbiting near Planet A */}
      <group position={[13.5, 36, -30]}>
        <group ref={moonGroupRef} rotation={[0.4, 0.2, 0]}>
          <mesh material={planetResources.matMoon}>
            <sphereGeometry args={[2.5, 24, 20]} />
          </mesh>
        </group>
      </group>

      {/* PLANET B: Ringed Amber/Bronze World (Left Upper Sky) */}
      <group position={[-34, 38, -52]}>
        <group ref={planetBGroupRef} rotation={[0.38, -0.65, 0.3]}>
          {/* Planet Sphere */}
          <mesh material={planetResources.matPlanetB}>
            <sphereGeometry args={[6.8, 40, 28]} />
          </mesh>
          {/* Ring System */}
          <mesh rotation={[Math.PI / 2 + 0.35, 0.2, 0]} material={planetResources.matRings}>
            <ringGeometry args={[8.8, 15.6, 64]} />
          </mesh>
        </group>
      </group>

      {/* Distant Small Blue Exoplanet (Far Sky) */}
      <mesh position={[-16, 54, -72]}>
        <sphereGeometry args={[3.2, 20, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.7} metalness={0.2} fog={false} />
      </mesh>

      {/* Soft Celestial Fill Light (Cool blue ambient from space) */}
      <directionalLight
        position={[25, 45, -35]}
        color="#38bdf8"
        intensity={0.65 * weight}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. ARCHITECTURAL DOME TRUSS & GLASS OBSERVATION CEILING       */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 18.0, -6.0]}>
        {/* Curving Glass Canopy Shell (Framing the sky from Y = 18m to 32m) */}
        <mesh material={planetResources.matDomeGlass}>
          <sphereGeometry args={[32.5, 48, 16, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
        </mesh>

        {/* 12 Arched Heavy Titanium Ribs Converging to Apex Gantry */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <group key={`dome-rib-${i}`} rotation={[0, angle, 0]}>
              {/* Arched Truss Rib Segment */}
              <mesh position={[16, 6.2, 0]} rotation={[0, 0, -0.52]} material={planetResources.matDomeRibs}>
                <boxGeometry args={[0.7, 1.2, 0.4]} />
              </mesh>
              <mesh position={[24, 2.5, 0]} rotation={[0, 0, -0.28]} material={planetResources.matDomeRibs}>
                <boxGeometry args={[0.8, 1.4, 0.45]} />
              </mesh>
              {/* Edge-lit cyan light strip along rib */}
              <mesh position={[16, 6.3, 0.22]} rotation={[0, 0, -0.52]} material={planetResources.matDomeEdgeGlow}>
                <boxGeometry args={[0.04, 1.15, 0.05]} />
              </mesh>
            </group>
          );
        })}

        {/* Concentric Structural Tension Rings */}
        {[14, 22, 29].map((radius, idx) => (
          <group key={`dome-ring-${idx}`}>
            <mesh
              position={[0, 4.5 + idx * 3.2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={planetResources.matDomeRibs}
            >
              <ringGeometry args={[radius, radius + 0.35, 48]} />
            </mesh>
            <mesh
              position={[0, 4.52 + idx * 3.2, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={planetResources.matDomeEdgeGlow}
            >
              <ringGeometry args={[radius + 0.32, radius + 0.35, 48]} />
            </mesh>
          </group>
        ))}

        {/* Center Apex Compression Ring Framing the Direct Zenith */}
        <mesh position={[0, 13.8, 0]} rotation={[Math.PI / 2, 0, 0]} material={planetResources.matDomeRibs}>
          <ringGeometry args={[6.5, 7.8, 36]} />
        </mesh>
        <mesh position={[0, 13.82, 0]} rotation={[Math.PI / 2, 0, 0]} material={planetResources.matDomeEdgeGlow}>
          <ringGeometry args={[6.48, 6.55, 36]} />
        </mesh>
      </group>
    </group>
  );
}
