/**
 * Minecraft风格沙盒游戏 - 主脚本
 */

// 游戏全局变量
let scene, camera, renderer, controls;
let voxelWorld = {}; // 存储方块数据
let player = {
  position: new THREE.Vector3(0, 20, 0),
  velocity: new THREE.Vector3(0, 0, 0),
  onGround: false,
  speed: 0.1,
  jumpStrength: 0.2,
  gravity: 0.01,
  canJump: true,
  selectedBlockType: 1, // 1=石头, 2=草方块, 3=泥土, 4=木头, 5=树叶
  blockTypes: [
    { id: 1, name: '石头', color: 0x888888 },
    { id: 2, name: '草方块', color: 0x55AA55 },
    { id: 3, name: '泥土', color: 0x8B4513 },
    { id: 4, name: '木头', color: 0x8B5A2B },
    { id: 5, name: '树叶', color: 0x00AA00 }
  ]
};

// 游戏状态
let isGameRunning = false;
let isPaused = false;

// 当页面加载完成后初始化游戏
window.addEventListener('load', async () => {
  // 显示加载屏幕
  document.getElementById('loading-screen').style.display = 'flex';
  
  // 显示主菜单
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
  }, 2000);
  
  // 添加按钮事件监听
  document.getElementById('start-game').addEventListener('click', startGame);
  document.getElementById('options').addEventListener('click', showOptions);
  document.getElementById('about')?.addEventListener('click', showAbout);
  
  // 选项菜单按钮
  document.getElementById('save-options')?.addEventListener('click', saveOptions);
  document.getElementById('back-to-menu')?.addEventListener('click', backToMainMenu);
  
  // 关于菜单按钮
  document.getElementById('back-from-about')?.addEventListener('click', backToMainMenu);
  
  // 暂停菜单按钮
  document.getElementById('resume-game')?.addEventListener('click', resumeGame);
  document.getElementById('options-from-pause')?.addEventListener('click', showOptions);
  document.getElementById('exit-to-menu')?.addEventListener('click', exitToMainMenu);
  
  // ESC键暂停游戏
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isGameRunning) {
      pauseGame();
    }
  });
});

// 开始游戏
function startGame() {
  // 隐藏主菜单
  document.getElementById('main-menu').style.display = 'none';
  
  // 显示加载屏幕
  document.getElementById('loading-screen').style.display = 'flex';
  document.querySelector('.loading-text').textContent = '生成世界中...';
  
  // 模拟加载过程
  let progress = 0;
  const progressBar = document.querySelector('.progress');
  
  const loadingInterval = setInterval(() => {
    progress += 5;
    progressBar.style.width = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(loadingInterval);
      
      // 隐藏加载屏幕
      document.getElementById('loading-screen').style.display = 'none';
      
      // 设置游戏状态
      isGameRunning = true;
      isPaused = false;
      
      // 初始化游戏
      initGame();
    }
  }, 100);
}

// 初始化游戏
function initGame() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // 天空蓝色
  scene.fog = new THREE.Fog(0x87CEEB, 50, 100); // 添加雾效果
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.copy(player.position);
  camera.position.y += 1.6; // 眼睛高度
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('game-canvas'),
    antialias: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // 像素风格
  renderer.shadowMap.enabled = true;
  
  // 创建第一人称控制器
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());
  
  // 点击画布锁定鼠标
  renderer.domElement.addEventListener('click', () => {
    controls.lock();
  });
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 200, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // 生成世界
  generateWorld();
  
  // 添加键盘和鼠标事件监听
  setupEventListeners();
  
  // 创建简单的UI
  createUI();
  
  // 动画循环
  function animate() {
    if (!isPaused) {
      requestAnimationFrame(animate);
      
      // 更新玩家位置和物理
      updatePlayer();
      
      // 渲染场景
      renderer.render(scene, camera);
      
      // 更新UI
      updateUI();
    }
  }
  
  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // 开始动画
  animate();
}

// 生成世界
function generateWorld() {
  // 生成一个简单的平坦世界
  const size = 32; // 世界大小
  const height = 10; // 基础高度
  
  // 创建地形
  for (let x = -size/2; x < size/2; x++) {
    for (let z = -size/2; z < size/2; z++) {
      // 使用简单的噪声函数生成高度
      const y = Math.floor(height + Math.sin(x/5) * Math.cos(z/5) * 2);
      
      // 放置草方块作为表面
      setVoxel(x, y, z, 2); // 草方块
      
      // 放置泥土作为表层下方
      for (let dy = 1; dy < 3; dy++) {
        setVoxel(x, y-dy, z, 3); // 泥土
      }
      
      // 放置石头作为深层
      for (let dy = 3; dy < 10; dy++) {
        setVoxel(x, y-dy, z, 1); // 石头
      }
    }
  }
  
  // 生成一些树
  generateTrees(10);
}

// 生成树
function generateTrees(count) {
  const size = 32;
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * size - size/2);
    const z = Math.floor(Math.random() * size - size/2);
    const y = getHighestBlock(x, z);
    
    if (y !== null) {
      // 树干
      const trunkHeight = 4 + Math.floor(Math.random() * 3);
      for (let dy = 0; dy < trunkHeight; dy++) {
        setVoxel(x, y + 1 + dy, z, 4); // 木头
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
              setVoxel(x + dx, y + trunkHeight + dy - 1, z + dz, 5); // 树叶
            }
          }
        }
      }
    }
  }
}

// 获取最高方块的Y坐标
function getHighestBlock(x, z) {
  for (let y = 50; y >= 0; y--) {
    const key = `${x},${y},${z}`;
    if (voxelWorld[key]) {
      return y;
    }
  }
  return null;
}

// 设置方块
function setVoxel(x, y, z, type) {
  const key = `${x},${y},${z}`;
  
  // 如果已经有相同类型的方块，不做任何操作
  if (voxelWorld[key] === type) return;
  
  // 如果是空气方块(type=0)，移除方块
  if (type === 0) {
    // 移除方块网格
    scene.children.forEach(child => {
      if (child.userData && 
          child.userData.blockX === x && 
          child.userData.blockY === y && 
          child.userData.blockZ === z) {
        scene.remove(child);
      }
    });
    
    // 从数据中移除
    delete voxelWorld[key];
    return;
  }
  
  // 存储方块数据
  voxelWorld[key] = type;
  
  // 创建方块网格
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: player.blockTypes.find(b => b.id === type).color,
    roughness: 0.7
  });
  
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x + 0.5, y + 0.5, z + 0.5);
  cube.castShadow = true;
  cube.receiveShadow = true;
  
  // 存储方块信息
  cube.userData = {
    isBlock: true,
    blockType: type,
    blockX: x,
    blockY: y,
    blockZ: z
  };
  
  scene.add(cube);
}

// 设置事件监听器
function setupEventListeners() {
  // 键盘控制
  const keysPressed = {};
  
  document.addEventListener('keydown', (event) => {
    keysPressed[event.code] = true;
    
    // 跳跃
    if (event.code === 'Space' && player.onGround && player.canJump) {
      player.velocity.y = player.jumpStrength;
      player.onGround = false;
      player.canJump = false; // 防止连续跳跃
    }
    
    // 数字键选择方块类型
    if (event.code.startsWith('Digit')) {
      const num = parseInt(event.code.substring(5));
      if (num >= 1 && num <= player.blockTypes.length) {
        player.selectedBlockType = num;
        updateSelectedBlockUI();
      }
    }
  });
  
  document.addEventListener('keyup', (event) => {
    keysPressed[event.code] = false;
    
    // 释放跳跃键后可以再次跳跃
    if (event.code === 'Space') {
      player.canJump = true;
    }
  });
  
  // 更新玩家移动
  window.updatePlayerMovement = () => {
    // 重置速度
    player.velocity.x = 0;
    player.velocity.z = 0;
    
    // 只有在鼠标锁定时才处理移动
    if (controls.isLocked) {
      // 计算移动方向
      const moveDirection = new THREE.Vector3();
      
      if (keysPressed['KeyW']) moveDirection.z -= 1;
      if (keysPressed['KeyS']) moveDirection.z += 1;
      if (keysPressed['KeyA']) moveDirection.x -= 1;
      if (keysPressed['KeyD']) moveDirection.x += 1;
      
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        
        // 根据相机方向调整移动方向
        moveDirection.applyQuaternion(camera.quaternion);
        moveDirection.y = 0; // 保持水平移动
        moveDirection.normalize();
        
        // 应用移动
        player.velocity.x = moveDirection.x * player.speed;
        player.velocity.z = moveDirection.z * player.speed;
      }
    }
  };
  
  // 鼠标点击
  document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;
    
    // 射线检测
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    raycaster.set(camera.position, direction);
    
    // 获取所有方块
    const blocks = scene.children.filter(child => child.userData && child.userData.isBlock);
    const intersects = raycaster.intersectObjects(blocks);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const block = intersect.object;
      
      // 左键破坏方块
      if (event.button === 0) {
        const { blockX, blockY, blockZ } = block.userData;
        setVoxel(blockX, blockY, blockZ, 0); // 移除方块
      }
      // 右键放置方块
      else if (event.button === 2) {
        const { point, face } = intersect;
        const normal = face.normal;
        
        // 计算新方块位置
        const newX = Math.floor(block.position.x + normal.x);
        const newY = Math.floor(block.position.y + normal.y);
        const newZ = Math.floor(block.position.z + normal.z);
        
        // 检查是否与玩家碰撞
        if (!wouldCollideWithPlayer(newX, newY, newZ)) {
          setVoxel(newX, newY, newZ, player.selectedBlockType);
        }
      }
    }
  });
  
  // 防止右键菜单
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
  
  // 鼠标滚轮切换方块类型
  document.addEventListener('wheel', (event) => {
    if (!controls.isLocked) return;
    
    if (event.deltaY < 0) {
      // 向上滚动，选择上一个方块类型
      player.selectedBlockType = ((player.selectedBlockType - 2 + player.blockTypes.length) % player.blockTypes.length) + 1;
    } else {
      // 向下滚动，选择下一个方块类型
      player.selectedBlockType = (player.selectedBlockType % player.blockTypes.length) + 1;
    }
    
    updateSelectedBlockUI();
  });
}

// 检查方块是否会与玩家碰撞
function wouldCollideWithPlayer(x, y, z) {
  const playerMinX = player.position.x - 0.3;
  const playerMaxX = player.position.x + 0.3;
  const playerMinY = player.position.y;
  const playerMaxY = player.position.y + 1.8;
  const playerMinZ = player.position.z - 0.3;
  const playerMaxZ = player.position.z + 0.3;
  
  return (
    x >= Math.floor(playerMinX) && x <= Math.floor(playerMaxX) &&
    y >= Math.floor(playerMinY) && y <= Math.floor(playerMaxY) &&
    z >= Math.floor(playerMinZ) && z <= Math.floor(playerMaxZ)
  );
}

// 更新玩家
function updatePlayer() {
  // 更新玩家移动
  window.updatePlayerMovement();
  
  // 应用重力
  player.velocity.y -= player.gravity;
  
  // 应用速度
  player.position.x += player.velocity.x;
  player.position.z += player.velocity.z;
  player.position.y += player.velocity.y;
  
  // 简单的碰撞检测
  const playerX = Math.floor(player.position.x);
  const playerY = Math.floor(player.position.y);
  const playerZ = Math.floor(player.position.z);
  
  // 检查脚下是否有方块
  const blockBelow = voxelWorld[`${playerX},${playerY-1},${playerZ}`];
  if (blockBelow) {
    player.onGround = true;
    player.velocity.y = 0;
    player.position.y = playerY + 0.1; // 稍微抬高以避免抖动
  } else {
    player.onGround = false;
  }
  
  // 更新相机位置
  if (controls.isLocked) {
    controls.getObject().position.copy(player.position);
    controls.getObject().position.y += 1.6; // 眼睛高度
  }
}

// 创建UI
function createUI() {
  // 创建物品栏
  const hotbar = document.createElement('div');
  hotbar.className = 'hotbar';
  document.body.appendChild(hotbar);
  
  // 创建物品槽
  for (let i = 0; i < player.blockTypes.length; i++) {
    const blockType = player.blockTypes[i];
    const slot = document.createElement('div');
    slot.className = 'hotbar-slot';
    if (blockType.id === player.selectedBlockType) {
      slot.classList.add('selected');
    }
    
    // 添加数字标签
    const label = document.createElement('div');
    label.className = 'slot-label';
    label.textContent = blockType.id;
    slot.appendChild(label);
    
    // 添加方块图标
    const icon = document.createElement('div');
    icon.className = 'slot-icon';
    icon.style.backgroundColor = '#' + blockType.color.toString(16).padStart(6, '0');
    slot.appendChild(icon);
    
    // 添加方块名称
    const name = document.createElement('div');
    name.className = 'slot-name';
    name.textContent = blockType.name;
    slot.appendChild(name);
    
    hotbar.appendChild(slot);
  }
  
  // 创建准星
  const crosshair = document.createElement('div');
  crosshair.className = 'crosshair';
  document.body.appendChild(crosshair);
  
  // 创建调试信息
  const debugInfo = document.createElement('div');
  debugInfo.className = 'debug-info';
  document.body.appendChild(debugInfo);
}

// 更新UI
function updateUI() {
  // 更新调试信息
  const debugInfo = document.querySelector('.debug-info');
  if (debugInfo) {
    debugInfo.textContent = `位置: ${Math.floor(player.position.x)}, ${Math.floor(player.position.y)}, ${Math.floor(player.position.z)}`;
  }
}

// 更新选中的方块UI
function updateSelectedBlockUI() {
  const slots = document.querySelectorAll('.hotbar-slot');
  slots.forEach((slot, index) => {
    if (player.blockTypes[index].id === player.selectedBlockType) {
      slot.classList.add('selected');
    } else {
      slot.classList.remove('selected');
    }
  });
}

// 显示选项菜单
function showOptions() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('pause-menu')?.style.display = 'none';
  document.getElementById('options-menu').style.display = 'flex';
}

// 显示关于菜单
function showAbout() {
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('about-menu').style.display = 'flex';
}

// 返回主菜单
function backToMainMenu() {
  document.getElementById('options-menu').style.display = 'none';
  document.getElementById('about-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

// 保存选项
function saveOptions() {
  // 在这里应该保存选项
  console.log('保存选项');
  
  // 返回主菜单
  backToMainMenu();
}

// 暂停游戏
function pauseGame() {
  if (isGameRunning && !isPaused) {
    isPaused = true;
    document.getElementById('pause-menu').style.display = 'flex';
  }
}

// 恢复游戏
function resumeGame() {
  if (isGameRunning && isPaused) {
    isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
  }
}

// 退出到主菜单
function exitToMainMenu() {
  isGameRunning = false;
  isPaused = false;
  document.getElementById('pause-menu').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}
