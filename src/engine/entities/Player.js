/**
 * 玩家类 - 处理玩家状态、输入和物理
 */
import * as THREE from 'three';
export class Player {
  constructor(camera, scene) {
    // 引用
    this.camera = camera;
    this.scene = scene;

    // 玩家状态
    this.position = new THREE.Vector3(0, 70, 0); // 起始位置
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.direction = new THREE.Vector3(0, 0, -1);

    // 物理属性
    this.speed = 5.0; // 移动速度（方块/秒）
    this.jumpStrength = 8.0; // 跳跃强度
    this.gravity = 20.0; // 重力加速度
    this.onGround = false;

    // 碰撞箱
    this.width = 0.6; // 玩家宽度
    this.height = 1.8; // 玩家高度
    this.eyeHeight = 1.6; // 眼睛高度

    // 游戏属性
    this.health = 20;
    this.maxHealth = 20;
    this.hunger = 20;
    this.maxHunger = 20;
    this.breath = 10;
    this.maxBreath = 10;
    this.isUnderwater = false;

    // 物品栏
    this.inventory = [];
    this.selectedSlot = 0;
    this.hotbarSize = 9;

    // 初始化物品栏
    for (let i = 0; i < this.hotbarSize; i++) {
      this.inventory.push(null);
    }

    // 输入状态
    this.input = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      sneak: false
    };

    // 鼠标状态
    this.mouse = {
      leftButton: false,
      rightButton: false,
      breakingBlock: false,
      breakProgress: 0,
      targetBlock: null
    };

    // 初始化相机
    this.updateCamera();
  }

  /**
   * 更新玩家
   * @param {number} deltaTime - 时间增量
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  update(deltaTime, chunkManager) {
    // 处理输入
    this.handleInput(deltaTime);

    // 应用重力
    this.velocity.y -= this.gravity * deltaTime;

    // 应用速度
    const oldPosition = this.position.clone();

    // 分别应用每个轴的速度，以便进行轴分离碰撞检测
    this.position.x += this.velocity.x * deltaTime;
    this.handleCollisionsX(chunkManager);

    this.position.y += this.velocity.y * deltaTime;
    this.handleCollisionsY(chunkManager);

    this.position.z += this.velocity.z * deltaTime;
    this.handleCollisionsZ(chunkManager);

    // 检查是否在地面上
    this.checkGround(chunkManager);

    // 检查是否在水中
    this.checkWater(chunkManager);

    // 处理方块破坏
    this.handleBlockBreaking(deltaTime, chunkManager);

    // 更新相机
    this.updateCamera();

    // 限制玩家不会掉出世界
    if (this.position.y < -10) {
      this.position.y = 70;
      this.velocity.set(0, 0, 0);
    }
  }

  /**
   * 处理输入
   * @param {number} deltaTime - 时间增量
   */
  handleInput(deltaTime) {
    // 计算移动方向
    const moveDirection = new THREE.Vector3(0, 0, 0);

    if (this.input.forward) moveDirection.z -= 1;
    if (this.input.backward) moveDirection.z += 1;
    if (this.input.left) moveDirection.x -= 1;
    if (this.input.right) moveDirection.x += 1;

    // 如果有移动输入
    if (moveDirection.length() > 0) {
      // 归一化方向向量
      moveDirection.normalize();

      // 根据相机方向调整移动方向
      moveDirection.applyEuler(new THREE.Euler(0, this.rotation.y, 0));

      // 计算移动速度
      let speed = this.speed;

      // 如果冲刺
      if (this.input.sprint && this.input.forward && !this.input.sneak) {
        speed *= 1.6;
      }

      // 如果潜行
      if (this.input.sneak) {
        speed *= 0.3;
      }

      // 如果在水中
      if (this.isUnderwater) {
        speed *= 0.5;
      }

      // 应用移动
      this.velocity.x = moveDirection.x * speed;
      this.velocity.z = moveDirection.z * speed;
    } else {
      // 如果没有移动输入，停止水平移动
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // 处理跳跃
    if (this.input.jump) {
      if (this.onGround) {
        this.velocity.y = this.jumpStrength;
        this.onGround = false;
      } else if (this.isUnderwater) {
        // 在水中可以向上游
        this.velocity.y = this.jumpStrength * 0.5;
      }
    }
  }

  /**
   * 处理X轴碰撞
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  handleCollisionsX(chunkManager) {
    // 计算碰撞箱
    const minX = this.position.x - this.width / 2;
    const maxX = this.position.x + this.width / 2;
    const minY = this.position.y;
    const maxY = this.position.y + this.height;
    const minZ = this.position.z - this.width / 2;
    const maxZ = this.position.z + this.width / 2;

    // 检查X轴碰撞
    for (let y = Math.floor(minY); y <= Math.floor(maxY); y++) {
      for (let z = Math.floor(minZ); z <= Math.floor(maxZ); z++) {
        // 检查正向X碰撞
        if (this.velocity.x > 0) {
          const blockX = Math.floor(maxX);
          const blockId = chunkManager.getVoxel(blockX, y, z);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.x = blockX - this.width / 2;
              this.velocity.x = 0;
              break;
            }
          }
        }

        // 检查负向X碰撞
        else if (this.velocity.x < 0) {
          const blockX = Math.floor(minX);
          const blockId = chunkManager.getVoxel(blockX, y, z);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.x = blockX + 1 + this.width / 2;
              this.velocity.x = 0;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 处理Y轴碰撞
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  handleCollisionsY(chunkManager) {
    // 计算碰撞箱
    const minX = this.position.x - this.width / 2;
    const maxX = this.position.x + this.width / 2;
    const minY = this.position.y;
    const maxY = this.position.y + this.height;
    const minZ = this.position.z - this.width / 2;
    const maxZ = this.position.z + this.width / 2;

    // 检查Y轴碰撞
    for (let x = Math.floor(minX); x <= Math.floor(maxX); x++) {
      for (let z = Math.floor(minZ); z <= Math.floor(maxZ); z++) {
        // 检查正向Y碰撞（头部）
        if (this.velocity.y > 0) {
          const blockY = Math.floor(maxY);
          const blockId = chunkManager.getVoxel(x, blockY, z);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.y = blockY - this.height;
              this.velocity.y = 0;
              break;
            }
          }
        }

        // 检查负向Y碰撞（脚部）
        else if (this.velocity.y < 0) {
          const blockY = Math.floor(minY);
          const blockId = chunkManager.getVoxel(x, blockY, z);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.y = blockY + 1;
              this.velocity.y = 0;
              this.onGround = true;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 处理Z轴碰撞
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  handleCollisionsZ(chunkManager) {
    // 计算碰撞箱
    const minX = this.position.x - this.width / 2;
    const maxX = this.position.x + this.width / 2;
    const minY = this.position.y;
    const maxY = this.position.y + this.height;
    const minZ = this.position.z - this.width / 2;
    const maxZ = this.position.z + this.width / 2;

    // 检查Z轴碰撞
    for (let x = Math.floor(minX); x <= Math.floor(maxX); x++) {
      for (let y = Math.floor(minY); y <= Math.floor(maxY); y++) {
        // 检查正向Z碰撞
        if (this.velocity.z > 0) {
          const blockZ = Math.floor(maxZ);
          const blockId = chunkManager.getVoxel(x, y, blockZ);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.z = blockZ - this.width / 2;
              this.velocity.z = 0;
              break;
            }
          }
        }

        // 检查负向Z碰撞
        else if (this.velocity.z < 0) {
          const blockZ = Math.floor(minZ);
          const blockId = chunkManager.getVoxel(x, y, blockZ);

          if (blockId !== 0) {
            const block = chunkManager.blockRegistry.getById(blockId);

            if (block && block.solid) {
              this.position.z = blockZ + 1 + this.width / 2;
              this.velocity.z = 0;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * 检查是否在地面上
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  checkGround(chunkManager) {
    // 如果已经确认在地面上，不需要再检查
    if (this.onGround) return;

    // 计算脚下的位置
    const x = Math.floor(this.position.x);
    const y = Math.floor(this.position.y - 0.1); // 稍微向下检查
    const z = Math.floor(this.position.z);

    // 获取脚下的方块
    const blockId = chunkManager.getVoxel(x, y, z);

    if (blockId !== 0) {
      const block = chunkManager.blockRegistry.getById(blockId);

      if (block && block.solid) {
        this.onGround = true;
        this.velocity.y = 0;
      }
    }
  }

  /**
   * 检查是否在水中
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  checkWater(chunkManager) {
    // 计算头部位置
    const x = Math.floor(this.position.x);
    const headY = Math.floor(this.position.y + this.eyeHeight);
    const z = Math.floor(this.position.z);

    // 获取头部位置的方块
    const blockId = chunkManager.getVoxel(x, headY, z);

    // 检查是否是水
    if (blockId === chunkManager.blockRegistry.getIdByName('water')) {
      this.isUnderwater = true;

      // 在水中，重力和速度受到影响
      this.velocity.y *= 0.8; // 减缓下落速度
    } else {
      this.isUnderwater = false;
    }
  }

  /**
   * 处理方块破坏
   * @param {number} deltaTime - 时间增量
   * @param {ChunkManager} chunkManager - 区块管理器
   */
  handleBlockBreaking(deltaTime, chunkManager) {
    // 如果正在按住左键
    if (this.mouse.leftButton) {
      // 如果没有目标方块或目标方块已经改变，重置进度
      if (!this.mouse.targetBlock) {
        // 执行射线检测
        const rayResult = this.raycast(chunkManager);

        if (rayResult) {
          this.mouse.targetBlock = rayResult.position;
          this.mouse.breakProgress = 0;
        }
      }

      // 如果有目标方块，增加破坏进度
      if (this.mouse.targetBlock) {
        const { x, y, z } = this.mouse.targetBlock;
        const blockId = chunkManager.getVoxel(x, y, z);

        if (blockId !== 0) {
          const block = chunkManager.blockRegistry.getById(blockId);

          // 计算破坏速度
          let breakSpeed = 1.0;

          // 根据方块硬度调整破坏速度
          if (block.hardness > 0) {
            breakSpeed = 1.0 / block.hardness;
          } else if (block.hardness < 0) {
            // 无法破坏的方块
            breakSpeed = 0;
          }

          // 增加破坏进度
          this.mouse.breakProgress += breakSpeed * deltaTime;

          // 如果进度达到1，破坏方块
          if (this.mouse.breakProgress >= 1) {
            // 破坏方块
            chunkManager.setVoxel(x, y, z, 0);

            // 添加掉落物到物品栏
            if (block.drops) {
              for (const dropId of block.drops) {
                this.addItemToInventory(dropId, 1);
              }
            }

            // 重置破坏状态
            this.mouse.targetBlock = null;
            this.mouse.breakProgress = 0;
          }
        }
      }
    } else {
      // 如果松开左键，重置破坏状态
      this.mouse.targetBlock = null;
      this.mouse.breakProgress = 0;
    }
  }

  /**
   * 放置方块
   * @param {ChunkManager} chunkManager - 区块管理器
   * @returns {boolean} 是否成功放置
   */
  placeBlock(chunkManager) {
    // 执行射线检测
    const rayResult = this.raycast(chunkManager);

    if (rayResult && rayResult.placePosition) {
      const { x, y, z } = rayResult.placePosition;

      // 检查是否与玩家碰撞
      if (this.wouldCollideWithPlayer(x, y, z)) {
        return false;
      }

      // 获取当前选中的物品
      const selectedItem = this.getSelectedItem();

      if (selectedItem && selectedItem.count > 0) {
        // 放置方块
        chunkManager.setVoxel(x, y, z, selectedItem.id);

        // 减少物品数量
        selectedItem.count--;

        // 如果物品用完，从物品栏中移除
        if (selectedItem.count <= 0) {
          this.inventory[this.selectedSlot] = null;
        }

        return true;
      }
    }

    return false;
  }

  /**
   * 检查方块是否会与玩家碰撞
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {boolean} 是否会碰撞
   */
  wouldCollideWithPlayer(x, y, z) {
    // 计算玩家碰撞箱
    const minX = this.position.x - this.width / 2;
    const maxX = this.position.x + this.width / 2;
    const minY = this.position.y;
    const maxY = this.position.y + this.height;
    const minZ = this.position.z - this.width / 2;
    const maxZ = this.position.z + this.width / 2;

    // 检查是否与方块碰撞
    return (
      x >= Math.floor(minX) && x <= Math.floor(maxX) &&
      y >= Math.floor(minY) && y <= Math.floor(maxY) &&
      z >= Math.floor(minZ) && z <= Math.floor(maxZ)
    );
  }

  /**
   * 射线检测
   * @param {ChunkManager} chunkManager - 区块管理器
   * @returns {Object|null} 碰撞信息
   */
  raycast(chunkManager) {
    // 计算射线起点和方向
    const origin = new THREE.Vector3(
      this.position.x,
      this.position.y + this.eyeHeight,
      this.position.z
    );

    const direction = new THREE.Vector3(0, 0, -1)
      .applyEuler(this.rotation)
      .normalize();

    // 执行射线检测
    return chunkManager.raycast(origin, direction, 5);
  }

  /**
   * 更新相机
   */
  updateCamera() {
    if (!this.camera) return;

    // 更新相机位置
    this.camera.position.set(
      this.position.x,
      this.position.y + this.eyeHeight,
      this.position.z
    );

    // 更新相机旋转
    this.camera.rotation.copy(this.rotation);
  }

  /**
   * 处理鼠标移动
   * @param {number} deltaX - X轴移动量
   * @param {number} deltaY - Y轴移动量
   */
  handleMouseMove(deltaX, deltaY) {
    // 鼠标灵敏度
    const sensitivity = 0.002;

    // 更新旋转
    this.rotation.y -= deltaX * sensitivity;
    this.rotation.x -= deltaY * sensitivity;

    // 限制俯仰角
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

    // 更新方向向量
    this.direction.set(0, 0, -1).applyEuler(this.rotation);
  }

  /**
   * 设置输入状态
   * @param {string} input - 输入名称
   * @param {boolean} state - 输入状态
   */
  setInput(input, state) {
    if (this.input.hasOwnProperty(input)) {
      this.input[input] = state;
    }
  }

  /**
   * 设置鼠标按钮状态
   * @param {string} button - 按钮名称
   * @param {boolean} state - 按钮状态
   */
  setMouseButton(button, state) {
    if (button === 'left') {
      this.mouse.leftButton = state;
    } else if (button === 'right') {
      this.mouse.rightButton = state;
    }
  }

  /**
   * 获取当前选中的物品
   * @returns {Object|null} 物品
   */
  getSelectedItem() {
    return this.inventory[this.selectedSlot];
  }

  /**
   * 添加物品到物品栏
   * @param {number} itemId - 物品ID
   * @param {number} count - 数量
   * @returns {boolean} 是否成功添加
   */
  addItemToInventory(itemId, count = 1) {
    // 先尝试堆叠到现有物品
    for (let i = 0; i < this.inventory.length; i++) {
      const item = this.inventory[i];

      if (item && item.id === itemId) {
        item.count += count;
        return true;
      }
    }

    // 如果没有找到相同物品，找一个空槽位
    for (let i = 0; i < this.inventory.length; i++) {
      if (!this.inventory[i]) {
        this.inventory[i] = { id: itemId, count };
        return true;
      }
    }

    // 物品栏已满
    return false;
  }

  /**
   * 选择下一个物品栏槽位
   */
  selectNextSlot() {
    this.selectedSlot = (this.selectedSlot + 1) % this.hotbarSize;
  }

  /**
   * 选择上一个物品栏槽位
   */
  selectPrevSlot() {
    this.selectedSlot = (this.selectedSlot - 1 + this.hotbarSize) % this.hotbarSize;
  }

  /**
   * 选择指定物品栏槽位
   * @param {number} slot - 槽位索引
   */
  selectSlot(slot) {
    if (slot >= 0 && slot < this.hotbarSize) {
      this.selectedSlot = slot;
    }
  }

  /**
   * 受到伤害
   * @param {number} amount - 伤害量
   * @returns {boolean} 是否死亡
   */
  damage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }

  /**
   * 恢复生命值
   * @param {number} amount - 恢复量
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * 消耗饥饿度
   * @param {number} amount - 消耗量
   */
  consumeHunger(amount) {
    this.hunger = Math.max(0, this.hunger - amount);
  }

  /**
   * 恢复饥饿度
   * @param {number} amount - 恢复量
   */
  feed(amount) {
    this.hunger = Math.min(this.maxHunger, this.hunger + amount);
  }
}
