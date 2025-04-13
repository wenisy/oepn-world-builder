/**
 * 区块类
 * 表示一个16×16×16的方块集合
 */
import { Voxel } from './Voxel.js';
import * as THREE from 'three';

export class Chunk {
  /**
   * 创建一个新的区块
   * @param {number} x - 区块X坐标
   * @param {number} y - 区块Y坐标
   * @param {number} z - 区块Z坐标
   * @param {number} size - 区块大小（默认为16）
   */
  constructor(x, y, z, size = 16) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.modified = true; // 标记区块是否被修改，需要重新生成网格
    this.mesh = null; // 区块的3D网格
    
    // 初始化体素数据
    this.voxels = new Array(size * size * size);
    this.initVoxels();
    
    // 用于存储相邻区块的引用
    this.neighbors = {
      px: null, // 正X方向
      nx: null, // 负X方向
      py: null, // 正Y方向
      ny: null, // 负Y方向
      pz: null, // 正Z方向
      nz: null  // 负Z方向
    };
  }
  
  /**
   * 初始化区块中的所有体素
   */
  initVoxels() {
    for (let i = 0; i < this.size * this.size * this.size; i++) {
      this.voxels[i] = new Voxel();
    }
  }
  
  /**
   * 获取体素在一维数组中的索引
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @returns {number} 索引
   */
  getIndex(x, y, z) {
    return (y * this.size * this.size) + (z * this.size) + x;
  }
  
  /**
   * 获取指定位置的体素
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @returns {Voxel} 体素对象
   */
  getVoxel(x, y, z) {
    // 检查坐标是否在区块范围内
    if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) {
      // 如果超出范围，检查相邻区块
      return this.getVoxelFromNeighbor(x, y, z);
    }
    
    const index = this.getIndex(x, y, z);
    return this.voxels[index];
  }
  
  /**
   * 从相邻区块获取体素
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @returns {Voxel} 体素对象或空气
   */
  getVoxelFromNeighbor(x, y, z) {
    let nx = x;
    let ny = y;
    let nz = z;
    let neighbor = null;
    
    // 确定相邻区块的方向
    if (x < 0) {
      nx = this.size + x;
      neighbor = this.neighbors.nx;
    } else if (x >= this.size) {
      nx = x - this.size;
      neighbor = this.neighbors.px;
    } else if (y < 0) {
      ny = this.size + y;
      neighbor = this.neighbors.ny;
    } else if (y >= this.size) {
      ny = y - this.size;
      neighbor = this.neighbors.py;
    } else if (z < 0) {
      nz = this.size + z;
      neighbor = this.neighbors.nz;
    } else if (z >= this.size) {
      nz = z - this.size;
      neighbor = this.neighbors.pz;
    }
    
    // 如果有相邻区块，从中获取体素
    if (neighbor) {
      return neighbor.getVoxel(nx, ny, nz);
    }
    
    // 如果没有相邻区块，返回空气
    return new Voxel();
  }
  
  /**
   * 设置指定位置的体素
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @param {number} type - 体素类型
   * @param {Object} properties - 体素属性
   * @returns {boolean} 是否成功设置
   */
  setVoxel(x, y, z, type, properties = {}) {
    // 检查坐标是否在区块范围内
    if (x < 0 || y < 0 || z < 0 || x >= this.size || y >= this.size || z >= this.size) {
      // 如果超出范围，尝试在相邻区块设置
      return this.setVoxelInNeighbor(x, y, z, type, properties);
    }
    
    const index = this.getIndex(x, y, z);
    const oldType = this.voxels[index].getType();
    
    // 如果类型没有变化，不需要更新
    if (oldType === type) {
      return false;
    }
    
    // 更新体素
    this.voxels[index] = new Voxel(type, properties);
    this.modified = true;
    
    return true;
  }
  
  /**
   * 在相邻区块设置体素
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @param {number} type - 体素类型
   * @param {Object} properties - 体素属性
   * @returns {boolean} 是否成功设置
   */
  setVoxelInNeighbor(x, y, z, type, properties = {}) {
    let nx = x;
    let ny = y;
    let nz = z;
    let neighbor = null;
    
    // 确定相邻区块的方向
    if (x < 0) {
      nx = this.size + x;
      neighbor = this.neighbors.nx;
    } else if (x >= this.size) {
      nx = x - this.size;
      neighbor = this.neighbors.px;
    } else if (y < 0) {
      ny = this.size + y;
      neighbor = this.neighbors.ny;
    } else if (y >= this.size) {
      ny = y - this.size;
      neighbor = this.neighbors.py;
    } else if (z < 0) {
      nz = this.size + z;
      neighbor = this.neighbors.nz;
    } else if (z >= this.size) {
      nz = z - this.size;
      neighbor = this.neighbors.pz;
    }
    
    // 如果有相邻区块，在其中设置体素
    if (neighbor) {
      return neighbor.setVoxel(nx, ny, nz, type, properties);
    }
    
    return false;
  }
  
  /**
   * 生成区块的网格
   * @param {BlockRegistry} blockRegistry - 方块注册表
   * @param {TextureManager} textureManager - 纹理管理器
   * @returns {THREE.Mesh} 生成的网格
   */
  generateMesh(blockRegistry, textureManager) {
    // 如果区块没有被修改且已有网格，直接返回
    if (!this.modified && this.mesh) {
      return this.mesh;
    }
    
    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    
    // 遍历所有体素
    for (let y = 0; y < this.size; y++) {
      for (let z = 0; z < this.size; z++) {
        for (let x = 0; x < this.size; x++) {
          const voxel = this.getVoxel(x, y, z);
          
          // 跳过空气方块
          if (voxel.isEmpty()) {
            continue;
          }
          
          // 获取方块类型
          const blockType = voxel.getType();
          const block = blockRegistry.getBlockById(blockType);
          
          if (!block) {
            continue;
          }
          
          // 检查六个方向的相邻方块，如果是空气或透明方块，则添加面
          this.addFaces(x, y, z, block, blockRegistry, textureManager, positions, normals, uvs, indices);
        }
      }
    }
    
    // 设置几何体属性
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    
    // 计算边界框
    geometry.computeBoundingSphere();
    
    // 创建材质
    const material = new THREE.MeshLambertMaterial({
      map: textureManager.getTextureAtlas(),
      transparent: true,
      alphaTest: 0.1
    });
    
    // 创建网格
    if (this.mesh) {
      // 更新现有网格
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
    } else {
      // 创建新网格
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(
        this.x * this.size,
        this.y * this.size,
        this.z * this.size
      );
    }
    
    // 重置修改标志
    this.modified = false;
    
    return this.mesh;
  }
  
  /**
   * 添加方块的可见面
   * @param {number} x - 区块内X坐标
   * @param {number} y - 区块内Y坐标
   * @param {number} z - 区块内Z坐标
   * @param {Block} block - 方块对象
   * @param {BlockRegistry} blockRegistry - 方块注册表
   * @param {TextureManager} textureManager - 纹理管理器
   * @param {Array} positions - 顶点位置数组
   * @param {Array} normals - 法线数组
   * @param {Array} uvs - UV坐标数组
   * @param {Array} indices - 索引数组
   */
  addFaces(x, y, z, block, blockRegistry, textureManager, positions, normals, uvs, indices) {
    // 六个方向：上、下、前、后、左、右
    const directions = [
      { dir: 'py', normal: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] }, // 上
      { dir: 'ny', normal: [0, -1, 0], corners: [[0, 0, 1], [1, 0, 1], [1, 0, 0], [0, 0, 0]] }, // 下
      { dir: 'pz', normal: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] }, // 前
      { dir: 'nz', normal: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] }, // 后
      { dir: 'px', normal: [1, 0, 0], corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] }, // 右
      { dir: 'nx', normal: [-1, 0, 0], corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] }  // 左
    ];
    
    // 检查每个方向
    for (const { dir, normal, corners } of directions) {
      // 获取相邻方块的坐标
      let nx = x, ny = y, nz = z;
      
      if (dir === 'px') nx++;
      else if (dir === 'nx') nx--;
      else if (dir === 'py') ny++;
      else if (dir === 'ny') ny--;
      else if (dir === 'pz') nz++;
      else if (dir === 'nz') nz--;
      
      // 获取相邻方块
      const neighbor = this.getVoxel(nx, ny, nz);
      
      // 如果相邻方块是空气或透明的，添加这个面
      if (neighbor.isEmpty() || neighbor.isTransparent()) {
        // 获取这个面的纹理UV
        const textureIndex = block.getTextureIndex(dir);
        const textureUVs = textureManager.getTextureUVs(textureIndex);
        
        // 当前顶点索引
        const vertexIndex = positions.length / 3;
        
        // 添加四个顶点
        for (const [cx, cy, cz] of corners) {
          // 顶点位置
          positions.push(x + cx, y + cy, z + cz);
          
          // 法线
          normals.push(...normal);
          
          // 纹理坐标
          const uvIndex = corners.indexOf([cx, cy, cz]);
          uvs.push(textureUVs[uvIndex * 2], textureUVs[uvIndex * 2 + 1]);
        }
        
        // 添加两个三角形（一个面）
        indices.push(
          vertexIndex, vertexIndex + 1, vertexIndex + 2,
          vertexIndex, vertexIndex + 2, vertexIndex + 3
        );
      }
    }
  }
  
  /**
   * 销毁区块
   */
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(material => material.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
      this.mesh = null;
    }
    
    this.voxels = null;
    this.neighbors = null;
  }
}
