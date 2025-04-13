// 临时主文件，用于展示加载界面
// 在完整项目中，这些将从各个模块导入
const initRenderer = () => ({ scene: {}, render: () => {}, handleResize: () => {} });
const initInputSystem = () => ({ update: () => {} });
const initPhysics = () => ({ update: () => {} });
const initWorld = () => ({ update: () => {} });
const initUI = () => ({ update: () => {} });
const initNetworkClient = () => ({ sendPlayerUpdate: () => {} });

// 导入存档菜单
// 在实际项目中，这将从模块导入
const createSaveMenu = () => ({
  show: () => {
    // 创建存档菜单元素
    const saveMenu = document.createElement('div');
    saveMenu.className = 'save-menu';
    saveMenu.innerHTML = `
      <h2>选择世界</h2>
      <div class="save-list">
        <div class="save-item selected" data-id="default">
          <div class="save-info">
            <h3>默认世界</h3>
            <p>一个神秘的石林世界，等待探索。</p>
            <span class="save-date">最后游玩: ${new Date().toLocaleString()}</span>
          </div>
          <button class="delete-button">删除</button>
        </div>
      </div>
      <div class="button-container">
        <button class="button">创建新世界</button>
        <button class="button primary">进入游戏</button>
      </div>
    `;

    // 添加到文档
    document.body.appendChild(saveMenu);

    // 添加事件监听器
    const enterButton = saveMenu.querySelector('.button.primary');
    enterButton.addEventListener('click', () => {
      saveMenu.remove();
      document.getElementById('loading-screen').style.display = 'flex';
      initGame();
    });
  },
  hide: () => {}
});

// 游戏状态
const gameState = {
  isLoading: true,
  isConnected: false,
  player: {
    id: null,
    name: '玩家',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    resources: 100
  },
  world: {
    entities: [],
    terrain: null,
    buildings: []
  },
  settings: {
    graphics: 'medium',
    sound: 0.7,
    music: 0.5,
    pixelSize: 4,
    controls: {
      forward: 'w',
      backward: 's',
      left: 'a',
      right: 'd',
      jump: ' ',
      build: 'b'
    }
  },
  saves: {
    currentSaveId: null,
    list: []
  }
};

// 游戏系统引用
let renderer;
let inputSystem;
let physicsSystem;
let worldSystem;
let uiSystem;
let networkClient;
let saveMenu;

// 初始化游戏
async function initGame() {
  try {
    // 显示加载屏幕
    updateLoadingProgress(0, '初始化游戏...');

    // 初始化渲染器
    updateLoadingProgress(10, '初始化渲染器...');
    renderer = await initRenderer(document.getElementById('game-canvas'));

    // 初始化输入系统
    updateLoadingProgress(20, '初始化输入系统...');
    inputSystem = initInputSystem(gameState);

    // 初始化物理系统
    updateLoadingProgress(30, '初始化物理系统...');
    physicsSystem = initPhysics();

    // 初始化世界
    updateLoadingProgress(40, '生成世界...');
    worldSystem = await initWorld(renderer.scene);

    // 初始化UI
    updateLoadingProgress(60, '初始化界面...');
    uiSystem = initUI(gameState);

    // 初始化网络客户端
    updateLoadingProgress(80, '连接到服务器...');
    networkClient = await initNetworkClient(gameState);

    // 初始化存档菜单
    updateLoadingProgress(90, '加载存档...');
    saveMenu = createSaveMenu();

    // 完成加载
    updateLoadingProgress(100, '加载完成!');

    // 隐藏加载屏幕，显示存档菜单
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      saveMenu.show();
    }, 1000);
  } catch (error) {
    console.error('游戏初始化失败:', error);
    updateLoadingProgress(0, '初始化失败，请刷新页面重试');
  }
}

// 开始游戏
function startGame() {
  // 隐藏存档菜单
  saveMenu.hide();

  // 显示游戏UI
  document.getElementById('ui-overlay').classList.remove('hidden');
  gameState.isLoading = false;

  // 开始游戏循环
  gameLoop();
}

// 更新加载进度
function updateLoadingProgress(percent, message) {
  const progressBar = document.querySelector('.progress');
  const loadingText = document.querySelector('.loading-text');

  progressBar.style.width = `${percent}%`;
  loadingText.textContent = message;
}

// 游戏主循环
function gameLoop() {
  // 请求下一帧动画
  requestAnimationFrame(gameLoop);

  // 如果游戏正在加载，不执行游戏逻辑
  if (gameState.isLoading) return;

  // 处理输入
  inputSystem.update();

  // 更新物理
  physicsSystem.update();

  // 更新世界
  worldSystem.update(gameState);

  // 更新网络
  if (gameState.isConnected) {
    networkClient.sendPlayerUpdate();
  }

  // 渲染场景
  renderer.render();

  // 更新UI
  uiSystem.update();
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame);

// 添加像素大小调整事件
document.getElementById('pixel-size')?.addEventListener('input', function(e) {
  if (renderer && renderer.pixelPass) {
    renderer.pixelPass.uniforms['pixelSize'].value = parseInt(e.target.value);
  }
});

// 处理窗口大小变化
window.addEventListener('resize', () => {
  if (renderer) {
    renderer.handleResize();
  }
});

// 在完整项目中，这将导出供其他模块使用
// export { gameState };
