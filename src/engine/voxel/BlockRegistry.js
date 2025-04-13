/**
 * 方块注册表 - 管理所有方块类型
 */
export class BlockRegistry {
  constructor() {
    // 方块类型映射表
    this.blocks = new Map();

    // 方块ID计数器
    this.nextId = 1; // 0 保留给空气方块

    // 注册空气方块
    this.register({
      id: 0,
      name: 'air',
      displayName: '空气',
      transparent: true,
      solid: false,
      visible: false,
      selectable: false
    });

    // 注册默认方块
    this.registerDefaults();
  }

  /**
   * 注册方块类型
   * @param {Object} blockData - 方块数据
   * @returns {number} 方块ID
   */
  register(blockData) {
    // 如果没有指定ID，使用自增ID
    const id = blockData.id !== undefined ? blockData.id : this.nextId++;

    // 存储方块数据
    this.blocks.set(id, {
      id,
      name: blockData.name || `block_${id}`,
      displayName: blockData.displayName || `方块 ${id}`,
      texture: blockData.texture || null,
      textureMap: blockData.textureMap || null, // 用于不同面使用不同纹理
      color: blockData.color || 0xFFFFFF,
      transparent: blockData.transparent || false,
      solid: blockData.solid !== undefined ? blockData.solid : true,
      visible: blockData.visible !== undefined ? blockData.visible : true,
      selectable: blockData.selectable !== undefined ? blockData.selectable : true,
      hardness: blockData.hardness || 1.0, // 硬度，影响破坏速度
      luminance: blockData.luminance || 0, // 发光强度
      damage: blockData.damage || 0, // 接触伤害
      drops: blockData.drops || [id], // 破坏后掉落的物品
      sounds: blockData.sounds || { // 方块声音
        break: 'break_generic',
        place: 'place_generic',
        step: 'step_generic'
      }
    });

    return id;
  }

  /**
   * 通过ID获取方块数据
   * @param {number} id - 方块ID
   * @returns {Object|null} 方块数据
   */
  getById(id) {
    return this.blocks.get(id) || null;
  }

  /**
   * 通过名称获取方块数据
   * @param {string} name - 方块名称
   * @returns {Object|null} 方块数据
   */
  getByName(name) {
    for (const block of this.blocks.values()) {
      if (block.name === name) {
        return block;
      }
    }
    return null;
  }

  /**
   * 获取方块ID
   * @param {string} name - 方块名称
   * @returns {number} 方块ID，如果不存在则返回0（空气）
   */
  getIdByName(name) {
    const block = this.getByName(name);
    return block ? block.id : 0;
  }

  /**
   * 注册默认方块
   */
  registerDefaults() {
    // 基础方块
    this.register({
      name: 'stone',
      displayName: '石头',
      texture: 'stone',
      hardness: 1.5
    });

    this.register({
      name: 'dirt',
      displayName: '泥土',
      texture: 'dirt',
      hardness: 0.5
    });

    this.register({
      name: 'grass',
      displayName: '草方块',
      texture: 'grass',
      hardness: 0.6
    });

    this.register({
      name: 'cobblestone',
      displayName: '圆石',
      texture: 'cobblestone',
      hardness: 2.0
    });

    this.register({
      name: 'bedrock',
      displayName: '基岩',
      texture: 'bedrock',
      hardness: -1 // 无法破坏
    });

    // 木材方块
    this.register({
      name: 'oak_log',
      displayName: '橡木原木',
      texture: 'oak_log',
      hardness: 2.0
    });

    this.register({
      name: 'oak_planks',
      displayName: '橡木木板',
      texture: 'oak_planks',
      hardness: 2.0
    });

    this.register({
      name: 'oak_leaves',
      displayName: '橡树树叶',
      texture: 'oak_leaves',
      transparent: true,
      hardness: 0.2
    });

    // 沙子和玻璃
    this.register({
      name: 'sand',
      displayName: '沙子',
      texture: 'sand',
      hardness: 0.5
    });

    this.register({
      name: 'glass',
      displayName: '玻璃',
      texture: 'glass',
      transparent: true,
      hardness: 0.3
    });

    // 矿石
    this.register({
      name: 'coal_ore',
      displayName: '煤矿石',
      texture: 'coal_ore',
      hardness: 3.0,
      drops: ['coal']
    });

    this.register({
      name: 'iron_ore',
      displayName: '铁矿石',
      texture: 'iron_ore',
      hardness: 3.0,
      drops: ['iron_ore']
    });

    this.register({
      name: 'gold_ore',
      displayName: '金矿石',
      texture: 'gold_ore',
      hardness: 3.0,
      drops: ['gold_ore']
    });

    this.register({
      name: 'diamond_ore',
      displayName: '钻石矿石',
      texture: 'diamond_ore',
      hardness: 3.0,
      drops: ['diamond']
    });

    // 发光方块
    this.register({
      name: 'glowstone',
      displayName: '萤石',
      texture: 'glowstone',
      hardness: 0.3,
      luminance: 15
    });

    this.register({
      name: 'torch',
      displayName: '火把',
      texture: 'torch',
      solid: false,
      hardness: 0.0,
      luminance: 14
    });

    // 水和熔岩
    this.register({
      name: 'water',
      displayName: '水',
      texture: 'water',
      transparent: true,
      solid: false,
      hardness: 100 // 无法直接破坏
    });

    this.register({
      name: 'lava',
      displayName: '熔岩',
      texture: 'lava',
      transparent: false,
      solid: false,
      hardness: 100, // 无法直接破坏
      luminance: 15,
      damage: 4 // 接触伤害
    });
  }

  /**
   * 获取所有方块
   * @returns {Array} 方块数组
   */
  getAllBlocks() {
    return Array.from(this.blocks.values());
  }

  /**
   * 获取所有可见方块
   * @returns {Array} 可见方块数组
   */
  getVisibleBlocks() {
    return Array.from(this.blocks.values()).filter(block => block.visible);
  }

  /**
   * 获取所有固体方块
   * @returns {Array} 固体方块数组
   */
  getSolidBlocks() {
    return Array.from(this.blocks.values()).filter(block => block.solid);
  }
}
