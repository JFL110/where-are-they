module.exports = {
  entry: "./js/index.js",
  output: {
    filename: "./bundle.js"
  },
  watch : true,
  mode : "production",
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
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.es6']
  }
}
