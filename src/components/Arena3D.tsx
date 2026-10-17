import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Focus,
  Eye,
  Crosshair,
  Maximize2
} from 'lucide-react';
import { ActiveZombie } from '../types';
import { buildForestClearing3D, FireflyData, MushroomLightData } from './ForestClearing3D';

interface Arena3DProps {
  zombies: ActiveZombie[];
  lockedZombieId: string | null;
  lightningTargetId: string | null;
  inputMode: 'voice' | 'keyboard' | 'hybrid';
  isKeyboardOpen: boolean;
  onSelectZombie?: (id: string) => void;
  onZombieHitCenter?: (zombie: ActiveZombie) => void;
}

export interface ScreenTagPosition {
  id: string;
  x: number;
  y: number;
  visible: boolean;
  scale: number;
  zombie: ActiveZombie;
  isLocked: boolean;
}

// Helper: Calculate optimal panoramic camera distance based on viewport aspect ratio and keyboard state
function getPanoramicCameraDistance(width: number, height: number, isKeyboard?: boolean): number {
  const isMobile = width < 768;
  const isCompressedHeight = height < 490 || !!isKeyboard;

  if (isMobile) {
    if (isCompressedHeight) {
      // When native keyboard is open on mobile, camera zooms out slightly to 43-45
      // so the entire 32-unit battle clearing perimeter remains fully visible
      return 43;
    }
    const aspect = width / (height || 1);
    if (aspect < 0.6) {
      return 41;
    } else if (aspect < 0.9) {
      return 38;
    }
    return 36;
  }

  const aspect = width / (height || 1);
  if (aspect < 1.0) return 38;
  if (aspect < 1.3) return 35;
  return 33;
}

// Helper: Calculate responsive vertical FOV ensuring the clearing perimeter is visible across all screen sizes
function getPanoramicFOV(width: number, height: number, isKeyboard?: boolean): number {
  const isMobile = width < 768;
  const isCompressedHeight = height < 490 || !!isKeyboard;

  if (isMobile) {
    if (isCompressedHeight) {
      // High vertical FOV when screen height is compressed by native mobile keyboard
      // Prevents the battle arena from clipping vertically
      return 54;
    }
    const aspect = width / (height || 1);
    const baseDesktopAngle = (38 * Math.PI) / 180;
    const horizontalAngle = 2 * Math.atan(Math.tan(baseDesktopAngle / 2) * 1.35);
    const targetVerticalFov = (2 * Math.atan(Math.tan(horizontalAngle / 2) / Math.max(0.42, aspect)) * 180) / Math.PI;
    return THREE.MathUtils.clamp(targetVerticalFov, 44, 62);
  }

  const aspect = width / (height || 1);
  if (aspect < 1.15) {
    return 44;
  }
  return 38;
}

export const Arena3D: React.FC<Arena3DProps> = ({
  zombies,
  lockedZombieId,
  lightningTargetId,
  isKeyboardOpen,
  onSelectZombie,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Projected 2D tag positions for the React overlay
  const [tagPositions, setTagPositions] = useState<ScreenTagPosition[]>([]);

  // Camera Mode State: 'auto' (cinematic follow of hero + locked target) vs 'free' (free RPG orbit)
  const [cameraMode, setCameraMode] = useState<'auto' | 'free'>('auto');
  const [isCameraToolbarOpen, setIsCameraToolbarOpen] = useState(false);

  // Camera Spherical Coordinates Target Refs (For butter-smooth damping)
  const cameraStateRef = useRef({
    // Spherical values - Classic RPG Panoramic Isometric Framing
    radius: 34,         // Default panoramic distance from target (zoomed out)
    targetRadius: 34,
    minRadius: 14,      // Close-up inspect
    maxRadius: 58,      // Wide tactical panoramic view

    theta: Math.PI / 4, // 45 deg classic isometric azimuthal angle
    targetTheta: Math.PI / 4,

    phi: 0.98,          // ~56 deg isometric elevation angle
    targetPhi: 0.98,
    minPhi: 0.45,       // Low cinematic angle
    maxPhi: 1.35,       // Top-down tactical angle

    // Camera target center (Lerps smoothly to hero / keyboard offset)
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    curTargetX: 0,
    curTargetY: 0,
    curTargetZ: 0,

    // Interaction flags
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    startTheta: 0,
    startPhi: 0,
    hasMovedSignificantly: false,

    // Pinch-to-zoom on mobile
    initialPinchDist: 0,
    startPinchRadius: 34,
    isPinching: false,

    // Last tap for double tap reset
    lastTapTime: 0,
  });

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mageGroupRef = useRef<THREE.Group | null>(null);
  const wandTipRef = useRef<THREE.Mesh | null>(null);
  const wandLightRef = useRef<THREE.PointLight | null>(null);
  const zombieMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const lightningGroupRef = useRef<THREE.Group | null>(null);
  const lightningHitLightRef = useRef<THREE.PointLight | null>(null);
  const sparksGroupRef = useRef<THREE.Points | null>(null);
  const firefliesRef = useRef<FireflyData[]>([]);
  const mushroomLightsRef = useRef<MushroomLightData[]>([]);
  const mistMeshRef = useRef<THREE.Mesh | null>(null);

  // State synchronization refs
  const zombiesRef = useRef<ActiveZombie[]>(zombies);
  zombiesRef.current = zombies;
  const lockedIdRef = useRef<string | null>(lockedZombieId);
  lockedIdRef.current = lockedZombieId;
  const lightningIdRef = useRef<string | null>(lightningTargetId);
  lightningIdRef.current = lightningTargetId;
  const isKeyboardOpenRef = useRef<boolean>(isKeyboardOpen);
  isKeyboardOpenRef.current = isKeyboardOpen;
  const cameraModeRef = useRef<'auto' | 'free'>(cameraMode);
  cameraModeRef.current = cameraMode;

  // Manual camera navigation helpers
  const handleZoom = useCallback((delta: number) => {
    const cs = cameraStateRef.current;
    cs.targetRadius = THREE.MathUtils.clamp(
      cs.targetRadius + delta,
      cs.minRadius,
      cs.maxRadius
    );
  }, []);

  const handleRotate = useCallback((direction: number) => {
    const cs = cameraStateRef.current;
    cs.targetTheta += direction * (Math.PI / 6);
  }, []);

  const handleResetCamera = useCallback(() => {
    const cs = cameraStateRef.current;
    const container = containerRef.current;
    const w = container?.clientWidth || window.innerWidth;
    const h = container?.clientHeight || window.innerHeight;
    const isKb = isKeyboardOpenRef.current || h < 490;
    cs.targetRadius = getPanoramicCameraDistance(w, h, isKb);
    cs.targetTheta = Math.PI / 4;
    cs.targetPhi = 0.98;
    cs.targetX = 0;
    cs.targetY = 0;
    cs.targetZ = 0;
  }, []);

  const toggleCameraMode = useCallback(() => {
    setCameraMode(prev => (prev === 'auto' ? 'free' : 'auto'));
  }, []);

  // Initialize Three.js Full 3D Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isKb = isKeyboardOpenRef.current || height < 490;

    // Apply panoramic initial zoom adapted to viewport
    const panoramicDist = getPanoramicCameraDistance(width, height, isKb);
    cameraStateRef.current.radius = panoramicDist;
    cameraStateRef.current.targetRadius = panoramicDist;

    // 1. Scene with a clear, moonlit forest atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b241a);
    // Keep the clearing crisp while softly veiling the forest edge
    scene.fog = new THREE.FogExp2(0x17251a, 0.008);
    sceneRef.current = scene;

    // 2. Camera: Perspective RPG camera configured for crisp panoramic isometric view
    const initialFov = getPanoramicFOV(width, height, isKb);
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.2, 350);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High-Performance Settings for 60 FPS Mobile
    const isMobile = width < 768 || (typeof window !== 'undefined' && window.innerWidth < 768);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    // Limit pixel ratio on high-DPI mobile screens (1.25 on mobile, 1.5 on desktop) to preserve buttery 60 FPS
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // ACES filmic tone mapping preserves the magic glows while lifting forest detail
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.36;
    rendererRef.current = renderer;

    // 4. Moonlit forest lighting with enough fill to keep gameplay silhouettes readable
    const ambientLight = new THREE.AmbientLight(0x8fa47e, 1.8);
    scene.add(ambientLight);

    // Pale moonlight casts defined shadows through the forest clearing
    const moonLight = new THREE.DirectionalLight(0xe1f3d1, 2.35);
    moonLight.position.set(16, 36, 18);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = isMobile ? 512 : 1024;
    moonLight.shadow.mapSize.height = isMobile ? 512 : 1024;
    moonLight.shadow.camera.near = 1.0;
    moonLight.shadow.camera.far = 80;
    moonLight.shadow.camera.left = -26;
    moonLight.shadow.camera.right = 26;
    moonLight.shadow.camera.top = 26;
    moonLight.shadow.camera.bottom = -26;
    moonLight.shadow.bias = -0.0012;
    scene.add(moonLight);

    // Cool fill light from the opposite angle keeps the night-time palette
    const fillLight = new THREE.DirectionalLight(0x2c6070, 0.9);
    fillLight.position.set(-16, 20, -16);
    scene.add(fillLight);

    // Soft green moonlight reveals the canopy and ground textures
    const forestTopLight = new THREE.DirectionalLight(0xb7d9ac, 0.58);
    forestTopLight.position.set(0, 32, 0);
    scene.add(forestTopLight);

    // 5. Build 3D Nocturnal Forest Clearing (Pure Ground + Organic Rocks, Stumps, Logs, Mushrooms, Spores)
    const forest = buildForestClearing3D();
    scene.add(forest.group);
    firefliesRef.current = forest.fireflies;
    mushroomLightsRef.current = forest.mushroomLights;
    mistMeshRef.current = forest.mistMesh;

    // 6. The Survivor Mage Hero (Center) - Scaled down for proportional arena presence
    const mageGroup = new THREE.Group();
    mageGroup.position.set(0, 0, 0);
    mageGroup.scale.set(0.68, 0.68, 0.68);

    // Realistic Contact shadow
    const heroShadow = createContactShadow(1.1);
    mageGroup.add(heroShadow);

    // Wet blue glowing puddle under mage's feet
    const bluePuddleGeo = new THREE.RingGeometry(0.1, 1.8, 24);
    const bluePuddleMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const bluePuddle = new THREE.Mesh(bluePuddleGeo, bluePuddleMat);
    bluePuddle.rotation.x = -Math.PI / 2;
    bluePuddle.position.y = 0.02;
    mageGroup.add(bluePuddle);

    // Legs / Dark Jeans
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.1, 10), legMat);
    leftLeg.position.set(-0.24, 0.55, -0.05);
    leftLeg.castShadow = true;
    mageGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.1, 10), legMat);
    rightLeg.position.set(0.24, 0.55, 0.1);
    rightLeg.castShadow = true;
    mageGroup.add(rightLeg);

    // Boots
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7 });
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.35), bootMat);
    leftBoot.position.set(-0.24, 0.1, 0.02);
    mageGroup.add(leftBoot);

    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.35), bootMat);
    rightBoot.position.set(0.24, 0.1, 0.17);
    mageGroup.add(rightBoot);

    // Torso / Dark Hoodie
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.1, 12), jacketMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    mageGroup.add(torso);

    // Backpack
    const packMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.32), packMat);
    backpack.position.set(0, 1.52, -0.32);
    backpack.castShadow = true;
    mageGroup.add(backpack);

    // Head / Hood
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 14), headMat);
    head.position.set(0, 2.12, 0.02);
    head.castShadow = true;
    mageGroup.add(head);

    // Face / Shadow
    const faceMat = new THREE.MeshStandardMaterial({ color: 0xd1b49a, roughness: 0.6 });
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), faceMat);
    face.position.set(0, 2.08, 0.1);
    mageGroup.add(face);

    // Arms gripping wizard staff forward
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.8, 8), jacketMat);
    leftArm.position.set(-0.35, 1.5, 0.25);
    leftArm.rotation.x = -Math.PI / 3;
    leftArm.rotation.z = -0.2;
    mageGroup.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.9, 8), jacketMat);
    rightArm.position.set(0.35, 1.45, 0.28);
    rightArm.rotation.x = -Math.PI / 2.8;
    rightArm.rotation.z = 0.25;
    rightArm.castShadow = true;
    mageGroup.add(rightArm);

    // Wizard Staff
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.75 });
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 3.1, 8), staffMat);
    staff.position.set(0.55, 1.6, 0.55);
    staff.rotation.x = -0.35;
    staff.rotation.z = -0.15;
    staff.castShadow = true;
    mageGroup.add(staff);

    // Staff Head Carving
    const metalProngMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
    const staffProngs = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.04, 0.35, 6), metalProngMat);
    staffProngs.position.set(0.72, 2.9, 0.85);
    mageGroup.add(staffProngs);

    // Staff Tip: Glowing Electric Blue Crystal
    const crystalGeo = new THREE.OctahedronGeometry(0.22, 1);
    const crystalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0.74, 3.15, 0.92);
    mageGroup.add(crystal);
    wandTipRef.current = crystal;

    // Glowing PointLight at the crystal tip (softened for nocturnal ambiance)
    const staffLight = new THREE.PointLight(0x38bdf8, 3.2, 16, 1.5);
    staffLight.position.set(0.74, 3.15, 0.92);
    mageGroup.add(staffLight);
    wandLightRef.current = staffLight;

    scene.add(mageGroup);
    mageGroupRef.current = mageGroup;

    // 7. Lightning Group & Sparks Particle System
    const lightningGroup = new THREE.Group();
    scene.add(lightningGroup);
    lightningGroupRef.current = lightningGroup;

    const hitLight = new THREE.PointLight(0x38bdf8, 0, 14, 1.5);
    scene.add(hitLight);
    lightningHitLightRef.current = hitLight;

    const sparkCount = 45;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -100;
      sparkPositions[i * 3 + 2] = 0;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.28,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);
    sparksGroupRef.current = sparks;

    // 8. Animation & Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const cs = cameraStateRef.current;

      // Animate Fireflies drifting gently through the nocturnal forest clearing
      firefliesRef.current.forEach(ff => {
        ff.mesh.position.x = ff.baseX + Math.sin(elapsedTime * ff.speed + ff.phase) * 0.7;
        ff.mesh.position.z = ff.baseZ + Math.cos(elapsedTime * (ff.speed * 0.8) + ff.phase) * 0.7;
        ff.mesh.position.y = ff.baseY + Math.sin(elapsedTime * (ff.speed * 1.5) + ff.phase) * 0.25;
      });

      // Animate Bioluminescent Mushroom Glows
      mushroomLightsRef.current.forEach(ml => {
        const pulse = Math.sin(elapsedTime * ml.speed + ml.phase) * 0.3 + ml.baseIntensity;
        ml.light.intensity = pulse;
      });

      // Animate Ground Nocturnal Mist
      if (mistMeshRef.current) {
        mistMeshRef.current.rotation.z = elapsedTime * 0.015;
      }

      // Animate Staff Crystal Pulsation (gentle mystical hum)
      if (wandLightRef.current && wandTipRef.current) {
        const pulse = Math.sin(elapsedTime * 4.0) * 0.4 + 2.2;
        wandLightRef.current.intensity = pulse;
        wandTipRef.current.rotation.y = elapsedTime * 2.5;
        wandTipRef.current.rotation.z = Math.sin(elapsedTime * 3) * 0.25;
      }

      // 9. DYNAMIC RPG CAMERA POSITIONING & LERPING
      // Calculate target framing based on keyboard state and auto-tracking
      const isAuto = cameraModeRef.current === 'auto';

      if (isAuto) {
        const isMobileScreen = container.clientWidth < 768;
        const isKb = isKeyboardOpenRef.current || container.clientHeight < 490;
        // In isometric projection (looking from +X, +Z towards origin),
        // gently nudging target to negative Z (-0.9) shifts the clearing center DOWNWARD into viewable space
        // so the mage sits in the open area above the keyboard dock!
        const targetKeyboardOffsetY = (isMobileScreen && isKb) ? -0.3 : 0;
        const targetKeyboardOffsetZ = (isMobileScreen && isKb) ? -0.9 : 0;

        // Auto-frame towards locked zombie slightly without ever losing the center clearing
        const currentZombies = zombiesRef.current;
        const lockedZombie = currentZombies.find(z => z.id === lockedIdRef.current);
        if (lockedZombie) {
          const maxShift = (isMobileScreen && isKb) ? 2.0 : 3.5;
          cs.targetX = THREE.MathUtils.clamp(lockedZombie.x * 0.18, -maxShift, maxShift);
          cs.targetZ = THREE.MathUtils.clamp(lockedZombie.z * 0.18 + targetKeyboardOffsetZ, -maxShift, maxShift);
          cs.targetY = targetKeyboardOffsetY;
        } else {
          cs.targetX = 0;
          cs.targetZ = targetKeyboardOffsetZ;
          cs.targetY = targetKeyboardOffsetY;
        }

        // Dynamically maintain optimal tactical radius based on current viewport & keyboard
        const desiredRadius = getPanoramicCameraDistance(container.clientWidth, container.clientHeight, isKb);
        cs.targetRadius = desiredRadius;
      }

      // Butter-smooth exponential damping on camera spherical coordinates
      cs.radius += (cs.targetRadius - cs.radius) * 0.1;
      cs.theta += (cs.targetTheta - cs.theta) * 0.1;
      cs.phi += (cs.targetPhi - cs.phi) * 0.1;

      cs.curTargetX += (cs.targetX - cs.curTargetX) * 0.08;
      cs.curTargetY += (cs.targetY - cs.curTargetY) * 0.08;
      cs.curTargetZ += (cs.targetZ - cs.curTargetZ) * 0.08;

      // Convert Spherical Coordinates (radius, theta, phi) to Cartesian (x, y, z)
      const sinPhi = Math.sin(cs.phi);
      const cosPhi = Math.cos(cs.phi);
      const sinTheta = Math.sin(cs.theta);
      const cosTheta = Math.cos(cs.theta);

      const camX = cs.curTargetX + cs.radius * sinPhi * sinTheta;
      const camY = cs.curTargetY + cs.radius * cosPhi;
      const camZ = cs.curTargetZ + cs.radius * sinPhi * cosTheta;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(cs.curTargetX, cs.curTargetY, cs.curTargetZ);

      // Rotate Mage toward locked zombie or closest zombie
      if (mageGroupRef.current) {
        const currentZombies = zombiesRef.current;
        let targetZombie = currentZombies.find(z => z.id === lockedIdRef.current);
        if (!targetZombie && currentZombies.length > 0) {
          targetZombie = [...currentZombies].sort((a, b) => a.distanceToCenter - b.distanceToCenter)[0];
        }

        if (targetZombie) {
          const targetAngle = Math.atan2(targetZombie.x, targetZombie.z);
          let diff = targetAngle - mageGroupRef.current.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          mageGroupRef.current.rotation.y += diff * 0.14;
        }
      }

      // Synchronize 3D Zombie models
      const activeZombieIds = new Set(zombiesRef.current.map(z => z.id));
      const meshMap = zombieMeshesRef.current;

      meshMap.forEach((mesh, id) => {
        if (!activeZombieIds.has(id)) {
          scene.remove(mesh);
          meshMap.delete(id);
        }
      });

      const newTagPositions: ScreenTagPosition[] = [];

      zombiesRef.current.forEach(z => {
        let zombieMesh = meshMap.get(z.id);

        if (!zombieMesh) {
          zombieMesh = createRealisticZombieMesh(z.type);
          scene.add(zombieMesh);
          meshMap.set(z.id, zombieMesh);
        }

        zombieMesh.position.set(z.x, 0, z.z);
        zombieMesh.lookAt(0, 0, 0);

        const isLocked = z.id === lockedIdRef.current;
        const groundRune = zombieMesh.getObjectByName('groundRune') as THREE.Mesh;
        if (groundRune && groundRune.material) {
          (groundRune.material as THREE.MeshBasicMaterial).opacity = isLocked ? 0.85 : 0.0;
        }

        const walkCycle = (elapsedTime * (z.speed * 4.2) + z.animOffset);
        const isAttacking = z.state === 'attacking';
        const visualModel = zombieMesh.getObjectByName('visualModel');
        const leftArm = zombieMesh.getObjectByName('leftArm');
        const rightArm = zombieMesh.getObjectByName('rightArm');

        if (isAttacking) {
          // Menacing attack strike lunge forward towards player
          if (visualModel) {
            visualModel.position.y = 0.12 + Math.sin(elapsedTime * 16) * 0.08;
            visualModel.rotation.x = -0.32;
            visualModel.rotation.z = Math.sin(elapsedTime * 14) * 0.08;
          }
          if (leftArm && rightArm) {
            leftArm.rotation.x = -Math.PI / 2.2 + Math.sin(elapsedTime * 20) * 0.45;
            rightArm.rotation.x = -Math.PI / 2.2 - Math.sin(elapsedTime * 20) * 0.45;
          }
        } else {
          if (visualModel) {
            visualModel.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.07;
            visualModel.rotation.z = Math.sin(walkCycle) * 0.04;
            visualModel.rotation.x = 0;
          }
          if (leftArm && rightArm) {
            leftArm.rotation.x = Math.sin(walkCycle) * 0.18;
            rightArm.rotation.x = -Math.sin(walkCycle) * 0.18;
          }
        }

        if (z.state === 'dying' || z.state === 'electrocuted') {
          zombieMesh.scale.setScalar(Math.max(0.01, z.scale * (1 - z.dissolveProgress)));
          zombieMesh.position.y += z.dissolveProgress * 0.6;
        } else {
          zombieMesh.scale.setScalar(z.scale);
        }

        // Project 2D screen coordinate for clean French Word Tag (floating just above head)
        const tagWorldPos = new THREE.Vector3(z.x, 2.25 * z.scale, z.z);
        const distToCam = tagWorldPos.distanceTo(camera.position);

        tagWorldPos.project(camera);

        const isVisible = tagWorldPos.z < 1 && tagWorldPos.z > -1;
        let screenX = (tagWorldPos.x * 0.5 + 0.5) * container.clientWidth;
        let screenY = (-(tagWorldPos.y * 0.5) + 0.5) * container.clientHeight;

        // Clamp screen coordinates so floating badges never clip outside top bar or behind dock!
        const isKb = isKeyboardOpenRef.current || container.clientHeight < 490;
        const minScreenY = 48; // Safe area below TopBar
        const maxScreenY = container.clientHeight - (isKb ? 60 : 76); // Safe area above Dock
        const minScreenX = 42;
        const maxScreenX = container.clientWidth - 42;

        screenX = THREE.MathUtils.clamp(screenX, minScreenX, maxScreenX);
        screenY = THREE.MathUtils.clamp(screenY, minScreenY, maxScreenY);

        // Dynamic tag scale based on distance to camera (stays bold & readable at panoramic distance)
        const tagScale = THREE.MathUtils.clamp(32 / distToCam, 0.88, 1.35);

        newTagPositions.push({
          id: z.id,
          x: screenX,
          y: screenY,
          visible: isVisible && z.state !== 'dying',
          scale: tagScale,
          zombie: z,
          isLocked: z.id === lockedIdRef.current,
        });
      });

      setTagPositions(newTagPositions);

      // Render Electric Lightning Strike
      updateRealisticLightning(
        lightningIdRef.current,
        scene,
        lightningGroupRef.current,
        wandTipRef.current,
        meshMap,
        hitLight,
        sparksGroupRef.current
      );

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer - update aspect ratio, responsive panoramic FOV, and renderer size
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          const isKb = isKeyboardOpenRef.current || newHeight < 490;
          camera.aspect = newWidth / newHeight;
          camera.fov = getPanoramicFOV(newWidth, newHeight, isKb);
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);

          if (cameraModeRef.current === 'auto') {
            cameraStateRef.current.targetRadius = getPanoramicCameraDistance(newWidth, newHeight, isKb);
          }
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // 10. TOUCH & MOUSE INTERACTION HANDLERS FOR RPG NAVIGATION
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only engage camera dragging on primary or secondary button
    const cs = cameraStateRef.current;
    cs.isDragging = true;
    cs.dragStartX = e.clientX;
    cs.dragStartY = e.clientY;
    cs.startTheta = cs.targetTheta;
    cs.startPhi = cs.targetPhi;
    cs.hasMovedSignificantly = false;

    // Double-tap detection for quick reset
    const now = Date.now();
    if (now - cs.lastTapTime < 300) {
      handleResetCamera();
    }
    cs.lastTapTime = now;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const cs = cameraStateRef.current;
    if (!cs.isDragging) return;

    const deltaX = e.clientX - cs.dragStartX;
    const deltaY = e.clientY - cs.dragStartY;

    if (Math.hypot(deltaX, deltaY) > 6) {
      cs.hasMovedSignificantly = true;
    }

    // Horizontal drag rotates theta (orbit)
    cs.targetTheta = cs.startTheta - deltaX * 0.007;

    // Vertical drag tilts phi (elevation angle)
    cs.targetPhi = THREE.MathUtils.clamp(
      cs.startPhi - deltaY * 0.005,
      cs.minPhi,
      cs.maxPhi
    );
  };

  const handlePointerUp = () => {
    const cs = cameraStateRef.current;
    cs.isDragging = false;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cs = cameraStateRef.current;
    const zoomSpeed = 0.025;
    cs.targetRadius = THREE.MathUtils.clamp(
      cs.targetRadius + e.deltaY * zoomSpeed,
      cs.minRadius,
      cs.maxRadius
    );
  };

  // Touch pinch-to-zoom for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const cs = cameraStateRef.current;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      cs.initialPinchDist = Math.hypot(dx, dy);
      cs.startPinchRadius = cs.targetRadius;
      cs.isPinching = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && cameraStateRef.current.isPinching) {
      const cs = cameraStateRef.current;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      if (cs.initialPinchDist > 0) {
        const factor = cs.initialPinchDist / currentDist;
        cs.targetRadius = THREE.MathUtils.clamp(
          cs.startPinchRadius * factor,
          cs.minRadius,
          cs.maxRadius
        );
      }
    }
  };

  const handleTouchEnd = () => {
    cameraStateRef.current.isPinching = false;
  };

  return (
    <div
      ref={containerRef}
      id="lexideath-arena-container"
      className="relative w-full h-full overflow-hidden select-none bg-[#030611] touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Real-Time 3D WebGL Canvas (Full Dynamic Castle Courtyard + Hero + Zombies + Torches + Lightning) */}
      <canvas ref={canvasRef} className="relative z-10 block w-full h-full outline-none cursor-grab active:cursor-grabbing" />

      {/* 2. Floating RPG Camera Navigation Control Bar (Discreet & Mobile-Friendly) */}
      <div className="absolute top-16 right-3 sm:top-20 sm:right-6 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Toggle Expand Button / Status */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#060e20]/85 border border-sky-500/40 shadow-[0_0_12px_rgba(2,132,199,0.25)] backdrop-blur-md">
          <button
            onClick={toggleCameraMode}
            title={cameraMode === 'auto' ? 'Mode Suivi Auto (Cliquer pour passer en Caméra Libre)' : 'Mode Caméra Libre (Cliquer pour Suivi Auto)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              cameraMode === 'auto'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40'
            }`}
          >
            {cameraMode === 'auto' ? (
              <>
                <Crosshair className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span className="hidden sm:inline">Suivi Auto</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Caméra Libre</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsCameraToolbarOpen(!isCameraToolbarOpen)}
            title="Afficher les contrôles de caméra RPG"
            className="p-1.5 rounded-xl hover:bg-sky-500/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Navigation Buttons (Zoom In, Zoom Out, Orbit Left, Orbit Right, Reset) */}
        {isCameraToolbarOpen && (
          <div className="flex flex-col gap-1 p-1.5 rounded-2xl bg-[#060e20]/90 border border-sky-500/50 shadow-[0_0_20px_rgba(2,132,199,0.3)] backdrop-blur-md animate-fade-in">
            {/* Zoom In */}
            <button
              onClick={() => handleZoom(-4)}
              title="Zoom avant (+)"
              className="p-2 rounded-xl hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 active:scale-95 transition-all cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={() => handleZoom(4)}
              title="Zoom arrière (-)"
              className="p-2 rounded-xl hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 active:scale-95 transition-all cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="h-px w-full bg-slate-800 my-0.5" />

            {/* Orbit Left */}
            <button
              onClick={() => handleRotate(1)}
              title="Tourner vers la gauche (↺)"
              className="p-2 rounded-xl hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Orbit Right */}
            <button
              onClick={() => handleRotate(-1)}
              title="Tourner vers la droite (↻)"
              className="p-2 rounded-xl hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <div className="h-px w-full bg-slate-800 my-0.5" />

            {/* Reset Framing */}
            <button
              onClick={handleResetCamera}
              title="Recentrer la caméra isométrique"
              className="p-2 rounded-xl hover:bg-sky-500/20 text-sky-400 hover:text-sky-200 active:scale-95 transition-all cursor-pointer"
            >
              <Focus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Floating Word Badges matching screenshots */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {tagPositions.map(pos => {
          if (!pos.visible) return null;
          const { zombie, isLocked, scale } = pos;

          return (
            <div
              key={pos.id}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -100%) scale(${scale})`,
                transition: 'transform 0.03s linear',
              }}
              className="absolute pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectZombie) onSelectZombie(pos.id);
              }}
            >
              {zombie.state === 'attacking' ? (
                // Attacking Zombie Badge (Urgent red pulsating alert badge with battle sword icon)
                <div className="px-3 py-1 rounded-md bg-red-600 border border-red-200 shadow-[0_0_25px_rgba(239,68,68,1)] text-white text-xs sm:text-sm font-black tracking-wide select-none whitespace-nowrap animate-bounce transition-all flex items-center gap-1.5">
                  <span className="text-amber-300 animate-pulse">⚔️</span>
                  <span>{zombie.word.french}</span>
                </div>
              ) : isLocked ? (
                // Targeted / Active Zombie Badge (Glowing vibrant electric blue pill as in Image 2)
                <div className="px-3 py-0.5 rounded-md bg-blue-600 border border-white/90 shadow-[0_0_20px_rgba(59,130,246,1)] text-white text-xs sm:text-sm font-bold tracking-wide select-none whitespace-nowrap animate-pulse transition-all">
                  {zombie.word.french}
                </div>
              ) : (
                // Idle Zombie Badge (Sleek dark translucent pill as in Image 1)
                <div className="px-2.5 py-0.5 rounded-md bg-[#070e1b]/85 border border-sky-900/60 shadow-[0_2px_8px_rgba(0,0,0,0.85)] backdrop-blur-sm text-slate-200 text-xs sm:text-sm font-medium select-none whitespace-nowrap hover:border-sky-500/70 transition-all">
                  {zombie.word.french}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper: Create soft circular contact shadow under characters on wet cobblestones
function createContactShadow(radius: number): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 24);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  return shadow;
}

// Helper: Create Realistic Humanoid Undead Zombie Mesh
function createRealisticZombieMesh(type: 'standard' | 'fast' | 'boss'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'zombieRoot';

  // Humanoid realistic scale: Standard matches player height (~1.72m)
  let baseScale = 0.92;
  let tunicColor = 0x2e3532;   // Distressed charcoal / dark forest peat
  let skinColor = 0x546256;    // Necrotic decaying pale olive flesh
  let eyeGlowColor = 0xfef08a; // Pale ghostly iris
  let pantsColor = 0x1e2428;

  if (type === 'fast') {
    baseScale = 0.82;
    tunicColor = 0x222a24;     // Shredded dark swamp cowl
    skinColor = 0x4a584c;      // Lean decayed ghoul flesh
    eyeGlowColor = 0xf97316;   // Faint predatory amber
    pantsColor = 0x161b1e;
  } else if (type === 'boss') {
    baseScale = 1.18;
    tunicColor = 0x221c24;     // Heavy dark tabard with dried stains
    skinColor = 0x3d4740;      // Ashen undead behemoth
    eyeGlowColor = 0xef4444;   // Piercing crimson hate
    pantsColor = 0x0f1318;
  }

  // 1. Soft Realistic Ground Contact Shadow
  const shadowGeo = new THREE.CircleGeometry(0.52 * baseScale, 20);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  // 2. Subtle Targeting Rune Ring (Visible only when selected/locked)
  const runeGeo = new THREE.RingGeometry(0.48 * baseScale, 0.62 * baseScale, 24);
  const runeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const runeRing = new THREE.Mesh(runeGeo, runeMat);
  runeRing.name = 'groundRune';
  runeRing.rotation.x = -Math.PI / 2;
  runeRing.position.y = 0.025;
  root.add(runeRing);

  // Inner animated visual model (handles walk cycle bobbing & side sway safely)
  const visualModel = new THREE.Group();
  visualModel.name = 'visualModel';
  root.add(visualModel);

  // Realistic Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.78,
    metalness: 0.05,
  });

  const tunicMat = new THREE.MeshStandardMaterial({
    color: tunicColor,
    roughness: 0.9,
    metalness: 0.05,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.9,
    metalness: 0.05,
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    roughness: 0.85,
  });

  const socketMat = new THREE.MeshBasicMaterial({
    color: 0x0d120e,
  });

  const eyeMat = new THREE.MeshBasicMaterial({
    color: eyeGlowColor,
  });

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    roughness: 0.65,
  });

  // Pelvis & Legs (Oriented towards +Z)
  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(0.32 * baseScale, 0.16 * baseScale, 0.22 * baseScale),
    pantsMat
  );
  pelvis.position.set(0, 0.82 * baseScale, 0);
  visualModel.add(pelvis);

  // Left Leg & Boot
  const leftThigh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * baseScale, 0.07 * baseScale, 0.42 * baseScale, 8),
    pantsMat
  );
  leftThigh.position.set(-0.11 * baseScale, 0.62 * baseScale, 0);
  leftThigh.castShadow = true;
  visualModel.add(leftThigh);

  const leftShin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065 * baseScale, 0.055 * baseScale, 0.42 * baseScale, 8),
    pantsMat
  );
  leftShin.position.set(-0.11 * baseScale, 0.26 * baseScale, 0.02 * baseScale);
  leftShin.castShadow = true;
  visualModel.add(leftShin);

  const leftBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.13 * baseScale, 0.11 * baseScale, 0.22 * baseScale),
    bootMat
  );
  leftBoot.position.set(-0.11 * baseScale, 0.055 * baseScale, 0.05 * baseScale);
  visualModel.add(leftBoot);

  // Right Leg & Boot
  const rightThigh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * baseScale, 0.07 * baseScale, 0.42 * baseScale, 8),
    pantsMat
  );
  rightThigh.position.set(0.11 * baseScale, 0.62 * baseScale, 0);
  rightThigh.castShadow = true;
  visualModel.add(rightThigh);

  const rightShin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065 * baseScale, 0.055 * baseScale, 0.42 * baseScale, 8),
    pantsMat
  );
  rightShin.position.set(0.11 * baseScale, 0.26 * baseScale, 0.02 * baseScale);
  rightShin.castShadow = true;
  visualModel.add(rightShin);

  const rightBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.13 * baseScale, 0.11 * baseScale, 0.22 * baseScale),
    bootMat
  );
  rightBoot.position.set(0.11 * baseScale, 0.055 * baseScale, 0.05 * baseScale);
  visualModel.add(rightBoot);

  // Tattered Torso / Ribcage (Tapered chest, slight forward slouch towards +Z)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.9 * baseScale, 0);
  torsoGroup.rotation.x = 0.14; // Forward undead slouch towards +Z

  // Lower abdomen
  const abdomen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * baseScale, 0.15 * baseScale, 0.24 * baseScale, 8),
    tunicMat
  );
  abdomen.position.set(0, 0.12 * baseScale, 0);
  torsoGroup.add(abdomen);

  // Chest / Upper Ribcage
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2 * baseScale, 0.16 * baseScale, 0.36 * baseScale, 9),
    tunicMat
  );
  chest.position.set(0, 0.38 * baseScale, 0);
  chest.castShadow = true;
  torsoGroup.add(chest);

  // Tattered collar / frayed mantle
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * baseScale, 0.23 * baseScale, 0.12 * baseScale, 8),
    tunicMat
  );
  collar.position.set(0, 0.52 * baseScale, 0);
  torsoGroup.add(collar);

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065 * baseScale, 0.075 * baseScale, 0.16 * baseScale, 6),
    skinMat
  );
  neck.position.set(0, 0.62 * baseScale, 0.04 * baseScale);
  neck.rotation.x = 0.2;
  torsoGroup.add(neck);

  // Decaying Head / Skull (Facing forward into +Z)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.76 * baseScale, 0.08 * baseScale);
  headGroup.rotation.x = 0.1; // Head tilted forward

  // Cranial dome
  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.14 * baseScale, 10, 10),
    skinMat
  );
  cranium.scale.set(0.9, 1.05, 1.0);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Sunken Eye Sockets (facing +Z)
  const leftSocket = new THREE.Mesh(
    new THREE.SphereGeometry(0.035 * baseScale, 6, 6),
    socketMat
  );
  leftSocket.position.set(-0.055 * baseScale, 0.02 * baseScale, 0.115 * baseScale);
  headGroup.add(leftSocket);

  const rightSocket = new THREE.Mesh(
    new THREE.SphereGeometry(0.035 * baseScale, 6, 6),
    socketMat
  );
  rightSocket.position.set(0.055 * baseScale, 0.02 * baseScale, 0.115 * baseScale);
  headGroup.add(rightSocket);

  // Piercing Pale Glowing Irises inside sockets (+Z)
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.016 * baseScale, 6, 6),
    eyeMat
  );
  leftEye.position.set(-0.055 * baseScale, 0.02 * baseScale, 0.128 * baseScale);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.016 * baseScale, 6, 6),
    eyeMat
  );
  rightEye.position.set(0.055 * baseScale, 0.02 * baseScale, 0.128 * baseScale);
  headGroup.add(rightEye);

  // Sunken Cheeks & Exposed Rotting Jaw (+Z)
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(0.09 * baseScale, 0.08 * baseScale, 0.09 * baseScale),
    skinMat
  );
  jaw.position.set(0, -0.09 * baseScale, 0.07 * baseScale);
  headGroup.add(jaw);

  // Exposed rotten teeth line (+Z)
  const teeth = new THREE.Mesh(
    new THREE.BoxGeometry(0.065 * baseScale, 0.025 * baseScale, 0.025 * baseScale),
    boneMat
  );
  teeth.position.set(0, -0.065 * baseScale, 0.122 * baseScale);
  headGroup.add(teeth);

  torsoGroup.add(headGroup);

  // Outstretched Reaching Undead Arms (Extending forward into +Z)
  // Left Arm Group (pivot at left shoulder)
  const leftArm = new THREE.Group();
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.23 * baseScale, 0.48 * baseScale, 0.02 * baseScale);

  const leftUpperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055 * baseScale, 0.05 * baseScale, 0.32 * baseScale, 7),
    skinMat
  );
  leftUpperArm.rotation.x = Math.PI / 2.3;
  leftUpperArm.position.set(0, -0.04 * baseScale, 0.14 * baseScale);
  leftUpperArm.castShadow = true;
  leftArm.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045 * baseScale, 0.04 * baseScale, 0.32 * baseScale, 7),
    skinMat
  );
  leftForearm.rotation.x = Math.PI / 2.2;
  leftForearm.position.set(0, -0.08 * baseScale, 0.42 * baseScale);
  leftForearm.castShadow = true;
  leftArm.add(leftForearm);

  const leftHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.07 * baseScale, 0.035 * baseScale, 0.1 * baseScale),
    skinMat
  );
  leftHand.position.set(0, -0.1 * baseScale, 0.6 * baseScale);
  leftArm.add(leftHand);

  torsoGroup.add(leftArm);

  // Right Arm Group (pivot at right shoulder)
  const rightArm = new THREE.Group();
  rightArm.name = 'rightArm';
  rightArm.position.set(0.23 * baseScale, 0.48 * baseScale, 0.02 * baseScale);

  const rightUpperArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055 * baseScale, 0.05 * baseScale, 0.32 * baseScale, 7),
    skinMat
  );
  rightUpperArm.rotation.x = Math.PI / 2.3;
  rightUpperArm.position.set(0, -0.04 * baseScale, 0.14 * baseScale);
  rightUpperArm.castShadow = true;
  rightArm.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045 * baseScale, 0.04 * baseScale, 0.32 * baseScale, 7),
    skinMat
  );
  rightForearm.rotation.x = Math.PI / 2.2;
  rightForearm.position.set(0, -0.08 * baseScale, 0.42 * baseScale);
  rightForearm.castShadow = true;
  rightArm.add(rightForearm);

  const rightHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.07 * baseScale, 0.035 * baseScale, 0.1 * baseScale),
    skinMat
  );
  rightHand.position.set(0, -0.1 * baseScale, 0.6 * baseScale);
  rightArm.add(rightHand);

  torsoGroup.add(rightArm);
  visualModel.add(torsoGroup);

  // Boss Unique Armor: Battered Spiked Pauldrons & Skullcap
  if (type === 'boss') {
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x272b33,
      roughness: 0.6,
      metalness: 0.8,
    });

    const leftPauldron = new THREE.Mesh(
      new THREE.ConeGeometry(0.14 * baseScale, 0.3 * baseScale, 6),
      ironMat
    );
    leftPauldron.position.set(-0.28 * baseScale, 0.52 * baseScale, 0);
    leftPauldron.rotation.z = 0.5;
    torsoGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(
      new THREE.ConeGeometry(0.14 * baseScale, 0.3 * baseScale, 6),
      ironMat
    );
    rightPauldron.position.set(0.28 * baseScale, 0.52 * baseScale, 0);
    rightPauldron.rotation.z = -0.5;
    torsoGroup.add(rightPauldron);

    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.155 * baseScale, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      ironMat
    );
    helm.position.set(0, 0.04 * baseScale, 0);
    headGroup.add(helm);
  }

  return root;
}

// Helper: Generate Electrifying Zig-Zagging Lightning Strike & Impact
function updateRealisticLightning(
  targetId: string | null,
  scene: THREE.Scene,
  lightningGroup: THREE.Group | null,
  wandTip: THREE.Mesh | null,
  meshMap: Map<string, THREE.Group>,
  hitLight: THREE.PointLight | null,
  sparks: THREE.Points | null
) {
  if (!lightningGroup) return;

  while (lightningGroup.children.length > 0) {
    const child = lightningGroup.children[0];
    lightningGroup.remove(child);
    if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose();
  }

  if (!targetId || !wandTip) {
    if (hitLight) hitLight.intensity = 0;
    return;
  }

  const targetMesh = meshMap.get(targetId);
  if (!targetMesh) {
    if (hitLight) hitLight.intensity = 0;
    return;
  }

  const startPos = new THREE.Vector3();
  wandTip.getWorldPosition(startPos);

  const endPos = new THREE.Vector3(targetMesh.position.x, 1.15, targetMesh.position.z);

  if (hitLight) {
    hitLight.position.copy(endPos);
    hitLight.intensity = 3.5;
  }

  const segments = 16;
  const points: THREE.Vector3[] = [startPos.clone()];
  const delta = new THREE.Vector3().subVectors(endPos, startPos).divideScalar(segments);

  for (let i = 1; i < segments; i++) {
    const pt = new THREE.Vector3().copy(startPos).add(delta.clone().multiplyScalar(i));
    const jitter = 0.75;
    pt.x += (Math.random() - 0.5) * jitter;
    pt.y += (Math.random() - 0.5) * jitter;
    pt.z += (Math.random() - 0.5) * jitter;
    points.push(pt);
  }
  points.push(endPos.clone());

  const coreGeo = new THREE.BufferGeometry().setFromPoints(points);
  const coreMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 3,
    blending: THREE.AdditiveBlending,
  });
  lightningGroup.add(new THREE.Line(coreGeo, coreMat));

  const auraGeo = new THREE.BufferGeometry().setFromPoints(points);
  const auraMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 6,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
  });
  lightningGroup.add(new THREE.Line(auraGeo, auraMat));

  if (points.length > 8) {
    const forkIndex = Math.floor(points.length * 0.45);
    const forkStart = points[forkIndex].clone();
    const branchPts: THREE.Vector3[] = [forkStart];
    for (let b = 0; b < 5; b++) {
      const bpt = forkStart.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 2.5,
        (Math.random() - 0.3) * 1.8,
        (Math.random() - 0.5) * 2.5
      ));
      branchPts.push(bpt);
    }
    const branchGeo = new THREE.BufferGeometry().setFromPoints(branchPts);
    const branchMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      blending: THREE.AdditiveBlending,
    });
    lightningGroup.add(new THREE.Line(branchGeo, branchMat));
  }

  if (sparks) {
    const posAttr = sparks.geometry.attributes.position as THREE.BufferAttribute;
    for (let p = 0; p < posAttr.count; p++) {
      posAttr.setXYZ(
        p,
        endPos.x + (Math.random() - 0.5) * 1.6,
        endPos.y + (Math.random() - 0.5) * 1.4,
        endPos.z + (Math.random() - 0.5) * 1.6
      );
    }
    posAttr.needsUpdate = true;
  }
}
