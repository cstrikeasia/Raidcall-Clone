const logger = require('../js/core/logger');
const StoreModule = require('../js/store');

class CreateAccount {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.registerBtn = document.querySelector('.create-account-btn');
    this.usernameInput = document.querySelector('#username');
    this.passwordInput = document.querySelector('#password');
    this.checkPasswordInput = document.querySelector('#check_password');
    this.emailInput = document.querySelector('#email');
    this.warningMessageBox = document.querySelector('.warning-message-box span');
    this.langData = null;
    this.initLanguage();
    this.initEvents();
    StoreModule.initEventListeners();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.registerBtn.addEventListener('click', () => this.register());
    this.usernameInput.addEventListener('keydown', (event) => this.Enter(event));
    this.passwordInput.addEventListener('keydown', (event) => this.Enter(event));
    this.checkPasswordInput.addEventListener('keydown', (event) => this.Enter(event));
    this.emailInput.addEventListener('keydown', (event) => this.Enter(event));
    window.addEventListener('storage', () => StoreModule.initLanguage());
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

  // Enter
  Enter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.register();
    }
  }

  // 註冊
  async register() {
    try {
      const username = this.usernameInput.value.trim().toLowerCase();
      const password = this.passwordInput.value.trim();
      const checkPassword = this.checkPasswordInput.value.trim();
      const email = this.emailInput.value.trim();
      ipcRenderer.send('register', { username, password, checkPassword, email });
      ipcRenderer.once('register-reply', (event, { success, code, titleCode, textCode, icon }) => {
        if (success) {
          logger.info('Register Success');
          ipcRenderer.send('open-pop-window', { code, titleCode, textCode, icon }, 207, 412, 'dialog', false);
          setTimeout(() => {
            ipcRenderer.send('open-lobby-window');
          }, 3000);
        }
        else {
          this.warningMessageBox.setAttribute('data-key', code || textCode);
          StoreModule.initLanguage();
          logger.info(`Register Failed with error code: ${code}`);
        }
      });
    }
    catch (error) {
      logger.error('A register error occurred:', error);
      ipcRenderer.send('open-pop-window', { code: 1005, titleCode: 30051, textCode: null, icon: 'warning' }, 207, 412, 'dialog', false);
    }
  }

  closeWindow() {
    ipcRenderer.send('close');
  }
}
new CreateAccount();
