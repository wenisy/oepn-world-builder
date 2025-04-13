/**
 * 区块类
 * 表示游戏世界中的一个区块，包含多个方块
 */
export class Chunk {
    /**
     * 创建一个新的区块
     * @param {number} x - 区块X坐标
     * @param {number} z - 区块Z坐标
     * @param {number} size - 区块大小
     * @param {number} height - 区块高度
     */
    constructor(x, z, size = 16, height = 256) {
        this.x = x;
        this.z = z;
        this.size = size;
        this.height = height;
        
        // 初始化方块数据
        this.blocks = new Uint8Array(size * height * size);
        
        // 区块是否已生成
        this.isGenerated = false;
        
        // 区块网格是否需要更新
        this.needsUpdate = true;
        
        // 区块网格
        this.mesh = null;
    }
    
    /**
     * 获取区块内指定位置的方块ID
     * @param {number} x - 相对于区块的X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 相对于区块的Z坐标
     * @returns {number} 方块ID
     */
    getBlock(x, y, z) {
        if (this.isOutOfBounds(x, y, z)) {
            return 0; // 超出边界返回空气
        }
        
        const index = this.getBlockIndex(x, y, z);
        return this.blocks[index];
    }
    
    /**
     * 设置区块内指定位置的方块
     * @param {number} x - 相对于区块的X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 相对于区块的Z坐标
     * @param {number} blockId - 方块ID
     * @returns {boolean} 是否设置成功
     */
    setBlock(x, y, z, blockId) {
        if (this.isOutOfBounds(x, y, z)) {
            return false;
        }
        
        const index = this.getBlockIndex(x, y, z);
        if (this.blocks[index] !== blockId) {
            this.blocks[index] = blockId;
            this.needsUpdate = true;
            return true;
        }
        
        return false;
    }
    
    /**
     * 检查坐标是否超出区块边界
     * @param {number} x - 相对于区块的X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 相对于区块的Z坐标
     * @returns {boolean} 是否超出边界
     */
    isOutOfBounds(x, y, z) {
        return x < 0 || x >= this.size || 
               y < 0 || y >= this.height || 
               z < 0 || z >= this.size;
    }
    
    /**
     * 获取方块在一维数组中的索引
     * @param {number} x - 相对于区块的X坐标
     * @param {number} y - Y坐标
     * @param {number} z - 相对于区块的Z坐标
     * @returns {number} 索引值
     */
    getBlockIndex(x, y, z) {
        return (y * this.size * this.size) + (z * this.size) + x;
    }
    
    /**
     * 获取区块的全局坐标
     * @returns {Object} 包含x和z属性的对象
     */
    getPosition() {
        return {
            x: this.x * this.size,
            z: this.z * this.size
        };
    }
    
    /**
     * 清除区块网格
     */
    dispose() {
        if (this.mesh) {
            // 清除几何体和材质
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(material => material.dispose());
            } else if (this.mesh.material) {
                this.mesh.material.dispose();
            }
            
            this.mesh = null;
        }
    }
}
