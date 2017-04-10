var path = require('path');
var webpack = require('webpack');
var ROOT_PATH = path.resolve(__dirname);
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

    entry: [path.resolve(ROOT_PATH, 'app/main.jsx')],

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
        })
    ],

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
                    presets: ['es2015', 'react', 'stage-0']
                }
            },

            {
                test: /\.css$/,
                loaders: ['style', 'css']
            },
            { 
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    }
};
