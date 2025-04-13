/**
 * 方块类 - 表示世界中的单个方块
 */
export class Block {
  constructor(blockRegistry, textureManager, blockId, x, y, z) {
    this.blockRegistry = blockRegistry;
    this.textureManager = textureManager;
    this.id = blockId;
    this.x = x;
    this.y = y;
    this.z = z;
    
    // 获取方块数据
    this.data = blockRegistry.getBlock(blockId);
    
    // 创建方块网格
    this.mesh = this.createMesh();
  }
  
  /**
   * 创建方块网格
   */
  createMesh() {
    // 如果方块不可见，返回null
    if (this.data.visible === false) return null;
    
    // 创建几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    
    // 创建材质
    let material;
    const texture = this.textureManager.getBlockTexture(this.id);
    
    if (texture) {
      material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: this.data.transparent || false
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: this.data.color || 0xFFFFFF,
        transparent: this.data.transparent || false
      });
    }
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(this.x, this.y, this.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // 添加用户数据
    mesh.userData = {
      isBlock: true,
      blockId: this.id,
      blockX: this.x,
      blockY: this.y,
      blockZ: this.z
    };
    
    return mesh;
  }
  
  /**
   * 获取方块硬度
   */
  getHardness() {
    return this.data.hardness || 1.0;
  }
  
  /**
   * 检查方块是否为固体
   */
  isSolid() {
    return this.data.solid !== false;
  }
  
  /**
   * 检查方块是否透明
   */
  isTransparent() {
    return this.data.transparent === true;
  }
  
  /**
   * 获取方块伤害值
   */
  getDamage() {
    return this.data.damage || 0;
  }
}
