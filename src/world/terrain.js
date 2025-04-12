import * as THREE from 'three';
import SimplexNoise from 'https://cdn.skypack.dev/simplex-noise@2.4.0';

/**
 * 创建地形系统
 * @param {THREE.Scene} scene - Three.js场景对象
 * @param {Object} worldParams - 世界参数
 * @returns {Object} 地形系统对象
 */
export function createTerrain(scene, worldParams) {
  // 初始化噪声生成器
  const simplex = new SimplexNoise(worldParams.seed.toString());
  
  // 地形材质
  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1
  });
  
  // 地形高度图
  const heightMap = new Map();
  
  /**
   * 生成区块
   * @param {number} chunkX - 区块X坐标
   * @param {number} chunkZ - 区块Z坐标
   * @returns {Object} 区块对象
   */
  function generateChunk(chunkX, chunkZ) {
    const chunkSize = worldParams.chunkSize;
    const resolution = 1; // 每单位的顶点数
    const verticesPerSide = chunkSize * resolution + 1;
    
    // 创建平面几何体
    const geometry = new THREE.PlaneGeometry(
      chunkSize,
      chunkSize,
      verticesPerSide - 1,
      verticesPerSide - 1
    );
    
    // 旋转几何体使其水平放置
    geometry.rotateX(-Math.PI / 2);
    
    // 获取顶点位置数组
    const positions = geometry.attributes.position.array;
    
    // 创建颜色数组
    const colors = new Float32Array(positions.length);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 计算每个顶点的世界坐标
    const worldX = chunkX * chunkSize;
    const worldZ = chunkZ * chunkSize;
    
    // 应用噪声生成高度图并设置颜色
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] + worldX;
      const z = positions[i + 2] + worldZ;
      
      // 计算高度
      const height = getNoiseHeight(x, z);
      positions[i + 1] = height;
      
      // 存储高度到高度图
      const key = `${Math.floor(x)},${Math.floor(z)}`;
      heightMap.set(key, height);
      
      // 设置颜色
      const colorIndex = i;
      if (height < 0) {
        // 水
        colors[colorIndex] = 0.0;
        colors[colorIndex + 1] = 0.3;
        colors[colorIndex + 2] = 0.8;
      } else if (height < 1) {
        // 沙滩
        colors[colorIndex] = 0.95;
        colors[colorIndex + 1] = 0.85;
        colors[colorIndex + 2] = 0.6;
      } else if (height < 15) {
        // 草地
        const greenIntensity = 0.6 + Math.random() * 0.2;
        colors[colorIndex] = 0.2;
        colors[colorIndex + 1] = greenIntensity;
        colors[colorIndex + 2] = 0.1;
      } else if (height < 30) {
        // 森林
        colors[colorIndex] = 0.1;
        colors[colorIndex + 1] = 0.4;
        colors[colorIndex + 2] = 0.1;
      } else if (height < 60) {
        // 山地
        colors[colorIndex] = 0.5;
        colors[colorIndex + 1] = 0.4;
        colors[colorIndex + 2] = 0.3;
      } else {
        // 雪山
        const snowIntensity = Math.min(1.0, (height - 60) / 20 + 0.5);
        colors[colorIndex] = snowIntensity;
        colors[colorIndex + 1] = snowIntensity;
        colors[colorIndex + 2] = snowIntensity;
      }
    }
    
    // 更新几何体
    geometry.computeVertexNormals();
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, terrainMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(worldX, 0, worldZ);
    
    // 添加到场景
    scene.add(mesh);
    
    // 返回区块对象
    return {
      mesh,
      position: { x: chunkX, z: chunkZ },
      worldPosition: { x: worldX, z: worldZ }
    };
  }
  
  /**
   * 使用噪声函数计算高度
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @returns {number} 高度值
   */
  function getNoiseHeight(x, z) {
    // 缩放坐标以获得更平滑的地形
    const scale1 = 0.01;
    const scale2 = 0.05;
    const scale3 = 0.2;
    
    // 多层噪声
    const noise1 = simplex.noise2D(x * scale1, z * scale1);
    const noise2 = simplex.noise2D(x * scale2, z * scale2) * 0.5;
    const noise3 = simplex.noise2D(x * scale3, z * scale3) * 0.25;
    
    // 组合噪声
    let combinedNoise = (noise1 + noise2 + noise3);
    
    // 应用指数函数使山脉更陡峭
    if (combinedNoise > 0) {
      combinedNoise = Math.pow(combinedNoise, 1.5);
    }
    
    // 缩放到所需高度范围
    return combinedNoise * worldParams.maxHeight;
  }
  
  /**
   * 获取指定位置的高度
   * @param {number} x - X坐标
   * @param {number} z - Z坐标
   * @returns {number} 高度值
   */
  function getHeightAt(x, z) {
    // 尝试从高度图获取
    const key = `${Math.floor(x)},${Math.floor(z)}`;
    if (heightMap.has(key)) {
      return heightMap.get(key);
    }
    
    // 如果高度图中没有，计算高度
    const height = getNoiseHeight(x, z);
    
    // 存储到高度图
    heightMap.set(key, height);
    
    return height;
  }
  
  // 返回地形系统对象
  return {
    generateChunk,
    getHeightAt,
    getNoiseHeight
  };
}
