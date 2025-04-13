/**
 * 玩家类
 * 表示游戏中的玩家实体
 */
export class Player {
    /**
     * 创建一个新的玩家
     * @param {Object} options - 玩家选项
     * @param {THREE.Vector3} options.position - 初始位置
     * @param {THREE.Vector3} options.rotation - 初始旋转
     * @param {number} options.speed - 移动速度
     * @param {number} options.jumpForce - 跳跃力度
     * @param {number} options.gravity - 重力
     */
    constructor(options = {}) {
        // 玩家属性
        this.position = options.position || new THREE.Vector3(0, 70, 0);
        this.rotation = options.rotation || new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = options.speed || 5.0;
        this.jumpForce = options.jumpForce || 8.0;
        this.gravity = options.gravity || 20.0;
        
        // 玩家状态
        this.grounded = false;
        this.flying = false;
        this.sprinting = false;
        this.health = 20;
        this.maxHealth = 20;
        this.food = 20;
        this.maxFood = 20;
        
        // 碰撞盒尺寸
        this.height = 1.8;
        this.width = 0.6;
        this.eyeHeight = 1.6;
        
        // 相机
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.updateCamera();
        
        // 射线投射器，用于检测碰撞和方块交互
        this.raycaster = new THREE.Raycaster();
        
        // 选中的方块
        this.selectedBlock = null;
        this.selectedBlockFace = null;
        
        // 物品栏
        this.inventory = {
            hotbar: Array(9).fill(null),
            selectedSlot: 0
        };
        
        // 初始化物品栏
        for (let i = 0; i < 9; i++) {
            this.inventory.hotbar[i] = i + 1; // 方块ID 1-9
        }
    }
    
    /**
     * 更新玩家
     * @param {number} deltaTime - 时间增量
     * @param {InputManager} inputManager - 输入管理器
     * @param {World} world - 游戏世界
     */
    update(deltaTime, inputManager, world) {
        // 处理输入
        this.handleInput(inputManager, deltaTime);
        
        // 应用重力
        if (!this.flying) {
            this.velocity.y -= this.gravity * deltaTime;
        }
        
        // 应用速度
        this.position.x += this.velocity.x * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // 碰撞检测
        this.handleCollisions(world);
        
        // 更新相机
        this.updateCamera();
        
        // 更新方块选择
        this.updateBlockSelection(world);
    }
    
    /**
     * 处理用户输入
     * @param {InputManager} inputManager - 输入管理器
     * @param {number} deltaTime - 时间增量
     */
    handleInput(inputManager, deltaTime) {
        // 移动方向
        const moveDirection = new THREE.Vector3(0, 0, 0);
        
        // 前后移动
        if (inputManager.isKeyPressed('KeyW')) {
            moveDirection.z -= 1;
        }
        if (inputManager.isKeyPressed('KeyS')) {
            moveDirection.z += 1;
        }
        
        // 左右移动
        if (inputManager.isKeyPressed('KeyA')) {
            moveDirection.x -= 1;
        }
        if (inputManager.isKeyPressed('KeyD')) {
            moveDirection.x += 1;
        }
        
        // 标准化移动方向
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }
        
        // 应用移动速度
        let currentSpeed = this.speed;
        
        // 冲刺
        if (inputManager.isKeyPressed('ShiftLeft')) {
            this.sprinting = true;
            currentSpeed *= 1.5;
        } else {
            this.sprinting = false;
        }
        
        // 计算移动向量
        const moveVector = new THREE.Vector3();
        
        // 前后移动
        moveVector.z = moveDirection.z;
        
        // 左右移动
        moveVector.x = moveDirection.x;
        
        // 应用相机旋转
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationY(this.rotation.y);
        moveVector.applyMatrix4(rotationMatrix);
        
        // 设置水平速度
        this.velocity.x = moveVector.x * currentSpeed;
        this.velocity.z = moveVector.z * currentSpeed;
        
        // 飞行模式
        if (this.flying) {
            // 上下移动
            if (inputManager.isKeyPressed('Space')) {
                this.velocity.y = currentSpeed;
            } else if (inputManager.isKeyPressed('ControlLeft')) {
                this.velocity.y = -currentSpeed;
            } else {
                this.velocity.y = 0;
            }
        } else {
            // 跳跃
            if (inputManager.isKeyPressed('Space') && this.grounded) {
                this.velocity.y = this.jumpForce;
                this.grounded = false;
            }
        }
        
        // 切换飞行模式
        if (inputManager.isKeyPressed('KeyF') && !this.flyKeyPressed) {
            this.flying = !this.flying;
            this.flyKeyPressed = true;
        } else if (!inputManager.isKeyPressed('KeyF')) {
            this.flyKeyPressed = false;
        }
        
        // 物品栏选择
        for (let i = 1; i <= 9; i++) {
            const keyCode = `Digit${i}`;
            if (inputManager.isKeyPressed(keyCode)) {
                this.inventory.selectedSlot = i - 1;
                break;
            }
        }
        
        // 鼠标旋转
        if (inputManager.isPointerLocked()) {
            const mouseSensitivity = 0.002;
            const mousePosition = inputManager.getMousePosition();
            
            this.rotation.y -= mousePosition.x * mouseSensitivity;
            this.rotation.x -= mousePosition.y * mouseSensitivity;
            
            // 限制上下视角
            this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
            
            // 重置鼠标移动
            inputManager.resetMouseMovement();
        }
    }
    
    /**
     * 处理碰撞
     * @param {World} world - 游戏世界
     */
    handleCollisions(world) {
        // 简化的碰撞检测
        const playerHalfWidth = this.width / 2;
        
        // 检查脚下的方块
        const floorX = Math.floor(this.position.x);
        const floorY = Math.floor(this.position.y - 0.1);
        const floorZ = Math.floor(this.position.z);
        
        // 检查是否站在实体方块上
        try {
            const blockBelow = world.getBlock(floorX, floorY, floorZ);
            const block = world.getBlockById(blockBelow);
            
            if (block && block.isSolid()) {
                if (this.position.y < floorY + 1.0 && this.velocity.y < 0) {
                    this.position.y = floorY + 1.0;
                    this.velocity.y = 0;
                    this.grounded = true;
                }
            } else {
                this.grounded = false;
            }
        } catch (error) {
            console.error('检查地面方块时出错:', error);
        }
        
        // 简单的水平碰撞检测
        const checkCollision = (x, y, z) => {
            try {
                const blockId = world.getBlock(x, y, z);
                const block = world.getBlockById(blockId);
                return block && block.isSolid();
            } catch (error) {
                console.error('检查碰撞时出错:', error);
                return false;
            }
        };
        
        // 检查头部碰撞
        if (this.velocity.y > 0) {
            const headX = Math.floor(this.position.x);
            const headY = Math.floor(this.position.y + this.height);
            const headZ = Math.floor(this.position.z);
            
            if (checkCollision(headX, headY, headZ)) {
                this.velocity.y = 0;
            }
        }
        
        // 检查水平碰撞
        const positions = [
            { x: this.position.x - playerHalfWidth, z: this.position.z - playerHalfWidth },
            { x: this.position.x + playerHalfWidth, z: this.position.z - playerHalfWidth },
            { x: this.position.x - playerHalfWidth, z: this.position.z + playerHalfWidth },
            { x: this.position.x + playerHalfWidth, z: this.position.z + playerHalfWidth }
        ];
        
        for (const pos of positions) {
            const blockX = Math.floor(pos.x);
            const blockZ = Math.floor(pos.z);
            
            // 检查玩家高度范围内的方块
            for (let y = Math.floor(this.position.y); y < Math.floor(this.position.y + this.height); y++) {
                if (checkCollision(blockX, y, blockZ)) {
                    // 计算推出方向
                    const pushX = this.position.x - (blockX + 0.5);
                    const pushZ = this.position.z - (blockZ + 0.5);
                    
                    // 标准化并应用推力
                    const length = Math.sqrt(pushX * pushX + pushZ * pushZ);
                    if (length > 0) {
                        const pushScale = (playerHalfWidth + 0.1) / length;
                        this.position.x = blockX + 0.5 + pushX * pushScale;
                        this.position.z = blockZ + 0.5 + pushZ * pushScale;
                    }
                }
            }
        }
    }
    
    /**
     * 更新相机位置和旋转
     */
    updateCamera() {
        // 设置相机位置
        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight;
        
        // 设置相机旋转
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.rotation.x;
        this.camera.rotation.y = this.rotation.y;
    }
    
    /**
     * 更新方块选择
     * @param {World} world - 游戏世界
     */
    updateBlockSelection(world) {
        // 设置射线起点和方向
        this.raycaster.set(
            this.camera.position,
            new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
        );
        
        // 最大射线距离
        const maxDistance = 5;
        
        // 射线步进
        const stepSize = 0.1;
        const steps = Math.ceil(maxDistance / stepSize);
        
        // 重置选中的方块
        this.selectedBlock = null;
        this.selectedBlockFace = null;
        
        // 射线检测
        let lastPos = null;
        
        for (let i = 0; i < steps; i++) {
            const distance = i * stepSize;
            const pos = new THREE.Vector3().copy(this.camera.position).add(
                new THREE.Vector3().copy(this.raycaster.ray.direction).multiplyScalar(distance)
            );
            
            // 获取方块坐标
            const blockX = Math.floor(pos.x);
            const blockY = Math.floor(pos.y);
            const blockZ = Math.floor(pos.z);
            
            // 获取方块
            const blockId = world.getBlock(blockX, blockY, blockZ);
            const block = world.getBlockById(blockId);
            
            // 如果找到实体方块
            if (block && block.isSolid()) {
                this.selectedBlock = { x: blockX, y: blockY, z: blockZ, id: blockId };
                
                // 确定方块面
                if (lastPos) {
                    // 计算面法线
                    const dx = lastPos.x - blockX;
                    const dy = lastPos.y - blockY;
                    const dz = lastPos.z - blockZ;
                    
                    // 确定哪个分量最大
                    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
                        this.selectedBlockFace = dx > 0 ? 'right' : 'left';
                    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
                        this.selectedBlockFace = dy > 0 ? 'top' : 'bottom';
                    } else {
                        this.selectedBlockFace = dz > 0 ? 'front' : 'back';
                    }
                }
                
                break;
            }
            
            lastPos = { x: blockX, y: blockY, z: blockZ };
        }
    }
    
    /**
     * 放置方块
     * @param {World} world - 游戏世界
     * @returns {boolean} 是否成功放置
     */
    placeBlock(world) {
        if (!this.selectedBlock || !this.selectedBlockFace) {
            return false;
        }
        
        // 获取当前选中的方块类型
        const blockId = this.inventory.hotbar[this.inventory.selectedSlot];
        if (!blockId) {
            return false;
        }
        
        // 计算放置位置
        let placeX = this.selectedBlock.x;
        let placeY = this.selectedBlock.y;
        let placeZ = this.selectedBlock.z;
        
        // 根据选中的面调整放置位置
        switch (this.selectedBlockFace) {
            case 'top':
                placeY += 1;
                break;
            case 'bottom':
                placeY -= 1;
                break;
            case 'front':
                placeZ += 1;
                break;
            case 'back':
                placeZ -= 1;
                break;
            case 'left':
                placeX -= 1;
                break;
            case 'right':
                placeX += 1;
                break;
        }
        
        // 检查放置位置是否与玩家碰撞
        const playerMinX = this.position.x - this.width / 2;
        const playerMaxX = this.position.x + this.width / 2;
        const playerMinY = this.position.y;
        const playerMaxY = this.position.y + this.height;
        const playerMinZ = this.position.z - this.width / 2;
        const playerMaxZ = this.position.z + this.width / 2;
        
        // 检查是否与玩家碰撞
        if (placeX + 1 > playerMinX && placeX < playerMaxX &&
            placeY + 1 > playerMinY && placeY < playerMaxY &&
            placeZ + 1 > playerMinZ && placeZ < playerMaxZ) {
            return false;
        }
        
        // 放置方块
        return world.setBlock(placeX, placeY, placeZ, blockId);
    }
    
    /**
     * 破坏方块
     * @param {World} world - 游戏世界
     * @returns {boolean} 是否成功破坏
     */
    breakBlock(world) {
        if (!this.selectedBlock) {
            return false;
        }
        
        // 破坏方块
        return world.setBlock(this.selectedBlock.x, this.selectedBlock.y, this.selectedBlock.z, 0);
    }
    
    /**
     * 调整窗口大小
     * @param {number} width - 窗口宽度
     * @param {number} height - 窗口高度
     */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
