/**
 * 区块管理器 - 负责区块的加载、卸载和渲染
 */
import { VoxelData } from './VoxelData.js';
import { ChunkMesher } from '../rendering/ChunkMesher.js';

export class ChunkManager {
  constructor(scene, blockRegistry, textureManager) {
    this.scene = scene;
    this.blockRegistry = blockRegistry;
    this.textureManager = textureManager;
    
    // 体素数据
    this.voxelData = new VoxelData();
    
    // 区块网格
    this.chunkMeshes = new Map();
    
    // 区块网格生成器
    this.mesher = new ChunkMesher(blockRegistry, textureManager);
    
    // 区块加载距离（区块数）
    this.loadDistance = 5;
    
    // 区块渲染距离（区块数）
    this.renderDistance = 5;
    
    // 待更新的区块
    this.dirtyChunks = new Set();
  }
  
  /**
   * 更新区块
   * @param {Object} playerPosition - 玩家位置
   */
  update(playerPosition) {
    // 计算玩家所在的区块坐标
    const chunkSize = this.voxelData.chunkSize;
    const playerChunkX = Math.floor(playerPosition.x / chunkSize);
    const playerChunkY = Math.floor(playerPosition.y / chunkSize);
    const playerChunkZ = Math.floor(playerPosition.z / chunkSize);
    
    // 加载玩家周围的区块
    this.loadChunksAroundPlayer(playerChunkX, playerChunkY, playerChunkZ);
    
    // 卸载远离玩家的区块
    this.unloadDistantChunks(playerChunkX, playerChunkY, playerChunkZ);
    
    // 更新脏区块
    this.updateDirtyChunks();
  }
  
  /**
   * 加载玩家周围的区块
   * @param {number} playerChunkX - 玩家所在区块X坐标
   * @param {number} playerChunkY - 玩家所在区块Y坐标
   * @param {number} playerChunkZ - 玩家所在区块Z坐标
   */
  loadChunksAroundPlayer(playerChunkX, playerChunkY, playerChunkZ) {
    // 计算加载范围
    const minX = playerChunkX - this.loadDistance;
    const maxX = playerChunkX + this.loadDistance;
    const minY = Math.max(0, playerChunkY - this.loadDistance);
    const maxY = Math.min(Math.floor(this.voxelData.worldHeight / this.voxelData.chunkSize), playerChunkY + this.loadDistance);
    const minZ = playerChunkZ - this.loadDistance;
    const maxZ = playerChunkZ + this.loadDistance;
    
    // 加载范围内的区块
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          // 计算到玩家的距离
          const distance = Math.sqrt(
            Math.pow(x - playerChunkX, 2) +
            Math.pow(y - playerChunkY, 2) +
            Math.pow(z - playerChunkZ, 2)
          );
          
          // 如果在加载距离内且区块不存在，生成区块
          if (distance <= this.loadDistance) {
            const chunkKey = this.voxelData.getChunkKey(x, y, z);
            
            // 检查区块是否已加载
            if (!this.voxelData.getChunk(x, y, z)) {
              // 生成区块
              this.generateChunk(x, y, z);
              
              // 标记为脏区块
              this.dirtyChunks.add(chunkKey);
            }
          }
        }
      }
    }
  }
  
  /**
   * 卸载远离玩家的区块
   * @param {number} playerChunkX - 玩家所在区块X坐标
   * @param {number} playerChunkY - 玩家所在区块Y坐标
   * @param {number} playerChunkZ - 玩家所在区块Z坐标
   */
  unloadDistantChunks(playerChunkX, playerChunkY, playerChunkZ) {
    // 获取所有已加载的区块
    const loadedChunks = this.voxelData.getLoadedChunks();
    
    // 检查每个区块是否需要卸载
    for (const chunk of loadedChunks) {
      // 计算到玩家的距离
      const distance = Math.sqrt(
        Math.pow(chunk.x - playerChunkX, 2) +
        Math.pow(chunk.y - playerChunkY, 2) +
        Math.pow(chunk.z - playerChunkZ, 2)
      );
      
      // 如果超出加载距离，卸载区块
      if (distance > this.loadDistance) {
        this.unloadChunk(chunk.x, chunk.y, chunk.z);
      }
    }
  }
  
  /**
   * 更新脏区块
   */
  updateDirtyChunks() {
    // 处理每个脏区块
    for (const chunkKey of this.dirtyChunks) {
      // 解析区块坐标
      const [x, y, z] = chunkKey.split(',').map(Number);
      
      // 重新生成区块网格
      this.updateChunkMesh(x, y, z);
    }
    
    // 清空脏区块列表
    this.dirtyChunks.clear();
  }
  
  /**
   * 生成区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   */
  generateChunk(chunkX, chunkY, chunkZ) {
    // 创建区块数据
    const chunk = this.voxelData.createChunk(chunkX, chunkY, chunkZ);
    
    // 计算区块在世界中的位置
    const chunkSize = this.voxelData.chunkSize;
    const worldX = chunkX * chunkSize;
    const worldY = chunkY * chunkSize;
    const worldZ = chunkZ * chunkSize;
    
    // 生成地形
    for (let localX = 0; localX < chunkSize; localX++) {
      for (let localZ = 0; localZ < chunkSize; localZ++) {
        // 计算世界坐标
        const x = worldX + localX;
        const z = worldZ + localZ;
        
        // 生成高度
        const height = this.generateHeight(x, z);
        
        // 填充方块
        for (let localY = 0; localY < chunkSize; localY++) {
          const y = worldY + localY;
          
          // 如果超出区块范围，跳过
          if (y < 0 || y >= this.voxelData.worldHeight) continue;
          
          // 确定方块类型
          let blockId = 0; // 默认为空气
          
          if (y < height - 4) {
            // 深层为石头
            blockId = this.blockRegistry.getIdByName('stone');
          } else if (y < height - 1) {
            // 表层下方为泥土
            blockId = this.blockRegistry.getIdByName('dirt');
          } else if (y < height) {
            // 表层为草方块
            blockId = this.blockRegistry.getIdByName('grass');
          }
          
          // 设置方块
          if (blockId > 0) {
            const index = localX + (localY * chunkSize) + (localZ * chunkSize * chunkSize);
            chunk[index] = blockId;
          }
        }
      }
    }
    
    return chunk;
  }
  
  /**
   * 生成高度
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @returns {number} 高度
   */
  generateHeight(x, z) {
    // 简单的高度生成
    // 在实际游戏中，应该使用更复杂的噪声函数
    const baseHeight = 64;
    const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
    return Math.floor(baseHeight + noise);
  }
  
  /**
   * 更新区块网格
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   */
  updateChunkMesh(chunkX, chunkY, chunkZ) {
    const chunkKey = this.voxelData.getChunkKey(chunkX, chunkY, chunkZ);
    
    // 获取区块数据
    const chunk = this.voxelData.getChunk(chunkX, chunkY, chunkZ);
    
    // 如果区块不存在，移除网格
    if (!chunk) {
      this.removeChunkMesh(chunkX, chunkY, chunkZ);
      return;
    }
    
    // 移除旧网格
    this.removeChunkMesh(chunkX, chunkY, chunkZ);
    
    // 生成新网格
    const mesh = this.mesher.createMesh(this.voxelData, chunkX, chunkY, chunkZ);
    
    // 如果网格为空（全是空气），不添加到场景
    if (!mesh) return;
    
    // 设置网格位置
    const chunkSize = this.voxelData.chunkSize;
    mesh.position.set(
      chunkX * chunkSize,
      chunkY * chunkSize,
      chunkZ * chunkSize
    );
    
    // 添加到场景
    this.scene.add(mesh);
    
    // 存储网格引用
    this.chunkMeshes.set(chunkKey, mesh);
  }
  
  /**
   * 移除区块网格
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   */
  removeChunkMesh(chunkX, chunkY, chunkZ) {
    const chunkKey = this.voxelData.getChunkKey(chunkX, chunkY, chunkZ);
    
    // 获取网格
    const mesh = this.chunkMeshes.get(chunkKey);
    
    // 如果网格存在，从场景中移除
    if (mesh) {
      this.scene.remove(mesh);
      
      // 释放资源
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose());
      } else if (mesh.material) {
        mesh.material.dispose();
      }
      
      // 从映射表中移除
      this.chunkMeshes.delete(chunkKey);
    }
  }
  
  /**
   * 卸载区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   */
  unloadChunk(chunkX, chunkY, chunkZ) {
    // 移除网格
    this.removeChunkMesh(chunkX, chunkY, chunkZ);
    
    // 卸载区块数据
    this.voxelData.unloadChunk(chunkX, chunkY, chunkZ);
  }
  
  /**
   * 设置方块
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @param {number} blockId - 方块ID
   */
  setVoxel(x, y, z, blockId) {
    // 设置方块
    this.voxelData.setVoxel(x, y, z, blockId);
    
    // 获取区块坐标
    const { x: chunkX, y: chunkY, z: chunkZ } = this.voxelData.getChunkCoords(x, y, z);
    
    // 标记区块为脏
    const chunkKey = this.voxelData.getChunkKey(chunkX, chunkY, chunkZ);
    this.dirtyChunks.add(chunkKey);
    
    // 如果修改的方块在区块边界，还需要标记相邻区块为脏
    const { x: localX, y: localY, z: localZ } = this.voxelData.getLocalCoords(x, y, z);
    const chunkSize = this.voxelData.chunkSize;
    
    if (localX === 0) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX - 1, chunkY, chunkZ));
    } else if (localX === chunkSize - 1) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX + 1, chunkY, chunkZ));
    }
    
    if (localY === 0) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX, chunkY - 1, chunkZ));
    } else if (localY === chunkSize - 1) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX, chunkY + 1, chunkZ));
    }
    
    if (localZ === 0) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX, chunkY, chunkZ - 1));
    } else if (localZ === chunkSize - 1) {
      this.dirtyChunks.add(this.voxelData.getChunkKey(chunkX, chunkY, chunkZ + 1));
    }
  }
  
  /**
   * 获取方块
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {number} 方块ID
   */
  getVoxel(x, y, z) {
    return this.voxelData.getVoxel(x, y, z);
  }
  
  /**
   * 射线检测
   * @param {THREE.Vector3} origin - 射线起点
   * @param {THREE.Vector3} direction - 射线方向
   * @param {number} maxDistance - 最大距离
   * @returns {Object|null} 碰撞信息
   */
  raycast(origin, direction, maxDistance = 10) {
    // 射线步进算法
    const step = 0.1; // 步长
    const steps = Math.floor(maxDistance / step); // 步数
    
    let position = origin.clone();
    
    for (let i = 0; i < steps; i++) {
      // 前进一步
      position.addScaledVector(direction, step);
      
      // 获取当前位置的方块
      const x = Math.floor(position.x);
      const y = Math.floor(position.y);
      const z = Math.floor(position.z);
      
      // 获取方块ID
      const blockId = this.getVoxel(x, y, z);
      
      // 如果不是空气，返回碰撞信息
      if (blockId !== 0) {
        // 获取方块数据
        const block = this.blockRegistry.getById(blockId);
        
        // 如果方块不可选择，继续
        if (!block.selectable) continue;
        
        // 计算碰撞点
        const hitPosition = position.clone();
        
        // 计算碰撞法线
        const normal = new THREE.Vector3();
        
        // 确定碰撞面
        const dx = position.x - x - 0.5;
        const dy = position.y - y - 0.5;
        const dz = position.z - z - 0.5;
        
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const absDz = Math.abs(dz);
        
        if (absDx > absDy && absDx > absDz) {
          normal.x = dx > 0 ? 1 : -1;
        } else if (absDy > absDx && absDy > absDz) {
          normal.y = dy > 0 ? 1 : -1;
        } else {
          normal.z = dz > 0 ? 1 : -1;
        }
        
        // 计算放置位置
        const placePosition = {
          x: x + (normal.x > 0 ? 1 : (normal.x < 0 ? -1 : 0)),
          y: y + (normal.y > 0 ? 1 : (normal.y < 0 ? -1 : 0)),
          z: z + (normal.z > 0 ? 1 : (normal.z < 0 ? -1 : 0))
        };
        
        return {
          position: { x, y, z },
          hitPosition,
          normal,
          placePosition,
          blockId,
          block,
          distance: i * step
        };
      }
    }
    
    return null;
  }
}
