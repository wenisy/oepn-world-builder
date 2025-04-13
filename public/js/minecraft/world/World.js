/**
 * 世界类 - 管理游戏世界和地形生成
 */
import { Chunk } from './Chunk.js';
import { Block } from './Block.js';
import { NoiseGenerator } from '../utils/NoiseGenerator.js';

export class World {
  constructor(blockRegistry, textureManager) {
    this.blockRegistry = blockRegistry;
    this.textureManager = textureManager;
    
    // 世界数据
    this.chunks = {};
    this.blocks = {};
    this.entities = [];
    
    // 世界设置
    this.worldSize = 32; // 世界大小（方块）
    this.chunkSize = 16; // 区块大小（方块）
    this.worldHeight = 128; // 世界高度（方块）
    this.seaLevel = 62; // 海平面高度
    
    // 噪声生成器
    this.noiseGenerator = new NoiseGenerator();
    
    // 世界网格（用于渲染）
    this.mesh = new THREE.Group();
  }
  
  /**
   * 生成世界
   */
  async generate() {
    // 生成地形
    await this.generateTerrain();
    
    // 生成树木
    this.generateTrees(5);
    
    return true;
  }
  
  /**
   * 生成地形
   */
  async generateTerrain() {
    return new Promise((resolve) => {
      // 简单的平坦地形
      const size = this.worldSize;
      const height = 10; // 基础高度
      
      // 创建地形网格
      for (let x = -size/2; x < size/2; x++) {
        for (let z = -size/2; z < size/2; z++) {
          // 使用柏林噪声生成高度
          const y = Math.floor(height + Math.sin(x/5) * Math.cos(z/5) * 2);
          
          // 放置草方块作为表面
          this.setBlock(x, y, z, 'grass');
          
          // 放置泥土作为表层下方
          for (let dy = 1; dy < 3; dy++) {
            this.setBlock(x, y-dy, z, 'dirt');
          }
          
          // 放置石头作为深层
          for (let dy = 3; dy < 10; dy++) {
            this.setBlock(x, y-dy, z, 'stone');
          }
        }
      }
      
      resolve();
    });
  }
  
  /**
   * 生成树木
   */
  generateTrees(count) {
    const size = this.worldSize;
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * size - size/2);
      const z = Math.floor(Math.random() * size - size/2);
      const y = this.getHighestBlock(x, z);
      
      if (y !== null) {
        this.generateTree(x, y + 1, z);
      }
    }
  }
  
  /**
   * 生成单棵树
   */
  generateTree(x, y, z) {
    // 树干
    const trunkHeight = 4 + Math.floor(Math.random() * 3);
    for (let dy = 0; dy < trunkHeight; dy++) {
      this.setBlock(x, y + dy, z, 'wood');
    }
    
    // 树叶
    const leafSize = 2;
    for (let dx = -leafSize; dx <= leafSize; dx++) {
      for (let dy = 0; dy <= leafSize; dy++) {
        for (let dz = -leafSize; dz <= leafSize; dz++) {
          // 跳过树干位置
          if (dx === 0 && dz === 0 && dy < leafSize) continue;
          
          // 创建球形树冠
          if (dx*dx + dy*dy + dz*dz <= leafSize*leafSize + 1) {
            this.setBlock(x + dx, y + trunkHeight + dy - 1, z + dz, 'leaves');
          }
        }
      }
    }
  }
  
  /**
   * 获取指定坐标最高的方块的y坐标
   */
  getHighestBlock(x, z) {
    let highestY = null;
    
    for (let y = this.worldHeight - 1; y >= 0; y--) {
      const blockId = this.getBlock(x, y, z);
      if (blockId !== 'air') {
        highestY = y;
        break;
      }
    }
    
    return highestY;
  }
  
  /**
   * 设置方块
   */
  setBlock(x, y, z, blockId) {
    const key = `${x},${y},${z}`;
    const oldBlockId = this.blocks[key];
    
    // 如果方块相同，不做任何操作
    if (oldBlockId === blockId) return false;
    
    // 更新方块数据
    this.blocks[key] = blockId;
    
    // 如果是空气方块，移除旧方块
    if (blockId === 'air') {
      this.removeBlockMesh(x, y, z);
      return true;
    }
    
    // 创建新方块
    const block = new Block(this.blockRegistry, this.textureManager, blockId, x, y, z);
    
    // 如果方块可见，添加到场景
    if (block.mesh) {
      // 移除旧方块（如果存在）
      this.removeBlockMesh(x, y, z);
      
      // 添加新方块
      this.mesh.add(block.mesh);
    }
    
    return true;
  }
  
  /**
   * 移除方块网格
   */
  removeBlockMesh(x, y, z) {
    const key = `${x},${y},${z}`;
    
    // 查找并移除方块网格
    this.mesh.children.forEach((child, index) => {
      if (child.userData && 
          child.userData.blockX === x && 
          child.userData.blockY === y && 
          child.userData.blockZ === z) {
        this.mesh.remove(child);
      }
    });
  }
  
  /**
   * 获取方块
   */
  getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.blocks[key] || 'air';
  }
  
  /**
   * 更新世界
   */
  update(deltaTime, player) {
    // 更新实体
    this.entities.forEach(entity => {
      entity.update(deltaTime, this);
    });
    
    // 更新区块（加载/卸载）
    this.updateChunks(player);
  }
  
  /**
   * 更新区块
   */
  updateChunks(player) {
    // 根据玩家位置加载/卸载区块
    // 这里简化处理，实际游戏中应该根据玩家位置动态加载区块
  }
}
