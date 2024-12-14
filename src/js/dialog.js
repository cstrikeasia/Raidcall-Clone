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
    ipcRenderer.on('set-code', (event, code) => {
      console.log('Received code:', code);
      this.updateTextWithCode(code);
    });
  }

  initLanguage() {
    ipcRenderer.send('get-language', `lang_${localStorage.getItem('lang')}`);
    ipcRenderer.removeAllListeners('language-response');
    ipcRenderer.on('language-response', (event, langData) => {
      if (langData.error) {
        console.error(langData.error);
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
new Dialog();
