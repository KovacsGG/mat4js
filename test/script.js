function read(input) {
	for (let i = 0; i < input.files.length; i++) {
		fileProcess(input.files[i])
	}
}

function fileProcess(file) {
	const fr = new FileReader()
	fr.onload = function(e) {
		const bin = e.target.result
		console.log("===" + file.name + "===")
		console.log(bin)
		try {
			const json = mat4js.read(bin)
			console.log(JSON.stringify(json))
			console.log(json)
		} catch (e) {
			console.log(e)
		}
	}
	fr.readAsArrayBuffer(file)
}
