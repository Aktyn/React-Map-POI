const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
	entry: {
		main: './src/index.tsx',
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist')
	},
	watch: isDevelopment,
	watchOptions: isDevelopment ? {
  		poll: true,
  		ignored: /node_modules/
	} : undefined,
	mode: isDevelopment ? 'development' : 'production',
	devtool: isDevelopment && "source-map",
	devServer: {
		historyApiFallback: true,
		port: 3000,
		open: true
	},
	resolve: {
		extensions: ['.js', '.json', '.ts', '.tsx'],
	},

	optimization: isDevelopment ? undefined : {
		minimize: true
	},

	module: {
		rules: [
		    {
				test: /\.tsx?$/,
				use: 'ts-loader',//loader:
			    exclude: /node_modules/
			}, {
				test: /\.(s[ac]ss|css)$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							sourceMap: isDevelopment
						}
					}, {
						loader: "postcss-loader",
						options: {
							autoprefixer: {
								browsers: 'last 2 versions, > 1%'
							},
							sourceMap: isDevelopment,
							plugins: () => [
								autoprefixer
							]
						},
					}, {
						loader: 'sass-loader',
						options: {
							sourceMap: isDevelopment
						}
					}
				]
			}/*, {
				test: /\.(jpe?g|png|gif|svg|ttf|ogg|webp)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: '[name].[ext]',
							outputPath: 'assets/',
							useRelativePath: true,
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							mozjpeg: {
								progressive: true,
								quality: 90
							},
							optipng: {
								enabled: true,
							},
							pngquant: {
								quality: '80-90',
								speed: 4
							},
							gifsicle: {
								interlaced: false,
							},
							webp: {
								quality: 95
							}
						}
					}
				]
			}*//*, {
				test: /\.(fs|vs|glsl|txt)$/i,
				use: 'raw-loader',
			}*/
		],
	},

	plugins: [

		new MiniCssExtractPlugin({
			filename: "styles.css",
		}),

		new HtmlWebpackPlugin({
			hash: isDevelopment,
			favicon: './src/img/icons/favicon.png',
			title: 'React Map POI',
			minify: !isDevelopment,
			template: './src/index.html',
			filename: 'index.html'
		}),
	]
};
