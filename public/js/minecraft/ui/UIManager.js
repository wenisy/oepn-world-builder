/**
 * UI管理器类 - 负责游戏界面的创建和更新
 */
export class UIManager {
  constructor(player) {
    this.player = player;
    
    // UI元素
    this.hud = null;
    this.crosshair = null;
    this.hotbar = null;
    this.healthBar = null;
    this.hungerBar = null;
    
    // 初始化UI
    this.init();
  }
  
  /**
   * 初始化UI
   */
  init() {
    // 创建HUD容器
    this.hud = document.createElement('div');
    this.hud.id = 'hud';
    document.body.appendChild(this.hud);
    
    // 创建准星
    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.hud.appendChild(this.crosshair);
    
    // 创建物品栏
    this.hotbar = document.createElement('div');
    this.hotbar.id = 'hotbar';
    this.hud.appendChild(this.hotbar);
    
    // 创建生命值和饥饿度条
    const statusBars = document.createElement('div');
    statusBars.id = 'status-bars';
    
    this.healthBar = document.createElement('div');
    this.healthBar.id = 'health-bar';
    this.healthBar.className = 'status-bar';
    
    this.hungerBar = document.createElement('div');
    this.hungerBar.id = 'hunger-bar';
    this.hungerBar.className = 'status-bar';
    
    statusBars.appendChild(this.healthBar);
    statusBars.appendChild(this.hungerBar);
    this.hud.appendChild(statusBars);
    
    // 初始化物品栏
    this.updateHotbar();
  }
  
  /**
   * 更新UI
   */
  update() {
    // 更新物品栏
    this.updateHotbar();
    
    // 更新生命值
    this.updateHealth();
    
    // 更新饥饿度
    this.updateHunger();
  }
  
  /**
   * 更新物品栏
   */
  updateHotbar() {
    if (!this.hotbar) return;
    
    // 清空物品栏
    this.hotbar.innerHTML = '';
    
    // 添加物品
    this.player.inventory.forEach((item, index) => {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      
      if (index === this.player.selectedSlot) {
        slot.classList.add('selected');
      }
      
      if (item && item.count > 0) {
        const itemIcon = document.createElement('div');
        itemIcon.className = 'item-icon';
        
        // 设置物品图标背景色（实际游戏中应该使用纹理）
        const blockColor = this.getBlockColor(item.id);
        itemIcon.style.backgroundColor = blockColor;
        
        const itemCount = document.createElement('span');
        itemCount.className = 'item-count';
        itemCount.textContent = item.count;
        
        slot.appendChild(itemIcon);
        slot.appendChild(itemCount);
      }
      
      this.hotbar.appendChild(slot);
    });
  }
  
  /**
   * 更新生命值
   */
  updateHealth() {
    if (!this.healthBar) return;
    
    const healthPercent = (this.player.health / this.player.maxHealth) * 100;
    this.healthBar.style.width = `${healthPercent}%`;
  }
  
  /**
   * 更新饥饿度
   */
  updateHunger() {
    if (!this.hungerBar) return;
    
    const hungerPercent = (this.player.hunger / this.player.maxHunger) * 100;
    this.hungerBar.style.width = `${hungerPercent}%`;
  }
  
  /**
   * 获取方块颜色
   */
  getBlockColor(blockId) {
    // 方块颜色映射
    const colors = {
      'stone': '#888888',
      'dirt': '#8B4513',
      'grass': '#7CFC00',
      'wood': '#8B4513',
      'leaves': '#00FF00',
      'sand': '#FFD700',
      'glass': '#ADD8E6',
      'brick': '#B22222',
      'cactus': '#2E8B57'
    };
    
    return colors[blockId] || '#CCCCCC';
  }
  
  /**
   * 显示消息
   */
  showMessage(message, duration = 3000) {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.textContent = message;
    
    // 添加到HUD
    this.hud.appendChild(messageElement);
    
    // 设置淡出动画
    setTimeout(() => {
      messageElement.classList.add('fade-out');
      
      // 移除元素
      setTimeout(() => {
        this.hud.removeChild(messageElement);
      }, 500);
    }, duration);
  }
  
  /**
   * 显示游戏菜单
   */
  showMenu() {
    // 创建菜单元素
    const menu = document.createElement('div');
    menu.className = 'game-menu';
    
    // 创建菜单标题
    const title = document.createElement('h1');
    title.className = 'menu-title';
    title.textContent = 'Minecraft 风格沙盒游戏';
    menu.appendChild(title);
    
    // 创建按钮容器
    const buttons = document.createElement('div');
    buttons.className = 'menu-buttons';
    menu.appendChild(buttons);
    
    // 创建继续游戏按钮
    const resumeButton = document.createElement('button');
    resumeButton.className = 'pixel-button';
    resumeButton.textContent = '继续游戏';
    resumeButton.addEventListener('click', () => {
      document.body.removeChild(menu);
    });
    buttons.appendChild(resumeButton);
    
    // 创建选项按钮
    const optionsButton = document.createElement('button');
    optionsButton.className = 'pixel-button';
    optionsButton.textContent = '选项';
    buttons.appendChild(optionsButton);
    
    // 创建退出按钮
    const exitButton = document.createElement('button');
    exitButton.className = 'pixel-button';
    exitButton.textContent = '退出游戏';
    buttons.appendChild(exitButton);
    
    // 添加到文档
    document.body.appendChild(menu);
  }
}
