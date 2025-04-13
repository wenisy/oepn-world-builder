/**
 * 简化版的Simplex噪声实现
 * 基于Stefan Gustavson的实现
 */
export class SimplexNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    
    // 初始化置换表
    this.p = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(this.random() * 256);
    }
    
    // 扩展置换表以避免索引溢出
    this.perm = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }
  
  /**
   * 基于种子的随机数生成器
   * @returns {number} 0到1之间的随机数
   */
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  /**
   * 2D Simplex噪声
   * @param {number} xin - X坐标
   * @param {number} yin - Y坐标
   * @returns {number} -1到1之间的噪声值
   */
  noise2D(xin, yin) {
    // 噪声常量
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    // 偏移坐标
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    
    // 计算单形偏移
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    
    // 确定单形中的点
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    
    // 计算相对坐标
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    // 计算贡献
    const n0 = this.calculateCornerContribution(i, j, x0, y0);
    const n1 = this.calculateCornerContribution(i + i1, j + j1, x1, y1);
    const n2 = this.calculateCornerContribution(i + 1, j + 1, x2, y2);
    
    // 缩放到[-1, 1]范围
    return 70 * (n0 + n1 + n2);
  }
  
  /**
   * 3D Simplex噪声
   * @param {number} xin - X坐标
   * @param {number} yin - Y坐标
   * @param {number} zin - Z坐标
   * @returns {number} -1到1之间的噪声值
   */
  noise3D(xin, yin, zin) {
    // 噪声常量
    const F3 = 1 / 3;
    const G3 = 1 / 6;
    
    // 偏移坐标
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    
    // 计算单形偏移
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;
    
    // 确定单形中的点
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
    
    // 计算相对坐标
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    
    // 计算贡献
    const n0 = this.calculate3DCornerContribution(i, j, k, x0, y0, z0);
    const n1 = this.calculate3DCornerContribution(i + i1, j + j1, k + k1, x1, y1, z1);
    const n2 = this.calculate3DCornerContribution(i + i2, j + j2, k + k2, x2, y2, z2);
    const n3 = this.calculate3DCornerContribution(i + 1, j + 1, k + 1, x3, y3, z3);
    
    // 缩放到[-1, 1]范围
    return 32 * (n0 + n1 + n2 + n3);
  }
  
  /**
   * 计算2D角点贡献
   * @param {number} i - 网格X坐标
   * @param {number} j - 网格Y坐标
   * @param {number} x - 相对X坐标
   * @param {number} y - 相对Y坐标
   * @returns {number} 角点贡献
   */
  calculateCornerContribution(i, j, x, y) {
    // 计算衰减因子
    const t = 0.5 - x * x - y * y;
    
    if (t < 0) {
      return 0;
    }
    
    // 获取梯度
    const gi = this.perm[(i + this.perm[j & 255]) & 255] % 12;
    const grad = this.grad3[gi];
    
    // 计算贡献
    return t * t * t * t * (grad[0] * x + grad[1] * y);
  }
  
  /**
   * 计算3D角点贡献
   * @param {number} i - 网格X坐标
   * @param {number} j - 网格Y坐标
   * @param {number} k - 网格Z坐标
   * @param {number} x - 相对X坐标
   * @param {number} y - 相对Y坐标
   * @param {number} z - 相对Z坐标
   * @returns {number} 角点贡献
   */
  calculate3DCornerContribution(i, j, k, x, y, z) {
    // 计算衰减因子
    const t = 0.6 - x * x - y * y - z * z;
    
    if (t < 0) {
      return 0;
    }
    
    // 获取梯度
    const gi = this.perm[(i + this.perm[(j + this.perm[k & 255]) & 255]) & 255] % 12;
    const grad = this.grad3[gi];
    
    // 计算贡献
    return t * t * t * t * (grad[0] * x + grad[1] * y + grad[2] * z);
  }
}
