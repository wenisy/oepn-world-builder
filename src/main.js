import { Game } from './engine/core/Game.js';
import { UIManager } from './engine/ui/UIManager.js';

// 检查Three.js是否加载
console.log('Three.js状态:', window.THREE ? '已加载' : '未加载');

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始初始化游戏');

    try {
        // 检查Three.js是否存在
        if (!window.THREE) {
            throw new Error('Three.js库未加载，请检查网络连接');
        }

        // 创建游戏实例
        console.log('创建游戏实例');
        const game = new Game({
            containerId: 'game-container',
            canvasId: 'game-canvas'
        });

        // 创建 UI 管理器
        console.log('创建 UI 管理器');
        const uiManager = new UIManager(game);

        // 显示加载屏幕
        uiManager.showLoadingScreen('正在初始化游戏...', 0);

        // 初始化游戏
        console.log('开始初始化游戏');
        game.init().then(() => {
            console.log('游戏初始化成功');

            // 隐藏加载屏幕
            uiManager.hideLoadingScreen();

            // 开始游戏循环
            game.start();
            console.log('游戏开始运行');

            // 显示欢迎消息
            uiManager.showMessage('点击屏幕开始游戏');

            // 设置调试模式快捷键
            window.addEventListener('keydown', (event) => {
                if (event.code === 'F3') {
                    game.toggleDebugMode();
                }
            });

            // 将游戏实例添加到全局对象，便于调试
            window.gameInstance = game;
        }).catch(error => {
            console.error('游戏初始化失败:', error);
            uiManager.showLoadingScreen(`游戏初始化失败: ${error.message}<br>请刷新页面重试`, 0, true);
        });
    } catch (error) {
        console.error('初始化过程中出现错误:', error);
        document.getElementById('loading-screen').innerHTML = `
            <div class="loading-content">
                <h1>初始化失败</h1>
                <p>错误信息: ${error.message}</p>
                <button onclick="location.reload()">重试</button>
            </div>
        `;
    }
});
