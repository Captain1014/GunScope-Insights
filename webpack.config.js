// // webpack.config.js
// const path = require('path');

// module.exports = {
//   entry: './src/index.js', // Update the entry point based on your project structure
//   output: {
//     path: path.resolve(__dirname, 'public'),
//     filename: 'main.js',
//   },
//   mode: 'development',
//   module: {
//     rules: [
//       // Add your loaders for different file types here
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//         },
//       },
//     ],
//   },
//   // Add other configuration options as needed
// };
