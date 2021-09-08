module.exports = {
  lintOnSave: false,
  configureWebpack:{
    resolve: {
      alias: {
        assets: '@/assets',
        common: '@/common',
        components: '@/components',
        views: '@/views',
      },
    },
  },
};
