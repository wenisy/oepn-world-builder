const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * 认证管理类
 */
class Auth {
  constructor() {
    // 用户数据
    this.users = new Map();
    
    // 会话数据
    this.sessions = new Map();
    
    // 加载用户数据
    this.load();
  }
  
  /**
   * 加载用户数据
   */
  load() {
    try {
      // 检查用户数据文件是否存在
      const dataPath = path.join(__dirname, 'data', 'users.json');
      
      if (fs.existsSync(dataPath)) {
        // 读取用户数据
        const data = fs.readFileSync(dataPath, 'utf8');
        const users = JSON.parse(data);
        
        // 转换为Map
        for (const user of users) {
          this.users.set(user.username, user);
        }
        
        console.log('用户数据加载成功');
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  }
  
  /**
   * 保存用户数据
   */
  save() {
    try {
      // 确保数据目录存在
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // 转换为数组
      const users = Array.from(this.users.values());
      
      // 保存用户数据
      const dataPath = path.join(dataDir, 'users.json');
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf8');
      
      console.log('用户数据保存成功');
    } catch (error) {
      console.error('保存用户数据失败:', error);
    }
  }
  
  /**
   * 注册用户
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} email - 邮箱
   * @returns {Object} 注册结果
   */
  register(username, password, email) {
    // 检查用户名是否已存在
    if (this.users.has(username)) {
      return { success: false, message: '用户名已存在' };
    }
    
    // 生成盐值
    const salt = crypto.randomBytes(16).toString('hex');
    
    // 使用盐值哈希密码
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    // 创建用户对象
    const user = {
      username,
      hash,
      salt,
      email,
      createdAt: Date.now(),
      lastLogin: null
    };
    
    // 添加到用户列表
    this.users.set(username, user);
    
    // 保存用户数据
    this.save();
    
    return { success: true, message: '注册成功' };
  }
  
  /**
   * 登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Object} 登录结果
   */
  login(username, password) {
    // 获取用户
    const user = this.users.get(username);
    
    // 如果用户不存在，返回失败
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    // 使用盐值哈希密码
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    
    // 比较哈希值
    if (hash !== user.hash) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    // 生成会话ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // 创建会话
    const session = {
      id: sessionId,
      username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
    };
    
    // 添加到会话列表
    this.sessions.set(sessionId, session);
    
    // 更新最后登录时间
    user.lastLogin = Date.now();
    
    // 保存用户数据
    this.save();
    
    return { success: true, message: '登录成功', sessionId };
  }
  
  /**
   * 验证会话
   * @param {string} sessionId - 会话ID
   * @returns {Object} 验证结果
   */
  validateSession(sessionId) {
    // 获取会话
    const session = this.sessions.get(sessionId);
    
    // 如果会话不存在，返回失败
    if (!session) {
      return { valid: false, message: '会话不存在' };
    }
    
    // 检查会话是否过期
    if (session.expiresAt < Date.now()) {
      // 移除过期会话
      this.sessions.delete(sessionId);
      return { valid: false, message: '会话已过期' };
    }
    
    // 获取用户
    const user = this.users.get(session.username);
    
    // 如果用户不存在，返回失败
    if (!user) {
      // 移除无效会话
      this.sessions.delete(sessionId);
      return { valid: false, message: '用户不存在' };
    }
    
    return { valid: true, username: session.username };
  }
  
  /**
   * 注销
   * @param {string} sessionId - 会话ID
   * @returns {Object} 注销结果
   */
  logout(sessionId) {
    // 移除会话
    const removed = this.sessions.delete(sessionId);
    
    return { success: removed, message: removed ? '注销成功' : '会话不存在' };
  }
  
  /**
   * 清理过期会话
   */
  cleanupSessions() {
    const now = Date.now();
    
    // 遍历所有会话
    for (const [sessionId, session] of this.sessions.entries()) {
      // 如果会话过期，移除
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

module.exports = Auth;
