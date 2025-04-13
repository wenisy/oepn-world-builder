const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 导入游戏服务器模块
const WorldState = require('./worldState');
const PlayerManager = require('./playerManager');
const Auth = require('./auth');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../dist')));

// 创建游戏服务器实例
const worldState = new WorldState();
const playerManager = new PlayerManager();
const auth = new Auth();

// 设置Socket.IO连接处理
io.on('connection', (socket) => {
  console.log('新连接:', socket.id);

  // 生成玩家ID
  const playerId = uuidv4();

  // 发送玩家ID
  socket.emit('player:id', { id: playerId });

  // 发送存档列表
  socket.emit('saves:list', { saves: worldState.saveManager.getSaves() });

  // 选择存档事件
  socket.on('save:select', (data) => {
    console.log('选择存档:', data.saveId);

    // 切换到选择的存档
    worldState.currentSaveId = data.saveId;
    worldState.loadCurrentSave();

    // 通知客户端存档已加载
    socket.emit('save:loaded', {
      saveId: data.saveId,
      worldState: worldState.getState()
    });
  });

  // 创建新存档事件
  socket.on('save:create', (data) => {
    console.log('创建新存档:', data.name);

    // 创建新存档
    const newSave = worldState.createNewSave(
      data.name,
      data.description || '新的开放世界',
      data.worldParams || {}
    );

    // 通知客户端新存档已创建
    socket.emit('save:created', {
      save: newSave,
      worldState: worldState.getState()
    });

    // 向所有客户端发送更新的存档列表
    io.emit('saves:list', { saves: worldState.saveManager.getSaves() });
  });

  // 删除存档事件
  socket.on('save:delete', (data) => {
    console.log('删除存档:', data.saveId);

    // 删除存档
    const success = worldState.saveManager.deleteSave(data.saveId);

    // 通知客户端存档删除结果
    socket.emit('save:deleted', {
      success,
      saveId: data.saveId
    });

    // 如果删除的是当前存档，切换到另一个存档
    if (success && data.saveId === worldState.currentSaveId) {
      const saves = worldState.saveManager.getSaves();
      if (saves.length > 0) {
        worldState.currentSaveId = saves[0].id;
        worldState.loadCurrentSave();
      } else {
        // 如果没有存档了，创建一个新的
        const newSave = worldState.createNewSave('默认世界', '自动创建的新世界');
        worldState.currentSaveId = newSave.id;
        worldState.loadCurrentSave();
      }
    }

    // 向所有客户端发送更新的存档列表
    io.emit('saves:list', { saves: worldState.saveManager.getSaves() });
  });

  // 玩家加入事件
  socket.on('player:join', (data) => {
    console.log('玩家加入:', data);

    // 创建玩家
    const player = playerManager.createPlayer({
      id: playerId,
      socketId: socket.id,
      name: data.name || `玩家${playerId.substring(0, 4)}`,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      online: true
    });

    // 通知所有客户端有新玩家加入
    io.emit('player:join', { player });

    // 发送当前玩家列表
    socket.emit('player:list', { players: playerManager.getPlayers() });

    // 发送世界状态
    socket.emit('world:update', worldState.getState());
  });

  // 玩家更新事件
  socket.on('player:update', (data) => {
    // 更新玩家位置和状态
    playerManager.updatePlayer(playerId, {
      position: data.position,
      rotation: data.rotation
    });

    // 广播玩家更新
    socket.broadcast.emit('player:update', {
      id: playerId,
      position: data.position,
      rotation: data.rotation
    });
  });

  // 建筑建造事件
  socket.on('building:build', (data) => {
    console.log('建筑建造:', data);

    // 验证建造请求
    if (worldState.canBuild(data.position, data.type)) {
      // 创建建筑
      const building = worldState.createBuilding(data.type, data.position, data.rotation, playerId);

      // 广播建筑更新
      io.emit('building:update', { action: 'build', building });
    } else {
      // 发送错误消息
      socket.emit('error', { message: '无法在该位置建造' });
    }
  });

  // 建筑销毁事件
  socket.on('building:destroy', (data) => {
    console.log('建筑销毁:', data);

    // 验证销毁请求
    if (worldState.canDestroyBuilding(data.id, playerId)) {
      // 销毁建筑
      const building = worldState.destroyBuilding(data.id);

      // 广播建筑更新
      io.emit('building:update', { action: 'destroy', building });
    } else {
      // 发送错误消息
      socket.emit('error', { message: '无法销毁该建筑' });
    }
  });

  // 聊天消息事件
  socket.on('chat:message', (data) => {
    console.log('聊天消息:', data);

    // 获取玩家信息
    const player = playerManager.getPlayer(playerId);

    // 创建消息对象
    const message = {
      id: uuidv4(),
      sender: player.name,
      senderId: playerId,
      content: data.content,
      channel: data.channel,
      timestamp: Date.now()
    };

    // 根据频道广播消息
    switch (data.channel) {
      case 'global':
        // 全局消息
        io.emit('chat:message', message);
        break;

      case 'local':
        // 本地消息（附近的玩家）
        const nearbyPlayers = playerManager.getNearbyPlayers(playerId, 100);
        for (const nearbyPlayer of nearbyPlayers) {
          io.to(nearbyPlayer.socketId).emit('chat:message', message);
        }
        // 也发送给自己
        socket.emit('chat:message', message);
        break;

      case 'nation':
        // 国家消息（同一国家的玩家）
        // TODO: 实现国家系统
        break;

      case 'alliance':
        // 联盟消息（同一联盟的玩家）
        // TODO: 实现联盟系统
        break;

      default:
        // 默认为全局消息
        io.emit('chat:message', message);
        break;
    }
  });

  // 断开连接事件
  socket.on('disconnect', () => {
    console.log('断开连接:', socket.id);

    // 获取玩家信息
    const player = playerManager.getPlayer(playerId);

    if (player) {
      // 更新玩家状态
      playerManager.updatePlayer(playerId, { online: false });

      // 通知所有客户端玩家离开
      io.emit('player:leave', { player });
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 定期保存世界状态
setInterval(() => {
  worldState.save();
}, 60000); // 每分钟保存一次
