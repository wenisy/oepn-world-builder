import { Block } from './Block.js';

/**
 * 方块注册表类
 * 管理所有游戏中的方块类型
 */
export class BlockRegistry {
    constructor() {
        // 方块ID到方块实例的映射
        this.blocks = new Map();
        
        // 方块名称到方块ID的映射
        this.blockNames = new Map();
        
        // 注册默认方块
        this.registerDefaultBlocks();
    }
    
    /**
     * 注册一个新方块
     * @param {number} id - 方块ID
     * @param {string} name - 方块名称
     * @param {Object} properties - 方块属性
     * @returns {Block} 注册的方块实例
     */
    register(id, name, properties = {}) {
        if (this.blocks.has(id)) {
            console.warn(`方块ID ${id} 已被注册，将覆盖现有方块`);
        }
        
        const block = new Block(id, name, properties);
        this.blocks.set(id, block);
        this.blockNames.set(name, id);
        
        return block;
    }
    
    /**
     * 通过ID获取方块
     * @param {number} id - 方块ID
     * @returns {Block|null} 方块实例或null
     */
    getBlockById(id) {
        return this.blocks.get(id) || null;
    }
    
    /**
     * 通过名称获取方块
     * @param {string} name - 方块名称
     * @returns {Block|null} 方块实例或null
     */
    getBlockByName(name) {
        const id = this.blockNames.get(name);
        return id !== undefined ? this.getBlockById(id) : null;
    }
    
    /**
     * 注册默认方块
     */
    registerDefaultBlocks() {
        // 空气方块 (ID: 0)
        this.register(0, 'air', {
            solid: false,
            transparent: true,
            texture: 'air'
        });
        
        // 石头方块 (ID: 1)
        this.register(1, 'stone', {
            texture: 'stone',
            hardness: 1.5
        });
        
        // 泥土方块 (ID: 2)
        this.register(2, 'dirt', {
            texture: 'dirt',
            hardness: 0.5
        });
        
        // 草方块 (ID: 3)
        this.register(3, 'grass', {
            textureTop: 'grass_top',
            textureBottom: 'dirt',
            textureFront: 'grass_side',
            textureBack: 'grass_side',
            textureLeft: 'grass_side',
            textureRight: 'grass_side',
            hardness: 0.6
        });
        
        // 木头方块 (ID: 4)
        this.register(4, 'log', {
            textureTop: 'log_top',
            textureBottom: 'log_top',
            textureFront: 'log_side',
            textureBack: 'log_side',
            textureLeft: 'log_side',
            textureRight: 'log_side',
            hardness: 2.0
        });
        
        // 木板方块 (ID: 5)
        this.register(5, 'planks', {
            texture: 'planks',
            hardness: 2.0
        });
        
        // 树叶方块 (ID: 6)
        this.register(6, 'leaves', {
            texture: 'leaves',
            transparent: true,
            hardness: 0.2
        });
        
        // 沙子方块 (ID: 7)
        this.register(7, 'sand', {
            texture: 'sand',
            gravity: true,
            hardness: 0.5
        });
        
        // 水方块 (ID: 8)
        this.register(8, 'water', {
            texture: 'water',
            transparent: true,
            liquid: true,
            solid: false,
            hardness: 100.0
        });
        
        // 玻璃方块 (ID: 9)
        this.register(9, 'glass', {
            texture: 'glass',
            transparent: true,
            hardness: 0.3
        });
        
        // 石砖方块 (ID: 10)
        this.register(10, 'cobblestone', {
            texture: 'cobblestone',
            hardness: 2.0
        });
        
        // 基岩方块 (ID: 11)
        this.register(11, 'bedrock', {
            texture: 'bedrock',
            hardness: -1 // 无法破坏
        });
        
        // 煤矿石方块 (ID: 12)
        this.register(12, 'coal_ore', {
            texture: 'coal_ore',
            hardness: 3.0
        });
        
        // 铁矿石方块 (ID: 13)
        this.register(13, 'iron_ore', {
            texture: 'iron_ore',
            hardness: 3.0
        });
        
        // 金矿石方块 (ID: 14)
        this.register(14, 'gold_ore', {
            texture: 'gold_ore',
            hardness: 3.0
        });
        
        // 钻石矿石方块 (ID: 15)
        this.register(15, 'diamond_ore', {
            texture: 'diamond_ore',
            hardness: 3.0
        });
        
        // 工作台方块 (ID: 16)
        this.register(16, 'crafting_table', {
            textureTop: 'crafting_table_top',
            textureBottom: 'planks',
            textureFront: 'crafting_table_front',
            textureBack: 'crafting_table_side',
            textureLeft: 'crafting_table_side',
            textureRight: 'crafting_table_side',
            hardness: 2.5
        });
        
        // 熔炉方块 (ID: 17)
        this.register(17, 'furnace', {
            textureTop: 'furnace_top',
            textureBottom: 'furnace_top',
            textureFront: 'furnace_front',
            textureBack: 'furnace_side',
            textureLeft: 'furnace_side',
            textureRight: 'furnace_side',
            hardness: 3.5
        });
    }
}
