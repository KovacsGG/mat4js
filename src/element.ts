import { DataTag } from "./datatag.js"
import { TYPE, Data } from "./data.js"

export class Element {
    length: number
    tag: DataTag
    data: Data

    constructor(arrayBuffer: ArrayBuffer, index: number, lEN: boolean) {
        this.tag = new DataTag(arrayBuffer, index, lEN)
        const T = TYPE[this.tag.type]
        if (T) {
            this.data = new T(arrayBuffer, index + this.tag.length, this.tag.dataLength, lEN, this)
        } else {
            throw new Error(`Unknown data element type ${this.tag.type} (reserved).`, {
                cause: {code: "UnkownDataType", at: this.tag}
            })
        }
    }
}