// 临时主文件，用于展示加载界面
// 在完整项目中，这些将从各个模块导入

// 初始化渲染器
const initRenderer = (canvas) => {
  // 创建场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景

  // 创建相机
  const camera = new THREE.PerspectiveCamera(
    75, // 视野角度
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近平面
    1000 // 远平面
  );
  camera.position.set(0, 5, 10);

  // 创建WebGL渲染器
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false // 关闭抗锯齿以增强像素效果
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // 固定像素比为1，增强像素效果
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 创建轨道控制器（临时，后面会替换为自定义控制器）
  let controls;
  try {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
  } catch (error) {
    console.error('OrbitControls 初始化失败:', error);
    // 创建一个空的控制器对象
    controls = { update: () => {} };
  }

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // 添加定向光（模拟太阳）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 200, 100);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // 添加半球光（模拟环境反射）
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemisphereLight);

  // 创建一个简单的地面
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x7CFC00,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 创建一些石柱
  for (let i = 0; i < 20; i++) {
    const height = 2 + Math.random() * 8;
    const geometry = new THREE.CylinderGeometry(0.5, 0.7, height, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1
    });
    const pillar = new THREE.Mesh(geometry, material);
    pillar.position.set(
      (Math.random() - 0.5) * 50,
      height / 2,
      (Math.random() - 0.5) * 50
    );
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);
  }

  // 处理窗口大小变化
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // 渲染函数
  function render() {
    controls.update();
    renderer.render(scene, camera);
  }

  // 返回渲染器对象
  return {
    scene,
    camera,
    renderer,
    controls,
    handleResize,
    render
  };
};

// 初始化输入系统
const initInputSystem = () => ({ update: () => {} });

// 初始化物理系统
const initPhysics = () => ({ update: () => {} });

// 初始化世界
const initWorld = () => ({ update: () => {} });

// 初始化UI
const initUI = () => ({ update: () => {} });

// 初始化网络客户端
const initNetworkClient = () => ({ sendPlayerUpdate: () => {} });

// 导入存档菜单
// 在实际项目中，这将从模块导入
const createSaveMenu = () => {
  // 存档列表
  let saves = [];

  // 当前选中的存档ID
  let selectedSaveId = null;

  // 创建菜单容器
  const container = document.createElement('div');
  container.className = 'save-menu';
  container.style.display = 'none';

  // 创建标题
  const title = document.createElement('h2');
  title.textContent = '选择世界';
  container.appendChild(title);

  // 创建存档列表容器
  const saveList = document.createElement('div');
  saveList.className = 'save-list';
  container.appendChild(saveList);

  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  container.appendChild(buttonContainer);

  // 创建新建存档按钮
  const newSaveButton = document.createElement('button');
  newSaveButton.textContent = '创建新世界';
  newSaveButton.className = 'button';
  newSaveButton.addEventListener('click', showCreateSaveForm);
  buttonContainer.appendChild(newSaveButton);

  // 创建进入游戏按钮
  const enterButton = document.createElement('button');
  enterButton.textContent = '进入游戏';
  enterButton.className = 'button primary';
  enterButton.disabled = true;
  enterButton.addEventListener('click', enterSelectedSave);
  buttonContainer.appendChild(enterButton);

  // 创建新存档表单
  const createSaveForm = document.createElement('div');
  createSaveForm.className = 'create-save-form';
  createSaveForm.style.display = 'none';
  container.appendChild(createSaveForm);

  // 创建表单标题
  const formTitle = document.createElement('h3');
  formTitle.textContent = '创建新世界';
  createSaveForm.appendChild(formTitle);

  // 创建名称输入
  const nameLabel = document.createElement('label');
  nameLabel.textContent = '世界名称:';
  createSaveForm.appendChild(nameLabel);

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '输入世界名称';
  createSaveForm.appendChild(nameInput);

  // 创建描述输入
  const descLabel = document.createElement('label');
  descLabel.textContent = '世界描述:';
  createSaveForm.appendChild(descLabel);

  const descInput = document.createElement('textarea');
  descInput.placeholder = '输入世界描述';
  createSaveForm.appendChild(descInput);

  // 创建环境选择
  const envLabel = document.createElement('label');
  envLabel.textContent = '初始环境:';
  createSaveForm.appendChild(envLabel);

  const envSelect = document.createElement('select');
  const environments = [
    { value: 'stoneForest', label: '石林' },
    { value: 'plains', label: '平原' },
    { value: 'mountains', label: '山地' },
    { value: 'desert', label: '沙漠' }
  ];

  environments.forEach(env => {
    const option = document.createElement('option');
    option.value = env.value;
    option.textContent = env.label;
    envSelect.appendChild(option);
  });

  createSaveForm.appendChild(envSelect);

  // 创建表单按钮容器
  const formButtonContainer = document.createElement('div');
  formButtonContainer.className = 'button-container';
  createSaveForm.appendChild(formButtonContainer);

  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.className = 'button';
  cancelButton.addEventListener('click', hideCreateSaveForm);
  formButtonContainer.appendChild(cancelButton);

  // 创建确认按钮
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '创建';
  confirmButton.className = 'button primary';
  confirmButton.addEventListener('click', createNewSave);
  formButtonContainer.appendChild(confirmButton);

  // 添加到文档
  document.body.appendChild(container);

  // 显示存档菜单
  function show() {
    container.style.display = 'flex';

    // 请求存档列表
    // 模拟服务器响应
    setTimeout(() => {
      updateSaveList([{
        id: 'default',
        name: '默认世界',
        description: '一个神秘的石林世界，等待探索。',
        lastPlayedAt: Date.now()
      }]);
    }, 500);
  }

  // 隐藏存档菜单
  function hide() {
    container.style.display = 'none';
  }

  // 更新存档列表
  function updateSaveList(savesList) {
    saves = savesList;

    // 清空列表
    saveList.innerHTML = '';

    // 添加存档项
    saves.forEach(save => {
      const saveItem = document.createElement('div');
      saveItem.className = 'save-item';
      saveItem.dataset.id = save.id;

      if (selectedSaveId === save.id) {
        saveItem.classList.add('selected');
      }

      // 添加存档信息
      const saveInfo = document.createElement('div');
      saveInfo.className = 'save-info';

      const saveName = document.createElement('h3');
      saveName.textContent = save.name;
      saveInfo.appendChild(saveName);

      const saveDesc = document.createElement('p');
      saveDesc.textContent = save.description;
      saveInfo.appendChild(saveDesc);

      const saveDate = document.createElement('span');
      saveDate.className = 'save-date';
      saveDate.textContent = `最后游玩: ${new Date(save.lastPlayedAt).toLocaleString()}`;
      saveInfo.appendChild(saveDate);

      saveItem.appendChild(saveInfo);

      // 添加删除按钮
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = '删除';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('确定要删除这个世界吗？此操作不可恢复！')) {
          // 模拟删除操作
          saves = saves.filter(s => s.id !== save.id);
          updateSaveList(saves);
        }
      });

      saveItem.appendChild(deleteButton);

      // 添加点击事件
      saveItem.addEventListener('click', () => {
        selectSave(save.id);
      });

      saveList.appendChild(saveItem);
    });

    // 更新进入按钮状态
    enterButton.disabled = selectedSaveId === null;
  }

  // 选择存档
  function selectSave(saveId) {
    selectedSaveId = saveId;

    // 更新选中状态
    const saveItems = saveList.querySelectorAll('.save-item');
    saveItems.forEach(item => {
      if (item.dataset.id === saveId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // 更新进入按钮状态
    enterButton.disabled = false;
  }

  // 进入选中的存档
  function enterSelectedSave() {
    if (selectedSaveId) {
      // 隐藏存档菜单
      hide();

      // 显示加载屏幕
      document.getElementById('loading-screen').style.display = 'flex';

      // 开始游戏
      startGame();
    }
  }

  // 显示创建存档表单
  function showCreateSaveForm() {
    saveList.style.display = 'none';
    buttonContainer.style.display = 'none';
    createSaveForm.style.display = 'block';
  }

  // 隐藏创建存档表单
  function hideCreateSaveForm() {
    saveList.style.display = 'grid';
    buttonContainer.style.display = 'flex';
    createSaveForm.style.display = 'none';
  }

  // 创建新存档
  function createNewSave() {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const environment = envSelect.value;

    if (!name) {
      alert('请输入世界名称');
      return;
    }

    // 模拟创建新存档
    const newSave = {
      id: 'new-' + Date.now(),
      name,
      description,
      environment,
      lastPlayedAt: Date.now()
    };

    // 添加到存档列表
    saves.push(newSave);

    // 重置表单
    nameInput.value = '';
    descInput.value = '';

    // 隐藏表单
    hideCreateSaveForm();

    // 更新存档列表
    updateSaveList(saves);

    // 选中新存档
    selectSave(newSave.id);
  }

  return {
    show,
    hide,
    updateSaveList
  };
};

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

    // 初始化网络客户端
    updateLoadingProgress(50, '连接到服务器...');
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

  // 初始化游戏组件
  updateLoadingProgress(10, '初始化渲染器...');
  renderer = initRenderer(document.getElementById('game-canvas'));

  updateLoadingProgress(30, '初始化输入系统...');
  inputSystem = initInputSystem(gameState);

  updateLoadingProgress(50, '初始化物理系统...');
  physicsSystem = initPhysics();

  updateLoadingProgress(70, '生成世界...');
  worldSystem = initWorld(renderer.scene);

  updateLoadingProgress(90, '初始化界面...');
  uiSystem = initUI(gameState);

  // 完成加载
  updateLoadingProgress(100, '加载完成!');

  // 隐藏加载屏幕，显示游戏UI
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('ui-overlay').classList.remove('hidden');
    gameState.isLoading = false;

    // 开始游戏循环
    gameLoop();
  }, 1000);
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
