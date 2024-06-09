
import * as utils from "./utils.js"
import {unzip, deflate} from "zlib"

import { Element } from "./element.js"

export abstract class Data {
    view: DataView
    length: number
    element: Element
    dataLength: number
    protected lEN: boolean

    constructor(arrayBuffer: ArrayBuffer, index: number, length: number, lEN: boolean, element: Element) {
        this.view = new DataView(arrayBuffer, index, length)
        this.lEN = lEN
        this.length = utils.round8byte(length + index)
        this.element = element
        this.dataLength = length
    }
}

abstract class SimpleData extends Data {
    abstract itemSize: number
    abstract itemGetter: (byteOffset: number) => any

    *[Symbol.iterator]() {
        for (let i = 0; i < this.dataLength; i += this.itemSize) {
            yield this.itemGetter(i)
        }
    }
}

export abstract class NumericData extends SimpleData {
    _value: number[]
    get value() {
        return this._value || Array.from(this)
    }
}
export class miINT8 extends NumericData {
    readonly itemSize = 1
    readonly itemGetter = this.view.getInt8
}
export class miUINT8 extends NumericData {
    readonly itemSize = 1
    readonly itemGetter = this.view.getUint8
}
export class miINT16 extends NumericData {
    readonly itemSize = 2
    readonly itemGetter = (i: number) => this.view.getInt16(i, this.lEN)
}
export class miUINT16 extends NumericData {
    readonly itemSize = 2
    readonly itemGetter = (i: number) => this.view.getUint16(i, this.lEN)
}
export class miINT32 extends NumericData {
    readonly itemSize = 4
    readonly itemGetter = (i: number) => this.view.getInt32(i, this.lEN)
}
export class miUINT32 extends NumericData {
    readonly itemSize = 4
    readonly itemGetter = (i: number) => this.view.getUint32(i, this.lEN)
}
export class miSINGLE extends NumericData {
    readonly itemSize = 4
    readonly itemGetter = (i: number) => this.view.getFloat32(i, this.lEN)
}
export class miDOUBLE extends NumericData {
    readonly itemSize = 8
    readonly itemGetter = (i: number) => this.view.getFloat64(i, this.lEN)
}
export class miINT64 extends NumericData {
    readonly itemSize = 8
    readonly itemGetter = (i: number) => this.view.getBigInt64(i, this.lEN)
}
export class miUINT64 extends NumericData {
    readonly itemSize = 8
    readonly itemGetter = (i: number) => this.view.getBigUint64(i, this.lEN)
}

abstract class StringData extends SimpleData {
    get value(): string {
        return Array.from(this).join("")
    }
}
export class miUTF8 extends StringData {
    readonly itemSize = 1
    readonly itemGetter = (i: number) => utils.readString(this.view, this.itemSize, i, "utf-8")
}
export class miUTF16 extends StringData {
    readonly itemSize = 2
    readonly itemGetter = (i: number) => utils.readString(this.view, this.itemSize, i, this.lEN?"utf-16":"utf-16be")
}
export class miUTF32 extends StringData {
    readonly itemSize = 4
    readonly itemGetter = (i: number) => String.fromCodePoint(this.view.getInt32(i, this.lEN))
}

export class miCOMPRESSED extends Data {
    value: Element

    constructor(arrayBuffer: ArrayBuffer, index: number, length: number, lEN: boolean, element: Element) {
        super(arrayBuffer, index, length, lEN, element)
        this.length = length // Compressed data doesn't use 64-bit padding
        
        unzip(this.view, (err, buffer) => {
            if (err) {
                throw Error("Error during decompression.", {cause: err})
            }
            this.value = new Element(buffer, 0, lEN)
        })
    }
}

import { miMATRIX } from "./matrix.js"

export const TYPE = [miINT8,
    miUINT8,
    miINT16,
    miUINT16,
    miINT32,
    miUINT32,
    miSINGLE,
    undefined,
    miDOUBLE,
    undefined,
    undefined,
    miINT64,
    miUINT64,
    miMATRIX,
    miCOMPRESSED,
    miUTF8,
    miUTF16,
    miUTF32]