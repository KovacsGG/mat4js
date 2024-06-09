import * as utils from "./utils.js"

const HEADER_LENGTH = 128
const TEXT_FIELD_LENGTH = 116
const SUBSYSTEM_FIELD_LENGTH = 8
const VERSION = 0x0100

export default class Header {
	view: DataView
	lEN: boolean
	length = HEADER_LENGTH
	_text: string
	_subsystemDataOffset: string

	constructor(arrayBuffer: ArrayBuffer) {
		this.view = new DataView(arrayBuffer, 0, HEADER_LENGTH)
		this._text = utils.readString(this.view, TEXT_FIELD_LENGTH)
		this._subsystemDataOffset = utils.readString(this.view, SUBSYSTEM_FIELD_LENGTH, TEXT_FIELD_LENGTH)

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

	set text(s: string) {
		const arr = new TextEncoder().encode(s)
		if (arr.length > TEXT_FIELD_LENGTH) {
			throw new Error(`String exceeds maximum length of ${TEXT_FIELD_LENGTH} bytes.`, {
				cause: { code: "TextTooLong", maxlength: TEXT_FIELD_LENGTH, value: s}
			})
		} else {
			this._text = s
		}
	}

	set subsystemDataOffset(s: string) {
		const arr = new TextEncoder().encode(s)
		if (arr.length > SUBSYSTEM_FIELD_LENGTH) {
			throw new Error(`String exceeds maximum length of ${SUBSYSTEM_FIELD_LENGTH} bytes.`, {
				cause: { code: "TextTooLong", maxlength: SUBSYSTEM_FIELD_LENGTH, value: s}
			})
		} else {
			this._subsystemDataOffset = s
		}
	}

	get subsystemDataPresent() {
		return this._subsystemDataOffset != "" &&
		this._subsystemDataOffset != "        " &&
		this._subsystemDataOffset != "00000000"
	}
}