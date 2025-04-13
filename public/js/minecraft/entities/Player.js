/**
 * 玩家类 - 表示游戏中的玩家
 */
export class Player {
  constructor(options = {}) {
    // 玩家属性
    this.position = options.position || new THREE.Vector3(0, 20, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.onGround = false;
    this.eyeHeight = 1.6; // 玩家视线高度
    
    // 物理属性
    this.speed = options.speed || 5.0; // 移动速度（方块/秒）
    this.jumpStrength = options.jumpStrength || 8.0; // 跳跃强度
    this.gravity = options.gravity || 20.0; // 重力加速度
    
    // 游戏属性
    this.health = options.health || 10;
    this.maxHealth = options.maxHealth || 10;
    this.hunger = options.hunger || 10;
    this.maxHunger = options.maxHunger || 10;
    
    // 物品栏
    this.inventory = options.inventory || [
      { id: 'stone', count: 64 },
      { id: 'dirt', count: 64 },
      { id: 'grass', count: 64 },
      { id: 'wood', count: 64 },
      { id: 'leaves', count: 64 },
      { id: 'sand', count: 64 },
      { id: 'glass', count: 64 },
      { id: 'brick', count: 64 },
      { id: 'cactus', count: 64 }
    ];
    this.selectedSlot = 0;
    
    // 碰撞箱
    this.width = 0.6; // 玩家宽度
    this.height = 1.8; // 玩家高度
  }
  
  /**
   * 更新玩家
   */
  update(deltaTime, world) {
    // 应用重力
    this.velocity.y -= this.gravity * deltaTime;
    
    // 应用速度
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // 碰撞检测
    this.checkCollisions(world);
    
    // 检查玩家是否在地面上
    this.checkGround(world);
    
    // 限制玩家不会掉出世界
    if (this.position.y < -10) {
      this.position.y = 20;
      this.velocity.set(0, 0, 0);
    }
  }
  
  /**
   * 移动玩家
   */
  move(direction, deltaTime) {
    // 计算移动速度
    const moveSpeed = this.speed * deltaTime;
    
    // 应用移动
    this.velocity.x = direction.x * moveSpeed;
    this.velocity.z = direction.z * moveSpeed;
  }
  
  /**
   * 跳跃
   */
  jump() {
    if (this.onGround) {
      this.velocity.y = this.jumpStrength;
      this.onGround = false;
    }
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions(world) {
    // 简化的碰撞检测
    // 检查玩家周围的方块
    const playerX = Math.floor(this.position.x);
    const playerY = Math.floor(this.position.y);
    const playerZ = Math.floor(this.position.z);
    
    // 检查玩家脚下、头部和身体周围的方块
    for (let y = playerY - 1; y <= playerY + 2; y++) {
      for (let x = playerX - 1; x <= playerX + 1; x++) {
        for (let z = playerZ - 1; z <= playerZ + 1; z++) {
          const blockId = world.getBlock(x, y, z);
          const block = world.blockRegistry.getBlock(blockId);
          
          // 如果方块是固体的，检查碰撞
          if (block.solid !== false) {
            // 简单的AABB碰撞检测
            const blockMinX = x - 0.5;
            const blockMaxX = x + 0.5;
            const blockMinY = y - 0.5;
            const blockMaxY = y + 0.5;
            const blockMinZ = z - 0.5;
            const blockMaxZ = z + 0.5;
            
            const playerMinX = this.position.x - this.width / 2;
            const playerMaxX = this.position.x + this.width / 2;
            const playerMinY = this.position.y;
            const playerMaxY = this.position.y + this.height;
            const playerMinZ = this.position.z - this.width / 2;
            const playerMaxZ = this.position.z + this.width / 2;
            
            // 检查碰撞
            if (playerMaxX > blockMinX && playerMinX < blockMaxX &&
                playerMaxY > blockMinY && playerMinY < blockMaxY &&
                playerMaxZ > blockMinZ && playerMinZ < blockMaxZ) {
              
              // 确定碰撞方向
              const overlapX = Math.min(playerMaxX - blockMinX, blockMaxX - playerMinX);
              const overlapY = Math.min(playerMaxY - blockMinY, blockMaxY - playerMinY);
              const overlapZ = Math.min(playerMaxZ - blockMinZ, blockMaxZ - playerMinZ);
              
              // 选择最小重叠方向进行分离
              if (overlapX < overlapY && overlapX < overlapZ) {
                // X轴碰撞
                if (this.position.x > x) {
                  this.position.x = blockMaxX + this.width / 2;
                } else {
                  this.position.x = blockMinX - this.width / 2;
                }
                this.velocity.x = 0;
              } else if (overlapY < overlapX && overlapY < overlapZ) {
                // Y轴碰撞
                if (this.position.y > y) {
                  this.position.y = blockMaxY;
                  this.onGround = true;
                } else {
                  this.position.y = blockMinY - this.height;
                }
                this.velocity.y = 0;
              } else {
                // Z轴碰撞
                if (this.position.z > z) {
                  this.position.z = blockMaxZ + this.width / 2;
                } else {
                  this.position.z = blockMinZ - this.width / 2;
                }
                this.velocity.z = 0;
              }
            }
          }
        }
      }
    }
  }
  
  /**
   * 检查玩家是否在地面上
   */
  checkGround(world) {
    const playerX = Math.floor(this.position.x);
    const playerY = Math.floor(this.position.y - 0.1); // 稍微向下检查
    const playerZ = Math.floor(this.position.z);
    
    const blockId = world.getBlock(playerX, playerY, playerZ);
    const block = world.blockRegistry.getBlock(blockId);
    
    this.onGround = block.solid !== false;
    
    if (this.onGround) {
      this.velocity.y = 0;
    }
  }
  
  /**
   * 破坏方块
   */
  breakBlock(x, y, z, world) {
    const blockId = world.getBlock(x, y, z);
    
    // 如果是空气，不做任何操作
    if (blockId === 'air') return false;
    
    // 破坏方块
    return world.setBlock(x, y, z, 'air');
  }
  
  /**
   * 放置方块
   */
  placeBlock(x, y, z, world) {
    // 获取当前选中的物品
    const selectedItem = this.inventory[this.selectedSlot];
    
    // 如果没有选中物品或物品数量为0，不做任何操作
    if (!selectedItem || selectedItem.count <= 0) return false;
    
    // 检查目标位置是否已有方块
    if (world.getBlock(x, y, z) !== 'air') return false;
    
    // 放置方块
    const result = world.setBlock(x, y, z, selectedItem.id);
    
    // 如果放置成功，减少物品数量
    if (result) {
      selectedItem.count--;
      
      // 如果物品用完，从物品栏中移除
      if (selectedItem.count <= 0) {
        this.inventory[this.selectedSlot] = null;
      }
    }
    
    return result;
  }
  
  /**
   * 射线检测
   */
  raycast(origin, direction, maxDistance = 5, world) {
    // 简化的射线检测
    // 在实际游戏中，应该使用更高效的算法
    
    const step = 0.1; // 步长
    const maxSteps = maxDistance / step; // 最大步数
    
    let position = origin.clone();
    
    for (let i = 0; i < maxSteps; i++) {
      // 前进一步
      position.addScaledVector(direction, step);
      
      // 获取当前位置的方块
      const x = Math.floor(position.x);
      const y = Math.floor(position.y);
      const z = Math.floor(position.z);
      
      const blockId = world.getBlock(x, y, z);
      
      // 如果不是空气，返回碰撞信息
      if (blockId !== 'air') {
        // 计算碰撞法线
        const normal = new THREE.Vector3();
        
        // 简单地根据射线方向确定法线
        if (Math.abs(direction.x) > Math.abs(direction.y) && Math.abs(direction.x) > Math.abs(direction.z)) {
          normal.x = -Math.sign(direction.x);
        } else if (Math.abs(direction.y) > Math.abs(direction.x) && Math.abs(direction.y) > Math.abs(direction.z)) {
          normal.y = -Math.sign(direction.y);
        } else {
          normal.z = -Math.sign(direction.z);
        }
        
        return {
          position: new THREE.Vector3(x, y, z),
          normal: normal,
          distance: origin.distanceTo(position)
        };
      }
    }
    
    return null;
  }
  
  /**
   * 选择下一个物品
   */
  nextItem() {
    this.selectedSlot = (this.selectedSlot + 1) % this.inventory.length;
  }
  
  /**
   * 选择上一个物品
   */
  prevItem() {
    this.selectedSlot = (this.selectedSlot - 1 + this.inventory.length) % this.inventory.length;
  }
  
  /**
   * 受到伤害
   */
  damage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }
  
  /**
   * 恢复生命值
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
  
  /**
   * 消耗饥饿度
   */
  consumeHunger(amount) {
    this.hunger = Math.max(0, this.hunger - amount);
  }
  
  /**
   * 恢复饥饿度
   */
  feed(amount) {
    this.hunger = Math.min(this.maxHunger, this.hunger + amount);
  }
}
