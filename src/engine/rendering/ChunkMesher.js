/**
 * 区块网格生成器 - 负责生成区块的3D网格
 */
export class ChunkMesher {
  constructor(blockRegistry, textureManager) {
    this.blockRegistry = blockRegistry;
    this.textureManager = textureManager;
  }

  /**
   * 创建区块网格
   * @param {VoxelData} voxelData - 体素数据
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkY - 区块Y坐标
   * @param {number} chunkZ - 区块Z坐标
   * @returns {THREE.Mesh|null} 区块网格
   */
  createMesh(voxelData, chunkX, chunkY, chunkZ) {
    // 获取区块数据
    const chunk = voxelData.getChunk(chunkX, chunkY, chunkZ);

    // 如果区块不存在，返回null
    if (!chunk) return null;

    // 区块大小
    const chunkSize = voxelData.chunkSize;

    // 顶点数据
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const colors = [];

    // 不透明方块和透明方块分开处理
    const opaquePositions = [];
    const opaqueNormals = [];
    const opaqueUvs = [];
    const opaqueIndices = [];
    const opaqueColors = [];

    const transparentPositions = [];
    const transparentNormals = [];
    const transparentUvs = [];
    const transparentIndices = [];
    const transparentColors = [];

    // 顶点计数
    let opaqueVertexCount = 0;
    let transparentVertexCount = 0;

    // 遍历区块中的所有方块
    for (let localY = 0; localY < chunkSize; localY++) {
      for (let localX = 0; localX < chunkSize; localX++) {
        for (let localZ = 0; localZ < chunkSize; localZ++) {
          // 计算索引
          const index = localX + (localY * chunkSize) + (localZ * chunkSize * chunkSize);

          // 获取方块ID
          const blockId = chunk[index];

          // 如果是空气，跳过
          if (blockId === 0) continue;

          // 获取方块数据
          const block = this.blockRegistry.getById(blockId);

          // 如果方块不可见，跳过
          if (!block.visible) continue;

          // 计算世界坐标
          const worldX = chunkX * chunkSize + localX;
          const worldY = chunkY * chunkSize + localY;
          const worldZ = chunkZ * chunkSize + localZ;

          // 检查每个面是否需要渲染
          this.addBlockFaces(
            voxelData,
            block,
            worldX, worldY, worldZ,
            localX, localY, localZ,
            block.transparent ? transparentPositions : opaquePositions,
            block.transparent ? transparentNormals : opaqueNormals,
            block.transparent ? transparentUvs : opaqueUvs,
            block.transparent ? transparentIndices : opaqueIndices,
            block.transparent ? transparentColors : opaqueColors,
            block.transparent ? transparentVertexCount : opaqueVertexCount
          );

          // 更新顶点计数
          if (block.transparent) {
            transparentVertexCount += this.countVisibleFaces(voxelData, worldX, worldY, worldZ) * 4;
          } else {
            opaqueVertexCount += this.countVisibleFaces(voxelData, worldX, worldY, worldZ) * 4;
          }
        }
      }
    }

    // 如果没有可见方块，返回null
    if (opaquePositions.length === 0 && transparentPositions.length === 0) {
      return null;
    }

    // 创建网格组
    const group = new THREE.Group();

    // 创建不透明网格
    if (opaquePositions.length > 0) {
      const opaqueGeometry = new THREE.BufferGeometry();
      opaqueGeometry.setAttribute('position', new THREE.Float32BufferAttribute(opaquePositions, 3));
      opaqueGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(opaqueNormals, 3));
      opaqueGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(opaqueUvs, 2));
      opaqueGeometry.setAttribute('color', new THREE.Float32BufferAttribute(opaqueColors, 3));
      opaqueGeometry.setIndex(opaqueIndices);

      const opaqueMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: this.textureManager.getTexture('default'),
        side: THREE.FrontSide
      });

      const opaqueMesh = new THREE.Mesh(opaqueGeometry, opaqueMaterial);
      group.add(opaqueMesh);
    }

    // 创建透明网格
    if (transparentPositions.length > 0) {
      const transparentGeometry = new THREE.BufferGeometry();
      transparentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(transparentPositions, 3));
      transparentGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(transparentNormals, 3));
      transparentGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(transparentUvs, 2));
      transparentGeometry.setAttribute('color', new THREE.Float32BufferAttribute(transparentColors, 3));
      transparentGeometry.setIndex(transparentIndices);

      const transparentMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: this.textureManager.getTexture('default'),
        transparent: true,
        side: THREE.DoubleSide
      });

      const transparentMesh = new THREE.Mesh(transparentGeometry, transparentMaterial);
      group.add(transparentMesh);
    }

    return group;
  }

  /**
   * 添加方块面
   * @param {VoxelData} voxelData - 体素数据
   * @param {Object} block - 方块数据
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @param {number} localX - 局部X坐标
   * @param {number} localY - 局部Y坐标
   * @param {number} localZ - 局部Z坐标
   * @param {Array} positions - 顶点位置数组
   * @param {Array} normals - 法线数组
   * @param {Array} uvs - UV坐标数组
   * @param {Array} indices - 索引数组
   * @param {Array} colors - 颜色数组
   * @param {number} vertexCount - 顶点计数
   */
  addBlockFaces(voxelData, block, x, y, z, localX, localY, localZ, positions, normals, uvs, indices, colors, vertexCount) {
    // 面方向
    const faces = [
      { dir: [0, 1, 0], name: 'top' },    // 上
      { dir: [0, -1, 0], name: 'bottom' }, // 下
      { dir: [1, 0, 0], name: 'right' },  // 右
      { dir: [-1, 0, 0], name: 'left' },  // 左
      { dir: [0, 0, 1], name: 'front' },  // 前
      { dir: [0, 0, -1], name: 'back' }   // 后
    ];

    // 检查每个面
    for (const face of faces) {
      // 相邻方块坐标
      const nx = x + face.dir[0];
      const ny = y + face.dir[1];
      const nz = z + face.dir[2];

      // 获取相邻方块
      const neighborId = voxelData.getVoxel(nx, ny, nz);
      const neighbor = this.blockRegistry.getById(neighborId);

      // 如果相邻方块不存在或不可见，跳过
      if (!neighbor) continue;

      // 如果相邻方块是透明的或不存在，添加这个面
      if (neighbor.transparent || !neighbor.visible) {
        this.addFace(
          face.name,
          face.dir,
          block,
          localX, localY, localZ,
          positions, normals, uvs, indices, colors,
          vertexCount
        );
      }
    }
  }

  /**
   * 添加面
   * @param {string} faceName - 面名称
   * @param {Array} normal - 法线
   * @param {Object} block - 方块数据
   * @param {number} x - 局部X坐标
   * @param {number} y - 局部Y坐标
   * @param {number} z - 局部Z坐标
   * @param {Array} positions - 顶点位置数组
   * @param {Array} normals - 法线数组
   * @param {Array} uvs - UV坐标数组
   * @param {Array} indices - 索引数组
   * @param {Array} colors - 颜色数组
   * @param {number} vertexCount - 顶点计数
   */
  addFace(faceName, normal, block, x, y, z, positions, normals, uvs, indices, colors, vertexCount) {
    // 面顶点
    let vertices;

    // 根据面方向设置顶点
    switch (faceName) {
      case 'top':
        vertices = [
          [x, y + 1, z],
          [x + 1, y + 1, z],
          [x + 1, y + 1, z + 1],
          [x, y + 1, z + 1]
        ];
        break;
      case 'bottom':
        vertices = [
          [x, y, z],
          [x, y, z + 1],
          [x + 1, y, z + 1],
          [x + 1, y, z]
        ];
        break;
      case 'right':
        vertices = [
          [x + 1, y, z],
          [x + 1, y, z + 1],
          [x + 1, y + 1, z + 1],
          [x + 1, y + 1, z]
        ];
        break;
      case 'left':
        vertices = [
          [x, y, z],
          [x, y + 1, z],
          [x, y + 1, z + 1],
          [x, y, z + 1]
        ];
        break;
      case 'front':
        vertices = [
          [x, y, z + 1],
          [x, y + 1, z + 1],
          [x + 1, y + 1, z + 1],
          [x + 1, y, z + 1]
        ];
        break;
      case 'back':
        vertices = [
          [x, y, z],
          [x + 1, y, z],
          [x + 1, y + 1, z],
          [x, y + 1, z]
        ];
        break;
    }

    // 添加顶点
    for (const vertex of vertices) {
      positions.push(vertex[0], vertex[1], vertex[2]);
      normals.push(normal[0], normal[1], normal[2]);

      // 添加颜色
      const color = new THREE.Color(block.color || 0xFFFFFF);
      colors.push(color.r, color.g, color.b);
    }

    // 添加UV坐标
    // 获取纹理坐标
    const textureCoords = this.getTextureCoords(block, faceName);
    uvs.push(
      textureCoords.x, textureCoords.y + textureCoords.h,
      textureCoords.x + textureCoords.w, textureCoords.y + textureCoords.h,
      textureCoords.x + textureCoords.w, textureCoords.y,
      textureCoords.x, textureCoords.y
    );

    // 添加索引
    indices.push(
      vertexCount, vertexCount + 1, vertexCount + 2,
      vertexCount, vertexCount + 2, vertexCount + 3
    );
  }

  /**
   * 获取纹理坐标
   * @param {Object} block - 方块数据
   * @param {string} face - 面名称
   * @returns {Object} 纹理坐标
   */
  getTextureCoords(block, face) {
    // 简化处理，返回默认坐标
    return {
      x: 0,
      y: 0,
      w: 1,
      h: 1
    };
  }

  /**
   * 计算可见面数量
   * @param {VoxelData} voxelData - 体素数据
   * @param {number} x - 方块X坐标
   * @param {number} y - 方块Y坐标
   * @param {number} z - 方块Z坐标
   * @returns {number} 可见面数量
   */
  countVisibleFaces(voxelData, x, y, z) {
    // 面方向
    const directions = [
      [0, 1, 0],   // 上
      [0, -1, 0],  // 下
      [1, 0, 0],   // 右
      [-1, 0, 0],  // 左
      [0, 0, 1],   // 前
      [0, 0, -1]   // 后
    ];

    let count = 0;

    // 检查每个面
    for (const dir of directions) {
      // 相邻方块坐标
      const nx = x + dir[0];
      const ny = y + dir[1];
      const nz = z + dir[2];

      // 获取相邻方块
      const neighborId = voxelData.getVoxel(nx, ny, nz);

      // 如果相邻方块是空气或透明的，这个面是可见的
      if (neighborId === 0) {
        count++;
      } else {
        const neighbor = this.blockRegistry.getById(neighborId);
        if (neighbor && neighbor.transparent) {
          count++;
        }
      }
    }

    return count;
  }
}
