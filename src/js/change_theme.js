const StoreModule = require('../js/store');

class ChangeTheme {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.header = document.querySelector('header');
    this.themeImages = document.querySelectorAll('.theme-images div');
    this.themeColors = document.querySelectorAll('.color-box');
    this.langData = null;

    this.initLanguage();
    this.initEvents();
    StoreModule.initEventListeners();
  }

  init() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedColor = localStorage.getItem('selectedThemeColor');
    if (savedTheme) {
      this.header.classList.add(savedTheme);
      this.header.style.backgroundColor = '';
    }
    else if (savedColor) {
      this.header.style.backgroundColor = savedColor;
    }
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn?.addEventListener('click', () => this.closeWindow());
    window.addEventListener('storage', () => StoreModule.initLanguage());

    this.themeImages.forEach((theme, index) => {
      theme.addEventListener('click', () => this.changeTheme(index + 1));
    });

    this.themeColors.forEach((colorBox) => {
      colorBox.addEventListener('click', () => this.changeThemeColor(colorBox));
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

  changeTheme(themeIndex) {
    this.header.style.backgroundColor = '';
    this.header.classList.remove(...this.header.classList);
    this.header.classList.add(`theme-${themeIndex}`);
    localStorage.setItem('selectedTheme', `theme-${themeIndex}`);
    localStorage.removeItem('selectedThemeColor');
  }

  changeThemeColor(colorBox) {
    this.header.classList.remove(...this.header.classList);
    const color = window.getComputedStyle(colorBox).backgroundColor;
    this.header.style.backgroundColor = color;
    localStorage.setItem('selectedThemeColor', color);
    localStorage.removeItem('selectedTheme');
  }
}

const change_theme = new ChangeTheme();
change_theme.init();
