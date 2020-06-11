const { promisify } = require('util');
const { exec } = require('child_process');
const { MenuItem } = require('electron');
const {
  allContainers,
  isRunning,
  isStopped,
  startContainer,
  stopContainer,
} = require('./commands');

const execPromise = promisify(exec);

module.exports = {
  findContainers: async () => {
    const command = await execPromise(allContainers);
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
            id: `${containerId} ${containerName} Start`,
            label: 'Start',
            click: async function (menuItem, browserWindow, event) {
              const isStopedContainerId = await execPromise(
                isStopped(menuItem.id),
              );
              if (isStopedContainerId) {
                const id = isStopedContainerId.stdout.replace(/\n/g, '');
                const commandStart = startContainer(id);
                await execPromise(commandStart);
              }
            },
          },
          {
            id: `${containerId} ${containerName} Stop`,
            label: 'Stop',
            click: async function (menuItem, browserWindow, event) {
              const isRunningContainerId = await execPromise(
                isRunning(menuItem.id),
              );
              if (isRunningContainerId) {
                const id = isRunningContainerId.stdout.replace(/\n/g, '');
                const commandStart = stopContainer(id);
                await execPromise(commandStart);
              }
            },
          },
        ],
      });
      containersMenu.push(menu);
    });
    return containersMenu;
  },
};
