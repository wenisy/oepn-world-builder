/**
 * 物理系统 - 处理碰撞检测和物理模拟
 * @returns {Object} 物理系统对象
 */
export function initPhysics() {
  // 物理对象列表
  const physicsObjects = [];
  
  // 重力常量
  const GRAVITY = 9.8;
  
  // 上一帧的时间戳
  let lastTime = performance.now();
  
  /**
   * 创建物理对象
   * @param {Object} object - Three.js对象
   * @param {Object} options - 物理选项
   * @returns {Object} 物理对象
   */
  function createPhysicsObject(object, options = {}) {
    const physicsObject = {
      object,
      mass: options.mass || 1,
      velocity: options.velocity || { x: 0, y: 0, z: 0 },
      acceleration: options.acceleration || { x: 0, y: 0, z: 0 },
      isStatic: options.isStatic || false,
      collider: options.collider || {
        type: 'box',
        width: 1,
        height: 1,
        depth: 1
      },
      friction: options.friction || 0.1,
      restitution: options.restitution || 0.2
    };
    
    physicsObjects.push(physicsObject);
    return physicsObject;
  }
  
  /**
   * 移除物理对象
   * @param {Object} physicsObject - 要移除的物理对象
   */
  function removePhysicsObject(physicsObject) {
    const index = physicsObjects.indexOf(physicsObject);
    if (index !== -1) {
      physicsObjects.splice(index, 1);
    }
  }
  
  /**
   * 应用重力
   * @param {Object} physicsObject - 物理对象
   * @param {number} deltaTime - 时间增量（秒）
   */
  function applyGravity(physicsObject, deltaTime) {
    if (!physicsObject.isStatic) {
      physicsObject.acceleration.y -= GRAVITY;
    }
  }
  
  /**
   * 更新物理对象位置
   * @param {Object} physicsObject - 物理对象
   * @param {number} deltaTime - 时间增量（秒）
   */
  function updatePosition(physicsObject, deltaTime) {
    if (physicsObject.isStatic) return;
    
    // 更新速度
    physicsObject.velocity.x += physicsObject.acceleration.x * deltaTime;
    physicsObject.velocity.y += physicsObject.acceleration.y * deltaTime;
    physicsObject.velocity.z += physicsObject.acceleration.z * deltaTime;
    
    // 应用摩擦力
    physicsObject.velocity.x *= (1 - physicsObject.friction);
    physicsObject.velocity.z *= (1 - physicsObject.friction);
    
    // 更新位置
    physicsObject.object.position.x += physicsObject.velocity.x * deltaTime;
    physicsObject.object.position.y += physicsObject.velocity.y * deltaTime;
    physicsObject.object.position.z += physicsObject.velocity.z * deltaTime;
    
    // 重置加速度
    physicsObject.acceleration.x = 0;
    physicsObject.acceleration.y = 0;
    physicsObject.acceleration.z = 0;
  }
  
  /**
   * 检测两个物理对象之间的碰撞
   * @param {Object} obj1 - 第一个物理对象
   * @param {Object} obj2 - 第二个物理对象
   * @returns {Object|null} 碰撞信息或null（如果没有碰撞）
   */
  function checkCollision(obj1, obj2) {
    // 简单的AABB碰撞检测（后续可以扩展为更复杂的碰撞检测）
    if (obj1.collider.type === 'box' && obj2.collider.type === 'box') {
      const pos1 = obj1.object.position;
      const pos2 = obj2.object.position;
      
      const halfWidth1 = obj1.collider.width / 2;
      const halfHeight1 = obj1.collider.height / 2;
      const halfDepth1 = obj1.collider.depth / 2;
      
      const halfWidth2 = obj2.collider.width / 2;
      const halfHeight2 = obj2.collider.height / 2;
      const halfDepth2 = obj2.collider.depth / 2;
      
      // 检查X轴碰撞
      const collisionX = Math.abs(pos1.x - pos2.x) < (halfWidth1 + halfWidth2);
      
      // 检查Y轴碰撞
      const collisionY = Math.abs(pos1.y - pos2.y) < (halfHeight1 + halfHeight2);
      
      // 检查Z轴碰撞
      const collisionZ = Math.abs(pos1.z - pos2.z) < (halfDepth1 + halfDepth2);
      
      // 如果三个轴都有碰撞，则物体碰撞
      if (collisionX && collisionY && collisionZ) {
        // 计算碰撞法线（简化版本）
        const normal = {
          x: pos1.x - pos2.x,
          y: pos1.y - pos2.y,
          z: pos1.z - pos2.z
        };
        
        // 归一化法线
        const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        if (length > 0) {
          normal.x /= length;
          normal.y /= length;
          normal.z /= length;
        }
        
        return {
          obj1,
          obj2,
          normal
        };
      }
    }
    
    return null;
  }
  
  /**
   * 解决碰撞
   * @param {Object} collision - 碰撞信息
   */
  function resolveCollision(collision) {
    const { obj1, obj2, normal } = collision;
    
    // 如果两个物体都是静态的，不处理碰撞
    if (obj1.isStatic && obj2.isStatic) return;
    
    // 计算相对速度
    const relativeVelocity = {
      x: obj1.velocity.x - obj2.velocity.x,
      y: obj1.velocity.y - obj2.velocity.y,
      z: obj1.velocity.z - obj2.velocity.z
    };
    
    // 计算相对速度在法线方向上的分量
    const velocityAlongNormal = 
      relativeVelocity.x * normal.x + 
      relativeVelocity.y * normal.y + 
      relativeVelocity.z * normal.z;
    
    // 如果物体正在分离，不处理碰撞
    if (velocityAlongNormal > 0) return;
    
    // 计算反弹系数（取两个物体的平均值）
    const restitution = (obj1.restitution + obj2.restitution) / 2;
    
    // 计算冲量标量
    let j = -(1 + restitution) * velocityAlongNormal;
    
    // 考虑质量
    const invMass1 = obj1.isStatic ? 0 : 1 / obj1.mass;
    const invMass2 = obj2.isStatic ? 0 : 1 / obj2.mass;
    j /= invMass1 + invMass2;
    
    // 应用冲量
    const impulse = {
      x: j * normal.x,
      y: j * normal.y,
      z: j * normal.z
    };
    
    // 更新速度
    if (!obj1.isStatic) {
      obj1.velocity.x += impulse.x * invMass1;
      obj1.velocity.y += impulse.y * invMass1;
      obj1.velocity.z += impulse.z * invMass1;
    }
    
    if (!obj2.isStatic) {
      obj2.velocity.x -= impulse.x * invMass2;
      obj2.velocity.y -= impulse.y * invMass2;
      obj2.velocity.z -= impulse.z * invMass2;
    }
  }
  
  /**
   * 更新物理系统
   */
  function update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // 转换为秒
    lastTime = currentTime;
    
    // 限制deltaTime，防止物理不稳定
    const clampedDeltaTime = Math.min(deltaTime, 0.1);
    
    // 应用重力
    for (const obj of physicsObjects) {
      applyGravity(obj, clampedDeltaTime);
    }
    
    // 检测和解决碰撞
    for (let i = 0; i < physicsObjects.length; i++) {
      for (let j = i + 1; j < physicsObjects.length; j++) {
        const collision = checkCollision(physicsObjects[i], physicsObjects[j]);
        if (collision) {
          resolveCollision(collision);
        }
      }
    }
    
    // 更新位置
    for (const obj of physicsObjects) {
      updatePosition(obj, clampedDeltaTime);
    }
  }
  
  // 返回物理系统对象
  return {
    createPhysicsObject,
    removePhysicsObject,
    update
  };
}
