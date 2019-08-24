const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const commonPaths = require('./common-paths')

const URL_BASE = 'https://midusi.github.io'

const config = {
  output: {
    filename: 'bundle.js',
    path: commonPaths.outputServerPath,
    publicPath: '/proyecto2019/'
  },
  devtool: 'source-map',
  mode: 'production',
  plugins: [
    new TerserWebpackPlugin({
      sourceMap: true
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [ commonPaths.outputPath ]
    }),
    new CopyWebpackPlugin([
      {
        from: commonPaths.template,
        to: commonPaths.templatesOutputServerPath,
        transform: content => {
          return Buffer.from(
            content.toString()
              .replace('<!-- base -->', `<base href="${URL_BASE}/">`)
              .replace(new RegExp('{{base}}', 'g'), `${URL_BASE}/proyecto2019/`),
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
