/**
 * 玩家管理类
 */
class PlayerManager {
  constructor() {
    // 玩家列表
    this.players = new Map();
  }
  
  /**
   * 创建玩家
   * @param {Object} playerData - 玩家数据
   * @returns {Object} 玩家对象
   */
  createPlayer(playerData) {
    // 创建玩家对象
    const player = {
      id: playerData.id,
      socketId: playerData.socketId,
      name: playerData.name,
      position: playerData.position || { x: 0, y: 0, z: 0 },
      rotation: playerData.rotation || { x: 0, y: 0, z: 0 },
      resources: playerData.resources || {
        wood: 100,
        stone: 50,
        iron: 20,
        gold: 10
      },
      inventory: playerData.inventory || [],
      nationId: playerData.nationId || null,
      online: true,
      lastSeen: Date.now(),
      createdAt: Date.now()
    };
    
    // 添加到玩家列表
    this.players.set(player.id, player);
    
    return player;
  }
  
  /**
   * 获取玩家
   * @param {string} playerId - 玩家ID
   * @returns {Object} 玩家对象
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }
  
  /**
   * 获取所有玩家
   * @returns {Array} 玩家数组
   */
  getPlayers() {
    return Array.from(this.players.values());
  }
  
  /**
   * 获取在线玩家
   * @returns {Array} 在线玩家数组
   */
  getOnlinePlayers() {
    return Array.from(this.players.values()).filter(player => player.online);
  }
  
  /**
   * 更新玩家
   * @param {string} playerId - 玩家ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的玩家对象
   */
  updatePlayer(playerId, updates) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回null
    if (!player) {
      return null;
    }
    
    // 更新玩家数据
    Object.assign(player, updates);
    
    // 更新最后活动时间
    player.lastSeen = Date.now();
    
    return player;
  }
  
  /**
   * 移除玩家
   * @param {string} playerId - 玩家ID
   * @returns {boolean} 是否成功移除
   */
  removePlayer(playerId) {
    return this.players.delete(playerId);
  }
  
  /**
   * 获取附近的玩家
   * @param {string} playerId - 玩家ID
   * @param {number} radius - 半径
   * @returns {Array} 附近的玩家数组
   */
  getNearbyPlayers(playerId, radius) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回空数组
    if (!player) {
      return [];
    }
    
    // 获取所有在线玩家
    const onlinePlayers = this.getOnlinePlayers();
    
    // 过滤出附近的玩家
    return onlinePlayers.filter(otherPlayer => {
      // 排除自己
      if (otherPlayer.id === playerId) {
        return false;
      }
      
      // 计算距离
      const distance = Math.sqrt(
        Math.pow(otherPlayer.position.x - player.position.x, 2) +
        Math.pow(otherPlayer.position.y - player.position.y, 2) +
        Math.pow(otherPlayer.position.z - player.position.z, 2)
      );
      
      // 如果距离小于半径，返回true
      return distance < radius;
    });
  }
  
  /**
   * 添加资源
   * @param {string} playerId - 玩家ID
   * @param {string} resourceType - 资源类型
   * @param {number} amount - 数量
   * @returns {boolean} 是否成功添加
   */
  addResource(playerId, resourceType, amount) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回false
    if (!player) {
      return false;
    }
    
    // 如果资源不存在，初始化为0
    if (!player.resources[resourceType]) {
      player.resources[resourceType] = 0;
    }
    
    // 添加资源
    player.resources[resourceType] += amount;
    
    return true;
  }
  
  /**
   * 移除资源
   * @param {string} playerId - 玩家ID
   * @param {string} resourceType - 资源类型
   * @param {number} amount - 数量
   * @returns {boolean} 是否成功移除
   */
  removeResource(playerId, resourceType, amount) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回false
    if (!player) {
      return false;
    }
    
    // 如果资源不存在或不足，返回false
    if (!player.resources[resourceType] || player.resources[resourceType] < amount) {
      return false;
    }
    
    // 移除资源
    player.resources[resourceType] -= amount;
    
    return true;
  }
  
  /**
   * 检查资源是否足够
   * @param {string} playerId - 玩家ID
   * @param {Object} requiredResources - 所需资源
   * @returns {boolean} 资源是否足够
   */
  hasEnoughResources(playerId, requiredResources) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回false
    if (!player) {
      return false;
    }
    
    // 检查每种资源是否足够
    for (const [resourceType, amount] of Object.entries(requiredResources)) {
      if (!player.resources[resourceType] || player.resources[resourceType] < amount) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 加入国家
   * @param {string} playerId - 玩家ID
   * @param {string} nationId - 国家ID
   * @returns {boolean} 是否成功加入
   */
  joinNation(playerId, nationId) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回false
    if (!player) {
      return false;
    }
    
    // 更新玩家的国家ID
    player.nationId = nationId;
    
    return true;
  }
  
  /**
   * 离开国家
   * @param {string} playerId - 玩家ID
   * @returns {boolean} 是否成功离开
   */
  leaveNation(playerId) {
    // 获取玩家
    const player = this.players.get(playerId);
    
    // 如果玩家不存在，返回false
    if (!player) {
      return false;
    }
    
    // 清除玩家的国家ID
    player.nationId = null;
    
    return true;
  }
}

module.exports = PlayerManager;
