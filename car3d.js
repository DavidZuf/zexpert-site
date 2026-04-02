import * as THREE from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const wrap   = document.querySelector('.hero__car-wrap');
const canvas = document.getElementById('carCanvas');

// ── RENDERER ──
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace     = THREE.SRGBColorSpace;
renderer.toneMapping          = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure  = 1.4;
renderer.shadowMap.enabled    = false;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);

// ── LIGHTS — tuned for white background ──
scene.add(new THREE.AmbientLight(0xffffff, 2.2));

const key = new THREE.DirectionalLight(0xfff0e0, 2.8);
key.position.set(5, 8, 6);
scene.add(key);

const fill = new THREE.DirectionalLight(0xffffff, 1.2);
fill.position.set(-8, 4, 3);
scene.add(fill);

// Warm orange rim from behind — matches brand
const rim = new THREE.DirectionalLight(0xC4622D, 1.6);
rim.position.set(-2, 5, -8);
scene.add(rim);

// Bottom fill — simulates white ground bounce
const ground = new THREE.DirectionalLight(0xffffff, 0.8);
ground.position.set(0, -5, 0);
scene.add(ground);

// ── LOAD ──
const draco = new DRACOLoader();
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(draco);

let car      = null;
let carBaseY = 0;   // store initial Y so float is relative to it

loader.load('images/datsun.glb', (gltf) => {
  car = gltf.scene;
  scene.add(car);

  // Compute true bounding box after adding to scene
  const box    = new THREE.Box3().setFromObject(car);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());

  // Center model horizontally & depth, sit bottom at y=0
  car.position.x -= center.x;
  car.position.z -= center.z;
  car.position.y -= box.min.y;       // lift so bottom sits at y = 0

  // Recompute center after repositioning
  const newCenter = new THREE.Vector3(0, size.y / 2, 0);
  carBaseY = car.position.y;

  // Fit camera using bounding sphere
  const sphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(car).getBoundingSphere(sphere);

  const fovRad = (camera.fov * Math.PI) / 180;
  // tight fit: sphere fills ~85% of view height
  const dist   = (sphere.radius / Math.tan(fovRad / 2)) * 1.15;

  // 3/4 front-left view, eye-level with car roof
  camera.position.set(
    sphere.center.x - dist * 0.28,   // slightly left
    sphere.center.y + size.y * 0.15, // just above centre
    sphere.center.z + dist * 0.92    // mostly in front
  );
  camera.lookAt(sphere.center.x, sphere.center.y * 0.9, sphere.center.z);

  setSize();
}, undefined, (err) => console.error('GLB error:', err));

// ── RESIZE ──
function setSize() {
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
setSize();
new ResizeObserver(setSize).observe(wrap);

// ── ANIMATE ──
const clock = new THREE.Clock();
let frameId = null;

new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { if (!frameId) tick(); }
  else { cancelAnimationFrame(frameId); frameId = null; }
}, { threshold: 0 }).observe(document.getElementById('hero'));

function tick() {
  frameId = requestAnimationFrame(tick);
  const t = clock.getElapsedTime();

  if (car) {
    car.rotation.y = t * 0.22;  // slow rotation only
  }

  renderer.render(scene, camera);
}
