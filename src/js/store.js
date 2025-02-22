const logger = require('../js/core/logger');
class StoreManager {
  constructor() {
    this.lang = localStorage.getItem('lang');
    this.initEventListeners();
  }

  // 綁定事件監聽
  initEventListeners() {
    ipcRenderer.removeAllListeners('language-response');
    ipcRenderer.on('language-response', (event, langData) => {
      if (langData.error) {
        logger.error(langData.error);
        return;
      }
      this.updateElementsWithLanguage(langData);
    });
  }

  initLanguage() {
    ipcRenderer.send('get-language', `lang_${localStorage.getItem('lang') || 'tw'}`);
  }

  // 更新界面多語言內容
  updateElementsWithLanguage(langData) {
    const attributes = [
      { selector: '[data-key]', attribute: 'textContent', dataAttr: 'data-key' },
      { selector: '[data-placeholder]', attribute: 'placeholder', dataAttr: 'data-placeholder' },
      { selector: '[data-title]', attribute: 'title', dataAttr: 'data-title' },
    ];
    attributes.forEach(({ selector, attribute, dataAttr }) => {
      document.querySelectorAll(selector).forEach((element) => {
        const key = element.getAttribute(dataAttr);
        const value = langData.STRING[key];
        if (value) {
          if (attribute === 'textContent') {
            element.textContent = value;
          }
          else {
            element.setAttribute(attribute, value);
          }
        }
      });
    });
  }

  // 套用主題或顏色
  applySavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedColor = localStorage.getItem('selectedThemeColor');
    const element = document.querySelector('header');
    element.classList.forEach((className) => {
      if (className.startsWith('theme-')) {
        element.classList.remove(className);
      }
    });
    if (savedTheme) {
      element.style.backgroundColor = '';
      element.classList.add(savedTheme);
    }
    else if (savedColor) {
      element.style.backgroundColor = savedColor;
    }
  }
}
module.exports = new StoreManager();
