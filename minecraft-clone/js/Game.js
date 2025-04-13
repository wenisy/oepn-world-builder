import { BlockRegistry } from './BlockRegistry.js';
import { World } from './World.js';
import { Player } from './Player.js';
import { InputManager } from './InputManager.js';
import { TextureManager } from './TextureManager.js';
import { ChunkMesher } from './ChunkMesher.js';
import { UIManager } from './UIManager.js';

/**
 * 游戏类
 * 游戏的主要入口点，管理游戏循环和组件
 */
export class Game {
    /**
     * 创建一个新的游戏实例
     * @param {Object} options - 游戏选项
     */
    constructor(options = {}) {
        // 游戏选项
        this.options = {
            canvasId: 'game',
            width: window.innerWidth,
            height: window.innerHeight,
            fov: 75,
            nearPlane: 0.1,
            farPlane: 1000,
            ...options
        };

        // 游戏状态
        this.running = false;
        this.paused = false;
        this.debugMode = false;

        // 性能监控
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
    }

    /**
     * 初始化游戏
     */
    async init() {
        console.log('初始化游戏...');

        // 获取画布
        this.canvas = document.getElementById(this.options.canvasId);
        if (!this.canvas) {
            throw new Error(`找不到ID为 ${this.options.canvasId} 的画布元素`);
        }

        // 创建临时加载屏幕
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            const progressBar = loadingScreen.querySelector('#loading-progress');
            if (progressBar) {
                progressBar.style.width = '10%';
            }
        }

        // 创建Three.js渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            alpha: false
        });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.setClearColor(0x87CEEB); // 天空蓝色

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

        // 添加光源
        this.setupLights();

        // 创建输入管理器
        this.inputManager = new InputManager();

        // 创建纹理管理器
        this.textureManager = new TextureManager();

        // 加载纹理
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            const progressBar = loadingScreen.querySelector('#loading-progress');
            if (progressBar) {
                progressBar.style.width = '10%';
            }
            const messageElement = loadingScreen.querySelector('h1');
            if (messageElement) {
                messageElement.textContent = '正在加载纹理...';
            }
        }

        await this.textureManager.loadTextures(progress => {
            if (loadingScreen) {
                const progressBar = loadingScreen.querySelector('#loading-progress');
                if (progressBar) {
                    progressBar.style.width = `${10 + progress * 30}%`;
                }
            }
        });

        // 创建方块注册表
        if (loadingScreen) {
            const progressBar = loadingScreen.querySelector('#loading-progress');
            if (progressBar) {
                progressBar.style.width = '40%';
            }
            const messageElement = loadingScreen.querySelector('h1');
            if (messageElement) {
                messageElement.textContent = '正在初始化方块...';
            }
        }

        this.blockRegistry = new BlockRegistry();
        console.log('方块注册表初始化完成:', this.blockRegistry);

        // 创建UI管理器
        this.ui = new UIManager(this);

        // 创建世界
        this.ui.showLoading('正在生成世界...', 50);
        this.world = new World({
            seed: Math.floor(Math.random() * 2147483647),
            chunkSize: 16,
            worldHeight: 256,
            renderDistance: 8,
            blockRegistry: this.blockRegistry
        });

        // 创建区块网格生成器
        this.chunkMesher = new ChunkMesher(this.blockRegistry, this.textureManager);

        // 创建玩家
        this.ui.showLoading('正在初始化玩家...', 80);
        this.player = new Player({
            position: new THREE.Vector3(0, 100, 0),
            speed: 5.0,
            jumpForce: 8.0,
            gravity: 20.0
        });

        // 将相机添加到场景
        this.scene.add(this.player.camera);

        // 设置窗口大小调整事件
        window.addEventListener('resize', this.handleResize.bind(this));

        // 设置点击事件
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));

        // 设置键盘事件
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 初始化完成
        if (loadingScreen) {
            const progressBar = loadingScreen.querySelector('#loading-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            const messageElement = loadingScreen.querySelector('h1');
            if (messageElement) {
                messageElement.textContent = '初始化完成！';
            }

            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.ui.showMessage('点击屏幕开始游戏');
            }, 500);
        }

        console.log('游戏初始化完成');
    }

    /**
     * 设置光源
     */
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // 定向光（模拟太阳光）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);
    }

    /**
     * 处理画布点击事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleCanvasClick(event) {
        // 请求指针锁定
        if (!this.inputManager.isPointerLocked()) {
            this.inputManager.requestPointerLock(this.canvas);
        }
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        // F3键切换调试模式
        if (event.code === 'F3') {
            this.debugMode = !this.debugMode;
        }

        // ESC键暂停游戏
        if (event.code === 'Escape') {
            if (this.inputManager.isPointerLocked()) {
                this.inputManager.exitPointerLock();
            } else if (this.running) {
                this.togglePause();
            }
        }
    }

    /**
     * 处理窗口大小调整
     */
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 更新渲染器大小
        this.renderer.setSize(width, height);

        // 更新玩家相机
        this.player.resize(width, height);
    }

    /**
     * 开始游戏循环
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;

        // 开始游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));

        console.log('游戏开始运行');
    }

    /**
     * 暂停游戏
     */
    togglePause() {
        this.paused = !this.paused;

        if (this.paused) {
            this.ui.showMessage('游戏已暂停');
        } else {
            this.ui.showMessage('游戏已恢复');
        }
    }

    /**
     * 停止游戏
     */
    stop() {
        this.running = false;
    }

    /**
     * 游戏循环
     * @param {number} timestamp - 当前时间戳
     */
    gameLoop(timestamp) {
        if (!this.running) return;

        // 计算时间增量
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 限制最大时间步长，防止卡顿时物理异常
        this.deltaTime = Math.min(this.deltaTime, 0.1);

        // 更新FPS计数
        this.frameCount++;
        if (timestamp - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount * 1000 / (timestamp - this.fpsUpdateTime);
            this.fpsUpdateTime = timestamp;
            this.frameCount = 0;
        }

        // 如果游戏未暂停，更新游戏状态
        if (!this.paused) {
            this.update();
        }

        // 渲染场景
        this.render();

        // 更新UI
        this.ui.update();

        // 继续游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * 更新游戏状态
     */
    update() {
        // 更新玩家
        this.player.update(this.deltaTime, this.inputManager, this.world);

        // 更新世界
        this.updateWorld();

        // 处理方块交互
        this.handleBlockInteraction();
    }

    /**
     * 更新世界
     */
    updateWorld() {
        // 更新玩家周围的区块
        this.world.updateChunksAroundPlayer(this.player.position.x, this.player.position.z);

        // 获取需要更新的区块
        const chunksToUpdate = this.world.getChunksToUpdate();

        // 更新区块网格
        for (const chunk of chunksToUpdate) {
            if (chunk.needsUpdate) {
                // 清除旧网格
                if (chunk.mesh) {
                    this.scene.remove(chunk.mesh);
                    chunk.dispose();
                }

                // 创建新网格
                chunk.mesh = this.chunkMesher.createMesh(chunk, this.world);
                if (chunk.mesh) {
                    this.scene.add(chunk.mesh);
                }

                // 重置更新标志
                chunk.needsUpdate = false;
            }
        }

        // 清空更新列表
        this.world.clearUpdateList();
    }

    /**
     * 处理方块交互
     */
    handleBlockInteraction() {
        // 左键点击破坏方块
        if (this.inputManager.isMouseButtonPressed(0) && this.inputManager.isPointerLocked()) {
            if (this.player.breakBlock(this.world)) {
                // 播放破坏音效
                // TODO: 添加音效系统
            }
        }

        // 右键点击放置方块
        if (this.inputManager.isMouseButtonPressed(2) && this.inputManager.isPointerLocked()) {
            if (this.player.placeBlock(this.world)) {
                // 播放放置音效
                // TODO: 添加音效系统
            }
        }
    }

    /**
     * 渲染场景
     */
    render() {
        this.renderer.render(this.scene, this.player.camera);
    }
}
