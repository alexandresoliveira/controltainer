const { resolve } = require('path');
const { app, Menu, Tray, MenuItem } = require('electron');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

app.dock.hide();

async function findContainers() {
  const command = await execPromise(
    'docker ps -a --format "{{.ID}} {{.Names}}"',
  );
  const containers = command.stdout
    .split(/\n/g)
    .filter(item => item.length > 0);
  const containersMenu = [];
  containers.forEach(item => {
    const [containerId, containerName] = item.split(' ');
    const menu = new MenuItem({
      id: containerId,
      label: containerName,
      submenu: [
        {
          id: containerId,
          label: 'Start',
          click: async function (menuItem, browserWindow, event) {
            const commandIsStopped = `docker ps -a --filter "id=${menuItem.id}" --filter status=exited --format "{{.ID}}"`;
            const isStopedContainerId = await execPromise(commandIsStopped);
            if (isStopedContainerId) {
              const id = isStopedContainerId.stdout.replace(/\n/g, '');
              const commandStart = `docker start ${id}`;
              await execPromise(commandStart);
            }
          },
        },
        {
          id: containerId,
          label: 'Stop',
          click: async function (menuItem, browserWindow, event) {
            const commandIsRunning = `docker ps -a --filter "id=${menuItem.id}" --filter status=running --format "{{.ID}}"`;
            const isRunningContainerId = await execPromise(commandIsRunning);
            if (isRunningContainerId) {
              const id = isRunningContainerId.stdout.replace(/\n/g, '');
              const commandStart = `docker stop ${id}`;
              await execPromise(commandStart);
            }
          },
        },
      ],
    });
    containersMenu.push(menu);
  });
  return containersMenu;
}

function renderMenu(containers) {
  const refreshItem = new MenuItem({
    id: 'refresh-item',
    label: 'Refresh',
    click: function (menuItem, browserWindow, event) {
      const containers = findContainers();
      renderMenu(containers);
    },
  });

  const menu = Menu.buildFromTemplate([
    refreshItem,
    new MenuItem({ type: 'separator' }),
    ...containers,
  ]);
  return menu;
}

app.whenReady().then(async () => {
  const controltainerIcon = resolve(__dirname, 'assets', 'icon', 'icon.png');
  let tray = new Tray(controltainerIcon);
  const containers = await findContainers();
  const contextMenu = renderMenu(containers);
  tray.setToolTip('Controlling you containers is simple.');
  tray.setContextMenu(contextMenu);
});
