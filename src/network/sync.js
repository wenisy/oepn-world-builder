/**
 * 网络同步系统 - 处理客户端和服务器之间的数据同步
 * @param {Object} gameState - 游戏状态
 * @param {Object} networkClient - 网络客户端
 * @returns {Object} 同步系统对象
 */
export function initSyncSystem(gameState, networkClient) {
  // 同步队列
  const syncQueue = [];
  
  // 最大队列长度
  const MAX_QUEUE_LENGTH = 100;
  
  // 上次同步时间
  let lastSyncTime = 0;
  
  // 同步间隔（毫秒）
  const SYNC_INTERVAL = 50;
  
  /**
   * 添加同步项
   * @param {string} type - 同步类型
   * @param {Object} data - 同步数据
   */
  function addSyncItem(type, data) {
    // 创建同步项
    const syncItem = {
      type,
      data,
      timestamp: Date.now()
    };
    
    // 添加到队列
    syncQueue.push(syncItem);
    
    // 限制队列长度
    if (syncQueue.length > MAX_QUEUE_LENGTH) {
      syncQueue.shift();
    }
  }
  
  /**
   * 同步玩家状态
   */
  function syncPlayerState() {
    // 添加玩家状态同步项
    addSyncItem('player', {
      position: { ...gameState.player.position },
      rotation: { ...gameState.player.rotation }
    });
  }
  
  /**
   * 同步建筑操作
   * @param {string} action - 操作类型（build, destroy, upgrade）
   * @param {Object} building - 建筑对象
   */
  function syncBuildingAction(action, building) {
    // 添加建筑操作同步项
    addSyncItem('building', {
      action,
      building: {
        id: building.id,
        type: building.type,
        position: { ...building.position },
        rotation: { ...building.rotation }
      }
    });
  }
  
  /**
   * 同步资源操作
   * @param {string} action - 操作类型（gather, use, trade）
   * @param {Object} resource - 资源对象
   */
  function syncResourceAction(action, resource) {
    // 添加资源操作同步项
    addSyncItem('resource', {
      action,
      resource
    });
  }
  
  /**
   * 同步社交操作
   * @param {string} action - 操作类型（friend, message, nation, alliance）
   * @param {Object} data - 操作数据
   */
  function syncSocialAction(action, data) {
    // 添加社交操作同步项
    addSyncItem('social', {
      action,
      data
    });
  }
  
  /**
   * 处理同步队列
   */
  function processSyncQueue() {
    // 检查是否已连接
    if (!networkClient.isConnected) return;
    
    // 检查同步间隔
    const currentTime = Date.now();
    if (currentTime - lastSyncTime < SYNC_INTERVAL) return;
    lastSyncTime = currentTime;
    
    // 如果队列为空，不处理
    if (syncQueue.length === 0) return;
    
    // 获取需要同步的项
    const itemsToSync = syncQueue.splice(0, 10); // 每次最多同步10项
    
    // 按类型分组
    const groupedItems = {};
    for (const item of itemsToSync) {
      if (!groupedItems[item.type]) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type].push(item);
    }
    
    // 发送同步数据
    for (const type in groupedItems) {
      const items = groupedItems[type];
      
      // 根据类型处理
      switch (type) {
        case 'player':
          // 只发送最新的玩家状态
          const latestPlayerItem = items[items.length - 1];
          networkClient.socket.emit('player:update', latestPlayerItem.data);
          break;
          
        case 'building':
          // 发送所有建筑操作
          for (const item of items) {
            networkClient.socket.emit(`building:${item.data.action}`, item.data.building);
          }
          break;
          
        case 'resource':
          // 发送所有资源操作
          for (const item of items) {
            networkClient.socket.emit(`resource:${item.data.action}`, item.data.resource);
          }
          break;
          
        case 'social':
          // 发送所有社交操作
          for (const item of items) {
            networkClient.socket.emit(`social:${item.data.action}`, item.data.data);
          }
          break;
      }
    }
  }
  
  /**
   * 更新同步系统
   */
  function update() {
    // 同步玩家状态
    syncPlayerState();
    
    // 处理同步队列
    processSyncQueue();
  }
  
  // 返回同步系统对象
  return {
    syncBuildingAction,
    syncResourceAction,
    syncSocialAction,
    update
  };
}
