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
        this.game = game;

        // UI元素
        this.elements = {
            crosshair: document.getElementById('crosshair'),
            debug: document.getElementById('debug'),
            hotbar: document.getElementById('hotbar'),
            loading: document.getElementById('loading')
        };

        // 初始化UI
        this.init();
    }

    /**
     * 初始化UI
     */
    init() {
        // 创建物品栏
        this.createHotbar();
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
            if (blockId < 18 && this.game && this.game.blockRegistry) { // 确保方块ID有效且blockRegistry存在
                try {
                    const block = this.game.blockRegistry.getBlockById(blockId);
                    if (block) {
                        const icon = document.createElement('img');
                        icon.src = `assets/textures/${block.getTexture('top') || block.getTexture('front') || 'stone'}.png`;
                        slot.appendChild(icon);
                    }
                } catch (error) {
                    console.error('创建物品栏时出错:', error);
                }
            }

            this.elements.hotbar.appendChild(slot);
        }
    }

    /**
     * 更新物品栏
     */
    updateHotbar() {
        const slots = this.elements.hotbar.querySelectorAll('.hotbar-slot');
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
     */
    showLoading(message = '加载中...', progress = 0) {
        if (!this.elements.loading) return;

        // 显示加载屏幕
        this.elements.loading.style.display = 'flex';

        // 设置加载消息
        const messageElement = this.elements.loading.querySelector('h1');
        if (messageElement) {
            messageElement.textContent = message;
        }

        // 设置加载进度
        const progressBar = this.elements.loading.querySelector('#loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoading() {
        if (!this.elements.loading) return;

        // 隐藏加载屏幕
        this.elements.loading.style.display = 'none';
    }

    /**
     * 更新调试信息
     */
    updateDebugInfo() {
        if (!this.elements.debug) return;

        if (this.game.debugMode) {
            const player = this.game.player;
            const world = this.game.world;

            const playerPos = player.position;
            const chunkX = Math.floor(playerPos.x / world.chunkSize);
            const chunkZ = Math.floor(playerPos.z / world.chunkSize);

            this.elements.debug.innerHTML = `
                FPS: ${this.game.fps.toFixed(0)}<br>
                位置: X=${playerPos.x.toFixed(1)}, Y=${playerPos.y.toFixed(1)}, Z=${playerPos.z.toFixed(1)}<br>
                区块: X=${chunkX}, Z=${chunkZ}<br>
                已加载区块: ${world.loadedChunks.size}<br>
                朝向: ${(player.rotation.y * (180 / Math.PI)).toFixed(0)}°<br>
                模式: ${player.flying ? '飞行' : '生存'}<br>
                ${player.selectedBlock ? `选中方块: X=${player.selectedBlock.x}, Y=${player.selectedBlock.y}, Z=${player.selectedBlock.z}, ID=${player.selectedBlock.id}` : '未选中方块'}
            `;

            this.elements.debug.style.display = 'block';
        } else {
            this.elements.debug.style.display = 'none';
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
        messageElement.style.position = 'absolute';
        messageElement.style.top = '20%';
        messageElement.style.left = '50%';
        messageElement.style.transform = 'translateX(-50%)';
        messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageElement.style.color = 'white';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.transition = 'opacity 0.5s';
        messageElement.style.zIndex = '1000';
        messageElement.style.pointerEvents = 'none';

        // 添加到文档
        document.body.appendChild(messageElement);

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
