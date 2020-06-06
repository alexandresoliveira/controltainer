const { resolve } = require('path')
const { app, Menu, Tray } = require('electron')

const controltainerIcon = resolve(__dirname, 'assets', 'icon', 'control.png')

app.dock.hide();

app.whenReady().then(() => {
  let tray = new Tray(controltainerIcon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})
