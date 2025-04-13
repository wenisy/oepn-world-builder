import { Block } from './Block.js';

/**
 * 方块注册表类
 * 管理所有游戏中的方块类型
 */
export class BlockRegistry {
    // 单例实例
    static instance = null;

    /**
     * 获取单例
     * @returns {BlockRegistry} BlockRegistry 实例
     */
    static getInstance() {
        console.log('调用 BlockRegistry.getInstance');
        if (!BlockRegistry.instance) {
            console.log('创建新的 BlockRegistry 实例');
            BlockRegistry.instance = new BlockRegistry();
        } else {
            console.log('返回现有的 BlockRegistry 实例');
        }
        console.log('返回的 BlockRegistry 实例:', BlockRegistry.instance);
        return BlockRegistry.instance;
    }
    constructor() {
        console.log('BlockRegistry 构造函数被调用');

        // 方块ID到方块实例的映射
        this.blocks = new Map();

        // 方块名称到方块ID的映射
        this.blockNames = new Map();

        // 注册默认方块
        this.registerDefaultBlocks();

        console.log('BlockRegistry 构造函数完成, 当前 blocks 大小:', this.blocks.size);
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
        console.log('调用 BlockRegistry.getBlockById', id, '当前 blocks:', this.blocks);
        const block = this.blocks.get(id) || null;
        console.log('获取到的方块:', block);
        return block;
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
        console.log('开始注册默认方块');
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
            textureTop: 'grass',
            textureBottom: 'dirt',
            textureFront: 'grass_side',
            textureBack: 'grass_side',
            textureLeft: 'grass_side',
            textureRight: 'grass_side',
            hardness: 0.6
        });

        // 木头方块 (ID: 4)
        this.register(4, 'wood', {
            textureTop: 'wood_top',
            textureBottom: 'wood_top',
            textureFront: 'wood_side',
            textureBack: 'wood_side',
            textureLeft: 'wood_side',
            textureRight: 'wood_side',
            hardness: 2.0
        });

        // 树叶方块 (ID: 5)
        this.register(5, 'leaves', {
            texture: 'leaves',
            transparent: true,
            hardness: 0.2
        });

        // 沙子方块 (ID: 6)
        this.register(6, 'sand', {
            texture: 'sand',
            gravity: true,
            hardness: 0.5
        });

        // 水方块 (ID: 7)
        this.register(7, 'water', {
            texture: 'water',
            transparent: true,
            liquid: true,
            solid: false,
            hardness: 100.0
        });

        // 玻璃方块 (ID: 8)
        this.register(8, 'glass', {
            texture: 'glass',
            transparent: true,
            hardness: 0.3
        });

        // 石砖方块 (ID: 9)
        this.register(9, 'stone_brick', {
            texture: 'stone_brick',
            hardness: 2.0
        });

        // 木板方块 (ID: 10)
        this.register(10, 'planks', {
            texture: 'planks',
            hardness: 2.0
        });

        // 基岩方块 (ID: 11)
        this.register(11, 'bedrock', {
            texture: 'bedrock',
            hardness: -1 // 无法破坏
        });

        console.log('默认方块注册完成, 当前 blocks:', this.blocks);

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

        // 发光石方块 (ID: 16)
        this.register(16, 'glowstone', {
            texture: 'glowstone',
            lightLevel: 15,
            hardness: 0.3
        });
    }
}
