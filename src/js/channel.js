class Channel {
  constructor() {
    this.userOperateMenu = document.querySelector('.server-user-operate-context-menu');
    this.users = document.querySelectorAll('.server-channel-user');

    this.settingsButton = document.querySelector('.server-settings');
    this.settingsMenu = document.querySelector('.server-settings-context-menu');

    this.memberGroupChat = document.querySelector('li[data-key="30314"]');

    this.serverPictureWrapper = document.querySelector('.server-picture-wrapper');

    this.initEvents();
  }

  // 初始化事件
  initEvents() {
    this.users.forEach((user) => {
      user.addEventListener('contextmenu', (event) => this.showContextMenu(event));
    });

    this.settingsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.openSettingMenu();
    });

    this.memberGroupChat.addEventListener('click', (event) => {
      event.stopPropagation();
      this.settingsMenu.style.display = 'none';
      ipcRenderer.send('open-pop-window', { code: 1005, titleCode: 30051, textCode: null, icon: 'warning' }, 550, 700, 'member_group_chat', false);
    });

    this.serverPictureWrapper.addEventListener('click', () => {
      ipcRenderer.send('open-pop-window', { code: null, titleCode: null, textCode: null, icon: 'warning' }, 500, 600, 'server_setting', false);
    });

    document.addEventListener('click', (event) => {
      console.log(this.settingsMenu);
      if (this.userOperateMenu && !this.userOperateMenu.contains(event.target)) {
        this.userOperateMenu.style.display = 'none';
      }

      if (this.settingsMenu && !this.settingsMenu.contains(event.target) && event.target !== this.settingsButton) {
        this.settingsMenu.style.display = 'none';
      }
    });
  }

  // 顯示右鍵菜單
  showContextMenu(event) {
    event.preventDefault();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const menuWidth = this.userOperateMenu.offsetWidth;
    const menuHeight = this.userOperateMenu.offsetHeight;
    let posX = event.pageX;
    if (posX + menuWidth > windowWidth) {
      posX = windowWidth - menuWidth - 10;
    }
    let posY = event.pageY;
    if (posY + menuHeight > windowHeight) {
      posY = windowHeight - menuHeight - 10;
    }
    this.userOperateMenu.style.display = 'block';
    this.userOperateMenu.style.left = `${posX}px`;
    this.userOperateMenu.style.top = `${posY}px`;
  }

  // 顯示設定菜單
  openSettingMenu() {
    this.settingsMenu.style.display = 'block';
  }
}

new Channel();
