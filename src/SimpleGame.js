/**
 * 简化版游戏类 - 用于测试基本渲染
 */
import * as THREE from 'three';
export class SimpleGame {
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

    // 绑定方法
    this.update = this.update.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    // 添加窗口大小变化监听
    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * 初始化游戏
   */
  async init() {
    try {
      console.log('初始化简化版游戏...');

      // 更新加载进度
      this.updateLoadingProgress(0, '初始化游戏...');

      // 创建场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(
        75, // 视野角度
        window.innerWidth / window.innerHeight, // 宽高比
        0.1, // 近平面
        1000 // 远平面
      );
      this.camera.position.set(0, 5, 10);

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('game-canvas'),
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      // 添加光源
      this.setupLights();

      // 添加简单的地面
      this.addGround();

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
    this.scene.add(sunLight);
  }

  /**
   * 添加地面
   */
  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d8c40,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = 0;
    this.scene.add(ground);

    // 添加一些立方体
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

    for (let i = 0; i < 20; i++) {
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      box.position.set(
        Math.random() * 20 - 10,
        0.5,
        Math.random() * 20 - 10
      );
      this.scene.add(box);
    }
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
   * 游戏主循环
   */
  update(currentTime) {
    // 计算时间增量
    this.deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;

    // 更新FPS计数
    this.frameCount++;
    this.frameTime += this.deltaTime;
    if (this.frameTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.frameTime -= 1.0;
    }

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
    const progressBar = document.querySelector('.progress');
    const loadingText = document.querySelector('.loading-text');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (loadingText) {
      loadingText.textContent = message;
    }
  }
}
