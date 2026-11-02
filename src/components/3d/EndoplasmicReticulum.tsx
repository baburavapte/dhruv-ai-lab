"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ER_MATERIALS = {
  tubularMembrane: new THREE.MeshStandardMaterial({
    color: "#004d61",
    emissive: "#00838f",
    emissiveIntensity: 0.7,
    roughness: 0.25,
    metalness: 0.7,
    transparent: true,
    opacity: 0.78,
  }),
  cisternalSheet: new THREE.MeshStandardMaterial({
    color: "#0d47a1",
    emissive: "#1976d2",
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.65,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  }),
  ribosomeGranule: new THREE.MeshStandardMaterial({
    color: "#ff4081",
    roughness: 0.2,
    metalness: 0.8,
    emissive: "#e91e63",
    emissiveIntensity: 0.85,
  }),
  lumenCore: new THREE.MeshBasicMaterial({
    color: "#64ffda",
    toneMapped: false,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  }),
};

/**
 * EndoplasmicReticulum — Organic Biological Transport Network
 *
 * Implements smooth undulating tubular conduits and rough ER sheets
 * flanking the camera corridor (X: -16 to -8 and X: +8 to +16, Z: -240 to -275).
 * Features instanced ribosome complexes and luminescent transport cores.
 */
export default function EndoplasmicReticulum() {
  const groupRef = useRef<THREE.Group>(null);
  const ribosomeInstancedRef = useRef<THREE.InstancedMesh>(null);

  const materials = ER_MATERIALS;

  // Pre-generate smooth undulating tubular curves for left and right networks
  const erCurves = useMemo(() => {
    const list: {
      curve: THREE.CatmullRomCurve3;
      radius: number;
    }[] = [
      // Left Branch 1: Upper undulation
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-10, 4.5, -240),
          new THREE.Vector3(-13, 6.2, -250),
          new THREE.Vector3(-9, 5.8, -262),
          new THREE.Vector3(-12, 4.2, -274),
        ]),
        radius: 0.9,
      },
      // Left Branch 2: Mid-level lateral loop
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-14, 2.8, -244),
          new THREE.Vector3(-11, 3.5, -256),
          new THREE.Vector3(-15, 2.2, -266),
          new THREE.Vector3(-10, 3.0, -276),
        ]),
        radius: 0.85,
      },
      // Right Branch 1: Upper conduit
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(11, 5.0, -242),
          new THREE.Vector3(14, 3.2, -252),
          new THREE.Vector3(10, 6.0, -264),
          new THREE.Vector3(13, 4.5, -275),
        ]),
        radius: 0.9,
      },
      // Right Branch 2: Lower looping pathway
      {
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(13, 2.0, -245),
          new THREE.Vector3(9.5, 1.5, -258),
          new THREE.Vector3(14.5, 2.8, -268),
          new THREE.Vector3(11, 2.0, -276),
        ]),
        radius: 0.85,
      },
    ];
    return list;
  }, []);

  // Pre-generate 160 ribosome transforms attached along the tubules
  const ribosomeTransforms = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const count = 160;
    const dummy = new THREE.Object3D();
    const tempVec = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const curveIdx = i % erCurves.length;
      const c = erCurves[curveIdx];
      const u = (Math.floor(i / erCurves.length) / (count / erCurves.length));
      c.curve.getPointAt(u, tempVec);

      const angle = (i * 2.3);
      const r = c.radius + 0.15;
      const x = tempVec.x + Math.cos(angle) * r;
      const y = tempVec.y + Math.sin(angle) * r;
      const z = tempVec.z;

      dummy.position.set(x, y, z);
      const s = 0.22 + (i % 3) * 0.04;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, [erCurves]);

  useEffect(() => {
    if (!ribosomeInstancedRef.current) return;
    const mesh = ribosomeInstancedRef.current;
    ribosomeTransforms.forEach((mat, idx) => {
      mesh.setMatrixAt(idx, mat);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [ribosomeTransforms]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.12;
    }
    materials.lumenCore.opacity = 0.65 + Math.sin(t * 2.0) * 0.2;
  });

  return (
    <group ref={groupRef} name="endoplasmic-reticulum-network">
      {/* 1. Smooth Undulating Tubular Conduits & Luminal Cores */}
      {erCurves.map((c, idx) => (
        <group key={`er-tube-${idx}`}>
          {/* Outer Translucent Membrane Tubule */}
          <mesh material={materials.tubularMembrane}>
            <tubeGeometry args={[c.curve, 40, c.radius, 14, false]} />
          </mesh>
          {/* Internal Luminal Fluorescent Current */}
          <mesh material={materials.lumenCore}>
            <tubeGeometry args={[c.curve, 32, c.radius * 0.35, 8, false]} />
          </mesh>
        </group>
      ))}

      {/* 2. Instanced Ribosome Granules (Single Draw Call for 160 Ribosomes) */}
      <instancedMesh
        ref={ribosomeInstancedRef}
        args={[undefined, undefined, ribosomeTransforms.length]}
        material={materials.ribosomeGranule}
      >
        <sphereGeometry args={[1, 10, 10]} />
      </instancedMesh>
    </group>
  );
}
