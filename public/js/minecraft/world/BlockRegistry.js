/**
 * 方块注册表类 - 管理所有方块类型
 */
export class BlockRegistry {
  constructor() {
    this.blocks = {};
  }
  
  /**
   * 注册方块类型
   */
  registerBlock(id, properties) {
    this.blocks[id] = {
      id,
      ...properties
    };
  }
  
  /**
   * 注册默认方块
   */
  registerDefaultBlocks() {
    // 空气方块
    this.registerBlock('air', {
      name: '空气',
      visible: false,
      solid: false
    });
    
    // 石头方块
    this.registerBlock('stone', {
      name: '石头',
      texture: 'stone',
      color: 0x888888,
      hardness: 1.5
    });
    
    // 泥土方块
    this.registerBlock('dirt', {
      name: '泥土',
      texture: 'dirt',
      color: 0x8B4513,
      hardness: 0.5
    });
    
    // 草方块
    this.registerBlock('grass', {
      name: '草方块',
      texture: 'grass',
      color: 0x7CFC00,
      hardness: 0.6
    });
    
    // 木头方块
    this.registerBlock('wood', {
      name: '木头',
      texture: 'wood',
      color: 0x8B4513,
      hardness: 2.0
    });
    
    // 树叶方块
    this.registerBlock('leaves', {
      name: '树叶',
      texture: 'leaves',
      color: 0x00FF00,
      hardness: 0.2,
      transparent: true
    });
    
    // 沙子方块
    this.registerBlock('sand', {
      name: '沙子',
      texture: 'sand',
      color: 0xFFD700,
      hardness: 0.5
    });
    
    // 玻璃方块
    this.registerBlock('glass', {
      name: '玻璃',
      texture: 'glass',
      color: 0xADD8E6,
      hardness: 0.3,
      transparent: true
    });
    
    // 砖块方块
    this.registerBlock('brick', {
      name: '砖块',
      texture: 'brick',
      color: 0xB22222,
      hardness: 2.0
    });
    
    // 仙人掌方块
    this.registerBlock('cactus', {
      name: '仙人掌',
      texture: 'cactus',
      color: 0x2E8B57,
      hardness: 0.4,
      damage: 1 // 接触伤害
    });
  }
  
  /**
   * 获取方块类型
   */
  getBlock(id) {
    return this.blocks[id] || this.blocks['air'];
  }
  
  /**
   * 获取所有方块
   */
  getBlocks() {
    return this.blocks;
  }
  
  /**
   * 获取可见方块列表
   */
  getVisibleBlocks() {
    return Object.values(this.blocks).filter(block => block.visible !== false);
  }
}
