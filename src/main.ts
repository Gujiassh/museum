import "./style.css";
import * as THREE from "three";
import vertexShader from "./glsl/vertex.glsl";
import fragmentShader from "./glsl/fragment.glsl";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GUI } from "dat.gui";

const gui = new GUI();

const params = {
  red: 0.25,
  green: 0.81,
  blue: 1.0,
  threshold: 0.35,
  strength: 0.38,
  radius: 0.63,
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Camera positioning
camera.position.set(6, 8, 14);

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

audioLoader.load("/M5000008aOkA3v4X0Q.mp3", (buffer) => {
  sound.setBuffer(buffer);
  window.addEventListener("click", () => {
    sound.play();
  });
});

const analyser = new THREE.AudioAnalyser(sound, 32);

const uniforms = {
  u_time: { value: 0.0 },
  u_frequency: { value: 0.0 },
  u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
  u_red: { value: params.red },
  u_green: { value: params.green },
  u_blue: { value: params.blue },
};

const mat = new THREE.ShaderMaterial({
  wireframe: true,
  uniforms,
  vertexShader,
  fragmentShader,
});

const get = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(get, mat);
scene.add(mesh);

const clock = new THREE.Clock();

renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  params.strength,
  params.radius,
  params.threshold
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(outputPass);

gui
  .add(params, "red")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    uniforms.u_red.value = value;
  });
gui
  .add(params, "green")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    uniforms.u_green.value = value;
  });
gui
  .add(params, "blue")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    uniforms.u_blue.value = value;
  });

gui
  .add(params, "threshold")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    bloomPass.threshold = value;
  });

gui
  .add(params, "strength")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    bloomPass.strength = value;
  });

gui
  .add(params, "radius")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    bloomPass.radius = value;
  });

// gui.open();

let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", function (e) {
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  mouseX = (e.clientX - windowHalfX) / 100;
  mouseY = (e.clientY - windowHalfY) / 100;
});

function animate() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.5;
  camera.lookAt(scene.position);


  uniforms.u_time.value = clock.getElapsedTime();
  uniforms.u_frequency.value = analyser.getAverageFrequency();
  bloomComposer.render();

  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener("mousemove", function (e) {
  uniforms.u_mouse.value.set(
    e.offsetX / this.window.innerWidth,
    1 - e.offsetY / this.window.innerHeight
  );
  uniforms.u_frequency.value = analyser.getAverageFrequency();
});
document.body.appendChild(renderer.domElement);
