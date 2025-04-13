/**
 * 体素数据结构 - 用于高效存储和访问体素世界数据
 */
export class VoxelData {
  constructor() {
    // 使用Map存储区块数据，键为区块坐标字符串 "x,y,z"
    this.chunks = new Map();
    
    // 区块大小（方块数）
    this.chunkSize = 16;
    
    // 世界高度（方块数）
    this.worldHeight = 256;
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
   * 获取方块所在的区块坐标
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {Object} 区块坐标
   */
  getChunkCoords(x, y, z) {
    return {
      x: Math.floor(x / this.chunkSize),
      y: Math.floor(y / this.chunkSize),
      z: Math.floor(z / this.chunkSize)
    };
  }
  
  /**
   * 获取方块在区块内的局部坐标
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {Object} 局部坐标
   */
  getLocalCoords(x, y, z) {
    return {
      x: ((x % this.chunkSize) + this.chunkSize) % this.chunkSize,
      y: ((y % this.chunkSize) + this.chunkSize) % this.chunkSize,
      z: ((z % this.chunkSize) + this.chunkSize) % this.chunkSize
    };
  }
  
  /**
   * 创建新区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   * @returns {Uint16Array} 区块数据
   */
  createChunk(chunkX, chunkY, chunkZ) {
    const key = this.getChunkKey(chunkX, chunkY, chunkZ);
    
    // 使用类型化数组存储区块数据，每个方块用一个16位整数表示
    // 这样可以支持65536种不同的方块类型
    const chunkData = new Uint16Array(this.chunkSize * this.chunkSize * this.chunkSize);
    
    // 默认填充为空气方块（ID为0）
    chunkData.fill(0);
    
    // 存储区块
    this.chunks.set(key, chunkData);
    
    return chunkData;
  }
  
  /**
   * 获取区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   * @param {boolean} createIfMissing - 如果区块不存在，是否创建新区块
   * @returns {Uint16Array|null} 区块数据
   */
  getChunk(chunkX, chunkY, chunkZ, createIfMissing = false) {
    const key = this.getChunkKey(chunkX, chunkY, chunkZ);
    
    if (this.chunks.has(key)) {
      return this.chunks.get(key);
    } else if (createIfMissing) {
      return this.createChunk(chunkX, chunkY, chunkZ);
    }
    
    return null;
  }
  
  /**
   * 设置方块
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @param {number} blockId - 方块ID
   * @returns {boolean} 是否成功设置
   */
  setVoxel(x, y, z, blockId) {
    // 获取区块坐标
    const { x: chunkX, y: chunkY, z: chunkZ } = this.getChunkCoords(x, y, z);
    
    // 获取局部坐标
    const { x: localX, y: localY, z: localZ } = this.getLocalCoords(x, y, z);
    
    // 获取区块
    const chunk = this.getChunk(chunkX, chunkY, chunkZ, true);
    
    // 计算索引
    const index = localX + (localY * this.chunkSize) + (localZ * this.chunkSize * this.chunkSize);
    
    // 设置方块
    chunk[index] = blockId;
    
    return true;
  }
  
  /**
   * 获取方块
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {number} 方块ID，如果区块不存在则返回0（空气）
   */
  getVoxel(x, y, z) {
    // 获取区块坐标
    const { x: chunkX, y: chunkY, z: chunkZ } = this.getChunkCoords(x, y, z);
    
    // 获取局部坐标
    const { x: localX, y: localY, z: localZ } = this.getLocalCoords(x, y, z);
    
    // 获取区块
    const chunk = this.getChunk(chunkX, chunkY, chunkZ);
    
    // 如果区块不存在，返回空气
    if (!chunk) return 0;
    
    // 计算索引
    const index = localX + (localY * this.chunkSize) + (localZ * this.chunkSize * this.chunkSize);
    
    // 返回方块ID
    return chunk[index];
  }
  
  /**
   * 获取所有已加载的区块坐标
   * @returns {Array} 区块坐标数组
   */
  getLoadedChunks() {
    const chunks = [];
    
    for (const key of this.chunks.keys()) {
      const [x, y, z] = key.split(',').map(Number);
      chunks.push({ x, y, z });
    }
    
    return chunks;
  }
  
  /**
   * 卸载区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   * @returns {boolean} 是否成功卸载
   */
  unloadChunk(chunkX, chunkY, chunkZ) {
    const key = this.getChunkKey(chunkX, chunkY, chunkZ);
    
    if (this.chunks.has(key)) {
      this.chunks.delete(key);
      return true;
    }
    
    return false;
  }
  
  /**
   * 序列化区块数据（用于保存）
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   * @returns {Object|null} 序列化的区块数据
   */
  serializeChunk(chunkX, chunkY, chunkZ) {
    const chunk = this.getChunk(chunkX, chunkY, chunkZ);
    
    if (!chunk) return null;
    
    // 使用运行长度编码压缩数据
    const compressed = [];
    let currentValue = chunk[0];
    let count = 1;
    
    for (let i = 1; i < chunk.length; i++) {
      if (chunk[i] === currentValue) {
        count++;
      } else {
        compressed.push([currentValue, count]);
        currentValue = chunk[i];
        count = 1;
      }
    }
    
    compressed.push([currentValue, count]);
    
    return {
      x: chunkX,
      y: chunkY,
      z: chunkZ,
      data: compressed
    };
  }
  
  /**
   * 反序列化区块数据（用于加载）
   * @param {Object} data - 序列化的区块数据
   * @returns {boolean} 是否成功加载
   */
  deserializeChunk(data) {
    const { x, y, z, data: compressed } = data;
    
    // 创建新区块
    const chunk = this.createChunk(x, y, z);
    
    // 解压数据
    let index = 0;
    for (const [value, count] of compressed) {
      for (let i = 0; i < count; i++) {
        chunk[index++] = value;
      }
    }
    
    return true;
  }
}
