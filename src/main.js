/**
 * 游戏入口文件
 */
import { Game } from './Game.js';

// 创建游戏实例
const game = new Game();

// 添加调试按钮的事件监听器
const debugButton = document.getElementById('debug-start');
if (debugButton) {
  debugButton.addEventListener('click', async () => {
    console.log('点击了手动开始游戏按钮');

    // 隐藏加载屏幕
    document.getElementById('loading-screen').style.display = 'none';

    // 初始化游戏
    if (!game.isRunning) {
      const success = await game.init();
      if (success) {
        game.start();
      }
    }
  });
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', async () => {
  console.log('页面加载完成');

  // 延迟一秒后初始化游戏
  setTimeout(async () => {
    // 初始化游戏
    const success = await game.init();

    if (success) {
      // 开始游戏
      game.start();
    } else {
      // 显示错误消息
      console.error('游戏初始化失败');
    }
  }, 1000);
});
