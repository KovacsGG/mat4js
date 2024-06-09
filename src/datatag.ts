export class DataTag {
    view: DataView
    length: number
    type: number
    dataLength: number

    constructor(arrayBuffer: ArrayBuffer, index: number, lEN: boolean) {
        this.view = new DataView(arrayBuffer, index, 8)

        // Checking the first two bytes for 0 (as per the docs) should not work, because
		// 1) length and type are not reversed as they should be for the small format,
		// 2) length can be 0. This creates ambiguity as to the length of the tag.
		// However, with the 64 bit padding considered, small and long format data tags
		// with 0 length data are identical.
        const longFormat = this.view.getInt32(0, lEN) >> 16 == 0
		if (longFormat) {
			this.type = this.view.getInt32(0, lEN)
			this.dataLength = this.view.getInt32(4, lEN)
			this.length = 8
		} else {
            this.view = new DataView(arrayBuffer, index, 4)
			// According to the specification these should be in the reverse order, but
			// the files that I can generate do not follow the specification.
			this.type = this.view.getInt16(0, lEN)
			this.dataLength = this.view.getInt16(2, lEN)
			this.length = 4
        }
    }
}