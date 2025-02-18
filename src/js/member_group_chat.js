const StoreModule = require('../js/store');
class CreateGroup {
  constructor() {
    this.userOperateMenu = document.querySelector('.member-group-operate-context-menu');
    this.users = document.querySelectorAll('.member-group-user');
    this.closeBtn = document.querySelector('.close');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
    StoreModule.initEventListeners();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    window.addEventListener('storage', () => StoreModule.initLanguage());

    this.users.forEach((user) => {
      user.addEventListener('contextmenu', (event) => this.showContextMenu(event));
    });

    document.addEventListener('click', (event) => {
      if (this.userOperateMenu && !this.userOperateMenu.contains(event.target)) {
        this.userOperateMenu.style.display = 'none';
      }
    });
  }

  initLanguage() {
    ipcRenderer.send('get-language', `lang_${localStorage.getItem('lang') || 'tw'}`);
    ipcRenderer.removeAllListeners('language-response');
    ipcRenderer.on('language-response', (event, langData) => {
      if (langData.error) {
        return;
      }
      this.langData = langData;
    });
  }

  // 顯示右鍵菜單
  showContextMenu(event) {
    event.preventDefault();
    this.userOperateMenu.style.display = 'block';
    this.userOperateMenu.style.left = `${event.pageX}px`;
    this.userOperateMenu.style.top = `${event.pageY}px`;
  }

  closeWindow() {
    ipcRenderer.send('close');
  }
}
new CreateGroup();
