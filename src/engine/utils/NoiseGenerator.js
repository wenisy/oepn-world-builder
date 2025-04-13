/**
 * 噪声生成器 - 用于生成自然地形和结构
 * 实现了Perlin噪声和Simplex噪声算法
 */
export class NoiseGenerator {
  constructor(seed = Math.random() * 10000) {
    // 设置随机种子
    this.seed = seed;

    // 初始化置换表
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);

    // 使用种子初始化置换表
    this.initPermutationTable();

    // Simplex噪声的梯度向量
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    // Simplex噪声的常量
    this.F2 = 0.5 * (Math.sqrt(3) - 1);
    this.G2 = (3 - Math.sqrt(3)) / 6;
    this.F3 = 1 / 3;
    this.G3 = 1 / 6;
  }

  /**
   * 初始化置换表
   */
  initPermutationTable() {
    // 使用线性同余法生成伪随机数
    const lcg = (a) => (a * 1664525 + 1013904223) % 4294967296;

    // 初始化基础置换表
    let seed = Math.floor(this.seed);
    for (let i = 0; i < 256; i++) {
      seed = lcg(seed);
      this.perm[i] = seed % 256;
    }

    // 复制到后半部分
    for (let i = 0; i < 256; i++) {
      this.perm[i + 256] = this.perm[i];
      this.permMod12[i] = this.perm[i] % 12;
      this.permMod12[i + 256] = this.permMod12[i];
    }
  }

  /**
   * 生成2D Perlin噪声
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 噪声值 (-1 到 1)
   */
  perlin2D(x, y) {
    // 确定单元格坐标
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    // 计算单元格内的相对坐标
    x -= Math.floor(x);
    y -= Math.floor(y);

    // 计算淡化曲线
    const u = this.fade(x);
    const v = this.fade(y);

    // 计算哈希值
    const A = this.perm[X] + Y;
    const AA = this.perm[A];
    const AB = this.perm[A + 1];
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B];
    const BB = this.perm[B + 1];

    // 计算梯度贡献
    const g1 = this.grad(this.perm[AA], x, y, 0);
    const g2 = this.grad(this.perm[BA], x - 1, y, 0);
    const g3 = this.grad(this.perm[AB], x, y - 1, 0);
    const g4 = this.grad(this.perm[BB], x - 1, y - 1, 0);

    // 插值并返回结果
    return this.lerp(
      this.lerp(g1, g2, u),
      this.lerp(g3, g4, u),
      v
    );
  }

  /**
   * 生成3D Perlin噪声
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标
   * @returns {number} 噪声值 (-1 到 1)
   */
  perlin3D(x, y, z) {
    // 确定单元格坐标
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    // 计算单元格内的相对坐标
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    // 计算淡化曲线
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    // 计算哈希值
    const A = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;

    // 计算梯度贡献
    const g1 = this.grad(this.perm[AA], x, y, z);
    const g2 = this.grad(this.perm[BA], x - 1, y, z);
    const g3 = this.grad(this.perm[AB], x, y - 1, z);
    const g4 = this.grad(this.perm[BB], x - 1, y - 1, z);
    const g5 = this.grad(this.perm[AA + 1], x, y, z - 1);
    const g6 = this.grad(this.perm[BA + 1], x - 1, y, z - 1);
    const g7 = this.grad(this.perm[AB + 1], x, y - 1, z - 1);
    const g8 = this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1);

    // 插值并返回结果
    return this.lerp(
      this.lerp(
        this.lerp(g1, g2, u),
        this.lerp(g3, g4, u),
        v
      ),
      this.lerp(
        this.lerp(g5, g6, u),
        this.lerp(g7, g8, u),
        v
      ),
      w
    );
  }

  /**
   * 生成2D Simplex噪声
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @returns {number} 噪声值 (-1 到 1)
   */
  simplex2D(x, y) {
    // 噪声贡献
    let n0, n1, n2;

    // 将输入坐标偏移到斜坐标系
    const s = (x + y) * this.F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    // 计算单元格原点的偏移
    const t = (i + j) * this.G2;
    const X0 = i - t;
    const Y0 = j - t;

    // 计算相对于单元格原点的坐标
    const x0 = x - X0;
    const y0 = y - Y0;

    // 确定单元格中的三角形
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    // 计算三角形顶点的坐标
    const x1 = x0 - i1 + this.G2;
    const y1 = y0 - j1 + this.G2;
    const x2 = x0 - 1 + 2 * this.G2;
    const y2 = y0 - 1 + 2 * this.G2;

    // 计算哈希值
    const ii = i & 255;
    const jj = j & 255;

    // 计算梯度贡献
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj]];
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    // 缩放到[-1,1]范围
    return 70 * (n0 + n1 + n2);
  }

  /**
   * 生成3D Simplex噪声
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标
   * @returns {number} 噪声值 (-1 到 1)
   */
  simplex3D(x, y, z) {
    // 噪声贡献
    let n0, n1, n2, n3;

    // 将输入坐标偏移到斜坐标系
    const s = (x + y + z) * this.F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);

    // 计算单元格原点的偏移
    const t = (i + j + k) * this.G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;

    // 计算相对于单元格原点的坐标
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;

    // 确定单元格中的四面体
    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0;
        i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1;
        i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0;
        i2 = 1; j2 = 1; k2 = 0;
      }
    }

    // 计算四面体顶点的坐标
    const x1 = x0 - i1 + this.G3;
    const y1 = y0 - j1 + this.G3;
    const z1 = z0 - k1 + this.G3;

    const x2 = x0 - i2 + 2 * this.G3;
    const y2 = y0 - j2 + 2 * this.G3;
    const z2 = z0 - k2 + 2 * this.G3;

    const x3 = x0 - 1 + 3 * this.G3;
    const y3 = y0 - 1 + 3 * this.G3;
    const z3 = z0 - 1 + 3 * this.G3;

    // 计算哈希值
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    // 计算梯度贡献
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
      n3 = 0;
    } else {
      t3 *= t3;
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
      n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
    }

    // 缩放到[-1,1]范围
    return 32 * (n0 + n1 + n2 + n3);
  }

  /**
   * 生成分形布朗运动（FBM）噪声
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标
   * @param {number} octaves - 倍频数
   * @param {number} persistence - 持续度
   * @param {number} lacunarity - 空隙度
   * @param {Function} noiseFunc - 噪声函数
   * @returns {number} 噪声值 (-1 到 1)
   */
  fbm(x, y, z = 0, octaves = 6, persistence = 0.5, lacunarity = 2.0, noiseFunc = this.simplex3D.bind(this)) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    // 累加不同频率的噪声
    for (let i = 0; i < octaves; i++) {
      total += noiseFunc(x * frequency, y * frequency, z * frequency) * amplitude;

      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    // 归一化到[-1,1]范围
    return total / maxValue;
  }

  /**
   * 生成地形高度图
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @param {Object} options - 地形选项
   * @returns {number} 高度值
   */
  generateTerrainHeight(x, z, options = {}) {
    // 默认选项
    const {
      scale = 100,
      heightScale = 64,
      baseHeight = 64,
      octaves = 6,
      persistence = 0.5,
      lacunarity = 2.0,
      biomeScale = 200
    } = options;

    // 生成基础地形
    const nx = x / scale;
    const nz = z / scale;
    const baseNoise = this.fbm(nx, nz, 0, octaves, persistence, lacunarity);

    // 生成生物群系噪声
    const biomeNoise = this.simplex2D(x / biomeScale, z / biomeScale);

    // 根据生物群系调整地形
    let height = baseHeight;

    // 平原
    if (biomeNoise < -0.4) {
      height += baseNoise * heightScale * 0.3;
    }
    // 丘陵
    else if (biomeNoise < 0) {
      height += baseNoise * heightScale * 0.7;
    }
    // 山地
    else if (biomeNoise < 0.4) {
      height += baseNoise * heightScale * 1.2;
    }
    // 高山
    else {
      height += baseNoise * heightScale * 1.8;

      // 添加尖峰
      const mountainNoise = this.simplex2D(nx * 2, nz * 2);
      if (mountainNoise > 0.7) {
        height += mountainNoise * heightScale * 0.5;
      }
    }

    return Math.floor(height);
  }

  /**
   * 计算梯度点积
   * @param {number} hash - 哈希值
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标
   * @returns {number} 点积结果
   */
  grad(hash, x, y, z) {
    // 将哈希值转换为0-11之间的索引
    const h = hash & 15;

    // 选择梯度向量
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);

    // 计算点积
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  /**
   * 计算点积
   * @param {Array} g - 梯度向量
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标
   * @returns {number} 点积结果
   */
  dot(g, x, y, z = 0) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  /**
   * 淡化函数
   * @param {number} t - 输入值
   * @returns {number} 淡化后的值
   */
  fade(t) {
    // 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * 线性插值
   * @param {number} a - 第一个值
   * @param {number} b - 第二个值
   * @param {number} t - 插值因子
   * @returns {number} 插值结果
   */
  lerp(a, b, t) {
    return a + t * (b - a);
  }
}
