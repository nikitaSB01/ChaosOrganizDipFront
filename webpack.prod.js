const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map", // Создание source maps для отладки в продакшн
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // Минификация JavaScript
        parallel: true,
      }),
      new CssMinimizerPlugin(), // Минификация CSS
    ],
  },
  plugins: [
    ...common.plugins, // Сохранение общих плагинов
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
    }),
  ],
});
