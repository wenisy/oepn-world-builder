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
  },

  // 铁怪兽
  ironMonster: {
    create: createIronMonster,
    properties: {
      health: 800,
      buildTime: 50,
      requiredResources: {
        iron: 100,
        gold: 20,
        stone: 50
      },
      specialAbilities: [
        'intimidate', // 威吓效果
        'guardArea'   // 区域防卫
      ]
    }
  },

  // 铁堡垒
  ironFortress: {
    create: createIronFortress,
    properties: {
      health: 2000,
      buildTime: 120,
      requiredResources: {
        iron: 200,
        stone: 300,
        wood: 100
      },
      defenseBonus: 50, // 防御加成
      capacity: 20      // 可容纳人数
    }
  },

  // 赛马场
  racetrack: {
    create: createRacetrack,
    properties: {
      health: 300,
      buildTime: 60,
      requiredResources: {
        wood: 150,
        stone: 100
      },
      entertainmentValue: 100, // 娱乐值
      capacity: 50             // 观众容量
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
  // 创建玩家组
  const playerGroup = new THREE.Group();

  // 创建玩家身体
  const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3366cc });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.6;
  body.castShadow = true;
  playerGroup.add(body);

  // 创建玩家头部
  const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.55;
  head.castShadow = true;
  playerGroup.add(head);

  // 创建玩家狂眼睛 - 特殊的白色/银色眼睛设计
  const eyeGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.1);
  const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xaaaaaa }); // 白色发光眼睛

  // 左眼
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.2, 1.6, 0.35);
  playerGroup.add(leftEye);

  // 右眼
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.2, 1.6, 0.35);
  playerGroup.add(rightEye);

  // 创建玩家手臂
  const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
  const armMaterial = new THREE.MeshLambertMaterial({ color: 0x3366cc });

  // 左手臂
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.55, 0.7, 0);
  leftArm.castShadow = true;
  playerGroup.add(leftArm);

  // 右手臂
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.55, 0.7, 0);
  rightArm.castShadow = true;
  playerGroup.add(rightArm);

  // 创建玩家腿部
  const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

  // 左腿
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.25, -0.2, 0);
  leftLeg.castShadow = true;
  playerGroup.add(leftLeg);

  // 右腿
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.25, -0.2, 0);
  rightLeg.castShadow = true;
  playerGroup.add(rightLeg);

  // 设置位置、旋转和缩放
  playerGroup.position.set(position.x, position.y, position.z);
  playerGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  playerGroup.scale.set(scale.x, scale.y, scale.z);

  // 创建玩家对象
  const player = {
    object: playerGroup,
    position: playerGroup.position,
    rotation: playerGroup.rotation,
    scale: playerGroup.scale,
    velocity: { x: 0, y: 0, z: 0 },
    onGround: false,

    // 身体部件引用
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    leftEye,
    rightEye,

    // 更新函数
    update: function() {
      // 玩家特定的更新逻辑

      // 眼睛闪烁效果
      const time = Date.now() * 0.001;
      const glowIntensity = (Math.sin(time * 2) * 0.1) + 0.9;
      leftEye.material.emissiveIntensity = glowIntensity;
      rightEye.material.emissiveIntensity = glowIntensity;

      // 步行动画
      if (this.velocity.x !== 0 || this.velocity.z !== 0) {
        leftLeg.rotation.x = Math.sin(time * 5) * 0.5;
        rightLeg.rotation.x = Math.sin(time * 5 + Math.PI) * 0.5;
        leftArm.rotation.x = Math.sin(time * 5 + Math.PI) * 0.5;
        rightArm.rotation.x = Math.sin(time * 5) * 0.5;
      } else {
        // 重置无动状态
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
      }
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

/**
 * 创建铁怪兽
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 铁怪兽实体
 */
function createIronMonster(position, rotation, scale) {
  // 创建铁怪兽组
  const monsterGroup = new THREE.Group();

  // 创建基座
  const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 8);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.5
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.25;
  base.receiveShadow = true;
  monsterGroup.add(base);

  // 创建主体
  const bodyGeometry = new THREE.CylinderGeometry(1.5, 2, 3, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.9,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 2;
  body.castShadow = true;
  monsterGroup.add(body);

  // 创建头部
  const headGeometry = new THREE.SphereGeometry(1.2, 8, 8);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777,
    metalness: 0.9,
    roughness: 0.2
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 4;
  head.castShadow = true;
  monsterGroup.add(head);

  // 创建眼睛
  const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5
  });

  // 左眼
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.5, 4.2, 0.8);
  monsterGroup.add(leftEye);

  // 右眼
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.5, 4.2, 0.8);
  monsterGroup.add(rightEye);

  // 创建手臂
  const armGeometry = new THREE.CylinderGeometry(0.3, 0.2, 2.5, 6);
  const armMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.4
  });

  // 左手臂
  const leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-1.8, 2.5, 0);
  leftArm.rotation.z = Math.PI / 4;
  leftArm.castShadow = true;
  monsterGroup.add(leftArm);

  // 右手臂
  const rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(1.8, 2.5, 0);
  rightArm.rotation.z = -Math.PI / 4;
  rightArm.castShadow = true;
  monsterGroup.add(rightArm);

  // 创建爪子
  const clawGeometry = new THREE.ConeGeometry(0.4, 1, 4);
  const clawMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1
  });

  // 左爪
  const leftClaw = new THREE.Mesh(clawGeometry, clawMaterial);
  leftClaw.position.set(-2.8, 1.5, 0);
  leftClaw.rotation.z = -Math.PI / 2;
  leftClaw.castShadow = true;
  monsterGroup.add(leftClaw);

  // 右爪
  const rightClaw = new THREE.Mesh(clawGeometry, clawMaterial);
  rightClaw.position.set(2.8, 1.5, 0);
  rightClaw.rotation.z = Math.PI / 2;
  rightClaw.castShadow = true;
  monsterGroup.add(rightClaw);

  // 设置位置、旋转和缩放
  monsterGroup.position.set(position.x, position.y, position.z);
  monsterGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  monsterGroup.scale.set(scale.x, scale.y, scale.z);

  // 创建铁怪兽对象
  const monster = {
    object: monsterGroup,
    position: monsterGroup.position,
    rotation: monsterGroup.rotation,
    scale: monsterGroup.scale,

    // 引用重要部件
    head,
    leftEye,
    rightEye,
    leftArm,
    rightArm,
    leftClaw,
    rightClaw,

    // 更新函数
    update: function() {
      // 怪兽特定的更新逻辑
      const time = Date.now() * 0.001;

      // 眼睛闪烁
      const glowIntensity = (Math.sin(time * 2) * 0.3) + 0.7;
      leftEye.material.emissiveIntensity = glowIntensity;
      rightEye.material.emissiveIntensity = glowIntensity;

      // 头部缓慢旋转
      head.rotation.y = Math.sin(time * 0.5) * 0.2;

      // 手臂摇晃
      leftArm.rotation.x = Math.sin(time * 0.7) * 0.1;
      rightArm.rotation.x = Math.sin(time * 0.7 + Math.PI) * 0.1;
    }
  };

  return monster;
}

/**
 * 创建铁堡垒
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 铁堡垒实体
 */
function createIronFortress(position, rotation, scale) {
  // 创建堡垒组
  const fortressGroup = new THREE.Group();

  // 创建基座
  const baseGeometry = new THREE.BoxGeometry(10, 1, 10);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.6
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = 0.5;
  base.receiveShadow = true;
  fortressGroup.add(base);

  // 创建主墙
  const wallGeometry = new THREE.BoxGeometry(8, 4, 8);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
    roughness: 0.5
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.y = 3;
  wall.castShadow = true;
  wall.receiveShadow = true;
  fortressGroup.add(wall);

  // 创建四个角塔
  const towerGeometry = new THREE.CylinderGeometry(1, 1.2, 6, 8);
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.8,
    roughness: 0.4
  });

  // 位置数组
  const towerPositions = [
    { x: -4, y: 3, z: -4 },
    { x: 4, y: 3, z: -4 },
    { x: -4, y: 3, z: 4 },
    { x: 4, y: 3, z: 4 }
  ];

  // 创建四个角塔
  towerPositions.forEach(pos => {
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(pos.x, pos.y, pos.z);
    tower.castShadow = true;
    fortressGroup.add(tower);

    // 添加塔顶
    const towerTopGeometry = new THREE.ConeGeometry(1.2, 1.5, 8);
    const towerTopMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.9,
      roughness: 0.3
    });
    const towerTop = new THREE.Mesh(towerTopGeometry, towerTopMaterial);
    towerTop.position.set(pos.x, pos.y + 3.75, pos.z);
    towerTop.castShadow = true;
    fortressGroup.add(towerTop);
  });

  // 创建中央塔
  const centerTowerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
  const centerTower = new THREE.Mesh(centerTowerGeometry, towerMaterial);
  centerTower.position.set(0, 5, 0);
  centerTower.castShadow = true;
  fortressGroup.add(centerTower);

  // 添加中央塔顶
  const centerTowerTopGeometry = new THREE.ConeGeometry(1.7, 2, 8);
  const centerTowerTop = new THREE.Mesh(centerTowerTopGeometry, towerMaterial);
  centerTowerTop.position.set(0, 10, 0);
  centerTowerTop.castShadow = true;
  fortressGroup.add(centerTowerTop);

  // 创建门
  const doorGeometry = new THREE.BoxGeometry(2, 3, 0.5);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    metalness: 0.2,
    roughness: 0.8
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 1.5, 4.25);
  door.castShadow = true;
  fortressGroup.add(door);

  // 设置位置、旋转和缩放
  fortressGroup.position.set(position.x, position.y, position.z);
  fortressGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  fortressGroup.scale.set(scale.x, scale.y, scale.z);

  // 创建堡垒对象
  const fortress = {
    object: fortressGroup,
    position: fortressGroup.position,
    rotation: fortressGroup.rotation,
    scale: fortressGroup.scale,

    // 更新函数
    update: function() {
      // 堡垒特定的更新逻辑
      const time = Date.now() * 0.001;

      // 旗帜摇晃效果
      centerTowerTop.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  };

  return fortress;
}

/**
 * 创建赛马场
 * @param {Object} position - 位置
 * @param {Object} rotation - 旋转
 * @param {Object} scale - 缩放
 * @returns {Object} 赛马场实体
 */
function createRacetrack(position, rotation, scale) {
  // 创建赛马场组
  const racetrackGroup = new THREE.Group();

  // 创建赛道基座
  const baseGeometry = new THREE.RingGeometry(8, 12, 32);
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xA0522D });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.1;
  base.receiveShadow = true;
  racetrackGroup.add(base);

  // 创建赛道内圈
  const innerCircleGeometry = new THREE.CircleGeometry(8, 32);
  const innerCircleMaterial = new THREE.MeshLambertMaterial({ color: 0x7CFC00 });
  const innerCircle = new THREE.Mesh(innerCircleGeometry, innerCircleMaterial);
  innerCircle.rotation.x = -Math.PI / 2;
  innerCircle.position.y = 0.05;
  innerCircle.receiveShadow = true;
  racetrackGroup.add(innerCircle);

  // 创建看台
  const standGeometry = new THREE.BoxGeometry(6, 2, 3);
  const standMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
  const stand = new THREE.Mesh(standGeometry, standMaterial);
  stand.position.set(0, 1, -10);
  stand.castShadow = true;
  stand.receiveShadow = true;
  racetrackGroup.add(stand);

  // 创建看台屋顶
  const roofGeometry = new THREE.BoxGeometry(7, 0.5, 4);
  const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xA52A2A });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 2.75, -10);
  roof.castShadow = true;
  racetrackGroup.add(roof);

  // 创建栏杆
  const fenceGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
  const fenceMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

  // 添加围栏
  const fenceCount = 40;
  for (let i = 0; i < fenceCount; i++) {
    const angle = (i / fenceCount) * Math.PI * 2;
    const radius = 12.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
    fence.position.set(x, 0.5, z);
    fence.castShadow = true;
    racetrackGroup.add(fence);
  }

  // 创建起点线
  const startLineGeometry = new THREE.BoxGeometry(4, 0.1, 0.5);
  const startLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
  startLine.position.set(0, 0.15, 10);
  startLine.receiveShadow = true;
  racetrackGroup.add(startLine);

  // 设置位置、旋转和缩放
  racetrackGroup.position.set(position.x, position.y, position.z);
  racetrackGroup.rotation.set(rotation.x, rotation.y, rotation.z);
  racetrackGroup.scale.set(scale.x, scale.y, scale.z);

  // 创建赛马场对象
  const racetrack = {
    object: racetrackGroup,
    position: racetrackGroup.position,
    rotation: racetrackGroup.rotation,
    scale: racetrackGroup.scale,

    // 更新函数
    update: function() {
      // 赛马场特定的更新逻辑
    }
  };

  return racetrack;
}
