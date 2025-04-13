/**
 * 输入管理器 - 处理键盘和鼠标输入
 */
export class InputManager {
  constructor(player, domElement) {
    this.player = player;
    this.domElement = domElement;
    
    // 按键映射
    this.keyMap = {
      'KeyW': 'forward',
      'KeyS': 'backward',
      'KeyA': 'left',
      'KeyD': 'right',
      'Space': 'jump',
      'ShiftLeft': 'sprint',
      'ControlLeft': 'sneak'
    };
    
    // 鼠标锁定状态
    this.isLocked = false;
    
    // 绑定事件处理函数
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    
    // 添加事件监听器
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('wheel', this.onWheel);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    
    // 点击画布锁定鼠标
    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) {
        this.domElement.requestPointerLock();
      }
    });
  }
  
  /**
   * 键盘按下事件处理
   * @param {KeyboardEvent} event - 键盘事件
   */
  onKeyDown(event) {
    // 如果鼠标未锁定，忽略游戏控制键
    if (!this.isLocked) return;
    
    // 检查是否是映射的按键
    if (this.keyMap[event.code]) {
      // 设置输入状态
      this.player.setInput(this.keyMap[event.code], true);
      
      // 阻止默认行为
      event.preventDefault();
    }
    
    // 数字键选择物品栏槽位
    if (event.code.startsWith('Digit')) {
      const slot = parseInt(event.code.substring(5)) - 1;
      if (slot >= 0 && slot <= 8) {
        this.player.selectSlot(slot);
      }
    }
  }
  
  /**
   * 键盘松开事件处理
   * @param {KeyboardEvent} event - 键盘事件
   */
  onKeyUp(event) {
    // 检查是否是映射的按键
    if (this.keyMap[event.code]) {
      // 设置输入状态
      this.player.setInput(this.keyMap[event.code], false);
      
      // 阻止默认行为
      event.preventDefault();
    }
  }
  
  /**
   * 鼠标移动事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  onMouseMove(event) {
    // 如果鼠标锁定，处理视角旋转
    if (this.isLocked) {
      this.player.handleMouseMove(event.movementX, event.movementY);
    }
  }
  
  /**
   * 鼠标按下事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  onMouseDown(event) {
    // 如果鼠标未锁定，忽略
    if (!this.isLocked) return;
    
    // 左键
    if (event.button === 0) {
      this.player.setMouseButton('left', true);
    }
    // 右键
    else if (event.button === 2) {
      this.player.setMouseButton('right', true);
      
      // 放置方块
      if (this.player.placeBlock) {
        this.player.placeBlock(window.game.chunkManager);
      }
    }
    
    // 阻止默认行为
    event.preventDefault();
  }
  
  /**
   * 鼠标松开事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  onMouseUp(event) {
    // 左键
    if (event.button === 0) {
      this.player.setMouseButton('left', false);
    }
    // 右键
    else if (event.button === 2) {
      this.player.setMouseButton('right', false);
    }
    
    // 阻止默认行为
    event.preventDefault();
  }
  
  /**
   * 鼠标滚轮事件处理
   * @param {WheelEvent} event - 滚轮事件
   */
  onWheel(event) {
    // 如果鼠标未锁定，忽略
    if (!this.isLocked) return;
    
    // 向上滚动，选择上一个槽位
    if (event.deltaY < 0) {
      this.player.selectPrevSlot();
    }
    // 向下滚动，选择下一个槽位
    else if (event.deltaY > 0) {
      this.player.selectNextSlot();
    }
    
    // 阻止默认行为
    event.preventDefault();
  }
  
  /**
   * 指针锁定状态变化事件处理
   */
  onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
  }
  
  /**
   * 销毁输入管理器
   */
  destroy() {
    // 移除事件监听器
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('wheel', this.onWheel);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    
    // 解锁鼠标
    if (this.isLocked) {
      document.exitPointerLock();
    }
  }
}
