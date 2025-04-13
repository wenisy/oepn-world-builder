/**
 * 渲染器类 - 负责场景渲染和相机管理
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
  }
  
  /**
   * 初始化渲染器
   */
  async init() {
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景
    
    // 创建雾效果，增加深度感
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);
    
    // 创建第一人称相机
    this.camera = new THREE.PerspectiveCamera(
      75, // 视野角度
      window.innerWidth / window.innerHeight, // 宽高比
      0.1, // 近平面
      1000 // 远平面
    );
    this.camera.position.set(0, 20, 0);
    
    // 创建WebGL渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false // 关闭抗锯齿以增强像素效果
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(1); // 固定像素比为1，增强像素效果
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 添加第一人称控制
    try {
      this.controls = new THREE.PointerLockControls(this.camera, this.renderer.domElement);
      document.addEventListener('click', () => {
        this.controls.lock();
      });
    } catch (error) {
      console.error('第一人称控制初始化失败:', error);
      // 如果失败，回退到轨道控制
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
    }
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
    this.scene.add(ambientLight);
    
    // 添加定向光（模拟太阳）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    return true;
  }
  
  /**
   * 处理窗口大小变化
   */
  handleResize() {
    if (!this.camera || !this.renderer) return;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * 更新相机位置
   */
  updateCamera(player) {
    if (!this.camera || !player) return;
    
    // 如果使用的是轨道控制器，不需要手动更新相机位置
    if (this.controls instanceof THREE.OrbitControls) {
      return;
    }
    
    // 更新相机位置
    this.camera.position.copy(player.position);
    this.camera.position.y += player.eyeHeight; // 玩家视线高度
  }
  
  /**
   * 渲染场景
   */
  render() {
    if (!this.scene || !this.camera || !this.renderer) return;
    
    // 如果使用的是轨道控制器，需要更新控制器
    if (this.controls instanceof THREE.OrbitControls) {
      this.controls.update();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * 射线检测，用于选择方块
   */
  raycast(origin, direction, maxDistance = 5) {
    const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
    const meshes = this.scene.children.filter(child => child.userData && child.userData.isBlock);
    
    const intersects = raycaster.intersectObjects(meshes, true);
    
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
}
