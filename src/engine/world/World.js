import { Chunk } from './Chunk.js';
import { NoiseGenerator } from '../utils/NoiseGenerator.js';

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
        console.log('World 构造函数被调用, 参数:', options);
        this.seed = options.seed || Math.floor(Math.random() * 2147483647);
        this.chunkSize = options.chunkSize || 16;
        this.worldHeight = options.worldHeight || 256;
        this.renderDistance = options.renderDistance || 8;

        // 保存方块注册表
        this.blockRegistry = options.blockRegistry;
        console.log('World 构造函数中设置 blockRegistry:', this.blockRegistry);

        // 初始化噪声生成器
        this.noiseGenerator = new NoiseGenerator(this.seed);

        // 区块映射表 (key: "x,z", value: Chunk)
        this.chunks = new Map();

        // 已加载的区块坐标集合
        this.loadedChunks = new Set();

        // 需要更新的区块列表
        this.chunksToUpdate = [];

        // 世界生成参数
        this.terrainParams = {
            scale: 0.01,           // 地形缩放
            amplitude: 32,         // 地形振幅
            octaves: 6,            // 噪声倍频数
            persistence: 0.5,      // 噪声持续度
            lacunarity: 2.0,       // 噪声空隙度
            heightOffset: 64,      // 高度偏移
            waterLevel: 60         // 水平面高度
        };
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
        const chunk = new Chunk(x, z, this.chunkSize, this.worldHeight, this.chunkSize);
        this.chunks.set(key, chunk);
        this.loadedChunks.add(key);

        // 生成区块地形
        this.generateChunkTerrain(chunk);

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
     * 生成区块地形
     * @param {Chunk} chunk - 区块实例
     */
    generateChunkTerrain(chunk) {
        if (chunk.isGenerated) {
            return;
        }

        const { x, z, width, height, depth } = chunk;
        const { scale, amplitude, octaves, persistence, lacunarity, heightOffset, waterLevel } = this.terrainParams;

        // 获取区块全局坐标
        const worldX = x * width;
        const worldZ = z * depth;

        // 生成地形高度图
        for (let localX = 0; localX < width; localX++) {
            for (let localZ = 0; localZ < depth; localZ++) {
                const globalX = worldX + localX;
                const globalZ = worldZ + localZ;

                // 使用分形噪声生成地形高度
                const noise = this.noiseGenerator.fractalPerlin2D(
                    globalX * scale,
                    globalZ * scale,
                    octaves,
                    persistence,
                    lacunarity
                );

                // 计算地形高度
                const terrainHeight = Math.floor((noise * 0.5 + 0.5) * amplitude + heightOffset);

                // 填充地形
                for (let y = 0; y < height; y++) {
                    let blockId = 0; // 默认为空气

                    if (y === 0) {
                        // 最底层为基岩
                        blockId = 11; // bedrock
                    } else if (y < terrainHeight - 4) {
                        // 深层为石头
                        blockId = 1; // stone

                        // 生成矿石
                        if (y < 64) {
                            const oreNoise = this.noiseGenerator.perlin3D(globalX * 0.1, y * 0.1, globalZ * 0.1);

                            if (oreNoise > 0.7) {
                                if (y < 16) {
                                    blockId = 15; // diamond_ore
                                } else if (y < 32) {
                                    blockId = 14; // gold_ore
                                } else if (y < 48) {
                                    blockId = 13; // iron_ore
                                } else {
                                    blockId = 12; // coal_ore
                                }
                            }
                        }
                    } else if (y < terrainHeight - 1) {
                        // 表层下为泥土
                        blockId = 2; // dirt
                    } else if (y === terrainHeight - 1) {
                        // 表层为草方块
                        blockId = 3; // grass

                        // 随机生成树
                        if (Math.random() < 0.01) {
                            // 在草方块上生成树干
                            for (let treeY = 0; treeY < 5; treeY++) {
                                if (y + 1 + treeY < height) {
                                    chunk.setBlock(localX, y + 1 + treeY, localZ, 4); // wood
                                }
                            }

                            // 生成树叶
                            for (let leafY = 0; leafY < 3; leafY++) {
                                for (let leafX = -2; leafX <= 2; leafX++) {
                                    for (let leafZ = -2; leafZ <= 2; leafZ++) {
                                        // 跳过树干位置
                                        if (leafX === 0 && leafZ === 0 && leafY < 2) {
                                            continue;
                                        }

                                        // 计算到树干中心的距离
                                        const distance = Math.sqrt(leafX * leafX + leafZ * leafZ);

                                        // 距离越远，生成叶子的概率越低
                                        if (distance <= 2 && Math.random() < (1 - distance * 0.3)) {
                                            const lx = localX + leafX;
                                            const ly = y + 4 + leafY;
                                            const lz = localZ + leafZ;

                                            if (lx >= 0 && lx < width && ly < height && lz >= 0 && lz < depth) {
                                                chunk.setBlock(lx, ly, lz, 5); // leaves
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if (y <= waterLevel && y < terrainHeight) {
                        // 水平面以下为水
                        blockId = 7; // water
                    }

                    // 设置方块
                    chunk.setBlock(localX, y, localZ, blockId);
                }
            }
        }

        chunk.isGenerated = true;
        chunk.needsUpdate = true;
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
     * 获取指定 ID 的方块
     * @param {number} id - 方块ID
     * @returns {Block|null} 方块实例或null
     */
    getBlockById(id) {
        console.log('调用 World.getBlockById', id, '当前 blockRegistry:', this.blockRegistry);
        if (!this.blockRegistry) {
            console.error('方块注册表未初始化');
            return null;
        }
        const block = this.blockRegistry.getBlockById(id);
        console.log('获取到的方块:', block);
        return block;
    }
}
