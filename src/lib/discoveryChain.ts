/**
 * DHRUV AI LAB — CONTINUOUS DISCOVERY CHAIN ARCHITECTURE
 *
 * Declarative specification of the continuous discovery journey.
 *
 * Core Principle:
 * THE USER DOES NOT TRAVEL FROM ATTRACTION TO ATTRACTION.
 * THE USER TRAVELS THROUGH WORLDS.
 * EACH WORLD IS A COMPLETE EXPERIENCE.
 * THE TRANSITION CONNECTS ONE WORLD TO THE NEXT.
 *
 * Journey Sequence:
 * DRAGON FORTRESS WORLD  -->  TRANSITION  -->  QUANTUM LAB WORLD  -->  TRANSITION  -->  ATOMIC WORLD  -->  LOOP
 *
 * Worlds never physically coexist or visually mix into each other.
 * Each world is experienced continuously as a real environment.
 */

export type DiscoveryCategory =
  | "MYTHIC_VOLCANIC"
  | "QUANTUM_ATOMIC"
  | "BIOLOGICAL"
  | "GEOLOGICAL"
  | "HISTORICAL"
  | "CIVILIZATION_TECH"
  | "COSMIC"
  | "DIMENSIONAL";

export type SegmentType = "WORLD" | "TRANSITION";

export interface WorldDefinition {
  type: "WORLD";
  id: string;
  name: string;
  category: DiscoveryCategory;
  /** Normalized continuous journey interval [start, end] in 0..100 */
  range: [number, number];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    fog: string;
  };
  fogNear: number;
  fogFar: number;
  scaleDescription: string;
  environmentDescription: string;
}

export interface TransitionDefinition {
  type: "TRANSITION";
  id: string;
  name: string;
  sourceWorld: string;
  destinationWorld: string;
  range: [number, number];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    fog: string;
  };
  fogNear: number;
  fogFar: number;
  physicalTransformation: string;
}

export type JourneySegment = WorldDefinition | TransitionDefinition;

/** Backwards-compatible stage interface */
export interface DiscoveryStageDef {
  id: string;
  name: string;
  category: DiscoveryCategory;
  range: [number, number];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    fog: string;
  };
  movementType: string;
  transformationCause: string;
}

import { LOOP_LENGTH, positiveModulo } from "./worldProgress";

/**
 * Master Journey Segments (Pure Worlds & Physical Transitions)
 *
 * No micro-stages or attraction checkpoints.
 * Each world is a complete, expansive environment.
 */
export const JOURNEY_CHAIN: JourneySegment[] = [
  // 1. WORLD: Dragon Fortress World
  {
    type: "WORLD",
    id: "DRAGON_FORTRESS_WORLD",
    name: "Dragon Fortress",
    category: "MYTHIC_VOLCANIC",
    range: [0, 36],
    palette: { primary: "#e0531c", secondary: "#8c1d30", accent: "#ff7a36", fog: "#0a0814" },
    fogNear: 38,
    fogFar: 130,
    scaleDescription: "Monumental volcanic fortress and colossal obsidian dragon guardian",
    environmentDescription: "Obsidian bastion, molten lava falls, ancient gate, and guardian maw threshold",
  },

  // 2. TRANSITION: Dimensional Throat Passage
  {
    type: "TRANSITION",
    id: "THROAT_TRANSITION",
    name: "Dimensional Passage",
    sourceWorld: "DRAGON_FORTRESS_WORLD",
    destinationWorld: "QUANTUM_LAB_WORLD",
    range: [36, 48],
    palette: { primary: "#00e5ff", secondary: "#7c4dff", accent: "#536dfe", fog: "#040408" },
    fogNear: 8,
    fogFar: 45,
    physicalTransformation: "Volcanic space compresses into dimensional conduit with cyan rib arches",
  },

  // 3. WORLD: Quantum Research Laboratory
  // A complete world with a long, spacious experience window (48 -> 76).
  // The user travels naturally through the facility, sees the architecture, workstations,
  // glass computation walls, dome ceiling, and the giant Quantum Computer as a central landmark.
  {
    type: "WORLD",
    id: "QUANTUM_LAB_WORLD",
    name: "Quantum Research Laboratory",
    category: "QUANTUM_ATOMIC",
    range: [48, 76],
    palette: { primary: "#00e5ff", secondary: "#ffd700", accent: "#29b6f6", fog: "#050c18" },
    fogNear: 24,
    fogFar: 130,
    scaleDescription: "Massive 72-meter circular research chamber with central cryogenic quantum computer landmark",
    environmentDescription: "Reflective metallic floor, 18m structural columns, observation decks, telemetry walls, and dome ceiling",
  },

  // 4. TRANSITION: Environmental Scale Shift (Happens AFTER Quantum Lab has been experienced)
  {
    type: "TRANSITION",
    id: "QUANTUM_TO_ATOMIC_TRANSITION",
    name: "Subatomic Scale Transition",
    sourceWorld: "QUANTUM_LAB_WORLD",
    destinationWorld: "ATOMIC_WORLD",
    range: [76, 82],
    palette: { primary: "#00e5ff", secondary: "#7c4dff", accent: "#d500f9", fog: "#030208" },
    fogNear: 10,
    fogFar: 40,
    physicalTransformation: "Lab architecture dims and disappears; scale transforms from macro meters to subatomic angstroms",
  },

  // 5. WORLD: Atomic World
  // A complete separate world (82 -> 94).
  // Monumental subatomic realm with radiant nucleus, s/p/d/f probability shells, and wavefunction cloud.
  {
    type: "WORLD",
    id: "ATOMIC_WORLD",
    name: "Atomic World",
    category: "QUANTUM_ATOMIC",
    range: [82, 94],
    palette: { primary: "#7c4dff", secondary: "#00e5ff", accent: "#ff4081", fog: "#0d061f" },
    fogNear: 14,
    fogFar: 95,
    scaleDescription: "Monumental subatomic realm where quantum wavefunctions, probability shells, and nucleons tower majestically",
    environmentDescription: "Radiant pulsating nucleus, monumental electron probability shells, and harmonic wavefunction cloud",
  },

  // 6. TRANSITION: Molecular / Chemical Complexity Transition (94 -> 104)
  // Dedicated bridge: atoms connect into covalent lattices, peptide chains, and lipid bilayer precursors.
  {
    type: "TRANSITION",
    id: "ATOMIC_TO_CELLULAR_TRANSITION",
    name: "Molecular Synthesis Transition",
    sourceWorld: "ATOMIC_WORLD",
    destinationWorld: "CELLULAR_WORLD",
    range: [94, 104],
    palette: { primary: "#00e5ff", secondary: "#00bfa5", accent: "#7c4dff", fog: "#020813" },
    fogNear: 10,
    fogFar: 50,
    physicalTransformation: "Subatomic particles assemble into covalent bonds, helical molecular chains, and lipid membrane gates",
  },

  // 7. WORLD: Cellular / Life World (104 -> 134)
  // An enormous living biological universe.
  // Colossal cell membrane, vast cytoplasmic streaming, glowing mitochondria energy factories,
  // extensive ER transport networks, Golgi apparatus, and gigantic nucleus harboring the DNA double helix.
  {
    type: "WORLD",
    id: "CELLULAR_WORLD",
    name: "Cellular Life World",
    category: "BIOLOGICAL",
    range: [104, 134],
    palette: { primary: "#00bfa5", secondary: "#0091ea", accent: "#7c4dff", fog: "#020914" },
    fogNear: 20,
    fogFar: 140,
    scaleDescription: "Colossal living biological universe spanning cell membrane, ER networks, mitochondria, and radiant nuclear landmark",
    environmentDescription: "Bioluminescent cytoplasm, massive curved lipid bilayer, glowing mitochondria energy factories, and gigantic nucleus harboring DNA helix",
  },

  // 8. TRANSITION: Biological / Cellular to Ocean Transition (134 -> 146)
  // Continuous physical scaling from cell interior into water molecules, marine snow, and oceanic depth.
  {
    type: "TRANSITION",
    id: "CELLULAR_TO_OCEAN_TRANSITION",
    name: "Biological Aquatic Transition",
    sourceWorld: "CELLULAR_WORLD",
    destinationWorld: "DEEP_OCEAN_WORLD",
    range: [134, 146],
    palette: { primary: "#0091ea", secondary: "#00bfa5", accent: "#00e5ff", fog: "#010915" },
    fogNear: 14,
    fogFar: 70,
    physicalTransformation: "Macromolecules dissolve into aqueous density; scale shifts from cellular nanometers to colossal oceanic pelagic depth",
  },

  // 9. WORLD: Deep Ocean, Transparent Surface & Coastal Land World (146 -> 226)
  // An epic 80-unit underwater-to-land odyssey:
  // - Open pelagic water volume with distant giant leviathan silhouette
  // - Oceanic trench with basalt pillars, sediment cliffs, and canyon drops
  // - Bioluminescent ecosystem: bathypelagic jellyfish, glowing siphonophores, comb jellies
  // - Hydrothermal vent field: towering black smokers, mineral plumes, tube-worm colonies
  // - Abyssal cavern and natural canyon ascent portal
  // - Rapid roller-coaster ascent through transparent water
  // - Looking upward through transparent water at radiant Sun, moving Clouds, and blue Sky
  // - Surface ecosystem: schooling fish, sleek pelagic sharks, colossal blue whales
  // - Continuous surface breakthrough into open-air ocean
  // - Open-air ocean: waves, circling seabirds, sun glitter, distant coastline reveal
  // - Shallow turquoise waters, reefs, breaking surf
  // - Beach arrival: sandy beach, dunes, coastal palms, boulders, driftwood
  // - Natural geological exit: coastal cliff with arched sea cave entrance and cavern passage
  {
    type: "WORLD",
    id: "DEEP_OCEAN_WORLD",
    name: "Deep Ocean & Active Volcano",
    category: "GEOLOGICAL",
    range: [146, 226],
    palette: { primary: "#00e5ff", secondary: "#0077b6", accent: "#ff5500", fog: "#011627" },
    fogNear: 18,
    fogFar: 2200,
    scaleDescription: "Monumental oceanic universe and active stratovolcano rising above the waves",
    environmentDescription: "Abyssal trench, transparent surface breakthrough, open ocean, and colossal active Mount Fuji volcano",
  },

  // 10. TRANSITION: Volcanic Summit Cave Entrance & Cavern Descent (226 -> 238)
  {
    type: "TRANSITION",
    id: "VOLCANO_TO_PREHISTORIC_TRANSITION",
    name: "Volcanic Summit Cave Passage",
    sourceWorld: "DEEP_OCEAN_WORLD",
    destinationWorld: "PREHISTORIC_WORLD",
    range: [226, 238],
    palette: { primary: "#ff6622", secondary: "#4a5a40", accent: "#7ca86b", fog: "#2a2228" },
    fogNear: 25,
    fogFar: 450,
    physicalTransformation: "Ascending the volcanic mountain slope into the visible summit cave portal and descending the volcanic cavern core",
  },

  // 11. WORLD: Prehistoric Earth Continent (238 -> 286)
  {
    type: "WORLD",
    id: "PREHISTORIC_WORLD",
    name: "Prehistoric Earth",
    category: "BIOLOGICAL",
    range: [238, 286],
    palette: { primary: "#4caf50", secondary: "#2e7d32", accent: "#cddc39", fog: "#6d8c72" },
    fogNear: 35,
    fogFar: 1850,
    scaleDescription: "Enormous primeval continent extending deep beyond the volcano with living dinosaurs",
    environmentDescription: "Vast primeval forests, giant tree ferns, cycads, rushing river valley, soaring pterosaurs, and patrolling apex predators",
  },

  // 12. TRANSITION: Via Appia Imperial Road (286 -> 298)
  {
    type: "TRANSITION",
    id: "PREHISTORIC_TO_ROME_TRANSITION",
    name: "Via Appia Imperial Road",
    sourceWorld: "PREHISTORIC_WORLD",
    destinationWorld: "ANCIENT_ROME_WORLD",
    range: [286, 298],
    palette: { primary: "#c29b38", secondary: "#7b1113", accent: "#e6c387", fog: "#a88e6e" },
    fogNear: 25,
    fogFar: 350,
    physicalTransformation: "Primeval rainforest path transitions into ancient paved Roman flagstones, milestones, and monumental city gates",
  },

  // 13. WORLD: Ancient Rome (298 -> 364)
  {
    type: "WORLD",
    id: "ANCIENT_ROME_WORLD",
    name: "Ancient Rome",
    category: "HISTORICAL",
    range: [298, 364],
    palette: { primary: "#c82333", secondary: "#d4af37", accent: "#f5deb3", fog: "#dfba8b" },
    fogNear: 35,
    fogFar: 950,
    scaleDescription: "Monumental Imperial Roman City with bustling marketplace, Colosseum, aqueduct, and Capitoline Temple",
    environmentDescription: "Cobblestone Via Sacra, bustling market stalls, Corinthian colonnades, splashing marble fountain, Roman legionaries, grand staircase ascent, and inner sanctuary chamber",
  },

  // 14. TRANSITION: Imperial Celestial Rift into Cybernetic Space Frontier (364 -> 376)
  {
    type: "TRANSITION",
    id: "ROME_TO_CYBER_TRANSITION",
    name: "Imperial Celestial Rift",
    sourceWorld: "ANCIENT_ROME_WORLD",
    destinationWorld: "CYBERNETIC_SPACE_WORLD",
    range: [364, 376],
    palette: { primary: "#00e5ff", secondary: "#d4af37", accent: "#ff007f", fog: "#070c18" },
    fogNear: 16,
    fogFar: 140,
    physicalTransformation: "Inside the inner temple sanctuary, crossing into the radiant celestial rift and emerging onto the cybernetic spaceport promenade",
  },

  // 15. WORLD: Cybernetic Space Frontier (376 -> 442)
  {
    type: "WORLD",
    id: "CYBERNETIC_SPACE_WORLD",
    name: "Cybernetic Space Frontier",
    category: "COSMIC",
    range: [376, 442],
    palette: { primary: "#00e5ff", secondary: "#ff007f", accent: "#ff9100", fog: "#050b14" },
    fogNear: 40,
    fogFar: 3500,
    scaleDescription: "Monumental Cyberpunk Megacity, Orbital Spaceport, Colossal Planet, and Deep Outer Space",
    environmentDescription: "Reflective neon promenade, DHRUV AI LAB mega-display, cherry blossom terraces, maglev bullet trains, monumental ring gateway, colossal planet, orbital station, and spiral galaxy",
  },

  // 16. TRANSITION: Cosmic Hyperdrive Loop Return (442 -> 450)
  {
    type: "TRANSITION",
    id: "COSMIC_HYPERDRIVE_RETURN",
    name: "Cosmic Hyperdrive Rift",
    sourceWorld: "CYBERNETIC_SPACE_WORLD",
    destinationWorld: "DRAGON_FORTRESS_WORLD",
    range: [442, 450],
    palette: { primary: "#00f0ff", secondary: "#7928ca", accent: "#ffffff", fog: "#02050e" },
    fogNear: 12,
    fogFar: 95,
    physicalTransformation: "Cruising into deep space beyond the orbital station, accelerating into a cosmic hyperdrive vortex looping back to the Mythic Fortress",
  },
];

/**
 * Backwards-compatible DISCOVERY_CHAIN representation
 */
export const DISCOVERY_CHAIN: DiscoveryStageDef[] = JOURNEY_CHAIN.map((seg) => ({
  id: seg.id,
  name: seg.name,
  category: seg.type === "WORLD" ? seg.category : "DIMENSIONAL",
  range: seg.range,
  palette: seg.palette,
  movementType: seg.type === "WORLD" ? seg.scaleDescription : seg.name,
  transformationCause: seg.type === "WORLD" ? seg.environmentDescription : seg.physicalTransformation,
}));

/**
 * Returns the currently active journey segment (World or Transition) for progress 0..LOOP_LENGTH.
 */
export function getActiveJourneySegment(progress: number): JourneySegment {
  const p = positiveModulo(progress, LOOP_LENGTH);
  for (const seg of JOURNEY_CHAIN) {
    if (p >= seg.range[0] && p < seg.range[1]) {
      return seg;
    }
  }
  return JOURNEY_CHAIN[0];
}

/**
 * Returns the active discovery stage for backwards compatibility.
 */
export function getActiveDiscoveryStage(progress: number): DiscoveryStageDef {
  const p = positiveModulo(progress, LOOP_LENGTH);
  for (const stage of DISCOVERY_CHAIN) {
    if (p >= stage.range[0] && p < stage.range[1]) {
      return stage;
    }
  }
  return DISCOVERY_CHAIN[0];
}
