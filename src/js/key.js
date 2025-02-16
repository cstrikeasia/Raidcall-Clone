document.onkeydown = (e) => {
  if (e.ctrlKey) {
    switch (e.code) {
      case 'KeyR':
        return ipcRenderer.send('reload');
      default:
        return;
    }
  }
  if (e.code === 'Tab') {
    const activeElement = document.activeElement;
    if (
      activeElement
      && (activeElement.tagName === 'INPUT'
        || activeElement.tagName === 'TEXTAREA'
        || activeElement.tagName === 'SELECT'
        || activeElement.isContentEditable)
    ) {
      return;
    }
    e.preventDefault();
  }
  if (e.code === 'F12') {
    return ipcRenderer.send('open-dev-tool');
  }
};
