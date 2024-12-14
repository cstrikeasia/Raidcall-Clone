document.onkeydown = (e) => {
  if (e.ctrlKey) {
    switch (e.code) {
      case 'KeyR':
        return ipcRenderer.send('reload');

      default:
        return;
    }
  }

  switch (e.code) {
    case 'F12':
      return ipcRenderer.send('open-dev-tool');
    case 'Tab':
      return e.preventDefault();
  }
};
