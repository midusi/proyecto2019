const path = require('path')

module.exports = {
  context: path.resolve(__dirname, '../'),
  root: path.resolve(__dirname, '../../'),

  outputPath: path.resolve(__dirname, '../../', './'),
  outputServerPath: path.resolve(__dirname, '../../', './'),
  templatesOutputServerPath: path.resolve(__dirname, '../../', './'),

  entryPath: path.resolve(__dirname, '../', 'src/index.js'),
  sourcePath: path.resolve(__dirname, '../', 'src/'),

  locales: path.resolve(__dirname, '../', 'static/locales/'),
  models: path.resolve(__dirname, '../', 'static/models/'),
  images: path.resolve(__dirname, '../', 'static/images/'),
  template: path.resolve(__dirname, '../', 'public/index.html'),
  favicon: path.resolve(__dirname, '../', 'public/favicon.ico'),
}
