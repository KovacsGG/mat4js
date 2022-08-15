const path = require("path")

const dev = {
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

const prod = {
	mode: "production",
	entry: {
		index: "./lib/index.js",
		read: "./lib/mat4js.read.js",
	},
	output: {
		path: path.resolve("./dist"),
		filename: "mat4js.[name].min.js",
		library: "mat4js",
	},
}

module.exports = [dev, prod]