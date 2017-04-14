var path = require('path');
var webpack = require('webpack');
var ROOT_PATH = path.resolve(__dirname);
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: ['webpack/hot/dev-server', path.resolve(ROOT_PATH, 'app/main.jsx')],

    resolve: {
        extensions: ['', '.js', '.jsx']
    },

    output: {
        path: path.resolve(ROOT_PATH, 'build'),
        filename: 'bundle.js'
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'React ES2015',
            template: 'app/index.ejs',
        }),
        new webpack.HotModuleReplacementPlugin(),
        // new ExtractTextPlugin("stylesheets/styles.css")
    ],

    devServer: {
        hot: true,
        inline: true,
        progress: true,
        colors: true,
        host: "0.0.0.0",
        port: 8080,
    },

    node: {
        dns: 'empty',
        net: 'empty'
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ["transform-decorators-legacy"]
                }
            },
            // {
            //     test: /\.css$/,
            //     loader: ExtractTextPlugin.extract('style', 'css')
            // },
            { 
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader : 'file-loader'
            }
        ]
    }
};
