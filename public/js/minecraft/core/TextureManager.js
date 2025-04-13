/**
 * 纹理管理器类 - 负责加载和管理游戏纹理
 */
export class TextureManager {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.blockTextures = {};
    this.itemTextures = {};
    this.uiTextures = {};
  }
  
  /**
   * 加载方块纹理
   */
  async loadBlockTextures(blockRegistry) {
    return new Promise((resolve) => {
      const blocks = blockRegistry.getBlocks();
      let loadedCount = 0;
      const totalTextures = Object.values(blocks)
        .filter(block => block.texture && block.visible !== false)
        .length;
      
      // 如果没有纹理需要加载
      if (totalTextures === 0) {
        resolve();
        return;
      }
      
      // 加载每个方块的纹理
      for (const [id, block] of Object.entries(blocks)) {
        if (!block.texture || block.visible === false) continue;
        
        const texturePath = `textures/blocks/${block.texture}.png`;
        this.textureLoader.load(
          // 纹理路径
          texturePath,
          
          // 成功加载回调
          (texture) => {
            // 设置像素风格的过滤器
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            
            // 存储纹理
            this.blockTextures[id] = texture;
            
            // 更新加载计数
            loadedCount++;
            
            // 如果所有纹理都已加载，解析 Promise
            if (loadedCount === totalTextures) {
              resolve();
            }
          },
          
          // 加载进度回调
          undefined,
          
          // 加载错误回调
          (error) => {
            console.error(`无法加载纹理 ${texturePath}:`, error);
            
            // 即使加载失败，也更新计数
            loadedCount++;
            
            // 如果所有纹理都已处理，解析 Promise
            if (loadedCount === totalTextures) {
              resolve();
            }
          }
        );
      }
    });
  }
  
  /**
   * 加载物品纹理
   */
  async loadItemTextures(itemRegistry) {
    // 类似于 loadBlockTextures 的实现
    return Promise.resolve();
  }
  
  /**
   * 加载UI纹理
   */
  async loadUITextures() {
    return new Promise((resolve) => {
      const uiElements = [
        'crosshair',
        'hotbar',
        'inventory',
        'health',
        'hunger'
      ];
      
      let loadedCount = 0;
      const totalTextures = uiElements.length;
      
      // 加载每个UI元素的纹理
      for (const element of uiElements) {
        const texturePath = `textures/ui/${element}.png`;
        this.textureLoader.load(
          texturePath,
          (texture) => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            
            this.uiTextures[element] = texture;
            loadedCount++;
            
            if (loadedCount === totalTextures) {
              resolve();
            }
          },
          undefined,
          (error) => {
            console.error(`无法加载UI纹理 ${texturePath}:`, error);
            loadedCount++;
            
            if (loadedCount === totalTextures) {
              resolve();
            }
          }
        );
      }
    });
  }
  
  /**
   * 获取方块纹理
   */
  getBlockTexture(blockId) {
    return this.blockTextures[blockId] || null;
  }
  
  /**
   * 获取物品纹理
   */
  getItemTexture(itemId) {
    return this.itemTextures[itemId] || null;
  }
  
  /**
   * 获取UI纹理
   */
  getUITexture(elementId) {
    return this.uiTextures[elementId] || null;
  }
}
