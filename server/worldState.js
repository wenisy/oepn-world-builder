const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * 世界状态管理类
 */
class WorldState {
  constructor() {
    // 世界数据
    this.data = {
      buildings: [],
      resources: [],
      terrain: {},
      nations: [],
      alliances: []
    };
    
    // 加载世界状态
    this.load();
  }
  
  /**
   * 加载世界状态
   */
  load() {
    try {
      // 检查世界数据文件是否存在
      const dataPath = path.join(__dirname, 'data', 'world.json');
      
      if (fs.existsSync(dataPath)) {
        // 读取世界数据
        const data = fs.readFileSync(dataPath, 'utf8');
        this.data = JSON.parse(data);
        console.log('世界数据加载成功');
      } else {
        // 创建初始世界
        this.createInitialWorld();
        console.log('创建初始世界');
      }
    } catch (error) {
      console.error('加载世界数据失败:', error);
      // 创建初始世界
      this.createInitialWorld();
    }
  }
  
  /**
   * 保存世界状态
   */
  save() {
    try {
      // 确保数据目录存在
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // 保存世界数据
      const dataPath = path.join(dataDir, 'world.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2), 'utf8');
      console.log('世界数据保存成功');
    } catch (error) {
      console.error('保存世界数据失败:', error);
    }
  }
  
  /**
   * 创建初始世界
   */
  createInitialWorld() {
    // 重置世界数据
    this.data = {
      buildings: [],
      resources: [],
      terrain: {
        seed: Math.floor(Math.random() * 1000000),
        size: 1000,
        maxHeight: 100
      },
      nations: [],
      alliances: []
    };
    
    // 添加一些初始资源
    this.createInitialResources();
    
    // 保存世界数据
    this.save();
  }
  
  /**
   * 创建初始资源
   */
  createInitialResources() {
    // 添加一些随机资源
    const resourceTypes = ['wood', 'stone', 'iron', 'gold'];
    const resourceCount = 100;
    
    for (let i = 0; i < resourceCount; i++) {
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const x = Math.random() * this.data.terrain.size - this.data.terrain.size / 2;
      const z = Math.random() * this.data.terrain.size - this.data.terrain.size / 2;
      const y = 0; // 假设在地面上
      
      this.data.resources.push({
        id: uuidv4(),
        type,
        position: { x, y, z },
        amount: 50 + Math.floor(Math.random() * 50)
      });
    }
  }
  
  /**
   * 获取世界状态
   * @returns {Object} 世界状态
   */
  getState() {
    return {
      terrain: this.data.terrain,
      buildings: this.data.buildings,
      resources: this.data.resources
    };
  }
  
  /**
   * 检查是否可以在指定位置建造
   * @param {Object} position - 位置
   * @param {string} type - 建筑类型
   * @returns {boolean} 是否可以建造
   */
  canBuild(position, type) {
    // 检查是否与其他建筑重叠
    for (const building of this.data.buildings) {
      const distance = Math.sqrt(
        Math.pow(building.position.x - position.x, 2) +
        Math.pow(building.position.z - position.z, 2)
      );
      
      // 如果距离小于5，认为重叠
      if (distance < 5) {
        return false;
      }
    }
    
    // TODO: 检查地形是否适合建造
    
    return true;
  }
  
  /**
   * 创建建筑
   * @param {string} type - 建筑类型
   * @param {Object} position - 位置
   * @param {Object} rotation - 旋转
   * @param {string} ownerId - 所有者ID
   * @returns {Object} 建筑对象
   */
  createBuilding(type, position, rotation, ownerId) {
    // 创建建筑对象
    const building = {
      id: uuidv4(),
      type,
      position,
      rotation,
      ownerId,
      health: 100,
      createdAt: Date.now()
    };
    
    // 添加到建筑列表
    this.data.buildings.push(building);
    
    return building;
  }
  
  /**
   * 检查是否可以销毁建筑
   * @param {string} buildingId - 建筑ID
   * @param {string} playerId - 玩家ID
   * @returns {boolean} 是否可以销毁
   */
  canDestroyBuilding(buildingId, playerId) {
    // 查找建筑
    const building = this.data.buildings.find(b => b.id === buildingId);
    
    // 如果建筑不存在，返回false
    if (!building) {
      return false;
    }
    
    // 检查是否是建筑所有者
    return building.ownerId === playerId;
  }
  
  /**
   * 销毁建筑
   * @param {string} buildingId - 建筑ID
   * @returns {Object} 被销毁的建筑
   */
  destroyBuilding(buildingId) {
    // 查找建筑索引
    const index = this.data.buildings.findIndex(b => b.id === buildingId);
    
    // 如果建筑不存在，返回null
    if (index === -1) {
      return null;
    }
    
    // 移除建筑
    const building = this.data.buildings.splice(index, 1)[0];
    
    return building;
  }
  
  /**
   * 创建国家
   * @param {string} name - 国家名称
   * @param {string} description - 国家描述
   * @param {string} founderId - 创建者ID
   * @returns {Object} 国家对象
   */
  createNation(name, description, founderId) {
    // 创建国家对象
    const nation = {
      id: uuidv4(),
      name,
      description,
      founderId,
      members: [founderId],
      createdAt: Date.now(),
      level: 1,
      resources: {
        wood: 0,
        stone: 0,
        iron: 0,
        gold: 0
      }
    };
    
    // 添加到国家列表
    this.data.nations.push(nation);
    
    return nation;
  }
  
  /**
   * 创建联盟
   * @param {string} name - 联盟名称
   * @param {string} description - 联盟描述
   * @param {string} founderId - 创建者ID
   * @returns {Object} 联盟对象
   */
  createAlliance(name, description, founderId) {
    // 创建联盟对象
    const alliance = {
      id: uuidv4(),
      name,
      description,
      founderId,
      nations: [],
      createdAt: Date.now()
    };
    
    // 添加到联盟列表
    this.data.alliances.push(alliance);
    
    return alliance;
  }
}

module.exports = WorldState;
