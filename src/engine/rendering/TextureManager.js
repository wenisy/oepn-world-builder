/**
 * 纹理管理器类
 * 负责加载和管理游戏中的纹理
 */
// 导入Three.js
const THREE = window.THREE;

export class TextureManager {
    constructor() {
        // 纹理映射表
        this.textures = new Map();

        // 纹理加载器
        this.textureLoader = new THREE.TextureLoader();

        // 纹理图集
        this.textureAtlas = null;

        // 纹理坐标映射
        this.textureCoordinates = new Map();

        // 默认纹理路径
        this.texturePath = '/assets/textures/blocks/';
    }

    /**
     * 加载单个纹理
     * @param {string} name - 纹理名称
     * @param {string} path - 纹理路径
     * @returns {Promise<THREE.Texture>} 加载的纹理
     */
    loadTexture(name, path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    // 设置纹理参数
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;

                    // 存储纹理
                    this.textures.set(name, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`加载纹理失败: ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * 加载默认方块纹理
     * @returns {Promise<void>} 加载完成的Promise
     */
    async loadDefaultTextures() {
        const textureNames = [
            'air', 'stone', 'dirt', 'grass', 'grass_side', 'wood_side', 'wood_top',
            'leaves', 'sand', 'water', 'glass', 'stone_brick', 'planks', 'bedrock',
            'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'glowstone'
        ];

        const promises = textureNames.map(name => {
            return this.loadTexture(name, `${this.texturePath}${name}.png`);
        });

        await Promise.all(promises);
        console.log('所有默认纹理加载完成');
    }

    /**
     * 创建纹理图集
     * @param {number} atlasSize - 图集大小
     * @returns {THREE.Texture} 纹理图集
     */
    createTextureAtlas(atlasSize = 512) {
        // 创建画布
        const canvas = document.createElement('canvas');
        canvas.width = atlasSize;
        canvas.height = atlasSize;
        const context = canvas.getContext('2d');

        // 计算每个纹理的大小
        const textureSize = 16;
        const texturesPerRow = Math.floor(atlasSize / textureSize);

        // 将所有纹理绘制到画布上
        let index = 0;
        for (const [name, texture] of this.textures.entries()) {
            if (name === 'air') {
                // 跳过空气纹理
                this.textureCoordinates.set(name, { x: 0, y: 0, w: 0, h: 0 });
                continue;
            }

            const row = Math.floor(index / texturesPerRow);
            const col = index % texturesPerRow;

            const x = col * textureSize;
            const y = row * textureSize;

            // 创建临时画布来获取纹理图像数据
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = textureSize;
            tempCanvas.height = textureSize;
            const tempContext = tempCanvas.getContext('2d');

            // 将纹理绘制到临时画布
            tempContext.drawImage(texture.image, 0, 0, textureSize, textureSize);

            // 将临时画布内容复制到图集画布
            context.drawImage(tempCanvas, x, y, textureSize, textureSize);

            // 存储纹理坐标
            this.textureCoordinates.set(name, {
                x: x / atlasSize,
                y: y / atlasSize,
                w: textureSize / atlasSize,
                h: textureSize / atlasSize
            });

            index++;
        }

        // 创建图集纹理
        const atlasTexture = new THREE.Texture(canvas);
        atlasTexture.magFilter = THREE.NearestFilter;
        atlasTexture.minFilter = THREE.NearestFilter;
        atlasTexture.needsUpdate = true;

        this.textureAtlas = atlasTexture;
        return atlasTexture;
    }

    /**
     * 获取纹理
     * @param {string} name - 纹理名称
     * @returns {THREE.Texture|null} 纹理或null
     */
    getTexture(name) {
        return this.textures.get(name) || null;
    }

    /**
     * 获取纹理图集
     * @returns {THREE.Texture|null} 纹理图集或null
     */
    getTextureAtlas() {
        return this.textureAtlas;
    }

    /**
     * 获取纹理坐标
     * @param {string} name - 纹理名称
     * @returns {Object|null} 纹理坐标或null
     */
    getTextureCoordinates(name) {
        return this.textureCoordinates.get(name) || null;
    }
}
