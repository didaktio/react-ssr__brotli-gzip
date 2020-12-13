import { Configuration, DefinePlugin } from 'webpack';
import path from 'path';
import dotenv from 'dotenv';
import svgToMiniDataURI from 'mini-svg-data-uri';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NodeExternals from 'webpack-node-externals';
import CompressionPlugin from 'compression-webpack-plugin';
import zlib from 'zlib';


export default (env: any, argv: any): Configuration => {
  const config: Configuration = {
    mode: 'production',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: 'tsloader-tsconfig.json'
              },
            },
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader"
          ]
        },
        {
          test: /\.svg$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                generator: (content: any) => svgToMiniDataURI(content.toString()),
              },
            },
          ],
        },
      ]
    },
    plugins: [
      new DefinePlugin(stringifyValues(dotenv.config().parsed)),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css',
      })
    ],
    output: {
      path: path.resolve('server-build')
    },
  };

  if (env.WATCH) config.watch = true;

  if (env.PLATFORM === 'server') {
    config.target = 'node';
    config.entry = './server.tsx';
    config.output!.filename = 'index.js';
    config.externals = [NodeExternals()];
  }

  if (env.PLATFORM === 'client') {
    config.entry = './src/index.tsx';
    config.output!.filename = 'bundle.js';
    config.plugins.push(
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/
      }),
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|css|html|svg)$/,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        } as any
      })
    )
  }

  return config;
}


const stringifyValues = (object: { [key: string]: any; }) =>
  Object.entries(object).reduce((acc, curr) => ({ ...acc, [`${curr[0]}`]: JSON.stringify(curr[1]) }), {} as { [key: string]: string; });