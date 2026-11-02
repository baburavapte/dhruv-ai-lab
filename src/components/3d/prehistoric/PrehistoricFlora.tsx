"use client";

import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { getPrehistoricElevation } from "./PrehistoricTerrain";

/**
 * -----------------------------------------------------------------------------
 * MASTER PROCEDURAL PREHISTORIC FLORA
 * Faithfully recreating the lush primeval vegetation of the Master Reference Image:
 * 1. Prehistoric Cycad / Palm:
 *    - Curved fibrous trunk with rich dark brown bark rings and root flare
 *    - Dual-tiered crown of 28 gracefully arching feather fronds with
 *      multi-segmented leaflets catching the golden Cretaceous sun
 * 2. Giant Tree Fern (Cyathea):
 *    - Slender dark fibrous trunk
 *    - Spreading umbrella canopy of 20 delicate arching lace fronds
 * 3. Stately Araucaria Conifer:
 *    - Columnar trunk with rugged ringed bark
 *    - Tiered drooping boughs with dense fans of dark evergreen foliage
 * 4. Dense Ground Fern Clumps & Ancient Cycad Shrubs:
 *    - Carpeting the foreground overlook bluff around the Triceratops,
 *      riverbanks, and cliff shelves
 * -----------------------------------------------------------------------------
 */

function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let totalVerts = 0;
  geometries.forEach((g) => { totalVerts += g.attributes.position.count; });

  const mergedPos = new Float32Array(totalVerts * 3);
  const mergedNorm = new Float32Array(totalVerts * 3);
  const mergedColors = new Float32Array(totalVerts * 3);
  const mergedIndices: number[] = [];

  let vOffset = 0;
  geometries.forEach((g) => {
    const posArr = g.attributes.position.array;
    const count = g.attributes.position.count;
    mergedPos.set(posArr, vOffset * 3);
    if (g.attributes.normal) {
      mergedNorm.set(g.attributes.normal.array, vOffset * 3);
    }
    if (g.attributes.color) {
      mergedColors.set(g.attributes.color.array, vOffset * 3);
    } else {
      for (let k = 0; k < count; k++) {
        mergedColors[(vOffset + k) * 3 + 0] = 0.20;
        mergedColors[(vOffset + k) * 3 + 1] = 0.44;
        mergedColors[(vOffset + k) * 3 + 2] = 0.12;
      }
    }
    if (g.index) {
      for (let k = 0; k < g.index.array.length; k++) {
        mergedIndices.push(g.index.array[k] + vOffset);
      }
    }
    vOffset += count;
  });

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(mergedPos, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(mergedNorm, 3));
  merged.setAttribute("color", new THREE.BufferAttribute(mergedColors, 3));
  if (mergedIndices.length > 0) {
    merged.setIndex(mergedIndices);
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Procedural Prehistoric Palm / Cycad
 */
function createPrehistoricPalmGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // 1. Curved fibrous trunk (height ~12.5m, sturdy flared base)
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 4.0, 0.3),
    new THREE.Vector3(0.9, 8.2, 0.6),
    new THREE.Vector3(0.7, 12.5, 1.1),
  ]);

  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.82, 12, false);
  const tCount = trunkGeo.attributes.position.count;
  const tColors = new Float32Array(tCount * 3);
  for (let i = 0; i < tCount; i++) {
    const y = trunkGeo.attributes.position.getY(i);
    const ring = Math.sin(y * 5.5) * 0.05;
    // Rich warm fibrous bark tones (golden-brown, umber, terracotta)
    tColors[i * 3 + 0] = 0.42 + ring;
    tColors[i * 3 + 1] = 0.30 + ring * 0.7;
    tColors[i * 3 + 2] = 0.18 + ring * 0.4;
  }
  trunkGeo.setAttribute("color", new THREE.BufferAttribute(tColors, 3));
  geometries.push(trunkGeo);

  // 2. Crown of 28 radiating arching feather fronds
  const crownApex = new THREE.Vector3(0.7, 12.5, 1.1);
  const numFronds = 28;

  for (let i = 0; i < numFronds; i++) {
    const angle = (i / numFronds) * Math.PI * 2;
    const isUpper = i % 2 === 0;
    const frondLen = isUpper ? 7.5 : 8.8;
    const droopPower = isUpper ? 1.7 : 2.1;
    const dropScale = isUpper ? 2.5 : 4.2;

    const frondPoints: THREE.Vector3[] = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10;
      const r = t * frondLen;
      const drop = Math.pow(t, droopPower) * dropScale;
      frondPoints.push(
        new THREE.Vector3(
          crownApex.x + Math.cos(angle) * r,
          crownApex.y + (isUpper ? 1.2 : 0.4) + t * 0.9 - drop,
          crownApex.z + Math.sin(angle) * r
        )
      );
    }

    const frondCurve = new THREE.CatmullRomCurve3(frondPoints);

    // Central rachis stem
    const stemGeo = new THREE.TubeGeometry(frondCurve, 10, 0.09, 4, false);
    const sCount = stemGeo.attributes.position.count;
    const sColors = new Float32Array(sCount * 3);
    for (let k = 0; k < sCount; k++) {
      sColors[k * 3 + 0] = 0.28;
      sColors[k * 3 + 1] = 0.40;
      sColors[k * 3 + 2] = 0.14;
    }
    stemGeo.setAttribute("color", new THREE.BufferAttribute(sColors, 3));
    geometries.push(stemGeo);

    // 16 pairs of cascading feather leaflets along frond
    const numLeafPairs = 16;
    for (let p = 1; p <= numLeafPairs; p++) {
      const t = p / (numLeafPairs + 1);
      const pt = frondCurve.getPoint(t);
      const tangent = frondCurve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const leafLen = (1.0 - Math.pow(t - 0.45, 2.0) * 1.6) * 2.6;
      if (leafLen <= 0.25) continue;

      for (const side of [-1, 1]) {
        const leafGeo = new THREE.BufferGeometry();
        const leafDir = normal.clone().multiplyScalar(side).add(new THREE.Vector3(0, -0.16, 0)).normalize();
        const tipPos = pt.clone().add(leafDir.clone().multiplyScalar(leafLen)).add(tangent.clone().multiplyScalar(0.55));
        const rootPos = pt.clone();
        const widthVec = tangent.clone().multiplyScalar(0.38);

        const v0 = rootPos.clone().sub(widthVec);
        const v1 = rootPos.clone().add(widthVec);
        const v2 = tipPos;

        const verts = new Float32Array([
          v0.x, v0.y, v0.z,
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
        ]);

        // Deep ancient rainforest palm frond colors: rich emerald base to sun-dappled foliage tip
        const colors = new Float32Array([
          0.08, 0.28, 0.06, // Deep rainforest emerald base
          0.14, 0.42, 0.10, // Forest green
          0.26, 0.54, 0.14, // Dappled highlight tip
        ]);

        leafGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        leafGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        leafGeo.setIndex([0, 1, 2]);
        leafGeo.computeVertexNormals();
        geometries.push(leafGeo);
      }
    }
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Giant Tree Fern (Cyathea)
 */
function createTreeFernGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // Sturdy natural tree fern trunk with flared base
  const trunkGeo = new THREE.CylinderGeometry(0.45, 0.95, 10.0, 10);
  trunkGeo.translate(0, 5.0, 0);

  const tCount = trunkGeo.attributes.position.count;
  const tColors = new Float32Array(tCount * 3);
  for (let i = 0; i < tCount; i++) {
    // Warm reddish-brown fibrous trunk bark
    tColors[i * 3 + 0] = 0.40;
    tColors[i * 3 + 1] = 0.28;
    tColors[i * 3 + 2] = 0.16;
  }
  trunkGeo.setAttribute("color", new THREE.BufferAttribute(tColors, 3));
  geometries.push(trunkGeo);

  const numFronds = 22;
  for (let i = 0; i < numFronds; i++) {
    const angle = (i / numFronds) * Math.PI * 2;
    const frondLen = 6.6;

    const frondPoints: THREE.Vector3[] = [];
    for (let j = 0; j <= 8; j++) {
      const t = j / 8;
      const r = t * frondLen;
      const drop = Math.pow(t, 2.0) * 2.8;
      frondPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          10.0 + t * 0.8 - drop,
          Math.sin(angle) * r
        )
      );
    }

    const frondCurve = new THREE.CatmullRomCurve3(frondPoints);
    const stemGeo = new THREE.TubeGeometry(frondCurve, 8, 0.07, 4, false);
    const sCount = stemGeo.attributes.position.count;
    const sColors = new Float32Array(sCount * 3);
    for (let k = 0; k < sCount; k++) {
      sColors[k * 3 + 0] = 0.28;
      sColors[k * 3 + 1] = 0.44;
      sColors[k * 3 + 2] = 0.14;
    }
    stemGeo.setAttribute("color", new THREE.BufferAttribute(sColors, 3));
    geometries.push(stemGeo);

    for (let p = 1; p <= 12; p++) {
      const t = p / 13;
      const pt = frondCurve.getPoint(t);
      const tangent = frondCurve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const bladeLen = (1.0 - Math.pow(t - 0.4, 2.0) * 1.8) * 2.1;
      if (bladeLen <= 0.18) continue;

      for (const side of [-1, 1]) {
        const bladeGeo = new THREE.BufferGeometry();
        const tipPos = pt.clone().add(normal.clone().multiplyScalar(side * bladeLen)).add(tangent.clone().multiplyScalar(0.35));
        const widthVec = tangent.clone().multiplyScalar(0.32);

        const v0 = pt.clone().sub(widthVec);
        const v1 = pt.clone().add(widthVec);
        const v2 = tipPos;

        const verts = new Float32Array([
          v0.x, v0.y, v0.z,
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
        ]);

        const colors = new Float32Array([
          0.08, 0.28, 0.06,
          0.14, 0.40, 0.10,
          0.24, 0.52, 0.12,
        ]);

        bladeGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
        bladeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        bladeGeo.setIndex([0, 1, 2]);
        bladeGeo.computeVertexNormals();
        geometries.push(bladeGeo);
      }
    }
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Realistic Araucaria Conifer
 */
function createRealisticConiferGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  const trunkGeo = new THREE.CylinderGeometry(0.65, 1.65, 26.0, 12);
  trunkGeo.translate(0, 13.0, 0);

  const tCount = trunkGeo.attributes.position.count;
  const tColors = new Float32Array(tCount * 3);
  for (let i = 0; i < tCount; i++) {
    // Rich textured warm conifer bark
    tColors[i * 3 + 0] = 0.38;
    tColors[i * 3 + 1] = 0.28;
    tColors[i * 3 + 2] = 0.18;
  }
  trunkGeo.setAttribute("color", new THREE.BufferAttribute(tColors, 3));
  geometries.push(trunkGeo);

  const tiers = [
    { y: 6.5, boughCount: 6, length: 6.6, dip: 1.2 },
    { y: 10.2, boughCount: 6, length: 5.6, dip: 1.0 },
    { y: 13.8, boughCount: 5, length: 4.8, dip: 0.8 },
    { y: 17.2, boughCount: 5, length: 3.8, dip: 0.6 },
    { y: 20.0, boughCount: 4, length: 2.8, dip: 0.4 },
    { y: 22.5, boughCount: 3, length: 1.8, dip: 0.25 },
  ];

  tiers.forEach((tier, tIdx) => {
    for (let b = 0; b < tier.boughCount; b++) {
      const angle = (b / tier.boughCount) * Math.PI * 2 + (tIdx * 0.55);
      const boughCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, tier.y, 0),
        new THREE.Vector3(
          Math.cos(angle) * tier.length * 0.5,
          tier.y + 0.35,
          Math.sin(angle) * tier.length * 0.5
        ),
        new THREE.Vector3(
          Math.cos(angle) * tier.length,
          tier.y - tier.dip,
          Math.sin(angle) * tier.length
        ),
      ]);

      const boughGeo = new THREE.TubeGeometry(boughCurve, 8, 0.10, 4, false);
      const bCount = boughGeo.attributes.position.count;
      const bColors = new Float32Array(bCount * 3);
      for (let k = 0; k < bCount; k++) {
        bColors[k * 3 + 0] = 0.22;
        bColors[k * 3 + 1] = 0.18;
        bColors[k * 3 + 2] = 0.12;
      }
      boughGeo.setAttribute("color", new THREE.BufferAttribute(bColors, 3));
      geometries.push(boughGeo);

      for (let s = 1; s <= 5; s++) {
        const u = s / 6;
        const pt = boughCurve.getPoint(u);
        const w = (1.0 - u * 0.4) * 1.6;

        const leafShape = new THREE.BufferGeometry();
        const v0 = new THREE.Vector3(pt.x - Math.sin(angle) * w, pt.y - 0.12, pt.z + Math.cos(angle) * w);
        const v1 = new THREE.Vector3(pt.x + Math.sin(angle) * w, pt.y - 0.12, pt.z - Math.cos(angle) * w);
        const v2 = new THREE.Vector3(pt.x + Math.cos(angle) * 1.8, pt.y - 0.35, pt.z + Math.sin(angle) * 1.8);

        leafShape.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([
              v0.x, v0.y, v0.z,
              v1.x, v1.y, v1.z,
              v2.x, v2.y, v2.z,
            ]),
            3
          )
        );
        leafShape.setAttribute(
          "color",
          new THREE.BufferAttribute(
            new Float32Array([
              0.10, 0.34, 0.12,
              0.12, 0.38, 0.14,
              0.28, 0.54, 0.18,
            ]),
            3
          )
        );
        leafShape.setIndex([0, 1, 2]);
        leafShape.computeVertexNormals();
        geometries.push(leafShape);
      }
    }
  });

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Ground Fern Clump
 */
function createGroundFernClumpGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const numFronds = 16;

  for (let i = 0; i < numFronds; i++) {
    const angle = (i / numFronds) * Math.PI * 2;
    const length = 2.4 + (i % 3) * 0.5;
    const droop = 0.65 + (i % 2) * 0.3;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(
        Math.cos(angle) * length * 0.45,
        0.7 + (i % 2) * 0.25,
        Math.sin(angle) * length * 0.45
      ),
      new THREE.Vector3(
        Math.cos(angle) * length,
        0.2 - droop,
        Math.sin(angle) * length
      ),
    ]);

    const tube = new THREE.TubeGeometry(curve, 6, 0.05, 4, false);
    const count = tube.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      colors[k * 3 + 0] = 0.24;
      colors[k * 3 + 1] = 0.46;
      colors[k * 3 + 2] = 0.12;
    }
    tube.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometries.push(tube);

    const blade = new THREE.BufferGeometry();
    const pMid = curve.getPoint(0.45);
    const pTip = curve.getPoint(1.0);
    const width = 0.85;
    const tangent = curve.getTangent(0.45);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    const v0 = pMid.clone().sub(normal.clone().multiplyScalar(width * 0.5));
    const v1 = pMid.clone().add(normal.clone().multiplyScalar(width * 0.5));
    const v2 = pTip;

    blade.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          v0.x, v0.y, v0.z,
          v1.x, v1.y, v1.z,
          v2.x, v2.y, v2.z,
        ]),
        3
      )
    );
    blade.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array([
          0.08, 0.30, 0.06,
          0.14, 0.42, 0.10,
          0.25, 0.54, 0.12,
        ]),
        3
      )
    );
    blade.setIndex([0, 1, 2]);
    blade.computeVertexNormals();
    geometries.push(blade);
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Giant Mossy Canopy Bough & Arching Trunk
 * Recreates the iconic moss-covered horizontal branch from the Reference Image:
 * Thick curving limb spanning across the midground with moss pads, hanging roots & fern tufts
 */
function createMossyCanopyBranchGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // 1. Massive arching trunk bough spanning X: -32 to +14, Y: 13 to 17, Z: -1134 to -1144
  const branchCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-34.0, 11.5, -1132.0),
    new THREE.Vector3(-22.0, 14.8, -1136.0),
    new THREE.Vector3(-8.0, 16.2, -1140.0),
    new THREE.Vector3(6.0, 15.0, -1143.0),
    new THREE.Vector3(18.0, 12.8, -1146.0),
  ]);

  const branchGeo = new THREE.TubeGeometry(branchCurve, 32, 1.45, 12, false);
  const bCount = branchGeo.attributes.position.count;
  const bColors = new Float32Array(bCount * 3);
  for (let i = 0; i < bCount; i++) {
    const ny = branchGeo.attributes.normal.getY(i);
    // Upper half of branch is carpeted in thick velvety emerald moss (like the reference!)
    const moss = Math.max(0.0, Math.min(1.0, (ny + 0.1) / 0.8));
    bColors[i * 3 + 0] = THREE.MathUtils.lerp(0.24, 0.12, moss);
    bColors[i * 3 + 1] = THREE.MathUtils.lerp(0.18, 0.42, moss);
    bColors[i * 3 + 2] = THREE.MathUtils.lerp(0.12, 0.10, moss);
  }
  branchGeo.setAttribute("color", new THREE.BufferAttribute(bColors, 3));
  geometries.push(branchGeo);

  // 2. Secondary arching branch fork
  const forkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14.0, 15.6, -1138.0),
    new THREE.Vector3(-8.0, 18.2, -1132.0),
    new THREE.Vector3(-1.0, 19.5, -1128.0),
  ]);
  const forkGeo = new THREE.TubeGeometry(forkCurve, 16, 0.95, 10, false);
  const fCount = forkGeo.attributes.position.count;
  const fColors = new Float32Array(fCount * 3);
  for (let i = 0; i < fCount; i++) {
    const ny = forkGeo.attributes.normal.getY(i);
    const moss = Math.max(0.0, Math.min(1.0, (ny + 0.1) / 0.8));
    fColors[i * 3 + 0] = THREE.MathUtils.lerp(0.24, 0.12, moss);
    fColors[i * 3 + 1] = THREE.MathUtils.lerp(0.18, 0.42, moss);
    fColors[i * 3 + 2] = THREE.MathUtils.lerp(0.12, 0.10, moss);
  }
  forkGeo.setAttribute("color", new THREE.BufferAttribute(fColors, 3));
  geometries.push(forkGeo);

  // 3. Hanging aerial roots & lianas dangling from the branch
  for (let r = 0; r < 14; r++) {
    const t = 0.15 + (r / 14) * 0.70;
    const pt = branchCurve.getPoint(t);
    const dropLen = 4.5 + (r % 4) * 2.2;
    const vineCurve = new THREE.CatmullRomCurve3([
      pt,
      new THREE.Vector3(pt.x + Math.sin(r * 1.7) * 0.5, pt.y - dropLen * 0.5, pt.z + Math.cos(r * 1.7) * 0.5),
      new THREE.Vector3(pt.x + Math.sin(r * 2.3) * 0.8, pt.y - dropLen, pt.z + Math.cos(r * 2.3) * 0.8),
    ]);
    const vineTube = new THREE.TubeGeometry(vineCurve, 8, 0.08, 4, false);
    const vCount = vineTube.attributes.position.count;
    const vColors = new Float32Array(vCount * 3);
    for (let k = 0; k < vCount; k++) {
      vColors[k * 3 + 0] = 0.20;
      vColors[k * 3 + 1] = 0.26;
      vColors[k * 3 + 2] = 0.14;
    }
    vineTube.setAttribute("color", new THREE.BufferAttribute(vColors, 3));
    geometries.push(vineTube);
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Exotic Prehistoric Fan Cycad (Avatar / Primeval signature plant from Reference Image)
 * Semicircular fan of radiating slender teal ribs with golden-ochre seed pod / sporophyll tips
 */
function createExoticFanCycadGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const numRibs = 18;

  for (let i = 0; i < numRibs; i++) {
    const angle = (i / (numRibs - 1) - 0.5) * Math.PI * 0.75;
    const ribLen = 3.2 + Math.cos(angle * 1.5) * 1.1;

    // Rib curve arching upward & outward in a majestic fan
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.sin(angle) * ribLen * 0.45, ribLen * 0.55, Math.cos(angle) * ribLen * 0.25),
      new THREE.Vector3(Math.sin(angle) * ribLen, ribLen * 0.92, Math.cos(angle) * ribLen * 0.45),
    ]);

    const ribGeo = new THREE.TubeGeometry(curve, 10, 0.05, 4, false);
    const rCount = ribGeo.attributes.position.count;
    const rColors = new Float32Array(rCount * 3);
    for (let k = 0; k < rCount; k++) {
      // Striking teal-cyan / blue-green ribs matching the reference image!
      rColors[k * 3 + 0] = 0.10;
      rColors[k * 3 + 1] = 0.38;
      rColors[k * 3 + 2] = 0.42;
    }
    ribGeo.setAttribute("color", new THREE.BufferAttribute(rColors, 3));
    geometries.push(ribGeo);

    // Golden-ochre oval seed pod / sporophyll at the tip of each rib
    const tip = curve.getPoint(1.0);
    const podGeo = new THREE.SphereGeometry(0.24, 8, 8);
    podGeo.scale(0.8, 1.8, 0.8);
    podGeo.translate(tip.x, tip.y + 0.2, tip.z);
    const pCount = podGeo.attributes.position.count;
    const pColors = new Float32Array(pCount * 3);
    for (let k = 0; k < pCount; k++) {
      // Glowing golden-ochre tip
      pColors[k * 3 + 0] = 0.82;
      pColors[k * 3 + 1] = 0.62;
      pColors[k * 3 + 2] = 0.18;
    }
    podGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    geometries.push(podGeo);
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Giant Rainforest Shelf Bracket Fungus
 * Translucent tiered shelf mushrooms attached to massive trunks (like in reference image!)
 */
function createGiantShelfFungusGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const shelves = [
    { r: 4.8, y: 0.0, tilt: 0.12 },
    { r: 3.6, y: 1.4, tilt: 0.08 },
    { r: 2.4, y: 2.6, tilt: 0.05 },
  ];

  shelves.forEach((s) => {
    const geo = new THREE.CylinderGeometry(s.r, s.r * 1.08, 0.45, 18, 2, false, 0, Math.PI * 0.75);
    geo.rotateZ(s.tilt);
    geo.translate(s.r * 0.75, s.y, 0);

    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = geo.attributes.position.getY(i);
      // Soft glowing translucent cream/pinkish-ochre bracket fungus tones
      colors[i * 3 + 0] = 0.84;
      colors[i * 3 + 1] = 0.76;
      colors[i * 3 + 2] = 0.68;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometries.push(geo);
  });

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Hanging Rainforest Lianas & Aerial Canopy Vines
 */
function createHangingLianasGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const numVines = 16;

  for (let i = 0; i < numVines; i++) {
    const angle = (i / numVines) * Math.PI * 2;
    const rad = 2.5 + (i % 4) * 1.2;
    const x0 = Math.cos(angle) * rad;
    const z0 = Math.sin(angle) * rad;
    const len = 14.0 + (i % 5) * 4.0;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x0, 0, z0),
      new THREE.Vector3(x0 + Math.sin(i * 1.8) * 0.8, -len * 0.35, z0 + Math.cos(i * 1.8) * 0.8),
      new THREE.Vector3(x0 + Math.sin(i * 2.5) * 1.2, -len * 0.70, z0 + Math.cos(i * 2.5) * 1.2),
      new THREE.Vector3(x0 + Math.sin(i * 3.1) * 0.6, -len, z0 + Math.cos(i * 3.1) * 0.6),
    ]);

    const vine = new THREE.TubeGeometry(curve, 10, 0.08, 4, false);
    const count = vine.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let k = 0; k < count; k++) {
      colors[k * 3 + 0] = 0.18;
      colors[k * 3 + 1] = 0.28;
      colors[k * 3 + 2] = 0.14;
    }
    vine.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometries.push(vine);
  }

  return mergeBufferGeometries(geometries);
}

/**
 * Procedural Giant Primeval Rainforest Tree
 */
function createGiantJungleTreeGeometry(): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];

  // 1. Columnar trunk with flared buttress base
  const trunkGeo = new THREE.CylinderGeometry(1.2, 2.6, 22.0, 12);
  trunkGeo.translate(0, 11.0, 0);

  const tCount = trunkGeo.attributes.position.count;
  const tColors = new Float32Array(tCount * 3);
  for (let i = 0; i < tCount; i++) {
    const y = trunkGeo.attributes.position.getY(i);
    const moss = y < 5.0 ? 0.12 : 0.0;
    tColors[i * 3 + 0] = 0.40 - moss;
    tColors[i * 3 + 1] = 0.30 + moss * 0.8;
    tColors[i * 3 + 2] = 0.20 - moss * 0.5;
  }
  trunkGeo.setAttribute("color", new THREE.BufferAttribute(tColors, 3));
  geometries.push(trunkGeo);

  // 4 Buttress root flanges
  for (let r = 0; r < 4; r++) {
    const rAngle = (r / 4) * Math.PI * 2;
    const flangeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(rAngle) * 4.2, 0, Math.sin(rAngle) * 4.2),
      new THREE.Vector3(Math.cos(rAngle) * 2.8, 2.5, Math.sin(rAngle) * 2.8),
      new THREE.Vector3(Math.cos(rAngle) * 1.6, 6.0, Math.sin(rAngle) * 1.6),
    ]);
    const flangeGeo = new THREE.TubeGeometry(flangeCurve, 6, 0.45, 6, false);
    const fCount = flangeGeo.attributes.position.count;
    const fColors = new Float32Array(fCount * 3);
    for (let k = 0; k < fCount; k++) {
      fColors[k * 3 + 0] = 0.36;
      fColors[k * 3 + 1] = 0.32;
      fColors[k * 3 + 2] = 0.18;
    }
    flangeGeo.setAttribute("color", new THREE.BufferAttribute(fColors, 3));
    geometries.push(flangeGeo);
  }

  // 2. Spreading umbrella boughs & leafy canopy domes
  const boughLevels = [
    { y: 16.0, count: 5, spread: 7.5, size: 4.8 },
    { y: 19.5, count: 5, spread: 6.5, size: 4.4 },
    { y: 22.5, count: 4, spread: 5.0, size: 3.8 },
    { y: 24.5, count: 1, spread: 0.0, size: 5.5 },
  ];

  boughLevels.forEach((level, lIdx) => {
    for (let b = 0; b < level.count; b++) {
      const angle = (b / level.count) * Math.PI * 2 + lIdx * 0.6;
      const bx = Math.cos(angle) * level.spread;
      const bz = Math.sin(angle) * level.spread;

      // Canopy foliage dome
      const canopyGeo = new THREE.DodecahedronGeometry(level.size, 1);
      canopyGeo.scale(1.4, 0.55, 1.3);
      canopyGeo.translate(bx, level.y, bz);

      const cCount = canopyGeo.attributes.position.count;
      const cColors = new Float32Array(cCount * 3);
      for (let k = 0; k < cCount; k++) {
        cColors[k * 3 + 0] = 0.09 + (k % 3) * 0.04;
        cColors[k * 3 + 1] = 0.32 + (k % 4) * 0.05;
        cColors[k * 3 + 2] = 0.07 + (k % 3) * 0.02;
      }
      canopyGeo.setAttribute("color", new THREE.BufferAttribute(cColors, 3));
      geometries.push(canopyGeo);
    }
  });

  return mergeBufferGeometries(geometries);
}

export default function PrehistoricFlora() {
  const palmMeshRef = useRef<THREE.InstancedMesh>(null);
  const treeFernMeshRef = useRef<THREE.InstancedMesh>(null);
  const coniferMeshRef = useRef<THREE.InstancedMesh>(null);
  const giantTreeMeshRef = useRef<THREE.InstancedMesh>(null);
  const groundFernMeshRef = useRef<THREE.InstancedMesh>(null);
  const exoticFanMeshRef = useRef<THREE.InstancedMesh>(null);
  const shelfFungusMeshRef = useRef<THREE.InstancedMesh>(null);
  const lianasMeshRef = useRef<THREE.InstancedMesh>(null);

  const numPalms = 95;
  const numTreeFerns = 100;
  const numConifers = 60;
  const numGiantTrees = 65;
  const numGroundFerns = 280;
  const numExoticFans = 32;
  const numShelfFungi = 24;
  const numLianas = 48;

  const botanicalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.52,
      metalness: 0.02,
      side: THREE.DoubleSide,
      fog: true,
    });
  }, []);

  const fungusMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.04,
      emissive: new THREE.Color("#2a2014"),
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
      fog: true,
    });
  }, []);

  const palmGeo = useMemo(() => createPrehistoricPalmGeometry(), []);
  const treeFernGeo = useMemo(() => createTreeFernGeometry(), []);
  const coniferGeo = useMemo(() => createRealisticConiferGeometry(), []);
  const giantTreeGeo = useMemo(() => createGiantJungleTreeGeometry(), []);
  const groundFernGeo = useMemo(() => createGroundFernClumpGeometry(), []);
  const mossyBranchGeo = useMemo(() => createMossyCanopyBranchGeometry(), []);
  const exoticFanGeo = useMemo(() => createExoticFanCycadGeometry(), []);
  const shelfFungusGeo = useMemo(() => createGiantShelfFungusGeometry(), []);
  const lianasGeo = useMemo(() => createHangingLianasGeometry(), []);

  const getCameraPathX = (z: number): number => {
    if (z > -1030) return 20.0;
    else if (z > -1115) return 8.0;
    else if (z > -1250) return 6.0;
    else if (z > -1400) return 4.0;
    return 0.0;
  };

  const ensureClearance = (x: number, z: number, minDist = 8.0): number => {
    // Keep clear on Hero Triceratops overlook ledge so dinosaur is never obscured
    if (z > -1145 && z < -1124 && x > -22.0 && x < -10.0) {
      return -25.0;
    }
    // Keep clear in front of right hero waterfall so cascades are completely unveiled
    if (z > -1195 && z < -1155 && x > 25.0 && x < 55.0) {
      return 62.0;
    }
    const camX = getCameraPathX(z);
    const diff = x - camX;
    if (Math.abs(diff) < minDist) {
      return camX + (diff >= 0 ? minDist : -minDist);
    }
    return x;
  };

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Prehistoric Palms & Cycads
    if (palmMeshRef.current) {
      let count = 0;
      dummy.position.set(-23.5, 9.2, -1138.0);
      dummy.rotation.set(0.12, 0.5, -0.08);
      dummy.scale.set(1.4, 1.4, 1.4);
      dummy.updateMatrix();
      palmMeshRef.current.setMatrixAt(count++, dummy.matrix);

      dummy.position.set(-13.0, 7.8, -1122.0);
      dummy.rotation.set(-0.08, 1.2, 0.10);
      dummy.scale.set(1.15, 1.15, 1.15);
      dummy.updateMatrix();
      palmMeshRef.current.setMatrixAt(count++, dummy.matrix);

      for (let i = 2; i < numPalms; i++) {
        const z = -1134 - (i / numPalms) * 540 + Math.sin(i * 1.9) * 16.0;
        const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;
        const side = i % 2 === 0 ? 1 : -1;
        let x = riverX + side * (22.0 + (i % 6) * 5.0);
        x = ensureClearance(x, z, 8.5);
        const y = getPrehistoricElevation(x, z);

        const scale = 0.92 + (i % 5) * 0.16;
        dummy.position.set(x, y - 0.4, z);
        dummy.rotation.set(0, (i * 1.7) % (Math.PI * 2), Math.sin(i) * 0.06);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        palmMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      palmMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Tree Ferns
    if (treeFernMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numTreeFerns; i++) {
        const z = -1134 - (i / numTreeFerns) * 550 + Math.cos(i * 2.1) * 14.0;
        const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;
        const side = i % 3 === 0 ? 1 : -1;
        let x = riverX + side * (20.0 + (i % 5) * 4.5);
        x = ensureClearance(x, z, 8.0);
        const y = getPrehistoricElevation(x, z);

        const scale = 0.94 + (i % 4) * 0.16;
        dummy.position.set(x, y - 0.35, z);
        dummy.rotation.set(0, (i * 2.1) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        treeFernMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      treeFernMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Colossal Primeval Rainforest Trees
    if (giantTreeMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numGiantTrees; i++) {
        const z = -1130.0 - (i / numGiantTrees) * 550.0 + Math.sin(i * 2.3) * 15.0;
        const side = i % 2 === 0 ? 1 : -1;
        const dist = 32.0 + (i % 5) * 7.5;
        let x = side * dist;
        x = ensureClearance(x, z, 10.0);
        const y = getPrehistoricElevation(x, z);

        const scale = 1.05 + (i % 4) * 0.22;
        dummy.position.set(x, y - 0.6, z);
        dummy.rotation.set(0, (i * 1.8) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        giantTreeMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      giantTreeMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Stately Araucarias (High canyon shelves & mountain ridges)
    if (coniferMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numConifers; i++) {
        const z = -1140 - (i / numConifers) * 560 + Math.sin(i * 2.5) * 18.0;
        const side = i % 2 === 0 ? 1 : -1;
        const cliffDist = 55.0 + (i % 5) * 8.0;
        let x = side * cliffDist;
        x = ensureClearance(x, z, 9.0);
        const y = getPrehistoricElevation(x, z);

        const scale = 0.96 + (i % 4) * 0.20;
        dummy.position.set(x, y - 0.5, z);
        dummy.rotation.set(0, (i * 1.5) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        coniferMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      coniferMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 5. Exotic Fan Cycads (Avatar / Primeval signature plants)
    if (exoticFanMeshRef.current) {
      let count = 0;
      // Foreground framing fan plant (directly matching reference image lower-left!)
      dummy.position.set(-6.5, 7.2, -1116.0);
      dummy.rotation.set(0.15, 0.45, -0.10);
      dummy.scale.set(1.4, 1.4, 1.4);
      dummy.updateMatrix();
      exoticFanMeshRef.current.setMatrixAt(count++, dummy.matrix);

      // Along the mossy branch & bluff
      dummy.position.set(-16.0, 14.2, -1136.0);
      dummy.rotation.set(-0.10, 0.9, 0.20);
      dummy.scale.set(1.1, 1.1, 1.1);
      dummy.updateMatrix();
      exoticFanMeshRef.current.setMatrixAt(count++, dummy.matrix);

      for (let i = 2; i < numExoticFans; i++) {
        const z = -1120.0 - (i / numExoticFans) * 500.0 + Math.sin(i * 1.7) * 12.0;
        const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;
        const side = i % 2 === 0 ? -1 : 1;
        let x = riverX + side * (14.0 + (i % 4) * 3.5);
        x = ensureClearance(x, z, 7.5);
        const y = getPrehistoricElevation(x, z);

        const scale = 0.95 + (i % 3) * 0.20;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, (i * 2.3) % (Math.PI * 2), Math.sin(i) * 0.1);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        exoticFanMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      exoticFanMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 6. Giant Shelf Bracket Fungi on Tree Trunks
    if (shelfFungusMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numShelfFungi; i++) {
        const z = -1132.0 - (i / numShelfFungi) * 520.0;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (32.0 + (i % 4) * 6.0);
        const y = getPrehistoricElevation(x, z) + 6.0 + (i % 3) * 4.5;

        const scale = 0.90 + (i % 3) * 0.25;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, (i * 1.4) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        shelfFungusMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      shelfFungusMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 7. Hanging Lianas & Canopy Aerial Vines
    if (lianasMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numLianas; i++) {
        const z = -1128.0 - (i / numLianas) * 540.0 + Math.sin(i * 1.5) * 12.0;
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (26.0 + (i % 5) * 6.5);
        const y = getPrehistoricElevation(x, z) + 18.0 + (i % 3) * 4.0;

        const scale = 0.95 + (i % 3) * 0.20;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, (i * 1.9) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        lianasMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      lianasMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 8. Ground Fern Clumps (Dense foreground carpeting & riverbank greenery)
    if (groundFernMeshRef.current) {
      let count = 0;
      for (let i = 0; i < numGroundFerns; i++) {
        let x: number, z: number, y: number;

        if (i < 100) {
          // Foreground bluff surrounding Triceratops & framing camera
          x = -6.0 - (i % 12) * 2.2 - Math.sin(i * 1.4) * 1.2;
          z = -1116.0 - Math.floor(i / 12) * 3.2 + Math.cos(i * 1.8) * 0.9;
          y = getPrehistoricElevation(x, z);
        } else if (i < 180) {
          // Riverbanks along the turquoise shallows
          const t = (i - 100) / 80;
          z = -1122.0 - t * 460.0;
          const riverX = Math.sin((z + 1100) * 0.012) * 18.0 + Math.cos((z + 1250) * 0.020) * 10.0;
          const side = i % 2 === 0 ? 1 : -1;
          x = riverX + side * (15.5 + (i % 5) * 2.2);
          y = getPrehistoricElevation(x, z);
        } else {
          // Canyon ledges & boulder crevices
          const t = (i - 180) / 100;
          z = -1130.0 - t * 490.0;
          const side = i % 2 === 0 ? 1 : -1;
          x = side * (30.0 + (i % 6) * 5.0);
          y = getPrehistoricElevation(x, z);
        }

        const scale = 0.92 + (i % 4) * 0.25;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, (i * 2.4) % (Math.PI * 2), 0);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        groundFernMeshRef.current.setMatrixAt(count++, dummy.matrix);
      }
      groundFernMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group name="prehistoric-flora-instanced">
      {/* Signature Mossy Canopy Branch spanning the midground (Reference Image) */}
      <mesh geometry={mossyBranchGeo} material={botanicalMaterial} castShadow receiveShadow />

      {/* Palms & Cycads */}
      <instancedMesh
        ref={palmMeshRef}
        args={[palmGeo, botanicalMaterial, numPalms]}
        castShadow
        receiveShadow
      />

      {/* Tree Ferns */}
      <instancedMesh
        ref={treeFernMeshRef}
        args={[treeFernGeo, botanicalMaterial, numTreeFerns]}
        castShadow
        receiveShadow
      />

      {/* Colossal Primeval Rainforest Trees */}
      <instancedMesh
        ref={giantTreeMeshRef}
        args={[giantTreeGeo, botanicalMaterial, numGiantTrees]}
        castShadow
        receiveShadow
      />

      {/* Stately Araucaria Conifers */}
      <instancedMesh
        ref={coniferMeshRef}
        args={[coniferGeo, botanicalMaterial, numConifers]}
        castShadow
        receiveShadow
      />

      {/* Exotic Fan Cycads with Cyan Ribs & Golden Pods */}
      <instancedMesh
        ref={exoticFanMeshRef}
        args={[exoticFanGeo, botanicalMaterial, numExoticFans]}
        castShadow
        receiveShadow
      />

      {/* Giant Tree Shelf Bracket Fungi */}
      <instancedMesh
        ref={shelfFungusMeshRef}
        args={[shelfFungusGeo, fungusMaterial, numShelfFungi]}
        castShadow
        receiveShadow
      />

      {/* Hanging Lianas & Aerial Vines */}
      <instancedMesh
        ref={lianasMeshRef}
        args={[lianasGeo, botanicalMaterial, numLianas]}
        castShadow
        receiveShadow
      />

      {/* Dense Carpet of Ground Ferns */}
      <instancedMesh
        ref={groundFernMeshRef}
        args={[groundFernGeo, botanicalMaterial, numGroundFerns]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
