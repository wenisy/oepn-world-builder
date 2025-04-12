/**
 * 初始化建造菜单
 * @param {Object} gameState - 游戏状态
 * @returns {Object} 建造菜单对象
 */
export function initBuildMenu(gameState) {
  // 建筑类型定义
  const buildingTypes = [
    {
      id: 'house',
      name: '房屋',
      icon: 'house.png',
      description: '基础住宅建筑',
      cost: { wood: 20, stone: 10 },
      buildTime: 5,
      type: 'basicBuilding'
    },
    {
      id: 'workshop',
      name: '工坊',
      icon: 'workshop.png',
      description: '用于制作工具和加工资源',
      cost: { wood: 30, stone: 20 },
      buildTime: 8,
      type: 'basicBuilding'
    },
    {
      id: 'farm',
      name: '农场',
      icon: 'farm.png',
      description: '生产食物资源',
      cost: { wood: 15, stone: 5 },
      buildTime: 4,
      type: 'basicBuilding'
    },
    {
      id: 'tower',
      name: '瞭望塔',
      icon: 'tower.png',
      description: '提供视野和防御',
      cost: { wood: 25, stone: 15 },
      buildTime: 6,
      type: 'basicBuilding'
    },
    {
      id: 'townhall',
      name: '市政厅',
      icon: 'townhall.png',
      description: '城市中心建筑，提供管理功能',
      cost: { wood: 50, stone: 30, iron: 10 },
      buildTime: 15,
      type: 'advancedBuilding'
    },
    {
      id: 'wall',
      name: '城墙',
      icon: 'wall.png',
      description: '防御建筑，保护城市',
      cost: { stone: 20 },
      buildTime: 3,
      type: 'basicBuilding'
    }
  ];
  
  // 创建建造菜单
  createBuildMenu();
  
  // 当前选中的建筑类型
  let selectedBuildingType = null;
  
  // 建造模式状态
  let buildMode = false;
  
  /**
   * 创建建造菜单
   */
  function createBuildMenu() {
    // 创建菜单容器
    const buildMenu = document.createElement('div');
    buildMenu.id = 'build-menu';
    
    // 添加建筑类型
    buildingTypes.forEach(building => {
      const buildItem = document.createElement('div');
      buildItem.className = 'build-item';
      buildItem.dataset.id = building.id;
      
      // 添加图标和名称
      buildItem.innerHTML = `
        <img src="assets/icons/${building.icon}" alt="${building.name}" onerror="this.src='assets/icons/placeholder.png'">
        <span>${building.name}</span>
      `;
      
      // 添加点击事件
      buildItem.addEventListener('click', () => {
        // 选择建筑类型
        selectBuildingType(building);
      });
      
      // 添加鼠标悬停提示
      buildItem.title = `${building.name}\n${building.description}\n\n所需资源:${Object.entries(building.cost).map(([resource, amount]) => `\n- ${resource}: ${amount}`).join('')}\n\n建造时间: ${building.buildTime}秒`;
      
      // 添加到菜单
      buildMenu.appendChild(buildItem);
    });
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(buildMenu);
  }
  
  /**
   * 选择建筑类型
   * @param {Object} buildingType - 建筑类型
   */
  function selectBuildingType(buildingType) {
    // 设置当前选中的建筑类型
    selectedBuildingType = buildingType;
    
    // 更新所有建筑项的样式
    const buildItems = document.querySelectorAll('.build-item');
    buildItems.forEach(item => {
      if (item.dataset.id === buildingType.id) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    
    // 进入建造模式
    enterBuildMode();
  }
  
  /**
   * 进入建造模式
   */
  function enterBuildMode() {
    // 设置建造模式状态
    buildMode = true;
    
    // 显示建造指示器
    showBuildIndicator();
    
    // 隐藏建造菜单
    document.getElementById('build-menu').classList.remove('active');
    
    // 显示取消建造按钮
    showCancelBuildButton();
  }
  
  /**
   * 退出建造模式
   */
  function exitBuildMode() {
    // 重置建造模式状态
    buildMode = false;
    selectedBuildingType = null;
    
    // 隐藏建造指示器
    hideBuildIndicator();
    
    // 移除取消建造按钮
    document.getElementById('cancel-build-btn')?.remove();
  }
  
  /**
   * 显示建造指示器
   */
  function showBuildIndicator() {
    // 创建建造指示器
    const indicator = document.createElement('div');
    indicator.id = 'build-indicator';
    indicator.className = 'build-indicator';
    
    // 设置样式
    indicator.style.position = 'absolute';
    indicator.style.width = '50px';
    indicator.style.height = '50px';
    indicator.style.backgroundColor = 'rgba(76, 175, 80, 0.5)';
    indicator.style.border = '2px solid #4CAF50';
    indicator.style.borderRadius = '5px';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '1000';
    indicator.style.display = 'none';
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(indicator);
    
    // 监听鼠标移动
    document.addEventListener('mousemove', updateBuildIndicatorPosition);
    
    // 监听鼠标点击
    document.addEventListener('click', handleBuildClick);
  }
  
  /**
   * 隐藏建造指示器
   */
  function hideBuildIndicator() {
    // 移除建造指示器
    document.getElementById('build-indicator')?.remove();
    
    // 移除事件监听器
    document.removeEventListener('mousemove', updateBuildIndicatorPosition);
    document.removeEventListener('click', handleBuildClick);
  }
  
  /**
   * 更新建造指示器位置
   * @param {MouseEvent} event - 鼠标事件
   */
  function updateBuildIndicatorPosition(event) {
    const indicator = document.getElementById('build-indicator');
    if (!indicator) return;
    
    // 显示指示器
    indicator.style.display = 'block';
    
    // 更新位置
    indicator.style.left = `${event.clientX - 25}px`;
    indicator.style.top = `${event.clientY - 25}px`;
    
    // 检查是否可以在当前位置建造
    const canBuild = checkCanBuild(event.clientX, event.clientY);
    
    // 更新指示器样式
    if (canBuild) {
      indicator.style.backgroundColor = 'rgba(76, 175, 80, 0.5)';
      indicator.style.border = '2px solid #4CAF50';
    } else {
      indicator.style.backgroundColor = 'rgba(244, 67, 54, 0.5)';
      indicator.style.border = '2px solid #F44336';
    }
  }
  
  /**
   * 检查是否可以在指定位置建造
   * @param {number} x - 屏幕X坐标
   * @param {number} y - 屏幕Y坐标
   * @returns {boolean} 是否可以建造
   */
  function checkCanBuild(x, y) {
    // 这里需要实现射线投射，将屏幕坐标转换为世界坐标
    // 然后检查该位置是否可以建造
    // 暂时返回true，表示可以建造
    return true;
  }
  
  /**
   * 处理建造点击
   * @param {MouseEvent} event - 鼠标事件
   */
  function handleBuildClick(event) {
    // 检查是否可以在当前位置建造
    const canBuild = checkCanBuild(event.clientX, event.clientY);
    
    if (canBuild && selectedBuildingType) {
      // 检查资源是否足够
      if (checkResources(selectedBuildingType.cost)) {
        // 开始建造
        startBuilding(event.clientX, event.clientY);
      } else {
        // 显示资源不足提示
        alert('资源不足，无法建造！');
      }
    }
  }
  
  /**
   * 检查资源是否足够
   * @param {Object} cost - 建筑成本
   * @returns {boolean} 资源是否足够
   */
  function checkResources(cost) {
    // 检查每种资源是否足够
    for (const [resource, amount] of Object.entries(cost)) {
      if ((gameState.player.resources[resource] || 0) < amount) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 开始建造
   * @param {number} screenX - 屏幕X坐标
   * @param {number} screenY - 屏幕Y坐标
   */
  function startBuilding(screenX, screenY) {
    // 这里需要实现射线投射，将屏幕坐标转换为世界坐标
    // 然后在该位置创建建筑
    // 暂时使用随机坐标
    const worldX = Math.random() * 10 - 5;
    const worldZ = Math.random() * 10 - 5;
    const worldY = 0; // 假设在地面上
    
    // 扣除资源
    for (const [resource, amount] of Object.entries(selectedBuildingType.cost)) {
      gameState.player.resources[resource] = (gameState.player.resources[resource] || 0) - amount;
    }
    
    // 创建建筑（这里需要与世界系统集成）
    console.log(`在位置(${worldX}, ${worldY}, ${worldZ})建造${selectedBuildingType.name}`);
    
    // 退出建造模式
    exitBuildMode();
  }
  
  /**
   * 显示取消建造按钮
   */
  function showCancelBuildButton() {
    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-build-btn';
    cancelButton.textContent = '取消建造';
    
    // 设置样式
    cancelButton.style.position = 'absolute';
    cancelButton.style.bottom = '20px';
    cancelButton.style.left = '50%';
    cancelButton.style.transform = 'translateX(-50%)';
    cancelButton.style.zIndex = '1001';
    
    // 添加点击事件
    cancelButton.addEventListener('click', exitBuildMode);
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(cancelButton);
  }
  
  /**
   * 切换建造菜单显示状态
   */
  function toggle() {
    const menu = document.getElementById('build-menu');
    menu.classList.toggle('active');
    
    // 如果关闭菜单且处于建造模式，退出建造模式
    if (!menu.classList.contains('active') && buildMode) {
      exitBuildMode();
    }
  }
  
  /**
   * 更新建造菜单
   */
  function update() {
    // 更新建筑项的可用状态
    const buildItems = document.querySelectorAll('.build-item');
    buildItems.forEach(item => {
      const buildingType = buildingTypes.find(type => type.id === item.dataset.id);
      if (buildingType) {
        // 检查资源是否足够
        const canBuild = checkResources(buildingType.cost);
        
        // 更新样式
        if (canBuild) {
          item.classList.remove('disabled');
        } else {
          item.classList.add('disabled');
        }
      }
    });
  }
  
  // 返回建造菜单对象
  return {
    toggle,
    update,
    enterBuildMode,
    exitBuildMode
  };
}
