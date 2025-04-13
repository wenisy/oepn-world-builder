import { NoiseGenerator } from './NoiseGenerator.js';

/**
 * 世界生成器类
 * 负责生成地形和结构
 */
export class WorldGenerator {
    /**
     * 创建一个新的世界生成器
     * @param {number} seed - 世界种子
     */
    constructor(seed = Math.random() * 2147483647) {
        this.seed = seed;
        this.noiseGenerator = new NoiseGenerator(seed);
        
        // 地形参数
        this.terrainParams = {
            scale: 0.01,           // 地形缩放
            amplitude: 32,         // 地形振幅
            octaves: 6,            // 噪声倍频数
            persistence: 0.5,      // 噪声持续度
            lacunarity: 2.0,       // 噪声空隙度
            heightOffset: 64,      // 高度偏移
            waterLevel: 60         // 水平面高度
        };
        
        // 生物群系参数
        this.biomeParams = {
            scale: 0.005,          // 生物群系缩放
            octaves: 2,            // 噪声倍频数
            persistence: 0.5,      // 噪声持续度
            lacunarity: 2.0        // 噪声空隙度
        };
        
        // 洞穴参数
        this.caveParams = {
            scale: 0.03,           // 洞穴缩放
            threshold: 0.7,        // 洞穴阈值
            octaves: 3,            // 噪声倍频数
            persistence: 0.5,      // 噪声持续度
            lacunarity: 2.0        // 噪声空隙度
        };
    }
    
    /**
     * 生成区块地形
     * @param {Chunk} chunk - 区块实例
     */
    generateChunkTerrain(chunk) {
        const { x, z, size, height } = chunk;
        const { scale, amplitude, octaves, persistence, lacunarity, heightOffset, waterLevel } = this.terrainParams;
        
        // 获取区块全局坐标
        const worldX = x * size;
        const worldZ = z * size;
        
        // 生成地形高度图
        for (let localX = 0; localX < size; localX++) {
            for (let localZ = 0; localZ < size; localZ++) {
                const globalX = worldX + localX;
                const globalZ = worldZ + localZ;
                
                // 获取生物群系
                const biome = this.getBiome(globalX, globalZ);
                
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
                    // 默认为空气
                    let blockId = 0;
                    
                    // 根据生物群系和高度确定方块类型
                    if (y === 0) {
                        // 最底层为基岩
                        blockId = 11; // bedrock
                    } else if (y < terrainHeight) {
                        // 地下部分
                        if (y < terrainHeight - 4) {
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
                            
                            // 生成洞穴
                            const caveNoise = this.noiseGenerator.perlin3D(
                                globalX * this.caveParams.scale,
                                y * this.caveParams.scale,
                                globalZ * this.caveParams.scale
                            );
                            
                            if (caveNoise > this.caveParams.threshold && y > 10) {
                                blockId = 0; // air
                            }
                        } else if (y < terrainHeight - 1) {
                            // 表层下为泥土
                            blockId = 2; // dirt
                        } else {
                            // 表层方块
                            if (biome === 'desert') {
                                blockId = 7; // sand
                            } else if (biome === 'mountains') {
                                blockId = 1; // stone
                            } else {
                                blockId = 3; // grass
                            }
                        }
                    } else if (y <= waterLevel) {
                        // 水平面以下为水
                        blockId = 8; // water
                    }
                    
                    // 设置方块
                    chunk.setBlock(localX, y, localZ, blockId);
                }
                
                // 生成结构
                if (biome === 'forest' && Math.random() < 0.02 && terrainHeight > waterLevel) {
                    this.generateTree(chunk, localX, terrainHeight, localZ);
                }
            }
        }
        
        chunk.isGenerated = true;
        chunk.needsUpdate = true;
    }
    
    /**
     * 获取生物群系
     * @param {number} x - 全局X坐标
     * @param {number} z - 全局Z坐标
     * @returns {string} 生物群系名称
     */
    getBiome(x, z) {
        const { scale, octaves, persistence, lacunarity } = this.biomeParams;
        
        // 使用噪声确定生物群系
        const temperatureNoise = this.noiseGenerator.fractalPerlin2D(
            x * scale, 
            z * scale, 
            octaves, 
            persistence, 
            lacunarity
        );
        
        const humidityNoise = this.noiseGenerator.fractalPerlin2D(
            x * scale + 1000, 
            z * scale + 1000, 
            octaves, 
            persistence, 
            lacunarity
        );
        
        // 根据温度和湿度确定生物群系
        if (temperatureNoise > 0.5) {
            if (humidityNoise > 0.3) {
                return 'forest';
            } else {
                return 'desert';
            }
        } else {
            if (humidityNoise > 0.5) {
                return 'plains';
            } else {
                return 'mountains';
            }
        }
    }
    
    /**
     * 生成树
     * @param {Chunk} chunk - 区块实例
     * @param {number} x - 相对于区块的X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 相对于区块的Z坐标
     */
    generateTree(chunk, x, y, z) {
        // 树干高度
        const trunkHeight = 4 + Math.floor(Math.random() * 3);
        
        // 生成树干
        for (let dy = 0; dy < trunkHeight; dy++) {
            chunk.setBlock(x, y + dy, z, 4); // log
        }
        
        // 生成树叶
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = trunkHeight - 3; dy <= trunkHeight + 1; dy++) {
                    // 跳过树干位置
                    if (dx === 0 && dz === 0 && dy < trunkHeight) {
                        continue;
                    }
                    
                    // 计算到树干的距离
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    // 距离越远，生成叶子的概率越低
                    if (distance <= 2 && Math.random() < (1 - distance * 0.3)) {
                        const lx = x + dx;
                        const ly = y + dy;
                        const lz = z + dz;
                        
                        if (lx >= 0 && lx < chunk.size && ly < chunk.height && lz >= 0 && lz < chunk.size) {
                            chunk.setBlock(lx, ly, lz, 6); // leaves
                        }
                    }
                }
            }
        }
    }
}
