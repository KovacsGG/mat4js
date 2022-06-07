const path = require("path");
const config = require("./package.json");

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, config.main),  // entry file to all our js modules
  output: {
    path: __dirname,  // path to output files
    filename: './dist/readmat.min.js',
	library: 'mat5'
  }
}
