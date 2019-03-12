const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const commonPaths = require('./common-paths')

const URL_BASE = 'https://midusi.github.io/proyecto2019/'

const config = {
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputServerPath,
    publicPath: '/'
  },
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    new TerserWebpackPlugin({
      sourceMap: true
    }),
    new CleanWebpackPlugin([
      commonPaths.outputServerPath
    ], {
      root: commonPaths.root
    }),
    new CopyWebpackPlugin([
      {
        from: commonPaths.template,
        to: commonPaths.templatesOutputServerPath,
        transform: content => {
          return Buffer.from(
            content.toString()
              .replace('<!-- base -->', `<base href="${URL_BASE}/">`)
              .replace(new RegExp('{{base}}', 'g'), '/'),
            'utf8'
          )
        }
      },
      {
        from: commonPaths.favicon,
        to: commonPaths.outputServerPath,
      }
    ]),
  ]
}

module.exports = config
