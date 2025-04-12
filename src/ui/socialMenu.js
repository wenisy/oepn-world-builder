/**
 * 初始化社交菜单
 * @param {Object} gameState - 游戏状态
 * @returns {Object} 社交菜单对象
 */
export function initSocialMenu(gameState) {
  // 创建社交菜单
  createSocialMenu();
  
  // 玩家列表
  let playerList = [];
  
  /**
   * 创建社交菜单
   */
  function createSocialMenu() {
    // 创建菜单容器
    const socialMenu = document.createElement('div');
    socialMenu.id = 'social-menu';
    
    // 添加菜单内容
    socialMenu.innerHTML = `
      <h2>社交中心</h2>
      
      <div class="tabs">
        <button class="tab-btn active" data-tab="players">玩家</button>
        <button class="tab-btn" data-tab="nations">国家</button>
        <button class="tab-btn" data-tab="alliances">联盟</button>
        <button class="tab-btn" data-tab="chat">聊天</button>
      </div>
      
      <div class="tab-content active" id="players-tab">
        <div class="search-bar">
          <input type="text" id="player-search" placeholder="搜索玩家...">
        </div>
        <div class="player-list"></div>
      </div>
      
      <div class="tab-content" id="nations-tab">
        <div class="nation-list">
          <p>暂无国家数据</p>
        </div>
        <button id="create-nation-btn">创建国家</button>
      </div>
      
      <div class="tab-content" id="alliances-tab">
        <div class="alliance-list">
          <p>暂无联盟数据</p>
        </div>
        <button id="create-alliance-btn">创建联盟</button>
      </div>
      
      <div class="tab-content" id="chat-tab">
        <div class="chat-messages">
          <p class="system-message">欢迎来到聊天频道！</p>
        </div>
        <div class="chat-input">
          <select id="chat-channel">
            <option value="global">全局</option>
            <option value="local">本地</option>
            <option value="nation">国家</option>
            <option value="alliance">联盟</option>
          </select>
          <input type="text" id="chat-message" placeholder="输入消息...">
          <button id="send-chat-btn">发送</button>
        </div>
      </div>
    `;
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(socialMenu);
    
    // 注册标签页切换事件
    const tabButtons = socialMenu.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有标签页和内容的活动状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        socialMenu.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // 激活当前标签页和内容
        button.classList.add('active');
        const tabId = button.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
    });
    
    // 注册玩家搜索事件
    const playerSearch = document.getElementById('player-search');
    playerSearch.addEventListener('input', () => {
      updatePlayerList();
    });
    
    // 注册创建国家按钮事件
    const createNationBtn = document.getElementById('create-nation-btn');
    createNationBtn.addEventListener('click', () => {
      showCreateNationDialog();
    });
    
    // 注册创建联盟按钮事件
    const createAllianceBtn = document.getElementById('create-alliance-btn');
    createAllianceBtn.addEventListener('click', () => {
      showCreateAllianceDialog();
    });
    
    // 注册发送聊天消息事件
    const sendChatBtn = document.getElementById('send-chat-btn');
    sendChatBtn.addEventListener('click', () => {
      sendChatMessage();
    });
    
    // 注册聊天输入框回车事件
    const chatMessage = document.getElementById('chat-message');
    chatMessage.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
  
  /**
   * 更新玩家列表
   */
  function updatePlayerList() {
    const playerListElement = document.querySelector('.player-list');
    const searchTerm = document.getElementById('player-search').value.toLowerCase();
    
    // 清空列表
    playerListElement.innerHTML = '';
    
    // 过滤玩家
    const filteredPlayers = playerList.filter(player => 
      player.name.toLowerCase().includes(searchTerm)
    );
    
    // 如果没有玩家，显示提示
    if (filteredPlayers.length === 0) {
      playerListElement.innerHTML = '<p>没有找到玩家</p>';
      return;
    }
    
    // 添加玩家项
    filteredPlayers.forEach(player => {
      const playerItem = document.createElement('div');
      playerItem.className = 'player-item';
      
      // 设置玩家信息
      playerItem.innerHTML = `
        <div class="player-avatar">${player.name.charAt(0)}</div>
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-status">${player.online ? '在线' : '离线'}</div>
        </div>
        <div class="player-actions">
          <button class="add-friend-btn" data-id="${player.id}">添加好友</button>
          <button class="send-message-btn" data-id="${player.id}">发送消息</button>
        </div>
      `;
      
      // 添加到列表
      playerListElement.appendChild(playerItem);
    });
    
    // 注册玩家操作按钮事件
    playerListElement.querySelectorAll('.add-friend-btn').forEach(button => {
      button.addEventListener('click', () => {
        const playerId = button.dataset.id;
        addFriend(playerId);
      });
    });
    
    playerListElement.querySelectorAll('.send-message-btn').forEach(button => {
      button.addEventListener('click', () => {
        const playerId = button.dataset.id;
        openPrivateChat(playerId);
      });
    });
  }
  
  /**
   * 添加好友
   * @param {string} playerId - 玩家ID
   */
  function addFriend(playerId) {
    // 查找玩家
    const player = playerList.find(p => p.id === playerId);
    
    if (player) {
      // 这里应该发送添加好友请求到服务器
      console.log(`发送添加好友请求给玩家: ${player.name}`);
      
      // 显示提示
      alert(`已发送好友请求给 ${player.name}`);
    }
  }
  
  /**
   * 打开私聊
   * @param {string} playerId - 玩家ID
   */
  function openPrivateChat(playerId) {
    // 查找玩家
    const player = playerList.find(p => p.id === playerId);
    
    if (player) {
      // 切换到聊天标签页
      document.querySelector('.tab-btn[data-tab="chat"]').click();
      
      // 添加系统消息
      const chatMessages = document.querySelector('.chat-messages');
      chatMessages.innerHTML += `<p class="system-message">开始与 ${player.name} 的私聊</p>`;
      
      // 滚动到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
  
  /**
   * 显示创建国家对话框
   */
  function showCreateNationDialog() {
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    // 添加对话框内容
    dialog.innerHTML = `
      <h2>创建国家</h2>
      <div class="dialog-content">
        <div class="form-group">
          <label for="nation-name">国家名称</label>
          <input type="text" id="nation-name" placeholder="输入国家名称">
        </div>
        <div class="form-group">
          <label for="nation-description">国家描述</label>
          <textarea id="nation-description" placeholder="描述你的国家..."></textarea>
        </div>
        <div class="form-group">
          <label for="nation-flag">国旗颜色</label>
          <input type="color" id="nation-flag" value="#4CAF50">
        </div>
      </div>
      <div class="dialog-buttons">
        <button id="create-nation-confirm">创建</button>
        <button id="create-nation-cancel">取消</button>
      </div>
    `;
    
    // 创建对话框背景
    const dialogBackground = document.createElement('div');
    dialogBackground.className = 'dialog-background';
    dialogBackground.appendChild(dialog);
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(dialogBackground);
    
    // 注册按钮事件
    document.getElementById('create-nation-confirm').addEventListener('click', () => {
      // 获取输入值
      const name = document.getElementById('nation-name').value;
      const description = document.getElementById('nation-description').value;
      const flagColor = document.getElementById('nation-flag').value;
      
      // 验证输入
      if (!name) {
        alert('请输入国家名称');
        return;
      }
      
      // 创建国家
      createNation(name, description, flagColor);
      
      // 关闭对话框
      dialogBackground.remove();
    });
    
    document.getElementById('create-nation-cancel').addEventListener('click', () => {
      // 关闭对话框
      dialogBackground.remove();
    });
  }
  
  /**
   * 创建国家
   * @param {string} name - 国家名称
   * @param {string} description - 国家描述
   * @param {string} flagColor - 国旗颜色
   */
  function createNation(name, description, flagColor) {
    // 这里应该发送创建国家请求到服务器
    console.log(`创建国家: ${name}, 描述: ${description}, 国旗颜色: ${flagColor}`);
    
    // 显示提示
    alert(`国家 ${name} 创建成功！`);
    
    // 更新国家列表
    const nationList = document.querySelector('.nation-list');
    nationList.innerHTML = `
      <div class="nation-item">
        <div class="nation-flag" style="background-color: ${flagColor}"></div>
        <div class="nation-info">
          <div class="nation-name">${name}</div>
          <div class="nation-description">${description}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * 显示创建联盟对话框
   */
  function showCreateAllianceDialog() {
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    
    // 添加对话框内容
    dialog.innerHTML = `
      <h2>创建联盟</h2>
      <div class="dialog-content">
        <div class="form-group">
          <label for="alliance-name">联盟名称</label>
          <input type="text" id="alliance-name" placeholder="输入联盟名称">
        </div>
        <div class="form-group">
          <label for="alliance-description">联盟描述</label>
          <textarea id="alliance-description" placeholder="描述你的联盟..."></textarea>
        </div>
      </div>
      <div class="dialog-buttons">
        <button id="create-alliance-confirm">创建</button>
        <button id="create-alliance-cancel">取消</button>
      </div>
    `;
    
    // 创建对话框背景
    const dialogBackground = document.createElement('div');
    dialogBackground.className = 'dialog-background';
    dialogBackground.appendChild(dialog);
    
    // 添加到UI覆盖层
    document.getElementById('ui-overlay').appendChild(dialogBackground);
    
    // 注册按钮事件
    document.getElementById('create-alliance-confirm').addEventListener('click', () => {
      // 获取输入值
      const name = document.getElementById('alliance-name').value;
      const description = document.getElementById('alliance-description').value;
      
      // 验证输入
      if (!name) {
        alert('请输入联盟名称');
        return;
      }
      
      // 创建联盟
      createAlliance(name, description);
      
      // 关闭对话框
      dialogBackground.remove();
    });
    
    document.getElementById('create-alliance-cancel').addEventListener('click', () => {
      // 关闭对话框
      dialogBackground.remove();
    });
  }
  
  /**
   * 创建联盟
   * @param {string} name - 联盟名称
   * @param {string} description - 联盟描述
   */
  function createAlliance(name, description) {
    // 这里应该发送创建联盟请求到服务器
    console.log(`创建联盟: ${name}, 描述: ${description}`);
    
    // 显示提示
    alert(`联盟 ${name} 创建成功！`);
    
    // 更新联盟列表
    const allianceList = document.querySelector('.alliance-list');
    allianceList.innerHTML = `
      <div class="alliance-item">
        <div class="alliance-info">
          <div class="alliance-name">${name}</div>
          <div class="alliance-description">${description}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * 发送聊天消息
   */
  function sendChatMessage() {
    // 获取消息内容
    const messageInput = document.getElementById('chat-message');
    const message = messageInput.value.trim();
    
    // 获取频道
    const channel = document.getElementById('chat-channel').value;
    
    // 如果消息为空，不发送
    if (!message) return;
    
    // 这里应该发送消息到服务器
    console.log(`发送消息到${channel}频道: ${message}`);
    
    // 添加消息到聊天窗口
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML += `
      <div class="chat-message">
        <span class="message-sender">${gameState.player.name}:</span>
        <span class="message-content">${message}</span>
      </div>
    `;
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 清空输入框
    messageInput.value = '';
  }
  
  /**
   * 接收聊天消息
   * @param {Object} data - 消息数据
   */
  function receiveMessage(data) {
    // 添加消息到聊天窗口
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML += `
      <div class="chat-message">
        <span class="message-sender">${data.sender}:</span>
        <span class="message-content">${data.content}</span>
      </div>
    `;
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  /**
   * 设置玩家列表
   * @param {Array} players - 玩家数组
   */
  function setPlayerList(players) {
    playerList = players;
    updatePlayerList();
  }
  
  /**
   * 切换社交菜单显示状态
   */
  function toggle() {
    const menu = document.getElementById('social-menu');
    menu.classList.toggle('active');
  }
  
  /**
   * 更新社交菜单
   */
  function update() {
    // 这里可以添加需要每帧更新的逻辑
  }
  
  // 返回社交菜单对象
  return {
    toggle,
    update,
    setPlayerList,
    receiveMessage
  };
}
