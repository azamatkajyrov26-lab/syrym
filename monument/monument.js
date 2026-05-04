/* =========================================================
   3D MONUMENT CONFIGURATOR — Three.js
   Strunctura: процедурная модель кешене (мусульманский мазар)
   Сцена: жёлтый кирпич + чёрная мраморная плита + уйшык + цоколь + брусчатка
   ========================================================= */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============= СТЕЙТ КОНФИГУРАЦИИ =============
const state = {
  brick: 'yellow',         // yellow | red | white | grey
  size: 'medium',          // small | medium | large
  wallHeight: 'mid',       // low | mid | high
  plate: 'black',          // black | grey | white | green
  plateSize: '60x100',     // 50x90 | 60x100 | 80x120 | 100x150
  name: '',                // ФИО для гравировки
  dates: '',               // годы жизни
  dome: 'ball',            // ball | dome | spire | none
  domeColor: 'gold',       // gold | silver | black | green
  base: 'dark',            // dark | granite | light
  paving: 'grey',          // grey | sand | red | none
  merlons: 'yes',          // yes | no
  towers: 'yes',           // yes | no
  step: 1                  // 1..4
};

// ============= ЦВЕТА И МАТЕРИАЛЫ =============
const COLORS = {
  brick: {
    yellow: { main: 0xe8b950, mortar: 0xc99238 },
    red:    { main: 0xa04438, mortar: 0x7a2f24 },
    white:  { main: 0xece4d3, mortar: 0xcfc4ad },
    grey:   { main: 0x8a8580, mortar: 0x5e5a55 }
  },
  plate: {
    black: 0x1a1a1c,
    grey:  0x5a5e62,
    white: 0xf0ebe1,
    green: 0x2c4a3a
  },
  dome: {
    gold:   0xe8c547,
    silver: 0xc8c8ca,
    black:  0x2a2a2c,
    green:  0x2a8049
  },
  base: {
    dark:    0x3a3d40,
    granite: 0x1a1a1c,
    light:   0xada79a
  },
  paving: {
    grey: 0x9b9892,
    sand: 0xc6b591,
    red:  0xa86040,
    none: null
  }
};

const SIZE_PRESETS = {
  small:  { w: 3.0, d: 2.0 },
  medium: { w: 4.0, d: 3.0 },
  large:  { w: 5.0, d: 4.0 }
};
const WALL_HEIGHTS = { low: 1.5, mid: 1.8, high: 2.2 };
const PLATE_SIZES = {
  '50x90':  { w: 0.5, h: 0.9 },
  '60x100': { w: 0.6, h: 1.0 },
  '80x120': { w: 0.8, h: 1.2 },
  '100x150':{ w: 1.0, h: 1.5 }
};

// ============= THREE.JS SETUP =============
const canvas = document.getElementById('m-canvas');
const stage = canvas.parentElement;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe8eef0, 25, 60);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
camera.position.set(7, 4, 9);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// ============= НЕБО (gradient sky dome) =============
const skyGeo = new THREE.SphereGeometry(80, 32, 16);
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  uniforms: {
    topColor: { value: new THREE.Color(0x7eb6dc) },
    bottomColor: { value: new THREE.Color(0xe8eef0) },
    offset: { value: 8 },
    exponent: { value: 0.6 }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
    }
  `
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

// ============= СВЕТ =============
const ambient = new THREE.HemisphereLight(0xc8e0f0, 0x665544, 0.6);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff0d0, 1.4);
sun.position.set(8, 12, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 30;
sun.shadow.bias = -0.0005;
scene.add(sun);

// ============= ЗЕМЛЯ =============
const groundGeo = new THREE.PlaneGeometry(80, 80);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x9bb085, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ============= ORBIT CONTROLS =============
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // не уходить под землю
controls.target.set(0, 1, 0);

// ============= ROOT GROUP (вся постройка) =============
const monumentGroup = new THREE.Group();
scene.add(monumentGroup);

// ============= ПРОЦЕДУРНАЯ ТЕКСТУРА КИРПИЧА =============
function createBrickTexture(mainHex, mortarHex, scale = 1) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  // фон-шов
  ctx.fillStyle = '#' + mortarHex.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, 512, 512);

  // кирпичи
  const main = '#' + mainHex.toString(16).padStart(6, '0');
  const brickH = 32;
  const brickW = 64;
  const gap = 4;
  let row = 0;
  for (let y = 0; y < 512; y += brickH + gap) {
    const offset = (row % 2 === 0) ? 0 : -brickW / 2;
    for (let x = offset; x < 512 + brickW; x += brickW + gap) {
      // лёгкая случайная вариация цвета
      const variance = Math.floor(Math.random() * 25 - 12);
      const r = Math.max(0, Math.min(255, ((mainHex >> 16) & 0xff) + variance));
      const g = Math.max(0, Math.min(255, ((mainHex >> 8)  & 0xff) + variance));
      const b = Math.max(0, Math.min(255, ((mainHex)       & 0xff) + variance));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, brickW, brickH);

      // тень снизу
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, y + brickH - 2, brickW, 2);
      // блик сверху
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(x, y, brickW, 2);
    }
    row++;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(scale, scale);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============= ТЕКСТУРА ПЛИТЫ С ГРАВИРОВКОЙ =============
function createPlateTexture(plateHex, name, dates) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 768;
  const ctx = c.getContext('2d');

  // мраморный фон с шумом
  const baseColor = '#' + plateHex.toString(16).padStart(6, '0');
  const grad = ctx.createLinearGradient(0, 0, 0, 768);
  grad.addColorStop(0, baseColor);
  grad.addColorStop(0.5, shiftHex(plateHex, 12));
  grad.addColorStop(1, shiftHex(plateHex, -8));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // мраморные прожилки
  ctx.strokeStyle = `rgba(255,255,255,${plateHex === 0xf0ebe1 ? 0.03 : 0.10})`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 768,
      Math.random() * 512, Math.random() * 768,
      Math.random() * 512, 768
    );
    ctx.stroke();
  }

  // гравировка
  const isLight = (plateHex === 0xf0ebe1);
  const textColor = isLight ? '#222' : '#e6dfc8';

  if (name) {
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px serif';
    wrapText(ctx, name.toUpperCase(), 256, 320, 440, 44);
  }
  if (dates) {
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = '28px serif';
    ctx.fillText(dates, 256, 460);
  }

  // декоративный полумесяц вверху
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(256, 130, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.arc(264, 125, 28, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

function shiftHex(hex, amount) {
  const r = Math.max(0, Math.min(255, ((hex >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((hex >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (hex & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

// ============= ТЕКСТУРА БРУСЧАТКИ =============
function createPavingTexture(colorHex) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, 256, 256);
  const baseColor = colorHex;
  const tile = 32;
  let row = 0;
  for (let y = 0; y < 256; y += tile) {
    const offset = (row % 2 === 0) ? 0 : -tile / 2;
    for (let x = offset; x < 256 + tile; x += tile) {
      const v = Math.floor(Math.random() * 30 - 15);
      const r = Math.max(0, Math.min(255, ((baseColor >> 16) & 0xff) + v));
      const g = Math.max(0, Math.min(255, ((baseColor >> 8) & 0xff) + v));
      const b = Math.max(0, Math.min(255, (baseColor & 0xff) + v));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
    }
    row++;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ============= ПОСТРОЕНИЕ КЕШЕНЕ =============
function buildMonument() {
  // очистка
  while (monumentGroup.children.length) {
    const c = monumentGroup.children[0];
    monumentGroup.remove(c);
    if (c.geometry) c.geometry.dispose();
    if (c.material) {
      if (Array.isArray(c.material)) c.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
      else { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
    }
  }

  const sz = SIZE_PRESETS[state.size];
  const W = sz.w;       // ширина (длинная сторона, X)
  const D = sz.d;       // глубина (короткая, Z)
  const H = WALL_HEIGHTS[state.wallHeight];
  const wallThickness = 0.3;

  const brickColors = COLORS.brick[state.brick];
  const brickTex = createBrickTexture(brickColors.main, brickColors.mortar, 2);

  const brickMat = new THREE.MeshStandardMaterial({
    map: brickTex,
    roughness: 0.85,
    metalness: 0
  });

  // ====== ЦОКОЛЬ (тёмное основание) ======
  const baseColor = COLORS.base[state.base];
  const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7 });
  const baseHeight = 0.25;
  const baseGeo = new THREE.BoxGeometry(W + 0.4, baseHeight, D + 0.4);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = baseHeight / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  monumentGroup.add(base);

  // ====== БРУСЧАТКА вокруг ======
  if (state.paving !== 'none') {
    const pavingTex = createPavingTexture(COLORS.paving[state.paving]);
    pavingTex.repeat.set(4, 4);
    const pavingMat = new THREE.MeshStandardMaterial({ map: pavingTex, roughness: 0.95 });
    const pavingSize = Math.max(W, D) + 4;
    const pavingGeo = new THREE.PlaneGeometry(pavingSize, pavingSize);
    const paving = new THREE.Mesh(pavingGeo, pavingMat);
    paving.rotation.x = -Math.PI / 2;
    paving.position.y = 0.01;
    paving.receiveShadow = true;
    monumentGroup.add(paving);
  }

  // ====== СТЕНЫ ======
  const wallY = baseHeight + H / 2;

  // задняя стена
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, wallThickness),
    brickMat
  );
  backWall.position.set(0, wallY, -D / 2 + wallThickness / 2);
  backWall.castShadow = true; backWall.receiveShadow = true;
  monumentGroup.add(backWall);

  // боковые стены
  const sideGeo = new THREE.BoxGeometry(wallThickness, H, D - wallThickness * 2);
  const leftWall = new THREE.Mesh(sideGeo, brickMat);
  leftWall.position.set(-W / 2 + wallThickness / 2, wallY, 0);
  leftWall.castShadow = true; leftWall.receiveShadow = true;
  monumentGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideGeo, brickMat);
  rightWall.position.set(W / 2 - wallThickness / 2, wallY, 0);
  rightWall.castShadow = true; rightWall.receiveShadow = true;
  monumentGroup.add(rightWall);

  // ПЕРЕДНЯЯ СТЕНА с проёмом для арки
  // Вместо одной плоскости — соберём из частей
  const ps = PLATE_SIZES[state.plateSize];
  const archW = Math.max(0.8, ps.w + 0.3); // ширина арки
  const archH = Math.min(H * 0.7, ps.h + 0.4);   // высота арки
  const sideW = (W - archW) / 2;

  // левая часть
  const frontLeft = new THREE.Mesh(
    new THREE.BoxGeometry(sideW, H, wallThickness),
    brickMat
  );
  frontLeft.position.set(-W / 2 + sideW / 2, wallY, D / 2 - wallThickness / 2);
  frontLeft.castShadow = true; frontLeft.receiveShadow = true;
  monumentGroup.add(frontLeft);

  // правая часть
  const frontRight = new THREE.Mesh(
    new THREE.BoxGeometry(sideW, H, wallThickness),
    brickMat
  );
  frontRight.position.set(W / 2 - sideW / 2, wallY, D / 2 - wallThickness / 2);
  frontRight.castShadow = true; frontRight.receiveShadow = true;
  monumentGroup.add(frontRight);

  // верхняя перемычка (над аркой)
  const topY = baseHeight + archH;
  const topPart = new THREE.Mesh(
    new THREE.BoxGeometry(archW, H - archH, wallThickness),
    brickMat
  );
  topPart.position.set(0, topY + (H - archH) / 2, D / 2 - wallThickness / 2);
  topPart.castShadow = true; topPart.receiveShadow = true;
  monumentGroup.add(topPart);

  // ====== АРКА (треугольный фронтон над плитой) ======
  const archShape = new THREE.Shape();
  archShape.moveTo(-archW / 2 - 0.15, 0);
  archShape.lineTo(-archW / 2 - 0.15, 0.05);
  archShape.lineTo(0, 0.6);
  archShape.lineTo(archW / 2 + 0.15, 0.05);
  archShape.lineTo(archW / 2 + 0.15, 0);
  archShape.closePath();
  const archGeo = new THREE.ExtrudeGeometry(archShape, { depth: wallThickness, bevelEnabled: false });
  const archMesh = new THREE.Mesh(archGeo, brickMat);
  archMesh.position.set(0, baseHeight + H, D / 2 - wallThickness);
  archMesh.castShadow = true; archMesh.receiveShadow = true;
  monumentGroup.add(archMesh);

  // ====== ПАМЯТНАЯ ПЛИТА (мрамор/гранит) ======
  const plateColor = COLORS.plate[state.plate];
  const plateTex = createPlateTexture(plateColor, state.name, state.dates);
  const plateMat = new THREE.MeshStandardMaterial({
    map: plateTex,
    color: 0xffffff,
    roughness: state.plate === 'white' ? 0.4 : 0.25,
    metalness: 0.05
  });

  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(ps.w, ps.h, 0.06),
    plateMat
  );
  plate.position.set(0, baseHeight + 0.2 + ps.h / 2, D / 2 - wallThickness * 0.8);
  plate.castShadow = true; plate.receiveShadow = true;
  monumentGroup.add(plate);

  // рамка вокруг плиты (тонкая)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.4 });
  const frameThickness = 0.04;
  const fT = new THREE.Mesh(new THREE.BoxGeometry(ps.w + frameThickness * 2, frameThickness, 0.07), frameMat);
  fT.position.set(0, baseHeight + 0.2 + ps.h + frameThickness / 2, D / 2 - wallThickness * 0.8);
  monumentGroup.add(fT);
  const fB = new THREE.Mesh(new THREE.BoxGeometry(ps.w + frameThickness * 2, frameThickness, 0.07), frameMat);
  fB.position.set(0, baseHeight + 0.2 - frameThickness / 2, D / 2 - wallThickness * 0.8);
  monumentGroup.add(fB);
  const fL = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, ps.h, 0.07), frameMat);
  fL.position.set(-ps.w / 2 - frameThickness / 2, baseHeight + 0.2 + ps.h / 2, D / 2 - wallThickness * 0.8);
  monumentGroup.add(fL);
  const fR = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, ps.h, 0.07), frameMat);
  fR.position.set(ps.w / 2 + frameThickness / 2, baseHeight + 0.2 + ps.h / 2, D / 2 - wallThickness * 0.8);
  monumentGroup.add(fR);

  // ====== УГЛОВЫЕ БАШНИ ======
  if (state.towers === 'yes') {
    const towerW = 0.6;
    const towerH = H + 0.4;
    const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerW);
    const positions = [
      [-W / 2 + towerW / 2, baseHeight + towerH / 2, -D / 2 + towerW / 2],
      [ W / 2 - towerW / 2, baseHeight + towerH / 2, -D / 2 + towerW / 2],
      [-W / 2 + towerW / 2, baseHeight + towerH / 2,  D / 2 - towerW / 2],
      [ W / 2 - towerW / 2, baseHeight + towerH / 2,  D / 2 - towerW / 2]
    ];
    positions.forEach(p => {
      const t = new THREE.Mesh(towerGeo, brickMat);
      t.position.set(...p);
      t.castShadow = true; t.receiveShadow = true;
      monumentGroup.add(t);

      // зубцы наверху башни
      if (state.merlons === 'yes') {
        addMerlons(t, towerW, baseHeight + towerH, brickMat);
      }
    });
  }

  // ====== ЗУБЦЫ НА СТЕНАХ ======
  if (state.merlons === 'yes') {
    addWallMerlons(W, D, baseHeight + H, wallThickness, brickMat);
  }

  // ====== УЙШЫК (купол) ======
  if (state.dome !== 'none') {
    const domeColor = COLORS.dome[state.domeColor];
    const domeMat = new THREE.MeshStandardMaterial({
      color: domeColor,
      roughness: state.domeColor === 'gold' || state.domeColor === 'silver' ? 0.25 : 0.5,
      metalness: state.domeColor === 'gold' || state.domeColor === 'silver' ? 0.85 : 0.2
    });

    const domeY = baseHeight + H + 0.6;
    const domeX = 0;
    const domeZ = D / 2 - wallThickness;

    if (state.dome === 'ball') {
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), domeMat);
      ball.position.set(domeX, domeY, domeZ);
      ball.castShadow = true;
      monumentGroup.add(ball);
      addCrescent(domeX, domeY + 0.32, domeZ, domeMat);
    } else if (state.dome === 'dome') {
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        domeMat
      );
      dome.position.set(domeX, domeY, domeZ);
      dome.castShadow = true;
      monumentGroup.add(dome);
      addCrescent(domeX, domeY + 0.55, domeZ, domeMat);
    } else if (state.dome === 'spire') {
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.5, 12),
        domeMat
      );
      spire.position.set(domeX, domeY + 0.1, domeZ);
      spire.castShadow = true;
      monumentGroup.add(spire);
      addCrescent(domeX, domeY + 0.5, domeZ, domeMat);
    }
  }
}

// зубцы по углам башни
function addMerlons(tower, towerW, topY, mat) {
  const merlonH = 0.15;
  const corners = [
    [-towerW / 2 + 0.075, towerW / 2 - 0.075],
    [ towerW / 2 - 0.075, towerW / 2 - 0.075],
    [-towerW / 2 + 0.075, -towerW / 2 + 0.075],
    [ towerW / 2 - 0.075, -towerW / 2 + 0.075]
  ];
  corners.forEach(([x, z]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, merlonH, 0.15), mat);
    m.position.set(tower.position.x + x, topY + merlonH / 2, tower.position.z + z);
    m.castShadow = true;
    monumentGroup.add(m);
  });
}

// зубцы вдоль верха стен (между башнями)
function addWallMerlons(W, D, topY, thick, mat) {
  const merlonW = 0.15;
  const merlonH = 0.18;
  const merlonGap = 0.18;
  const margin = 0.7;

  // вдоль X (передняя и задняя)
  for (let x = -W / 2 + margin; x <= W / 2 - margin - merlonW; x += merlonW + merlonGap) {
    // задняя
    const mb = new THREE.Mesh(new THREE.BoxGeometry(merlonW, merlonH, thick), mat);
    mb.position.set(x + merlonW / 2, topY + merlonH / 2, -D / 2 + thick / 2);
    mb.castShadow = true;
    monumentGroup.add(mb);
  }
  // вдоль Z (боковые)
  for (let z = -D / 2 + margin; z <= D / 2 - margin - merlonW; z += merlonW + merlonGap) {
    const ml = new THREE.Mesh(new THREE.BoxGeometry(thick, merlonH, merlonW), mat);
    ml.position.set(-W / 2 + thick / 2, topY + merlonH / 2, z + merlonW / 2);
    ml.castShadow = true;
    monumentGroup.add(ml);

    const mr = new THREE.Mesh(new THREE.BoxGeometry(thick, merlonH, merlonW), mat);
    mr.position.set(W / 2 - thick / 2, topY + merlonH / 2, z + merlonW / 2);
    mr.castShadow = true;
    monumentGroup.add(mr);
  }
}

// полумесяц над куполом
function addCrescent(x, y, z, mat) {
  const ringGeo = new THREE.TorusGeometry(0.1, 0.018, 8, 24, Math.PI * 1.5);
  const ring = new THREE.Mesh(ringGeo, mat);
  ring.position.set(x, y, z);
  ring.rotation.z = Math.PI * 0.25;
  ring.castShadow = true;
  monumentGroup.add(ring);

  // тонкая ножка
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8),
    mat
  );
  stem.position.set(x, y - 0.1, z);
  stem.castShadow = true;
  monumentGroup.add(stem);
}

// ============= КАМЕРА: ПРЕДУСТАНОВКИ =============
const CAMERA_VIEWS = {
  front: { pos: [0, 2.2, 8.5], target: [0, 1.5, 0] },
  side:  { pos: [8.5, 2.2, 0], target: [0, 1.5, 0] },
  back:  { pos: [0, 2.5, -8.5], target: [0, 1.5, 0] },
  top:   { pos: [0, 11, 0.01], target: [0, 0.5, 0] },
  orbit: null  // авто-вращение
};

let orbiting = false;

function setView(name) {
  document.querySelectorAll('.m-view').forEach(b =>
    b.classList.toggle('m-view--active', b.dataset.view === name)
  );

  if (name === 'orbit') {
    orbiting = true;
    return;
  }
  orbiting = false;

  const v = CAMERA_VIEWS[name];
  if (!v) return;

  // плавный переход
  animateCamera(camera.position.clone(), new THREE.Vector3(...v.pos),
                controls.target.clone(), new THREE.Vector3(...v.target), 600);
}

function animateCamera(p1, p2, t1, t2, duration) {
  const start = performance.now();
  function step() {
    const t = Math.min(1, (performance.now() - start) / duration);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    camera.position.lerpVectors(p1, p2, e);
    controls.target.lerpVectors(t1, t2, e);
    controls.update();
    if (t < 1) requestAnimationFrame(step);
  }
  step();
}

// ============= RESIZE =============
function onResize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);

// ============= ANIMATION LOOP =============
function animate() {
  requestAnimationFrame(animate);
  if (orbiting) {
    const t = performance.now() * 0.0003;
    camera.position.x = Math.cos(t) * 9;
    camera.position.z = Math.sin(t) * 9;
    camera.position.y = 3 + Math.sin(t * 0.5) * 0.5;
    camera.lookAt(0, 1.2, 0);
  }
  controls.update();
  renderer.render(scene, camera);
}

// ============= UI: SWATCHES / CHIPS / CARDS =============
function bindSelector(selector, klass) {
  document.querySelectorAll(selector).forEach(group => {
    const key = group.dataset.key;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest(`.${klass}`);
      if (!btn) return;
      group.querySelectorAll(`.${klass}`).forEach(b => {
        b.classList.remove(`${klass}--active`);
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add(`${klass}--active`);
      btn.setAttribute('aria-checked', 'true');
      state[key] = btn.dataset.value;
      buildMonument();
    });
  });
}

bindSelector('.m-swatches', 'm-swatch');
bindSelector('.m-chips', 'm-chip');
bindSelector('.m-cards', 'm-card');

// Инпуты ФИО / даты
const debounce = (fn, ms) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
const onTextChange = debounce(() => {
  state.name = document.getElementById('m-name').value;
  state.dates = document.getElementById('m-dates').value;
  buildMonument();
}, 300);
document.getElementById('m-name').addEventListener('input', onTextChange);
document.getElementById('m-dates').addEventListener('input', onTextChange);

// Кнопки ракурсов
document.querySelectorAll('.m-view').forEach(b => {
  b.addEventListener('click', () => setView(b.dataset.view));
});

// ============= STEPS NAVIGATION =============
const stepEls = document.querySelectorAll('.m-step');
const progressEls = document.querySelectorAll('.m-progress__step');
const prevBtn = document.getElementById('m-prev');
const nextBtn = document.getElementById('m-next');
const finishBtn = document.getElementById('m-finish');
const totalSteps = stepEls.length;

function showStep(n) {
  state.step = n;
  stepEls.forEach(el => el.classList.toggle('m-step--active', +el.dataset.step === n));
  progressEls.forEach(el => {
    const s = +el.dataset.step;
    el.classList.toggle('m-progress__step--active', s === n);
    el.classList.toggle('m-progress__step--done', s < n);
  });
  prevBtn.disabled = (n === 1);
  if (n === totalSteps) {
    nextBtn.hidden = true;
    finishBtn.hidden = false;
  } else {
    nextBtn.hidden = false;
    finishBtn.hidden = true;
  }
  // прокручиваем панель к началу
  document.querySelector('.m-panel').scrollTop = 0;
}

prevBtn.addEventListener('click', () => { if (state.step > 1) showStep(state.step - 1); });
nextBtn.addEventListener('click', () => { if (state.step < totalSteps) showStep(state.step + 1); });

// ============= ФИНАЛИЗАЦИЯ — SUMMARY MODAL =============
const modal = document.getElementById('m-summary');
const sumList = document.getElementById('m-sum-list');
const snapshot = document.getElementById('m-snapshot');
const sendWA = document.getElementById('m-send-wa');
const downloadBtn = document.getElementById('m-download');

const LABELS = {
  brick: { yellow: 'Жёлтый', red: 'Красный', white: 'Белый', grey: 'Серый' },
  size: { small: 'Малый (2×3 м)', medium: 'Средний (3×4 м)', large: 'Большой (4×5 м)' },
  wallHeight: { low: '1.5 м', mid: '1.8 м', high: '2.2 м' },
  plate: { black: 'Чёрный гранит', grey: 'Серый гранит', white: 'Белый мрамор', green: 'Зелёный мрамор' },
  plateSize: { '50x90': '50×90 см', '60x100': '60×100 см', '80x120': '80×120 см', '100x150': '100×150 см' },
  dome: { ball: 'Шарик', dome: 'Купол', spire: 'Шпиль', none: 'Без купола' },
  domeColor: { gold: 'Золотой', silver: 'Серебряный', black: 'Чёрный', green: 'Зелёный' },
  base: { dark: 'Тёмный бетон', granite: 'Чёрный гранит', light: 'Светлый камень' },
  paving: { grey: 'Серая брусчатка', sand: 'Песочная брусчатка', red: 'Красная брусчатка', none: 'Без брусчатки' },
  merlons: { yes: 'С зубцами', no: 'Без зубцов' },
  towers: { yes: 'С угловыми башнями', no: 'Без башен' }
};

function buildSummary() {
  const items = [
    ['Цвет кирпича', LABELS.brick[state.brick]],
    ['Размер', LABELS.size[state.size]],
    ['Высота стен', LABELS.wallHeight[state.wallHeight]],
    ['Плита', `${LABELS.plate[state.plate]}, ${LABELS.plateSize[state.plateSize]}`],
    ['Уйшық', state.dome === 'none' ? 'нет' : `${LABELS.dome[state.dome]}, ${LABELS.domeColor[state.domeColor]}`],
    ['Цоколь', LABELS.base[state.base]],
    ['Брусчатка', LABELS.paving[state.paving]],
    ['Башни', LABELS.towers[state.towers]],
    ['Зубцы', LABELS.merlons[state.merlons]]
  ];
  if (state.name) items.push(['Гравировка ФИО', state.name]);
  if (state.dates) items.push(['Годы жизни', state.dates]);
  return items;
}

function renderSummary() {
  const items = buildSummary();
  sumList.innerHTML = items.map(([k, v]) =>
    `<li><span>${k}</span><span>${escape(v)}</span></li>`
  ).join('');
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
}

function buildWhatsAppText() {
  const items = buildSummary();
  let text = `Здравствуйте, Syrym Sheberhanasy!\n\nХочу заказать памятный комплекс (кешене):\n\n`;
  items.forEach(([k, v]) => {
    text += `• ${k}: ${v}\n`;
  });
  text += `\nПодскажите, пожалуйста, цену и сроки изготовления. Спасибо.`;
  return encodeURIComponent(text);
}

function takeSnapshot() {
  // Сохраняем текущий размер
  const w = renderer.domElement.width;
  const h = renderer.domElement.height;
  // Делаем превью с лёгкой настройкой ракурса (фронт)
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

finishBtn.addEventListener('click', () => {
  // делаем снимок
  const dataURL = takeSnapshot();
  snapshot.src = dataURL;
  renderSummary();

  // ссылка на WhatsApp
  // Используем тот же номер что и в SYRYM_CONFIG главного сайта
  const PHONE = '77716547799';
  sendWA.href = `https://wa.me/${PHONE}?text=${buildWhatsAppText()}`;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
});

modal.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = snapshot.src;
  a.download = `syrym-monument-${Date.now()}.png`;
  a.click();
});

// Help button — даёт подсказку
document.getElementById('m-help').addEventListener('click', () => {
  alert('Покрутите модель пальцем (или мышкой), чтобы посмотреть со всех сторон.\nЩипком/колесом — приблизить.\nКнопки сверху — быстрые ракурсы.\n\nВыберите параметры справа — модель обновляется сразу.\nВ конце нажмите «Отправить в WhatsApp» — мы получим заявку с вашими параметрами.');
});

// ============= ИНИЦИАЛИЗАЦИЯ =============
onResize();
buildMonument();
showStep(1);
animate();

// Скрыть лоадер
setTimeout(() => {
  document.getElementById('m-loading').classList.add('is-hidden');
}, 500);
