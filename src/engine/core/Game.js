import { BlockRegistry } from '../world/BlockRegistry.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { TextureManager } from '../rendering/TextureManager.js';
import { ChunkMesher } from '../rendering/ChunkMesher.js';

// 导入Three.js
const THREE = window.THREE;

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
            containerId: 'game-container',
            canvasId: 'game-canvas',
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
        this.stats = {
            fps: 0,
            frameTime: 0,
            lastFrameTime: 0,
            frames: 0,
            lastFpsUpdate: 0
        };
    }

    /**
     * 初始化游戏
     */
    async init() {
        console.log('开始初始化游戏');
        // 获取容器和画布
        this.container = document.getElementById(this.options.containerId);
        this.canvas = document.getElementById(this.options.canvasId);

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

        // 添加光源
        this.setupLights();

        // 创建输入管理器
        this.inputManager = new InputManager();

        // 创建纹理管理器
        this.textureManager = new TextureManager();

        // 加载纹理
        await this.textureManager.loadDefaultTextures();
        this.textureManager.createTextureAtlas();

        // 创建方块注册表
        console.log('获取方块注册表单例');
        this.blockRegistry = BlockRegistry.getInstance();
        console.log('方块注册表获取完成:', this.blockRegistry);

        // 创建世界
        console.log('创建世界');
        this.world = new World({
            seed: Math.floor(Math.random() * 2147483647),
            chunkSize: 16,
            worldHeight: 256,
            renderDistance: 8,
            blockRegistry: this.blockRegistry
        });
        console.log('世界创建完成, blockRegistry 是否存在:', !!this.world.blockRegistry);

        // 创建区块网格生成器
        this.chunkMesher = new ChunkMesher(this.blockRegistry, this.textureManager);

        // 创建玩家
        this.player = new Player({
            position: new THREE.Vector3(0, 70, 0),
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

        // 设置调试信息元素
        this.debugInfoElement = document.getElementById('debug-info');

        // 设置物品栏
        this.setupHotbar();

        // 隐藏加载屏幕
        this.hideLoadingScreen();

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
     * 设置物品栏
     */
    setupHotbar() {
        const hotbar = document.getElementById('hotbar');
        if (!hotbar) return;

        // 清空现有内容
        hotbar.innerHTML = '';

        // 创建物品栏槽位
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === this.player.inventory.selectedSlot) {
                slot.classList.add('active');
            }
            hotbar.appendChild(slot);
        }
    }

    /**
     * 更新物品栏
     */
    updateHotbar() {
        const slots = document.querySelectorAll('.hotbar-slot');
        if (!slots.length) return;

        // 更新选中的槽位
        for (let i = 0; i < slots.length; i++) {
            if (i === this.player.inventory.selectedSlot) {
                slots[i].classList.add('active');
            } else {
                slots[i].classList.remove('active');
            }
        }
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
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    /**
     * 开始游戏循环
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.lastFrameTime = performance.now();
        this.stats.lastFpsUpdate = this.lastFrameTime;

        // 开始游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));

        console.log('游戏开始运行');
    }

    /**
     * 暂停游戏
     */
    pause() {
        this.paused = true;
    }

    /**
     * 恢复游戏
     */
    resume() {
        this.paused = false;
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
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        // 更新FPS计数
        this.stats.frames++;
        if (timestamp - this.stats.lastFpsUpdate >= 1000) {
            this.stats.fps = Math.round(this.stats.frames * 1000 / (timestamp - this.stats.lastFpsUpdate));
            this.stats.lastFpsUpdate = timestamp;
            this.stats.frames = 0;
        }

        // 记录帧时间
        this.stats.frameTime = deltaTime;

        // 如果游戏未暂停，更新游戏状态
        if (!this.paused) {
            this.update(deltaTime);
        }

        // 渲染场景
        this.render();

        // 更新调试信息
        this.updateDebugInfo();

        // 继续游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * 更新游戏状态
     * @param {number} deltaTime - 时间增量
     */
    update(deltaTime) {
        console.log('更新游戏状态, 检查关键对象:');
        console.log('- player:', this.player);
        console.log('- inputManager:', this.inputManager);
        console.log('- world:', this.world);
        console.log('- world.blockRegistry:', this.world.blockRegistry);

        // 更新玩家
        this.player.update(deltaTime, this.inputManager, this.world);

        // 更新世界
        this.updateWorld();

        // 处理方块交互
        this.handleBlockInteraction();

        // 更新物品栏
        this.updateHotbar();
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
                this.scene.add(chunk.mesh);

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
        if (this.inputManager.isMouseButtonPressed(0)) {
            this.player.breakBlock(this.world);
        }

        // 右键点击放置方块
        if (this.inputManager.isMouseButtonPressed(2)) {
            // 获取当前选中的方块类型
            const blockId = this.player.inventory.selectedSlot + 1;
            this.player.placeBlock(this.world, blockId);
        }
    }

    /**
     * 渲染场景
     */
    render() {
        this.renderer.render(this.scene, this.player.camera);
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        if (!this.debugInfoElement) return;

        if (this.debugMode) {
            const playerPos = this.player.position;
            const chunkX = Math.floor(playerPos.x / this.world.chunkSize);
            const chunkZ = Math.floor(playerPos.z / this.world.chunkSize);

            this.debugInfoElement.innerHTML = `
                FPS: ${this.stats.fps}<br>
                位置: X=${playerPos.x.toFixed(2)}, Y=${playerPos.y.toFixed(2)}, Z=${playerPos.z.toFixed(2)}<br>
                区块: X=${chunkX}, Z=${chunkZ}<br>
                已加载区块: ${this.world.loadedChunks.size}<br>
                朝向: ${(this.player.rotation.y * (180 / Math.PI)).toFixed(0)}°<br>
                ${this.player.selectedBlock ? `选中方块: X=${this.player.selectedBlock.x}, Y=${this.player.selectedBlock.y}, Z=${this.player.selectedBlock.z}, ID=${this.player.selectedBlock.id}` : '未选中方块'}
            `;
        } else {
            this.debugInfoElement.innerHTML = '';
        }
    }

    /**
     * 切换调试模式
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
    }
}
