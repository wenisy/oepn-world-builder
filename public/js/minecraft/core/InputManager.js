/**
 * 输入管理器类 - 处理键盘和鼠标输入
 */
export class InputManager {
  constructor(player, camera, controls) {
    this.player = player;
    this.camera = camera;
    this.controls = controls;
    
    // 键盘状态
    this.keys = {};
    
    // 鼠标状态
    this.mouse = {
      isDown: false,
      button: -1,
      breakCooldown: 0,
      placeCooldown: 0
    };
    
    // 绑定事件处理器
    this.bindEventHandlers();
  }
  
  /**
   * 绑定事件处理器
   */
  bindEventHandlers() {
    // 键盘按下事件
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    // 键盘松开事件
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // 鼠标按下事件
    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.mouse.button = e.button;
    });
    
    // 鼠标松开事件
    window.addEventListener('mouseup', (e) => {
      this.mouse.isDown = false;
      this.mouse.button = -1;
    });
    
    // 鼠标滚轮事件，用于切换物品栏
    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) {
        // 向下滚动，选择下一个物品
        this.player.nextItem();
      } else {
        // 向上滚动，选择上一个物品
        this.player.prevItem();
      }
    });
  }
  
  /**
   * 更新输入状态
   */
  update(deltaTime) {
    // 如果控制器未锁定，不处理输入
    if (this.controls.isLocked === false) return;
    
    // 移动方向
    const moveDirection = new THREE.Vector3();
    
    // 前后移动
    if (this.keys['KeyW']) moveDirection.z -= 1;
    if (this.keys['KeyS']) moveDirection.z += 1;
    
    // 左右移动
    if (this.keys['KeyA']) moveDirection.x -= 1;
    if (this.keys['KeyD']) moveDirection.x += 1;
    
    // 跳跃
    if (this.keys['Space'] && this.player.onGround) {
      this.player.jump();
    }
    
    // 规范化移动方向
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    // 根据相机方向调整移动方向
    moveDirection.applyQuaternion(this.camera.quaternion);
    moveDirection.y = 0; // 保持水平移动
    moveDirection.normalize();
    
    // 应用移动
    this.player.move(moveDirection, deltaTime);
    
    // 更新冷却时间
    if (this.mouse.breakCooldown > 0) this.mouse.breakCooldown -= deltaTime;
    if (this.mouse.placeCooldown > 0) this.mouse.placeCooldown -= deltaTime;
    
    // 处理方块交互
    this.handleBlockInteraction();
  }
  
  /**
   * 处理方块交互
   */
  handleBlockInteraction() {
    if (!this.mouse.isDown) return;
    
    // 获取相机方向
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    
    // 射线检测
    const result = this.player.raycast(this.camera.position, direction);
    
    if (result) {
      // 左键破坏方块
      if (this.mouse.button === 0 && this.mouse.breakCooldown <= 0) {
        const x = Math.round(result.position.x);
        const y = Math.round(result.position.y);
        const z = Math.round(result.position.z);
        
        this.player.breakBlock(x, y, z);
        this.mouse.breakCooldown = 0.25; // 冷却时间（秒）
      }
      // 右键放置方块
      else if (this.mouse.button === 2 && this.mouse.placeCooldown <= 0) {
        const x = Math.round(result.position.x + result.normal.x);
        const y = Math.round(result.position.y + result.normal.y);
        const z = Math.round(result.position.z + result.normal.z);
        
        this.player.placeBlock(x, y, z);
        this.mouse.placeCooldown = 0.25; // 冷却时间（秒）
      }
    }
  }
}
