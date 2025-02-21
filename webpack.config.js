import path from 'path';
import { fileURLToPath } from 'url';
import HTMLWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // clean: true,
  },
  mode: 'development',
  devServer: {
    watchFiles: {
      paths: ['index.html', 'src/**/*'],
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: 'index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
