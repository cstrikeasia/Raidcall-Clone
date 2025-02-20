class Channel {
  constructor() {
    this.userOperateMenu = document.querySelector('.server-user-operate-context-menu');
    this.users = document.querySelectorAll('.server-channel-user-info ');
    this.userVipIcon = document.querySelectorAll('.server-channel-user-info .vip-icon');
    this.userInfoCard = document.querySelector('.server-user-info-card');
    this.badge = document.querySelectorAll('.server-channel-user-info .badge-icon img');
    this.badgeCard = document.querySelector('.server-badge-card');

    this.settingsButton = document.querySelector('.server-settings');
    this.settingsMenu = document.querySelector('.server-settings-context-menu');

    this.memberGroupChat = document.querySelector('li[data-key="30314"]');
    this.changeGroupName = document.querySelector('li[data-key="30292"]');

    this.serverPictureWrapper = document.querySelector('.server-picture-wrapper');

    this.isHoveringUser = {};
    this.isHoveringCard = {};

    this.initEvents();
  }

  // 初始化事件
  initEvents() {
    this.userVipIcon.forEach((user) => {
      user.addEventListener('mouseenter', (event) => this.showCardInfo(event, this.userInfoCard));
      user.addEventListener('mouseleave', () => this.hideCardInfoWithDelay(this.userInfoCard));
    });

    this.badge.forEach((user) => {
      user.addEventListener('mouseenter', (event) => this.showCardInfo(event, this.badgeCard));
      user.addEventListener('mouseleave', () => this.hideCardInfoWithDelay(this.badgeCard));
    });

    this.userInfoCard.addEventListener('mouseenter', () => {
      this.isHoveringCard[this.userInfoCard.classList[0]] = true;
      clearTimeout(this.hideTimeout);
    });

    this.userInfoCard.addEventListener('mouseleave', () => {
      this.isHoveringCard[this.userInfoCard.classList[0]] = false;
      this.hideCardInfo(this.userInfoCard);
    });

    this.badgeCard.addEventListener('mouseenter', () => {
      this.isHoveringCard[this.badgeCard.classList[0]] = true;
      clearTimeout(this.hideTimeout);
    });

    this.badgeCard.addEventListener('mouseleave', () => {
      this.isHoveringCard[this.badgeCard.classList[0]] = false;
      this.hideCardInfo(this.badgeCard);
    });

    this.users.forEach((user) => {
      user.addEventListener('contextmenu', (event) => {
        console.log(true);
        this.showContextMenu(event);
      });
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

    this.changeGroupName.addEventListener('click', (event) => {
      event.stopPropagation();
      this.settingsMenu.style.display = 'none';
      ipcRenderer.send('open-pop-window', { code: 1005, titleCode: 30051, textCode: null, icon: 'warning' }, 250, 420, 'change_group_name', false);
    });

    this.serverPictureWrapper.addEventListener('click', () => ipcRenderer.send('open-pop-window', { code: null, titleCode: null, textCode: null, icon: 'warning' }, 500, 600, 'server_setting', false));

    document.addEventListener('click', (event) => {
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

  // 顯示資訊卡
  showCardInfo(event, element) {
    const className = element.classList[0];
    this.isHoveringUser[className] = true;
    clearTimeout(this.hideTimeout);
    this.userInfoCard.style.display = 'none';
    this.badgeCard.style.display = 'none';
    const mouseX = event.pageX;
    const mouseY = event.pageY;
    const offsetX = 3;
    const offsetY = 3;
    let posX = mouseX + offsetX;
    let posY = mouseY + offsetY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const cardWidth = element.offsetWidth;
    const cardHeight = element.offsetHeight;
    if (posX + cardWidth > windowWidth) {
      posX = mouseX - cardWidth - offsetX;
    }
    if (posY + cardHeight > windowHeight) {
      posY = windowHeight - cardHeight - offsetY;
    }
    element.style.left = `${posX}px`;
    element.style.top = `${posY}px`;
    element.style.display = 'block';
  }

  // 滑鼠離開使用者時設定延遲隱藏
  hideCardInfoWithDelay(element) {
    const className = element.classList[0];
    this.isHoveringUser[className] = false;
    this.hideTimeout = setTimeout(() => {
      if (!this.isHoveringUser[className] && !this.isHoveringCard[className]) {
        element.style.display = 'none';
        if (element === this.userInfoCard) {
          this.badgeCard.style.display = 'none';
        }
        else if (element === this.badgeCard) {
          this.userInfoCard.style.display = 'none';
        }
      }
    }, 200);
  }

  // 滑鼠離開資訊卡時隱藏
  hideCardInfo(element) {
    const className = element.classList[0];
    this.isHoveringCard[className] = false;
    if (!this.isHoveringUser[className]) {
      element.style.display = 'none';
    }
  }
}

new Channel();
