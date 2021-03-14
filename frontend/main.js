const electron = require('electron');
const home = electron.app;
const janela = electron.BrowserWindow;
const shell = electron.shell;

home.on('ready', function () {
  let janelaPrincipal = new janela({
    backgroundColor: '#000',
    width: 1280,
    height: 720,
    alwaysOnTop: false,
    show: false,
    title: 'Gresp Pro Finances',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      nodeIntegrationInSubFrames: true
    }
  });
  janelaPrincipal.loadURL(`file://${__dirname}/index.html`);
  janelaPrincipal.once('ready-to-show', () => {
    janelaPrincipal.show();
    janelaPrincipal.maximize();
  });

  //shell.openItem("C://grespprofinances-x64//executable//close.vbs")
  //shell.openItem("C://gresppro-x64//executaveis_modulos//startMongo.vbs")
  //shell.openItem("C://gresppro-x64//executaveis_modulos//startNode.vbs")

});