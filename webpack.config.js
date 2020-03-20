module.exports = {
  entry: "./js/index.js",
  output: {
    filename: "./bundle.js"
  },
  devServer: {
    writeToDisk: true,
    historyApiFallback: {
      index: './index.html'
    }
  },
  optimization: {
     splitChunks: {
       chunks: 'async',
     },
   },

  mode : "development",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/react'],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.css$/,
         use: {loader : 'css-loader' }

      }
    ],

  },
  resolve: {
    extensions: ['.js', '.es6']
  },
}
