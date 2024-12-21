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
    ...(common.plugins || []), // Проверка на существование общих плагинов перед их использованием
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /\.(?:html|css|js)$/,
          handler: "StaleWhileRevalidate",
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
            },
          },
        },
      ],
    }),
  ],
});
