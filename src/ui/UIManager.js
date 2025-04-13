/**
 * UI管理器 - 处理游戏界面
 */
export class UIManager {
  constructor(player, blockRegistry) {
    this.player = player;
    this.blockRegistry = blockRegistry;
    
    // UI元素
    this.crosshair = null;
    this.hotbar = null;
    this.healthBar = null;
    this.hungerBar = null;
    this.debugInfo = null;
    
    // 初始化UI
    this.init();
  }
  
  /**
   * 初始化UI
   */
  init() {
    // 创建UI容器
    this.container = document.createElement('div');
    this.container.className = 'game-ui';
    document.body.appendChild(this.container);
    
    // 创建准星
    this.createCrosshair();
    
    // 创建物品栏
    this.createHotbar();
    
    // 创建状态栏
    this.createStatusBars();
    
    // 创建调试信息
    this.createDebugInfo();
  }
  
  /**
   * 创建准星
   */
  createCrosshair() {
    this.crosshair = document.createElement('div');
    this.crosshair.className = 'crosshair';
    this.container.appendChild(this.crosshair);
  }
  
  /**
   * 创建物品栏
   */
  createHotbar() {
    this.hotbar = document.createElement('div');
    this.hotbar.className = 'hotbar';
    this.container.appendChild(this.hotbar);
    
    // 创建物品槽
    for (let i = 0; i < this.player.hotbarSize; i++) {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      
      // 添加数字标签
      const label = document.createElement('div');
      label.className = 'slot-label';
      label.textContent = (i + 1) % 10; // 1-9
      slot.appendChild(label);
      
      // 添加物品图标
      const icon = document.createElement('div');
      icon.className = 'slot-icon';
      slot.appendChild(icon);
      
      // 添加物品数量
      const count = document.createElement('div');
      count.className = 'slot-count';
      slot.appendChild(count);
      
      this.hotbar.appendChild(slot);
    }
  }
  
  /**
   * 创建状态栏
   */
  createStatusBars() {
    // 创建状态栏容器
    const statusBars = document.createElement('div');
    statusBars.className = 'status-bars';
    this.container.appendChild(statusBars);
    
    // 创建生命值栏
    this.healthBar = document.createElement('div');
    this.healthBar.className = 'health-bar';
    statusBars.appendChild(this.healthBar);
    
    // 创建饥饿度栏
    this.hungerBar = document.createElement('div');
    this.hungerBar.className = 'hunger-bar';
    statusBars.appendChild(this.hungerBar);
    
    // 创建氧气栏
    this.breathBar = document.createElement('div');
    this.breathBar.className = 'breath-bar';
    statusBars.appendChild(this.breathBar);
  }
  
  /**
   * 创建调试信息
   */
  createDebugInfo() {
    this.debugInfo = document.createElement('div');
    this.debugInfo.className = 'debug-info';
    this.container.appendChild(this.debugInfo);
  }
  
  /**
   * 更新UI
   * @param {number} deltaTime - 时间增量
   * @param {number} fps - 帧率
   */
  update(deltaTime, fps) {
    // 更新物品栏
    this.updateHotbar();
    
    // 更新状态栏
    this.updateStatusBars();
    
    // 更新调试信息
    this.updateDebugInfo(fps);
  }
  
  /**
   * 更新物品栏
   */
  updateHotbar() {
    // 获取所有物品槽
    const slots = this.hotbar.querySelectorAll('.hotbar-slot');
    
    // 更新每个槽位
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const item = this.player.inventory[i];
      
      // 更新选中状态
      if (i === this.player.selectedSlot) {
        slot.classList.add('selected');
      } else {
        slot.classList.remove('selected');
      }
      
      // 更新物品图标
      const icon = slot.querySelector('.slot-icon');
      
      if (item) {
        // 获取方块数据
        const block = this.blockRegistry.getById(item.id);
        
        if (block) {
          // 设置图标背景色
          icon.style.backgroundColor = `#${block.color.toString(16).padStart(6, '0')}`;
          icon.style.display = 'block';
        } else {
          icon.style.display = 'none';
        }
        
        // 更新物品数量
        const count = slot.querySelector('.slot-count');
        count.textContent = item.count > 1 ? item.count : '';
        count.style.display = item.count > 1 ? 'block' : 'none';
      } else {
        // 没有物品
        icon.style.display = 'none';
        slot.querySelector('.slot-count').style.display = 'none';
      }
    }
  }
  
  /**
   * 更新状态栏
   */
  updateStatusBars() {
    // 更新生命值
    this.healthBar.innerHTML = '';
    const healthIcons = Math.ceil(this.player.health / 2);
    const maxHealthIcons = Math.ceil(this.player.maxHealth / 2);
    
    for (let i = 0; i < maxHealthIcons; i++) {
      const icon = document.createElement('div');
      
      if (i < Math.floor(this.player.health / 2)) {
        icon.className = 'health-icon full';
      } else if (i === Math.floor(this.player.health / 2) && this.player.health % 2 === 1) {
        icon.className = 'health-icon half';
      } else {
        icon.className = 'health-icon empty';
      }
      
      this.healthBar.appendChild(icon);
    }
    
    // 更新饥饿度
    this.hungerBar.innerHTML = '';
    const hungerIcons = Math.ceil(this.player.hunger / 2);
    const maxHungerIcons = Math.ceil(this.player.maxHunger / 2);
    
    for (let i = 0; i < maxHungerIcons; i++) {
      const icon = document.createElement('div');
      
      if (i < Math.floor(this.player.hunger / 2)) {
        icon.className = 'hunger-icon full';
      } else if (i === Math.floor(this.player.hunger / 2) && this.player.hunger % 2 === 1) {
        icon.className = 'hunger-icon half';
      } else {
        icon.className = 'hunger-icon empty';
      }
      
      this.hungerBar.appendChild(icon);
    }
    
    // 更新氧气
    this.breathBar.style.display = this.player.isUnderwater ? 'block' : 'none';
    
    if (this.player.isUnderwater) {
      this.breathBar.innerHTML = '';
      const breathIcons = Math.ceil(this.player.breath / 2);
      const maxBreathIcons = Math.ceil(this.player.maxBreath / 2);
      
      for (let i = 0; i < maxBreathIcons; i++) {
        const icon = document.createElement('div');
        
        if (i < Math.floor(this.player.breath / 2)) {
          icon.className = 'breath-icon full';
        } else if (i === Math.floor(this.player.breath / 2) && this.player.breath % 2 === 1) {
          icon.className = 'breath-icon half';
        } else {
          icon.className = 'breath-icon empty';
        }
        
        this.breathBar.appendChild(icon);
      }
    }
  }
  
  /**
   * 更新调试信息
   * @param {number} fps - 帧率
   */
  updateDebugInfo(fps) {
    // 获取玩家位置
    const position = this.player.position;
    
    // 更新调试信息
    this.debugInfo.innerHTML = `
      <div>FPS: ${fps}</div>
      <div>XYZ: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}</div>
      <div>区块: ${Math.floor(position.x / 16)}, ${Math.floor(position.z / 16)}</div>
    `;
  }
  
  /**
   * 显示方块破坏进度
   * @param {number} progress - 进度（0-1）
   */
  showBreakProgress(progress) {
    // 如果进度为0，隐藏进度条
    if (progress <= 0) {
      if (this.breakProgress) {
        this.breakProgress.style.display = 'none';
      }
      return;
    }
    
    // 如果进度条不存在，创建它
    if (!this.breakProgress) {
      this.breakProgress = document.createElement('div');
      this.breakProgress.className = 'break-progress';
      this.container.appendChild(this.breakProgress);
    }
    
    // 显示进度条
    this.breakProgress.style.display = 'block';
    
    // 更新进度
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${progress * 100}%`;
    
    this.breakProgress.innerHTML = '';
    this.breakProgress.appendChild(progressBar);
  }
  
  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时间（毫秒）
   */
  showMessage(message, duration = 3000) {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    
    // 添加到容器
    this.container.appendChild(messageElement);
    
    // 设置淡入效果
    messageElement.style.opacity = '0';
    setTimeout(() => {
      messageElement.style.opacity = '1';
    }, 10);
    
    // 设置淡出和移除
    setTimeout(() => {
      messageElement.style.opacity = '0';
      
      // 移除元素
      setTimeout(() => {
        this.container.removeChild(messageElement);
      }, 500);
    }, duration);
  }
  
  /**
   * 销毁UI
   */
  destroy() {
    // 移除UI容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
