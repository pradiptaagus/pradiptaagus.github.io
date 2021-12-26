const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const TslintWebpackPlugin = require("tslint-webpack-plugin");

module.exports = {
    entry: "./src/index.tsx",
    plugins: [
        new webpack.ProvidePlugin({
            React: "react",
        }),
        new TslintWebpackPlugin({
            files: ["src/**/*{ts,tsx}"],
        }),
        new HtmlWebpackPlugin({
            title: "Portfolio",
            template: path.join(__dirname, "public/index.html"),
        }),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        publicPath: "/",
    },
    optimization: {
        moduleIds: "deterministic",
        runtimeChunk: true,
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                },
            },
        },
        runtimeChunk: "single",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            ["@babel/preset-react", { runtime: "automatic" }],
                            "@babel/preset-typescript",
                        ],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
            {
                test: /\.svg/,
                type: "asset/inline"
            }
        ],
    },
};
