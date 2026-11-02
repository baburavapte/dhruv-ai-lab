"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Castle() {
  const flame1Ref = useRef<THREE.Mesh>(null);
  const flame2Ref = useRef<THREE.Mesh>(null);
  const flame3Ref = useRef<THREE.Mesh>(null);
  const flame4Ref = useRef<THREE.Mesh>(null);
  const gateFlameLRef = useRef<THREE.Mesh>(null);
  const gateFlameRRef = useRef<THREE.Mesh>(null);
  const runeGlowRef = useRef<THREE.MeshBasicMaterial>(null);
  const lavaCrackRef = useRef<THREE.MeshBasicMaterial>(null);

  // Dynamic fire flicker and glowing lava fissure pulse
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    const flameScale = (offset: number) => {
      return 1 + Math.sin(t * 11 + offset) * 0.16 + Math.cos(t * 18 + offset * 1.8) * 0.08;
    };

    if (flame1Ref.current) {
      const s = flameScale(0);
      flame1Ref.current.scale.set(s, s * 1.35, s);
    }
    if (flame2Ref.current) {
      const s = flameScale(1.5);
      flame2Ref.current.scale.set(s, s * 1.35, s);
    }
    if (flame3Ref.current) {
      const s = flameScale(2.8);
      flame3Ref.current.scale.set(s, s * 1.35, s);
    }
    if (flame4Ref.current) {
      const s = flameScale(4.1);
      flame4Ref.current.scale.set(s, s * 1.35, s);
    }
    if (gateFlameLRef.current) {
      const s = flameScale(5.3);
      gateFlameLRef.current.scale.set(s * 1.3, s * 1.5, s * 1.3);
    }
    if (gateFlameRRef.current) {
      const s = flameScale(3.7);
      gateFlameRRef.current.scale.set(s * 1.3, s * 1.5, s * 1.3);
    }

    if (runeGlowRef.current) {
      runeGlowRef.current.opacity = 0.75 + Math.sin(t * 3.5) * 0.22;
    }
    if (lavaCrackRef.current) {
      lavaCrackRef.current.opacity = 0.65 + Math.sin(t * 2.8) * 0.25;
    }
  });

  // Reusable stylized dark fantasy materials with rich stone and volcanic tones
  const materials = useMemo(() => {
    return {
      // Main ancient volcanic dark stone masonry (visible dark charcoal basalt)
      darkStone: new THREE.MeshStandardMaterial({
        color: "#35313d",
        roughness: 0.74,
        metalness: 0.16,
      }),
      // Secondary lighter slate stone for trims, cornices, battlements, spires
      stoneAccent: new THREE.MeshStandardMaterial({
        color: "#4e4858",
        roughness: 0.68,
        metalness: 0.18,
      }),
      // High-relief edge highlights, moldings, corbels
      stoneHighlight: new THREE.MeshStandardMaterial({
        color: "#6b6477",
        roughness: 0.60,
        metalness: 0.20,
      }),
      // Volcanic bridge basalt deck (dark wet surface with specular sheen to catch lava reflections)
      bridgeStone: new THREE.MeshStandardMaterial({
        color: "#2c2834",
        roughness: 0.42,
        metalness: 0.32,
      }),
      // Bridge curb border
      curbStone: new THREE.MeshStandardMaterial({
        color: "#484252",
        roughness: 0.62,
        metalness: 0.18,
      }),
      // Wrought dark iron for grilles, braziers, portcullis
      ironMetal: new THREE.MeshStandardMaterial({
        color: "#26242c",
        roughness: 0.44,
        metalness: 0.85,
      }),
      // Ancient royal crimson heraldic banners
      crimsonCloth: new THREE.MeshStandardMaterial({
        color: "#88162b",
        roughness: 0.80,
        metalness: 0.10,
      }),
      // Aged bronze and gold accents
      goldTrim: new THREE.MeshStandardMaterial({
        color: "#b4893c",
        roughness: 0.35,
        metalness: 0.78,
      }),
      // Dark basalt flagstone seam (prevents white specular lines on the bridge)
      bridgeJoint: new THREE.MeshStandardMaterial({
        color: "#221e2c",
        roughness: 0.85,
        metalness: 0.08,
      }),
      fireFlame: new THREE.MeshBasicMaterial({
        color: "#FF5A0A",
      }),
      fireCore: new THREE.MeshBasicMaterial({
        color: "#FFB52E",
      }),
    };
  }, []);

  return (
    <group>
      {/* ------------------------------------------------------------- */}
      {/* 1. ANCIENT VOLCANIC STONE BRIDGE (Spanning across lava sea)   */}
      {/* ------------------------------------------------------------- */}
      {/* Main Bridge Arch Deck (Z: 18 to -33) */}
      <mesh
        position={[0, 0.35, -7.5]}
        receiveShadow
        castShadow
        material={materials.bridgeStone}
      >
        <boxGeometry args={[12.0, 0.7, 52]} />
      </mesh>

      {/* Massive Bridge Support Arches Plunging into Lava Lake */}
      {[-20, -6, 8].map((archZ, i) => (
        <group key={`bridge-arch-${i}`} position={[0, -4.5, archZ]}>
          <mesh castShadow receiveShadow material={materials.darkStone}>
            <cylinderGeometry args={[5.2, 5.8, 9, 12]} />
          </mesh>
          <mesh position={[0, -3.5, 0]} material={materials.stoneAccent}>
            <boxGeometry args={[12.8, 2.0, 4.5]} />
          </mesh>
        </group>
      ))}

      {/* Bridge Parapet Side Railings with Crenellations */}
      <group position={[-6.3, 0.9, -7.5]}>
        <mesh castShadow receiveShadow material={materials.curbStone}>
          <boxGeometry args={[0.7, 0.8, 52]} />
        </mesh>
        {/* Railing battlements along the bridge */}
        {[-22, -18, -14, -10, -6, -2, 2, 6, 10, 14].map((zPos, i) => (
          <mesh key={`parapet-l-${i}`} position={[0, 0.65, zPos]} castShadow material={materials.stoneHighlight}>
            <boxGeometry args={[0.75, 0.5, 1.8]} />
          </mesh>
        ))}
      </group>
      <group position={[6.3, 0.9, -7.5]}>
        <mesh castShadow receiveShadow material={materials.curbStone}>
          <boxGeometry args={[0.7, 0.8, 52]} />
        </mesh>
        {[-22, -18, -14, -10, -6, -2, 2, 6, 10, 14].map((zPos, i) => (
          <mesh key={`parapet-r-${i}`} position={[0, 0.65, zPos]} castShadow material={materials.stoneHighlight}>
            <boxGeometry args={[0.75, 0.5, 1.8]} />
          </mesh>
        ))}
      </group>

      {/* Patterned Wet Basalt Flagstones along the Avenue */}
      {[-2, -6, -10, -14, -18, -22, -26, -30, 2, 6, 10, 14].map((zPos, i) => (
        <group key={`bridge-slab-${i}`} position={[0, 0.72, zPos]}>
          {/* Main center slab */}
          <mesh receiveShadow material={materials.bridgeStone}>
            <boxGeometry args={[6.2, 0.08, 3.4]} />
          </mesh>
          {/* Beveled slab joint (dark basalt, no white specular blowout) */}
          <mesh position={[0, 0.05, 0]} material={materials.bridgeJoint}>
            <boxGeometry args={[5.8, 0.03, 0.12]} />
          </mesh>
          {/* Flanking stone side plates */}
          <mesh position={[-4.2, 0, 0]} receiveShadow material={materials.darkStone}>
            <boxGeometry args={[2.2, 0.07, 3.4]} />
          </mesh>
          <mesh position={[4.2, 0, 0]} receiveShadow material={materials.darkStone}>
            <boxGeometry args={[2.2, 0.07, 3.4]} />
          </mesh>

          {/* Glowing volcanic magma fissures through occasional stone cracks */}
          {i % 3 === 0 && (
            <mesh
              position={[((i % 2) - 0.5) * 2.8, 0.06, 0.6]}
              rotation={[0, 0.2 * i, 0]}
            >
              <boxGeometry args={[2.4, 0.02, 0.15]} />
              <meshBasicMaterial
                ref={lavaCrackRef}
                attach="material"
                color="#FF5A0A"
                toneMapped={false}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 2. COLOSSAL AVENUE PILLARS WITH FIRE BRAZIERS                */}
      {/* ------------------------------------------------------------- */}
      {[
        { z: 2, fRefL: flame1Ref, fRefR: flame2Ref },
        { z: -14, fRefL: flame3Ref, fRefR: flame4Ref },
      ].map((p, idx) => (
        <group key={`pillar-pair-${idx}`}>
          {/* Left Monumental Colonnade Pillar */}
          <group position={[-5.8, 0, p.z]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={materials.stoneAccent}>
              <boxGeometry args={[2.4, 1.0, 2.4]} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
              <cylinderGeometry args={[1.2, 1.4, 0.4, 12]} />
            </mesh>
            <mesh position={[0, 4.6, 0]} castShadow receiveShadow material={materials.darkStone}>
              <cylinderGeometry args={[0.85, 1.0, 6.4, 12]} />
            </mesh>
            <mesh position={[0, 4.7, 0]} material={materials.goldTrim}>
              <torusGeometry args={[1.05, 0.1, 8, 16]} />
            </mesh>
            <mesh position={[0, 8.2, 0]} castShadow receiveShadow material={materials.stoneAccent}>
              <cylinderGeometry args={[1.4, 0.95, 0.8, 12]} />
            </mesh>
            <mesh position={[0, 8.8, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
              <boxGeometry args={[2.4, 0.4, 2.4]} />
            </mesh>
            {/* Wrought Iron Torch Bracket & Brazier */}
            <mesh position={[0.95, 5.2, 0]} castShadow material={materials.ironMetal}>
              <boxGeometry args={[1.1, 0.22, 0.22]} />
            </mesh>
            <mesh position={[1.5, 5.4, 0]} castShadow material={materials.ironMetal}>
              <cylinderGeometry args={[0.6, 0.3, 0.55, 10]} />
            </mesh>
            <group position={[1.5, 5.85, 0]}>
              <mesh ref={p.fRefL} material={materials.fireFlame}>
                <coneGeometry args={[0.42, 1.0, 8]} />
              </mesh>
              <mesh position={[0, -0.05, 0]} material={materials.fireCore} scale={[0.55, 0.55, 0.55]}>
                <sphereGeometry args={[0.26, 8, 8]} />
              </mesh>
            </group>
          </group>

          {/* Right Monumental Colonnade Pillar */}
          <group position={[5.8, 0, p.z]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={materials.stoneAccent}>
              <boxGeometry args={[2.4, 1.0, 2.4]} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
              <cylinderGeometry args={[1.2, 1.4, 0.4, 12]} />
            </mesh>
            <mesh position={[0, 4.6, 0]} castShadow receiveShadow material={materials.darkStone}>
              <cylinderGeometry args={[0.85, 1.0, 6.4, 12]} />
            </mesh>
            <mesh position={[0, 4.7, 0]} material={materials.goldTrim}>
              <torusGeometry args={[1.05, 0.1, 8, 16]} />
            </mesh>
            <mesh position={[0, 8.2, 0]} castShadow receiveShadow material={materials.stoneAccent}>
              <cylinderGeometry args={[1.4, 0.95, 0.8, 12]} />
            </mesh>
            <mesh position={[0, 8.8, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
              <boxGeometry args={[2.4, 0.4, 2.4]} />
            </mesh>
            <mesh position={[-0.95, 5.2, 0]} castShadow material={materials.ironMetal}>
              <boxGeometry args={[1.1, 0.22, 0.22]} />
            </mesh>
            <mesh position={[-1.5, 5.4, 0]} castShadow material={materials.ironMetal}>
              <cylinderGeometry args={[0.6, 0.3, 0.55, 10]} />
            </mesh>
            <group position={[-1.5, 5.85, 0]}>
              <mesh ref={p.fRefR} material={materials.fireFlame}>
                <coneGeometry args={[0.42, 1.0, 8]} />
              </mesh>
              <mesh position={[0, -0.05, 0]} material={materials.fireCore} scale={[0.55, 0.55, 0.55]}>
                <sphereGeometry args={[0.26, 8, 8]} />
              </mesh>
            </group>
          </group>
        </group>
      ))}

      {/* ------------------------------------------------------------- */}
      {/* 3. COLOSSAL VOLCANIC FORTRESS GATEHOUSE & TOWERS (Z = -34)    */}
      {/* ------------------------------------------------------------- */}
      <group position={[0, 0, -34]}>
        {/* Tiered Fortress Approach Steps */}
        <mesh position={[0, 0.35, 4.2]} receiveShadow material={materials.stoneAccent}>
          <boxGeometry args={[13, 0.35, 2.6]} />
        </mesh>
        <mesh position={[0, 0.7, 2.2]} receiveShadow material={materials.stoneAccent}>
          <boxGeometry args={[12, 0.35, 2.0]} />
        </mesh>
        <mesh position={[0, 1.05, 0.8]} receiveShadow material={materials.stoneAccent}>
          <boxGeometry args={[11, 0.35, 1.8]} />
        </mesh>

        {/* --- COLOSSAL LEFT BASTION TOWER (Height: 38 units) --- */}
        <group position={[-14.5, 0, 0]}>
          {/* Sloped battered fortress tower base */}
          <mesh position={[0, 6, 0]} castShadow receiveShadow material={materials.darkStone}>
            <cylinderGeometry args={[5.2, 6.4, 12, 12]} />
          </mesh>
          <mesh position={[0, 12.5, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
            <cylinderGeometry args={[5.5, 5.2, 0.8, 12]} />
          </mesh>
          {/* Tower Middle Shaft */}
          <mesh position={[0, 18.5, 0]} castShadow receiveShadow material={materials.darkStone}>
            <cylinderGeometry args={[4.8, 5.3, 11, 12]} />
          </mesh>
          {/* Corbelled Crown Base */}
          <mesh position={[0, 24.8, 0]} castShadow receiveShadow material={materials.stoneAccent}>
            <cylinderGeometry args={[6.0, 4.8, 1.6, 12]} />
          </mesh>
          {/* Crenellated Battlements */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            return (
              <mesh
                key={`cren-left-${i}`}
                position={[Math.cos(angle) * 5.4, 26.5, Math.sin(angle) * 5.4]}
                castShadow
                material={materials.stoneAccent}
              >
                <boxGeometry args={[2.0, 1.8, 1.2]} />
              </mesh>
            );
          })}
          {/* Soaring Conical Spire Roof */}
          <mesh position={[0, 32.5, 0]} castShadow material={materials.stoneAccent}>
            <coneGeometry args={[5.5, 11, 12]} />
          </mesh>
          <mesh position={[0, 38.5, 0]} material={materials.goldTrim}>
            <sphereGeometry args={[0.55, 8, 8]} />
          </mesh>

          {/* Wall Brazier facing courtyard */}
          <mesh position={[4.4, 9.5, 4.2]} castShadow material={materials.ironMetal}>
            <cylinderGeometry args={[0.85, 0.45, 0.7, 10]} />
          </mesh>
          <mesh ref={gateFlameLRef} position={[4.4, 10.2, 4.2]} material={materials.fireFlame}>
            <coneGeometry args={[0.6, 1.2, 8]} />
          </mesh>
        </group>

        {/* --- COLOSSAL RIGHT BASTION TOWER (Height: 38 units) --- */}
        <group position={[14.5, 0, 0]}>
          <mesh position={[0, 6, 0]} castShadow receiveShadow material={materials.darkStone}>
            <cylinderGeometry args={[5.2, 6.4, 12, 12]} />
          </mesh>
          <mesh position={[0, 12.5, 0]} castShadow receiveShadow material={materials.stoneHighlight}>
            <cylinderGeometry args={[5.5, 5.2, 0.8, 12]} />
          </mesh>
          <mesh position={[0, 18.5, 0]} castShadow receiveShadow material={materials.darkStone}>
            <cylinderGeometry args={[4.8, 5.3, 11, 12]} />
          </mesh>
          <mesh position={[0, 24.8, 0]} castShadow receiveShadow material={materials.stoneAccent}>
            <cylinderGeometry args={[6.0, 4.8, 1.6, 12]} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            return (
              <mesh
                key={`cren-right-${i}`}
                position={[Math.cos(angle) * 5.4, 26.5, Math.sin(angle) * 5.4]}
                castShadow
                material={materials.stoneAccent}
              >
                <boxGeometry args={[2.0, 1.8, 1.2]} />
              </mesh>
            );
          })}
          <mesh position={[0, 32.5, 0]} castShadow material={materials.stoneAccent}>
            <coneGeometry args={[5.5, 11, 12]} />
          </mesh>
          <mesh position={[0, 38.5, 0]} material={materials.goldTrim}>
            <sphereGeometry args={[0.55, 8, 8]} />
          </mesh>

          <mesh position={[-4.4, 9.5, 4.2]} castShadow material={materials.ironMetal}>
            <cylinderGeometry args={[0.85, 0.45, 0.7, 10]} />
          </mesh>
          <mesh ref={gateFlameRRef} position={[-4.4, 10.2, 4.2]} material={materials.fireFlame}>
            <coneGeometry args={[0.6, 1.2, 8]} />
          </mesh>
        </group>

        {/* --- DEEP VOLCANIC BACKGROUND SPIRES & MOUNTAIN NEEDLES (Z = -18 to -25 relative) --- */}
        <group position={[-28, 22, -18]}>
          <mesh castShadow material={materials.darkStone}>
            <coneGeometry args={[8, 44, 8]} />
          </mesh>
        </group>
        <group position={[28, 22, -18]}>
          <mesh castShadow material={materials.darkStone}>
            <coneGeometry args={[8, 44, 8]} />
          </mesh>
        </group>
        <group position={[0, 28, -25]}>
          <mesh castShadow material={materials.darkStone}>
            <coneGeometry args={[11, 56, 8]} />
          </mesh>
        </group>

        {/* Massive Fortress Curtain Walls extending into volcanic cliffs */}
        <group position={[-38, 11, 0]}>
          <mesh castShadow receiveShadow material={materials.darkStone}>
            <boxGeometry args={[42, 22, 6]} />
          </mesh>
          {[-14, 0, 14].map((bx, i) => (
            <mesh key={`buttress-l-${i}`} position={[bx, -1, 3.8]} castShadow material={materials.stoneAccent}>
              <boxGeometry args={[2.8, 20, 2.4]} />
            </mesh>
          ))}
        </group>
        <group position={[38, 11, 0]}>
          <mesh castShadow receiveShadow material={materials.darkStone}>
            <boxGeometry args={[42, 22, 6]} />
          </mesh>
          {[-14, 0, 14].map((bx, i) => (
            <mesh key={`buttress-r-${i}`} position={[bx, -1, 3.8]} castShadow material={materials.stoneAccent}>
              <boxGeometry args={[2.8, 20, 2.4]} />
            </mesh>
          ))}
        </group>

        {/* --- CENTRAL GATEHOUSE STRUCTURE --- */}
        <mesh position={[-6.8, 7.5, 0.5]} castShadow receiveShadow material={materials.darkStone}>
          <boxGeometry args={[5.4, 15, 7.5]} />
        </mesh>
        <mesh position={[6.8, 7.5, 0.5]} castShadow receiveShadow material={materials.darkStone}>
          <boxGeometry args={[5.4, 15, 7.5]} />
        </mesh>

        {/* Sculpted Stone Portal Arch */}
        <group position={[0, 10.8, 4.2]}>
          <mesh castShadow material={materials.stoneAccent}>
            <torusGeometry args={[5.5, 0.75, 8, 24, Math.PI]} />
          </mesh>
          <mesh position={[0, 0, 0.2]} castShadow material={materials.stoneHighlight}>
            <torusGeometry args={[6.2, 0.35, 8, 24, Math.PI]} />
          </mesh>
          <mesh position={[0, 6.0, 0.3]} castShadow material={materials.stoneHighlight}>
            <boxGeometry args={[1.8, 2.0, 1.0]} />
          </mesh>
        </group>

        {/* Massive Archway Lintel & Gate Header */}
        <mesh position={[0, 16.0, 0.5]} castShadow receiveShadow material={materials.stoneAccent}>
          <boxGeometry args={[18.5, 4.6, 8.0]} />
        </mesh>
        {/* Upper Parapet & Crest Wall */}
        <mesh position={[0, 21.5, 0.5]} castShadow receiveShadow material={materials.darkStone}>
          <boxGeometry args={[18.0, 6.5, 7.2]} />
        </mesh>
        {/* Parapet Crenellations */}
        {[-7.2, -3.6, 0, 3.6, 7.2].map((x, i) => (
          <mesh
            key={`parapet-${i}`}
            position={[x, 25.5, 4.0]}
            castShadow
            material={materials.stoneAccent}
          >
            <boxGeometry args={[2.2, 1.8, 1.2]} />
          </mesh>
        ))}

        {/* Glowing Ancient Crimson/Ember Medallion Seal */}
        <group position={[0, 19.0, 4.4]}>
          <mesh material={materials.goldTrim}>
            <torusGeometry args={[1.6, 0.24, 10, 24]} />
          </mesh>
          <mesh>
            <circleGeometry args={[1.45, 24]} />
            <meshBasicMaterial
              ref={runeGlowRef}
              color="#ea2818"
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>

        {/* Royal Crimson Fortress Banners */}
        <group position={[-6.0, 12.5, 4.4]} rotation={[0, 0.08, -0.02]}>
          <mesh castShadow material={materials.crimsonCloth}>
            <boxGeometry args={[2.0, 8.2, 0.08]} />
          </mesh>
          <mesh position={[0, -4.1, 0]} material={materials.goldTrim}>
            <boxGeometry args={[2.1, 0.35, 0.14]} />
          </mesh>
        </group>
        <group position={[6.0, 12.5, 4.4]} rotation={[0, -0.08, 0.02]}>
          <mesh castShadow material={materials.crimsonCloth}>
            <boxGeometry args={[2.0, 8.2, 0.08]} />
          </mesh>
          <mesh position={[0, -4.1, 0]} material={materials.goldTrim}>
            <boxGeometry args={[2.1, 0.35, 0.14]} />
          </mesh>
        </group>

        {/* Gatehouse Archway open into the Dragon Throat Tunnel */}
      </group>
    </group>
  );
}
