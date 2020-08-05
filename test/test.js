function read(input) {
	for (var i = 0; i < input.files.length; i++) {
		fileProcess(input.files[i]);
	}
}
function fileProcess(file) {
	fr = new FileReader();
	fr.onload = function (e) {
		var bin = e.target.result;
		console.log("===" + file.name + "===");
		console.log(bin);
		try {
			var json = mat5.read(bin);
			console.log(JSON.stringify(json));
			console.log(json);
		} catch (e) {
			console.log(e);
		}

	}
	fr.readAsArrayBuffer(file);
}
