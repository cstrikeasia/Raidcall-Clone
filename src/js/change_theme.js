const langModule = require('../js/store');
class ChangeTheme {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
    langModule.initEventListeners();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn.addEventListener('click', () => this.closeWindow());
    window.addEventListener('storage', () => langModule.initLanguage());
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
new ChangeTheme();
