/**
 * 世界类
 * 管理所有区块和世界生成
 */
import { Chunk } from './Chunk.js';
import { TerrainGenerator } from '../generation/TerrainGenerator.js';
import * as THREE from 'three';

export class World {
  /**
   * 创建一个新的世界
   * @param {Scene} scene - Three.js场景
   * @param {BlockRegistry} blockRegistry - 方块注册表
   * @param {TextureManager} textureManager - 纹理管理器
   */
  constructor(scene, blockRegistry, textureManager) {
    this.scene = scene;
    this.blockRegistry = blockRegistry;
    this.textureManager = textureManager;
    
    // 存储所有区块的哈希表
    this.chunks = new Map();
    
    // 区块大小
    this.chunkSize = 16;
    
    // 渲染距离（以区块为单位）
    this.renderDistance = 8;
    
    // 地形生成器
    this.terrainGenerator = new TerrainGenerator(this);
    
    // 当前加载的区块中心
    this.loadCenter = { x: 0, y: 0, z: 0 };
  }
  
  /**
   * 获取区块键
   * @param {number} x - 区块X坐标
   * @param {number} y - 区块Y坐标
   * @param {number} z - 区块Z坐标
   * @returns {string} 区块键
   */
  getChunkKey(x, y, z) {
    return `${x},${y},${z}`;
  }
  
  /**
   * 获取指定位置的区块
   * @param {number} x - 区块X坐标
   * @param {number} y - 区块Y坐标
   * @param {number} z - 区块Z坐标
   * @returns {Chunk} 区块对象，如果不存在则返回null
   */
  getChunk(x, y, z) {
    const key = this.getChunkKey(x, y, z);
    return this.chunks.get(key) || null;
  }
  
  /**
   * 创建新区块
   * @param {number} x - 区块X坐标
   * @param {number} y - 区块Y坐标
   * @param {number} z - 区块Z坐标
   * @returns {Chunk} 新创建的区块
   */
  createChunk(x, y, z) {
    const key = this.getChunkKey(x, y, z);
    
    // 如果区块已存在，直接返回
    if (this.chunks.has(key)) {
      return this.chunks.get(key);
    }
    
    // 创建新区块
    const chunk = new Chunk(x, y, z, this.chunkSize);
    this.chunks.set(key, chunk);
    
    // 更新相邻区块的引用
    this.updateNeighborReferences(chunk);
    
    // 生成地形
    this.terrainGenerator.generateChunk(chunk);
    
    return chunk;
  }
  
  /**
   * 更新区块的相邻引用
   * @param {Chunk} chunk - 要更新的区块
   */
  updateNeighborReferences(chunk) {
    const { x, y, z } = chunk;
    
    // 检查六个方向的相邻区块
    chunk.neighbors.px = this.getChunk(x + 1, y, z);
    chunk.neighbors.nx = this.getChunk(x - 1, y, z);
    chunk.neighbors.py = this.getChunk(x, y + 1, z);
    chunk.neighbors.ny = this.getChunk(x, y - 1, z);
    chunk.neighbors.pz = this.getChunk(x, y, z + 1);
    chunk.neighbors.nz = this.getChunk(x, y, z - 1);
    
    // 同时更新相邻区块的引用
    if (chunk.neighbors.px) chunk.neighbors.px.neighbors.nx = chunk;
    if (chunk.neighbors.nx) chunk.neighbors.nx.neighbors.px = chunk;
    if (chunk.neighbors.py) chunk.neighbors.py.neighbors.ny = chunk;
    if (chunk.neighbors.ny) chunk.neighbors.ny.neighbors.py = chunk;
    if (chunk.neighbors.pz) chunk.neighbors.pz.neighbors.nz = chunk;
    if (chunk.neighbors.nz) chunk.neighbors.nz.neighbors.pz = chunk;
  }
  
  /**
   * 获取世界坐标对应的区块坐标
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   * @param {number} worldZ - 世界Z坐标
   * @returns {Object} 区块坐标 {x, y, z}
   */
  getChunkCoordinates(worldX, worldY, worldZ) {
    return {
      x: Math.floor(worldX / this.chunkSize),
      y: Math.floor(worldY / this.chunkSize),
      z: Math.floor(worldZ / this.chunkSize)
    };
  }
  
  /**
   * 获取世界坐标对应的区块内坐标
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   * @param {number} worldZ - 世界Z坐标
   * @returns {Object} 区块内坐标 {x, y, z}
   */
  getLocalCoordinates(worldX, worldY, worldZ) {
    return {
      x: ((worldX % this.chunkSize) + this.chunkSize) % this.chunkSize,
      y: ((worldY % this.chunkSize) + this.chunkSize) % this.chunkSize,
      z: ((worldZ % this.chunkSize) + this.chunkSize) % this.chunkSize
    };
  }
  
  /**
   * 获取世界坐标处的体素
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   * @param {number} worldZ - 世界Z坐标
   * @returns {Voxel} 体素对象，如果区块不存在则返回空气
   */
  getVoxel(worldX, worldY, worldZ) {
    const { x, y, z } = this.getChunkCoordinates(worldX, worldY, worldZ);
    const chunk = this.getChunk(x, y, z);
    
    if (!chunk) {
      return null;
    }
    
    const local = this.getLocalCoordinates(worldX, worldY, worldZ);
    return chunk.getVoxel(local.x, local.y, local.z);
  }
  
  /**
   * 设置世界坐标处的体素
   * @param {number} worldX - 世界X坐标
   * @param {number} worldY - 世界Y坐标
   * @param {number} worldZ - 世界Z坐标
   * @param {number} type - 体素类型
   * @param {Object} properties - 体素属性
   * @returns {boolean} 是否成功设置
   */
  setVoxel(worldX, worldY, worldZ, type, properties = {}) {
    const { x, y, z } = this.getChunkCoordinates(worldX, worldY, worldZ);
    let chunk = this.getChunk(x, y, z);
    
    // 如果区块不存在，创建新区块
    if (!chunk) {
      chunk = this.createChunk(x, y, z);
    }
    
    const local = this.getLocalCoordinates(worldX, worldY, worldZ);
    return chunk.setVoxel(local.x, local.y, local.z, type, properties);
  }
  
  /**
   * 更新世界
   * @param {Vector3} playerPosition - 玩家位置
   */
  update(playerPosition) {
    // 计算玩家所在的区块坐标
    const chunkX = Math.floor(playerPosition.x / this.chunkSize);
    const chunkY = Math.floor(playerPosition.y / this.chunkSize);
    const chunkZ = Math.floor(playerPosition.z / this.chunkSize);
    
    // 如果玩家移动到新的区块，更新加载中心
    if (chunkX !== this.loadCenter.x || 
        chunkY !== this.loadCenter.y || 
        chunkZ !== this.loadCenter.z) {
      this.loadCenter = { x: chunkX, y: chunkY, z: chunkZ };
      this.updateLoadedChunks();
    }
    
    // 更新所有已加载区块的网格
    this.updateChunkMeshes();
  }
  
  /**
   * 更新已加载的区块
   */
  updateLoadedChunks() {
    // 记录当前应该加载的区块
    const chunksToLoad = new Set();
    
    // 计算应该加载的区块范围
    for (let x = this.loadCenter.x - this.renderDistance; x <= this.loadCenter.x + this.renderDistance; x++) {
      for (let z = this.loadCenter.z - this.renderDistance; z <= this.loadCenter.z + this.renderDistance; z++) {
        // 计算到加载中心的距离
        const distance = Math.sqrt(
          Math.pow(x - this.loadCenter.x, 2) + 
          Math.pow(z - this.loadCenter.z, 2)
        );
        
        // 如果在渲染距离内，添加到加载列表
        if (distance <= this.renderDistance) {
          // 垂直方向加载范围较小
          for (let y = this.loadCenter.y - 4; y <= this.loadCenter.y + 4; y++) {
            const key = this.getChunkKey(x, y, z);
            chunksToLoad.add(key);
            
            // 如果区块不存在，创建新区块
            if (!this.chunks.has(key)) {
              this.createChunk(x, y, z);
            }
          }
        }
      }
    }
    
    // 卸载不在范围内的区块
    for (const [key, chunk] of this.chunks.entries()) {
      if (!chunksToLoad.has(key)) {
        // 从场景中移除区块网格
        if (chunk.mesh) {
          this.scene.remove(chunk.mesh);
        }
        
        // 释放资源
        chunk.dispose();
        
        // 从哈希表中移除
        this.chunks.delete(key);
      }
    }
  }
  
  /**
   * 更新区块网格
   */
  updateChunkMeshes() {
    for (const chunk of this.chunks.values()) {
      // 如果区块被修改或没有网格，重新生成网格
      if (chunk.modified || !chunk.mesh) {
        const mesh = chunk.generateMesh(this.blockRegistry, this.textureManager);
        
        // 如果网格是新创建的，添加到场景
        if (!chunk.mesh) {
          this.scene.add(mesh);
        }
      }
    }
  }
  
  /**
   * 射线检测，用于选择方块
   * @param {Vector3} origin - 射线起点
   * @param {Vector3} direction - 射线方向
   * @param {number} maxDistance - 最大检测距离
   * @returns {Object} 检测结果 {position, normal, voxel}
   */
  raycast(origin, direction, maxDistance = 10) {
    // 射线步进算法
    const step = 0.1; // 步长
    const maxSteps = Math.ceil(maxDistance / step);
    
    const ray = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
    
    for (let i = 0; i < maxSteps; i++) {
      const distance = i * step;
      
      // 计算当前点
      const x = origin.x + ray.x * distance;
      const y = origin.y + ray.y * distance;
      const z = origin.z + ray.z * distance;
      
      // 获取当前点的体素
      const voxel = this.getVoxel(Math.floor(x), Math.floor(y), Math.floor(z));
      
      // 如果找到实体方块，计算碰撞点和法线
      if (voxel && voxel.isSolid()) {
        // 回退一步找到碰撞面
        const prevX = origin.x + ray.x * (distance - step);
        const prevY = origin.y + ray.y * (distance - step);
        const prevZ = origin.z + ray.z * (distance - step);
        
        // 计算法线
        const nx = Math.floor(prevX) - Math.floor(x);
        const ny = Math.floor(prevY) - Math.floor(y);
        const nz = Math.floor(prevZ) - Math.floor(z);
        
        return {
          position: { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) },
          normal: { x: nx, y: ny, z: nz },
          voxel: voxel
        };
      }
    }
    
    // 没有碰撞
    return null;
  }
  
  /**
   * 清除世界
   */
  clear() {
    // 从场景中移除所有区块网格
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) {
        this.scene.remove(chunk.mesh);
      }
      chunk.dispose();
    }
    
    // 清空哈希表
    this.chunks.clear();
  }
}
