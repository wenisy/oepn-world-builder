/**
 * 区块网格生成器类
 * 负责将区块数据转换为Three.js网格
 */
// 导入Three.js
const THREE = window.THREE;

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
        this.DIRECTIONS = {
            TOP: { x: 0, y: 1, z: 0, name: 'top' },
            BOTTOM: { x: 0, y: -1, z: 0, name: 'bottom' },
            FRONT: { x: 0, y: 0, z: 1, name: 'front' },
            BACK: { x: 0, y: 0, z: -1, name: 'back' },
            LEFT: { x: -1, y: 0, z: 0, name: 'left' },
            RIGHT: { x: 1, y: 0, z: 0, name: 'right' }
        };

        // 面顶点定义
        this.FACES = {
            TOP: [
                { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 },
                { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }
            ],
            BOTTOM: [
                { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
                { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }
            ],
            FRONT: [
                { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 },
                { x: 0, y: 1, z: 1 }, { x: 1, y: 1, z: 1 }
            ],
            BACK: [
                { x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 0 },
                { x: 1, y: 1, z: 0 }, { x: 0, y: 1, z: 0 }
            ],
            LEFT: [
                { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 },
                { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 }
            ],
            RIGHT: [
                { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 0 },
                { x: 1, y: 1, z: 1 }, { x: 1, y: 1, z: 0 }
            ]
        };

        // 面UV坐标定义
        this.UV = [
            { x: 0, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }
        ];
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

        // 创建几何体
        const geometry = new THREE.BufferGeometry();

        // 顶点数据
        const vertices = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        // 遍历区块中的所有方块
        for (let x = 0; x < chunk.width; x++) {
            for (let y = 0; y < chunk.height; y++) {
                for (let z = 0; z < chunk.depth; z++) {
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
                    for (const [direction, dir] of Object.entries(this.DIRECTIONS)) {
                        const nx = x + dir.x;
                        const ny = y + dir.y;
                        const nz = z + dir.z;

                        // 检查相邻方块
                        let neighborBlockId;

                        // 如果相邻位置在区块内
                        if (nx >= 0 && nx < chunk.width && ny >= 0 && ny < chunk.height && nz >= 0 && nz < chunk.depth) {
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
                                vertices, normals, uvs, indices,
                                x, y, z,
                                direction,
                                textureName
                            );
                        }
                    }
                }
            }
        }

        // 设置几何体属性
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);

        // 计算包围盒
        geometry.computeBoundingBox();

        // 创建材质
        const material = new THREE.MeshLambertMaterial({
            map: this.textureManager.getTextureAtlas(),
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
     * @param {number} x - 方块X坐标
     * @param {number} y - 方块Y坐标
     * @param {number} z - 方块Z坐标
     * @param {string} direction - 面方向
     * @param {string} textureName - 纹理名称
     */
    addFace(vertices, normals, uvs, indices, x, y, z, direction, textureName) {
        // 获取面顶点
        const face = this.FACES[direction];

        // 获取面法线
        const dir = this.DIRECTIONS[direction];

        // 获取纹理坐标
        const textureCoords = this.textureManager.getTextureCoordinates(textureName);
        if (!textureCoords) {
            console.warn(`纹理坐标未找到: ${textureName}`);
            return;
        }

        // 当前顶点索引
        const vertexIndex = vertices.length / 3;

        // 添加顶点和法线
        for (const vertex of face) {
            vertices.push(x + vertex.x, y + vertex.y, z + vertex.z);
            normals.push(dir.x, dir.y, dir.z);
        }

        // 添加UV坐标
        for (const uv of this.UV) {
            uvs.push(
                textureCoords.x + uv.x * textureCoords.w,
                textureCoords.y + uv.y * textureCoords.h
            );
        }

        // 添加索引 (两个三角形组成一个面)
        indices.push(
            vertexIndex, vertexIndex + 1, vertexIndex + 2,
            vertexIndex + 2, vertexIndex + 1, vertexIndex + 3
        );
    }
}
