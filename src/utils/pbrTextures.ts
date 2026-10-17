import * as THREE from 'three';

/**
 * High-performance procedural PBR texture generators for Three.js.
 * These textures are generated instantly in memory via HTML5 2D Canvas
 * without requiring multi-megabyte external network asset downloads.
 */

export interface PBRMaterialSet {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

// 1. Wet Medieval Cobblestones with glossy rain puddles
/** Creates diffuse, roughness, and height maps for a repeating wet cobblestone surface. */
export function createCobblestonePBR(): PBRMaterialSet {
  const size = 512;

  // Diffuse / Albedo Canvas
  const diffuseCanvas = document.createElement('canvas');
  diffuseCanvas.width = size;
  diffuseCanvas.height = size;
  const ctxD = diffuseCanvas.getContext('2d')!;

  // Roughness Canvas (Dark = glossy water puddle, Light = rough stone)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const ctxR = roughCanvas.getContext('2d')!;

  // Bump / Height Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const ctxB = bumpCanvas.getContext('2d')!;

  // Background base (rich warm dark stone mortar)
  ctxD.fillStyle = '#2d3748';
  ctxD.fillRect(0, 0, size, size);

  ctxR.fillStyle = '#94a3b8'; // Stone roughness
  ctxR.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#4a5568';
  ctxB.fillRect(0, 0, size, size);

  // Draw cobblestones pattern
  const rows = 16;
  const cols = 16;
  const stoneW = size / cols;
  const stoneH = size / rows;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2 === 0) ? 0 : stoneW * 0.5;
    for (let c = -1; c < cols + 1; c++) {
      const x = c * stoneW + offsetX;
      const y = r * stoneH;
      const pad = 2.5;

      // Color variation in stones - Much brighter limestone & granite cobblestones
      const shade = Math.floor(85 + Math.random() * 55);
      const blueTint = Math.floor(shade * 1.08);
      ctxD.fillStyle = `rgb(${shade}, ${shade + 4}, ${blueTint})`;
      ctxD.beginPath();
      ctxD.roundRect(x + pad, y + pad, stoneW - pad * 2, stoneH - pad * 2, [3, 3, 3, 3]);
      ctxD.fill();

      // Stone roughness
      const stoneRough = Math.floor(160 + Math.random() * 40);
      ctxR.fillStyle = `rgb(${stoneRough}, ${stoneRough}, ${stoneRough})`;
      ctxR.beginPath();
      ctxR.roundRect(x + pad, y + pad, stoneW - pad * 2, stoneH - pad * 2, [3, 3, 3, 3]);
      ctxR.fill();

      // Bump (stone elevated above mortar)
      ctxB.fillStyle = '#c0c0c0';
      ctxB.beginPath();
      ctxB.roundRect(x + pad, y + pad, stoneW - pad * 2, stoneH - pad * 2, [3, 3, 3, 3]);
      ctxB.fill();
    }
  }

  // Draw Realistic Wet Rain Puddles (Glossy mirrors reflecting moonlight and torches)
  const puddleSpots = [
    { x: size * 0.48, y: size * 0.45, rx: 75, ry: 50 },
    { x: size * 0.28, y: size * 0.65, rx: 60, ry: 40 },
    { x: size * 0.72, y: size * 0.55, rx: 70, ry: 45 },
    { x: size * 0.40, y: size * 0.25, rx: 50, ry: 35 },
    { x: size * 0.65, y: size * 0.30, rx: 55, ry: 35 },
  ];

  puddleSpots.forEach(p => {
    // Diffuse puddle: wet glossy sheen with subtle blue reflection
    const gradD = ctxD.createRadialGradient(p.x, p.y, 5, p.x, p.y, p.rx);
    gradD.addColorStop(0, 'rgba(40, 55, 80, 0.75)');
    gradD.addColorStop(0.7, 'rgba(50, 70, 100, 0.55)');
    gradD.addColorStop(1, 'rgba(45, 55, 72, 0)');
    ctxD.fillStyle = gradD;
    ctxD.beginPath();
    ctxD.ellipse(p.x, p.y, p.rx, p.ry, 0.2, 0, Math.PI * 2);
    ctxD.fill();

    // Roughness puddle: VERY LOW (~0.05 = near mirror specular reflection)
    const gradR = ctxR.createRadialGradient(p.x, p.y, 5, p.x, p.y, p.rx);
    gradR.addColorStop(0, 'rgba(15, 15, 15, 1.0)');
    gradR.addColorStop(0.7, 'rgba(30, 30, 30, 0.95)');
    gradR.addColorStop(1, 'rgba(180, 180, 180, 0)');
    ctxR.fillStyle = gradR;
    ctxR.beginPath();
    ctxR.ellipse(p.x, p.y, p.rx, p.ry, 0.2, 0, Math.PI * 2);
    ctxR.fill();

    // Bump puddle: flat smooth water
    ctxB.fillStyle = '#808080';
    ctxB.beginPath();
    ctxB.ellipse(p.x, p.y, p.rx * 0.9, p.ry * 0.9, 0.2, 0, Math.PI * 2);
    ctxB.fill();
  });

  const map = new THREE.CanvasTexture(diffuseCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(6, 6);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(6, 6);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(6, 6);

  return { map, roughnessMap, bumpMap };
}

// 2. Castle Ashlar Masonry Stone for Fortress Walls and Towers
/** Generates the stone surface maps shared by castle masonry props. */
export function createCastleStonePBR(): PBRMaterialSet {
  const size = 512;
  const canvasD = document.createElement('canvas');
  canvasD.width = size;
  canvasD.height = size;
  const ctxD = canvasD.getContext('2d')!;

  const canvasR = document.createElement('canvas');
  canvasR.width = size;
  canvasR.height = size;
  const ctxR = canvasR.getContext('2d')!;

  const canvasB = document.createElement('canvas');
  canvasB.width = size;
  canvasB.height = size;
  const ctxB = canvasB.getContext('2d')!;

  // Dark Gothic mortar
  ctxD.fillStyle = '#334155';
  ctxD.fillRect(0, 0, size, size);

  ctxR.fillStyle = '#cbd5e1';
  ctxR.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#475569';
  ctxB.fillRect(0, 0, size, size);

  const rows = 12;
  const cols = 8;
  const bW = size / cols;
  const bH = size / rows;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2 === 0) ? 0 : bW * 0.5;
    for (let c = -1; c < cols + 1; c++) {
      const x = c * bW + offsetX;
      const y = r * bH;
      const pad = 2;

      // Brightened medieval ashlar stone blocks (grey-blue limestone)
      const baseVal = Math.floor(90 + Math.random() * 45);
      ctxD.fillStyle = `rgb(${baseVal}, ${baseVal + 5}, ${baseVal + 14})`;
      ctxD.fillRect(x + pad, y + pad, bW - pad * 2, bH - pad * 2);

      // Random stone surface texture specks
      for (let s = 0; s < 12; s++) {
        const sx = x + pad + Math.random() * (bW - pad * 2);
        const sy = y + pad + Math.random() * (bH - pad * 2);
        ctxD.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
        ctxD.fillRect(sx, sy, 3, 3);
      }

      ctxB.fillStyle = '#b0b0b0';
      ctxB.fillRect(x + pad, y + pad, bW - pad * 2, bH - pad * 2);
    }
  }

  const map = new THREE.CanvasTexture(canvasD);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 3);

  const roughnessMap = new THREE.CanvasTexture(canvasR);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 3);

  const bumpMap = new THREE.CanvasTexture(canvasB);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 3);

  return { map, roughnessMap, bumpMap };
}

// 3. Weathered Dark Medieval Wood for carts, tavern beams, barrels
/** Generates weathered wood maps for trunks, props, and structural details. */
export function createMedievalWoodPBR(): PBRMaterialSet {
  const size = 256;
  const canvasD = document.createElement('canvas');
  canvasD.width = size;
  canvasD.height = size;
  const ctxD = canvasD.getContext('2d')!;

  const canvasR = document.createElement('canvas');
  canvasR.width = size;
  canvasR.height = size;
  const ctxR = canvasR.getContext('2d')!;

  const canvasB = document.createElement('canvas');
  canvasB.width = size;
  canvasB.height = size;
  const ctxB = canvasB.getContext('2d')!;

  // Weathered medieval oak - Warm rich tone
  ctxD.fillStyle = '#452b14';
  ctxD.fillRect(0, 0, size, size);

  // Grain lines
  for (let i = 0; i < size; i += 4) {
    const val = Math.floor(55 + Math.sin(i * 0.2) * 16 + Math.random() * 12);
    ctxD.fillStyle = `rgb(${val + 18}, ${val + 4}, ${Math.max(10, val - 12)})`;
    ctxD.fillRect(0, i, size, 3);
  }

  ctxR.fillStyle = '#c4b5a5';
  ctxR.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#606060';
  ctxB.fillRect(0, 0, size, size);

  const map = new THREE.CanvasTexture(canvasD);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const roughnessMap = new THREE.CanvasTexture(canvasR);
  const bumpMap = new THREE.CanvasTexture(canvasB);

  return { map, roughnessMap, bumpMap };
}

// 4. Nocturnal Forest Clearing Ground PBR (Moist dark earth, moss patches, pine needles)
/** Creates a natural forest-floor texture set for the active arena environment. */
export function createForestGroundPBR(): PBRMaterialSet {
  const size = 512;
  const canvasD = document.createElement('canvas');
  canvasD.width = size;
  canvasD.height = size;
  const ctxD = canvasD.getContext('2d')!;

  const canvasR = document.createElement('canvas');
  canvasR.width = size;
  canvasR.height = size;
  const ctxR = canvasR.getContext('2d')!;

  const canvasB = document.createElement('canvas');
  canvasB.width = size;
  canvasB.height = size;
  const ctxB = canvasB.getContext('2d')!;

  // Rich nocturnal forest humus, lifted enough to reveal the ground detail in moonlight
  ctxD.fillStyle = '#202a1f';
  ctxD.fillRect(0, 0, size, size);

  ctxR.fillStyle = '#b0b8b0'; // Mostly matte earth
  ctxR.fillRect(0, 0, size, size);

  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, size, size);

  // Soft mossy clusters & damp earth patches
  for (let i = 0; i < 48; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const pr = 18 + Math.random() * 45;

    // Forest moss gradient
    const mossGrad = ctxD.createRadialGradient(px, py, 2, px, py, pr);
    const mossG = Math.floor(54 + Math.random() * 30);
    const mossR = Math.floor(mossG * 0.6);
    const mossB = Math.floor(mossG * 0.45);
    mossGrad.addColorStop(0, `rgba(${mossR}, ${mossG}, ${mossB}, 0.85)`);
    mossGrad.addColorStop(0.7, `rgba(${mossR * 0.7}, ${mossG * 0.7}, ${mossB * 0.7}, 0.45)`);
    mossGrad.addColorStop(1, 'rgba(32, 42, 31, 0)');
    ctxD.fillStyle = mossGrad;
    ctxD.beginPath();
    ctxD.arc(px, py, pr, 0, Math.PI * 2);
    ctxD.fill();

    // Moss roughness (softer, catches gentle moonlight sheen)
    const mossRGrad = ctxR.createRadialGradient(px, py, 2, px, py, pr);
    mossRGrad.addColorStop(0, 'rgba(80, 80, 80, 0.6)');
    mossRGrad.addColorStop(1, 'rgba(180, 180, 180, 0)');
    ctxR.fillStyle = mossRGrad;
    ctxR.beginPath();
    ctxR.arc(px, py, pr, 0, Math.PI * 2);
    ctxR.fill();

    // Bump relief for moss pads
    ctxB.fillStyle = 'rgba(160, 160, 160, 0.35)';
    ctxB.beginPath();
    ctxB.arc(px, py, pr * 0.8, 0, Math.PI * 2);
    ctxB.fill();
  }

  // Scattered pine needles, organic specks, and fallen leaves
  for (let n = 0; n < 350; n++) {
    const lx = Math.random() * size;
    const ly = Math.random() * size;
    const len = 3 + Math.random() * 8;
    const rot = Math.random() * Math.PI;

    ctxD.save();
    ctxD.translate(lx, ly);
    ctxD.rotate(rot);
    const needleColor = Math.random() > 0.4 ? '#332314' : '#2b3822';
    ctxD.fillStyle = needleColor;
    ctxD.fillRect(-len / 2, -0.8, len, 1.6);
    ctxD.restore();

    ctxB.fillStyle = '#9c9c9c';
    ctxB.fillRect(lx, ly, 2, 2);
  }

  // Moist soil puddles / dark damp earth patches
  for (let d = 0; d < 12; d++) {
    const dx = Math.random() * size;
    const dy = Math.random() * size;
    const dr = 10 + Math.random() * 22;
    const dampGrad = ctxD.createRadialGradient(dx, dy, 2, dx, dy, dr);
    dampGrad.addColorStop(0, 'rgba(12, 16, 14, 0.9)');
    dampGrad.addColorStop(1, 'rgba(22, 30, 22, 0)');
    ctxD.fillStyle = dampGrad;
    ctxD.beginPath();
    ctxD.arc(dx, dy, dr, 0, Math.PI * 2);
    ctxD.fill();

    // Specular damp sheen
    const dampR = ctxR.createRadialGradient(dx, dy, 2, dx, dy, dr);
    dampR.addColorStop(0, 'rgba(30, 30, 30, 0.85)');
    dampR.addColorStop(1, 'rgba(180, 180, 180, 0)');
    ctxR.fillStyle = dampR;
    ctxR.beginPath();
    ctxR.arc(dx, dy, dr, 0, Math.PI * 2);
    ctxR.fill();
  }

  const map = new THREE.CanvasTexture(canvasD);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  const roughnessMap = new THREE.CanvasTexture(canvasR);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);

  const bumpMap = new THREE.CanvasTexture(canvasB);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(8, 8);

  return { map, roughnessMap, bumpMap };
}
