import { io } from 'socket.io-client';

/**
 * 初始化网络客户端
 * @param {Object} gameState - 游戏状态
 * @returns {Object} 网络客户端对象
 */
export async function initNetworkClient(gameState) {
  // 连接到服务器
  const socket = io();
  
  // 连接状态
  let isConnected = false;
  
  // 上次发送更新的时间
  let lastUpdateTime = 0;
  
  // 更新频率（毫秒）
  const UPDATE_RATE = 100;
  
  // 注册连接事件
  socket.on('connect', () => {
    console.log('已连接到服务器');
    isConnected = true;
    gameState.isConnected = true;
    
    // 发送玩家信息
    socket.emit('player:join', {
      name: gameState.player.name
    });
  });
  
  // 注册断开连接事件
  socket.on('disconnect', () => {
    console.log('与服务器断开连接');
    isConnected = false;
    gameState.isConnected = false;
  });
  
  // 注册玩家ID事件
  socket.on('player:id', (data) => {
    console.log('收到玩家ID:', data.id);
    gameState.player.id = data.id;
  });
  
  // 注册玩家列表事件
  socket.on('player:list', (data) => {
    console.log('收到玩家列表:', data.players);
    
    // 更新社交菜单中的玩家列表
    if (window.socialMenu) {
      window.socialMenu.setPlayerList(data.players);
    }
  });
  
  // 注册玩家加入事件
  socket.on('player:join', (data) => {
    console.log('玩家加入:', data.player);
    
    // 显示通知
    showNotification(`${data.player.name} 加入了游戏`);
  });
  
  // 注册玩家离开事件
  socket.on('player:leave', (data) => {
    console.log('玩家离开:', data.player);
    
    // 显示通知
    showNotification(`${data.player.name} 离开了游戏`);
  });
  
  // 注册玩家更新事件
  socket.on('player:update', (data) => {
    // 更新其他玩家的位置和状态
    if (data.id !== gameState.player.id) {
      // 查找玩家
      const player = gameState.world.entities.find(entity => 
        entity.type === 'player' && entity.id === data.id
      );
      
      if (player) {
        // 更新现有玩家
        player.position.x = data.position.x;
        player.position.y = data.position.y;
        player.position.z = data.position.z;
        player.rotation.x = data.rotation.x;
        player.rotation.y = data.rotation.y;
        player.rotation.z = data.rotation.z;
      } else {
        // 创建新玩家
        // 这里需要与实体系统集成
        console.log('创建新玩家:', data);
      }
    }
  });
  
  // 注册世界更新事件
  socket.on('world:update', (data) => {
    // 更新世界状态
    console.log('收到世界更新:', data);
  });
  
  // 注册建筑更新事件
  socket.on('building:update', (data) => {
    // 更新建筑状态
    console.log('收到建筑更新:', data);
  });
  
  // 注册聊天消息事件
  socket.on('chat:message', (data) => {
    console.log('收到聊天消息:', data);
    
    // 更新聊天窗口
    if (window.socialMenu) {
      window.socialMenu.receiveMessage(data);
    }
  });
  
  /**
   * 发送玩家更新
   */
  function sendPlayerUpdate() {
    // 检查是否已连接
    if (!isConnected) return;
    
    // 检查更新频率
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime < UPDATE_RATE) return;
    lastUpdateTime = currentTime;
    
    // 发送玩家位置和状态
    socket.emit('player:update', {
      position: gameState.player.position,
      rotation: gameState.player.rotation
    });
  }
  
  /**
   * 发送聊天消息
   * @param {string} message - 消息内容
   * @param {string} channel - 频道
   */
  function sendChatMessage(message, channel = 'global') {
    // 检查是否已连接
    if (!isConnected) return;
    
    // 发送聊天消息
    socket.emit('chat:message', {
      content: message,
      channel: channel
    });
  }
  
  /**
   * 发送建筑请求
   * @param {string} type - 建筑类型
   * @param {Object} position - 位置
   * @param {Object} rotation - 旋转
   */
  function sendBuildRequest(type, position, rotation = { x: 0, y: 0, z: 0 }) {
    // 检查是否已连接
    if (!isConnected) return;
    
    // 发送建筑请求
    socket.emit('building:build', {
      type: type,
      position: position,
      rotation: rotation
    });
  }
  
  /**
   * 显示通知
   * @param {string} message - 通知消息
   */
  function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(notification);
    
    // 设置自动消失
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // 返回网络客户端对象
  return {
    socket,
    isConnected,
    sendPlayerUpdate,
    sendChatMessage,
    sendBuildRequest
  };
}
