const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");

const TARGET = process.env.npm_lifecycle_event;

const baseConfig = {
  entry: "./src/index.ts",
  output: {
    filename: "gusher.js",
    path: path.resolve(__dirname, "dist"),
    library: "Gusher",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [new CleanWebpackPlugin()]
};

if (TARGET === "start") {
  module.exports = merge(baseConfig, {
    mode: "development",
    plugins: [new HtmlWebpackPlugin()]
  });
}

if (TARGET === "build") {
  module.exports = merge(baseConfig, {
    mode: "production"
  });
}
