"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { worldProgressState } from "@/lib/worldProgress";
import CellMembrane from "./CellMembrane";
import Nucleus from "./Nucleus";
import Mitochondria from "./Mitochondria";
import EndoplasmicReticulum from "./EndoplasmicReticulum";
import GolgiApparatus from "./GolgiApparatus";
import BiologicalParticles from "./BiologicalParticles";
import CellularCurrents from "./CellularCurrents";

interface CellularWorldProps {
  weight?: number;
}

/**
 * CellularWorld — The Living Biological Universe
 *
 * A complete, separate world after the Atomic World and Molecular Transition.
 * Positioned along Z: -224 to -360.
 *
 * Features:
 * 1. Cell Membrane: Enormous outer living boundary with lipid bilayer and ion pores.
 * 2. Nucleus Landmark: 18m spherical landmark with nuclear pores and DNA double helix.
 * 3. Mitochondria Network: Distributed energy factories with glowing cristae.
 * 4. Endoplasmic Reticulum: Extensive tubular transport highways and ribosome granules.
 * 5. Golgi Apparatus: Stacked curved cisternae and budding secretory vesicles.
 * 6. Biological Currents: Overhead microtubule tracks and directed motor protein packet streams.
 * 7. Cytoplasm Fluid: Drifting micro-particles and biological atmosphere.
 *
 * Performance Architecture:
 * - InstancedMesh & pre-allocated Float32 buffers.
 * - Module-level shared materials.
 * - Non-shadow-casting biological lighting (castShadow = false).
 * - Zero per-frame allocations in useFrame.
 */
export default function CellularWorld({ weight }: CellularWorldProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Biological lighting refs for smooth modulation
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const bioKeyLightRef = useRef<THREE.PointLight>(null);
  const bioTealLightRef = useRef<THREE.PointLight>(null);
  const bioVioletLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const effWeight =
      weight !== undefined
        ? weight
        : (worldProgressState.weights.cellular ?? 0);

    if (groupRef.current) {
      if (effWeight <= 0.001) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      } else if (!groupRef.current.visible) {
        groupRef.current.visible = true;
      }
    }

    // Smooth zero-allocation lighting modulation
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 2.2 * effWeight;
    }
    if (bioKeyLightRef.current) {
      bioKeyLightRef.current.intensity = 8.5 * effWeight;
    }
    if (bioTealLightRef.current) {
      bioTealLightRef.current.intensity = 7.0 * effWeight;
    }
    if (bioVioletLightRef.current) {
      bioVioletLightRef.current.intensity = 7.5 * effWeight;
    }
  });

  return (
    <group ref={groupRef} name="cellular-world-master">
      {/* ------------------------------------------------------------- */}
      {/* 1. INTERNAL BIOLOGICAL LIGHTING (All castShadow = false!)     */}
      {/* ------------------------------------------------------------- */}
      <ambientLight ref={ambientLightRef} color="#071a33" intensity={2.2} />

      {/* Primary Cyan/Teal Biological Key Light in Mid-Cytoplasm */}
      <pointLight
        ref={bioKeyLightRef}
        color="#00e5ff"
        intensity={8.5}
        distance={110}
        decay={2}
        position={[0, 10, -290]}
      />

      {/* Secondary Bio-Teal Light near ER & Entry */}
      <pointLight
        ref={bioTealLightRef}
        color="#00bfa5"
        intensity={7.0}
        distance={95}
        decay={2}
        position={[-10, 8, -260]}
      />

      {/* Deep Violet / Magenta Biological Rim Light near Golgi & Exit */}
      <pointLight
        ref={bioVioletLightRef}
        color="#7c4dff"
        intensity={7.5}
        distance={100}
        decay={2}
        position={[12, -4, -315]}
      />

      {/* ------------------------------------------------------------- */}
      {/* 2. LIVING CELL MEMBRANE (Outer Boundary)                      */}
      {/* ------------------------------------------------------------- */}
      <CellMembrane />

      {/* ------------------------------------------------------------- */}
      {/* 3. ENDOPLASMIC RETICULUM (Entry Transport Highway)            */}
      {/* ------------------------------------------------------------- */}
      <EndoplasmicReticulum />

      {/* ------------------------------------------------------------- */}
      {/* 4. MITOCHONDRIA ENERGY FACTORIES                              */}
      {/* ------------------------------------------------------------- */}
      <Mitochondria />

      {/* ------------------------------------------------------------- */}
      {/* 5. GIGANTIC NUCLEUS & DNA HELIX (Major Landmark)              */}
      {/* ------------------------------------------------------------- */}
      <Nucleus position={[6.5, 4.0, -292.0]} />

      {/* ------------------------------------------------------------- */}
      {/* 6. GOLGI APPARATUS (Cisterna Stack & Vesicles)                */}
      {/* ------------------------------------------------------------- */}
      <GolgiApparatus position={[-6.5, 3.2, -322.0]} />

      {/* ------------------------------------------------------------- */}
      {/* 7. BIOLOGICAL CURRENTS & OVERHEAD MICROTUBULE HIGHWAYS        */}
      {/* ------------------------------------------------------------- */}
      <CellularCurrents />

      {/* ------------------------------------------------------------- */}
      {/* 8. CYTOPLASMIC FLUID PARTICLES                                */}
      {/* ------------------------------------------------------------- */}
      <BiologicalParticles />
    </group>
  );
}
