const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: './src/app.js',

  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].chunk.js',
  },

  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              compact: true,
              presets: [
                [
                  'env', {
                    targets: {
                      browsers: ['last 2 versions'],
                    },
                    loose: true,
                    modules: false,
                    debug: true,
                  },
                ],
                'stage-2',
              ],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'World Map (choropleth)',
      template: './src/index.ejs',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.ProvidePlugin({
      topojson: 'topojson',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
};
