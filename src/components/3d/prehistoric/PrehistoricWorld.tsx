"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";
import PrehistoricTerrain from "./PrehistoricTerrain";
import PrehistoricFlora from "./PrehistoricFlora";
import Dinosaurs from "./Dinosaurs";
import PrehistoricAtmosphere from "./PrehistoricAtmosphere";
import VolcanicCave from "./VolcanicCave";
import PrehistoricWaterfalls from "./PrehistoricWaterfalls";

interface PrehistoricWorldProps {
  weight?: number;
}

/**
 * PrehistoricWorld — Master Prehistoric Earth Stage (Stage 7).
 *
 * Sequence:
 * 1. Volcanic Summit Cave Descent & Panoramic Valley Reveal (Z: -1005 to -1115, p: 234 -> 246)
 * 2. Signature Vista: Majestic Cave Arch framing Triceratops, Turquoise River,
 *    Colossal Waterfalls, and Wading Brachiosaurus (p: 246)
 * 3. Emerging into Sunlit Ancient Valley (Z: -1115 to -1260, p: 246 -> 260)
 * 4. Colossal Herbivore Basin & River Savannah (p: 260 -> 280)
 * 5. Ancient Megalithic Passage Loop (p: 280 -> 294)
 */
export default function PrehistoricWorld({ weight }: PrehistoricWorldProps) {
  const worldGroupRef = useRef<THREE.Group>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const canyonFillRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame((state) => {
    const p = worldProgressState.progress;

    // Visibility management:
    if (worldGroupRef.current) {
      const isVisible = p >= 226 && p <= 300;
      if (worldGroupRef.current.visible !== isVisible) {
        worldGroupRef.current.visible = isVisible;
      }
      if (!isVisible) return;
    }

    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.prehistoric ?? 1.0);

    // Filtered Rainforest Sunlight: High overhead directional light filtering through canopy gaps
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 1.45 * effWeight;
      sunLightRef.current.position.set(
        state.camera.position.x + 95.0,
        state.camera.position.y + 130.0,
        state.camera.position.z + 30.0
      );
      sunLightRef.current.target.position.set(
        state.camera.position.x - 5.0,
        state.camera.position.y - 8.0,
        state.camera.position.z - 60.0
      );
      sunLightRef.current.target.updateMatrixWorld();
    }

    // Cool Blue-Green Rainforest Fill Light (Illuminates shaded trunks, ferns & riverbank)
    if (canyonFillRef.current) {
      canyonFillRef.current.intensity = 0.70 * effWeight;
      canyonFillRef.current.position.set(
        state.camera.position.x - 45.0,
        state.camera.position.y + 35.0,
        state.camera.position.z + 20.0
      );
      canyonFillRef.current.target.position.set(
        state.camera.position.x - 12.0,
        state.camera.position.y - 3.0,
        state.camera.position.z - 25.0
      );
      canyonFillRef.current.target.updateMatrixWorld();
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.45 * effWeight;
    }
  });

  return (
    <group ref={worldGroupRef} name="stage-prehistoric-earth">
      {/* 1. Filtered Primeval Sunlight through Canopy */}
      <directionalLight
        ref={sunLightRef}
        position={[95, 130, -1070]}
        color="#f4f8e6"
        intensity={1.45}
        castShadow={false}
      />

      {/* 2. Cool Blue-Green Rainforest Fill Light */}
      <directionalLight
        ref={canyonFillRef}
        position={[-45, 35, -1085]}
        color="#285e56"
        intensity={0.70}
        castShadow={false}
      />

      {/* 3. Deep Rainforest Canopy & Moist Earth Hemisphere Light */}
      <hemisphereLight args={["#1e4a46", "#0e2212", 0.65]} />
      <ambientLight ref={ambientLightRef} color="#183630" intensity={0.45} />

      {/* 4. Colossal Volcanic Cavern Ceiling & Grand Natural Rock Arch */}
      <VolcanicCave />

      {/* 5. Spectacular Multi-Tiered Cascading Waterfalls */}
      <PrehistoricWaterfalls />

      {/* 6. Procedural Prehistoric Valley Terrain, River Rapids & Boulders */}
      <PrehistoricTerrain />

      {/* 7. Instanced Flora: Feathery Cycad Palms, Tree Ferns & Conifers */}
      <PrehistoricFlora />

      {/* 8. Dinosaurs: Hero Triceratops, River Brachiosaurus & Soaring Pterosaurs */}
      <Dinosaurs />

      {/* 9. Atmospheric Sunbeams, Spores & Waterfall Mist */}
      <PrehistoricAtmosphere />
    </group>
  );
}
