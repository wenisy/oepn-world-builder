// Minecraft 风格的方块沙盒游戏

// 全局变量
let scene, camera, renderer, controls;
let world = {}; // 存储方块数据
let player = {
  position: new THREE.Vector3(0, 20, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  onGround: false,
  speed: 0.1,
  jumpStrength: 0.2,
  gravity: 0.01,
  health: 10,
  hunger: 10,
  selectedSlot: 0,
  inventory: [
    { id: 'stone', count: 64 },
    { id: 'dirt', count: 64 },
    { id: 'grass', count: 64 },
    { id: 'wood', count: 64 },
    { id: 'leaves', count: 64 },
    { id: 'sand', count: 64 },
    { id: 'glass', count: 64 },
    { id: 'brick', count: 64 },
    { id: 'cactus', count: 64 }
  ]
};

// 方块类型
const blockTypes = {
  'air': { visible: false },
  'stone': { color: 0x888888, texture: 'stone' },
  'dirt': { color: 0x8B4513, texture: 'dirt' },
  'grass': { color: 0x7CFC00, texture: 'grass' },
  'wood': { color: 0x8B4513, texture: 'wood' },
  'leaves': { color: 0x00FF00, texture: 'leaves' },
  'sand': { color: 0xFFD700, texture: 'sand' },
  'glass': { color: 0xADD8E6, texture: 'glass', transparent: true },
  'brick': { color: 0xB22222, texture: 'brick' },
  'cactus': { color: 0x2E8B57, texture: 'cactus' }
};

// 纹理加载器
const textureLoader = new THREE.TextureLoader();
const blockTextures = {};

// 加载纹理
function loadTextures() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalTextures = Object.keys(blockTypes).filter(type => blockTypes[type].texture).length;
    
    for (const [type, data] of Object.entries(blockTypes)) {
      if (data.texture) {
        const texturePath = `textures/blocks/${data.texture}.png`;
        textureLoader.load(texturePath, 
          // 成功加载
          (texture) => {
            texture.magFilter = THREE.NearestFilter; // 像素风格
            texture.minFilter = THREE.NearestFilter;
            blockTextures[type] = texture;
            loadedCount++;
            
            if (loadedCount === totalTextures) {
              resolve();
            }
          },
          // 进度
          undefined,
          // 错误处理
          (error) => {
            console.error(`无法加载纹理 ${texturePath}:`, error);
            // 使用颜色代替纹理
            blockTextures[type] = null;
            loadedCount++;
            
            if (loadedCount === totalTextures) {
              resolve();
            }
          }
        );
      }
    }
    
    // 如果没有纹理需要加载
    if (totalTextures === 0) {
      resolve();
    }
  });
}

// 初始化渲染器
const initRenderer = (canvas) => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景
  
  // 创建雾效果，增加深度感
  scene.fog = new THREE.Fog(0x87CEEB, 50, 100);

  // 创建第一人称相机
  camera = new THREE.PerspectiveCamera(
    75, // 视野角度
    window.innerWidth / window.innerHeight, // 宽高比
    0.1, // 近平面
    1000 // 远平面
  );
  camera.position.copy(player.position);
  camera.position.y += 1.6; // 玩家身高

  // 创建WebGL渲染器
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false // 关闭抗锯齿以增强像素效果
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // 固定像素比为1，增强像素效果
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 添加第一人称控制
  try {
    controls = new THREE.PointerLockControls(camera, renderer.domElement);
    document.addEventListener('click', () => {
      controls.lock();
    });
  } catch (error) {
    console.error('第一人称控制初始化失败:', error);
    // 如果失败，回退到轨道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
  }

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
  scene.add(ambientLight);

  // 添加定向光（模拟太阳）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 200, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // 处理窗口大小变化
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  window.addEventListener('resize', handleResize);
  
  return {
    scene,
    camera,
    renderer,
    controls
  };
};

// 创建方块
function createBlock(type, x, y, z) {
  if (type === 'air' || !blockTypes[type]) return null;
  
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  let material;
  
  if (blockTextures[type]) {
    material = new THREE.MeshStandardMaterial({ 
      map: blockTextures[type],
      transparent: blockTypes[type].transparent || false
    });
  } else {
    material = new THREE.MeshStandardMaterial({ 
      color: blockTypes[type].color,
      transparent: blockTypes[type].transparent || false
    });
  }
  
  const block = new THREE.Mesh(geometry, material);
  block.position.set(x, y, z);
  block.castShadow = true;
  block.receiveShadow = true;
  block.userData = { type };
  
  return block;
}

// 生成地形
function generateTerrain() {
  // 简单的平坦地形
  const size = 32; // 地形大小
  const height = 10; // 基础高度
  
  // 创建地形网格
  for (let x = -size/2; x < size/2; x++) {
    for (let z = -size/2; z < size/2; z++) {
      // 使用柏林噪声生成高度
      const y = Math.floor(height + Math.sin(x/5) * Math.cos(z/5) * 2);
      
      // 放置草方块作为表面
      const block = createBlock('grass', x, y, z);
      if (block) {
        scene.add(block);
        world[`${x},${y},${z}`] = { type: 'grass', mesh: block };
      }
      
      // 放置泥土作为表层下方
      for (let dy = 1; dy < 3; dy++) {
        const dirtBlock = createBlock('dirt', x, y-dy, z);
        if (dirtBlock) {
          scene.add(dirtBlock);
          world[`${x},${y-dy},${z}`] = { type: 'dirt', mesh: dirtBlock };
        }
      }
      
      // 放置石头作为深层
      for (let dy = 3; dy < 10; dy++) {
        const stoneBlock = createBlock('stone', x, y-dy, z);
        if (stoneBlock) {
          scene.add(stoneBlock);
          world[`${x},${y-dy},${z}`] = { type: 'stone', mesh: stoneBlock };
        }
      }
    }
  }
  
  // 生成一些树
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * size - size/2);
    const z = Math.floor(Math.random() * size - size/2);
    const y = getHighestBlock(x, z);
    
    if (y !== null) {
      generateTree(x, y + 1, z);
    }
  }
}

// 获取指定坐标最高的方块的y坐标
function getHighestBlock(x, z) {
  let highestY = null;
  
  for (let y = 100; y >= -100; y--) {
    if (world[`${x},${y},${z}`]) {
      highestY = y;
      break;
    }
  }
  
  return highestY;
}

// 生成树
function generateTree(x, y, z) {
  // 树干
  const trunkHeight = 4 + Math.floor(Math.random() * 3);
  for (let dy = 0; dy < trunkHeight; dy++) {
    const block = createBlock('wood', x, y + dy, z);
    if (block) {
      scene.add(block);
      world[`${x},${y+dy},${z}`] = { type: 'wood', mesh: block };
    }
  }
  
  // 树叶
  const leafSize = 2;
  for (let dx = -leafSize; dx <= leafSize; dx++) {
    for (let dy = 0; dy <= leafSize; dy++) {
      for (let dz = -leafSize; dz <= leafSize; dz++) {
        // 跳过树干位置
        if (dx === 0 && dz === 0 && dy < leafSize) continue;
        
        // 创建球形树冠
        if (dx*dx + dy*dy + dz*dz <= leafSize*leafSize + 1) {
          const block = createBlock('leaves', x + dx, y + trunkHeight + dy - 1, z + dz);
          if (block) {
            scene.add(block);
            world[`${x+dx},${y+trunkHeight+dy-1},${z+dz}`] = { type: 'leaves', mesh: block };
          }
        }
      }
    }
  }
}

// 放置方块
function placeBlock(type, x, y, z) {
  // 检查位置是否已有方块
  if (world[`${x},${y},${z}`]) return false;
  
  const block = createBlock(type, x, y, z);
  if (block) {
    scene.add(block);
    world[`${x},${y},${z}`] = { type, mesh: block };
    return true;
  }
  return false;
}

// 破坏方块
function breakBlock(x, y, z) {
  const key = `${x},${y},${z}`;
  const blockData = world[key];
  
  if (blockData && blockData.mesh) {
    scene.remove(blockData.mesh);
    delete world[key];
    return blockData.type;
  }
  return null;
}

// 射线检测，用于选择方块
function raycast(origin, direction, maxDistance = 5) {
  const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
  const meshes = Object.values(world)
    .filter(blockData => blockData.mesh)
    .map(blockData => blockData.mesh);
  
  const intersects = raycaster.intersectObjects(meshes);
  
  if (intersects.length > 0) {
    const intersect = intersects[0];
    const block = intersect.object;
    const position = block.position.clone();
    const normal = intersect.face.normal.clone();
    
    return {
      position,
      normal,
      block
    };
  }
  
  return null;
}

// 初始化输入系统
const initInputSystem = () => {
  const keys = {};
  let isMouseDown = false;
  let breakCooldown = 0;
  let placeCooldown = 0;
  
  // 键盘按下事件
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
  });
  
  // 键盘松开事件
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  
  // 鼠标按下事件
  window.addEventListener('mousedown', (e) => {
    isMouseDown = true;
  });
  
  // 鼠标松开事件
  window.addEventListener('mouseup', (e) => {
    isMouseDown = false;
  });
  
  // 鼠标滚轮事件，用于切换物品栏
  window.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      // 向下滚动，选择下一个物品
      player.selectedSlot = (player.selectedSlot + 1) % player.inventory.length;
    } else {
      // 向上滚动，选择上一个物品
      player.selectedSlot = (player.selectedSlot - 1 + player.inventory.length) % player.inventory.length;
    }
    updateHotbar();
  });
  
  // 更新玩家位置和视角
  function update() {
    if (!controls.isLocked) return;
    
    // 移动方向
    const moveDirection = new THREE.Vector3();
    
    // 前后移动
    if (keys['KeyW']) moveDirection.z -= 1;
    if (keys['KeyS']) moveDirection.z += 1;
    
    // 左右移动
    if (keys['KeyA']) moveDirection.x -= 1;
    if (keys['KeyD']) moveDirection.x += 1;
    
    // 跳跃
    if (keys['Space'] && player.onGround) {
      player.velocity.y = player.jumpStrength;
      player.onGround = false;
    }
    
    // 规范化移动方向
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    // 根据相机方向调整移动方向
    moveDirection.applyQuaternion(camera.quaternion);
    moveDirection.y = 0; // 保持水平移动
    moveDirection.normalize();
    
    // 应用移动
    player.position.x += moveDirection.x * player.speed;
    player.position.z += moveDirection.z * player.speed;
    
    // 应用重力
    player.velocity.y -= player.gravity;
    player.position.y += player.velocity.y;
    
    // 简单的碰撞检测
    const playerX = Math.floor(player.position.x);
    const playerY = Math.floor(player.position.y);
    const playerZ = Math.floor(player.position.z);
    
    // 检查脚下是否有方块
    if (world[`${playerX},${playerY-1},${playerZ}`]) {
      player.onGround = true;
      player.velocity.y = 0;
      player.position.y = playerY + 0.1; // 稍微抬高以避免抖动
    } else {
      player.onGround = false;
    }
    
    // 更新相机位置
    camera.position.copy(player.position);
    camera.position.y += 1.6; // 玩家身高
    
    // 处理方块交互
    if (isMouseDown) {
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const result = raycast(camera.position, direction);
      
      if (result) {
        if (breakCooldown <= 0) {
          // 左键破坏方块
          if (event.button === 0) {
            const x = Math.round(result.position.x);
            const y = Math.round(result.position.y);
            const z = Math.round(result.position.z);
            breakBlock(x, y, z);
            breakCooldown = 10; // 冷却时间
          }
          // 右键放置方块
          else if (event.button === 2 && placeCooldown <= 0) {
            const x = Math.round(result.position.x + result.normal.x);
            const y = Math.round(result.position.y + result.normal.y);
            const z = Math.round(result.position.z + result.normal.z);
            
            // 获取当前选中的方块类型
            const selectedItem = player.inventory[player.selectedSlot];
            if (selectedItem && selectedItem.count > 0) {
              if (placeBlock(selectedItem.id, x, y, z)) {
                selectedItem.count--;
                updateHotbar();
              }
            }
            placeCooldown = 10; // 冷却时间
          }
        }
      }
    }
    
    // 更新冷却时间
    if (breakCooldown > 0) breakCooldown--;
    if (placeCooldown > 0) placeCooldown--;
  }
  
  return { update };
};

// 更新物品栏显示
function updateHotbar() {
  const hotbar = document.getElementById('hotbar');
  if (!hotbar) return;
  
  // 清空物品栏
  hotbar.innerHTML = '';
  
  // 添加物品
  player.inventory.forEach((item, index) => {
    const slot = document.createElement('div');
    slot.className = 'hotbar-slot';
    
    if (index === player.selectedSlot) {
      slot.classList.add('selected');
    }
    
    if (item.count > 0) {
      const itemIcon = document.createElement('div');
      itemIcon.className = 'item-icon';
      itemIcon.style.backgroundColor = blockTypes[item.id]?.color ? 
        `#${blockTypes[item.id].color.toString(16).padStart(6, '0')}` : '#ccc';
      
      const itemCount = document.createElement('span');
      itemCount.className = 'item-count';
      itemCount.textContent = item.count;
      
      slot.appendChild(itemIcon);
      slot.appendChild(itemCount);
    }
    
    hotbar.appendChild(slot);
  });
}

// 初始化UI
const initUI = () => {
  // 创建HUD容器
  const hud = document.createElement('div');
  hud.id = 'hud';
  document.body.appendChild(hud);
  
  // 创建准星
  const crosshair = document.createElement('div');
  crosshair.id = 'crosshair';
  hud.appendChild(crosshair);
  
  // 创建物品栏
  const hotbar = document.createElement('div');
  hotbar.id = 'hotbar';
  hud.appendChild(hotbar);
  
  // 创建生命值和饥饿度条
  const statusBars = document.createElement('div');
  statusBars.id = 'status-bars';
  
  const healthBar = document.createElement('div');
  healthBar.id = 'health-bar';
  healthBar.className = 'status-bar';
  
  const hungerBar = document.createElement('div');
  hungerBar.id = 'hunger-bar';
  hungerBar.className = 'status-bar';
  
  statusBars.appendChild(healthBar);
  statusBars.appendChild(hungerBar);
  hud.appendChild(statusBars);
  
  // 更新UI
  function update() {
    // 更新生命值
    healthBar.style.width = `${player.health * 10}%`;
    
    // 更新饥饿度
    hungerBar.style.width = `${player.hunger * 10}%`;
  }
  
  // 初始化物品栏
  updateHotbar();
  
  return { update };
};

// 游戏初始化
async function initGame() {
  try {
    // 显示加载屏幕
    updateLoadingProgress(0, '初始化游戏...');
    
    // 加载纹理
    updateLoadingProgress(20, '加载纹理...');
    await loadTextures();
    
    // 初始化渲染器
    updateLoadingProgress(40, '初始化渲染器...');
    const renderSystem = initRenderer(document.getElementById('game-canvas'));
    
    // 生成地形
    updateLoadingProgress(60, '生成地形...');
    generateTerrain();
    
    // 初始化输入系统
    updateLoadingProgress(80, '初始化控制...');
    const inputSystem = initInputSystem();
    
    // 初始化UI
    updateLoadingProgress(90, '初始化界面...');
    const uiSystem = initUI();
    
    // 完成加载
    updateLoadingProgress(100, '加载完成!');
    
    // 隐藏加载屏幕
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      
      // 添加右键菜单阻止
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
      
      // 开始游戏循环
      gameLoop(inputSystem, uiSystem);
    }, 1000);
  } catch (error) {
    console.error('游戏初始化失败:', error);
    updateLoadingProgress(0, '初始化失败，请刷新页面重试');
  }
}

// 更新加载进度
function updateLoadingProgress(percent, message) {
  const progressBar = document.querySelector('.progress');
  const loadingText = document.querySelector('.loading-text');
  
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (loadingText) loadingText.textContent = message;
}

// 游戏主循环
function gameLoop(inputSystem, uiSystem) {
  // 请求下一帧动画
  requestAnimationFrame(() => gameLoop(inputSystem, uiSystem));
  
  // 处理输入
  inputSystem.update();
  
  // 更新UI
  uiSystem.update();
  
  // 渲染场景
  renderer.render(scene, camera);
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame);

// 处理窗口大小变化
window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});
