/**
 * 地形生成器
 * 使用噪声函数生成地形
 */
import { SimplexNoise } from '../utils/SimplexNoise.js';

export class TerrainGenerator {
  /**
   * 创建一个新的地形生成器
   * @param {World} world - 世界对象
   */
  constructor(world) {
    this.world = world;
    
    // 创建噪声生成器
    this.noise = new SimplexNoise();
    
    // 地形参数
    this.seaLevel = 64;
    this.mountainHeight = 32;
    this.terrainScale = 0.01;
    this.detailScale = 0.05;
    
    // 生物群系参数
    this.biomeScale = 0.005;
    
    // 结构参数
    this.treeChance = 0.02; // 每个表面方块生成树的概率
    this.caveChance = 0.4; // 地下生成洞穴的概率
  }
  
  /**
   * 生成区块地形
   * @param {Chunk} chunk - 要生成的区块
   */
  generateChunk(chunk) {
    const { x: chunkX, y: chunkY, z: chunkZ } = chunk;
    const chunkSize = chunk.size;
    
    // 计算区块在世界中的绝对坐标
    const worldX = chunkX * chunkSize;
    const worldY = chunkY * chunkSize;
    const worldZ = chunkZ * chunkSize;
    
    // 遍历区块中的所有体素
    for (let y = 0; y < chunkSize; y++) {
      for (let z = 0; z < chunkSize; z++) {
        for (let x = 0; x < chunkSize; x++) {
          // 计算世界坐标
          const wx = worldX + x;
          const wy = worldY + y;
          const wz = worldZ + z;
          
          // 生成地形
          const blockType = this.getBlockType(wx, wy, wz);
          
          // 设置方块
          if (blockType !== 0) { // 0 是空气
            chunk.setVoxel(x, y, z, blockType);
          }
        }
      }
    }
    
    // 生成结构（树木、洞穴等）
    this.generateStructures(chunk);
  }
  
  /**
   * 获取指定位置的方块类型
   * @param {number} x - 世界X坐标
   * @param {number} y - 世界Y坐标
   * @param {number} z - 世界Z坐标
   * @returns {number} 方块类型ID
   */
  getBlockType(x, y, z) {
    // 获取地形高度
    const height = this.getTerrainHeight(x, z);
    
    // 获取生物群系
    const biome = this.getBiome(x, z);
    
    // 基岩层
    if (y === 0) {
      return this.world.blockRegistry.getIdByName('bedrock');
    }
    
    // 地下
    if (y < height) {
      // 生成洞穴
      if (this.isCave(x, y, z)) {
        return 0; // 空气
      }
      
      // 深层石头
      if (y < height - 20) {
        // 生成矿石
        const ore = this.getOreType(x, y, z);
        if (ore !== 0) {
          return ore;
        }
        return this.world.blockRegistry.getIdByName('stone');
      }
      
      // 浅层石头和泥土
      if (y < height - 4) {
        return this.world.blockRegistry.getIdByName('stone');
      } else {
        return this.world.blockRegistry.getIdByName('dirt');
      }
    }
    
    // 地表
    if (y === height) {
      // 根据生物群系选择表面方块
      switch (biome) {
        case 'desert':
          return this.world.blockRegistry.getIdByName('sand');
        case 'forest':
        case 'plains':
          return this.world.blockRegistry.getIdByName('grass');
        case 'mountains':
          if (y > this.seaLevel + 12) {
            return this.world.blockRegistry.getIdByName('stone');
          }
          return this.world.blockRegistry.getIdByName('grass');
        default:
          return this.world.blockRegistry.getIdByName('grass');
      }
    }
    
    // 水
    if (y < this.seaLevel) {
      return this.world.blockRegistry.getIdByName('water');
    }
    
    // 空气
    return 0;
  }
  
  /**
   * 获取地形高度
   * @param {number} x - 世界X坐标
   * @param {number} z - 世界Z坐标
   * @returns {number} 地形高度
   */
  getTerrainHeight(x, z) {
    // 基础高度
    const baseHeight = this.seaLevel;
    
    // 大尺度地形
    const largeScale = this.noise.noise2D(x * this.terrainScale * 0.5, z * this.terrainScale * 0.5);
    
    // 中尺度地形
    const mediumScale = this.noise.noise2D(x * this.terrainScale, z * this.terrainScale) * 0.5;
    
    // 小尺度地形
    const smallScale = this.noise.noise2D(x * this.terrainScale * 2, z * this.terrainScale * 2) * 0.25;
    
    // 组合噪声
    const combinedNoise = (largeScale + mediumScale + smallScale) / 1.75;
    
    // 计算最终高度
    return Math.floor(baseHeight + combinedNoise * this.mountainHeight);
  }
  
  /**
   * 获取生物群系
   * @param {number} x - 世界X坐标
   * @param {number} z - 世界Z坐标
   * @returns {string} 生物群系名称
   */
  getBiome(x, z) {
    // 使用噪声函数确定生物群系
    const temperature = this.noise.noise2D(x * this.biomeScale, z * this.biomeScale);
    const humidity = this.noise.noise2D(x * this.biomeScale + 100, z * this.biomeScale + 100);
    
    // 根据温度和湿度确定生物群系
    if (temperature > 0.5) {
      if (humidity > 0.3) {
        return 'forest';
      } else {
        return 'desert';
      }
    } else {
      if (humidity > 0.5) {
        return 'swamp';
      } else if (temperature < -0.3) {
        return 'mountains';
      } else {
        return 'plains';
      }
    }
  }
  
  /**
   * 检查是否为洞穴
   * @param {number} x - 世界X坐标
   * @param {number} y - 世界Y坐标
   * @param {number} z - 世界Z坐标
   * @returns {boolean} 如果是洞穴则返回true
   */
  isCave(x, y, z) {
    // 使用3D噪声函数生成洞穴
    const caveNoise = this.noise.noise3D(
      x * 0.05,
      y * 0.05,
      z * 0.05
    );
    
    // 只在地下深处生成洞穴
    if (y > this.seaLevel - 5) {
      return false;
    }
    
    // 噪声值大于阈值的地方是洞穴
    return caveNoise > this.caveChance;
  }
  
  /**
   * 获取矿石类型
   * @param {number} x - 世界X坐标
   * @param {number} y - 世界Y坐标
   * @param {number} z - 世界Z坐标
   * @returns {number} 矿石方块ID，如果不是矿石则返回0
   */
  getOreType(x, y, z) {
    // 使用3D噪声函数生成矿石
    const oreNoise = Math.abs(this.noise.noise3D(
      x * 0.1,
      y * 0.1,
      z * 0.1
    ));
    
    // 根据深度和噪声值确定矿石类型
    if (oreNoise > 0.95) {
      if (y < 16) {
        return this.world.blockRegistry.getIdByName('diamond_ore');
      }
    } else if (oreNoise > 0.9) {
      if (y < 32) {
        return this.world.blockRegistry.getIdByName('gold_ore');
      }
    } else if (oreNoise > 0.8) {
      if (y < 48) {
        return this.world.blockRegistry.getIdByName('iron_ore');
      }
    } else if (oreNoise > 0.7) {
      if (y < 64) {
        return this.world.blockRegistry.getIdByName('coal_ore');
      }
    }
    
    return 0; // 不是矿石
  }
  
  /**
   * 生成结构
   * @param {Chunk} chunk - 要生成结构的区块
   */
  generateStructures(chunk) {
    const { x: chunkX, y: chunkY, z: chunkZ } = chunk;
    const chunkSize = chunk.size;
    
    // 计算区块在世界中的绝对坐标
    const worldX = chunkX * chunkSize;
    const worldY = chunkY * chunkSize;
    const worldZ = chunkZ * chunkSize;
    
    // 只在地表区块生成树木
    if (worldY <= this.seaLevel && worldY + chunkSize > this.seaLevel) {
      // 遍历区块表面
      for (let z = 0; z < chunkSize; z++) {
        for (let x = 0; x < chunkSize; x++) {
          // 计算世界坐标
          const wx = worldX + x;
          const wz = worldZ + z;
          
          // 获取地形高度
          const height = this.getTerrainHeight(wx, wz);
          
          // 如果高度在区块范围内，并且是草方块，尝试生成树
          if (height >= worldY && height < worldY + chunkSize) {
            const localY = height - worldY;
            const blockType = chunk.getVoxel(x, localY, z).getType();
            
            // 检查是否是草方块
            if (blockType === this.world.blockRegistry.getIdByName('grass')) {
              // 随机决定是否生成树
              if (Math.random() < this.treeChance) {
                this.generateTree(chunk, x, localY, z);
              }
            }
          }
        }
      }
    }
  }
  
  /**
   * 生成树
   * @param {Chunk} chunk - 要生成树的区块
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   */
  generateTree(chunk, x, y, z) {
    // 获取方块ID
    const logId = this.world.blockRegistry.getIdByName('oak_log');
    const leavesId = this.world.blockRegistry.getIdByName('oak_leaves');
    
    // 树干高度
    const trunkHeight = 4 + Math.floor(Math.random() * 3);
    
    // 生成树干
    for (let i = 1; i <= trunkHeight; i++) {
      chunk.setVoxel(x, y + i, z, logId);
    }
    
    // 生成树叶
    const leafRadius = 2;
    const leafHeight = 2;
    const leafStartY = y + trunkHeight - 1;
    
    for (let ly = 0; ly <= leafHeight; ly++) {
      const radius = ly === leafHeight ? 1 : leafRadius;
      
      for (let lx = -radius; lx <= radius; lx++) {
        for (let lz = -radius; lz <= radius; lz++) {
          // 跳过树干位置
          if (lx === 0 && lz === 0 && ly < leafHeight) {
            continue;
          }
          
          // 计算到中心的距离
          const distance = Math.sqrt(lx * lx + lz * lz);
          
          // 如果在半径内，生成树叶
          if (distance <= radius + 0.5) {
            chunk.setVoxel(x + lx, leafStartY + ly, z + lz, leavesId);
          }
        }
      }
    }
  }
}
