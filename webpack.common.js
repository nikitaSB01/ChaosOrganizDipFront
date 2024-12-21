const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js", // Точка входа в приложение
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Папка для сборки
    clean: true, // Очистка папки dist перед новой сборкой
    assetModuleFilename: "assets/[name][ext]", // Место сохранения обработанных файлов
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Транспиляция JS-кода для совместимости
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Извлечение CSS в отдельный файл
          "css-loader", // Поддержка импорта CSS в JS
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/, // Обработка изображений
        type: "asset/resource", // Копирование изображений в папку `assets`
      },
      {
        test: /\.html$/, // Обработка HTML-файлов
        loader: "html-loader", // Позволяет корректно подключать пути из HTML
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Шаблон для HTML-файла
      favicon: "./src/assets/icons8-favicon-48.png", // Путь к фавиконке
      filename: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "style.css", // Имя CSS-файла в сборке
    }),
  ],
  resolve: {
    extensions: [".js", ".css"], // Расширения для импорта без указания
  },
};
