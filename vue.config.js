const path = require('path')

/**
 * Change the VueJS default folder from "src" to "vue/src"
 */
module.exports = {
  pages: {
    index: {
      entry: 'vue/src/main.js',
      template: 'vue/public/index.html'
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'vue/public')
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'vue/src')
      }
    },
  },
  chainWebpack: config => {
    config
      .plugin('copy')
      .use(require('copy-webpack-plugin'), [[{
        from: path.resolve(__dirname, 'vue/public'),
        to: path.resolve(__dirname, 'dist/vue/dist'),
        toType: 'dir',
        ignore: ['.DS_Store']
      }]])
  }
}
