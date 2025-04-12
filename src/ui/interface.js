import { initBuildMenu } from './buildMenu.js';
import { initSocialMenu } from './socialMenu.js';

/**
 * 初始化UI界面
 * @param {Object} gameState - 游戏状态
 * @returns {Object} UI系统对象
 */
export function initUI(gameState) {
  // 初始化子菜单
  const buildMenu = initBuildMenu(gameState);
  const socialMenu = initSocialMenu(gameState);
  
  // 获取UI元素
  const playerNameElement = document.getElementById('player-name');
  const playerResourcesElement = document.getElementById('player-resources');
  const buildButton = document.getElementById('build-btn');
  const socialButton = document.getElementById('social-btn');
  const settingsButton = document.getElementById('settings-btn');
  
  // 创建设置菜单
  createSettingsMenu();
  
  // 注册按钮事件
  registerButtonEvents();
  
  /**
   * 创建设置菜单
   */
  function createSettingsMenu() {
    // 创建设置菜单容器
    const settingsMenu = document.createElement('div');
    settingsMenu.id = 'settings-menu';
    settingsMenu.innerHTML = `
      <h2>游戏设置</h2>
      
      <div class="settings-group">
        <h3>图形设置</h3>
        <div class="settings-item">
          <label for="graphics-quality">图形质量</label>
          <select id="graphics-quality">
            <option value="low">低</option>
            <option value="medium" selected>中</option>
            <option value="high">高</option>
          </select>
        </div>
      </div>
      
      <div class="settings-group">
        <h3>音频设置</h3>
        <div class="settings-item">
          <label for="sound-volume">音效音量</label>
          <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="0.7">
        </div>
        <div class="settings-item">
          <label for="music-volume">音乐音量</label>
          <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.5">
        </div>
      </div>
      
      <div class="settings-group">
        <h3>控制设置</h3>
        <div class="settings-item">
          <label for="mouse-sensitivity">鼠标灵敏度</label>
          <input type="range" id="mouse-sensitivity" min="0.1" max="2" step="0.1" value="1">
        </div>
      </div>
      
      <div class="settings-buttons">
        <button id="settings-save">保存</button>
        <button id="settings-cancel">取消</button>
      </div>
    `;
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(settingsMenu);
    
    // 注册设置菜单按钮事件
    document.getElementById('settings-save').addEventListener('click', () => {
      // 保存设置
      gameState.settings.graphics = document.getElementById('graphics-quality').value;
      gameState.settings.sound = parseFloat(document.getElementById('sound-volume').value);
      gameState.settings.music = parseFloat(document.getElementById('music-volume').value);
      
      // 隐藏设置菜单
      settingsMenu.classList.remove('active');
    });
    
    document.getElementById('settings-cancel').addEventListener('click', () => {
      // 隐藏设置菜单
      settingsMenu.classList.remove('active');
    });
  }
  
  /**
   * 注册按钮事件
   */
  function registerButtonEvents() {
    // 建造按钮
    buildButton.addEventListener('click', () => {
      // 切换建造菜单
      buildMenu.toggle();
      
      // 隐藏其他菜单
      document.getElementById('social-menu')?.classList.remove('active');
      document.getElementById('settings-menu')?.classList.remove('active');
    });
    
    // 社交按钮
    socialButton.addEventListener('click', () => {
      // 切换社交菜单
      socialMenu.toggle();
      
      // 隐藏其他菜单
      document.getElementById('build-menu')?.classList.remove('active');
      document.getElementById('settings-menu')?.classList.remove('active');
    });
    
    // 设置按钮
    settingsButton.addEventListener('click', () => {
      // 切换设置菜单
      const settingsMenu = document.getElementById('settings-menu');
      settingsMenu.classList.toggle('active');
      
      // 隐藏其他菜单
      document.getElementById('build-menu')?.classList.remove('active');
      document.getElementById('social-menu')?.classList.remove('active');
      
      // 更新设置菜单的值
      document.getElementById('graphics-quality').value = gameState.settings.graphics;
      document.getElementById('sound-volume').value = gameState.settings.sound;
      document.getElementById('music-volume').value = gameState.settings.music;
    });
  }
  
  /**
   * 更新UI
   */
  function update() {
    // 更新玩家信息
    playerNameElement.textContent = gameState.player.name;
    playerResourcesElement.textContent = `资源: ${gameState.player.resources}`;
    
    // 更新子菜单
    buildMenu.update();
    socialMenu.update();
  }
  
  /**
   * 显示通知
   * @param {string} message - 通知消息
   * @param {string} type - 通知类型（'info', 'success', 'warning', 'error'）
   * @param {number} duration - 显示时长（毫秒）
   */
  function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(notification);
    
    // 设置淡入动画
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    // 触发重排以应用动画
    notification.offsetHeight;
    
    // 淡入
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    // 设置自动消失
    setTimeout(() => {
      // 淡出
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      
      // 移除元素
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
  
  /**
   * 显示对话框
   * @param {string} title - 对话框标题
   * @param {string} message - 对话框消息
   * @param {Array} buttons - 按钮配置数组
   * @returns {Promise} 返回用户选择的按钮索引
   */
  function showDialog(title, message, buttons = [{ text: '确定', type: 'primary' }]) {
    return new Promise((resolve) => {
      // 创建对话框背景
      const dialogBackground = document.createElement('div');
      dialogBackground.className = 'dialog-background';
      
      // 创建对话框
      const dialog = document.createElement('div');
      dialog.className = 'dialog';
      
      // 创建对话框内容
      dialog.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="dialog-buttons"></div>
      `;
      
      // 添加按钮
      const buttonContainer = dialog.querySelector('.dialog-buttons');
      buttons.forEach((button, index) => {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = button.text;
        buttonElement.className = button.type || 'default';
        
        // 添加点击事件
        buttonElement.addEventListener('click', () => {
          // 移除对话框
          dialogBackground.remove();
          
          // 返回按钮索引
          resolve(index);
        });
        
        buttonContainer.appendChild(buttonElement);
      });
      
      // 添加到UI覆盖层
      dialogBackground.appendChild(dialog);
      document.getElementById('ui-overlay').appendChild(dialogBackground);
      
      // 设置淡入动画
      dialogBackground.style.opacity = '0';
      dialog.style.transform = 'scale(0.9)';
      
      // 触发重排以应用动画
      dialogBackground.offsetHeight;
      
      // 淡入
      dialogBackground.style.opacity = '1';
      dialog.style.transform = 'scale(1)';
    });
  }
  
  // 返回UI系统对象
  return {
    buildMenu,
    socialMenu,
    update,
    showNotification,
    showDialog
  };
}
