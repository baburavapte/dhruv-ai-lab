"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";

interface LightingProps {
  shadowMapSize?: number;
}

export default function Lighting({ shadowMapSize = 1024 }: LightingProps) {
  const torch1Ref = useRef<THREE.PointLight>(null);
  const torch2Ref = useRef<THREE.PointLight>(null);
  const torch3Ref = useRef<THREE.PointLight>(null);
  const torch4Ref = useRef<THREE.PointLight>(null);
  const gateTorchLeftRef = useRef<THREE.PointLight>(null);
  const gateTorchRightRef = useRef<THREE.PointLight>(null);

  // Directional light target positioned directly at the fortress entrance gate
  const targetObject = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0, 5.5, -31.5);
    return obj;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const effWeight = Math.max(worldProgressState.weights.fortress, worldProgressState.weights.dragon);

    // Natural fire flicker effect with layered organic frequencies
    const flicker = (offset: number) => {
      return (
        0.92 +
        Math.sin(t * 8.5 + offset) * 0.08 +
        Math.cos(t * 15.2 + offset * 1.8) * 0.05
      );
    };

    if (torch1Ref.current) torch1Ref.current.intensity = 10.5 * flicker(0.5) * effWeight;
    if (torch2Ref.current) torch2Ref.current.intensity = 10.5 * flicker(1.8) * effWeight;
    if (torch3Ref.current) torch3Ref.current.intensity = 10.5 * flicker(3.2) * effWeight;
    if (torch4Ref.current) torch4Ref.current.intensity = 10.5 * flicker(4.6) * effWeight;
    if (gateTorchLeftRef.current)
      gateTorchLeftRef.current.intensity = 12.0 * flicker(2.1) * effWeight;
    if (gateTorchRightRef.current)
      gateTorchRightRef.current.intensity = 12.0 * flicker(5.4) * effWeight;
  });

  return (
    <>
      <primitive object={targetObject} />

      {/* ------------------------------------------------------------- */}
      {/* 1. AMBIENT & HEMISPHERE (Volcanic ground bounce + cool sky)   */}
      {/* ------------------------------------------------------------- */}
      <hemisphereLight
        color="#485c86"
        groundColor="#641e10"
        intensity={1.25}
      />

      {/* Deep cool ambient base: resolves black detail without washing out darkness */}
      <ambientLight color="#242232" intensity={0.80} />

      {/* ------------------------------------------------------------- */}
      {/* 2. COOL MOONLIGHT & ARCHITECTURAL KEY LIGHT                   */}
      {/* ------------------------------------------------------------- */}
      <directionalLight
        position={[-18, 38, 22]}
        target={targetObject}
        color="#8ea2c8"
        intensity={2.2}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={5}
        shadow-camera-far={140}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0003}
      />

      {/* Architectural Fill: prevents pitch-black shadow crush */}
      <directionalLight
        position={[22, 24, 16]}
        target={targetObject}
        color="#546684"
        intensity={0.85}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. DRAGON SILHOUETTE SEPARATION RIG                           */}
      {/* ------------------------------------------------------------- */}
      {/* Cool Indigo Rim Backlight: hits horn tips, crest, and cranium from behind */}
      <pointLight
        position={[0, 13.5, -33.2]}
        color="#708cb8"
        intensity={3.8}
        distance={22}
        decay={2}
      />

      {/* Warm Lava Bounce Fill: illuminates snout underside, jaws, and teeth */}
      <pointLight
        position={[0, 4.0, -26.5]}
        color="#ff6618"
        intensity={3.6}
        distance={18}
        decay={2}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4. VOLCANIC FOG MANAGED EXCLUSIVELY BY STAGEFOGCONTROLLER    */}
      {/* ------------------------------------------------------------- */}

      {/* ------------------------------------------------------------- */}
      {/* 5. AVENUE TORCHES (Warm amber washes over pillars & road)     */}
      {/* ------------------------------------------------------------- */}
      <pointLight
        ref={torch1Ref}
        position={[-5.0, 5.8, 2.0]}
        color="#ff6e18"
        distance={28}
        decay={2}
      />
      <pointLight
        ref={torch2Ref}
        position={[5.0, 5.8, 2.0]}
        color="#ff6e18"
        distance={28}
        decay={2}
      />

      <pointLight
        ref={torch3Ref}
        position={[-5.0, 5.8, -14.0]}
        color="#ff6414"
        distance={28}
        decay={2}
      />
      <pointLight
        ref={torch4Ref}
        position={[5.0, 5.8, -14.0]}
        color="#ff6414"
        distance={28}
        decay={2}
      />

      {/* ------------------------------------------------------------- */}
      {/* 6. GATEHOUSE TORCHES & INTERIOR VOID GLOW                     */}
      {/* ------------------------------------------------------------- */}
      <pointLight
        ref={gateTorchLeftRef}
        position={[-9.5, 9.8, -28]}
        color="#ff5410"
        distance={30}
        decay={2}
      />
      <pointLight
        ref={gateTorchRightRef}
        position={[9.5, 9.8, -28]}
        color="#ff5410"
        distance={30}
        decay={2}
      />

      {/* Deep interior castle abyss crimson glow */}
      <pointLight
        position={[0, 4.8, -44]}
        color="#8f121e"
        intensity={5.5}
        distance={28}
        decay={2}
      />
    </>
  );
}
