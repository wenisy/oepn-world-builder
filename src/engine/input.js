/**
 * 输入系统 - 处理键盘、鼠标和触摸输入
 * @param {Object} gameState - 游戏状态对象
 * @returns {Object} 输入系统对象
 */
export function initInputSystem(gameState) {
  // 键盘状态
  const keyState = {};
  
  // 鼠标状态
  const mouseState = {
    position: { x: 0, y: 0 },
    worldPosition: { x: 0, y: 0, z: 0 },
    buttons: [false, false, false],
    wheel: 0
  };
  
  // 触摸状态
  const touchState = {
    touches: [],
    active: false
  };
  
  // 注册键盘事件监听器
  window.addEventListener('keydown', (event) => {
    keyState[event.key.toLowerCase()] = true;
    
    // 处理特殊按键
    handleSpecialKeys(event.key.toLowerCase());
  });
  
  window.addEventListener('keyup', (event) => {
    keyState[event.key.toLowerCase()] = false;
  });
  
  // 注册鼠标事件监听器
  window.addEventListener('mousemove', (event) => {
    mouseState.position.x = event.clientX;
    mouseState.position.y = event.clientY;
    
    // 计算鼠标在世界中的位置（需要射线投射，在渲染器中实现）
  });
  
  window.addEventListener('mousedown', (event) => {
    mouseState.buttons[event.button] = true;
  });
  
  window.addEventListener('mouseup', (event) => {
    mouseState.buttons[event.button] = false;
  });
  
  window.addEventListener('wheel', (event) => {
    mouseState.wheel = Math.sign(event.deltaY);
    
    // 在下一帧重置滚轮状态
    setTimeout(() => {
      mouseState.wheel = 0;
    }, 50);
  });
  
  // 注册触摸事件监听器
  window.addEventListener('touchstart', (event) => {
    updateTouches(event.touches);
    touchState.active = true;
  });
  
  window.addEventListener('touchmove', (event) => {
    updateTouches(event.touches);
  });
  
  window.addEventListener('touchend', (event) => {
    updateTouches(event.touches);
    if (event.touches.length === 0) {
      touchState.active = false;
    }
  });
  
  // 更新触摸状态
  function updateTouches(touches) {
    touchState.touches = [];
    for (let i = 0; i < touches.length; i++) {
      touchState.touches.push({
        id: touches[i].identifier,
        x: touches[i].clientX,
        y: touches[i].clientY
      });
    }
  }
  
  // 处理特殊按键
  function handleSpecialKeys(key) {
    // 根据游戏设置中的控制映射处理按键
    const controls = gameState.settings.controls;
    
    // 建造模式切换
    if (key === controls.build) {
      const buildMenu = document.getElementById('build-menu');
      if (buildMenu) {
        buildMenu.classList.toggle('active');
      }
    }
    
    // 其他特殊按键...
  }
  
  // 检查按键是否被按下
  function isKeyPressed(key) {
    return !!keyState[key.toLowerCase()];
  }
  
  // 检查鼠标按钮是否被按下
  function isMouseButtonPressed(button) {
    return mouseState.buttons[button];
  }
  
  // 获取移动输入向量
  function getMovementVector() {
    const controls = gameState.settings.controls;
    const vector = { x: 0, z: 0 };
    
    if (isKeyPressed(controls.forward)) vector.z -= 1;
    if (isKeyPressed(controls.backward)) vector.z += 1;
    if (isKeyPressed(controls.left)) vector.x -= 1;
    if (isKeyPressed(controls.right)) vector.x += 1;
    
    // 归一化向量
    const length = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
    if (length > 0) {
      vector.x /= length;
      vector.z /= length;
    }
    
    return vector;
  }
  
  // 更新输入状态
  function update() {
    // 在这里可以添加任何需要每帧更新的输入逻辑
  }
  
  // 返回输入系统对象
  return {
    keyState,
    mouseState,
    touchState,
    isKeyPressed,
    isMouseButtonPressed,
    getMovementVector,
    update
  };
}
