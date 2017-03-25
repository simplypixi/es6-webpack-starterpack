const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * We dynamically generate the HTML content in development so that the different
 * DLL Javascript files are loaded in script tags and available to our application.
 */
function templateContent() {
  const html = fs.readFileSync(
    path.resolve(process.cwd(), './index.html')
  ).toString();

  const doc = cheerio(html);
  const body = doc.find('body');

  return doc.toString();
}

module.exports = {
  entry: {
    main: path.join(process.cwd(), './main.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[hash].chunk.js'
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      children: true,
      minChunks: 2,
      async: true,
    }),
    new HtmlWebpackPlugin({
      // Inject all files that are generated by webpack, e.g. bundle.js
      inject: true,
      templateContent: templateContent(), // eslint-disable-line no-use-before-define
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          failOnError: true,
          cache: true
          // eslint options (if necessary)
          //quiet: true   :: for PROD
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
