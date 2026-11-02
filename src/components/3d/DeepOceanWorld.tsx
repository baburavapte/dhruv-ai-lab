"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";
import OceanEnvironment from "./OceanEnvironment";
import OceanTrench from "./OceanTrench";
import DeepOceanCreatures from "./DeepOceanCreatures";
import OceanParticles from "./OceanParticles";
import HydrothermalVents from "./HydrothermalVents";
import AbyssCavern from "./AbyssCavern";
import OceanSky, { OCEAN_SUN_POSITION } from "./OceanSky";
import OceanSurface from "./OceanSurface";
import Volcano from "./Volcano";
import WaterlineBreach from "./WaterlineBreach";
import BlueWhales from "./BlueWhales";
import SurfaceFishSchools from "./SurfaceFishSchools";
import SurfaceSharks from "./SurfaceSharks";
import Seabirds from "./Seabirds";

interface DeepOceanWorldProps {
  weight?: number;
}

/**
 * DeepOceanWorld — Complete Deep Ocean, Transparent Surface & Coastal Land World.
 *
 * Encompasses the full vertical and horizontal journey:
 * 1. Deep Ocean Entrance & Pelagic Darkness (Z: -390 to -430)
 * 2. Oceanic Trench & Basalt Columns (Z: -410 to -480)
 * 3. Bioluminescent Ecosystem: Jellyfish, Siphonophores, Comb Jellies (Z: -430 to -510)
 * 4. Hydrothermal Black Smoker Vents & Tube Worms (Z: -485 to -525)
 * 5. Abyssal Cavern & Geological Canyon Ascent Portal (Z: -510 to -575)
 * 6. Rapid Ascent through Mid-Ocean to Transparent Surface (Z: -550 to -630, Y: -22 -> +2.5)
 * 7. Underwater Sky View: Looking upward through transparent water at Sun, Clouds, and Blue Sky (Z: -630 to -690)
 * 8. Marine Life: Silvery fish schools, sleek pelagic sharks, and colossal blue whales under sunbeams
 * 9. Continuous Surface Breakthrough: Camera crosses Y = 6.0 into open air (Z: -690 to -715)
 * 10. Open-Air Ocean: Vast horizon, waves, sun glitter, circling seabirds (Z: -715 to -755)
 * 11. Coastline Approach & Shallow Water: Turquoise shallows, sandy bottom, reefs (Z: -755 to -782)
 * 12. Beach Arrival & Land Trajectory: Sandy beach, dunes, coastal palms, boulders, driftwood (Z: -782 to -805)
 * 13. Natural Geological Exit: Towering coastal cliff with arched sea cave entrance & cavern passage (Z: -805 to -825)
 *
 * Performance Architecture:
 * - InstancedMesh & pre-allocated Float32 buffers.
 * - Module-level shared materials.
 * - Non-shadow-casting lights (castShadow = false).
 * - Zero per-frame allocations in useFrame.
 */
export default function DeepOceanWorld({ weight }: DeepOceanWorldProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Lighting refs for smooth depth-dependent modulation
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const downwellingLightRef = useRef<THREE.DirectionalLight>(null);
  const bioFillLightRef = useRef<THREE.PointLight>(null);
  const ventAccentLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const effWeight =
      weight !== undefined
        ? weight
        : Math.max(worldProgressState.weights.deepOcean ?? 0, (worldProgressState.weights.prehistoric ?? 0) * 0.9);

    if (groupRef.current) {
      if (effWeight <= 0.001) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      }
      if (!groupRef.current.visible) {
        groupRef.current.visible = true;
      }
    }

    const p = worldProgressState.progress;

    // Depth-aware and air-aware lighting modulation:
    // When in deep abyss (p < 178), bioluminescence and dark indigo tones dominate.
    // When ascending to underwater surface (p: 178 to 204), downwelling sunlight brightens.
    // When in open air & coastal land (p: 204 to 226), brilliant daylight illuminates the scene.
    let daylightFactor = 0;
    if (p >= 178 && p <= 226) {
      daylightFactor = Math.min(1.0, (p - 178) / 16.0);
    }

    let airFactor = 0;
    if (p >= 204 && p <= 226) {
      airFactor = 1.0;
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = (0.8 + daylightFactor * 0.4 + airFactor * 0.4) * effWeight;
    }
    if (downwellingLightRef.current) {
      downwellingLightRef.current.intensity = (1.5 + daylightFactor * 1.0 + airFactor * 0.5) * effWeight;
      downwellingLightRef.current.position.set(
        state.camera.position.x + OCEAN_SUN_POSITION.x * 0.3,
        state.camera.position.y + OCEAN_SUN_POSITION.y * 0.3,
        state.camera.position.z + OCEAN_SUN_POSITION.z * 0.3
      );
      downwellingLightRef.current.target.position.set(state.camera.position.x, 6.0, state.camera.position.z);
      downwellingLightRef.current.target.updateMatrixWorld();
    }
    if (bioFillLightRef.current) {
      bioFillLightRef.current.intensity = p > 185 ? 0 : Math.max(0.2, 5.0 - daylightFactor * 4.5) * effWeight;
    }
    if (ventAccentLightRef.current) {
      ventAccentLightRef.current.intensity = p > 185 ? 0 : 4.0 * effWeight;
    }
  });

  return (
    <group ref={groupRef} name="deep-ocean-world-master">
      {/* 1. INTERNAL OCEANIC & DAYLIGHT LIGHTING (All castShadow = false) */}
      <ambientLight ref={ambientLightRef} color="#051c36" intensity={0.8} />

      {/* Atmospheric Hemisphere Skylight (sky blue dome + warm ground bounce) */}
      <hemisphereLight color="#d9eeff" groundColor="#6b705c" intensity={1.1} />

      {/* Downwelling Surface Sunlight from consistent sun direction */}
      <directionalLight
        ref={downwellingLightRef}
        position={[OCEAN_SUN_POSITION.x, OCEAN_SUN_POSITION.y, OCEAN_SUN_POSITION.z]}
        color="#fff5dc"
        intensity={2.8}
        castShadow={false}
      />

      {/* Bioluminescent Mid-Abyss Point Light */}
      <pointLight
        ref={bioFillLightRef}
        position={[0, -10, -470]}
        color="#00e5ff"
        intensity={5.0}
        distance={60}
        castShadow={false}
      />

      {/* Hydrothermal Vent Field Warm Accent Light */}
      <pointLight
        ref={ventAccentLightRef}
        position={[0, -18, -505]}
        color="#ff6600"
        intensity={4.0}
        distance={45}
        castShadow={false}
      />

      {/* Under-surface abyss & trench elements: active only during ocean phase (p <= 228) */}
      <group visible={worldProgressState.progress <= 228}>
        {/* 2. ATMOSPHERIC WATER VOLUME & DISTANT LEVIATHAN SILHOUETTE */}
        <OceanEnvironment />

        {/* 3. OCEANIC TRENCH & BASALT COLUMNS */}
        <OceanTrench />

        {/* 4. BIOLUMINESCENT DEEP-SEA CREATURES */}
        <DeepOceanCreatures />

        {/* 5. MARINE SNOW & BIOLUMINESCENT PLANKTON */}
        <OceanParticles />

        {/* 6. HYDROTHERMAL BLACK SMOKER CHIMNEYS & TUBE WORMS */}
        <HydrothermalVents />

        {/* 7. GRAND ABYSSAL CAVERN & ASCENT CANYON PORTAL */}
        <AbyssCavern />
      </group>

      {/* 8. UPPER OCEAN STRATUM MARINE LIFE (Visible looking upward through water & near surface) */}
      <group visible={worldProgressState.progress >= 180 && worldProgressState.progress <= 218}>
        <BlueWhales />
        <SurfaceFishSchools />
        <SurfaceSharks />
      </group>

      {/* 9. MARITIME SEABIRDS CIRCLING IN OPEN AIR */}
      <group visible={worldProgressState.progress >= 204 && worldProgressState.progress <= 226}>
        <Seabirds />
      </group>

      {/* 10. PROCEDURAL OCEAN SKY DOME & REAL RADIANT SUN */}
      <OceanSky />

      {/* 11. ULTRA-REALISTIC ENDLESS OCEAN WATER SURFACE (Y = 6.0) */}
      <OceanSurface />

      {/* 12. PHYSICAL WATERLINE BREACH & SURFACE MENISCUS (Crossing Y = 6.0) */}
      <WaterlineBreach />

      {/* 13. MASSIVE ACTIVE MOUNT FUJI VOLCANO & BASALT SEA ARCH EXIT */}
      <Volcano />
    </group>
  );
}
