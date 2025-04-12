import * as THREE from 'three';
import { createTerrain } from './terrain.js';
import { createEntity } from './entity.js';

/**
 * 初始化游戏世界
 * @param {THREE.Scene} scene - Three.js场景对象
 * @returns {Object} 世界系统对象
 */
export async function initWorld(scene) {
  // 世界参数
  const worldParams = {
    size: 1000, // 世界大小
    chunkSize: 16, // 区块大小
    maxHeight: 100, // 最大高度
    seed: Math.random() * 10000 // 随机种子
  };
  
  // 已加载的区块
  const loadedChunks = new Map();
  
  // 实体列表
  const entities = [];
  
  // 建筑列表
  const buildings = [];
  
  // 创建地形
  const terrain = await createTerrain(scene, worldParams);
  
  /**
   * 生成世界区块
   * @param {number} x - 区块X坐标
   * @param {number} z - 区块Z坐标
   */
  function generateChunk(x, z) {
    const chunkKey = `${x},${z}`;
    
    // 如果区块已经加载，不重复生成
    if (loadedChunks.has(chunkKey)) {
      return loadedChunks.get(chunkKey);
    }
    
    // 生成区块地形
    const chunk = terrain.generateChunk(x, z);
    
    // 随机添加一些树木和资源
    addNaturalFeatures(chunk, x, z);
    
    // 存储区块
    loadedChunks.set(chunkKey, chunk);
    
    return chunk;
  }
  
  /**
   * 在区块中添加自然特征（树木、岩石等）
   * @param {Object} chunk - 区块对象
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkZ - 区块Z坐标
   */
  function addNaturalFeatures(chunk, chunkX, chunkZ) {
    const chunkWorldX = chunkX * worldParams.chunkSize;
    const chunkWorldZ = chunkZ * worldParams.chunkSize;
    
    // 使用伪随机数生成器
    const random = seededRandom(worldParams.seed + chunkX * 10000 + chunkZ);
    
    // 添加树木
    const treeCount = Math.floor(random() * 5); // 0-4棵树
    for (let i = 0; i < treeCount; i++) {
      const x = chunkWorldX + random() * worldParams.chunkSize;
      const z = chunkWorldZ + random() * worldParams.chunkSize;
      const y = terrain.getHeightAt(x, z);
      
      // 创建树实体
      const tree = createEntity('tree', { x, y, z });
      if (tree) {
        scene.add(tree.object);
        entities.push(tree);
      }
    }
    
    // 添加岩石
    const rockCount = Math.floor(random() * 3); // 0-2块岩石
    for (let i = 0; i < rockCount; i++) {
      const x = chunkWorldX + random() * worldParams.chunkSize;
      const z = chunkWorldZ + random() * worldParams.chunkSize;
      const y = terrain.getHeightAt(x, z);
      
      // 创建岩石实体
      const rock = createEntity('rock', { x, y, z });
      if (rock) {
        scene.add(rock.object);
        entities.push(rock);
      }
    }
    
    // 添加资源（如矿物）
    if (random() < 0.3) { // 30%的几率生成资源
      const x = chunkWorldX + random() * worldParams.chunkSize;
      const z = chunkWorldZ + random() * worldParams.chunkSize;
      const y = terrain.getHeightAt(x, z);
      
      // 创建资源实体
      const resourceType = random() < 0.5 ? 'iron' : 'gold';
      const resource = createEntity(resourceType, { x, y, z });
      if (resource) {
        scene.add(resource.object);
        entities.push(resource);
      }
    }
  }
  
  /**
   * 创建一个基于种子的伪随机数生成器
   * @param {number} seed - 随机种子
   * @returns {Function} 随机数生成函数
   */
  function seededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  /**
   * 添加建筑
   * @param {string} type - 建筑类型
   * @param {Object} position - 位置
   * @param {Object} rotation - 旋转
   * @param {Object} scale - 缩放
   * @returns {Object} 建筑对象
   */
  function addBuilding(type, position, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }) {
    // 创建建筑实体
    const building = createEntity(type, position, rotation, scale);
    
    if (building) {
      scene.add(building.object);
      buildings.push(building);
      return building;
    }
    
    return null;
  }
  
  /**
   * 移除建筑
   * @param {Object} building - 要移除的建筑
   */
  function removeBuilding(building) {
    const index = buildings.indexOf(building);
    if (index !== -1) {
      scene.remove(building.object);
      buildings.splice(index, 1);
    }
  }
  
  /**
   * 获取指定位置的高度
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @returns {number} 高度值
   */
  function getHeightAt(x, z) {
    return terrain.getHeightAt(x, z);
  }
  
  /**
   * 更新世界
   * @param {Object} gameState - 游戏状态
   */
  function update(gameState) {
    // 获取玩家位置
    const playerPosition = gameState.player.position;
    
    // 计算玩家所在的区块坐标
    const chunkX = Math.floor(playerPosition.x / worldParams.chunkSize);
    const chunkZ = Math.floor(playerPosition.z / worldParams.chunkSize);
    
    // 加载玩家周围的区块（3x3区域）
    for (let x = chunkX - 1; x <= chunkX + 1; x++) {
      for (let z = chunkZ - 1; z <= chunkZ + 1; z++) {
        generateChunk(x, z);
      }
    }
    
    // 更新实体
    for (const entity of entities) {
      if (entity.update) {
        entity.update();
      }
    }
    
    // 更新建筑
    for (const building of buildings) {
      if (building.update) {
        building.update();
      }
    }
  }
  
  // 返回世界系统对象
  return {
    terrain,
    entities,
    buildings,
    generateChunk,
    addBuilding,
    removeBuilding,
    getHeightAt,
    update
  };
}
