import * as utils from "./utils.js"

const HEADER_LENGTH = 128
const TEXT_FIELD_LENGTH = 116
const SUBSYSTEM_FIELD_LENGTH = 8
const VERSION = 0x0100

export default class Header {
	readonly view: DataView
	readonly lEN: boolean
	readonly length = HEADER_LENGTH

	constructor(arrayBuffer: ArrayBuffer) {
		this.view = new DataView(arrayBuffer, 0, HEADER_LENGTH)

		this.lEN = this.view.getInt16(TEXT_FIELD_LENGTH + SUBSYSTEM_FIELD_LENGTH + 2) == 0x494D
		if (this.view.getInt16(TEXT_FIELD_LENGTH + SUBSYSTEM_FIELD_LENGTH + 2, this.lEN) != 0x4D49) {
			throw new Error("Couldn't determine endianness.", {
				cause: {code: "InvalidEndianFlag", buffer: arrayBuffer, at: TEXT_FIELD_LENGTH + SUBSYSTEM_FIELD_LENGTH + 2 }
			})
		}
		const version = this.view.getInt16(TEXT_FIELD_LENGTH + SUBSYSTEM_FIELD_LENGTH, this.lEN)
		if (version != VERSION) {
			throw new Error(`Unknown version ${version}.`, {
				cause: { code: "InvalidVersion", buffer: arrayBuffer, at: TEXT_FIELD_LENGTH + SUBSYSTEM_FIELD_LENGTH }
			})
		}
	}

	get text() {
		return utils.readString(this.view, TEXT_FIELD_LENGTH)
	}

	set text(s: string) {
		const chArr = new TextEncoder().encode(s)
		if (chArr.length > TEXT_FIELD_LENGTH) {
			throw new Error(`String exceeds maximum length of ${TEXT_FIELD_LENGTH} bytes.`, {
				cause: { code: "TextTooLong", maxlength: TEXT_FIELD_LENGTH, value: s}
			})
		} else {
			for (let i = 0; i < chArr.length; i++) {
				this.view.setUint8(i, chArr[i])
			}
			for (let i = chArr.length; i < TEXT_FIELD_LENGTH; i++) {
				this.view.setUint8(i, 20)
			}
		}
	}

	set subsystemDataOffset(s: string) {
		const chArr = new TextEncoder().encode(s)
		const start = TEXT_FIELD_LENGTH
		if (chArr.length > SUBSYSTEM_FIELD_LENGTH) {
			throw new Error(`String exceeds maximum length of ${SUBSYSTEM_FIELD_LENGTH} bytes.`, {
				cause: { code: "TextTooLong", maxlength: SUBSYSTEM_FIELD_LENGTH, value: s}
			})
		} else {
			for (let i = 0; i < chArr.length; i++) {
				this.view.setUint8(start + i, chArr[i])
			}
			for (let i = chArr.length; i < SUBSYSTEM_FIELD_LENGTH; i++) {
				this.view.setUint8(start + i, 0)
			}
		}
	}

	get subsystemDataOffset() {
		return utils.readString(this.view, SUBSYSTEM_FIELD_LENGTH, TEXT_FIELD_LENGTH)
	}

	get subsystemDataPresent() {
		const sdo = this.subsystemDataOffset
		return sdo != "00000000" &&
		sdo != "        " &&
		sdo != ""
	}
}