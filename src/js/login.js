const logger = require('../js/core/logger');
const langModule = require('../js/store');

class Login {
  constructor() {
    this.box = document.querySelectorAll('.remember-box, .sign-in-box');

    this.loginBtn = document.querySelector('.login-btn');
    this.cancelBtn = document.querySelector('.cancel-btn');
    this.loginForm = document.querySelector('.login-form');
    this.loginLoading = document.querySelector('.login-loading');
    this.usernameInput = document.querySelector('#username');
    this.passwordInput = document.querySelector('#password');
    this.usernameWarningMessage = document.querySelector('[data-key="20112"]');
    this.passwordWarningMessage = document.querySelector('[data-key="20113"]');
    this.minimizeBtn = document.querySelector('.minimize');
    this.closeBtn = document.querySelector('.close');
    this.loadingUsername = document.querySelector('.login-loading-username');
    langModule.initLanguage();
    this.loggingIn = false;
    this.initEvents();
  }

  // 初始化
  initEvents() {
    this.box.forEach((element) => this.toggleCheckbox(element));

    this.usernameInput.addEventListener('keydown', (event) => this.Enter(event));
    this.passwordInput.addEventListener('keydown', (event) => this.Enter(event));

    this.loginBtn.addEventListener('click', () => this.login());
    this.cancelBtn.addEventListener('click', () => this.cancelLogin());
    this.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
    this.closeBtn.addEventListener('click', () => this.closeWindow());
  }

  // 最小化視窗
  minimizeWindow() {
    ipcRenderer.send('minimize');
  }

  // 關閉視窗
  closeWindow() {
    ipcRenderer.send('hide');
  }

  // 勾選框
  toggleCheckbox(element) {
    element.addEventListener('click', () => {
      const targetDiv = element.querySelector('div');
      if (targetDiv) {
        targetDiv.classList.toggle('checked');
      }
    });
  }

  // Enter
  Enter(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.login();
    }
  }

  // 登入
  login() {
    this.usernameWarningMessage.style.display = 'none';
    this.passwordWarningMessage.style.display = 'none';

    if (!this.usernameInput.value.trim()) {
      this.usernameWarningMessage.style.display = 'block';
      return;
    }

    if (!this.passwordInput.value.trim()) {
      this.passwordWarningMessage.style.display = 'block';
      return;
    }

    this.loginForm.classList.add('hidden');
    this.loginLoading.classList.remove('hidden');
    this.loadingUsername.textContent = `${this.usernameInput.value}@raidcall.com.tw`;
    this.loggingIn = true;
    setTimeout(() => {
      // ipcRenderer.send('open-pop-window', { code: 26 }, 207, 412, 'dialog', false);
      if (this.loggingIn) {
        logger.info('Login Success');
        ipcRenderer.send('open-lobby-window');
      }
    }, 3000);

    ipcRenderer.removeAllListeners('stop-loading');
    ipcRenderer.on('stop-loading', () => {
      logger.info('Login Success');
      this.loginForm.classList.remove('hidden');
      this.loginLoading.classList.add('hidden');
    });
  }

  // 取消登入
  cancelLogin() {
    this.loggingIn = false;
    this.loginForm.classList.remove('hidden');
    this.loginLoading.classList.add('hidden');
  }
}
new Login();
