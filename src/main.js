/**
 * 游戏入口文件
 */
import { Game } from './Game.js';

// 当页面加载完成后初始化游戏
window.addEventListener('load', async () => {
  // 创建游戏实例
  const game = new Game();
  
  // 初始化游戏
  const success = await game.init();
  
  if (success) {
    // 开始游戏
    game.start();
  } else {
    // 显示错误消息
    console.error('游戏初始化失败');
  }
});
