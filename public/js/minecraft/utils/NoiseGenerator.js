/**
 * 噪声生成器类 - 用于生成地形噪声
 */
export class NoiseGenerator {
  constructor(seed = Math.random()) {
    this.seed = seed;
  }
  
  /**
   * 生成柏林噪声
   */
  perlin2D(x, y) {
    // 简化的柏林噪声实现
    // 实际游戏中应该使用更高质量的噪声函数
    
    // 使用简单的正弦函数模拟噪声
    const value = Math.sin(x * 0.1 + this.seed) * Math.cos(y * 0.1 + this.seed);
    
    // 将值映射到 0-1 范围
    return (value + 1) * 0.5;
  }
  
  /**
   * 生成多重八度柏林噪声
   */
  perlin2DOctaves(x, y, octaves = 4, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += this.perlin2D(x * frequency, y * frequency) * amplitude;
      
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    // 归一化
    return total / maxValue;
  }
  
  /**
   * 生成地形高度
   */
  generateHeight(x, z, baseHeight = 64, amplitude = 20) {
    // 使用多重八度柏林噪声生成地形高度
    const noise = this.perlin2DOctaves(x, z, 6, 0.5);
    
    // 将噪声值映射到高度范围
    return Math.floor(baseHeight + noise * amplitude);
  }
  
  /**
   * 生成生物群系
   */
  generateBiome(x, z) {
    // 使用不同频率的噪声生成生物群系
    const temperature = this.perlin2DOctaves(x * 0.05, z * 0.05, 2, 0.5);
    const humidity = this.perlin2DOctaves(x * 0.05 + 1000, z * 0.05 + 1000, 2, 0.5);
    
    // 根据温度和湿度确定生物群系
    if (temperature < 0.3) {
      if (humidity < 0.3) return 'desert';
      return 'plains';
    } else if (temperature < 0.6) {
      if (humidity < 0.3) return 'savanna';
      if (humidity < 0.6) return 'forest';
      return 'swamp';
    } else {
      if (humidity < 0.3) return 'badlands';
      if (humidity < 0.6) return 'jungle';
      return 'rainforest';
    }
  }
  
  /**
   * 生成洞穴
   */
  generateCave(x, y, z) {
    // 使用3D噪声生成洞穴
    const noise = this.perlin3D(x * 0.1, y * 0.1, z * 0.1);
    
    // 如果噪声值大于阈值，则为洞穴
    return noise > 0.7;
  }
  
  /**
   * 生成3D柏林噪声
   */
  perlin3D(x, y, z) {
    // 简化的3D柏林噪声实现
    // 实际游戏中应该使用更高质量的噪声函数
    
    // 使用简单的正弦函数模拟噪声
    const value = Math.sin(x * 0.1 + this.seed) * 
                  Math.cos(y * 0.1 + this.seed) * 
                  Math.sin(z * 0.1 + this.seed);
    
    // 将值映射到 0-1 范围
    return (value + 1) * 0.5;
  }
}
