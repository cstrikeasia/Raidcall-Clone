const StoreModule = require('../js/store');

class ChangeTheme {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.header = document.querySelector('header');
    this.themeImages = document.querySelectorAll('.theme-images div');
    this.themeColors = document.querySelectorAll('.color-box');
    this.addColorButton = document.querySelector('.add-color-button');
    this.langData = null;

    this.initLanguage();
    this.initEvents();
    StoreModule.initEventListeners();
    StoreModule.applySavedTheme();
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn?.addEventListener('click', () => this.closeWindow());
    this.themeImages.forEach((theme, index) => {
      theme.addEventListener('click', () => this.changeTheme(index + 1));
    });
    this.themeColors.forEach((colorBox) => {
      colorBox.addEventListener('click', () => this.changeThemeColor(colorBox));
    });
    this.addColorButton?.addEventListener('click', () => this.uploadCustomImage());
    window.addEventListener('storage', () => StoreModule.initLanguage());
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
    this.header.style.backgroundImage = '';
    this.header.classList.remove(...this.header.classList);
    this.header.classList.add(`theme-${themeIndex}`);

    localStorage.setItem('selectedTheme', `theme-${themeIndex}`);
    localStorage.removeItem('selectedThemeColor');
    localStorage.removeItem('customThemeImage');
  }

  changeThemeColor(colorBox) {
    this.header.style.backgroundImage = '';
    this.header.classList.remove(...this.header.classList);
    const color = window.getComputedStyle(colorBox).backgroundColor;
    this.header.style.backgroundColor = color;

    localStorage.setItem('selectedThemeColor', color);
    localStorage.removeItem('selectedTheme');
    localStorage.removeItem('customThemeImage');
  }

  uploadCustomImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          this.header.style.backgroundImage = `url(${imageUrl})`;
          this.header.style.backgroundColor = '';
          this.header.classList.remove(...this.header.classList);
          localStorage.setItem('customThemeImage', imageUrl);
          localStorage.removeItem('selectedTheme');
          localStorage.removeItem('selectedThemeColor');
        };
        reader.readAsDataURL(file);
      }
    });

    input.click();
  }
}

const change_theme = new ChangeTheme();
console.log(change_theme);
