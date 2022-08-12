import {read as matread} from "../lib/index.js"

import {readFile, readdir} from "node:fs/promises"

describe("handling matlab types", () => {
	const files = {}
	beforeAll(async () => {
		const ls = (await readdir("./test/data")).filter(file => /.*\.mat/.test(file))
		const reads = ls.map(file => readFile("./test/data/" + file))
		const array = await Promise.all(reads)
		for (let i = 0; i < array.length; i++) files[ls[i]] = array[i].buffer
	})

	test("mxINT8", () => {
		const obj = matread(files["mxINT8.mat"])
		expect(obj.data).toEqual({mxINT8: [2, 3, 5]})
	})

	test("mxUINT8", () => {
		const obj = matread(files["mxUINT8.mat"])
		expect(obj.data).toEqual({mxUINT8: [2, 3, 5]})
	})
	
	test("mxINT16", () => {
		const obj = matread(files["mxINT16.mat"])
		expect(obj.data).toEqual({mxINT16: [2, 3, 5]})
	})
	
	test("mxUINT16", () => {
		const obj = matread(files["mxUINT16.mat"])
		expect(obj.data).toEqual({mxUINT16: [2, 3, 5]})
	})
	
	test("mxINT32", () => {
		const obj = matread(files["mxINT32.mat"])
		expect(obj.data).toEqual({mxINT32: [{r: 2, i: 0}, {r: 3, i: 0}, {r: 5, i: 5}]})
	})
	
	test("mxUINT32", () => {
		const obj = matread(files["mxUINT32.mat"])
		expect(obj.data).toEqual({mxUINT32: [2, 3, 5]})
	})
	
	test("mxINT64", () => {
		const obj = matread(files["mxINT64.mat"])
		expect(obj.data).toEqual({mxINT64: [10000000000000001n, 10000000000000002n, 10000000000000003n]})
	})
	
	test("mxUINT64", () => {
		const obj = matread(files["mxUINT64.mat"])
		expect(obj.data).toEqual({mxUINT64: [2, 3, 5]})
	})
	
	test("mxSINGLE", () => {
		const obj = matread(files["mxSINGLE.mat"])
		expect(obj.data).toEqual({mxSINGLE: [2, 3, 5]})
	})
	
	test("mxDOUBLE", () => {
		const obj = matread(files["mxDOUBLE.mat"])
		expect(obj.data).toEqual({mxDOUBLE: [2, 3, 5]})
	})

	test("mxCHAR", () => {
		const obj = matread(files["mxCHAR.mat"])
		expect(obj.data).toEqual({mxCHAR: "abc"})
	})

	test("mxCELL", () => {
		const obj = matread(files["mxCELL.mat"])
		expect(obj.data).toEqual({mxCELL: ["UTF-8", "UTF-16", "UTF-32"]})
	})

	test("mxSTRUCT1", () => {
		const obj = matread(files["mxSTRUCT1.mat"])
		expect(obj.data).toEqual({mxSTRUCT1: {alpha: "num", num_123: [1, 2, 3]}})
	})

	test("mxSTRUCT2", () => {
		const obj = matread(files["mxSTRUCT2.mat"])
		expect(obj.data).toEqual({mxSTRUCT2: {}})
	})

	test("mxSPARSE", () => {
		const obj = matread(files["mxSPARSE.mat"])
		expect(obj.data).toEqual(
			{mxSPARSE: {x: 5, y:5, nz: [
				{x:0, y:0, v:5},
				{x:1, y:1, v:5},
				{x:2, y:2, v:5},
				{x:3, y:3, v:5},
				{x:4, y:4, v:5}
			]}}
		)
	})
})