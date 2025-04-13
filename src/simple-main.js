/**
 * 简化版游戏入口文件
 */
import { SimpleGame } from './SimpleGame.js';

console.log('加载简化版游戏...');

// 当页面加载完成后初始化游戏
window.addEventListener('load', async () => {
  console.log('页面加载完成，初始化游戏...');
  
  // 创建游戏实例
  const game = new SimpleGame();
  
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
