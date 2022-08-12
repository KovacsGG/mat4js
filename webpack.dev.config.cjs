const path = require("path")

module.exports = {
	mode: "development",
	entry: {
		index: "./lib/index.js",
		read: "./lib/mat4js.read.js",
	},
	output: {
		path: path.resolve("./dist"),
		filename: "mat4js.[name].js",
		library: "mat4js",
	},
}
