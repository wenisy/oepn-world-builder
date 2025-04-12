import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * 初始化3D渲染器
 * @param {HTMLCanvasElement} canvas - 渲染目标画布
 * @returns {Object} 渲染器对象
 */
export function initRenderer(canvas) {
  // 创建场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景
  
  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75, // 视野角度
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近平面
    1000 // 远平面
  );
  camera.position.set(0, 5, 10);
  
  // 创建WebGL渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // 创建轨道控制器（临时，后面会替换为自定义控制器）
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  // 添加定向光（模拟太阳）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 200, 100);
  directionalLight.castShadow = true;
  
  // 设置阴影贴图大小以提高质量
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  
  // 设置阴影相机参数
  const shadowSize = 100;
  directionalLight.shadow.camera.left = -shadowSize;
  directionalLight.shadow.camera.right = shadowSize;
  directionalLight.shadow.camera.top = shadowSize;
  directionalLight.shadow.camera.bottom = -shadowSize;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  
  scene.add(directionalLight);
  
  // 添加半球光（模拟环境反射）
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemisphereLight);
  
  // 处理窗口大小变化
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // 渲染函数
  function render() {
    controls.update();
    renderer.render(scene, camera);
  }
  
  // 返回渲染器对象
  return {
    scene,
    camera,
    renderer,
    controls,
    handleResize,
    render
  };
}
