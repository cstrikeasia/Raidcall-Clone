const logger = require('../js/core/logger');
const StoreModule = require('../js/store');
class ServerSetting {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.tabs = document.querySelectorAll('.server-setting-tab');
    this.pages = document.querySelectorAll('.server-setting-page');
    this.userOperateMenu = document.querySelector('.server-setting-user-operate-context-menu');
    this.users = document.querySelectorAll('.server-setting-member-list-header-td');
    this.langData = null;

    this.initLanguage();
    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn.addEventListener('click', () => this.closeWindow());
    this.users.forEach((user) => {
      user.addEventListener('contextmenu', (event) => this.showContextMenu(event));
    });

    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.switchPage(tab));
    });

    document.addEventListener('click', (event) => {
      console.log(this.settingsMenu);
      if (this.userOperateMenu && !this.userOperateMenu.contains(event.target)) {
        this.userOperateMenu.style.display = 'none';
      }
    });

    ipcRenderer.removeAllListeners('set-code');
    ipcRenderer.on('set-code', (event, code, titleCode, textCode, icon) => {
      console.log(code, titleCode, textCode, icon);
      logger.info('code:', code, 'textCode:', textCode);
      this.initLanguage();
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

  switchPage(selectedTab) {
    this.tabs.forEach((tab) => tab.classList.remove('active'));
    this.pages.forEach((page) => page.style.display = 'none');
    selectedTab.classList.add('active');
    const pageKey = selectedTab.getAttribute('for') || selectedTab.getAttribute('data-key');
    const targetPage = document.querySelector(`.server-setting-page[data-page="${pageKey}"]`);
    if (targetPage) {
      targetPage.style.display = 'block';
    }
  }

  initLanguage() {
    ipcRenderer.send('get-language', `lang_${localStorage.getItem('lang') || 'tw'}`);
    ipcRenderer.removeAllListeners('language-response');
    ipcRenderer.on('language-response', (event, langData) => {
      if (langData.error) {
        logger.error(langData.error);
        return;
      }
      this.langData = langData;
      StoreModule.updateElementsWithLanguage(langData);
    });
  }

  closeWindow() {
    ipcRenderer.send('close');
  }
}

new ServerSetting();
