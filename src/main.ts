import "./style.css";
import * as THREE from "three";
import {
  CSS2DObject,
  CSS2DRenderer,
  OrbitControls,
} from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import { createButton, type ButtonFactory } from "./libs/createButton";
import { buttonsConfig } from "./data/buttonsConfig";
import { resourceLoader } from "./libs/ResourceLoader";
import type { LoadProgress } from "./libs/ResourceLoader";
import { resourceManifest } from "./data/resources";

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

camera.position.set(-1.7, 0, 8.7);
camera.lookAt(0, 0, 0);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// 存储所有按钮实例
const buttonFactories: ButtonFactory[] = [];
const buttonLabels: CSS2DObject[] = [];

// 创建所有按钮
buttonsConfig.forEach((config) => {
  const buttonFactory = createButton({
    buttonText: config.buttonText,
    textContent: config.content,
    id: config.id,
  });

  // 设置自定义toggle回调，包含互斥逻辑和相机移动
  buttonFactory.setToggleCallback(() => {
    console.log("=== 按钮回调触发 ===");
    console.log("按钮ID:", config.id);
    console.log("当前卡片可见状态:", buttonFactory.isCardVisible);
    console.log("配置信息:", config);
    console.log("相机当前位置:", camera.position);

    // 如果当前按钮要打开，先关闭其他所有按钮
    if (buttonFactory.isCardVisible) {
      console.log("卡片即将显示，执行相机移动");
      buttonFactories.forEach((factory) => {
        if (factory !== buttonFactory && factory.isCardVisible) {
          console.log("关闭其他卡片");
          factory.hide();
        }
      });

      console.log("准备移动相机到:", config.cameraPosition);
      console.log("准备旋转到:", config.cameraRotation);
      console.log("准备设置目标点到:", config.cameraTarget);
      console.log("准备设置缩放到:", config.cameraZoom);

      // 移动相机到对应位置、旋转、目标点和缩放
      moveCameraAndRotateWithTargetAndZoom(
        config.cameraPosition.x,
        config.cameraPosition.y,
        config.cameraPosition.z,
        config.cameraRotation.x,
        config.cameraRotation.y,
        config.cameraRotation.z,
        config.cameraTarget.x,
        config.cameraTarget.y,
        config.cameraTarget.z,
        config.cameraZoom
      );
    } else {
      console.log("卡片即将隐藏，不执行相机移动");
    }
    console.log("=== 回调结束 ===");
  });

  const { container } = buttonFactory;
  container.style.pointerEvents = "auto";

  // 创建CSS2DObject
  const buttonLabel = new CSS2DObject(container);

  buttonFactories.push(buttonFactory);
  buttonLabels.push(buttonLabel);
});


// 开场动画函数
function startOpeningAnimation() {
  console.log("开始开场动画");

  // 设置起始位置（远景俯视）
  const startPosition = { x: 0, y: 8, z: 15 };
  const startRotation = { x: -0.5, y: 0, z: 0 };
  const startTarget = { x: 0, y: 0, z: 0 };

  // 立即设置起始位置
  camera.position.set(startPosition.x, startPosition.y, startPosition.z);
  camera.rotation.set(startRotation.x, startRotation.y, startRotation.z);
  controls.target.set(startTarget.x, startTarget.y, startTarget.z);
  controls.update();

  // 延迟一秒后开始移动到第一个点位
  setTimeout(() => {
    // 获取第一个按钮的配置
    const firstButtonConfig = buttonsConfig[0]; // bronze-owl

    console.log("移动到第一个点位:", firstButtonConfig.id);

    // 移动到第一个按钮的位置
    moveCameraAndRotateWithTargetAndZoom(
      firstButtonConfig.cameraPosition.x,
      firstButtonConfig.cameraPosition.y,
      firstButtonConfig.cameraPosition.z,
      firstButtonConfig.cameraRotation.x,
      firstButtonConfig.cameraRotation.y,
      firstButtonConfig.cameraRotation.z,
      firstButtonConfig.cameraTarget.x,
      firstButtonConfig.cameraTarget.y,
      firstButtonConfig.cameraTarget.z,
      firstButtonConfig.cameraZoom
    );
  }, 1000);
}

// 获取加载动画元素
const loadingScreen = document.getElementById("loading-screen");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

// 更新加载进度
function updateLoadingProgress(progress: LoadProgress) {
  const percentage = Math.round(progress.progress * 100);
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
  if (progressText) {
    const currentItem = progress.currentItem
      ? ` - ${progress.currentItem}`
      : "";
    progressText.textContent = `加载中... ${percentage}%${currentItem}`;
  }
}

// 隐藏加载动画
function hideLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    // 动画结束后完全移除元素
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
}

// 开始加载所有资源
async function startLoading() {
  try {
    // 设置进度回调
    resourceLoader.setProgressCallback(updateLoadingProgress);

    console.log("开始加载全局资源...");

    // 加载所有资源
    await resourceLoader.loadAll(resourceManifest);

    console.log("资源加载完成，开始初始化场景...");

    // 获取已加载的模型
    const gltf = resourceLoader.get("kingsHall");
    const model = gltf.scene;
    scene.add(model);

    // 等待一帧让模型完全加载和定位
    requestAnimationFrame(() => {
      // 为每个按钮设置位置并添加到模型
      buttonsConfig.forEach((config, index) => {
        const buttonLabel = buttonLabels[index];
        buttonLabel.position.set(
          config.position.x,
          config.position.y,
          config.position.z
        );
        model.add(buttonLabel);
      });

      // 模型加载完成，开始开场动画
      setTimeout(() => {
        hideLoadingScreen();
        // 延迟一点执行开场动画，确保加载屏幕完全隐藏
        setTimeout(() => {
          startOpeningAnimation();
        }, 300);
      }, 500);
    });
  } catch (error) {
    console.error("资源加载失败:", error);
    if (progressText) {
      progressText.textContent = "加载失败，请刷新页面重试";
    }
  }
}

// 启动加载流程
startLoading();

const labelRender = new CSS2DRenderer();
labelRender.setSize(window.innerWidth, window.innerHeight);
labelRender.domElement.style.position = "absolute";
labelRender.domElement.style.top = "0";
labelRender.domElement.style.left = "0";
labelRender.domElement.style.zIndex = "1000";
labelRender.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRender.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
function animate() {
  controls.update(); // 更新controls
  renderer.render(scene, camera);
  labelRender.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// 更新鼠标坐标
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// 点击事件监听器
window.addEventListener("mouseup", () => {
  // 更新射线投射器
  raycaster.setFromCamera(mouse, camera);

  // 获取所有可交互的对象（包括模型）
  const objectsToIntersect: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      objectsToIntersect.push(child);
    }
  });

  const intersects = raycaster.intersectObjects(objectsToIntersect);
  if (intersects.length > 0) {
    const intersection = intersects[0];
    console.log("点击的对象:", intersection.object);
    console.log("点击的坐标:", intersection.point);
    console.log("距离:", intersection.distance);
    console.log("相机的坐标", camera.position);
  } else {
    console.log("没有点击到任何对象");
  }
});

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRender.setSize(window.innerWidth, window.innerHeight);
});

// 便捷函数：获取当前相机配置（用于调试）
function getCurrentConfig() {
  const config = {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    },
    target: {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z,
    },
    zoom: camera.zoom,
  };

  console.log("=== 当前相机配置 ===");
  console.log("位置:", config.position);
  console.log("旋转:", config.rotation);
  console.log("目标点:", config.target);
  console.log("缩放:", config.zoom);
  console.log("");
  console.log("用于配置的JSON:");
  console.log(`cameraPosition: ${JSON.stringify(config.position, null, 2)},`);
  console.log(`cameraRotation: ${JSON.stringify(config.rotation, null, 2)},`);
  console.log(`cameraTarget: ${JSON.stringify(config.target, null, 2)},`);
  console.log(`cameraZoom: ${config.zoom},`);
  console.log("==================");

  return config;
}

// 简化的获取相机配置方法，只需要输入ID
function getCameraConfig(id: string) {
  const config = {
    id: id,
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    },
    target: {
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z,
    },
    zoom: camera.zoom,
    // 获取相机朝向向量
    direction: (() => {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      return {
        x: dir.x,
        y: dir.y,
        z: dir.z,
      };
    })(),
    // 相机矩阵信息
    matrix: {
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray(),
      quaternion: camera.quaternion.toArray(),
      target: controls.target.toArray(),
      zoom: camera.zoom,
    },
  };

  console.log("=== 相机完整配置信息 ===");
  console.log("ID:", id);
  console.log("位置 (Position):", config.position);
  console.log("旋转 (Rotation):", config.rotation);
  console.log("目标点 (Target):", config.target);
  console.log("缩放 (Zoom):", config.zoom);
  console.log("朝向向量 (Direction):", config.direction);
  console.log("");
  console.log("完整JSON配置:");
  console.log(JSON.stringify(config, null, 2));
  console.log("========================");

  return config;
}

// 获取当前相机状态的方法
function getCurrentCameraConfig(
  buttonId: string,
  buttonText: string,
  targetX: number,
  targetY: number,
  targetZ: number
) {
  const config = {
    id: buttonId,
    position: {
      x: targetX,
      y: targetY,
      z: targetZ,
    },
    cameraPosition: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    buttonText: buttonText,
    content: `// 在这里填写内容`,
  };

  console.log("=== 相机配置信息 ===");
  console.log("复制以下内容到 buttonsConfig 数组:");
  console.log(JSON.stringify(config, null, 2));
  console.log("===================");

  return config;
}

// 暴露到全局，方便在控制台调用
(window as any).getCurrentConfig = getCurrentConfig;
(window as any).getCameraConfig = getCameraConfig;
(window as any).getCurrentCameraConfig = getCurrentCameraConfig;

function moveCameraAndRotateWithTargetAndZoom(
  posX: number,
  posY: number,
  posZ: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  targetX: number,
  targetY: number,
  targetZ: number,
  zoom: number
) {
  console.log("移动相机到:", { x: posX, y: posY, z: posZ });
  console.log("旋转到:", { x: rotX, y: rotY, z: rotZ });
  console.log("设置目标点到:", { x: targetX, y: targetY, z: targetZ });
  console.log("设置缩放到:", zoom);

  // 同时移动位置、旋转、目标点和缩放
  gsap.to(camera.position, {
    x: posX,
    y: posY,
    z: posZ,
    duration: 3,
    ease: "power2.inOut",
  });

  gsap.to(camera.rotation, {
    x: rotX,
    y: rotY,
    z: rotZ,
    duration: 3,
    ease: "power2.inOut",
  });

  gsap.to(controls.target, {
    x: targetX,
    y: targetY,
    z: targetZ,
    duration: 3,
    ease: "power2.inOut",
    onUpdate: () => {
      controls.update();
    },
  });

  gsap.to(camera, {
    zoom: zoom,
    duration: 3,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.updateProjectionMatrix();
    },
    onComplete: () => {
      console.log("相机移动完成，最终位置:", camera.position);
      console.log("最终旋转:", camera.rotation);
      console.log("最终目标点:", controls.target);
      console.log("最终缩放:", camera.zoom);
      controls.update();
      camera.updateProjectionMatrix();
    },
  });
}
