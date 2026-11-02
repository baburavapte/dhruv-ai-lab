"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Authentic Roman Legionary / Praetorian Guard
 * - Galea helmet with bright red horsehair crest
 * - Lorica segmentata / bronze breastplate
 * - Long flowing crimson cloak (sagum / paludamentum)
 * - Caligae military sandals & pteruges leather strips
 * - Pilum spear with iron tip
 */
function RomanLegionary({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  isWalking = false,
  walkSpeed = 1.8,
  animOffset = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isWalking?: boolean;
  walkSpeed?: number;
  animOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const capeRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * walkSpeed + animOffset;

    if (groupRef.current && isWalking) {
      // Subtle vertical bob while marching
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.05;
    }

    // Marching leg swing
    if (leftLegRef.current && rightLegRef.current && isWalking) {
      const legAngle = Math.sin(t * 2) * 0.35;
      leftLegRef.current.rotation.x = legAngle;
      rightLegRef.current.rotation.x = -legAngle;
    }

    // Dynamic cloak flutter
    if (capeRef.current) {
      capeRef.current.rotation.x = 0.15 + (isWalking ? Math.sin(t * 2) * 0.08 : Math.sin(t * 1.2) * 0.03);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Torso: Lorica Segmentata / Bronze Muscle Cuirass */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.26, 0.22, 0.65, 10]} />
        <meshStandardMaterial color="#b38734" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Belt (Balteus) with decorative bronze studs */}
      <mesh position={[0, 0.94, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.08, 12]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.8} />
      </mesh>

      {/* Pteruges (Leather Groin/Thigh Protection Strips) */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.22, 10]} />
        <meshStandardMaterial color="#6a3b22" roughness={0.85} />
      </mesh>

      {/* Red Tunic Peeking Below Armor */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.2, 10]} />
        <meshStandardMaterial color="#88111e" roughness={0.8} />
      </mesh>

      {/* Neck & Head */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#d4a373" roughness={0.65} />
      </mesh>

      {/* Bronze Galea Helmet */}
      <group position={[0, 1.68, 0]}>
        {/* Helmet Bowl */}
        <mesh>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color="#c69229" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Neck Guard (Neck Flange) */}
        <mesh position={[0, -0.06, -0.09]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.24, 0.04, 0.14]} />
          <meshStandardMaterial color="#c69229" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Cheek Guards */}
        <mesh position={[-0.13, -0.08, 0.04]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.03, 0.14, 0.08]} />
          <meshStandardMaterial color="#c69229" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.13, -0.08, 0.04]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.03, 0.14, 0.08]} />
          <meshStandardMaterial color="#c69229" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Magnificent Red Horsehair Crest (Crista) */}
        <mesh position={[0, 0.14, -0.02]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.07, 0.18, 0.32]} />
          <meshStandardMaterial color="#c41528" roughness={0.9} />
        </mesh>
        {/* Crest crest box holder */}
        <mesh position={[0, 0.06, -0.02]}>
          <boxGeometry args={[0.05, 0.05, 0.28]} />
          <meshStandardMaterial color="#ffd700" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Red Imperial Cloak (Sagum) draped over shoulders and back */}
      <mesh
        ref={capeRef}
        position={[0, 1.48, -0.16]}
        rotation={[0.15, 0, 0]}
      >
        <planeGeometry args={[0.62, 1.05]} />
        <meshStandardMaterial
          color="#9b1322"
          roughness={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left Arm & Shoulder Guard (Pauldrons) */}
      <mesh position={[-0.32, 1.44, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#b38734" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[-0.32, 1.15, 0.08]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.48, 8]} />
        <meshStandardMaterial color="#d4a373" roughness={0.7} />
      </mesh>

      {/* Right Arm holding Pilum Spear */}
      <mesh position={[0.32, 1.44, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#b38734" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.32, 1.15, 0.12]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.48, 8]} />
        <meshStandardMaterial color="#d4a373" roughness={0.7} />
      </mesh>

      {/* Pilum Spear in Right Hand */}
      <group position={[0.34, 1.05, 0.25]} rotation={[-0.08, 0, 0.04]}>
        {/* Ash wood shaft */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
          <meshStandardMaterial color="#59412b" roughness={0.9} />
        </mesh>
        {/* Iron shank & pyramidal point */}
        <mesh position={[0, 1.62, 0]}>
          <cylinderGeometry args={[0.012, 0.015, 0.45, 6]} />
          <meshStandardMaterial color="#8a8a8a" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <coneGeometry args={[0.025, 0.14, 6]} />
          <meshStandardMaterial color="#a0a0a0" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* Legs with Caligae Sandals */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.62, 8]} />
          <meshStandardMaterial color="#c29160" roughness={0.75} />
        </mesh>
        {/* Sandal / Caligae */}
        <mesh position={[0, -0.6, 0.04]}>
          <boxGeometry args={[0.09, 0.06, 0.2]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.62, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.07, 0.055, 0.62, 8]} />
          <meshStandardMaterial color="#c29160" roughness={0.75} />
        </mesh>
        {/* Sandal / Caligae */}
        <mesh position={[0, -0.6, 0.04]}>
          <boxGeometry args={[0.09, 0.06, 0.2]} />
          <meshStandardMaterial color="#3d2817" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Roman Citizen in Draped Tunic / Toga
 * Citizens, merchants, patricians in authentic flowing garments
 */
function RomanCitizen({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  togaColor = "#f5f0e6", // white/cream
  tunicColor = "#3d2b1f",
  isPatrician = false,
  isWalking = false,
  walkSpeed = 1.6,
  animOffset = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  togaColor?: string;
  tunicColor?: string;
  isPatrician?: boolean;
  isWalking?: boolean;
  walkSpeed?: number;
  animOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * walkSpeed + animOffset;

    if (groupRef.current) {
      if (isWalking) {
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.04;
      } else {
        // Subtle idle breathing
        groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.8) * 0.04;
      }
    }

    if (leftLegRef.current && rightLegRef.current && isWalking) {
      const legAngle = Math.sin(t * 2) * 0.3;
      leftLegRef.current.rotation.x = legAngle;
      rightLegRef.current.rotation.x = -legAngle;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Toga/Tunic Body - Elegant classical conical drape */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.26, 0.38, 1.1, 10]} />
        <meshStandardMaterial color={togaColor} roughness={0.85} />
      </mesh>

      {/* Shoulder Toga Fold (Umbo / Sinus diagonal drape) */}
      <mesh position={[-0.04, 1.25, 0.05]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.18, 0.22, 0.55, 8]} />
        <meshStandardMaterial color={togaColor} roughness={0.85} />
      </mesh>

      {/* Patrician Purple Stripe (Clavus) */}
      {isPatrician && (
        <mesh position={[0.06, 1.05, 0.22]}>
          <planeGeometry args={[0.05, 0.8]} />
          <meshStandardMaterial color="#6a0dad" roughness={0.8} />
        </mesh>
      )}

      {/* Head & Classical Roman Hair */}
      <mesh position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.13, 10, 10]} />
        <meshStandardMaterial color="#deb887" roughness={0.7} />
      </mesh>
      {/* Short dark Roman hair / curls */}
      <mesh position={[0, 1.64, -0.02]}>
        <sphereGeometry args={[0.135, 10, 8]} />
        <meshStandardMaterial color="#2d2218" roughness={0.9} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.26, 1.18, 0.08]} rotation={[-0.25, 0, 0.15]}>
        <cylinderGeometry args={[0.05, 0.045, 0.45, 8]} />
        <meshStandardMaterial color="#deb887" roughness={0.7} />
      </mesh>
      <mesh position={[0.26, 1.18, 0.1]} rotation={[-0.35, 0, -0.15]}>
        <cylinderGeometry args={[0.05, 0.045, 0.45, 8]} />
        <meshStandardMaterial color="#deb887" roughness={0.7} />
      </mesh>

      {/* Feet / Calcei Sandals */}
      <group ref={leftLegRef} position={[-0.1, 0.35, 0]}>
        <mesh position={[0, -0.25, 0.04]}>
          <boxGeometry args={[0.09, 0.08, 0.18]} />
          <meshStandardMaterial color={tunicColor} roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.1, 0.35, 0]}>
        <mesh position={[0, -0.25, 0.04]}>
          <boxGeometry args={[0.09, 0.08, 0.18]} />
          <meshStandardMaterial color={tunicColor} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Master Rome Crowd Component:
 * - Roman Legionaries in authentic armor with red crests and cloaks
 *   (including the prominent foreground pair seen in the reference image!)
 * - Roman citizens, merchants, and patricians strolling along the avenue
 */
export default function RomeCrowd() {
  // Placement of Roman Legionaries matching the reference image:
  // Foreground center-right: two marching legionaries with red cloaks and horsehair crests
  // Plus sentries along the left colonnade and patrol guards down the avenue.
  const legionaries = useMemo(
    () => [
      // Signature Foreground Pair (Exactly matching reference image!)
      {
        pos: [2.2, 0, -1818] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number], // walking away down the avenue towards temple
        scale: 1.05,
        walk: true,
        speed: 1.7,
        off: 0,
      },
      {
        pos: [3.4, 0, -1820] as [number, number, number],
        rot: [0, Math.PI + 0.08, 0] as [number, number, number],
        scale: 1.05,
        walk: true,
        speed: 1.7,
        off: 0.8,
      },

      // Sentries stationed by the foreground left imperial colonnade
      {
        pos: [-5.8, 0.28, -1812] as [number, number, number],
        rot: [0, Math.PI / 4, 0] as [number, number, number],
        scale: 1.02,
        walk: false,
        speed: 1.0,
        off: 1.2,
      },
      {
        pos: [-5.8, 0.28, -1832] as [number, number, number],
        rot: [0, Math.PI / 4, 0] as [number, number, number],
        scale: 1.02,
        walk: false,
        speed: 1.0,
        off: 2.1,
      },

      // Mid-avenue patrol pair walking forward
      {
        pos: [-1.8, 0, -1890] as [number, number, number],
        rot: [0, Math.PI - 0.05, 0] as [number, number, number],
        scale: 1.0,
        walk: true,
        speed: 1.6,
        off: 0.5,
      },
      {
        pos: [-0.6, 0, -1892] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
        scale: 1.0,
        walk: true,
        speed: 1.6,
        off: 1.3,
      },

      // Patrol near temple staircase in distance
      {
        pos: [-2.5, 0, -2120] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
        scale: 1.1,
        walk: true,
        speed: 1.5,
        off: 0.7,
      },
      {
        pos: [2.5, 0, -2120] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
        scale: 1.1,
        walk: true,
        speed: 1.5,
        off: 1.5,
      },
    ],
    []
  );

  // Roman Citizens and Merchants distributed throughout the forum & market
  const citizens = useMemo(
    () => [
      // Left foreground merchants and citizens at stalls
      {
        pos: [-4.6, 0, -1814] as [number, number, number],
        rot: [0, Math.PI * 0.75, 0] as [number, number, number],
        toga: "#ecdcc9",
        tunic: "#4a3525",
        patrician: false,
        walk: false,
        off: 0.3,
      },
      {
        pos: [-3.8, 0, -1816] as [number, number, number],
        rot: [0, -Math.PI * 0.25, 0] as [number, number, number],
        toga: "#c94a29", // terracotta red tunic
        tunic: "#2f2015",
        patrician: false,
        walk: true,
        off: 0.9,
      },
      {
        pos: [-2.2, 0, -1822] as [number, number, number],
        rot: [0, Math.PI - 0.15, 0] as [number, number, number],
        toga: "#fdfbf7", // pristine white toga
        tunic: "#5c3d2e",
        patrician: true,
        walk: true,
        off: 1.8,
      },
      {
        pos: [-1.2, 0, -1824] as [number, number, number],
        rot: [0, Math.PI + 0.1, 0] as [number, number, number],
        toga: "#e8c39e", // warm ochre
        tunic: "#453222",
        patrician: false,
        walk: true,
        off: 2.4,
      },

      // Citizens gathered around the fountain (foreground right)
      {
        pos: [5.2, 0.28, -1818] as [number, number, number],
        rot: [0, -Math.PI * 0.4, 0] as [number, number, number],
        toga: "#f8f5ee",
        tunic: "#3a251a",
        patrician: true,
        walk: false,
        off: 0.6,
      },
      {
        pos: [5.6, 0.28, -1826] as [number, number, number],
        rot: [0, -Math.PI * 0.75, 0] as [number, number, number],
        toga: "#b54434",
        tunic: "#301d12",
        patrician: false,
        walk: false,
        off: 1.4,
      },
      {
        pos: [9.6, 0.28, -1821] as [number, number, number],
        rot: [0, Math.PI * 0.8, 0] as [number, number, number],
        toga: "#dfcca6",
        tunic: "#453123",
        patrician: false,
        walk: false,
        off: 2.0,
      },

      // Mid-avenue crowd strolling down the street
      {
        pos: [1.2, 0, -1845] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
        toga: "#eedbc5",
        tunic: "#3f2d1e",
        patrician: false,
        walk: true,
        off: 0.4,
      },
      {
        pos: [-1.8, 0, -1855] as [number, number, number],
        rot: [0, Math.PI - 0.1, 0] as [number, number, number],
        toga: "#fdf8ee",
        tunic: "#523724",
        patrician: true,
        walk: true,
        off: 1.1,
      },
      {
        pos: [-4.2, 0, -1865] as [number, number, number],
        rot: [0, Math.PI * 0.3, 0] as [number, number, number],
        toga: "#a83e29",
        tunic: "#382317",
        patrician: false,
        walk: false,
        off: 1.7,
      },
      {
        pos: [3.8, 0, -1875] as [number, number, number],
        rot: [0, Math.PI * 0.85, 0] as [number, number, number],
        toga: "#dfc79b",
        tunic: "#432f20",
        patrician: false,
        walk: true,
        off: 2.3,
      },
      {
        pos: [0.5, 0, -1895] as [number, number, number],
        rot: [0, Math.PI + 0.15, 0] as [number, number, number],
        toga: "#f5f0e4",
        tunic: "#4e3523",
        patrician: true,
        walk: true,
        off: 0.8,
      },
      {
        pos: [-2.5, 0, -1920] as [number, number, number],
        rot: [0, Math.PI - 0.05, 0] as [number, number, number],
        toga: "#ba4b36",
        tunic: "#382518",
        patrician: false,
        walk: true,
        off: 1.6,
      },
      {
        pos: [2.0, 0, -1940] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
        toga: "#fbf6ec",
        tunic: "#583c28",
        patrician: true,
        walk: true,
        off: 2.2,
      },
    ],
    []
  );

  return (
    <group name="rome-crowd">
      {/* Roman Legionaries */}
      {legionaries.map((l, idx) => (
        <RomanLegionary
          key={`legionary-${idx}`}
          position={l.pos}
          rotation={l.rot}
          scale={l.scale}
          isWalking={l.walk}
          walkSpeed={l.speed}
          animOffset={l.off}
        />
      ))}

      {/* Roman Citizens */}
      {citizens.map((c, idx) => (
        <RomanCitizen
          key={`citizen-${idx}`}
          position={c.pos}
          rotation={c.rot}
          togaColor={c.toga}
          tunicColor={c.tunic}
          isPatrician={c.patrician}
          isWalking={c.walk}
          animOffset={c.off}
        />
      ))}
    </group>
  );
}

