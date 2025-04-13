import { Game } from './Game.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('DOM加载完成，开始初始化游戏');
        
        // 创建游戏实例
        const game = new Game({
            canvasId: 'game'
        });
        
        // 初始化游戏
        await game.init();
        
        // 开始游戏循环
        game.start();
        
        // 将游戏实例添加到全局对象，便于调试
        window.game = game;
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        
        // 显示错误信息
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h1>游戏初始化失败</h1>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">重试</button>
                </div>
            `;
        }
    }
});
