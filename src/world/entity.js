import * as THREE from 'three';

// 实体类型定义
const entityTypes = {
  // 玩家
  player: {
    create: createPlayer,
    properties: {
      speed: 5,
      jumpForce: 10,
      health: 100,
      stamina: 100
    }
  },
  
  // 树木
  tree: {
    create: createTree,
    properties: {
      health: 50,
      resources: {
        wood: 10
      }
    }
  },
  
  // 岩石
  rock: {
    create: createRock,
    properties: {
      health: 80,
      resources: {
        stone: 15
      }
    }
  },
  
  // 铁矿
  iron: {
    create: createResource,
    properties: {
      health: 100,
      resources: {
        iron: 20
      }
    }
  },
  
  // 金矿
  gold: {
    create: createResource,
    properties: {
      health: 120,
      resources: {
        gold: 10
      }
    }
  },
  
  // 基础建筑
  basicBuilding: {
    create: createBasicBuilding,
    properties: {
      health: 200,
      buildTime: 10,
      requiredResources: {
        wood: 20,
        stone: 10
      }
    }
  },
  
  // 高级建筑
  advancedBuilding: {
    create: createAdvancedBuilding,
    properties: {
      health: 500,
      buildTime: 30,
      requiredResources: {
        wood: 50,
        stone: 30,
        iron: 20
      }
    }
  }
};

/**
 * 创建实体
 * @param {string} type - 实体类型
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 实体对象
 */
export function createEntity(type, position, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }) {
  // 检查实体类型是否存在
  if (!entityTypes[type]) {
    console.error(`未知的实体类型: ${type}`);
    return null;
  }
  
  // 创建实体
  const entity = entityTypes[type].create(position, rotation, scale);
  
  // 添加通用属性
  entity.type = type;
  entity.properties = { ...entityTypes[type].properties };
  
  return entity;
}

/**
 * 创建玩家实体
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 玩家实体
 */
function createPlayer(position, rotation, scale) {
  // 创建玩家模型（临时使用简单几何体）
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  const mesh = new THREE.Mesh(geometry, material);
  
  // 设置位置、旋转和缩放
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  mesh.scale.set(scale.x, scale.y, scale.z);
  
  // 设置阴影
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // 创建玩家对象
  const player = {
    object: mesh,
    position: mesh.position,
    rotation: mesh.rotation,
    scale: mesh.scale,
    velocity: { x: 0, y: 0, z: 0 },
    onGround: false,
    
    // 更新函数
    update: function() {
      // 玩家特定的更新逻辑
    }
  };
  
  return player;
}

/**
 * 创建树实体
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 树实体
 */
function createTree(position, rotation, scale) {
  // 创建树干
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  
  // 创建树冠
  const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
  const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.y = 2;
  leaves.castShadow = true;
  
  // 创建树组
  const treeGroup = new THREE.Group();
  treeGroup.add(trunk);
  treeGroup.add(leaves);
  
  // 设置位置、旋转和缩放
  treeGroup.position.set(position.x, position.y, position.z);
  treeGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  treeGroup.scale.set(scale.x, scale.y, scale.z);
  
  // 随机旋转树，使其看起来更自然
  treeGroup.rotation.y = Math.random() * Math.PI * 2;
  
  // 创建树对象
  const tree = {
    object: treeGroup,
    position: treeGroup.position,
    rotation: treeGroup.rotation,
    scale: treeGroup.scale,
    
    // 更新函数
    update: function() {
      // 树特定的更新逻辑（如摇摆）
      const time = Date.now() * 0.001;
      const swayAmount = 0.01;
      leaves.rotation.x = Math.sin(time) * swayAmount;
      leaves.rotation.z = Math.cos(time * 0.7) * swayAmount;
    }
  };
  
  return tree;
}

/**
 * 创建岩石实体
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 岩石实体
 */
function createRock(position, rotation, scale) {
  // 创建岩石几何体
  const geometry = new THREE.DodecahedronGeometry(0.5, 0);
  const material = new THREE.MeshLambertMaterial({ color: 0x808080 });
  const mesh = new THREE.Mesh(geometry, material);
  
  // 设置位置、旋转和缩放
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  
  // 随机缩放和旋转，使岩石看起来更自然
  const randomScale = 0.8 + Math.random() * 0.4;
  mesh.scale.set(
    scale.x * randomScale * (0.8 + Math.random() * 0.4),
    scale.y * randomScale * (0.8 + Math.random() * 0.4),
    scale.z * randomScale * (0.8 + Math.random() * 0.4)
  );
  
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.rotation.z = Math.random() * Math.PI;
  
  // 设置阴影
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // 创建岩石对象
  const rock = {
    object: mesh,
    position: mesh.position,
    rotation: mesh.rotation,
    scale: mesh.scale,
    
    // 更新函数
    update: function() {
      // 岩石特定的更新逻辑（通常不需要）
    }
  };
  
  return rock;
}

/**
 * 创建资源实体（矿物）
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 资源实体
 */
function createResource(position, rotation, scale) {
  // 创建资源几何体
  const geometry = new THREE.OctahedronGeometry(0.5, 0);
  
  // 根据资源类型设置颜色
  let color;
  if (position.type === 'iron') {
    color = 0xA19D94; // 铁的颜色
  } else if (position.type === 'gold') {
    color = 0xFFD700; // 金的颜色
  } else {
    color = 0xA19D94; // 默认颜色
  }
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.8,
    roughness: 0.3
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  // 设置位置、旋转和缩放
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  mesh.scale.set(scale.x, scale.y, scale.z);
  
  // 随机旋转
  mesh.rotation.x = Math.random() * Math.PI;
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.rotation.z = Math.random() * Math.PI;
  
  // 设置阴影
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // 创建资源对象
  const resource = {
    object: mesh,
    position: mesh.position,
    rotation: mesh.rotation,
    scale: mesh.scale,
    
    // 更新函数
    update: function() {
      // 资源特定的更新逻辑（如闪烁）
      const time = Date.now() * 0.001;
      const intensity = (Math.sin(time * 2) * 0.1) + 0.9;
      mesh.material.emissiveIntensity = intensity;
    }
  };
  
  return resource;
}

/**
 * 创建基础建筑
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 建筑实体
 */
function createBasicBuilding(position, rotation, scale) {
  // 创建建筑组
  const buildingGroup = new THREE.Group();
  
  // 创建建筑基础
  const baseGeometry = new THREE.BoxGeometry(2, 0.2, 2);
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.1;
  base.receiveShadow = true;
  buildingGroup.add(base);
  
  // 创建建筑墙壁
  const wallGeometry = new THREE.BoxGeometry(1.8, 1, 1.8);
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xD2B48C });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.y = 0.7;
  wall.castShadow = true;
  wall.receiveShadow = true;
  buildingGroup.add(wall);
  
  // 创建建筑屋顶
  const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 1.7;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  buildingGroup.add(roof);
  
  // 设置位置、旋转和缩放
  buildingGroup.position.set(position.x, position.y, position.z);
  buildingGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  buildingGroup.scale.set(scale.x, scale.y, scale.z);
  
  // 创建建筑对象
  const building = {
    object: buildingGroup,
    position: buildingGroup.position,
    rotation: buildingGroup.rotation,
    scale: buildingGroup.scale,
    
    // 更新函数
    update: function() {
      // 建筑特定的更新逻辑
    }
  };
  
  return building;
}

/**
 * 创建高级建筑
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 建筑实体
 */
function createAdvancedBuilding(position, rotation, scale) {
  // 创建建筑组
  const buildingGroup = new THREE.Group();
  
  // 创建建筑基础
  const baseGeometry = new THREE.BoxGeometry(4, 0.2, 4);
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.1;
  base.receiveShadow = true;
  buildingGroup.add(base);
  
  // 创建建筑主体
  const mainGeometry = new THREE.BoxGeometry(3.5, 3, 3.5);
  const mainMaterial = new THREE.MeshLambertMaterial({ color: 0xA9A9A9 });
  const main = new THREE.Mesh(mainGeometry, mainMaterial);
  main.position.y = 1.7;
  main.castShadow = true;
  main.receiveShadow = true;
  buildingGroup.add(main);
  
  // 创建建筑塔楼
  const towerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
  const towerMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.set(1, 4.2, 1);
  tower.castShadow = true;
  buildingGroup.add(tower);
  
  // 创建建筑屋顶
  const roofGeometry = new THREE.BoxGeometry(3.8, 0.2, 3.8);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 3.3;
  roof.castShadow = true;
  buildingGroup.add(roof);
  
  // 设置位置、旋转和缩放
  buildingGroup.position.set(position.x, position.y, position.z);
  buildingGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  buildingGroup.scale.set(scale.x, scale.y, scale.z);
  
  // 创建建筑对象
  const building = {
    object: buildingGroup,
    position: buildingGroup.position,
    rotation: buildingGroup.rotation,
    scale: buildingGroup.scale,
    
    // 更新函数
    update: function() {
      // 建筑特定的更新逻辑
    }
  };
  
  return building;
}
