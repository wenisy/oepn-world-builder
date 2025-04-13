/**
 * 游戏核心类 - 负责初始化和管理游戏的主要组件
 */
import { Renderer } from './Renderer.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { UIManager } from '../ui/UIManager.js';
import { BlockRegistry } from '../world/BlockRegistry.js';
import { TextureManager } from './TextureManager.js';

export class Game {
  constructor() {
    // 游戏状态
    this.isRunning = false;
    this.isPaused = false;
    
    // 核心组件
    this.renderer = null;
    this.world = null;
    this.player = null;
    this.inputManager = null;
    this.uiManager = null;
    this.blockRegistry = null;
    this.textureManager = null;
    
    // 性能监控
    this.lastTime = 0;
    this.deltaTime = 0;
    
    // 绑定方法到实例
    this.update = this.update.bind(this);
  }
  
  /**
   * 初始化游戏
   */
  async init() {
    try {
      // 更新加载进度
      this.updateLoadingProgress(0, '初始化游戏...');
      
      // 初始化方块注册表
      this.blockRegistry = new BlockRegistry();
      this.blockRegistry.registerDefaultBlocks();
      
      // 初始化纹理管理器
      this.updateLoadingProgress(20, '加载纹理...');
      this.textureManager = new TextureManager();
      await this.textureManager.loadBlockTextures(this.blockRegistry);
      
      // 初始化渲染器
      this.updateLoadingProgress(40, '初始化渲染器...');
      this.renderer = new Renderer(document.getElementById('game-canvas'));
      await this.renderer.init();
      
      // 初始化玩家
      this.player = new Player({
        position: new THREE.Vector3(0, 20, 0),
        health: 10,
        hunger: 10
      });
      
      // 初始化世界
      this.updateLoadingProgress(60, '生成世界...');
      this.world = new World(this.blockRegistry, this.textureManager);
      await this.world.generate();
      this.renderer.scene.add(this.world.mesh);
      
      // 初始化输入管理器
      this.updateLoadingProgress(80, '初始化控制...');
      this.inputManager = new InputManager(this.player, this.renderer.camera, this.renderer.controls);
      
      // 初始化UI管理器
      this.updateLoadingProgress(90, '初始化界面...');
      this.uiManager = new UIManager(this.player);
      
      // 完成加载
      this.updateLoadingProgress(100, '加载完成!');
      
      // 添加事件监听器
      window.addEventListener('resize', () => this.renderer.handleResize());
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      return true;
    } catch (error) {
      console.error('游戏初始化失败:', error);
      this.updateLoadingProgress(0, '初始化失败，请刷新页面重试');
      return false;
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
    
    // 如果游戏暂停，不更新
    if (this.isPaused) {
      requestAnimationFrame(this.update);
      return;
    }
    
    // 更新输入
    this.inputManager.update(this.deltaTime);
    
    // 更新玩家
    this.player.update(this.deltaTime, this.world);
    
    // 更新相机位置
    this.renderer.updateCamera(this.player);
    
    // 更新世界
    this.world.update(this.deltaTime, this.player);
    
    // 更新UI
    this.uiManager.update();
    
    // 渲染场景
    this.renderer.render();
    
    // 请求下一帧
    requestAnimationFrame(this.update);
  }
  
  /**
   * 更新加载进度
   */
  updateLoadingProgress(percent, message) {
    const progressBar = document.querySelector('.progress');
    const loadingText = document.querySelector('.loading-text');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (loadingText) loadingText.textContent = message;
  }
}
