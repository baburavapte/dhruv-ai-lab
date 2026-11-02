"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface TransitionTunnelProps {
  weight?: number; // 0-1 visibility/intensity
}

/**
 * TransitionTunnel — Dimensional passage connecting the dragon throat to the AI Lab.
 *
 * Positioned along Z: -46 to -90
 *
 * Visual progression:
 * 1. Dragon throat organic interior (crimson, dark)
 * 2. Transition zone (crimson fading, blue increasing)
 * 3. Dimensional energy field (cyan/blue particles)
 * 4. Portal ring boundary
 * 5. AI Lab approach (deep blue, facility silhouettes emerging)
 */
export default function TransitionTunnel({ weight = 1 }: TransitionTunnelProps) {
  const portalRingRef = useRef<THREE.Group>(null);
  const portalVortexRef = useRef<THREE.Mesh>(null);
  const portalLightRef = useRef<THREE.PointLight>(null);
  const cyanLightRef = useRef<THREE.PointLight>(null);
  const dimLightRef = useRef<THREE.PointLight>(null);

  const materials = useMemo(() => {
    return {
      // Organic dark tunnel walls (dragon throat continuation)
      tunnelDark: new THREE.MeshStandardMaterial({
        color: "#0c0810",
        roughness: 0.92,
        metalness: 0.10,
        side: THREE.BackSide,
      }),
      // Mid-transition walls (less organic, more dimensional)
      tunnelMid: new THREE.MeshStandardMaterial({
        color: "#080a14",
        roughness: 0.75,
        metalness: 0.30,
        side: THREE.BackSide,
      }),
      // Dimensional tunnel (blue-tinted)
      tunnelDimensional: new THREE.MeshStandardMaterial({
        color: "#060c1a",
        roughness: 0.60,
        metalness: 0.40,
        side: THREE.BackSide,
      }),
      // Portal ring frame
      portalFrame: new THREE.MeshStandardMaterial({
        color: "#0a1020",
        roughness: 0.28,
        metalness: 0.88,
      }),
      // Crimson energy rim
      portalRimFire: new THREE.MeshBasicMaterial({
        color: "#FF5A0A",
        toneMapped: false,
      }),
      // Cyan dimensional energy rim
      portalRimCyan: new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        toneMapped: false,
      }),
      // Blue transition energy
      blueEmissive: new THREE.MeshBasicMaterial({
        color: "#00b8d4",
        toneMapped: false,
        transparent: true,
        opacity: 0.5,
      }),
      // Portal vortex center
      portalCore: new THREE.MeshBasicMaterial({
        color: "#020208",
      }),
      // Floor
      tunnelFloor: new THREE.MeshStandardMaterial({
        color: "#0a0812",
        roughness: 0.82,
        metalness: 0.18,
      }),
      // Structural ribs
      ribMaterial: new THREE.MeshStandardMaterial({
        color: "#141020",
        roughness: 0.65,
        metalness: 0.40,
      }),
      // Dimensional rib (cyan tinted)
      ribCyan: new THREE.MeshStandardMaterial({
        color: "#0a1828",
        roughness: 0.45,
        metalness: 0.55,
      }),
    };
  }, []);

  useFrame((state, delta) => {
    const effWeight =
      weight !== undefined
        ? weight
        : Math.max(worldProgressState.weights.throat, worldProgressState.weights.portal);

    if (effWeight < 0.001) return;

    const t = state.clock.getElapsedTime();
    const safeDelta = Math.min(delta, 0.05);

    // Portal rotation
    if (portalVortexRef.current) {
      portalVortexRef.current.rotation.z -= safeDelta * 0.55;
    }
    if (portalRingRef.current) {
      portalRingRef.current.rotation.z += safeDelta * 0.25;
    }

    // Portal light pulse
    if (portalLightRef.current) {
      portalLightRef.current.intensity = (4.0 + Math.sin(t * 3.0) * 1.2) * effWeight;
    }

    // Dimensional cyan light
    if (cyanLightRef.current) {
      cyanLightRef.current.intensity = (6.0 + Math.sin(t * 2.2) * 1.5) * effWeight;
    }

    // Dim crimson-to-blue transitional light
    if (dimLightRef.current) {
      dimLightRef.current.intensity = (5.0 + Math.cos(t * 1.8) * 1.0) * effWeight;
    }
  });

  // Tunnel segment positions: from Z=-46 to Z=-90 in sections
  const tunnelSections = [
    // Dragon throat continuation (organic, dark crimson)
    { z: -50, radius: 4.5, height: 8, material: materials.tunnelDark },
    // Transition zone (less organic, more angular)
    { z: -58, radius: 4.2, height: 8, material: materials.tunnelMid },
    // Dimensional passage (blue-tinted)
    { z: -68, radius: 3.8, height: 12, material: materials.tunnelDimensional },
    // AI Lab approach (widening, very blue)
    { z: -80, radius: 4.0, height: 12, material: materials.tunnelDimensional },
  ];

  // Structural ribs along the tunnel
  const ribPositions = [-48, -52, -56, -60, -64, -68, -72, -76, -80, -84, -88];

  return (
    <group name="transition-tunnel" visible={weight > 0.001}>
      {/* ============================================================= */}
      {/* 1. TUNNEL CYLINDERS (Continuous passage)                      */}
      {/* ============================================================= */}
      {tunnelSections.map((section, i) => (
        <mesh
          key={`tunnel-section-${i}`}
          position={[0, 3.4, section.z]}
          rotation={[Math.PI / 2, 0, 0]}
          material={section.material}
        >
          <cylinderGeometry args={[section.radius, section.radius + 0.3, section.height, 24, 1, true]} />
        </mesh>
      ))}

      {/* Tunnel floor */}
      <mesh position={[0, 0.1, -67]} material={materials.tunnelFloor}>
        <boxGeometry args={[5.5, 0.2, 44]} />
      </mesh>

      {/* ============================================================= */}
      {/* 2. STRUCTURAL RIBS (Organic → Dimensional transition)         */}
      {/* ============================================================= */}
      {ribPositions.map((rz, i) => {
        const isCyan = rz < -62;
        const ribMat = isCyan ? materials.ribCyan : materials.ribMaterial;
        const ribRadius = rz < -62 ? 3.6 : 4.2;
        return (
          <group key={`tunnel-rib-${i}`} position={[0, 3.4, rz]}>
            {/* Semi-torus arch rib */}
            <mesh material={ribMat}>
              <torusGeometry args={[ribRadius, 0.28, 8, 20, Math.PI]} />
            </mesh>
            {/* Left anchor */}
            <mesh position={[-ribRadius, -1.4, 0]} material={ribMat}>
              <boxGeometry args={[0.5, 2.8, 0.5]} />
            </mesh>
            {/* Right anchor */}
            <mesh position={[ribRadius, -1.4, 0]} material={ribMat}>
              <boxGeometry args={[0.5, 2.8, 0.5]} />
            </mesh>
            {/* Cyan emissive strip on dimensional ribs */}
            {isCyan && (
              <mesh position={[0, ribRadius + 0.3, 0.04]}>
                <torusGeometry args={[ribRadius - 0.1, 0.04, 6, 20, Math.PI]} />
                <meshBasicMaterial color="#00b8d4" toneMapped={false} transparent opacity={0.6 * weight} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* ============================================================= */}
      {/* 3. DIMENSIONAL PORTAL BOUNDARY (Z = -56 to -60)               */}
      {/* This is the real visual boundary between fire and tech worlds  */}
      {/* ============================================================= */}
      <group position={[0, 3.4, -57]}>
        {/* Outer portal ring */}
        <mesh material={materials.portalFrame}>
          <torusGeometry args={[3.8, 0.4, 16, 36]} />
        </mesh>

        {/* Crimson energy rim (fading world) */}
        <mesh position={[0, 0, 0.06]} material={materials.portalRimFire}>
          <torusGeometry args={[3.4, 0.1, 12, 36]} />
        </mesh>

        {/* Cyan energy rim (approaching world) */}
        <mesh position={[0, 0, 0.08]} material={materials.portalRimCyan}>
          <torusGeometry args={[3.2, 0.08, 12, 36]} />
        </mesh>

        {/* Rotating rune markers */}
        <group ref={portalRingRef}>
          {Array.from({ length: 12 }).map((_, i) => {
            const rad = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={`portal-rune-${i}`}
                position={[Math.cos(rad) * 3.8, Math.sin(rad) * 3.8, 0.12]}
                rotation={[0, 0, rad]}
              >
                <boxGeometry args={[0.25, 0.5, 0.15]} />
                <meshBasicMaterial
                  color={i % 2 === 0 ? "#00e5ff" : "#ff5a0a"}
                  toneMapped={false}
                  transparent
                  opacity={0.7 * weight}
                />
              </mesh>
            );
          })}
        </group>

        {/* Black vortex center */}
        <mesh ref={portalVortexRef} position={[0, 0, 0.02]}>
          <circleGeometry args={[3.3, 32]} />
          <meshBasicMaterial color="#010108" transparent opacity={0.85} />
        </mesh>

        {/* Portal light */}
        <pointLight
          ref={portalLightRef}
          position={[0, 0, 1.5]}
          color="#00b8d4"
          distance={20}
          decay={2}
        />
      </group>

      {/* ============================================================= */}
      {/* 4. DIMENSIONAL ENERGY LINES along tunnel walls                 */}
      {/* ============================================================= */}
      {/* Cyan strips running along tunnel after portal */}
      {[-62, -68, -74, -80, -86].map((z, i) => (
        <group key={`energy-strip-${i}`}>
          {/* Left wall strip */}
          <mesh position={[-3.2, 3.4, z]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.12, 5.5]} />
            <meshBasicMaterial
              color="#00e5ff"
              toneMapped={false}
              transparent
              opacity={0.4 * weight}
            />
          </mesh>
          {/* Right wall strip */}
          <mesh position={[3.2, 3.4, z]} rotation={[0, -0.1, 0]}>
            <boxGeometry args={[0.04, 0.12, 5.5]} />
            <meshBasicMaterial
              color="#00e5ff"
              toneMapped={false}
              transparent
              opacity={0.4 * weight}
            />
          </mesh>
          {/* Floor strip */}
          <mesh position={[0, 0.22, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 5.5]} />
            <meshBasicMaterial
              color="#0090b0"
              toneMapped={false}
              transparent
              opacity={0.35 * weight}
            />
          </mesh>
        </group>
      ))}

      {/* ============================================================= */}
      {/* 5. LIGHTING                                                    */}
      {/* ============================================================= */}
      {/* Crimson light in the organic section */}
      <pointLight
        ref={dimLightRef}
        position={[0, 3.5, -50]}
        color="#c82414"
        distance={18}
        decay={2}
      />
      {/* Cyan dimensional light in the mid-section */}
      <pointLight
        ref={cyanLightRef}
        position={[0, 3.5, -70]}
        color="#00b8d4"
        distance={24}
        decay={2}
      />
      {/* Broad blue light approaching AI Lab */}
      <pointLight
        position={[0, 3.5, -85]}
        color="#1565c0"
        intensity={4.0 * weight}
        distance={20}
        decay={2}
      />
    </group>
  );
}
