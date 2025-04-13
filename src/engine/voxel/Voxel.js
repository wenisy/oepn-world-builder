/**
 * 体素（方块）类
 * 表示世界中的单个方块
 */
export class Voxel {
  /**
   * 创建一个新的体素
   * @param {number} type - 体素类型ID
   * @param {Object} properties - 体素属性
   */
  constructor(type = 0, properties = {}) {
    this.type = type; // 0 表示空气，其他值表示不同类型的方块
    this.properties = properties; // 可以存储亮度、液体等额外属性
  }

  /**
   * 检查体素是否为空气
   * @returns {boolean} 如果体素是空气则返回true
   */
  isEmpty() {
    return this.type === 0;
  }

  /**
   * 检查体素是否为固体
   * @returns {boolean} 如果体素是固体则返回true
   */
  isSolid() {
    return this.type !== 0;
  }

  /**
   * 检查体素是否为透明
   * @returns {boolean} 如果体素是透明的则返回true
   */
  isTransparent() {
    // 可以根据类型判断是否透明
    // 例如：水、玻璃等是透明的
    return this.properties.transparent === true;
  }

  /**
   * 获取体素的类型
   * @returns {number} 体素类型ID
   */
  getType() {
    return this.type;
  }

  /**
   * 设置体素的类型
   * @param {number} type - 新的体素类型ID
   */
  setType(type) {
    this.type = type;
  }

  /**
   * 获取体素的属性
   * @param {string} key - 属性名
   * @param {*} defaultValue - 如果属性不存在，返回的默认值
   * @returns {*} 属性值
   */
  getProperty(key, defaultValue = null) {
    return this.properties[key] !== undefined ? this.properties[key] : defaultValue;
  }

  /**
   * 设置体素的属性
   * @param {string} key - 属性名
   * @param {*} value - 属性值
   */
  setProperty(key, value) {
    this.properties[key] = value;
  }
}
