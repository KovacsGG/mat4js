import { DataTag } from "./datatag.js"
import { DataType } from "./data.js"

export class Element {
    length: number
    tag: DataTag
    data: InstanceType<DataType>

    constructor(arrayBuffer: ArrayBuffer, index: number, lEN: boolean) {
        this.tag = new DataTag(arrayBuffer, index, lEN)
        this.data = new this.tag.type(arrayBuffer, index + this.tag.length, this.tag.dataLength, lEN, this)
    }
}