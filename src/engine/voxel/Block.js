/**
 * 方块类
 * 表示一种方块类型
 */
export class Block {
  /**
   * 创建一个新的方块类型
   * @param {number} id - 方块ID
   * @param {string} name - 方块名称
   * @param {Object} properties - 方块属性
   */
  constructor(id, name, properties = {}) {
    this.id = id;
    this.name = name;
    this.displayName = properties.displayName || name;
    
    // 纹理相关
    this.textures = properties.textures || ['default'];
    
    // 物理属性
    this.solid = properties.solid !== undefined ? properties.solid : true;
    this.transparent = properties.transparent || false;
    this.fluid = properties.fluid || false;
    
    // 游戏属性
    this.hardness = properties.hardness || 1.0; // 硬度，影响破坏速度
    this.luminance = properties.luminance || 0; // 发光强度
    this.damage = properties.damage || 0; // 接触伤害
    this.drops = properties.drops || [id]; // 破坏后掉落的物品
    
    // 声音
    this.sounds = properties.sounds || {
      break: 'break_generic',
      place: 'place_generic',
      step: 'step_generic'
    };
  }
  
  /**
   * 获取指定方向的纹理索引
   * @param {string} direction - 方向 ('px', 'nx', 'py', 'ny', 'pz', 'nz')
   * @returns {number|string} 纹理索引或名称
   */
  getTextureIndex(direction) {
    // 如果纹理是数组，使用第一个纹理
    if (Array.isArray(this.textures)) {
      return this.textures[0];
    }
    
    // 如果纹理是对象，根据方向获取纹理
    if (typeof this.textures === 'object') {
      // 映射方向到面名称
      const faceMap = {
        'py': 'top',
        'ny': 'bottom',
        'px': 'right',
        'nx': 'left',
        'pz': 'front',
        'nz': 'back'
      };
      
      const face = faceMap[direction];
      
      // 检查是否有特定面的纹理
      if (this.textures[face]) {
        return this.textures[face];
      }
      
      // 检查是否有通用侧面纹理
      if (face !== 'top' && face !== 'bottom' && this.textures.sides) {
        return this.textures.sides;
      }
      
      // 如果没有特定面的纹理，使用默认纹理
      return this.textures.default || 'default';
    }
    
    // 如果纹理是字符串，所有面使用相同纹理
    return this.textures;
  }
  
  /**
   * 检查方块是否为空气
   * @returns {boolean} 如果方块是空气则返回true
   */
  isAir() {
    return this.id === 0;
  }
  
  /**
   * 检查方块是否为固体
   * @returns {boolean} 如果方块是固体则返回true
   */
  isSolid() {
    return this.solid;
  }
  
  /**
   * 检查方块是否为透明
   * @returns {boolean} 如果方块是透明的则返回true
   */
  isTransparent() {
    return this.transparent;
  }
  
  /**
   * 检查方块是否为流体
   * @returns {boolean} 如果方块是流体则返回true
   */
  isFluid() {
    return this.fluid;
  }
}
