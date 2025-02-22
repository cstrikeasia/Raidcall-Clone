const StoreModule = require('../js/store');
const logger = require('../js/core/logger');
require('../js/change_theme');
class Dialog {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn.addEventListener('click', () => this.closeWindow());
    ipcRenderer.removeAllListeners('set-code');
    ipcRenderer.on('set-code', (event, code, titleCode, textCode, icon) => {
      console.log(code, titleCode, textCode, icon);
      logger.info('code:', code, 'textCode:', textCode);
      this.initLanguage();
      this.updateTextWithCode(code, titleCode, textCode, icon);
    });
    window.addEventListener('storage', (event) => {
      if (event.key === 'selectedTheme' || event.key === 'selectedThemeColor' || event.key === 'customThemeImage') {
        StoreModule.applySavedTheme();
      }
    });
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
    });
  }

  updateTextWithCode(code, titleCode, textCode, icon) {
    document.querySelector('header span').setAttribute('data-key', titleCode);
    document.querySelector('.dialog-msg').setAttribute('data-key', textCode);
    document.querySelector('.dialog-icon').classList.add(`dialog-icon-${icon}`);
    document.querySelectorAll('[data-key]').forEach((element) => {
      const key = element.getAttribute('data-key');
      const textTemplate = this.langData.STRING[key];

      if (textTemplate) {
        const updatedText = textTemplate.replace('%s', code);
        element.textContent = updatedText;
      }
    });
  }

  closeWindow() {
    ipcRenderer.send('close');
  }
}
new Dialog();
