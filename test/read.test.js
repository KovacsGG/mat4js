import {read as matread} from "../lib/index.js"

import {readFile} from "node:fs/promises"

test("miINT8", async () => {
	const buffer = await readFile("test/data/int_vector.mat")
	const obj = matread(buffer.buffer)
	expect(obj).toEqual({
		"header": "MATLAB 5.0 MAT-file, Platform: GLNXA64, Created on: Fri Jul 31 15:33:27 2020                                        ",
		"data": {
			"a": [
				1,
				2,
				3,
				4,
			],
		},
	})
})
