import * as THREE from 'three';
import { createForestGroundPBR, createMedievalWoodPBR, createCastleStonePBR } from '../utils/pbrTextures';

export interface FireflyData {
  mesh: THREE.Mesh;
  baseX: number;
  baseZ: number;
  baseY: number;
  speed: number;
  phase: number;
}

export interface MushroomLightData {
  light: THREE.PointLight;
  baseIntensity: number;
  speed: number;
  phase: number;
}

export interface ForestClearingBuildResult {
  group: THREE.Group;
  fireflies: FireflyData[];
  mushroomLights: MushroomLightData[];
  mistMesh: THREE.Mesh;
}

export function buildForestClearing3D(): ForestClearingBuildResult {
  const forestGroup = new THREE.Group();
  forestGroup.name = 'ForestClearing';

  const fireflies: FireflyData[] = [];
  const mushroomLights: MushroomLightData[] = [];

  // 1. PBR Ground Material
  const forestGroundPBR = createForestGroundPBR();
  const woodPBR = createMedievalWoodPBR();
  const stonePBR = createCastleStonePBR();

  const groundMat = new THREE.MeshStandardMaterial({
    map: forestGroundPBR.map,
    roughnessMap: forestGroundPBR.roughnessMap,
    bumpMap: forestGroundPBR.bumpMap,
    bumpScale: 0.085,
    roughness: 0.72,
    metalness: 0.05,
  });

  // Mossy Rock Material
  const rockMat = new THREE.MeshStandardMaterial({
    map: stonePBR.map,
    roughnessMap: stonePBR.roughnessMap,
    bumpMap: stonePBR.bumpMap,
    bumpScale: 0.08,
    color: 0x61705c,
    roughness: 0.85,
    metalness: 0.05,
  });

  // Weathered Bark / Deadwood Material
  const barkMat = new THREE.MeshStandardMaterial({
    map: woodPBR.map,
    roughnessMap: woodPBR.roughnessMap,
    bumpMap: woodPBR.bumpMap,
    bumpScale: 0.07,
    color: 0x55402a,
    roughness: 0.88,
  });

  // Stump Top Ring Material
  const stumpRingMat = new THREE.MeshStandardMaterial({
    color: 0x60472d,
    roughness: 0.8,
  });

  // Deep Forest Moss Cap Material
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x49713a,
    roughness: 0.95,
  });

  // 2. Continuous Forest Floor (Ground only, optimized subdivision for mobile)
  const groundGeo = new THREE.PlaneGeometry(70, 70, 16, 16);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  forestGroup.add(groundMesh);

  // A distant tree line frames the playable clearing without obscuring approaching enemies.
  const treeCount = 24;
  const treeTrunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 1, 6);
  const treeTrunks = new THREE.InstancedMesh(treeTrunkGeo, barkMat, treeCount);
  const canopyLayers = [
    { material: new THREE.MeshStandardMaterial({ color: 0x35513a, roughness: 1 }), radius: 1.75, height: 2.5, center: 0.6 },
    { material: new THREE.MeshStandardMaterial({ color: 0x466943, roughness: 1 }), radius: 1.35, height: 2.2, center: 0.83 },
    { material: new THREE.MeshStandardMaterial({ color: 0x5c7b4b, roughness: 1 }), radius: 0.95, height: 1.8, center: 1.05 },
  ].map(layer => ({
    ...layer,
    mesh: new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), layer.material, treeCount),
  }));
  const treeTransform = new THREE.Object3D();

  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + (i % 2) * 0.08;
    const distance = 23.5 + (i % 3) * 1.3;
    const size = 0.88 + ((i * 7) % 5) * 0.09;
    const trunkHeight = 3.7 * size;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    treeTransform.position.set(x, trunkHeight / 2, z);
    treeTransform.scale.set(size, trunkHeight, size);
    treeTransform.updateMatrix();
    treeTrunks.setMatrixAt(i, treeTransform.matrix);

    canopyLayers.forEach(layer => {
      treeTransform.position.set(x, trunkHeight * layer.center, z);
      treeTransform.scale.set(size * layer.radius, size * layer.height, size * layer.radius);
      treeTransform.updateMatrix();
      layer.mesh.setMatrixAt(i, treeTransform.matrix);
    });
  }

  treeTrunks.instanceMatrix.needsUpdate = true;
  forestGroup.add(treeTrunks, ...canopyLayers.map(layer => layer.mesh));

  // 3. Central Ancient Druidic Stone Circle (Embedded flush with forest soil)
  const centerRingMat = new THREE.MeshStandardMaterial({
    color: 0x48534a,
    roughness: 0.85,
  });
  const centerRuneMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
  });

  // Reusable flat stone geometry
  const flagStoneGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.06, 7);

  // Ancient flat stones embedded in soil around mage
  for (let a = 0; a < 10; a++) {
    const angle = (a / 10) * Math.PI * 2;
    const stoneDist = 3.2 + (a % 2) * 0.3;
    const sx = Math.cos(angle) * stoneDist;
    const sz = Math.sin(angle) * stoneDist;

    const flagStone = new THREE.Mesh(flagStoneGeo, centerRingMat);
    flagStone.position.set(sx, 0.03, sz);
    flagStone.rotation.y = angle + 0.4;
    flagStone.receiveShadow = true;
    forestGroup.add(flagStone);
  }

  // Faint mystical ground rune ring in center
  const runeRing = new THREE.Mesh(
    new THREE.RingGeometry(2.8, 3.0, 24),
    centerRuneMat
  );
  runeRing.rotation.x = -Math.PI / 2;
  runeRing.position.y = 0.02;
  forestGroup.add(runeRing);

  // 4. "DES TRUCS DESSUS": Organic Elements Resting Directly on the Ground

  // A. Mossy Boulders & Field Stones (Scattered organically around clearing)
  const rockPositions = [
    { x: -9.5, z: -8.2, s: 1.3, rot: 0.6 },
    { x: -11.2, z: -6.8, s: 0.9, rot: 1.2 },
    { x: 10.4, z: -7.5, s: 1.4, rot: 2.1 },
    { x: 12.1, z: -9.0, s: 1.0, rot: 0.3 },
    { x: -8.8, z: 9.2, s: 1.2, rot: 1.8 },
    { x: 9.8, z: 8.5, s: 1.5, rot: 0.9 },
    { x: 11.5, z: 6.8, s: 0.8, rot: 2.7 },
    { x: -13.5, z: 2.4, s: 1.1, rot: 1.4 },
    { x: -14.2, z: -1.2, s: 0.7, rot: 0.8 },
    { x: 13.8, z: -2.1, s: 1.2, rot: 2.4 },
    { x: 14.5, z: 1.5, s: 0.85, rot: 1.1 },
    { x: -5.5, z: -13.0, s: 1.4, rot: 0.5 },
    { x: 5.8, z: -13.2, s: 1.3, rot: 1.9 },
    { x: -6.2, z: 12.8, s: 1.1, rot: 2.2 },
    { x: 6.5, z: 12.5, s: 1.2, rot: 0.7 },
  ];

  // Shared optimized rock & moss geometries
  const baseRockGeo = new THREE.DodecahedronGeometry(0.8, 0);
  const mossCapGeo = new THREE.SphereGeometry(0.5, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.45);

  rockPositions.forEach(rp => {
    const rockGroup = new THREE.Group();
    rockGroup.position.set(rp.x, 0, rp.z);

    const rockMesh = new THREE.Mesh(baseRockGeo, rockMat);
    rockMesh.scale.set(rp.s * 1.1, rp.s * 0.65, rp.s * 0.95);
    rockMesh.position.y = rp.s * 0.38;
    rockMesh.rotation.set(rp.rot, rp.rot * 1.5, rp.rot * 0.7);
    rockMesh.castShadow = true;
    rockMesh.receiveShadow = true;
    rockGroup.add(rockMesh);

    // Green moss patch on top of boulder
    const mossMesh = new THREE.Mesh(mossCapGeo, mossMat);
    mossMesh.scale.set(rp.s * 1.1, rp.s * 0.45, rp.s * 1.0);
    mossMesh.position.y = rp.s * 0.52;
    mossMesh.receiveShadow = true;
    rockGroup.add(mossMesh);

    forestGroup.add(rockGroup);
  });

  // B. Fallen Rotten Tree Logs (Flat on the forest ground)
  const logPositions = [
    { x: -7.5, z: -9.5, len: 4.8, r: 0.45, rotY: 0.35, rotZ: 0.05 },
    { x: 8.2, z: 9.8, len: 5.2, r: 0.5, rotY: -0.85, rotZ: -0.04 },
    { x: -11.0, z: 5.5, len: 3.8, r: 0.42, rotY: 1.25, rotZ: 0.03 },
    { x: 9.5, z: -11.2, len: 4.2, r: 0.46, rotY: -0.4, rotZ: 0.02 },
  ];

  logPositions.forEach(lp => {
    const logGroup = new THREE.Group();
    logGroup.position.set(lp.x, lp.r * 0.85, lp.z);
    logGroup.rotation.y = lp.rotY;
    logGroup.rotation.z = lp.rotZ;

    const logGeo = new THREE.CylinderGeometry(lp.r * 0.85, lp.r, lp.len, 10);
    logGeo.rotateZ(Math.PI / 2);
    const logMesh = new THREE.Mesh(logGeo, barkMat);
    logMesh.castShadow = true;
    logMesh.receiveShadow = true;
    logGroup.add(logMesh);

    // End cut rings
    const endGeo = new THREE.CircleGeometry(lp.r * 0.85, 10);
    const endMesh1 = new THREE.Mesh(endGeo, stumpRingMat);
    endMesh1.rotation.y = -Math.PI / 2;
    endMesh1.position.x = -lp.len / 2;
    logGroup.add(endMesh1);

    const endMesh2 = new THREE.Mesh(endGeo, stumpRingMat);
    endMesh2.rotation.y = Math.PI / 2;
    endMesh2.position.x = lp.len / 2;
    logGroup.add(endMesh2);

    // Moss layer on top of the fallen log
    const logMossGeo = new THREE.CylinderGeometry(lp.r * 0.88, lp.r * 1.02, lp.len * 0.65, 8, 1, false, 0, Math.PI);
    logMossGeo.rotateZ(Math.PI / 2);
    logMossGeo.rotateX(-Math.PI / 2);
    const logMoss = new THREE.Mesh(logMossGeo, mossMat);
    logMoss.position.y = 0.02;
    logGroup.add(logMoss);

    forestGroup.add(logGroup);
  });

  // C. Old Weathered Tree Stumps (Ground level, mossy roots)
  const stumpPositions = [
    { x: -5.5, z: 8.5, r: 0.65, h: 0.55 },
    { x: 6.8, z: -7.2, r: 0.75, h: 0.62 },
    { x: -10.5, z: -3.5, r: 0.6, h: 0.48 },
    { x: 11.2, z: 4.8, r: 0.7, h: 0.58 },
  ];

  stumpPositions.forEach(sp => {
    const stumpGroup = new THREE.Group();
    stumpGroup.position.set(sp.x, 0, sp.z);

    // Stump trunk
    const stumpMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(sp.r * 0.85, sp.r * 1.15, sp.h, 10),
      barkMat
    );
    stumpMesh.position.y = sp.h / 2;
    stumpMesh.castShadow = true;
    stumpMesh.receiveShadow = true;
    stumpGroup.add(stumpMesh);

    // Top ring showing wood grain
    const topCap = new THREE.Mesh(
      new THREE.CircleGeometry(sp.r * 0.84, 10),
      stumpRingMat
    );
    topCap.rotation.x = -Math.PI / 2;
    topCap.position.y = sp.h + 0.005;
    stumpGroup.add(topCap);

    // Exposed gnarled roots clinging to ground
    for (let root = 0; root < 4; root++) {
      const rootAngle = (root / 4) * Math.PI * 2 + (sp.x % 1);
      const rootMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.04, sp.r * 1.2, 6),
        barkMat
      );
      rootMesh.rotation.z = Math.PI / 2.3;
      rootMesh.rotation.y = rootAngle;
      rootMesh.position.set(
        Math.cos(rootAngle) * (sp.r * 0.75),
        0.08,
        Math.sin(rootAngle) * (sp.r * 0.75)
      );
      rootMesh.castShadow = true;
      stumpGroup.add(rootMesh);
    }

    forestGroup.add(stumpGroup);
  });

  // D. Wild Forest Mushrooms & Bioluminescent Fungi Clusters
  const mushroomClusters = [
    { x: -7.2, z: -8.8, color: 0x38bdf8, glowColor: 0x0284c7, count: 5 }, // Cyan luminescence
    { x: 7.8, z: 9.2, color: 0xa855f7, glowColor: 0x7e22ce, count: 6 },  // Violet luminescence
    { x: -5.8, z: 8.9, color: 0xf59e0b, glowColor: 0xd97706, count: 4 },  // Amber luminescence
    { x: 6.2, z: -7.5, color: 0x34d399, glowColor: 0x059669, count: 5 },  // Emerald luminescence
    { x: 10.2, z: -6.8, color: 0x38bdf8, glowColor: 0x0284c7, count: 4 },
  ];

  mushroomClusters.forEach((mc, clusterIdx) => {
    const clusterGroup = new THREE.Group();
    clusterGroup.position.set(mc.x, 0, mc.z);

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.8,
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: mc.color,
      emissive: mc.glowColor,
      emissiveIntensity: 0.65,
      roughness: 0.4,
    });

    for (let m = 0; m < mc.count; m++) {
      const offsetX = (Math.random() - 0.5) * 0.8;
      const offsetZ = (Math.random() - 0.5) * 0.8;
      const mScale = 0.55 + Math.random() * 0.5;

      // Stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * mScale, 0.05 * mScale, 0.28 * mScale, 6),
        stemMat
      );
      stem.position.set(offsetX, (0.28 * mScale) / 2, offsetZ);
      clusterGroup.add(stem);

      // Cap
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 * mScale, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
        capMat
      );
      cap.position.set(offsetX, 0.26 * mScale, offsetZ);
      clusterGroup.add(cap);
    }

    // Soft enchanted point light for only 2 key clusters (massive performance win on mobile)
    if (clusterIdx < 2) {
      const mLight = new THREE.PointLight(mc.color, 0.75, 6, 2);
      mLight.position.set(0, 0.45, 0);
      clusterGroup.add(mLight);

      mushroomLights.push({
        light: mLight,
        baseIntensity: 0.75,
        speed: 1.5 + clusterIdx * 0.4,
        phase: clusterIdx * 1.3,
      });
    }

    forestGroup.add(clusterGroup);
  });

  // E. Ferns & Wild Forest Foliage Clumps (Low ground cover)
  const fernMat = new THREE.MeshStandardMaterial({
    color: 0x41633a,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const frondGeo = new THREE.PlaneGeometry(0.22, 0.85);

  const fernLocations = [
    { x: -4.5, z: -6.5 },
    { x: 5.2, z: 6.8 },
    { x: -8.2, z: 3.5 },
    { x: 8.5, z: -3.8 },
    { x: -3.8, z: 10.2 },
    { x: 4.0, z: -10.5 },
    { x: -10.8, z: -8.5 },
    { x: 11.0, z: 8.2 },
    { x: -6.4, z: -5.8 },
    { x: 6.7, z: 4.9 },
    { x: -12.0, z: -5.0 },
    { x: 13.0, z: 5.7 },
    { x: -15.0, z: 0.0 },
    { x: 15.5, z: -4.5 },
    { x: -2.8, z: 14.0 },
    { x: 3.2, z: -14.5 },
  ];

  fernLocations.forEach(fl => {
    const fernGroup = new THREE.Group();
    fernGroup.position.set(fl.x, 0, fl.z);

    // 4 arching fern fronds
    for (let f = 0; f < 4; f++) {
      const fAngle = (f / 4) * Math.PI * 2 + (fl.x % 0.5);
      const frond = new THREE.Mesh(frondGeo, fernMat);
      frond.position.set(Math.cos(fAngle) * 0.22, 0.2, Math.sin(fAngle) * 0.22);
      frond.rotation.y = fAngle;
      frond.rotation.x = 0.55;
      frond.receiveShadow = true;
      fernGroup.add(frond);
    }
    forestGroup.add(fernGroup);
  });

  // 5. FLOATING FIREFLIES / MAGICAL FOREST PARTICLES (Optimized count for mobile)
  const fireflyCount = 14;
  const fireflyGeo = new THREE.SphereGeometry(0.06, 5, 5);
  const fireflyMat = new THREE.MeshBasicMaterial({
    color: 0xa7f3d0,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
  });

  for (let ff = 0; ff < fireflyCount; ff++) {
    const fMesh = new THREE.Mesh(fireflyGeo, fireflyMat);
    const rad = 4 + Math.random() * 14;
    const ang = Math.random() * Math.PI * 2;
    const fx = Math.cos(ang) * rad;
    const fz = Math.sin(ang) * rad;
    const fy = 0.4 + Math.random() * 1.8;

    fMesh.position.set(fx, fy, fz);
    forestGroup.add(fMesh);

    fireflies.push({
      mesh: fMesh,
      baseX: fx,
      baseZ: fz,
      baseY: fy,
      speed: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // 6. LOW-ALTITUDE NOCTURNAL FOREST MIST
  const mistGeo = new THREE.PlaneGeometry(65, 65);
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mistMesh = new THREE.Mesh(mistGeo, mistMat);
  mistMesh.rotation.x = -Math.PI / 2;
  mistMesh.position.y = 0.18;
  forestGroup.add(mistMesh);

  return {
    group: forestGroup,
    fireflies,
    mushroomLights,
    mistMesh,
  };
}
