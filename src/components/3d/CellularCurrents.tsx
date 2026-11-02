"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CURRENT_MATERIALS = {
  microtubuleTrack: new THREE.MeshBasicMaterial({
    color: "#00e5ff",
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  }),
  motorProteinVesicle: new THREE.MeshStandardMaterial({
    color: "#ff4081",
    roughness: 0.25,
    metalness: 0.8,
    emissive: "#e91e63",
    emissiveIntensity: 0.85,
  }),
  currentParticle: new THREE.MeshBasicMaterial({
    color: "#69f0ae",
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  }),
};

// Scratch vector for zero-allocation animation updates
const _tempVec = new THREE.Vector3();

/**
 * CellularCurrents — Directed Biological Transport Streams & Overhead Microtubule Highways
 *
 * Positioned overhead (Y = 9.0 to 14.0) and in lower cytoplasmic strata (Y = -4.0 to -7.0)
 * to frame the camera traversal with majestic living transport currents.
 */
export default function CellularCurrents() {
  const tracksGroupRef = useRef<THREE.Group>(null);
  const motorPacketsRef = useRef<THREE.Group>(null);

  const materials = CURRENT_MATERIALS;

  // Pre-generate 4 major overhead & lateral microtubule highway curves
  const microtubuleTracks = useMemo(() => {
    const tracks: {
      points: THREE.Vector3[];
      curve: THREE.CatmullRomCurve3;
    }[] = [];

    // Track 1: High Overhead Cytoplasmic Stream (Arching from ER to Nucleus)
    const curve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12, 10.0, -236),
      new THREE.Vector3(-6, 12.5, -260),
      new THREE.Vector3(2, 13.0, -282),
      new THREE.Vector3(10, 11.5, -305),
      new THREE.Vector3(4, 9.5, -330),
    ]);

    // Track 2: Left Flank High Translocation Channel
    const curve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-16, 8.5, -245),
      new THREE.Vector3(-14, 11.0, -275),
      new THREE.Vector3(-8, 9.8, -308),
      new THREE.Vector3(-12, 8.2, -338),
    ]);

    // Track 3: Deep Lower Cytoplasmic River (Underneath traversal path)
    const curve3 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(8, -4.5, -242),
      new THREE.Vector3(0, -6.0, -270),
      new THREE.Vector3(-6, -5.5, -300),
      new THREE.Vector3(-10, -4.8, -332),
    ]);

    // Track 4: Right Lateral Boundary Conveyor
    const curve4 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(14, 2.0, -250),
      new THREE.Vector3(16, 7.5, -285),
      new THREE.Vector3(12, 5.0, -320),
      new THREE.Vector3(4, 2.5, -350),
    ]);

    [curve1, curve2, curve3, curve4].forEach((c) => {
      tracks.push({
        curve: c,
        points: c.getPoints(36),
      });
    });

    return tracks;
  }, []);

  // Pre-generate motor transport packets along the tracks
  const motorPackets = useMemo(() => {
    const packets: { trackIdx: number; baseOffset: number; speed: number }[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      packets.push({
        trackIdx: i % 4,
        baseOffset: i / count,
        speed: 0.035 + (i % 3) * 0.015,
      });
    }
    return packets;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (motorPacketsRef.current) {
      motorPacketsRef.current.children.forEach((child, idx) => {
        const p = motorPackets[idx];
        if (p) {
          const track = microtubuleTracks[p.trackIdx];
          if (track) {
            const u = (t * p.speed + p.baseOffset) % 1.0;
            track.curve.getPointAt(u, _tempVec);
            child.position.copy(_tempVec);
          }
        }
      });
    }
  });

  return (
    <group name="cellular-currents-system">
      {/* 1. Graceful Overhead & Lower Microtubule Filaments */}
      <group ref={tracksGroupRef}>
        {microtubuleTracks.map((track, idx) => (
          <mesh key={`track-${idx}`} material={materials.microtubuleTrack}>
            <tubeGeometry args={[track.curve, 48, 0.05, 6, false]} />
          </mesh>
        ))}
      </group>

      {/* 2. Active Motor-Protein Transport Packets Moving along Tracks */}
      <group ref={motorPacketsRef}>
        {motorPackets.map((_, idx) => (
          <group key={`motor-pkt-${idx}`}>
            <mesh material={materials.motorProteinVesicle}>
              <sphereGeometry args={[0.34, 10, 10]} />
            </mesh>
            <mesh material={materials.currentParticle}>
              <sphereGeometry args={[0.16, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
