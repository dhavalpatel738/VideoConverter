require('update-electron-app')();
const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const { app, BrowserWindow, ipcMain } = electron;

let mainWindow = null;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: { backgroundThrottling: false }
  });
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

ipcMain.on('videos:added', (event, videos) => {
  // const promise = new Promise((resolve, reject) => {
  //   ffmpeg.ffprobe(videos[0].path, (err, metadata) => {
  //     resolve(metadata);
  //   });
  // });
  //
  // promise.then((metadata) => {
  //   console.log(metadata);
  // });

  const promises = _.map(videos, video => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.path, (err, metadata) => {
        video.duration = metadata.format.duration;
        video.format = 'avi';
        resolve(video);
      });
    });
  });

  Promise.all(promises)
    .then((results) => {
      mainWindow.webContents.send('metadata:complete', results);
    })

});

ipcMain.on('conversion:start', (event, videos) => {
  const video = videos[0];

  // const outputDir = video.path.split(video.name)[0];
  // const outputName = video.name.split('.')[0];
  //
  // const outputPath = `${outputDir}${outputName}.${video.format}`;
  //
  console.log(video);
});
