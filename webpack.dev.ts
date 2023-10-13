import path from "path";
import webpack from "webpack";
import { merge } from "webpack-merge";

import common from "./webpack.common";

const config: webpack.Configuration = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 3000,
    liveReload: true,
  },
});

export default config;
