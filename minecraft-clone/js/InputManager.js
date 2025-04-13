/**
 * 输入管理器类
 * 处理键盘、鼠标和触摸输入
 */
export class InputManager {
    constructor() {
        // 按键状态
        this.keys = {};
        
        // 鼠标状态
        this.mouse = {
            x: 0,
            y: 0,
            buttons: {}
        };
        
        // 指针锁定状态
        this.pointerLocked = false;
        
        // 事件监听器
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 鼠标事件
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mousedown', this.handleMouseDown.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        
        // 指针锁定事件
        document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
        document.addEventListener('pointerlockerror', this.handlePointerLockError.bind(this));
    }
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyDown(event) {
        this.keys[event.code] = true;
    }
    
    /**
     * 处理键盘释放事件
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseMove(event) {
        if (this.pointerLocked) {
            // 在指针锁定模式下，使用movementX和movementY
            this.mouse.x += event.movementX;
            this.mouse.y += event.movementY;
        } else {
            // 否则使用clientX和clientY
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        }
    }
    
    /**
     * 处理鼠标按下事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseDown(event) {
        this.mouse.buttons[event.button] = true;
    }
    
    /**
     * 处理鼠标释放事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleMouseUp(event) {
        this.mouse.buttons[event.button] = false;
    }
    
    /**
     * 处理右键菜单事件
     * @param {MouseEvent} event - 鼠标事件
     */
    handleContextMenu(event) {
        // 阻止默认右键菜单
        event.preventDefault();
    }
    
    /**
     * 处理指针锁定变化事件
     */
    handlePointerLockChange() {
        this.pointerLocked = document.pointerLockElement !== null;
    }
    
    /**
     * 处理指针锁定错误事件
     */
    handlePointerLockError() {
        console.error('指针锁定失败');
    }
    
    /**
     * 请求指针锁定
     * @param {HTMLElement} element - 要锁定指针的元素
     */
    requestPointerLock(element) {
        if (element.requestPointerLock) {
            element.requestPointerLock();
        }
    }
    
    /**
     * 退出指针锁定
     */
    exitPointerLock() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
    
    /**
     * 检查按键是否被按下
     * @param {string} code - 按键代码
     * @returns {boolean} 是否按下
     */
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    /**
     * 检查鼠标按钮是否被按下
     * @param {number} button - 鼠标按钮 (0: 左键, 1: 中键, 2: 右键)
     * @returns {boolean} 是否按下
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttons[button] === true;
    }
    
    /**
     * 获取鼠标位置
     * @returns {Object} 包含x和y属性的对象
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    /**
     * 重置鼠标移动
     */
    resetMouseMovement() {
        this.mouse.x = 0;
        this.mouse.y = 0;
    }
    
    /**
     * 检查指针是否被锁定
     * @returns {boolean} 是否锁定
     */
    isPointerLocked() {
        return this.pointerLocked;
    }
}
