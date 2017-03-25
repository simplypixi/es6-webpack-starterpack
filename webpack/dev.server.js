const path = require('path');
const webpack = require('webpack');
const {assign} = require('lodash');
const baseConfig = require('./base.config.js');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');
const app = express();

const config = assign(baseConfig, {
  devtool: 'cheap-module-eval-source-map',
  plugins: baseConfig.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ])
})

const compiler = webpack(config);

const middleware = webpackMiddleware(compiler, {
  noInfo: true,
  silent: true,
  stats: 'errors-only',
});

app.use(middleware);

app.use(webpackHotMiddleware(compiler));

const middlewareFs = middleware.fileSystem;

app.get('*', (req, res) => {
  middlewareFs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.send(file.toString());
    }
  });
});

app.listen(9000, 'localhost', (err) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('🚧  App is listening at http://%s:%s', 'localhost', 9000);
})