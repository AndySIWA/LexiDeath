import * as THREE from 'three';
import { createCobblestonePBR, createCastleStonePBR, createMedievalWoodPBR } from '../utils/pbrTextures';

export interface TorchData {
  light: THREE.PointLight;
  flameMesh: THREE.Mesh;
  baseIntensity: number;
  speed: number;
  offset: number;
}

export interface CastleCourtyardBuildResult {
  group: THREE.Group;
  torches: TorchData[];
  mistMesh: THREE.Mesh;
}

export function buildCastleCourtyard3D(): CastleCourtyardBuildResult {
  const courtyardGroup = new THREE.Group();
  courtyardGroup.name = 'CastleCourtyard';

  const torches: TorchData[] = [];

  // 1. Generate PBR Materials
  const cobblestonePBR = createCobblestonePBR();
  const castleStonePBR = createCastleStonePBR();
  const woodPBR = createMedievalWoodPBR();

  // Ground PBR Material (Wet stone with specular puddles)
  const groundMat = new THREE.MeshStandardMaterial({
    map: cobblestonePBR.map,
    roughnessMap: cobblestonePBR.roughnessMap,
    bumpMap: cobblestonePBR.bumpMap,
    bumpScale: 0.05,
    roughness: 0.52,
    metalness: 0.1,
  });

  // Castle Wall Stone Material
  const wallMat = new THREE.MeshStandardMaterial({
    map: castleStonePBR.map,
    roughnessMap: castleStonePBR.roughnessMap,
    bumpMap: castleStonePBR.bumpMap,
    bumpScale: 0.08,
    roughness: 0.65,
    metalness: 0.05,
  });

  // Wood Material for Props
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodPBR.map,
    roughnessMap: woodPBR.roughnessMap,
    bumpMap: woodPBR.bumpMap,
    bumpScale: 0.04,
    roughness: 0.7,
  });

  // Dark Iron / Metal Material
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.85,
  });

  // Slate Roof Material
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x18202f,
    roughness: 0.7,
    metalness: 0.2,
  });

  // 2. Cobblestone Ground Courtyard Plane
  const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  courtyardGroup.add(groundMesh);

  // 3. BACK CASTLE FORTRESS WALL & ARCHWAY
  // Main rear wall
  const rearWallLeft = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 3), wallMat);
  rearWallLeft.position.set(-11, 6, -14);
  rearWallLeft.castShadow = true;
  rearWallLeft.receiveShadow = true;
  courtyardGroup.add(rearWallLeft);

  const rearWallRight = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 3), wallMat);
  rearWallRight.position.set(11, 6, -14);
  rearWallRight.castShadow = true;
  rearWallRight.receiveShadow = true;
  courtyardGroup.add(rearWallRight);

  // Archway Portal Frame (Center entrance)
  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 3.2), wallMat);
  archLintel.position.set(0, 10.25, -14);
  archLintel.castShadow = true;
  courtyardGroup.add(archLintel);

  // Arch curved stones (approximated with beveled geometry)
  const archPillarLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.5, 3.2), wallMat);
  archPillarLeft.position.set(-2.8, 4.25, -14);
  archPillarLeft.castShadow = true;
  courtyardGroup.add(archPillarLeft);

  const archPillarRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.5, 3.2), wallMat);
  archPillarRight.position.set(2.8, 4.25, -14);
  archPillarRight.castShadow = true;
  courtyardGroup.add(archPillarRight);

  // Dark interior behind archway
  const archBackdropMat = new THREE.MeshBasicMaterial({ color: 0x020409 });
  const archBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 8.5), archBackdropMat);
  archBackdrop.position.set(0, 4.25, -15.4);
  courtyardGroup.add(archBackdrop);

  // Iron Portcullis Grate
  const portcullisGroup = new THREE.Group();
  for (let bar = -2; bar <= 2; bar += 0.8) {
    const vBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 7.5, 6), ironMat);
    vBar.position.set(bar, 4.5, -14.2);
    portcullisGroup.add(vBar);
  }
  for (let h = 2; h <= 7; h += 1.8) {
    const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.8, 6), ironMat);
    hBar.rotation.z = Math.PI / 2;
    hBar.position.set(0, h, -14.2);
    portcullisGroup.add(hBar);
  }
  courtyardGroup.add(portcullisGroup);

  // Rear Wall Battlements / Crenellations
  for (let c = -18; c <= 18; c += 2.8) {
    if (Math.abs(c) < 3.2) continue; // Gap over main archway
    const battlement = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 3.2), wallMat);
    battlement.position.set(c, 12.9, -14);
    battlement.castShadow = true;
    courtyardGroup.add(battlement);
  }

  // Royal Dark Blue Fleur-de-lis Banner on the wall
  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5.5), bannerMat);
  bannerMesh.position.set(-6.5, 8.2, -12.4);
  courtyardGroup.add(bannerMesh);

  // Golden crest on banner
  const crestMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const crestMesh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), crestMat);
  crestMesh.position.set(-6.5, 9.2, -12.38);
  courtyardGroup.add(crestMesh);

  // 4. LEFT WING: STONE STAIRS & FORTRESS TOWER
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(3, 11, 26), wallMat);
  leftWall.position.set(-18, 5.5, -2);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  courtyardGroup.add(leftWall);

  // Left Stone Doorway with arched heavy wooden door
  const stoneDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6, 4), wallMat);
  stoneDoorFrame.position.set(-16.2, 3, -7.5);
  courtyardGroup.add(stoneDoorFrame);

  const woodenDoor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.2, 3.2), woodMat);
  woodenDoor.position.set(-16.1, 2.7, -7.5);
  courtyardGroup.add(woodenDoor);

  // Left Stone Steps (Escalier)
  const stepsCount = 6;
  for (let s = 0; s < stepsCount; s++) {
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.45, 1.2),
      wallMat
    );
    stepMesh.position.set(-14.5, s * 0.45 + 0.22, -6.5 + s * 0.9);
    stepMesh.receiveShadow = true;
    stepMesh.castShadow = true;
    courtyardGroup.add(stepMesh);
  }

  // 5. RIGHT WING: MEDIEVAL TIMBER-FRAME BUILDING & CART
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(3, 9, 26), wallMat);
  rightWall.position.set(18, 4.5, -2);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  courtyardGroup.add(rightWall);

  // Timber Tavern / Gatehouse Structure (As in reference image right side)
  const tavernGroup = new THREE.Group();
  tavernGroup.position.set(15.5, 0, -4);

  // Timber wooden walls
  const tavernBase = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 12), woodMat);
  tavernBase.position.set(0, 3, 0);
  tavernBase.castShadow = true;
  tavernBase.receiveShadow = true;
  tavernGroup.add(tavernBase);

  // Exposed dark wooden timber framing beams
  for (let z = -5.5; z <= 5.5; z += 2.8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.2, 0.35), woodMat);
    beam.position.set(-3.05, 3, z);
    tavernGroup.add(beam);
  }

  // Slanted Slate Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5.5, 3.5, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.3, 1, 2.2);
  roof.position.set(0, 7.8, 0);
  roof.castShadow = true;
  tavernGroup.add(roof);

  courtyardGroup.add(tavernGroup);

  // Medieval Wooden Cart with Spoked Wheels (Right side near wall)
  const cartGroup = new THREE.Group();
  cartGroup.position.set(9.5, 0, -8.5);
  cartGroup.rotation.y = -0.35;

  // Cart bed & side rails
  const cartBed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 4.2), woodMat);
  cartBed.position.set(0, 1.2, 0);
  cartBed.castShadow = true;
  cartGroup.add(cartBed);

  const cartRailLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 4.2), woodMat);
  cartRailLeft.position.set(-1.15, 1.6, 0);
  cartGroup.add(cartRailLeft);

  const cartRailRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.8, 4.2), woodMat);
  cartRailRight.position.set(1.15, 1.6, 0);
  cartGroup.add(cartRailRight);

  // Wooden Cart Wheels (Torus + spokes)
  const wheelGeo = new THREE.TorusGeometry(0.85, 0.09, 8, 20);
  const wheelLeftFront = new THREE.Mesh(wheelGeo, woodMat);
  wheelLeftFront.rotation.y = Math.PI / 2;
  wheelLeftFront.position.set(-1.3, 0.85, -1.3);
  wheelLeftFront.castShadow = true;
  cartGroup.add(wheelLeftFront);

  const wheelRightFront = new THREE.Mesh(wheelGeo, woodMat);
  wheelRightFront.rotation.y = Math.PI / 2;
  wheelRightFront.position.set(1.3, 0.85, -1.3);
  wheelRightFront.castShadow = true;
  cartGroup.add(wheelRightFront);

  const wheelLeftRear = new THREE.Mesh(wheelGeo, woodMat);
  wheelLeftRear.rotation.y = Math.PI / 2;
  wheelLeftRear.position.set(-1.3, 0.85, 1.3);
  wheelLeftRear.castShadow = true;
  cartGroup.add(wheelLeftRear);

  const wheelRightRear = new THREE.Mesh(wheelGeo, woodMat);
  wheelRightRear.rotation.y = Math.PI / 2;
  wheelRightRear.position.set(1.3, 0.85, 1.3);
  wheelRightRear.castShadow = true;
  cartGroup.add(wheelRightRear);

  courtyardGroup.add(cartGroup);

  // Stacked Wooden Barrels & Crates (Tavern side)
  const barrelGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.2, 12);
  const barrel1 = new THREE.Mesh(barrelGeo, woodMat);
  barrel1.position.set(11.8, 0.6, -2.5);
  barrel1.castShadow = true;
  courtyardGroup.add(barrel1);

  const barrel2 = new THREE.Mesh(barrelGeo, woodMat);
  barrel2.position.set(12.6, 0.6, -1.4);
  barrel2.castShadow = true;
  courtyardGroup.add(barrel2);

  const barrel3 = new THREE.Mesh(barrelGeo, woodMat);
  barrel3.rotation.z = Math.PI / 2;
  barrel3.position.set(12.2, 1.5, -1.9);
  barrel3.castShadow = true;
  courtyardGroup.add(barrel3);

  // 6. FOREGROUND STONE RAMPARTS & BALUSTRADE (Framing bottom isometric view)
  const foregroundWallLeft = new THREE.Mesh(new THREE.BoxGeometry(14, 3.5, 2.5), wallMat);
  foregroundWallLeft.position.set(-12, 1.2, 14);
  foregroundWallLeft.castShadow = true;
  courtyardGroup.add(foregroundWallLeft);

  const foregroundWallRight = new THREE.Mesh(new THREE.BoxGeometry(14, 3.5, 2.5), wallMat);
  foregroundWallRight.position.set(12, 1.2, 14);
  foregroundWallRight.castShadow = true;
  courtyardGroup.add(foregroundWallRight);

  // 7. REAL-TIME 3D TORCHES & DYNAMIC EMISSIVE FLAMES
  // Flame material with additive blending and warm glow
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffaa22,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.95,
  });

  // Flame outer halo glow
  const flameGlowMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.45,
  });

  const torchPositions = [
    { x: -14.5, y: 4.8, z: -7.5, rotY: 0, intensity: 6.8 },    // Left stone doorway torch
    { x: -6.5, y: 5.2, z: -12.4, rotY: 0, intensity: 6.5 },    // Left back wall torch
    { x: 5.5, y: 5.8, z: -12.4, rotY: 0, intensity: 6.5 },     // Right archway torch
    { x: 12.2, y: 3.8, z: -6.0, rotY: -Math.PI / 2, intensity: 6.2 }, // Tavern entrance lantern
    { x: 13.5, y: 3.2, z: 12.8, rotY: 0, intensity: 6.5 },     // Foreground right rampart torch
    { x: -13.5, y: 3.2, z: 12.8, rotY: 0, intensity: 6.5 },    // Foreground left rampart torch
    { x: -15.5, y: 3.8, z: 2.0, rotY: Math.PI / 2, intensity: 5.5 }, // West mid courtyard torch
    { x: 14.0, y: 3.8, z: 3.5, rotY: -Math.PI / 2, intensity: 5.5 }, // East mid courtyard torch
  ];

  torchPositions.forEach((tp, i) => {
    const torchUnit = new THREE.Group();
    torchUnit.position.set(tp.x, tp.y, tp.z);
    torchUnit.rotation.y = tp.rotY;

    // Iron wall sconce bracket
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6), ironMat);
    bracket.rotation.z = Math.PI / 4;
    bracket.position.set(0.2, -0.2, 0);
    torchUnit.add(bracket);

    // Wooden torch stick
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), woodMat);
    stick.position.set(0.45, 0.1, 0);
    torchUnit.add(stick);

    // Iron torch cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.06, 0.25, 8), ironMat);
    cup.position.set(0.45, 0.5, 0);
    torchUnit.add(cup);

    // Glowing Flame Cone Mesh
    const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 8), flameMat);
    flameMesh.position.set(0.45, 0.8, 0);
    torchUnit.add(flameMesh);

    // Flame outer halo sphere
    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), flameGlowMat);
    glowMesh.position.set(0.45, 0.8, 0);
    torchUnit.add(glowMesh);

    // Dynamic Point Light with amber flicker & wider radius
    const pLight = new THREE.PointLight(0xf59e0b, tp.intensity, 28, 1.4);
    pLight.position.set(0.45, 1.0, 0);
    torchUnit.add(pLight);

    courtyardGroup.add(torchUnit);

    torches.push({
      light: pLight,
      flameMesh,
      baseIntensity: tp.intensity,
      speed: 4 + i * 0.8,
      offset: i * 1.7,
    });
  });

  // 8. Low-altitude Ground Mist (Soft subtle ambient fog, non-obstructive)
  const mistGeo = new THREE.PlaneGeometry(50, 50);
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mistMesh = new THREE.Mesh(mistGeo, mistMat);
  mistMesh.rotation.x = -Math.PI / 2;
  mistMesh.position.y = 0.25;
  courtyardGroup.add(mistMesh);

  return {
    group: courtyardGroup,
    torches,
    mistMesh,
  };
}
