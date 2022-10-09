const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

/*
let vueEnvPlugin =   new webpack.DefinePlugin({
  // allow access to process.env from within the vue app
  'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
  }
})
*/
module.exports = {
  transpileDependencies: true,
  configureWebpack: {
    devtool: 'eval-cheap-source-map',
    plugins: [
      new NodePolyfillPlugin() 
    ],
  }
}

 


/*const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = {
    runtimeCompiler: true,
    configureWebpack: {
      plugins: [
        new NodePolyfillPlugin()
      ],
      resolve: {
     
        fallback: {
          "fs": false,
          "tls": false,
          "net": false,
          "path": false,
          "assert": false,
          "http": require.resolve("stream-http") ,
          "https": require.resolve("https-browserify") ,
          "url": false,
          "stream": false,
          "crypto": require.resolve('crypto-browserify'),
          "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        } 
      },
      module: {
        rules: [
          {
            test: /\.(scss|css)$/,
            use: ['style-loader', 'css-loader','postcss-loader' ],
          },

        ]
      }
    }
  }
  */