const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * 存档管理类
 * 用于管理多个世界存档
 */
class SaveManager {
  constructor() {
    // 存档目录
    this.savesDir = path.join(__dirname, 'data', 'saves');
    
    // 确保存档目录存在
    if (!fs.existsSync(this.savesDir)) {
      fs.mkdirSync(this.savesDir, { recursive: true });
    }
    
    // 存档元数据
    this.savesMeta = {
      saves: []
    };
    
    // 加载存档元数据
    this.loadSavesMeta();
  }
  
  /**
   * 加载存档元数据
   */
  loadSavesMeta() {
    const metaPath = path.join(this.savesDir, 'saves-meta.json');
    
    if (fs.existsSync(metaPath)) {
      try {
        const data = fs.readFileSync(metaPath, 'utf8');
        this.savesMeta = JSON.parse(data);
        console.log('存档元数据加载成功');
      } catch (error) {
        console.error('加载存档元数据失败:', error);
        this.savesMeta = { saves: [] };
      }
    } else {
      // 创建默认存档元数据
      this.savesMeta = {
        saves: []
      };
      this.saveSavesMeta();
    }
  }
  
  /**
   * 保存存档元数据
   */
  saveSavesMeta() {
    const metaPath = path.join(this.savesDir, 'saves-meta.json');
    
    try {
      fs.writeFileSync(metaPath, JSON.stringify(this.savesMeta, null, 2), 'utf8');
      console.log('存档元数据保存成功');
    } catch (error) {
      console.error('保存存档元数据失败:', error);
    }
  }
  
  /**
   * 获取所有存档
   * @returns {Array} 存档列表
   */
  getSaves() {
    return this.savesMeta.saves;
  }
  
  /**
   * 创建新存档
   * @param {string} name - 存档名称
   * @param {string} description - 存档描述
   * @param {Object} worldParams - 世界参数
   * @returns {Object} 新存档
   */
  createSave(name, description, worldParams = {}) {
    // 生成存档ID
    const saveId = uuidv4();
    
    // 创建存档目录
    const saveDir = path.join(this.savesDir, saveId);
    fs.mkdirSync(saveDir, { recursive: true });
    
    // 创建存档元数据
    const save = {
      id: saveId,
      name,
      description,
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
      worldParams: {
        seed: worldParams.seed || Math.floor(Math.random() * 1000000),
        size: worldParams.size || 1000,
        maxHeight: worldParams.maxHeight || 100,
        initialEnvironment: worldParams.initialEnvironment || 'stoneForest'
      }
    };
    
    // 添加到存档列表
    this.savesMeta.saves.push(save);
    
    // 保存存档元数据
    this.saveSavesMeta();
    
    // 创建初始世界数据
    this.createInitialWorldData(saveId, save.worldParams);
    
    return save;
  }
  
  /**
   * 创建初始世界数据
   * @param {string} saveId - 存档ID
   * @param {Object} worldParams - 世界参数
   */
  createInitialWorldData(saveId, worldParams) {
    // 创建世界数据
    const worldData = {
      buildings: [],
      resources: [],
      terrain: worldParams,
      nations: [],
      alliances: []
    };
    
    // 添加一些初始资源
    this.createInitialResources(worldData);
    
    // 保存世界数据
    const worldDataPath = path.join(this.savesDir, saveId, 'world.json');
    fs.writeFileSync(worldDataPath, JSON.stringify(worldData, null, 2), 'utf8');
  }
  
  /**
   * 创建初始资源
   * @param {Object} worldData - 世界数据
   */
  createInitialResources(worldData) {
    // 添加一些随机资源
    const resourceTypes = ['wood', 'stone', 'iron', 'gold'];
    const resourceCount = 100;
    
    for (let i = 0; i < resourceCount; i++) {
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const x = Math.random() * worldData.terrain.size - worldData.terrain.size / 2;
      const z = Math.random() * worldData.terrain.size - worldData.terrain.size / 2;
      const y = 0; // 假设在地面上
      
      worldData.resources.push({
        id: uuidv4(),
        type,
        position: { x, y, z },
        amount: 50 + Math.floor(Math.random() * 50)
      });
    }
  }
  
  /**
   * 加载存档
   * @param {string} saveId - 存档ID
   * @returns {Object} 世界数据
   */
  loadSave(saveId) {
    // 查找存档
    const save = this.savesMeta.saves.find(s => s.id === saveId);
    
    if (!save) {
      console.error('存档不存在:', saveId);
      return null;
    }
    
    // 更新最后游玩时间
    save.lastPlayedAt = Date.now();
    this.saveSavesMeta();
    
    // 加载世界数据
    const worldDataPath = path.join(this.savesDir, saveId, 'world.json');
    
    try {
      const data = fs.readFileSync(worldDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('加载世界数据失败:', error);
      return null;
    }
  }
  
  /**
   * 保存世界数据
   * @param {string} saveId - 存档ID
   * @param {Object} worldData - 世界数据
   * @returns {boolean} 是否保存成功
   */
  saveWorldData(saveId, worldData) {
    // 查找存档
    const save = this.savesMeta.saves.find(s => s.id === saveId);
    
    if (!save) {
      console.error('存档不存在:', saveId);
      return false;
    }
    
    // 更新最后游玩时间
    save.lastPlayedAt = Date.now();
    this.saveSavesMeta();
    
    // 保存世界数据
    const worldDataPath = path.join(this.savesDir, saveId, 'world.json');
    
    try {
      fs.writeFileSync(worldDataPath, JSON.stringify(worldData, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('保存世界数据失败:', error);
      return false;
    }
  }
  
  /**
   * 删除存档
   * @param {string} saveId - 存档ID
   * @returns {boolean} 是否删除成功
   */
  deleteSave(saveId) {
    // 查找存档索引
    const index = this.savesMeta.saves.findIndex(s => s.id === saveId);
    
    if (index === -1) {
      console.error('存档不存在:', saveId);
      return false;
    }
    
    // 移除存档
    this.savesMeta.saves.splice(index, 1);
    
    // 保存存档元数据
    this.saveSavesMeta();
    
    // 删除存档目录
    const saveDir = path.join(this.savesDir, saveId);
    
    try {
      fs.rmSync(saveDir, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error('删除存档目录失败:', error);
      return false;
    }
  }
}

module.exports = SaveManager;
