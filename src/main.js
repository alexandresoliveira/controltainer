const { resolve } = require('path');
const { app, Menu, Tray, MenuItem } = require('electron');

const { findContainers } = require('./utils/container');

app.dock.hide();

app.whenReady().then(async () => {
  const controltainerIcon = resolve(__dirname, 'assets', 'icon', 'icon.png');
  let tray = new Tray(controltainerIcon);

  function renderMenu(containers) {
    const refreshItem = new MenuItem({
      id: 'refresh-item',
      label: 'Refresh',
      click: async function (menuItem, browserWindow, event) {
        const containers = await findContainers();
        const contextMenu = renderMenu(containers);
        tray.setContextMenu(contextMenu);
      },
    });

    const menu = Menu.buildFromTemplate([
      refreshItem,
      new MenuItem({ type: 'separator' }),
      ...containers,
    ]);
    return menu;
  }

  const containers = await findContainers();
  const contextMenu = renderMenu(containers);
  tray.setToolTip('Controlling you containers is simple.');
  tray.setContextMenu(contextMenu);
});
