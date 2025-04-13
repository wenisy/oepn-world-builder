const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 玩家数据
const players = new Map();

// 世界数据
let worldData = {
    seed: Math.floor(Math.random() * 2147483647),
    chunks: new Map(),
    entities: new Map()
};

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// 处理根路径请求
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 处理Socket.IO连接
io.on('connection', (socket) => {
    console.log(`玩家连接: ${socket.id}`);
    
    // 生成玩家ID
    const playerId = uuidv4();
    
    // 创建玩家数据
    const player = {
        id: playerId,
        socketId: socket.id,
        position: { x: 0, y: 70, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        health: 20,
        username: `Player_${playerId.substring(0, 6)}`
    };
    
    // 存储玩家数据
    players.set(playerId, player);
    
    // 发送初始化数据给玩家
    socket.emit('init', {
        playerId,
        worldSeed: worldData.seed,
        players: Array.from(players.values())
    });
    
    // 广播新玩家加入
    socket.broadcast.emit('playerJoin', player);
    
    // 处理玩家位置更新
    socket.on('updatePosition', (data) => {
        const player = players.get(playerId);
        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
            
            // 广播玩家位置更新
            socket.broadcast.emit('playerMove', {
                id: playerId,
                position: player.position,
                rotation: player.rotation
            });
        }
    });
    
    // 处理方块更新
    socket.on('blockUpdate', (data) => {
        const { x, y, z, blockId } = data;
        
        // 更新世界数据
        const chunkX = Math.floor(x / 16);
        const chunkZ = Math.floor(z / 16);
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // 获取或创建区块数据
        if (!worldData.chunks.has(chunkKey)) {
            worldData.chunks.set(chunkKey, {
                x: chunkX,
                z: chunkZ,
                blocks: new Map()
            });
        }
        
        const chunk = worldData.chunks.get(chunkKey);
        const blockKey = `${x},${y},${z}`;
        
        // 更新方块
        chunk.blocks.set(blockKey, blockId);
        
        // 广播方块更新
        io.emit('blockUpdate', { x, y, z, blockId });
    });
    
    // 处理聊天消息
    socket.on('chatMessage', (message) => {
        const player = players.get(playerId);
        if (player) {
            // 广播聊天消息
            io.emit('chatMessage', {
                sender: player.username,
                message,
                timestamp: Date.now()
            });
        }
    });
    
    // 处理断开连接
    socket.on('disconnect', () => {
        console.log(`玩家断开连接: ${socket.id}`);
        
        // 移除玩家数据
        players.delete(playerId);
        
        // 广播玩家离开
        io.emit('playerLeave', { id: playerId });
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
