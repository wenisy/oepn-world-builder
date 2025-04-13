/**
 * 方块类
 * 表示游戏世界中的基本方块单位
 */
export class Block {
    /**
     * 创建一个新的方块
     * @param {number} id - 方块ID
     * @param {string} name - 方块名称
     * @param {Object} properties - 方块属性
     */
    constructor(id, name, properties = {}) {
        this.id = id;
        this.name = name;
        
        // 默认属性
        this.properties = {
            solid: true,           // 是否为实体方块
            transparent: false,    // 是否透明
            liquid: false,         // 是否为液体
            lightLevel: 0,         // 发光等级 (0-15)
            hardness: 1.0,         // 硬度 (挖掘时间)
            gravity: false,        // 是否受重力影响
            textureTop: null,      // 顶部纹理
            textureBottom: null,   // 底部纹理
            textureFront: null,    // 前面纹理
            textureBack: null,     // 后面纹理
            textureLeft: null,     // 左面纹理
            textureRight: null,    // 右面纹理
            ...properties          // 合并传入的属性
        };
        
        // 如果只提供了一个纹理，则所有面使用相同纹理
        if (properties.texture && !properties.textureTop) {
            this.properties.textureTop = 
            this.properties.textureBottom = 
            this.properties.textureFront = 
            this.properties.textureBack = 
            this.properties.textureLeft = 
            this.properties.textureRight = properties.texture;
        }
    }
    
    /**
     * 获取方块在特定面的纹理
     * @param {string} face - 面的名称 ('top', 'bottom', 'front', 'back', 'left', 'right')
     * @returns {string|null} 纹理名称或null
     */
    getTexture(face) {
        const textureProp = `texture${face.charAt(0).toUpperCase() + face.slice(1)}`;
        return this.properties[textureProp];
    }
    
    /**
     * 检查方块是否为实体方块
     * @returns {boolean} 是否为实体方块
     */
    isSolid() {
        return this.properties.solid;
    }
    
    /**
     * 检查方块是否透明
     * @returns {boolean} 是否透明
     */
    isTransparent() {
        return this.properties.transparent;
    }
    
    /**
     * 检查方块是否为液体
     * @returns {boolean} 是否为液体
     */
    isLiquid() {
        return this.properties.liquid;
    }
    
    /**
     * 获取方块发光等级
     * @returns {number} 发光等级 (0-15)
     */
    getLightLevel() {
        return this.properties.lightLevel;
    }
    
    /**
     * 获取方块硬度
     * @returns {number} 硬度值
     */
    getHardness() {
        return this.properties.hardness;
    }
    
    /**
     * 检查方块是否受重力影响
     * @returns {boolean} 是否受重力影响
     */
    hasGravity() {
        return this.properties.gravity;
    }
}
