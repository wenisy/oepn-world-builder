/**
 * 纹理管理器 - 负责加载和管理游戏纹理
 */
import * as THREE from 'three';
export class TextureManager {
  constructor() {
    // 纹理加载器
    this.loader = new THREE.TextureLoader();

    // 纹理缓存
    this.textures = new Map();

    // 默认纹理 - 紫色和黑色棋盘格
    this.defaultTexture = this.createDefaultTexture();

    // 将默认纹理添加到缓存
    this.textures.set('default', this.defaultTexture);

    // 纹理图集
    this.textureAtlas = null;

    // 纹理图集大小
    this.atlasSize = 16;

    // 纹理图集映射
    this.atlasMap = new Map();
  }

  /**
   * 创建默认纹理（紫色和黑色棋盘格）
   * @returns {THREE.Texture} 默认纹理
   */
  createDefaultTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // 绘制紫色和黑色棋盘格
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillRect(8, 8, 8, 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }

  /**
   * 加载纹理图集
   * @param {BlockRegistry} blockRegistry - 方块注册表
   * @returns {Promise} 加载完成的Promise
   */
  async loadTextureAtlas(blockRegistry) {
    return new Promise((resolve) => {
      // 获取所有方块
      const blocks = blockRegistry.getAllBlocks();

      // 加载计数
      let loadedCount = 0;
      let totalTextures = blocks.length;

      // 如果没有方块，直接完成
      if (totalTextures === 0) {
        console.log('没有方块需要加载纹理');
        resolve();
        return;
      }

      console.log(`开始加载 ${totalTextures} 个纹理`);

      // 加载每个方块的纹理
      for (const block of blocks) {
        const textureName = block.texture || block.name;

        // 尝试加载纹理
        this.loadTexture(textureName, (texture) => {
          loadedCount++;

          // 如果纹理加载成功，存储到缓存
          if (texture) {
            this.textures.set(textureName, texture);
            console.log(`纹理加载成功: ${textureName}`);
          } else {
            console.warn(`纹理加载失败: ${textureName}，使用默认纹理`);
            this.textures.set(textureName, this.defaultTexture);
          }

          // 检查是否所有纹理都已加载
          if (loadedCount === totalTextures) {
            console.log('所有纹理加载完成');
            resolve();
          }
        });
      }
    });
  }

  /**
   * 加载单个纹理
   * @param {string} name - 纹理名称
   * @param {Function} callback - 回调函数
   */
  loadTexture(name, callback) {
    // 如果纹理已经在缓存中，直接返回
    if (this.textures.has(name)) {
      callback(this.textures.get(name));
      return;
    }

    // 尝试不同的路径
    const paths = [
      `/assets/textures/blocks/${name}.png`,
      `/textures/blocks/${name}.png`,
      `/public/assets/textures/blocks/${name}.png`,
      `/public/textures/blocks/${name}.png`
    ];

    // 记录当前尝试的路径索引
    let pathIndex = 0;

    const tryLoadTexture = () => {
      if (pathIndex >= paths.length) {
        console.error(`无法加载纹理 ${name}`);
        // 所有路径都失败，返回默认纹理
        callback(this.defaultTexture);
        return;
      }

      const path = paths[pathIndex];
      console.log(`尝试加载纹理: ${path}`);

      this.loader.load(
        path,
        (texture) => {
          // 设置像素风格的过滤器
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          console.log(`纹理加载成功: ${path}`);
          callback(texture);
        },
        undefined,
        (error) => {
          console.warn(`无法加载纹理 ${path}:`, error);
          // 尝试下一个路径
          pathIndex++;
          tryLoadTexture();
        }
      );
    };

    // 开始尝试加载
    tryLoadTexture();
  }

  /**
   * 获取纹理
   * @param {string} name - 纹理名称
   * @returns {THREE.Texture} 纹理
   */
  getTexture(name) {
    return this.textures.get(name) || this.defaultTexture;
  }

  /**
   * 获取纹理图集
   * @returns {THREE.Texture} 纹理图集
   */
  getTextureAtlas() {
    if (!this.textureAtlas) {
      this.createTextureAtlas();
    }
    return this.textureAtlas;
  }

  /**
   * 创建纹理图集
   */
  createTextureAtlas() {
    // 创建画布
    const size = 1024; // 图集大小
    const tileSize = 16; // 每个纹理的大小
    const tilesPerRow = size / tileSize;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 填充透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, size, size);

    // 添加所有纹理
    let index = 0;
    for (const [name, texture] of this.textures.entries()) {
      // 计算位置
      const x = (index % tilesPerRow) * tileSize;
      const y = Math.floor(index / tilesPerRow) * tileSize;

      // 将纹理绘制到图集上
      if (texture.image) {
        ctx.drawImage(texture.image, x, y, tileSize, tileSize);
      } else {
        // 如果没有图像，使用默认纹理
        ctx.fillStyle = '#FF00FF';
        ctx.fillRect(x, y, tileSize, tileSize);
      }

      // 存储纹理在图集中的位置
      this.atlasMap.set(name, {
        index,
        x,
        y,
        u: x / size,
        v: y / size,
        width: tileSize / size,
        height: tileSize / size
      });

      index++;
    }

    // 创建纹理
    this.textureAtlas = new THREE.CanvasTexture(canvas);
    this.textureAtlas.magFilter = THREE.NearestFilter;
    this.textureAtlas.minFilter = THREE.NearestFilter;

    console.log(`创建纹理图集成功，包含 ${index} 个纹理`);
  }

  /**
   * 获取纹理的UV坐标
   * @param {string|number} textureIndex - 纹理索引或名称
   * @returns {Array} UV坐标数组 [u1, v1, u2, v2, u3, v3, u4, v4]
   */
  getTextureUVs(textureIndex) {
    // 如果是数字，将其转换为字符串
    const textureName = typeof textureIndex === 'number' ? `texture_${textureIndex}` : textureIndex;

    // 获取纹理信息
    const textureInfo = this.atlasMap.get(textureName) || this.atlasMap.get('default');

    if (!textureInfo) {
      console.warn(`找不到纹理: ${textureName}`);
      return [0, 0, 1, 0, 1, 1, 0, 1]; // 默认UV
    }

    // 计算UV坐标
    const { u, v, width, height } = textureInfo;

    // 返回四个顶点的UV坐标
    return [
      u, v,                   // 左上
      u + width, v,           // 右上
      u + width, v + height,  // 右下
      u, v + height           // 左下
    ];
  }
}
