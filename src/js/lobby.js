const langModule = require('../js/store');
const path = require('path');
const fs = require('fs');

class Lobby {
  constructor() {
    this.minimizeBtn = document.querySelector('.minimize');
    this.maxsizeBtn = document.querySelector('.maxsize');
    this.closeBtn = document.querySelector('.close');
    this.dragArea = document.querySelector('header');
    this.onlineStateBox = document.querySelector('.online-state-box');
    this.dropDown = document.querySelector('.state-drop-down');
    this.stateDisplay = document.querySelector('.online-state');
    this.groupHeader = document.querySelector('.friends-groups-header');
    this.menuBtn = document.querySelector('.menu');
    this.menuDropDown = document.querySelector('.menu-drop-down');
    this.logOutBtn = document.querySelector('[data-type="logout"]');
    this.errorBox = document.querySelector('.error-box');

    this.groupHeaders = document.querySelectorAll('.friends-groups-header');
    this.friendWidget = document.querySelectorAll('.friends-widget');
    this.submenuOptions = document.querySelectorAll('.submenu-option');
    this.friendTabItems = document.querySelectorAll('.FriendTabItem');
    this.targetBox = document.querySelectorAll('.friends-box, .friends-recents-box');
    this.mainTabItems = document.querySelectorAll('#MainTab .tab-item');

    this.createGroupBtn = document.querySelector('.groups-header button[data-key="30014"]');
    this.myBtn = document.querySelector('.groups-header button[data-key="60004"]');
    this.changeThemeBtn = document.querySelector('.menu-option[data-key="60028"]');

    this.errorPageDom = path.join(__dirname, 'error.html');
    this.langData = null;
    this.isMaximized = false;

    this.initEvents();
    this.openGroup();
    this.errorPage();
    this.toggleDrag();
    langModule.initLanguage();
  }

  // 初始化
  initEvents() {
    this.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
    this.maxsizeBtn.addEventListener('click', () => this.toggleMaximizeWindow());
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.onlineStateBox.addEventListener('click', () => this.changeOnlineState());
    this.menuBtn.addEventListener('click', () => this.showMenu());
    this.logOutBtn.addEventListener('click', () => this.logOut());
    this.createGroupBtn.addEventListener('click', () => this.createGroup());
    this.myBtn.addEventListener('click', () => this.my());
    this.changeThemeBtn.addEventListener('click', () => this.changeTheme());
    this.submenuOptions.forEach((option) => this.submenuOptionsEvent(option));
    this.mainTabItems.forEach((item) => this.mainTabItemsEvent(item));
    this.friendTabItems.forEach((item) => this.friendTabItemsEvent(item));
    window.addEventListener('storage', () => langModule.initLanguage());
  }

  // 最小化視窗
  minimizeWindow() {
    ipcRenderer.send('minimize');
  }

  // 最大化/還原視窗
  toggleMaximizeWindow() {
    if (this.isMaximized) {
      this.maxsizeBtn.classList.remove('restore');
      ipcRenderer.send('restore');
    }
    else {
      this.maxsizeBtn.classList.add('restore');
      ipcRenderer.send('maximize');
    }
    this.isMaximized = !this.isMaximized;
  }

  // 關閉視窗
  closeWindow() {
    ipcRenderer.send('hide');
  }

  // 拖曳視窗
  toggleDrag() {
    ipcRenderer.removeAllListeners('toggle-drag');
    ipcRenderer.on('toggle-drag', (_, enableDrag) => {
      if (enableDrag) {
        this.dragArea.style.webkitAppRegion = 'drag';
      }
      else {
        this.dragArea.style.webkitAppRegion = 'no-drag';
      }
    });
  }

  // 選擇語言
  submenuOptionsEvent(option) {
    option.addEventListener('click', () => {
      this.submenuOptions.forEach((item) => item.classList.remove('selected'));
      option.classList.add('selected');
      const selectedLang = option.getAttribute('data-lang');
      localStorage.setItem('lang', selectedLang);
      ipcRenderer.send('get-language', `lang_${selectedLang || 'tw'}`);
    });
  }

  // 主Tab切換
  mainTabItemsEvent(item) {
    item.addEventListener('click', () => {
      const direction = document.querySelector('.direction');
      this.mainTabItems.forEach((tab) => tab.classList.remove('selected'));
      if (direction) {
        direction.classList.remove('direction');
      }
      item.classList.add('selected');
      console.log(`.${item.dataset.tab}-wrapper`);
      document.querySelector(`.${item.dataset.tab}-wrapper`).classList.add('direction');
    });
  }

  // 好友Tab切換
  friendTabItemsEvent(item) {
    item.addEventListener('click', () => {
      this.friendTabItems.forEach((tab) => tab.classList.remove('selected'));
      item.classList.add('selected');
      const targetClass = item.getAttribute('data-target');
      this.targetBox.forEach((box) => {
        box.classList.add('hidden');
      });
      document.querySelector(targetClass).classList.remove('hidden');
    });
  }

  // 修改在線狀態
  changeOnlineState() {
    this.dropDown.classList.toggle('visible');
    this.dropDown.addEventListener('click', (event) => {
      if (event.target.classList.contains('state-option')) {
        const selectedState = event.target.getAttribute('data-state');
        this.stateDisplay.classList.remove('online', 'busy', 'away', 'in-game');
        this.stateDisplay.classList.add(selectedState.toLowerCase());
      }
    });

    document.addEventListener('click', (event) => {
      if (!this.onlineStateBox.contains(event.target)) {
        this.dropDown.classList.remove('visible');
      }
    });
  }

  // 好友列表點擊
  openGroup() {
    this.groupHeaders.forEach((header) => {
      header.addEventListener('click', () => {
        const groupUsers = header.nextElementSibling;
        if (groupUsers) {
          groupUsers.classList.toggle('expanded');
          header.classList.toggle('expanded');
        }
      });
    });
  }

  // 菜單點擊
  showMenu() {
    this.menuDropDown.classList.toggle('hidden');

    document.addEventListener('click', (event) => {
      if (!this.menuBtn.contains(event.target)) {
        this.menuDropDown.classList.add('hidden');
      }
    });
  }

  // 錯誤頁面
  errorPage() {
    fs.readFile(this.errorPageDom, 'utf8', (err, data) => {
      if (err) {
        console.error('Failed to load error.html:', err);
        return;
      }
      this.errorBox.innerHTML = data;
      langModule.initLanguage();
    });
  }

  // 創建語音群
  createGroup() {
    ipcRenderer.send('open-pop-window', null, 435, 480, 'create_group', false);
  }

  // 個人專屬
  my() {
    const liveAnchor = document.querySelector('.live-anchors webview');
    const my = document.querySelector('.groups-my');
    liveAnchor.style.display = 'none';
    my.style.display = 'block';
  }

  // 更換主題
  changeTheme() {
    ipcRenderer.send('open-pop-window', null, 371, 480, 'change_theme', false);
  }
}
new Lobby();
