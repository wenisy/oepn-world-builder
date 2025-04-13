/**
 * 纹理管理器 - 负责加载和管理游戏纹理
 */
export class TextureManager {
  constructor() {
    // 纹理加载器
    this.loader = new THREE.TextureLoader();
    
    // 纹理图集
    this.atlas = null;
    
    // 纹理坐标映射
    this.textureCoords = new Map();
    
    // 纹理大小
    this.textureSize = 16; // 默认16x16像素
    
    // 图集大小
    this.atlasSize = 256; // 默认256x256像素
  }
  
  /**
   * 加载纹理图集
   * @param {BlockRegistry} blockRegistry - 方块注册表
   * @returns {Promise} 加载完成的Promise
   */
  async loadTextureAtlas(blockRegistry) {
    return new Promise((resolve) => {
      // 创建图集画布
      const canvas = document.createElement('canvas');
      canvas.width = this.atlasSize;
      canvas.height = this.atlasSize;
      const ctx = canvas.getContext('2d');
      
      // 获取所有方块
      const blocks = blockRegistry.getAllBlocks();
      
      // 计算每行可以放置的纹理数量
      const texturesPerRow = Math.floor(this.atlasSize / this.textureSize);
      
      // 加载计数
      let loadedCount = 0;
      let totalTextures = 0;
      
      // 计算需要加载的纹理总数
      for (const block of blocks) {
        if (block.texture) {
          totalTextures++;
        } else if (block.textureMap) {
          for (const face in block.textureMap) {
            totalTextures++;
          }
        }
      }
      
      // 如果没有纹理需要加载
      if (totalTextures === 0) {
        // 创建默认纹理
        this.createDefaultTexture(canvas);
        resolve();
        return;
      }
      
      // 纹理索引
      let textureIndex = 0;
      
      // 加载每个方块的纹理
      for (const block of blocks) {
        if (block.texture) {
          // 单一纹理
          this.loadTexture(block.texture, (texture) => {
            // 计算纹理在图集中的位置
            const x = (textureIndex % texturesPerRow) * this.textureSize;
            const y = Math.floor(textureIndex / texturesPerRow) * this.textureSize;
            
            // 绘制到图集
            if (texture) {
              ctx.drawImage(texture.image, x, y, this.textureSize, this.textureSize);
            } else {
              // 绘制默认纹理
              this.drawDefaultTexture(ctx, x, y);
            }
            
            // 存储纹理坐标
            this.textureCoords.set(block.id, {
              x: x / this.atlasSize,
              y: y / this.atlasSize,
              w: this.textureSize / this.atlasSize,
              h: this.textureSize / this.atlasSize
            });
            
            // 更新计数
            textureIndex++;
            loadedCount++;
            
            // 检查是否所有纹理都已加载
            if (loadedCount === totalTextures) {
              this.createAtlasTexture(canvas, resolve);
            }
          });
        } else if (block.textureMap) {
          // 多纹理（不同面使用不同纹理）
          const faceCoords = {};
          
          // 加载每个面的纹理
          for (const face in block.textureMap) {
            const textureName = block.textureMap[face];
            
            this.loadTexture(textureName, (texture) => {
              // 计算纹理在图集中的位置
              const x = (textureIndex % texturesPerRow) * this.textureSize;
              const y = Math.floor(textureIndex / texturesPerRow) * this.textureSize;
              
              // 绘制到图集
              if (texture) {
                ctx.drawImage(texture.image, x, y, this.textureSize, this.textureSize);
              } else {
                // 绘制默认纹理
                this.drawDefaultTexture(ctx, x, y);
              }
              
              // 存储纹理坐标
              faceCoords[face] = {
                x: x / this.atlasSize,
                y: y / this.atlasSize,
                w: this.textureSize / this.atlasSize,
                h: this.textureSize / this.atlasSize
              };
              
              // 更新计数
              textureIndex++;
              loadedCount++;
              
              // 检查是否所有纹理都已加载
              if (loadedCount === totalTextures) {
                this.createAtlasTexture(canvas, resolve);
              }
            });
          }
          
          // 存储面纹理坐标
          this.textureCoords.set(block.id, faceCoords);
        } else {
          // 没有纹理，使用颜色
          // 计算纹理在图集中的位置
          const x = (textureIndex % texturesPerRow) * this.textureSize;
          const y = Math.floor(textureIndex / texturesPerRow) * this.textureSize;
          
          // 绘制颜色方块
          ctx.fillStyle = `#${block.color.toString(16).padStart(6, '0')}`;
          ctx.fillRect(x, y, this.textureSize, this.textureSize);
          
          // 存储纹理坐标
          this.textureCoords.set(block.id, {
            x: x / this.atlasSize,
            y: y / this.atlasSize,
            w: this.textureSize / this.atlasSize,
            h: this.textureSize / this.atlasSize
          });
          
          // 更新计数
          textureIndex++;
        }
      }
    });
  }
  
  /**
   * 加载单个纹理
   * @param {string} name - 纹理名称
   * @param {Function} callback - 回调函数
   */
  loadTexture(name, callback) {
    const path = `assets/textures/blocks/${name}.png`;
    
    this.loader.load(
      path,
      (texture) => {
        // 设置像素风格的过滤器
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        callback(texture);
      },
      undefined,
      (error) => {
        console.error(`无法加载纹理 ${path}:`, error);
        callback(null);
      }
    );
  }
  
  /**
   * 创建默认纹理
   * @param {HTMLCanvasElement} canvas - 画布
   */
  createDefaultTexture(canvas) {
    const ctx = canvas.getContext('2d');
    
    // 绘制默认纹理
    this.drawDefaultTexture(ctx, 0, 0);
    
    // 创建纹理
    this.atlas = new THREE.CanvasTexture(canvas);
    this.atlas.magFilter = THREE.NearestFilter;
    this.atlas.minFilter = THREE.NearestFilter;
    
    // 存储默认纹理坐标
    this.textureCoords.set('default', {
      x: 0,
      y: 0,
      w: this.textureSize / this.atlasSize,
      h: this.textureSize / this.atlasSize
    });
  }
  
  /**
   * 绘制默认纹理
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  drawDefaultTexture(ctx, x, y) {
    // 绘制紫黑相间的方格
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(x, y, this.textureSize, this.textureSize);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, this.textureSize / 2, this.textureSize / 2);
    ctx.fillRect(x + this.textureSize / 2, y + this.textureSize / 2, this.textureSize / 2, this.textureSize / 2);
  }
  
  /**
   * 创建图集纹理
   * @param {HTMLCanvasElement} canvas - 画布
   * @param {Function} resolve - Promise解析函数
   */
  createAtlasTexture(canvas, resolve) {
    // 创建纹理
    this.atlas = new THREE.CanvasTexture(canvas);
    this.atlas.magFilter = THREE.NearestFilter;
    this.atlas.minFilter = THREE.NearestFilter;
    
    // 解析Promise
    resolve();
  }
  
  /**
   * 获取纹理图集
   * @returns {THREE.Texture} 纹理图集
   */
  getTextureAtlas() {
    return this.atlas;
  }
  
  /**
   * 获取纹理坐标
   * @param {number} blockId - 方块ID
   * @param {string} face - 面名称
   * @returns {Object} 纹理坐标
   */
  getTextureCoords(blockId, face) {
    const coords = this.textureCoords.get(blockId);
    
    if (!coords) {
      return this.textureCoords.get('default');
    }
    
    if (typeof coords === 'object' && coords[face]) {
      return coords[face];
    }
    
    return coords;
  }
}
