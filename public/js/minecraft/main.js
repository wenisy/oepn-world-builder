/**
 * 游戏入口文件
 */
import { Game } from './core/Game.js';

// 游戏实例
let game = null;

// 当页面加载完成后初始化游戏
window.addEventListener('load', async () => {
  // 创建游戏实例
  game = new Game();
  
  // 初始化游戏
  const success = await game.init();
  
  if (success) {
    // 显示主菜单
    showMainMenu();
  } else {
    // 显示错误消息
    showErrorMessage('游戏初始化失败，请刷新页面重试');
  }
});

/**
 * 显示主菜单
 */
function showMainMenu() {
  // 隐藏加载屏幕
  document.getElementById('loading-screen').style.display = 'none';
  
  // 显示主菜单
  const mainMenu = document.getElementById('main-menu');
  mainMenu.style.display = 'flex';
  
  // 添加开始游戏按钮事件
  document.getElementById('start-game').addEventListener('click', () => {
    // 隐藏主菜单
    mainMenu.style.display = 'none';
    
    // 开始游戏
    game.start();
  });
  
  // 添加选项按钮事件
  document.getElementById('options').addEventListener('click', () => {
    // 显示选项菜单
    showOptionsMenu();
  });
}

/**
 * 显示选项菜单
 */
function showOptionsMenu() {
  // 创建选项菜单
  const optionsMenu = document.createElement('div');
  optionsMenu.className = 'game-menu';
  
  // 创建菜单标题
  const title = document.createElement('h1');
  title.className = 'menu-title';
  title.textContent = '游戏选项';
  optionsMenu.appendChild(title);
  
  // 创建选项容器
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'options-container';
  optionsMenu.appendChild(optionsContainer);
  
  // 创建音量选项
  const volumeOption = document.createElement('div');
  volumeOption.className = 'option-item';
  
  const volumeLabel = document.createElement('label');
  volumeLabel.textContent = '音量:';
  volumeOption.appendChild(volumeLabel);
  
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = '0';
  volumeSlider.max = '100';
  volumeSlider.value = '80';
  volumeOption.appendChild(volumeSlider);
  
  optionsContainer.appendChild(volumeOption);
  
  // 创建渲染距离选项
  const renderDistanceOption = document.createElement('div');
  renderDistanceOption.className = 'option-item';
  
  const renderDistanceLabel = document.createElement('label');
  renderDistanceLabel.textContent = '渲染距离:';
  renderDistanceOption.appendChild(renderDistanceLabel);
  
  const renderDistanceSelect = document.createElement('select');
  ['近', '中', '远'].forEach((option, index) => {
    const optionElement = document.createElement('option');
    optionElement.value = index;
    optionElement.textContent = option;
    renderDistanceSelect.appendChild(optionElement);
  });
  renderDistanceOption.appendChild(renderDistanceSelect);
  
  optionsContainer.appendChild(renderDistanceOption);
  
  // 创建按钮容器
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'menu-buttons';
  optionsMenu.appendChild(buttonsContainer);
  
  // 创建返回按钮
  const backButton = document.createElement('button');
  backButton.className = 'pixel-button';
  backButton.textContent = '返回';
  backButton.addEventListener('click', () => {
    document.body.removeChild(optionsMenu);
  });
  buttonsContainer.appendChild(backButton);
  
  // 添加到文档
  document.body.appendChild(optionsMenu);
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
  // 隐藏加载屏幕
  document.getElementById('loading-screen').style.display = 'none';
  
  // 创建错误消息元素
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // 添加到文档
  document.body.appendChild(errorElement);
}
