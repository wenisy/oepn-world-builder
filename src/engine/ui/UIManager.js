/**
 * UI管理器类
 * 管理游戏的用户界面元素
 */
export class UIManager {
    /**
     * 创建一个新的UI管理器
     * @param {Game} game - 游戏实例
     */
    constructor(game) {
        console.log('UIManager 构造函数被调用, game对象:', game);
        this.game = game;

        // UI元素
        this.elements = {
            crosshair: document.getElementById('crosshair'),
            debugInfo: document.getElementById('debug-info'),
            hotbar: document.getElementById('hotbar'),
            loadingScreen: document.getElementById('loading-screen')
        };

        console.log('UIManager 找到的UI元素:', this.elements);

        // 初始化UI
        this.init();
    }

    /**
     * 初始化UI
     */
    init() {
        // 创建物品栏
        this.createHotbar();

        // 设置键盘事件
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * 创建物品栏
     */
    createHotbar() {
        if (!this.elements.hotbar) return;

        // 清空现有内容
        this.elements.hotbar.innerHTML = '';

        // 创建物品栏槽位
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === 0) {
                slot.classList.add('active');
            }

            // 添加方块图标
            const blockId = i + 1;
            if (blockId < 17) { // 确保方块ID有效
                const block = this.game.blockRegistry.getBlockById(blockId);
                if (block) {
                    const icon = document.createElement('div');
                    icon.className = 'hotbar-icon';
                    icon.style.backgroundImage = `url('/assets/textures/blocks/${block.name}.png')`;
                    slot.appendChild(icon);
                }
            }

            this.elements.hotbar.appendChild(slot);
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
            if (i === this.game.player.inventory.selectedSlot) {
                slots[i].classList.add('active');
            } else {
                slots[i].classList.remove('active');
            }
        }
    }

    /**
     * 显示加载屏幕
     * @param {string} message - 加载消息
     * @param {number} progress - 加载进度 (0-100)
     * @param {boolean} isError - 是否为错误消息
     */
    showLoadingScreen(message = '加载中...', progress = 0, isError = false) {
        if (!this.elements.loadingScreen) {
            console.error('加载屏幕元素不存在');
            return;
        }

        console.log('显示加载屏幕:', message, progress, isError ? '错误模式' : '');

        // 显示加载屏幕
        this.elements.loadingScreen.style.display = 'flex';

        if (isError) {
            // 错误模式下显示完整的错误信息和重试按钮
            this.elements.loadingScreen.innerHTML = `
                <div class="loading-content">
                    <h1>加载失败</h1>
                    <p>${message}</p>
                    <button onclick="location.reload()">重试</button>
                </div>
            `;
        } else {
            // 正常加载模式
            // 设置加载消息
            const messageElement = this.elements.loadingScreen.querySelector('h1');
            if (messageElement) {
                messageElement.textContent = message;
            } else {
                console.warn('消息元素不存在');
            }

            // 设置加载进度
            const progressBar = this.elements.loadingScreen.querySelector('.progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            } else {
                console.warn('进度条元素不存在');
            }
        }
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        if (!this.elements.loadingScreen) return;

        // 隐藏加载屏幕
        this.elements.loadingScreen.style.display = 'none';
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        if (!this.elements.debugInfo) return;

        if (this.game.debugMode) {
            const player = this.game.player;
            const world = this.game.world;

            const playerPos = player.position;
            const chunkX = Math.floor(playerPos.x / world.chunkSize);
            const chunkZ = Math.floor(playerPos.z / world.chunkSize);

            this.elements.debugInfo.innerHTML = `
                FPS: ${this.game.stats.fps}<br>
                位置: X=${playerPos.x.toFixed(2)}, Y=${playerPos.y.toFixed(2)}, Z=${playerPos.z.toFixed(2)}<br>
                区块: X=${chunkX}, Z=${chunkZ}<br>
                已加载区块: ${world.loadedChunks.size}<br>
                朝向: ${(player.rotation.y * (180 / Math.PI)).toFixed(0)}°<br>
                ${player.selectedBlock ? `选中方块: X=${player.selectedBlock.x}, Y=${player.selectedBlock.y}, Z=${player.selectedBlock.z}, ID=${player.selectedBlock.id}` : '未选中方块'}
            `;
        } else {
            this.elements.debugInfo.innerHTML = '';
        }
    }

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        // F3键切换调试模式
        if (event.code === 'F3') {
            this.game.toggleDebugMode();
        }

        // ESC键退出指针锁定
        if (event.code === 'Escape' && this.game.inputManager.isPointerLocked()) {
            this.game.inputManager.exitPointerLock();
        }
    }

    /**
     * 显示消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长（毫秒）
     */
    showMessage(message, duration = 3000) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;

        // 添加到容器
        this.game.container.appendChild(messageElement);

        // 设置淡出动画
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, duration);
    }

    /**
     * 更新UI
     */
    update() {
        // 更新物品栏
        this.updateHotbar();

        // 更新调试信息
        this.updateDebugInfo();
    }
}
