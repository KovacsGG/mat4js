function readMat(data) {
	function readDataElem(data, index) {
		var type, length, taglength;
		var view = new DataView(data);


		// Checking the first two bytes for 0 (as per the docs) should not work, because 1) length and type are not reversed as they shoud be for the small format, 2) length can be 0. This creates ambiguity as to the length of the tag. However, whith the 64 bit padding considered, small and long format data tags with 0 length data are identical.
		var longFormatFlag = false;
		if (view.getInt32(index, en) >>> 16 == 0) {
			longFormatFlag = true;
		}
		if (longFormatFlag) {
			type = view.getInt32(index, en);
			length = view.getInt32(index + 4, en);
			taglength = 8;
		} else {
			// According to the specification these should be in the reverse order, but the files that I've seen do not follow the specification.
			type = view.getInt16(index, en);
			length = view.getInt16(index + 2, en);
			taglength = 4;
		}

		var read = { type: type, length: round8byte(length + taglength) }; // Uncompressed data is padded
		switch (type) {
			case 1: // int8
				var arr = [];
				for (var i = 0; i < length; i++) {
					arr.push(view.getInt8(index + taglength + i));
				}
				read.data = arr
				return read;
			case 2: // uint8
				var arr = [];
				for (var i = 0; i < length; i++) {
					arr.push(view.getUint8(index + taglength + i));
				}
				read.data = arr
				return read;

			case 3: // int16
				var arr = [];
				for (var i = 0; i < length / 2; i++) {
					arr.push(view.getInt16(index + taglength + i * 2, en));
				}
				read.data = arr
				return read;
			case 4: // uint16
				var arr = [];
				for (var i = 0; i < length / 2; i++) {
					arr.push(view.getUint16(index + taglength + i * 2, en));
				}
				read.data = arr
				return read;

			case 5: // int32
				var arr = [];
				for (var i = 0; i < length / 4; i++) {
					arr.push(view.getInt32(index + taglength + i * 4, en));
				}
				read.data = arr
				return read;
			case 6: // uint32
				var arr = [];
				for (var i = 0; i < length / 4; i++) {
					arr.push(view.getUint32(index + taglength + i * 4, en));
				}
				read.data = arr
				return read;

			case 7: // single
				var arr = [];
				for (var i = 0; i < length / 4; i++) {
					arr.push(view.getFloat32(index + taglength + i * 4, en));
				}
				read.data = arr
				return read;

			case 8: // reserved
				throw new BadFormatException(index, "Data element's type is 8, 'Reserved' (unknown)");

			case 9: // double
				var arr = [];
				for (var i = 0; i < length / 8; i++) {
					arr.push(view.getFloat64(index + taglength + i * 8, en));
				}
				read.data = arr
				return read;

			case 10: // reserved
				throw new BadFormatException(index, "Data element's type is 10, 'Reserved' (unknown)");

			case 11: // reserved
				throw new BadFormatException(index, "Data element's type is 11, 'Reserved' (unknown)");

			case 12: // int64
				throw new BadFormatException(index, "Data element's type is 12, 'INT64' (unsupported)");
			case 13: // uint64
				throw new BadFormatException(index, "Data element's type is 13, 'UINT64' (unsupported)");

			case 14: // matrix
				var reader = index + taglength;
				// Array flags subelement is written as an int32, which makes manual byte shifting necessary
				if (en) { // little endian: taglength (8) + 8 byte + 4th bit of the 2nd byte is the real flag
					var realFlag = (view.getInt8(reader + 9) >> 3) & 1;
					var mxClass = view.getInt8(reader + 8);
				} else { // big endian: 5th bit of the 3rd byte
					var realFlag = (view.getInt8(reader + 10) >> 3) & 1;
					var mxClass = view.getInt8(reader + 11);
				}

				reader += 16;
				// Array dimensions
				var dim = readDataElem(data, reader);


				reader += dim.length;
				// Array name
				var name = "";
				var nameArr = readDataElem(data, reader);
				for (var i = 0; i < nameArr.data.length; i++) {
					name += String.fromCharCode(nameArr.data[i]);
				}

				reader += nameArr.length;
				// Array data
				function iterateN(size, flat) {
					var d = 0;
					var n = 0;
					var index = [];
					for (var i = 0; i < size.length; i++) index.push(0);
					function rec(size, d) {
						var res = [];
						for (var i = 0; size[d] > i; i++) {
							if (d == size.length - 1) {
								res.push(flat[calcIndex(index, size)]);
								index[n]++;
							} else {
								n++;
								res.push(rec(size, d + 1));
								index[n] = 0;
								n--;
								index[n]++;
							}
						}
						return res;
					}
					return rec(size, d);
				}
				var realArr = readDataElem(data, reader);
				reader += realArr.length;
				if (realFlag) {
					var imgArr = readDataElem(data, reader);
					reader += imgArr.length;

					var numArr = [];
					for (var i = 0; i < imgArr.data.length; i++) {
						numArr.push({ r: realArr.data[i], i: imgArr.data[i] });
					}
					var arrData = iterateN(dim.data, numArr);
				} else {
					var arrData = iterateN(dim.data, realArr.data);
				}

				read.name = name;
				read.data = arrData;
				return read;

			case 15: // compressed
				var compressed = new Uint8Array(data.slice(index + taglength, index + taglength + length));
				var inflate = new Zlib.Inflate(compressed, {
					'index': 0, // start position in input buffer
					'bufferSize': 56, // initial output buffer size
					'bufferType': 1, // buffer expantion type
					'resize': true, // resize buffer(ArrayBuffer) when end of decompression (default: false)
					'verify': false  // verify decompression result (default: false)
				});
				var plain = readDataElem(inflate.decompress().buffer, 0);
				if (plain.hasOwnProperty('data')) read.data = plain.data;
				if (plain.hasOwnProperty('name')) read.name = plain.name;
				if (plain.hasOwnProperty('e')) read.e = plain.e;
				read.length = length + taglength; // Compressed data doesn't use 64-bit padding
				return read;

			case 16: // utf8
				var arr = "";
				for (var i = 0; i < length; i++) {
					arr += String.fromCodePoint(view.getInt8(index + taglength + i));
				}
				read.data = arr
				return read;

			case 17: // utf16
				var arr = "";
				for (var i = 0; i < length; i++) {
					arr += String.fromCodePoint(view.getInt16(index + taglength + i, en));
				}
				read.data = arr
				return read;
			case 18: // utf32
				var arr = "";
				for (var i = 0; i < length; i++) {
					arr += String.fromCodePoint(view.getInt32(index + taglength + i, en));
				}
				read.data = arr
				return read;

		}
	}

	var view = new DataView(data);

	var en = true; // Little endian true
	var endianIndicator = view.getInt16(126, en);
	if (endianIndicator == 0x494D) {
		en = false;
	} else if (endianIndicator != 0x4D49) {
		throw new BadFormatException(126, "Expected 0x4D49 for big endian or 0x494D for little endian, but got " + endianIndicator);
	}

	var version = view.getInt16(124, en)
	if (version != 256) throw new BadFormatException(124, "Expected 0x0100 indicating level 5 MAT-file, but got " + version);

	// First 116 bytes is human-readable text field
	var header = "";
	for (var i = 0; i < 116; i++) {
		header += String.fromCharCode(view.getInt8(i));
	}

	var output = { header: header, data: {} };

	// TODO: Figure out what to do with "subsystem-specific data"

	var index = 128;
	while (index < data.byteLength) {
		var elem = readDataElem(data, index);
		if (elem.hasOwnProperty('name')) output.data[elem.name] = elem.data;
		if (elem.hasOwnProperty('e')) output.e = elem.e;

		index += elem.length;
	}
	return output;
}

function round8byte(byte) {
	if (byte % 8 == 0) return byte;
	return byte + (8 - byte % 8);
}
function calcIndex(index, size) {
	var i = index[0];
	for (var j = 1; j < size.length; j++) {
		i += index[j] * size[j - 1];
	}
	return i;
}

function BadFormatException(byte, error) {
	this.byte = byte; // Indexed from 0
	this.error = error;
	this.toString = function() {
		"Unexpected value when reading at byte " + byte + ": " + error;
	};
}
