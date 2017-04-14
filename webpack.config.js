const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BASE_URL = 'http://localhost:3010';

module.exports = {
  entry: {
    dev: [
      'webpack-dev-server/client?http://0.0.0.0:3010',
      'webpack/hot/only-dev-server',
    ],
    app: [
      './src/app.js',
    ],
  },

  output: {
    path: '/build',
    publicPath: '/',
    filename: '[hash].[name].js',
  },

  resolve: {
    extensions: ['.js'],
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'resolve-url-loader',
            options: {
              silent: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name]-[hash:10].[ext]',
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
      chunks: ['dev', 'app'],
      inject: 'body',
      filename: 'index.html',
      baseurl: BASE_URL,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.ProvidePlugin({
      topojson: 'topojson',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],

  performance: { hints: false },
  devtool: 'source-map',

  devServer: {
    hot: true,
    contentBase: '/build',
    publicPath: '/',
    historyApiFallback: true,
    stats: 'minimal',
    port: 3010,
    proxy: {
      '/data/**': {
        target: 'http://localhost:3011',
      },
    },
  },
};
