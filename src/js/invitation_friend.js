const StoreModule = require('../js/store');
require('../js/change_theme');
class InvitationFriend {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
    StoreModule.initEventListeners();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    window.addEventListener('storage', () => StoreModule.initLanguage());
    window.addEventListener('storage', (event) => {
      if (event.key === 'selectedTheme' || event.key === 'selectedThemeColor') {
        StoreModule.applySavedTheme();
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

  closeWindow() {
    ipcRenderer.send('close');
  }
}
new InvitationFriend();
