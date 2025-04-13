/**
 * 纹理管理器类
 * 负责加载和管理游戏中的纹理
 */
export class TextureManager {
    constructor() {
        // 确保 THREE 已经加载
        if (typeof THREE === 'undefined') {
            console.error('THREE is not defined. Make sure Three.js is loaded before creating TextureManager.');
            throw new Error('THREE is not defined');
        }

        // 纹理加载器
        this.loader = new THREE.TextureLoader();

        // 纹理映射表
        this.textures = new Map();

        // 纹理图集
        this.atlas = null;
        this.atlasSize = 512;
        this.textureSize = 16;

        // 纹理坐标映射
        this.uvs = new Map();

        // 方块纹理列表
        this.blockTextures = [
            'bedrock', 'coal_ore', 'cobblestone', 'crafting_table_front',
            'crafting_table_side', 'crafting_table_top', 'diamond_ore',
            'dirt', 'furnace_front', 'furnace_side', 'furnace_top',
            'gold_ore', 'grass_side', 'grass_top', 'iron_ore',
            'log_side', 'log_top', 'planks', 'sand', 'stone',
            'water', 'leaves', 'glass'
        ];
    }

    /**
     * 加载所有纹理
     * @param {Function} onProgress - 进度回调函数
     * @returns {Promise} 加载完成的Promise
     */
    async loadTextures(onProgress = null) {
        // 创建临时画布
        const canvas = document.createElement('canvas');
        canvas.width = this.atlasSize;
        canvas.height = this.atlasSize;
        const ctx = canvas.getContext('2d');

        // 填充黑色背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.atlasSize, this.atlasSize);

        // 计算每行可以放置的纹理数量
        const texturesPerRow = Math.floor(this.atlasSize / this.textureSize);

        // 加载所有纹理
        const total = this.blockTextures.length;
        let loaded = 0;

        for (let i = 0; i < total; i++) {
            const name = this.blockTextures[i];
            try {
                // 加载纹理
                const texture = await this.loadTexture(`assets/textures/${name}.png`);
                this.textures.set(name, texture);

                // 计算纹理在图集中的位置
                const row = Math.floor(i / texturesPerRow);
                const col = i % texturesPerRow;
                const x = col * this.textureSize;
                const y = row * this.textureSize;

                // 绘制到图集中
                ctx.drawImage(texture.image, x, y, this.textureSize, this.textureSize);

                // 计算UV坐标
                const u0 = x / this.atlasSize;
                const v0 = y / this.atlasSize;
                const u1 = (x + this.textureSize) / this.atlasSize;
                const v1 = (y + this.textureSize) / this.atlasSize;

                this.uvs.set(name, { u0, v0, u1, v1 });

                // 更新进度
                loaded++;
                if (onProgress) {
                    onProgress(loaded / total);
                }
            } catch (error) {
                console.error(`Failed to load texture: ${name}`, error);
            }
        }

        // 创建纹理图集
        this.atlas = new THREE.CanvasTexture(canvas);
        this.atlas.magFilter = THREE.NearestFilter;
        this.atlas.minFilter = THREE.NearestFilter;

        return this.atlas;
    }

    /**
     * 加载单个纹理
     * @param {string} url - 纹理URL
     * @returns {Promise<THREE.Texture>} 纹理Promise
     */
    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                texture => {
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    resolve(texture);
                },
                undefined,
                error => reject(error)
            );
        });
    }

    /**
     * 获取纹理UV坐标
     * @param {string} name - 纹理名称
     * @returns {Object|null} UV坐标对象或null
     */
    getUVs(name) {
        return this.uvs.get(name) || null;
    }

    /**
     * 获取纹理图集
     * @returns {THREE.Texture|null} 纹理图集
     */
    getAtlas() {
        return this.atlas;
    }
}
