const logger = require('../js/core/logger');

class ApplyMember {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.applyBtn = document.querySelector('.apply');
    this.applyElements = document.querySelectorAll('.apply-member-picture-box, .apply-member-group-name');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.applyBtn.addEventListener('click', () => this.closeWindow());
    this.applyElements.forEach((element) => {
      element.addEventListener('click', () => ipcRenderer.send('open-pop-window', { code: null, titleCode: null, textCode: null, icon: 'warning' }, 500, 600, 'server_setting', false));
    });
    ipcRenderer.removeAllListeners('set-code');
    ipcRenderer.on('set-code', (event, code, titleCode, textCode, icon) => {
      console.log(code, titleCode, textCode, icon);
      logger.info('code:', code, 'textCode:', textCode);
      this.initLanguage();
      this.updateTextWithCode(code, titleCode, textCode, icon);
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

  updateTextWithCode(code) {
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
new ApplyMember();
