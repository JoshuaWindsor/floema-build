//Requirements
const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

//Development environment
const IS_DEVELOPMENT = process.env.NODE_ENV === 'dev'

//paths
const dirApp = path.join(__dirname, 'app')
const dirShared = path.join(__dirname, 'shared')
const dirStyles = path.join(__dirname, 'styles')
const dirNode = 'node_modules'

//Webpack module exports
module.exports = {
    entry: [
        path.join(dirApp, 'index.js'),
        path.join(dirStyles, 'index.scss')
    ],
    resolve: {
        modules: [
            dirApp,
            dirShared,
            dirStyles,
            dirNode
        ]
    },

    //webpack plugs
    plugins: [
        new webpack.DefinePlugin({
            IS_DEVELOPMENT
        }),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './shared',
                    to: ''
                }
            ]
        }),

        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),

        new CleanWebpackPlugin()
    ],

    // Webpack modules
    module: {
        rules: [
            {
                test: /\.js$/, //Check for .js files, handles with 'babel-loader'
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$/, //Check for .scss files, handles with loaders
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: ''
                    }
                },
                {
                    loader: 'css-loader',
                },
                {
                    loader: 'postcss-loader',
                },
                {
                    loader: 'sass-loader',
                },
                ]
            },
            // {
            //     //Check for image files, handles with 'file-loader'
            //     test: /\.(jpe?g|png|gif|svg|woff2?|fnt|webp)$/,
            //     loader: 'file-loader',
            //     options: {
            //         name(file) {
            //             return '[name].[ext]'
            //         },
            //         outputPath: 'images'
            //     }
            // },
            {
              test: /\.(png|jpg|gif|jpe?g|svg|woff2?|fnt|webp|mp4)$/,
              type: 'asset/resource',
              generator: {
                filename: '[name].[hash].[ext]',
              },
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'raw-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'glslify-loader',
                exclude: /node_modules/
            },
        ]
    },

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};