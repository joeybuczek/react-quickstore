const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = () => {
  return {
    mode: "production",
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
              plugins: [
                'transform-class-properties',
                'transform-object-rest-spread'
              ]
            }
          }
        }
      ]
    },
    optimization: {
      minimizer: [new UglifyJsPlugin()]
    }
  }
};