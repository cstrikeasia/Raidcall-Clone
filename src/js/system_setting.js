const logger = require('../js/core/logger');
const StoreModule = require('../js/store');
class SystemSetting {
  constructor() {
    this.closeBtn = document.querySelector('.close');
    this.confirmedBtn = document.querySelector('.confirmed');
    this.tabs = document.querySelectorAll('.system-setting-tab');
    this.pages = document.querySelectorAll('.system-setting-page');
    this.sliderBar = document.querySelector('.system-setting-slider-bar');
    this.sliderDrager = document.querySelector('.system-setting-slider-drager');
    this.isDragging = false;
    this.langData = null;
    this.initLanguage();
    this.initEvents();
  }

  initEvents() {
    this.closeBtn.addEventListener('click', () => this.closeWindow());
    this.confirmedBtn.addEventListener('click', () => this.closeWindow());
    window.addEventListener('storage', () => StoreModule.initLanguage());
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.switchPage(tab));
    });
    this.sliderDrager.addEventListener('mousedown', (event) => this.startDrag(event));
    ipcRenderer.removeAllListeners('set-code');
    ipcRenderer.on('set-code', (event, code, titleCode, textCode, icon) => {
      console.log(code, titleCode, textCode, icon);
      logger.info('code:', code, 'textCode:', textCode);
      this.initLanguage();
    });
  }

  startDrag() {
    this.isDragging = true;
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onStopDrag);
  }

  onDrag = (event) => {
    if (!this.isDragging) {
      return;
    }
    const sliderRect = this.sliderBar.getBoundingClientRect();
    const dragerWidth = this.sliderDrager.offsetWidth;
    let newLeft = event.clientX - sliderRect.left;
    if (newLeft < 0) {
      newLeft = -5;
    }
    else if (newLeft > sliderRect.width - dragerWidth) {
      newLeft = sliderRect.width - dragerWidth;
    }
    this.sliderDrager.style.left = newLeft + 'px';
  };

  onStopDrag = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onStopDrag);
  };

  switchPage(selectedTab) {
    this.tabs.forEach((tab) => tab.classList.remove('active'));
    this.pages.forEach((page) => page.style.display = 'none');
    selectedTab.classList.add('active');
    const pageKey = selectedTab.getAttribute('for') || selectedTab.getAttribute('data-key');
    const targetPage = document.querySelector(`.system-setting-page[data-page="${pageKey}"]`);
    if (targetPage) {
      targetPage.style.display = 'block';
    }
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
      StoreModule.updateElementsWithLanguage(langData);
    });
  }

  closeWindow() {
    ipcRenderer.send('close');
  }
}

new SystemSetting();
