import { Chunk } from './Chunk.js';
import { WorldGenerator } from './WorldGenerator.js';

/**
 * 世界类
 * 管理游戏世界，包括区块加载、生成和更新
 */
export class World {
    /**
     * 创建一个新的游戏世界
     * @param {Object} options - 世界选项
     * @param {number} options.seed - 世界种子
     * @param {number} options.chunkSize - 区块大小
     * @param {number} options.worldHeight - 世界高度
     * @param {number} options.renderDistance - 渲染距离（区块数）
     * @param {BlockRegistry} options.blockRegistry - 方块注册表
     */
    constructor(options = {}) {
        this.seed = options.seed || Math.floor(Math.random() * 2147483647);
        this.chunkSize = options.chunkSize || 16;
        this.worldHeight = options.worldHeight || 256;
        this.renderDistance = options.renderDistance || 8;
        this.blockRegistry = options.blockRegistry;
        
        // 初始化世界生成器
        this.generator = new WorldGenerator(this.seed);
        
        // 区块映射表 (key: "x,z", value: Chunk)
        this.chunks = new Map();
        
        // 已加载的区块坐标集合
        this.loadedChunks = new Set();
        
        // 需要更新的区块列表
        this.chunksToUpdate = [];
    }
    
    /**
     * 获取指定全局坐标的方块ID
     * @param {number} x - 全局X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 全局Z坐标
     * @returns {number} 方块ID
     */
    getBlock(x, y, z) {
        if (y < 0 || y >= this.worldHeight) {
            return 0; // 超出高度范围返回空气
        }
        
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        
        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk) {
            return 0;
        }
        
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        return chunk.getBlock(localX, y, localZ);
    }
    
    /**
     * 设置指定全局坐标的方块
     * @param {number} x - 全局X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 全局Z坐标
     * @param {number} blockId - 方块ID
     * @returns {boolean} 是否设置成功
     */
    setBlock(x, y, z, blockId) {
        if (y < 0 || y >= this.worldHeight) {
            return false;
        }
        
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        
        const chunk = this.getChunk(chunkX, chunkZ);
        if (!chunk) {
            return false;
        }
        
        const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        const success = chunk.setBlock(localX, y, localZ, blockId);
        
        // 如果修改了区块边界的方块，相邻区块也需要更新
        if (success) {
            if (localX === 0) {
                const adjacentChunk = this.getChunk(chunkX - 1, chunkZ);
                if (adjacentChunk) {
                    adjacentChunk.needsUpdate = true;
                    this.addChunkToUpdateList(adjacentChunk);
                }
            } else if (localX === this.chunkSize - 1) {
                const adjacentChunk = this.getChunk(chunkX + 1, chunkZ);
                if (adjacentChunk) {
                    adjacentChunk.needsUpdate = true;
                    this.addChunkToUpdateList(adjacentChunk);
                }
            }
            
            if (localZ === 0) {
                const adjacentChunk = this.getChunk(chunkX, chunkZ - 1);
                if (adjacentChunk) {
                    adjacentChunk.needsUpdate = true;
                    this.addChunkToUpdateList(adjacentChunk);
                }
            } else if (localZ === this.chunkSize - 1) {
                const adjacentChunk = this.getChunk(chunkX, chunkZ + 1);
                if (adjacentChunk) {
                    adjacentChunk.needsUpdate = true;
                    this.addChunkToUpdateList(adjacentChunk);
                }
            }
            
            this.addChunkToUpdateList(chunk);
        }
        
        return success;
    }
    
    /**
     * 获取指定坐标的区块
     * @param {number} x - 区块X坐标
     * @param {number} z - 区块Z坐标
     * @returns {Chunk|null} 区块实例或null
     */
    getChunk(x, z) {
        const key = `${x},${z}`;
        return this.chunks.get(key) || null;
    }
    
    /**
     * 加载或创建指定坐标的区块
     * @param {number} x - 区块X坐标
     * @param {number} z - 区块Z坐标
     * @returns {Chunk} 区块实例
     */
    loadChunk(x, z) {
        const key = `${x},${z}`;
        
        // 检查区块是否已加载
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }
        
        // 创建新区块
        const chunk = new Chunk(x, z, this.chunkSize, this.worldHeight);
        this.chunks.set(key, chunk);
        this.loadedChunks.add(key);
        
        // 生成区块地形
        this.generator.generateChunkTerrain(chunk);
        
        // 添加到更新列表
        this.addChunkToUpdateList(chunk);
        
        return chunk;
    }
    
    /**
     * 卸载指定坐标的区块
     * @param {number} x - 区块X坐标
     * @param {number} z - 区块Z坐标
     */
    unloadChunk(x, z) {
        const key = `${x},${z}`;
        const chunk = this.chunks.get(key);
        
        if (chunk) {
            // 清除区块网格
            chunk.dispose();
            
            // 从映射表和加载列表中移除
            this.chunks.delete(key);
            this.loadedChunks.delete(key);
        }
    }
    
    /**
     * 将区块添加到更新列表
     * @param {Chunk} chunk - 区块实例
     */
    addChunkToUpdateList(chunk) {
        if (!this.chunksToUpdate.includes(chunk)) {
            this.chunksToUpdate.push(chunk);
        }
    }
    
    /**
     * 更新玩家周围的区块
     * @param {number} playerX - 玩家X坐标
     * @param {number} playerZ - 玩家Z坐标
     */
    updateChunksAroundPlayer(playerX, playerZ) {
        const centerChunkX = Math.floor(playerX / this.chunkSize);
        const centerChunkZ = Math.floor(playerZ / this.chunkSize);
        
        // 计算需要加载的区块范围
        const minChunkX = centerChunkX - this.renderDistance;
        const maxChunkX = centerChunkX + this.renderDistance;
        const minChunkZ = centerChunkZ - this.renderDistance;
        const maxChunkZ = centerChunkZ + this.renderDistance;
        
        // 记录当前应该加载的区块坐标
        const chunksToKeep = new Set();
        
        // 加载范围内的区块
        for (let x = minChunkX; x <= maxChunkX; x++) {
            for (let z = minChunkZ; z <= maxChunkZ; z++) {
                const key = `${x},${z}`;
                chunksToKeep.add(key);
                
                // 如果区块未加载，则加载它
                if (!this.loadedChunks.has(key)) {
                    this.loadChunk(x, z);
                }
            }
        }
        
        // 卸载范围外的区块
        for (const key of this.loadedChunks) {
            if (!chunksToKeep.has(key)) {
                const [x, z] = key.split(',').map(Number);
                this.unloadChunk(x, z);
            }
        }
    }
    
    /**
     * 获取需要更新的区块列表
     * @returns {Array<Chunk>} 需要更新的区块列表
     */
    getChunksToUpdate() {
        return this.chunksToUpdate;
    }
    
    /**
     * 清空更新列表
     */
    clearUpdateList() {
        this.chunksToUpdate = [];
    }
    
    /**
     * 获取指定ID的方块
     * @param {number} id - 方块ID
     * @returns {Block|null} 方块实例或null
     */
    getBlockById(id) {
        if (!this.blockRegistry) {
            console.error('方块注册表未初始化');
            return null;
        }
        return this.blockRegistry.getBlockById(id);
    }
}
