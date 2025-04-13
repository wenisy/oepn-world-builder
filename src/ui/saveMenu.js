import { socket } from '../network/client.js';

/**
 * 创建存档菜单
 * @returns {Object} 存档菜单对象
 */
export function createSaveMenu() {
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
    socket.emit('saves:list');
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
        deleteSave(save.id);
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
      // 发送选择存档事件
      socket.emit('save:select', { saveId: selectedSaveId });
      
      // 隐藏存档菜单
      hide();
    }
  }
  
  // 删除存档
  function deleteSave(saveId) {
    if (confirm('确定要删除这个世界吗？此操作不可恢复！')) {
      // 发送删除存档事件
      socket.emit('save:delete', { saveId });
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
    
    // 发送创建存档事件
    socket.emit('save:create', {
      name,
      description,
      worldParams: {
        initialEnvironment: environment
      }
    });
    
    // 重置表单
    nameInput.value = '';
    descInput.value = '';
    
    // 隐藏表单
    hideCreateSaveForm();
  }
  
  // 监听存档列表事件
  socket.on('saves:list', (data) => {
    updateSaveList(data.saves);
  });
  
  // 监听存档创建事件
  socket.on('save:created', (data) => {
    // 选择新创建的存档
    selectedSaveId = data.save.id;
    
    // 更新存档列表
    updateSaveList(saves);
    
    // 自动进入游戏
    enterSelectedSave();
  });
  
  // 监听存档删除事件
  socket.on('save:deleted', (data) => {
    if (data.success) {
      // 如果删除的是当前选中的存档，清除选中状态
      if (data.saveId === selectedSaveId) {
        selectedSaveId = null;
      }
      
      // 请求更新存档列表
      socket.emit('saves:list');
    }
  });
  
  // 返回菜单对象
  return {
    show,
    hide,
    updateSaveList
  };
}
