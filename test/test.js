function read(input) {
	var file = input.files[0];
	if (file) {
		fr = new FileReader();
		fr.onload = function (e) {
			var bin = e.target.result;
			var json = readMat(bin);
			console.log(json);
		}
		fr.readAsArrayBuffer(file);
	}
}
