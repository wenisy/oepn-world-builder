# Minecraft风格沙盒游戏

这是一个基于Three.js的Minecraft风格沙盒游戏，支持体素世界生成、方块破坏和放置、物理系统等功能。

## 特性

- 基于体素的世界生成
- 程序化地形生成
- 第一人称视角控制
- 方块破坏和放置
- 物品栏系统
- 物理和碰撞检测
- 昼夜循环
- 多人游戏支持（计划中）

## 技术栈

- **前端**：
  - Three.js - 3D渲染
  - JavaScript/ES6+ - 核心逻辑
  - HTML5/CSS3 - 用户界面

- **后端**（多人游戏）：
  - Node.js
  - Socket.io - 实时通信
  - Express - Web服务器

## 项目结构

```
/src
  /components          # React UI组件（计划中）
    /ui                # 游戏界面（物品栏、菜单）
    /game              # Three.js集成
  /engine
    /voxel             # 方块和区块逻辑
    /rendering         # 网格生成、纹理
    /physics           # 碰撞、移动
    /generation        # 世界生成算法
    /entities          # 玩家、生物
  /utils               # 辅助函数
  /assets
    /textures          # 方块和物品纹理
    /models            # 任何非方块3D模型
    /sounds            # 游戏音频
  /types               # TypeScript类型定义（计划中）
  /state               # 游戏状态管理
  /networking          # 多人游戏功能
```

## 开发路线图

### 最小可行产品(MVP)阶段
- [x] 基本方块渲染和玩家移动
- [x] 简单的平坦世界生成
- [x] 方块破坏/放置
- [x] 基本碰撞检测

### 核心功能阶段
- [ ] 程序化地形生成（包括不同生物群系）
- [ ] 物品栏和简单合成系统
- [ ] 基本昼夜循环
- [ ] 更复杂的物理和碰撞

### 扩展功能阶段
- [ ] 多人游戏支持
- [ ] 更高级的合成和物品系统
- [ ] 简单的生物AI
- [ ] 洞穴系统和结构生成

### 优化与完善阶段
- [ ] 性能优化
- [ ] 游戏平衡
- [ ] 用户体验改进
- [ ] 错误修复和稳定性提升

## 安装和运行

1. 克隆仓库：
   ```
   git clone https://github.com/yourusername/minecraft-style-game.git
   cd minecraft-style-game
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 运行开发服务器：
   ```
   npm run dev
   ```

4. 构建生产版本：
   ```
   npm run build
   ```

## 控制方式

- **WASD** - 移动
- **空格** - 跳跃
- **鼠标左键** - 破坏方块
- **鼠标右键** - 放置方块
- **鼠标滚轮** - 切换物品栏
- **数字键1-9** - 直接选择物品栏槽位
- **ESC** - 暂停游戏

## 贡献

欢迎贡献代码、报告问题或提出新功能建议！请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 致谢

- [Three.js](https://threejs.org/) - 强大的JavaScript 3D库
- [Minecraft](https://www.minecraft.net/) - 灵感来源
