/**
 * 区块网格生成器类
 * 负责将区块数据转换为Three.js网格
 */
export class ChunkMesher {
    /**
     * 创建一个新的区块网格生成器
     * @param {BlockRegistry} blockRegistry - 方块注册表
     * @param {TextureManager} textureManager - 纹理管理器
     */
    constructor(blockRegistry, textureManager) {
        this.blockRegistry = blockRegistry;
        this.textureManager = textureManager;
        
        // 面方向定义
        this.DIRECTIONS = [
            { x: 0, y: 1, z: 0, name: 'top', opposite: 1 },    // 上 (0)
            { x: 0, y: -1, z: 0, name: 'bottom', opposite: 0 }, // 下 (1)
            { x: 0, y: 0, z: 1, name: 'front', opposite: 3 },  // 前 (2)
            { x: 0, y: 0, z: -1, name: 'back', opposite: 2 },  // 后 (3)
            { x: -1, y: 0, z: 0, name: 'left', opposite: 5 },  // 左 (4)
            { x: 1, y: 0, z: 0, name: 'right', opposite: 4 }   // 右 (5)
        ];
        
        // 面顶点定义
        this.VERTICES = [
            // 上面 (y+)
            [
                { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
                { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }
            ],
            // 下面 (y-)
            [
                { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
                { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }
            ],
            // 前面 (z+)
            [
                { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
                { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }
            ],
            // 后面 (z-)
            [
                { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 },
                { x: 1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }
            ],
            // 左面 (x-)
            [
                { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 },
                { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }
            ],
            // 右面 (x+)
            [
                { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 0 },
                { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 0 }
            ]
        ];
        
        // 面法线定义
        this.NORMALS = [
            { x: 0, y: 1, z: 0 },  // 上
            { x: 0, y: -1, z: 0 }, // 下
            { x: 0, y: 0, z: 1 },  // 前
            { x: 0, y: 0, z: -1 }, // 后
            { x: -1, y: 0, z: 0 }, // 左
            { x: 1, y: 0, z: 0 }   // 右
        ];
        
        // 面UV坐标定义
        this.UVS = [
            { u: 0, v: 0 }, { u: 1, v: 0 },
            { u: 0, v: 1 }, { u: 1, v: 1 }
        ];
        
        // AO强度
        this.AO_STRENGTH = 0.3;
    }
    
    /**
     * 创建区块网格
     * @param {Chunk} chunk - 区块实例
     * @param {World} world - 世界实例
     * @returns {THREE.Mesh} 生成的网格
     */
    createMesh(chunk, world) {
        // 获取区块位置
        const chunkPos = chunk.getPosition();
        
        // 创建几何体数据
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const colors = [];
        
        // 遍历区块中的所有方块
        for (let x = 0; x < chunk.size; x++) {
            for (let y = 0; y < chunk.height; y++) {
                for (let z = 0; z < chunk.size; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    
                    // 跳过空气方块
                    if (blockId === 0) {
                        continue;
                    }
                    
                    // 获取方块实例
                    const block = this.blockRegistry.getBlockById(blockId);
                    if (!block) {
                        continue;
                    }
                    
                    // 检查每个面是否需要渲染
                    for (let faceIndex = 0; faceIndex < this.DIRECTIONS.length; faceIndex++) {
                        const dir = this.DIRECTIONS[faceIndex];
                        const nx = x + dir.x;
                        const ny = y + dir.y;
                        const nz = z + dir.z;
                        
                        // 检查相邻方块
                        let neighborBlockId;
                        
                        // 如果相邻位置在区块内
                        if (nx >= 0 && nx < chunk.size && ny >= 0 && ny < chunk.height && nz >= 0 && nz < chunk.size) {
                            neighborBlockId = chunk.getBlock(nx, ny, nz);
                        } else {
                            // 相邻位置在其他区块
                            const worldX = chunkPos.x + nx;
                            const worldZ = chunkPos.z + nz;
                            neighborBlockId = world.getBlock(worldX, ny, worldZ);
                        }
                        
                        // 获取相邻方块
                        const neighborBlock = this.blockRegistry.getBlockById(neighborBlockId);
                        
                        // 如果相邻方块是空气或透明方块，则渲染当前面
                        if (!neighborBlock || neighborBlock.isTransparent()) {
                            // 获取面的纹理
                            const textureName = block.getTexture(dir.name) || 'stone';
                            
                            // 添加面
                            this.addFace(
                                vertices, normals, uvs, indices, colors,
                                x, y, z,
                                faceIndex,
                                textureName,
                                chunk, world
                            );
                        }
                    }
                }
            }
        }
        
        // 如果没有顶点数据，返回null
        if (vertices.length === 0) {
            return null;
        }
        
        // 创建几何体
        const geometry = new THREE.BufferGeometry();
        
        // 设置几何体属性
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        
        // 计算包围盒
        geometry.computeBoundingBox();
        
        // 创建材质
        const material = new THREE.MeshLambertMaterial({
            map: this.textureManager.getAtlas(),
            vertexColors: true,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.FrontSide
        });
        
        // 创建网格
        const mesh = new THREE.Mesh(geometry, material);
        
        // 设置网格位置
        mesh.position.set(chunkPos.x, 0, chunkPos.z);
        
        // 设置网格名称
        mesh.name = `chunk_${chunk.x}_${chunk.z}`;
        
        return mesh;
    }
    
    /**
     * 添加一个面到几何体
     * @param {Array} vertices - 顶点数组
     * @param {Array} normals - 法线数组
     * @param {Array} uvs - UV坐标数组
     * @param {Array} indices - 索引数组
     * @param {Array} colors - 颜色数组
     * @param {number} x - 方块X坐标
     * @param {number} y - 方块Y坐标
     * @param {number} z - 方块Z坐标
     * @param {number} faceIndex - 面索引
     * @param {string} textureName - 纹理名称
     * @param {Chunk} chunk - 区块实例
     * @param {World} world - 世界实例
     */
    addFace(vertices, normals, uvs, indices, colors, x, y, z, faceIndex, textureName, chunk, world) {
        // 获取面顶点
        const faceVertices = this.VERTICES[faceIndex];
        
        // 获取面法线
        const normal = this.NORMALS[faceIndex];
        
        // 获取纹理坐标
        const textureUVs = this.textureManager.getUVs(textureName);
        if (!textureUVs) {
            console.warn(`纹理坐标未找到: ${textureName}`);
            return;
        }
        
        // 当前顶点索引
        const vertexIndex = vertices.length / 3;
        
        // 计算环境光遮蔽 (AO)
        const aoValues = this.calculateAO(x, y, z, faceIndex, chunk, world);
        
        // 添加顶点、法线和颜色
        for (let i = 0; i < 4; i++) {
            const vertex = faceVertices[i];
            
            // 添加顶点
            vertices.push(x + vertex.x, y + vertex.y, z + vertex.z);
            
            // 添加法线
            normals.push(normal.x, normal.y, normal.z);
            
            // 添加AO颜色
            const aoValue = 1.0 - (aoValues[i] * this.AO_STRENGTH);
            colors.push(aoValue, aoValue, aoValue);
        }
        
        // 添加UV坐标
        const uv = this.UVS;
        uvs.push(
            textureUVs.u0 + uv[0].u * (textureUVs.u1 - textureUVs.u0),
            textureUVs.v0 + uv[0].v * (textureUVs.v1 - textureUVs.v0),
            
            textureUVs.u0 + uv[1].u * (textureUVs.u1 - textureUVs.u0),
            textureUVs.v0 + uv[1].v * (textureUVs.v1 - textureUVs.v0),
            
            textureUVs.u0 + uv[2].u * (textureUVs.u1 - textureUVs.u0),
            textureUVs.v0 + uv[2].v * (textureUVs.v1 - textureUVs.v0),
            
            textureUVs.u0 + uv[3].u * (textureUVs.u1 - textureUVs.u0),
            textureUVs.v0 + uv[3].v * (textureUVs.v1 - textureUVs.v0)
        );
        
        // 添加索引 (两个三角形组成一个面)
        indices.push(
            vertexIndex, vertexIndex + 1, vertexIndex + 2,
            vertexIndex + 2, vertexIndex + 1, vertexIndex + 3
        );
    }
    
    /**
     * 计算环境光遮蔽 (AO)
     * @param {number} x - 方块X坐标
     * @param {number} y - 方块Y坐标
     * @param {number} z - 方块Z坐标
     * @param {number} faceIndex - 面索引
     * @param {Chunk} chunk - 区块实例
     * @param {World} world - 世界实例
     * @returns {Array} 四个顶点的AO值
     */
    calculateAO(x, y, z, faceIndex, chunk, world) {
        const dir = this.DIRECTIONS[faceIndex];
        const chunkPos = chunk.getPosition();
        
        // 检查方块是否为实体方块
        const isSolid = (dx, dy, dz) => {
            let blockId;
            
            // 计算全局坐标
            const gx = x + dx;
            const gy = y + dy;
            const gz = z + dz;
            
            // 如果在区块内
            if (gx >= 0 && gx < chunk.size && gy >= 0 && gy < chunk.height && gz >= 0 && gz < chunk.size) {
                blockId = chunk.getBlock(gx, gy, gz);
            } else {
                // 如果在其他区块
                const worldX = chunkPos.x + gx;
                const worldZ = chunkPos.z + gz;
                blockId = world.getBlock(worldX, gy, worldZ);
            }
            
            const block = this.blockRegistry.getBlockById(blockId);
            return block && block.isSolid();
        };
        
        // 根据面方向计算AO
        let aoValues = [0, 0, 0, 0];
        
        if (faceIndex === 0) { // 上面
            aoValues[0] = (isSolid(-1, 1, 0) ? 1 : 0) + (isSolid(0, 1, -1) ? 1 : 0) + (isSolid(-1, 1, -1) ? 1 : 0);
            aoValues[1] = (isSolid(1, 1, 0) ? 1 : 0) + (isSolid(0, 1, -1) ? 1 : 0) + (isSolid(1, 1, -1) ? 1 : 0);
            aoValues[2] = (isSolid(-1, 1, 0) ? 1 : 0) + (isSolid(0, 1, 1) ? 1 : 0) + (isSolid(-1, 1, 1) ? 1 : 0);
            aoValues[3] = (isSolid(1, 1, 0) ? 1 : 0) + (isSolid(0, 1, 1) ? 1 : 0) + (isSolid(1, 1, 1) ? 1 : 0);
        } else if (faceIndex === 1) { // 下面
            aoValues[0] = (isSolid(-1, -1, 0) ? 1 : 0) + (isSolid(0, -1, 1) ? 1 : 0) + (isSolid(-1, -1, 1) ? 1 : 0);
            aoValues[1] = (isSolid(1, -1, 0) ? 1 : 0) + (isSolid(0, -1, 1) ? 1 : 0) + (isSolid(1, -1, 1) ? 1 : 0);
            aoValues[2] = (isSolid(-1, -1, 0) ? 1 : 0) + (isSolid(0, -1, -1) ? 1 : 0) + (isSolid(-1, -1, -1) ? 1 : 0);
            aoValues[3] = (isSolid(1, -1, 0) ? 1 : 0) + (isSolid(0, -1, -1) ? 1 : 0) + (isSolid(1, -1, -1) ? 1 : 0);
        } else if (faceIndex === 2) { // 前面
            aoValues[0] = (isSolid(-1, 0, 1) ? 1 : 0) + (isSolid(0, -1, 1) ? 1 : 0) + (isSolid(-1, -1, 1) ? 1 : 0);
            aoValues[1] = (isSolid(1, 0, 1) ? 1 : 0) + (isSolid(0, -1, 1) ? 1 : 0) + (isSolid(1, -1, 1) ? 1 : 0);
            aoValues[2] = (isSolid(-1, 0, 1) ? 1 : 0) + (isSolid(0, 1, 1) ? 1 : 0) + (isSolid(-1, 1, 1) ? 1 : 0);
            aoValues[3] = (isSolid(1, 0, 1) ? 1 : 0) + (isSolid(0, 1, 1) ? 1 : 0) + (isSolid(1, 1, 1) ? 1 : 0);
        } else if (faceIndex === 3) { // 后面
            aoValues[0] = (isSolid(1, 0, -1) ? 1 : 0) + (isSolid(0, -1, -1) ? 1 : 0) + (isSolid(1, -1, -1) ? 1 : 0);
            aoValues[1] = (isSolid(-1, 0, -1) ? 1 : 0) + (isSolid(0, -1, -1) ? 1 : 0) + (isSolid(-1, -1, -1) ? 1 : 0);
            aoValues[2] = (isSolid(1, 0, -1) ? 1 : 0) + (isSolid(0, 1, -1) ? 1 : 0) + (isSolid(1, 1, -1) ? 1 : 0);
            aoValues[3] = (isSolid(-1, 0, -1) ? 1 : 0) + (isSolid(0, 1, -1) ? 1 : 0) + (isSolid(-1, 1, -1) ? 1 : 0);
        } else if (faceIndex === 4) { // 左面
            aoValues[0] = (isSolid(-1, 0, -1) ? 1 : 0) + (isSolid(-1, -1, 0) ? 1 : 0) + (isSolid(-1, -1, -1) ? 1 : 0);
            aoValues[1] = (isSolid(-1, 0, 1) ? 1 : 0) + (isSolid(-1, -1, 0) ? 1 : 0) + (isSolid(-1, -1, 1) ? 1 : 0);
            aoValues[2] = (isSolid(-1, 0, -1) ? 1 : 0) + (isSolid(-1, 1, 0) ? 1 : 0) + (isSolid(-1, 1, -1) ? 1 : 0);
            aoValues[3] = (isSolid(-1, 0, 1) ? 1 : 0) + (isSolid(-1, 1, 0) ? 1 : 0) + (isSolid(-1, 1, 1) ? 1 : 0);
        } else if (faceIndex === 5) { // 右面
            aoValues[0] = (isSolid(1, 0, 1) ? 1 : 0) + (isSolid(1, -1, 0) ? 1 : 0) + (isSolid(1, -1, 1) ? 1 : 0);
            aoValues[1] = (isSolid(1, 0, -1) ? 1 : 0) + (isSolid(1, -1, 0) ? 1 : 0) + (isSolid(1, -1, -1) ? 1 : 0);
            aoValues[2] = (isSolid(1, 0, 1) ? 1 : 0) + (isSolid(1, 1, 0) ? 1 : 0) + (isSolid(1, 1, 1) ? 1 : 0);
            aoValues[3] = (isSolid(1, 0, -1) ? 1 : 0) + (isSolid(1, 1, 0) ? 1 : 0) + (isSolid(1, 1, -1) ? 1 : 0);
        }
        
        // 将AO值归一化到0-1范围
        return aoValues.map(v => v / 3);
    }
}
