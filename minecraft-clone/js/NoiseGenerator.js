/**
 * 噪声生成器类
 * 用于生成柏林噪声和Simplex噪声，用于地形生成
 */
export class NoiseGenerator {
    constructor(seed = Math.random() * 10000) {
        this.seed = seed;
        this.initialize();
    }

    /**
     * 初始化噪声生成器
     */
    initialize() {
        // 使用种子初始化随机数生成器
        this.random = this.mulberry32(this.seed);
        
        // 生成置换表
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 256; i++) {
            this.perm[i] = this.perm[i + 256] = Math.floor(this.random() * 256);
        }
    }

    /**
     * 基于种子的随机数生成器
     * @param {number} seed - 随机种子
     * @returns {function} 返回一个生成随机数的函数
     */
    mulberry32(seed) {
        return function() {
            let t = seed += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    /**
     * 生成2D柏林噪声
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {number} 返回范围在[-1,1]的噪声值
     */
    perlin2D(x, y) {
        // 确定单元格坐标
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        // 计算相对坐标
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        // 计算淡入淡出曲线
        const u = this.fade(x);
        const v = this.fade(y);
        
        // 获取哈希值
        const A = this.perm[X] + Y;
        const B = this.perm[X + 1] + Y;
        
        // 混合梯度
        return this.lerp(
            v,
            this.lerp(
                u,
                this.grad(this.perm[A], x, y),
                this.grad(this.perm[B], x - 1, y)
            ),
            this.lerp(
                u,
                this.grad(this.perm[A + 1], x, y - 1),
                this.grad(this.perm[B + 1], x - 1, y - 1)
            )
        );
    }

    /**
     * 生成3D柏林噪声
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} z - Z坐标
     * @returns {number} 返回范围在[-1,1]的噪声值
     */
    perlin3D(x, y, z) {
        // 确定单元格坐标
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        // 计算相对坐标
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        // 计算淡入淡出曲线
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        // 获取哈希值
        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;
        
        // 混合梯度
        return this.lerp(
            w,
            this.lerp(
                v,
                this.lerp(
                    u,
                    this.grad(this.perm[AA], x, y, z),
                    this.grad(this.perm[BA], x - 1, y, z)
                ),
                this.lerp(
                    u,
                    this.grad(this.perm[AB], x, y - 1, z),
                    this.grad(this.perm[BB], x - 1, y - 1, z)
                )
            ),
            this.lerp(
                v,
                this.lerp(
                    u,
                    this.grad(this.perm[AA + 1], x, y, z - 1),
                    this.grad(this.perm[BA + 1], x - 1, y, z - 1)
                ),
                this.lerp(
                    u,
                    this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                    this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1)
                )
            )
        );
    }

    /**
     * 生成分形柏林噪声（多个频率叠加）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} octaves - 倍频数量
     * @param {number} persistence - 持续度
     * @param {number} lacunarity - 空隙度
     * @returns {number} 返回范围在[-1,1]的噪声值
     */
    fractalPerlin2D(x, y, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.perlin2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }

    /**
     * 生成分形柏林噪声（3D版本）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} z - Z坐标
     * @param {number} octaves - 倍频数量
     * @param {number} persistence - 持续度
     * @param {number} lacunarity - 空隙度
     * @returns {number} 返回范围在[-1,1]的噪声值
     */
    fractalPerlin3D(x, y, z, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += this.perlin3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }

    /**
     * 淡入淡出函数
     * @param {number} t - 输入值
     * @returns {number} 平滑后的值
     */
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * 线性插值
     * @param {number} t - 插值因子
     * @param {number} a - 起始值
     * @param {number} b - 结束值
     * @returns {number} 插值结果
     */
    lerp(t, a, b) {
        return a + t * (b - a);
    }

    /**
     * 梯度函数
     * @param {number} hash - 哈希值
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} z - Z坐标（可选）
     * @returns {number} 梯度点积
     */
    grad(hash, x, y, z = 0) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}
