const PnpWebpackPlugin = require(`pnp-webpack-plugin`);
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  resolve: {
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              [
                '@babel/plugin-proposal-class-properties',
                {
                  loose: false,
                },
              ],
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    }),
    new MonacoWebpackPlugin(),
  ],
};
