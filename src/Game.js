/**
 * 游戏主类 - 整合所有游戏组件
 */
import * as THREE from 'three';
import { BlockRegistry } from './engine/voxel/BlockRegistry.js';
import { TextureManager } from './engine/rendering/TextureManager.js';
import { World } from './engine/voxel/World.js';
import { Player } from './engine/entities/Player.js';
import { InputManager } from './engine/InputManager.js';
import { UIManager } from './ui/UIManager.js';

export class Game {
  constructor() {
    // 游戏状态
    this.isRunning = false;
    this.isPaused = false;

    // 性能监控
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.frameTime = 0;

    // 游戏组件
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.blockRegistry = null;
    this.textureManager = null;
    this.world = null;
    this.player = null;
    this.inputManager = null;
    this.uiManager = null;

    // 渲染设置
    this.renderDistance = 8; // 渲染距离（区块数）
    this.fogDistance = 128; // 雾效距离（方块数）

    // 绑定方法
    this.update = this.update.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // 添加窗口大小变化监听
    window.addEventListener('resize', this.onWindowResize);

    // 设置全局引用
    window.game = this;
  }

  /**
   * 初始化游戏
   */
  async init() {
    try {
      // 更新加载进度
      this.updateLoadingProgress(0, '初始化游戏...');

      // 创建场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色
      this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500); // 雾效果

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(
        75, // 视野角度
        window.innerWidth / window.innerHeight, // 宽高比
        0.1, // 近平面
        1000 // 远平面
      );

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: false // 关闭抗锯齿以增强像素效果
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(1); // 固定像素比为1，增强像素效果
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 初始化方块注册表
      this.updateLoadingProgress(20, '加载方块...');
      this.blockRegistry = new BlockRegistry();

      // 初始化纹理管理器
      this.updateLoadingProgress(30, '加载纹理...');
      this.textureManager = new TextureManager();
      await this.textureManager.loadTextureAtlas(this.blockRegistry);

      // 添加光源
      this.updateLoadingProgress(40, '设置光照...');
      this.setupLights();

      // 初始化世界
      this.updateLoadingProgress(50, '初始化世界...');
      this.world = new World(this.scene, this.blockRegistry, this.textureManager);
      this.world.renderDistance = this.renderDistance;

      // 初始化玩家
      this.updateLoadingProgress(70, '初始化玩家...');
      this.player = new Player(this.camera, this.scene);

      // 初始化输入管理器
      this.updateLoadingProgress(80, '初始化控制...');
      this.inputManager = new InputManager(this.player, this.renderer.domElement);

      // 初始化UI管理器
      this.updateLoadingProgress(90, '初始化界面...');
      this.uiManager = new UIManager(this.player, this.blockRegistry);

      // 完成加载
      this.updateLoadingProgress(100, '加载完成!');

      return true;
    } catch (error) {
      console.error('游戏初始化失败:', error);
      this.updateLoadingProgress(0, '初始化失败，请刷新页面重试');
      return false;
    }
  }

  /**
   * 设置光照
   */
  setupLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 定向光（模拟太阳）
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;

    // 设置阴影参数
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;

    this.scene.add(sunLight);

    // 半球光（模拟环境反射）
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    this.scene.add(hemisphereLight);
  }

  /**
   * 开始游戏
   */
  start() {
    if (this.isRunning) return;

    // 隐藏加载屏幕
    document.getElementById('loading-screen').style.display = 'none';

    // 设置游戏状态
    this.isRunning = true;
    this.isPaused = false;

    // 开始游戏循环
    this.lastTime = performance.now();
    requestAnimationFrame(this.update);
  }

  /**
   * 暂停游戏
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 恢复游戏
   */
  resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  /**
   * 游戏主循环
   */
  update(currentTime) {
    // 计算时间增量
    this.deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;

    // 限制最大时间增量，防止卡顿时物理异常
    this.deltaTime = Math.min(this.deltaTime, 0.1);

    // 更新FPS计数
    this.frameCount++;
    this.frameTime += this.deltaTime;
    if (this.frameTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.frameTime -= 1.0;
    }

    // 如果游戏暂停，不更新
    if (this.isPaused) {
      requestAnimationFrame(this.update);
      return;
    }

    // 更新世界
    this.world.update(this.player.position);

    // 更新玩家
    this.player.update(this.deltaTime, this.world);

    // 更新UI
    this.uiManager.update(this.deltaTime, this.fps);

    // 添加调试信息
    if (!this.debugInfo) {
      this.debugInfo = document.createElement('div');
      this.debugInfo.style.position = 'absolute';
      this.debugInfo.style.top = '10px';
      this.debugInfo.style.right = '10px';
      this.debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      this.debugInfo.style.color = 'white';
      this.debugInfo.style.padding = '10px';
      this.debugInfo.style.borderRadius = '5px';
      this.debugInfo.style.fontFamily = 'monospace';
      this.debugInfo.style.zIndex = '1000';
      document.body.appendChild(this.debugInfo);
    }

    const pos = this.player.position;
    this.debugInfo.innerHTML = `
      位置: ${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}<br>
      FPS: ${this.fps}<br>
      区块: ${Math.floor(pos.x / 16)}, ${Math.floor(pos.y / 16)}, ${Math.floor(pos.z / 16)}<br>
      渲染距离: ${this.renderDistance} 区块
    `;

    // 渲染场景
    this.renderer.render(this.scene, this.camera);

    // 请求下一帧
    requestAnimationFrame(this.update);
  }

  /**
   * 处理窗口大小变化
   */
  onWindowResize() {
    // 更新相机
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // 更新渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 更新加载进度
   * @param {number} progress - 进度（0-100）
   * @param {string} message - 进度消息
   */
  updateLoadingProgress(progress, message) {
    const progressBar = document.querySelector('#loading-screen .progress');
    const loadingText = document.querySelector('#loading-screen .loading-text');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (loadingText) {
      loadingText.textContent = message;
    }
  }

  /**
   * 销毁游戏
   */
  destroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.onWindowResize);

    // 销毁输入管理器
    if (this.inputManager) {
      this.inputManager.destroy();
    }

    // 销毁渲染器
    if (this.renderer) {
      this.renderer.dispose();
    }

    // 清除全局引用
    window.game = null;
  }
}
