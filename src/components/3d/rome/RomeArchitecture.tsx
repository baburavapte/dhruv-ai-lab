"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Fluted Corinthian Column
 * Accurate classical profile: torus plinth, fluted shaft, and acanthus leaf capital
 */
function CorinthianColumn({
  position,
  height = 12.0,
  radius = 0.65,
  color = "#ece4d8",
}: {
  position: [number, number, number];
  height?: number;
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      {/* Square Plinth Base */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[radius * 2.8, 0.44, radius * 2.8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Attic Base Moldings (Torus - Trochilus - Torus) */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[radius * 1.25, radius * 1.35, 0.3, 16]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>

      {/* Fluted Column Shaft */}
      <mesh position={[0, height / 2 + 0.6, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 1.05, height, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>

      {/* Ornate Corinthian Capital (Acanthus Leaves & Volutes) */}
      <group position={[0, height + 0.6 + 0.6, 0]}>
        {/* Lower bell basket */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[radius * 1.4, radius * 0.95, 1.2, 16]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
        {/* Acanthus leaf crest rings */}
        <mesh position={[0, 0.1, 0]}>
          <torusGeometry args={[radius * 1.2, radius * 0.22, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        {/* Abacus square top plate with concave molded edges */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[radius * 2.6, 0.25, radius * 2.6]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * The Curving Colosseum (Flavian Amphitheatre)
 * Iconic multi-tiered travertine arcade rising proudly on the right
 */
function RomanColosseum({
  position = [54, 0, -1990],
}: {
  position?: [number, number, number];
}) {
  const radius = 42;
  const numBays = 22; // Visible curving arc facing the avenue

  const bays = useMemo(() => {
    const list = [];
    const startAng = Math.PI * 0.65;
    const endAng = Math.PI * 1.45;
    const step = (endAng - startAng) / (numBays - 1);
    for (let i = 0; i < numBays; i++) {
      const ang = startAng + i * step;
      list.push({
        x: Math.cos(ang) * radius,
        z: Math.sin(ang) * radius,
        rot: -ang + Math.PI / 2,
      });
    }
    return list;
  }, [radius, numBays]);

  return (
    <group position={position}>
      {/* Colosseum Travertine Arcade Bays */}
      {bays.map((b, idx) => (
        <group key={`bay-${idx}`} position={[b.x, 0, b.z]} rotation={[0, b.rot, 0]}>
          {/* --- Tier 1: Doric Arches (Height: 0 to 9m) --- */}
          {/* Left Pier */}
          <mesh position={[-2.4, 4.5, 0]}>
            <boxGeometry args={[1.2, 9.0, 3.2]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          {/* Right Pier */}
          <mesh position={[2.4, 4.5, 0]}>
            <boxGeometry args={[1.2, 9.0, 3.2]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          {/* Arch Spring & Keystone */}
          <mesh position={[0, 7.8, 0]}>
            <boxGeometry args={[3.8, 2.4, 3.0]} />
            <meshStandardMaterial color="#d4c5b3" roughness={0.72} />
          </mesh>
          {/* Tier 1 Entablature Cornice */}
          <mesh position={[0, 9.3, 0.2]}>
            <boxGeometry args={[6.2, 0.7, 3.8]} />
            <meshStandardMaterial color="#e5dad0" roughness={0.65} />
          </mesh>

          {/* --- Tier 2: Ionic Arches with Statues (Height: 9.6 to 18m) --- */}
          <mesh position={[-2.3, 13.8, 0]}>
            <boxGeometry args={[1.1, 8.2, 3.0]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          <mesh position={[2.3, 13.8, 0]}>
            <boxGeometry args={[1.1, 8.2, 3.0]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          <mesh position={[0, 16.8, 0]}>
            <boxGeometry args={[3.6, 2.2, 2.8]} />
            <meshStandardMaterial color="#d4c5b3" roughness={0.72} />
          </mesh>
          {/* Statue inside Tier 2 Arch */}
          {idx % 2 === 0 && (
            <mesh position={[0, 11.2, 0]}>
              <cylinderGeometry args={[0.3, 0.35, 2.2, 8]} />
              <meshStandardMaterial color="#f0e9df" roughness={0.55} />
            </mesh>
          )}
          {/* Tier 2 Entablature Cornice */}
          <mesh position={[0, 18.2, 0.2]}>
            <boxGeometry args={[6.0, 0.65, 3.6]} />
            <meshStandardMaterial color="#e5dad0" roughness={0.65} />
          </mesh>

          {/* --- Tier 3: Corinthian Arches (Height: 18.5 to 26.5m) --- */}
          <mesh position={[-2.2, 22.5, 0]}>
            <boxGeometry args={[1.0, 8.0, 2.8]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          <mesh position={[2.2, 22.5, 0]}>
            <boxGeometry args={[1.0, 8.0, 2.8]} />
            <meshStandardMaterial color="#ded2c3" roughness={0.7} />
          </mesh>
          <mesh position={[0, 25.2, 0]}>
            <boxGeometry args={[3.5, 2.0, 2.6]} />
            <meshStandardMaterial color="#d4c5b3" roughness={0.72} />
          </mesh>
          {/* Tier 3 Entablature Cornice */}
          <mesh position={[0, 26.8, 0.2]}>
            <boxGeometry args={[5.8, 0.6, 3.4]} />
            <meshStandardMaterial color="#e5dad0" roughness={0.65} />
          </mesh>

          {/* --- Tier 4: Attic Wall with Pilasters (Height: 27 to 35m) --- */}
          <mesh position={[0, 31.0, 0]}>
            <boxGeometry args={[5.8, 7.8, 2.6]} />
            <meshStandardMaterial color="#d9ccbc" roughness={0.72} />
          </mesh>
          {/* Decorative Corinthian Pilasters */}
          <mesh position={[-2.2, 31.0, 1.35]}>
            <boxGeometry args={[0.55, 7.8, 0.2]} />
            <meshStandardMaterial color="#ece3d7" roughness={0.65} />
          </mesh>
          <mesh position={[2.2, 31.0, 1.35]}>
            <boxGeometry args={[0.55, 7.8, 0.2]} />
            <meshStandardMaterial color="#ece3d7" roughness={0.65} />
          </mesh>
          {/* Bronze Shield / Relief Medallion in Attic Center */}
          <mesh position={[0, 31.2, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.75, 0.75, 0.1, 16]} />
            <meshStandardMaterial color="#c59b27" metalness={0.75} roughness={0.35} />
          </mesh>
          {/* Top Parapet Cornice */}
          <mesh position={[0, 35.2, 0.15]}>
            <boxGeometry args={[6.0, 0.6, 3.2]} />
            <meshStandardMaterial color="#f0e6dc" roughness={0.6} />
          </mesh>

          {/* Mast / Flagpole for Velarium Awning with Red Flag */}
          {idx % 3 === 0 && (
            <group position={[0, 35.5, 1.1]}>
              <mesh position={[0, 2.5, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 5.0, 8]} />
                <meshStandardMaterial color="#4d3522" roughness={0.9} />
              </mesh>
              <mesh position={[0.45, 4.2, 0]}>
                <planeGeometry args={[0.85, 0.55]} />
                <meshStandardMaterial color="#9c1020" side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* Internal Tiered Arena Seating (Cavea) visible behind arches */}
      <mesh position={[-6, 14, 0]}>
        <cylinderGeometry args={[radius * 0.88, radius * 0.95, 24, 24, 1, true, Math.PI * 0.7, Math.PI * 0.7]} />
        <meshStandardMaterial color="#bdae9c" roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * Double-Tiered Roman Aqueduct
 * Striding majestically across the distant hillside
 */
function RomanAqueduct({
  position = [-110, 6, -2140],
  rotation = [0, 0.42, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const numArches = 14;
  const span = 12.0;

  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: numArches }).map((_, idx) => {
        const x = (idx - numArches / 2) * span;
        const groundY = Math.sin(idx * 0.4) * 2.5; // following rolling terrain
        const totalHeight = 28 - groundY;

        return (
          <group key={`aqueduct-arch-${idx}`} position={[x, groundY, 0]}>
            {/* Massive Stone Lower Pier */}
            <mesh position={[-span / 2, totalHeight * 0.32, 0]}>
              <boxGeometry args={[2.8, totalHeight * 0.64, 4.2]} />
              <meshStandardMaterial color="#d4c6b2" roughness={0.78} />
            </mesh>

            {/* Lower Semi-Circular Arch Span */}
            <mesh position={[0, totalHeight * 0.58, 0]}>
              <boxGeometry args={[span - 2.8, 2.2, 4.0]} />
              <meshStandardMaterial color="#cabbab" roughness={0.8} />
            </mesh>

            {/* Intermediate Travertine Stringcourse Band */}
            <mesh position={[0, totalHeight * 0.68, 0]}>
              <boxGeometry args={[span, 0.8, 4.4]} />
              <meshStandardMaterial color="#e0d4c3" roughness={0.72} />
            </mesh>

            {/* Upper Tier Rhythmic Double Arches */}
            {[-span / 4, span / 4].map((ux, uidx) => (
              <group key={`upper-${uidx}`} position={[ux, totalHeight * 0.74, 0]}>
                <mesh position={[-span / 4 + 0.6, totalHeight * 0.1, 0]}>
                  <boxGeometry args={[1.4, totalHeight * 0.2, 3.2]} />
                  <meshStandardMaterial color="#ded2c2" roughness={0.75} />
                </mesh>
                <mesh position={[0, totalHeight * 0.18, 0]}>
                  <boxGeometry args={[span / 2 - 1.4, 1.2, 3.0]} />
                  <meshStandardMaterial color="#d5c8b7" roughness={0.75} />
                </mesh>
              </group>
            ))}

            {/* Enclosed Water Channel (Specus) on Top */}
            <mesh position={[0, totalHeight + 0.6, 0]}>
              <boxGeometry args={[span, 1.5, 3.4]} />
              <meshStandardMaterial color="#cfc0ad" roughness={0.8} />
            </mesh>
            {/* Specus Covering Capstone */}
            <mesh position={[0, totalHeight + 1.5, 0]}>
              <boxGeometry args={[span, 0.4, 3.8]} />
              <meshStandardMaterial color="#dfd3c4" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Grand Capitoline Temple of Jupiter Optimus Maximus
 * Raised upon a monumental solid podium with a continuous, structurally connected
 * Roman grand staircase descending directly to the cobblestone street (Y = 0).
 * Features a grand open monumental portal leading into a real 3D interior sanctuary chamber.
 */
function GrandCapitolineTemple() {
  const columnSpacing = 6.0;
  const numColumns = 8; // Octastyle facade

  // Generate 55 overlapping solid marble steps
  // From bottom step at Z = -2070 (Y = 0) to top landing at Z = -2180 (Y = 22.0)
  const steps = useMemo(() => {
    const list = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1);
      const z = -2070 - u * 110; // Z from -2070 to -2180
      const y = u * 22.0; // Y top from 0.28 to 22.28
      list.push({ z, y, u });
    }
    return list;
  }, []);

  const pedimentShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-26, 0);
    s.lineTo(26, 0);
    s.lineTo(0, 8.8);
    s.closePath();
    return s;
  }, []);

  return (
    <group name="grand-capitoline-temple">
      {/* =========================================================================
          1. SOLID CONTINUOUS FOUNDATION & STAIRCASE (Z: -2070 to -2180)
          ========================================================================= */}

      {/* Massive Solid Ashlar Stone Foundation Wedge beneath entire staircase (ZERO gaps) */}
      {/* Wedged stepped foundation blocks filling from Y = -1.5 up to the step incline */}
      {Array.from({ length: 22 }).map((_, bidx) => {
        const u = bidx / 21;
        const bz = -2070 - u * 110;
        const topY = u * 22.0;
        const blockH = topY + 1.5; // Extends 1.5m below ground level Y = 0
        const centerY = -1.5 + blockH / 2;
        return (
          <mesh key={`stair-fdn-${bidx}`} position={[0, centerY, bz]}>
            <boxGeometry args={[44.4, blockH, 5.8]} />
            <meshStandardMaterial color="#c2b3a0" roughness={0.88} />
          </mesh>
        );
      })}

      {/* 55 Overlapping Marble Step Treads */}
      {steps.map((st, sidx) => (
        <mesh key={`stair-step-${sidx}`} position={[0, st.y, st.z]}>
          <boxGeometry args={[44.0, 0.48, 2.4]} />
          <meshStandardMaterial color="#e2d8cb" roughness={0.68} />
        </mesh>
      ))}

      {/* Flanking Solid Retaining Walls & Balustrades (Left: X = -22.5, Right: X = +22.5) */}
      {[-22.6, 22.6].map((wx, wi) => (
        <group key={`stair-flank-${wi}`} position={[wx, 0, 0]}>
          {/* Solid Retaining Wall Segments along incline */}
          {Array.from({ length: 22 }).map((_, widx) => {
            const u = widx / 21;
            const wz = -2070 - u * 110;
            const topY = u * 22.0 + 1.25; // Parapet rises 1.25m above the step
            const wallH = topY + 1.5;
            const centerY = -1.5 + wallH / 2;
            return (
              <mesh key={`flank-w-${widx}`} position={[0, centerY, wz]}>
                <boxGeometry args={[1.6, wallH, 5.8]} />
                <meshStandardMaterial color="#cfc1b0" roughness={0.75} />
              </mesh>
            );
          })}
          {/* Molded Balustrade Coping Rail */}
          <mesh
            position={[0, 11.6, -2125]}
            rotation={[Math.atan2(22.0, 110), 0, 0]}
          >
            <boxGeometry args={[1.9, 0.35, 114]} />
            <meshStandardMaterial color="#ebe2d5" roughness={0.65} />
          </mesh>

          {/* Grand Classical Statue Pedestals at the Foot of the Stairs (Z = -2070) */}
          <group position={[0, 0, -2070]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[3.2, 3.6, 3.4]} />
              <meshStandardMaterial color="#ded2c3" roughness={0.65} />
            </mesh>
            <mesh position={[0, 3.75, 0]}>
              <boxGeometry args={[3.5, 0.3, 3.7]} />
              <meshStandardMaterial color="#ebe2d6" roughness={0.6} />
            </mesh>
            {/* Roman Hero Statue on Plinth */}
            <mesh position={[0, 5.2, 0]}>
              <cylinderGeometry args={[0.5, 0.6, 2.6, 10]} />
              <meshStandardMaterial color="#f5efe6" roughness={0.5} />
            </mesh>
            <mesh position={[0, 6.7, 0]}>
              <sphereGeometry args={[0.35, 10, 10]} />
              <meshStandardMaterial color="#f5efe6" roughness={0.5} />
            </mesh>
          </group>

          {/* Monumental Statue Pedestals at the Top Landing (Z = -2180) */}
          <group position={[0, 22.0, -2180]}>
            <mesh position={[0, 1.8, 0]}>
              <boxGeometry args={[3.2, 3.6, 3.4]} />
              <meshStandardMaterial color="#ded2c3" roughness={0.65} />
            </mesh>
            <mesh position={[0, 5.2, 0]}>
              <cylinderGeometry args={[0.5, 0.6, 2.6, 10]} />
              <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>
      ))}

      {/* =========================================================================
          2. UPPER LANDING TERRACE (PRONAOS) (Z: -2180 to -2212, Y: 22.0)
          ========================================================================= */}

      {/* Massive Solid Podium Foundation from Y = -1.5 up to Y = 22.0 */}
      <mesh position={[0, 10.25, -2196]}>
        <boxGeometry args={[52.0, 23.5, 32.0]} />
        <meshStandardMaterial color="#c5b7a5" roughness={0.85} />
      </mesh>
      {/* Polished Marble Terrace Floor */}
      <mesh position={[0, 22.1, -2196]}>
        <boxGeometry args={[52.0, 0.3, 32.0]} />
        <meshStandardMaterial color="#ebe2d7" roughness={0.55} />
      </mesh>

      {/* Front Octastyle Colonnade (8 Colossal Fluted Corinthian Columns at Z = -2188) */}
      {Array.from({ length: numColumns }).map((_, cidx) => {
        const cx = (cidx - (numColumns - 1) / 2) * columnSpacing;
        return (
          <React.Fragment key={`temple-col-f-${cidx}`}>
            {/* Front row at Z = -2188 */}
            <CorinthianColumn
              position={[cx, 22.0, -2188]}
              height={22.0}
              radius={1.15}
            />
            {/* Deep Pronaos inner row at Z = -2202 */}
            <CorinthianColumn
              position={[cx, 22.0, -2202]}
              height={22.0}
              radius={1.15}
            />
          </React.Fragment>
        );
      })}

      {/* Classical Architrave & Frieze */}
      <mesh position={[0, 46.5, -2195]}>
        <boxGeometry args={[50.0, 3.2, 22.0]} />
        <meshStandardMaterial color="#f2e8dc" roughness={0.65} />
      </mesh>
      {/* Molded Cornice (Dentils & Geison) */}
      <mesh position={[0, 48.3, -2195]}>
        <boxGeometry args={[52.0, 0.8, 23.2]} />
        <meshStandardMaterial color="#f7ede2" roughness={0.6} />
      </mesh>

      {/* Monumental Classical Triangular Pediment (Tympanum) */}
      <mesh position={[0, 48.7, -2183.8]}>
        <extrudeGeometry args={[pedimentShape, { depth: 1.2, bevelEnabled: false }]} />
        <meshStandardMaterial color="#ece1d3" roughness={0.65} />
      </mesh>

      {/* Classical Molded Raking Cornices framing the Pediment */}
      {/* Left Rake */}
      <mesh position={[-13.0, 53.1, -2183.0]} rotation={[0, 0, -0.326]}>
        <boxGeometry args={[28.0, 0.8, 1.8]} />
        <meshStandardMaterial color="#f7ede2" roughness={0.6} />
      </mesh>
      {/* Right Rake */}
      <mesh position={[13.0, 53.1, -2183.0]} rotation={[0, 0, 0.326]}>
        <boxGeometry args={[28.0, 0.8, 1.8]} />
        <meshStandardMaterial color="#f7ede2" roughness={0.6} />
      </mesh>
      {/* Horizontal Base Cornice */}
      <mesh position={[0, 48.7, -2183.0]}>
        <boxGeometry args={[53.0, 0.8, 1.8]} />
        <meshStandardMaterial color="#f7ede2" roughness={0.6} />
      </mesh>

      {/* Gilded High-Relief Sculptures in Pediment (Jupiter & Gods) */}
      <group position={[0, 49.5, -2182]}>
        {/* Central Jupiter with golden eagle */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 3.6, 10]} />
          <meshStandardMaterial color="#ffd700" metalness={0.88} roughness={0.2} />
        </mesh>
        <mesh position={[0, 4.0, 0]}>
          <sphereGeometry args={[0.65, 10, 10]} />
          <meshStandardMaterial color="#ffd700" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Flanking Minerva & Juno */}
        <mesh position={[-6.0, 1.0, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 2.8, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[6.0, 1.0, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 2.8, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* Gilded Roof Apex Quadriga (Chariot with 4 Horses) */}
      <group position={[0, 58.2, -2183]}>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[5.2, 2.6, 3.2]} />
          <meshStandardMaterial color="#ffd700" metalness={0.92} roughness={0.15} />
        </mesh>
      </group>

      {/* Temple Gabled Roof with Terracotta Pantiles (Spanning Z: -2183 to -2272) */}
      {/* Left Roof Slope */}
      <mesh position={[-13.2, 53.3, -2227.5]} rotation={[0, 0, -0.326]}>
        <boxGeometry args={[28.2, 0.5, 91.0]} />
        <meshStandardMaterial color="#ba4e32" roughness={0.85} />
      </mesh>
      {/* Right Roof Slope */}
      <mesh position={[13.2, 53.3, -2227.5]} rotation={[0, 0, 0.326]}>
        <boxGeometry args={[28.2, 0.5, 91.0]} />
        <meshStandardMaterial color="#ba4e32" roughness={0.85} />
      </mesh>
      {/* Terra-cotta Ridge Cap Beam */}
      <mesh position={[0, 57.8, -2227.5]}>
        <boxGeometry args={[1.4, 0.6, 91.0]} />
        <meshStandardMaterial color="#8d3822" roughness={0.85} />
      </mesh>

      {/* =========================================================================
          3. OPEN MONUMENTAL ENTRANCE PORTAL & 3D INTERIOR SANCTUARY (Z: -2212 to -2272)
          ========================================================================= */}

      {/* Front Cella Wall (Z = -2212) with 8m wide, 13m tall OPEN PORTAL */}
      {/* Left Wall Segment */}
      <mesh position={[-14.0, 33.0, -2212]}>
        <boxGeometry args={[20.0, 22.0, 1.2]} />
        <meshStandardMaterial color="#dfd4c5" roughness={0.7} />
      </mesh>
      {/* Right Wall Segment */}
      <mesh position={[14.0, 33.0, -2212]}>
        <boxGeometry args={[20.0, 22.0, 1.2]} />
        <meshStandardMaterial color="#dfd4c5" roughness={0.7} />
      </mesh>
      {/* Portal Top Lintel Wall Segment (above portal opening Y: 35 to 44) */}
      <mesh position={[0, 39.5, -2212]}>
        <boxGeometry args={[8.0, 9.0, 1.2]} />
        <meshStandardMaterial color="#dfd4c5" roughness={0.7} />
      </mesh>

      {/* Carved Marble Portal Moldings & Entablature */}
      <mesh position={[-4.3, 28.5, -2211]}>
        <boxGeometry args={[0.6, 13.0, 0.4]} />
        <meshStandardMaterial color="#f0e6dc" roughness={0.6} />
      </mesh>
      <mesh position={[4.3, 28.5, -2211]}>
        <boxGeometry args={[0.6, 13.0, 0.4]} />
        <meshStandardMaterial color="#f0e6dc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 35.3, -2211]}>
        <boxGeometry args={[9.6, 0.8, 0.5]} />
        <meshStandardMaterial color="#f5ede3" roughness={0.55} />
      </mesh>

      {/* Heavy Bronze Double Doors SWUNG WIDE OPEN against interior walls */}
      <mesh position={[-4.2, 28.5, -2215]} rotation={[0, -Math.PI * 0.45, 0]}>
        <boxGeometry args={[3.8, 12.8, 0.25]} />
        <meshStandardMaterial color="#5a422d" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[4.2, 28.5, -2215]} rotation={[0, Math.PI * 0.45, 0]}>
        <boxGeometry args={[3.8, 12.8, 0.25]} />
        <meshStandardMaterial color="#5a422d" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Real 3D Interior Sanctuary Chamber (Cella) */}
      <group position={[0, 0, 0]}>
        {/* Interior Polished Marble Floor (Y = 22.0, Z: -2212 to -2272) */}
        <mesh position={[0, 22.05, -2242]}>
          <boxGeometry args={[26.0, 0.2, 60.0]} />
          <meshStandardMaterial color="#423026" roughness={0.35} metalness={0.15} />
        </mesh>

        {/* Interior Enclosing Walls (completely concealing the exterior world) */}
        {/* Left Interior Wall */}
        <mesh position={[-13.0, 31.0, -2242]}>
          <boxGeometry args={[1.5, 18.0, 60.0]} />
          <meshStandardMaterial color="#6a1a24" roughness={0.8} />
        </mesh>
        {/* Right Interior Wall */}
        <mesh position={[13.0, 31.0, -2242]}>
          <boxGeometry args={[1.5, 18.0, 60.0]} />
          <meshStandardMaterial color="#6a1a24" roughness={0.8} />
        </mesh>
        {/* Rear Sanctuary Wall */}
        <mesh position={[0, 31.0, -2272]}>
          <boxGeometry args={[27.5, 18.0, 1.5]} />
          <meshStandardMaterial color="#50131b" roughness={0.8} />
        </mesh>
        {/* Coffered Ceiling */}
        <mesh position={[0, 40.0, -2242]}>
          <boxGeometry args={[26.0, 0.8, 60.0]} />
          <meshStandardMaterial color="#2d2218" roughness={0.85} />
        </mesh>

        {/* Interior Fluted Corinthian Colonnades lining the Nave */}
        {[-2222, -2234, -2246, -2258].map((iz, iidx) => (
          <React.Fragment key={`inner-col-${iidx}`}>
            <CorinthianColumn
              position={[-8.5, 22.0, iz]}
              height={14.0}
              radius={0.7}
              color="#ede2d5"
            />
            <CorinthianColumn
              position={[8.5, 22.0, iz]}
              height={14.0}
              radius={0.7}
              color="#ede2d5"
            />
          </React.Fragment>
        ))}

        {/* Classical Bronze Fire Braziers along the Interior Corridor */}
        {[-2220, -2235, -2250].map((bz, bidx) => (
          <React.Fragment key={`brazier-${bidx}`}>
            {/* Left Brazier */}
            <group position={[-5.5, 22.0, bz]}>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.3, 0.35, 1.2, 8]} />
                <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.35, 0]}>
                <cylinderGeometry args={[0.55, 0.25, 0.3, 10]} />
                <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Glowing fire bowl */}
              <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={2.5} />
              </mesh>
              <pointLight color="#ff8822" intensity={1.8} distance={18} position={[0, 1.8, 0]} />
            </group>

            {/* Right Brazier */}
            <group position={[5.5, 22.0, bz]}>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.3, 0.35, 1.2, 8]} />
                <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.35, 0]}>
                <cylinderGeometry args={[0.55, 0.25, 0.3, 10]} />
                <meshStandardMaterial color="#c59b27" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={2.5} />
              </mesh>
              <pointLight color="#ff8822" intensity={1.8} distance={18} position={[0, 1.8, 0]} />
            </group>
          </React.Fragment>
        ))}

        {/* Golden Triumphal Sanctum Arch framing the Dimensional Rift at Z = -2262 */}
        <mesh position={[-6.0, 28.5, -2262]}>
          <boxGeometry args={[1.8, 13.0, 1.2]} />
          <meshStandardMaterial color="#dfd4c5" roughness={0.65} />
        </mesh>
        <mesh position={[6.0, 28.5, -2262]}>
          <boxGeometry args={[1.8, 13.0, 1.2]} />
          <meshStandardMaterial color="#dfd4c5" roughness={0.65} />
        </mesh>
        <mesh position={[0, 35.5, -2262]}>
          <boxGeometry args={[13.8, 1.5, 1.4]} />
          <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Hero Imperial Emperor Statue on Elevated Terrace Balustrade
 * Directly matching reference image left:
 * Statue of the Emperor in laurel wreath holding a golden spear overlooking the street
 */
function EmperorMonumentTerrace({
  position = [-8.4, 0, -1930],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Lower Monumental Base / Taberna Portico */}
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[6.8, 11.0, 8.5]} />
        <meshStandardMaterial color="#dfd4c6" roughness={0.7} />
      </mesh>

      {/* Carved Entablature & Cornice */}
      <mesh position={[0, 11.3, 0]}>
        <boxGeometry args={[7.4, 0.7, 9.1]} />
        <meshStandardMaterial color="#ece3d7" roughness={0.65} />
      </mesh>

      {/* Terrace Classical Stone Balustrade */}
      <mesh position={[0, 12.2, 4.2]}>
        <boxGeometry args={[7.0, 1.1, 0.28]} />
        <meshStandardMaterial color="#f0e7dc" roughness={0.6} />
      </mesh>
      <mesh position={[-3.3, 12.2, 0]}>
        <boxGeometry args={[0.28, 1.1, 8.5]} />
        <meshStandardMaterial color="#f0e7dc" roughness={0.6} />
      </mesh>
      <mesh position={[3.3, 12.2, 0]}>
        <boxGeometry args={[0.28, 1.1, 8.5]} />
        <meshStandardMaterial color="#f0e7dc" roughness={0.6} />
      </mesh>

      {/* Hero Statue Pedestal on Terrace */}
      <mesh position={[0, 12.5, 1.8]}>
        <boxGeometry args={[1.8, 1.6, 1.8]} />
        <meshStandardMaterial color="#f5ede3" roughness={0.55} />
      </mesh>

      {/* The Imperial Emperor Statue (Matching Reference Image) */}
      <group position={[0, 13.3, 1.8]}>
        {/* Marble Toga / Cuirass Body */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.38, 0.48, 1.7, 10]} />
          <meshStandardMaterial color="#f7f1e6" roughness={0.5} />
        </mesh>
        {/* Head with Gilded Laurel Wreath */}
        <mesh position={[0, 2.25, 0]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#f7f1e6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.38, 0]}>
          <torusGeometry args={[0.23, 0.04, 6, 12]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Right Arm Raised Holding Golden Spear Pointing Skyward */}
        <mesh position={[0.42, 1.85, 0.25]} rotation={[0.4, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.07, 0.85, 8]} />
          <meshStandardMaterial color="#f7f1e6" roughness={0.5} />
        </mesh>
        {/* Tall Golden Spear / Sceptre */}
        <group position={[0.62, 2.3, 0.45]} rotation={[-0.15, 0, 0.05]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 3.4, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <coneGeometry args={[0.08, 0.35, 6]} />
            <meshStandardMaterial color="#ffd700" metalness={0.92} roughness={0.15} />
          </mesh>
        </group>

        {/* Left Arm Holding Draped Toga Folds */}
        <mesh position={[-0.42, 1.45, 0.1]} rotation={[-0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.07, 0.75, 8]} />
          <meshStandardMaterial color="#f7f1e6" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Foreground Roman Commander Statue on Carved Pedestal
 * Directly matching reference image:
 * Marble/bronze statue next to the left foreground colonnade
 */
function CommanderPedestalStatue({
  position = [-6.2, 0.28, -1815],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Molded Plinth Foundation */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.6, 1.5]} />
        <meshStandardMaterial color="#ded2c3" roughness={0.68} />
      </mesh>
      {/* Carved Marble Pedestal Die with Latin Inscription Panel */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.2, 1.3, 1.2]} />
        <meshStandardMaterial color="#ebe2d7" roughness={0.6} />
      </mesh>
      {/* Pedestal Cap Molding */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
        <meshStandardMaterial color="#f2e9de" roughness={0.58} />
      </mesh>

      {/* Marble Roman Commander Statue */}
      <group position={[0, 2.05, 0]}>
        {/* Legs with Greaves (Ocreae) */}
        <mesh position={[-0.18, 0.45, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.55} />
        </mesh>
        <mesh position={[0.18, 0.45, 0.06]}>
          <cylinderGeometry args={[0.09, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.55} />
        </mesh>

        {/* Torso in Muscle Cuirass and Draped Paludamentum Cloak */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.3, 0.26, 0.9, 10]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.52} />
        </mesh>

        {/* Head with Short Roman Hair */}
        <mesh position={[0, 1.95, 0]}>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.5} />
        </mesh>

        {/* Left Arm Resting on Scutum Shield */}
        <mesh position={[-0.38, 1.35, 0.1]} rotation={[0, 0, 0.25]}>
          <cylinderGeometry args={[0.07, 0.06, 0.7, 8]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.52} />
        </mesh>
        {/* Scutum Shield Standing by Leg */}
        <mesh position={[-0.45, 0.7, 0.1]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.12, 1.3, 0.65]} />
          <meshStandardMaterial color="#8b111e" roughness={0.7} />
        </mesh>

        {/* Right Arm Holding Gladius Sword */}
        <mesh position={[0.38, 1.4, 0.15]} rotation={[-0.4, 0, -0.2]}>
          <cylinderGeometry args={[0.07, 0.06, 0.65, 8]} />
          <meshStandardMaterial color="#f5efe5" roughness={0.52} />
        </mesh>
        <mesh position={[0.42, 1.15, 0.4]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.05, 0.65, 0.03]} />
          <meshStandardMaterial color="#b39234" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Multi-Story Roman Insula (Apartment Building & Shopfronts)
 * Authentic Roman masonry, terracotta hip roofs, balconies, and shuttered windows
 */
function RomanInsula({
  position,
  width = 14.0,
  depth = 12.0,
  floors = 3,
  wallColor = "#dfd2c0",
}: {
  position: [number, number, number];
  width?: number;
  depth?: number;
  floors?: number;
  wallColor?: string;
}) {
  const floorHeight = 4.2;
  const totalWallHeight = floors * floorHeight;

  return (
    <group position={position}>
      {/* Main Masonry Block */}
      <mesh position={[0, totalWallHeight / 2, 0]}>
        <boxGeometry args={[width, totalWallHeight, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.75} />
      </mesh>

      {/* Ground Floor Arched Shop Entrances (Tabernae) with Fabric Canopies */}
      {[-width * 0.28, width * 0.28].map((ax, ai) => (
        <group key={`arch-${ai}`} position={[ax, 2.1, depth / 2 + 0.05]}>
          <mesh>
            <boxGeometry args={[2.8, 3.8, 0.15]} />
            <meshStandardMaterial color="#2d2218" roughness={0.9} />
          </mesh>
          {/* Stone Arch Surround */}
          <mesh position={[0, 1.9, 0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#f0e6dc" roughness={0.65} />
          </mesh>
          {/* Shop Fabric Canopy Awning */}
          <mesh position={[0, 3.2, 0.8]} rotation={[0.3, 0, 0]}>
            <planeGeometry args={[3.2, 1.6]} />
            <meshStandardMaterial color={ai === 0 ? "#8b111e" : "#c49a32"} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Vertical Corner Quoin Blocks (Classic Roman Ashlar Masonry Detail) */}
      {[-width / 2, width / 2].map((qx, qi) => (
        <group key={`quoin-${qi}`} position={[qx, 0, depth / 2]}>
          {Array.from({ length: floors * 3 }).map((_, qidx) => (
            <mesh key={`q-b-${qidx}`} position={[qi === 0 ? 0.35 : -0.35, qidx * 1.4 + 0.7, 0]}>
              <boxGeometry args={[0.7, 1.1, 0.3]} />
              <meshStandardMaterial color="#ebe2d5" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Upper Floor Windows with Wooden Shutters */}
      {Array.from({ length: floors - 1 }).map((_, fidx) => {
        const fy = (fidx + 1) * floorHeight + 2.0;
        return (
          <React.Fragment key={`floor-win-${fidx}`}>
            {[-width * 0.32, 0, width * 0.32].map((wx, wi) => (
              <group key={`win-${wi}`} position={[wx, fy, depth / 2 + 0.08]}>
                {/* Window opening */}
                <mesh>
                  <boxGeometry args={[1.2, 1.8, 0.12]} />
                  <meshStandardMaterial color="#1e1812" roughness={0.9} />
                </mesh>
                {/* Stone sill & lintel */}
                <mesh position={[0, -0.95, 0.06]}>
                  <boxGeometry args={[1.4, 0.18, 0.22]} />
                  <meshStandardMaterial color="#ded1c2" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.95, 0.06]}>
                  <boxGeometry args={[1.4, 0.22, 0.22]} />
                  <meshStandardMaterial color="#ded1c2" roughness={0.7} />
                </mesh>
                {/* Open wooden shutters */}
                <mesh position={[-0.7, 0, 0.08]} rotation={[0, -0.3, 0]}>
                  <boxGeometry args={[0.5, 1.7, 0.05]} />
                  <meshStandardMaterial color="#503d2e" roughness={0.9} />
                </mesh>
                <mesh position={[0.7, 0, 0.08]} rotation={[0, 0.3, 0]}>
                  <boxGeometry args={[0.5, 1.7, 0.05]} />
                  <meshStandardMaterial color="#503d2e" roughness={0.9} />
                </mesh>
              </group>
            ))}

            {/* Balcony on Second Floor (Floor 1) */}
            {fidx === 0 && (
              <group position={[0, fy - 1.1, depth / 2 + 0.9]}>
                {/* Balcony stone slab */}
                <mesh>
                  <boxGeometry args={[width * 0.75, 0.25, 1.8]} />
                  <meshStandardMaterial color="#ded2c3" roughness={0.65} />
                </mesh>
                {/* Balcony Stone Balustrade */}
                <mesh position={[0, 0.55, 0.85]}>
                  <boxGeometry args={[width * 0.75, 0.95, 0.15]} />
                  <meshStandardMaterial color="#ece3d7" roughness={0.6} />
                </mesh>
                {/* Trailing Green Vines Hanging from Balcony */}
                <mesh position={[0, -0.4, 0.9]}>
                  <planeGeometry args={[width * 0.65, 0.9]} />
                  <meshStandardMaterial color="#2d5e23" roughness={0.9} side={THREE.DoubleSide} />
                </mesh>
              </group>
            )}
          </React.Fragment>
        );
      })}

      {/* Stringcourse Moldings Between Floors */}
      {Array.from({ length: floors }).map((_, fidx) => (
        <mesh key={`string-${fidx}`} position={[0, fidx * floorHeight + 0.1, depth / 2 + 0.1]}>
          <boxGeometry args={[width + 0.3, 0.25, 0.2]} />
          <meshStandardMaterial color="#ece1d3" roughness={0.65} />
        </mesh>
      ))}

      {/* Terracotta Hip Roof with Eaves */}
      <mesh position={[0, totalWallHeight + 1.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[Math.hypot(width, depth) * 0.52, 3.6, 4]} />
        <meshStandardMaterial color="#b5482e" roughness={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Triumphal Arch of Titus / Augustus
 * Monumental entrance gateway connecting the Via Appia to the Via Sacra
 */
function TriumphalArch({
  position = [0, 0, -1798],
}: {
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Massive Central Arch Opening Piers */}
      {/* Left Pier */}
      <mesh position={[-5.8, 7.5, 0]}>
        <boxGeometry args={[3.8, 15.0, 4.8]} />
        <meshStandardMaterial color="#e5dad0" roughness={0.68} />
      </mesh>
      {/* Right Pier */}
      <mesh position={[5.8, 7.5, 0]}>
        <boxGeometry args={[3.8, 15.0, 4.8]} />
        <meshStandardMaterial color="#e5dad0" roughness={0.68} />
      </mesh>

      {/* Central Grand Arch Vault (Span: 7.8m, Height: 11.5m) */}
      <mesh position={[0, 13.5, 0]}>
        <boxGeometry args={[7.8, 3.0, 4.6]} />
        <meshStandardMaterial color="#ded1c4" roughness={0.7} />
      </mesh>

      {/* 4 Engaged Corinthian Columns on Facade */}
      {[-7.2, -4.2, 4.2, 7.2].map((cx, ci) => (
        <CorinthianColumn
          key={`arch-col-${ci}`}
          position={[cx, 0, 2.45]}
          height={14.0}
          radius={0.55}
        />
      ))}

      {/* Carved Entablature Band */}
      <mesh position={[0, 15.8, 0]}>
        <boxGeometry args={[16.2, 1.2, 5.4]} />
        <meshStandardMaterial color="#ede4d9" roughness={0.65} />
      </mesh>

      {/* Attic Storey with Golden Dedication Inscription */}
      <mesh position={[0, 19.5, 0]}>
        <boxGeometry args={[15.6, 6.2, 4.6]} />
        <meshStandardMaterial color="#ece3d7" roughness={0.65} />
      </mesh>
      {/* Attic Golden Inscription Plaque */}
      <mesh position={[0, 19.5, 2.35]}>
        <boxGeometry args={[10.5, 3.8, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Gilded Bronze Quadriga (Chariot with 4 Horses) atop Arch */}
      <mesh position={[0, 23.8, 0]}>
        <boxGeometry args={[5.2, 2.5, 3.2]} />
        <meshStandardMaterial color="#ffd700" metalness={0.88} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Master Rome Architecture Component:
 * - Colosseum / Flavian Amphitheatre (Right)
 * - Grand Capitoline Temple of Jupiter with monumental stairs (Distant Center)
 * - Double-Tiered Roman Aqueduct (Left Hills)
 * - Foreground Left Corinthian Colonnade & Balustrade Terrace
 * - Emperor Monument on High Terrace (Left)
 * - Roman Commander Pedestal Statue (Left Foreground)
 * - Multi-story Insulae lining both sides of the Via Sacra
 * - Triumphal Gateway Arch
 */
export default function RomeArchitecture() {
  return (
    <group name="rome-architecture">
      {/* 1. Triumphal Arch Gateway at Avenue Entrance */}
      <TriumphalArch position={[0, 0, -1798]} />

      {/* 2. Foreground Left Grand Colonnade & Terrace */}
      <group position={[-7.4, 0, 0]}>
        {/* 8 Monumental Fluted Corinthian Columns */}
        {[-1810, -1824, -1838, -1852, -1866, -1880, -1894, -1908].map((cz, ci) => (
          <CorinthianColumn
            key={`left-col-${ci}`}
            position={[0, 0.28, cz]}
            height={13.5}
            radius={0.72}
          />
        ))}

        {/* Continuous Upper Entablature */}
        <mesh position={[0, 14.8, -1859]}>
          <boxGeometry args={[2.8, 1.4, 110]} />
          <meshStandardMaterial color="#f0e8dc" roughness={0.62} />
        </mesh>
        {/* Terrace Stone Balustrade */}
        <mesh position={[0, 16.0, -1859]}>
          <boxGeometry args={[0.3, 1.0, 110]} />
          <meshStandardMaterial color="#ded2c3" roughness={0.65} />
        </mesh>
      </group>

      {/* 3. Hero Imperial Statues */}
      {/* Foreground Commander Statue */}
      <CommanderPedestalStatue position={[-6.2, 0.28, -1815]} />

      {/* Emperor Monument on High Terrace (Left - matching reference foreground vista) */}
      <EmperorMonumentTerrace position={[-8.4, 0, -1845]} />

      {/* 4. Colosseum / Flavian Amphitheatre (Right) */}
      <RomanColosseum position={[52, 0, -1990]} />

      {/* 5. Double-Tiered Roman Aqueduct (Left Hills) */}
      <RomanAqueduct position={[-110, 6, -2140]} rotation={[0, 0.42, 0]} />

      {/* 6. Grand Capitoline Temple of Jupiter with Connected Monumental Staircase */}
      <GrandCapitolineTemple />

      {/* 7. Multi-Story Roman Insulae Lining Both Sides */}
      {/* Left side insulae (behind colonnade) */}
      <RomanInsula position={[-19, 0, -1835]} width={18} depth={16} floors={3} wallColor="#ded2bf" />
      <RomanInsula position={[-20, 0, -1875]} width={16} depth={16} floors={3} wallColor="#dfd5c5" />
      <RomanInsula position={[-21, 0, -1915]} width={18} depth={16} floors={4} wallColor="#d8cbb8" />
      <RomanInsula position={[-22, 0, -1975]} width={16} depth={16} floors={3} wallColor="#ded1be" />
      <RomanInsula position={[-22, 0, -2035]} width={18} depth={16} floors={3} wallColor="#dfd4c4" />
      <RomanInsula position={[-24, 0, -2095]} width={16} depth={16} floors={3} wallColor="#d6c8b5" />

      {/* Right side insulae (framing Colosseum vista) */}
      <RomanInsula position={[18, 0, -1835]} width={16} depth={16} floors={3} wallColor="#dfd4c3" />
      <RomanInsula position={[18, 0, -1875]} width={15} depth={16} floors={3} wallColor="#d6c7b4" />
      <RomanInsula position={[19, 0, -1915]} width={16} depth={16} floors={3} wallColor="#ded1be" />
      {/* Colosseum occupies middle right (z: -1950 to -2040) */}
      <RomanInsula position={[19, 0, -2055]} width={16} depth={16} floors={3} wallColor="#ded3c2" />
      <RomanInsula position={[20, 0, -2095]} width={18} depth={16} floors={3} wallColor="#d9ccb9" />
    </group>
  );
}
