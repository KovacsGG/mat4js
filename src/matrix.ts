import { Data, NumericData, TYPE,
    miINT8,
    miUINT8,
    miINT16,
    miUINT16,
    miINT32,
    miUINT32,
    miSINGLE,
    miDOUBLE,
    miINT64,
    miUINT64,
 } from "./data";
import { Element } from "./element";

enum CLASS {
    mxCELL_CLASS = 1,
    mxSTRUCT_CLASS,
    mxOBJECT_CLASS,
    mxCHAR_CLASS,
    mxSPARSE_CLASS,
    mxDOUBLE_CLASS,
    mxSINGLE_CLASS,
    mxINT8_CLASS,
    mxUINT8_CLASS,
    mxINT16_CLASS,
    mxUINT16_CLASS,
    mxINT32_CLASS,
    mxUINT32_CLASS,
    mxINT64_CLASS,
    mxUINT64_CLASS,
}

export class miMATRIX extends Data {
    flagsSE: Element
    dimensionsSE: Element
    nameSE: Element
    data: NumericChar | Sparse
    class: CLASS
    complex: boolean
    global: boolean
    logical: boolean
    dimensions: number[]
    name: string

    constructor(arrayBuffer: ArrayBuffer, index: number, length: number, lEN: boolean, element: Element) {
        super(arrayBuffer, index, length, lEN, element)
        let head = index
        this.flagsSE = new Element(arrayBuffer, head, lEN)
        if (!(this.flagsSE.data instanceof miUINT32)) {
            throw new Error("Expected Array Flags subelement with type miUINT32.", {
                cause: {code:"WrongTagType", at: this.flagsSE.tag, expect: [TYPE.indexOf(miUINT32)]}
            })
        }
        head += this.flagsSE.length
        this.class = this.flagsSE.data.value[0] & 0xFF
        this.complex = Boolean(this.flagsSE.data.value[0] & 0x00000800) // 12th least significant bit
        this.global = Boolean(this.flagsSE.data.value[0] & 0x00000400) //11th least significant bit
        this.logical = Boolean(this.flagsSE.data.value[0] & 0x00000200) // 10th least significant bit
        
        this.dimensionsSE = new Element(arrayBuffer, head, lEN)
        if (!(this.dimensionsSE.data instanceof miINT32)) {
            throw new Error("Expected Dimensions Array subelement with type miINT32.", {
                cause: {code:"WrongTagType", at: this.dimensionsSE.tag, expect: [TYPE.indexOf(miINT32)]}
            })
        }
        head += this.dimensionsSE.length
        this.dimensions = this.dimensionsSE.data.value

        this.nameSE = new Element(arrayBuffer, head, lEN)
        if (!(this.nameSE.data instanceof miINT8)) {
            throw new Error("Expected Array Name subelement with type miINT8.", {
                cause: {code:"WrongTagType", at: this.nameSE.tag, expect: [TYPE.indexOf(miINT8)]}
            })
        }
        head += this.nameSE.length
        this.name = this.nameSE.data.value.join("")
        
        switch (this.class) {
            case CLASS.mxCHAR_CLASS:
            case CLASS.mxDOUBLE_CLASS:
            case CLASS.mxSINGLE_CLASS:
            case CLASS.mxINT8_CLASS:
            case CLASS.mxUINT8_CLASS:
            case CLASS.mxINT16_CLASS:
            case CLASS.mxUINT16_CLASS:
            case CLASS.mxINT32_CLASS:
            case CLASS.mxUINT32_CLASS:
            case CLASS.mxINT64_CLASS:
            case CLASS.mxUINT64_CLASS:
                this.data = new NumericChar(arrayBuffer, head, lEN, this.complex)
                break
            case CLASS.mxSPARSE_CLASS:
                const nzmax = this.flagsSE.data.value[1]
                this.data = new Sparse(arrayBuffer, head, lEN, this.complex, nzmax)
                break
        }
    }
}

class NumericChar {
    pr: Element
    pi?: Element

    constructor(arrayBuffer: ArrayBuffer, index: number, lEN: boolean, complex: boolean) {
        let head = index
        this.pr = new Element(arrayBuffer, head, lEN)
            assertNumeric(this.pr.data, "Expected Real part subelement with numeric type.")
            head += this.pr.length
            if (complex) {
                this.pi = new Element(arrayBuffer, head, lEN)
                assertNumeric(this.pi.data, "Expected Imaginary part subelement with numeric type.")
                head += this.pi.length
            }
    }
}

class Sparse {
    nzmax: number
    ir: Element
    jc: Element
    pr: Element
    pi?: Element

    constructor(arrayBuffer: ArrayBuffer, index: number, lEN: boolean, complex: boolean, nzmax: number) {
        let head = index
        this.nzmax = nzmax
        this.ir = new Element(arrayBuffer, head, lEN)
        if (!(this.ir.data instanceof miINT32)) {
            throw new Error("Expected Row Index subelement with type miINT32.", {
                cause: {code:"WrongTagType", at: this.ir.tag, expect: [TYPE.indexOf(miINT32)]}
            })
        }
        head += this.ir.length
        this.jc = new Element(arrayBuffer, head, lEN)
        if (!(this.jc.data instanceof miINT32)) {
            throw new Error("Expected Column Index subelement with type miINT32.", {
                cause: {code:"WrongTagType", at: this.jc.tag, expect: [TYPE.indexOf(miINT32)]}
            })
        }
        head += this.jc.length
        this.pr = new Element(arrayBuffer, head, lEN)
            assertNumeric(this.pr.data, "Expected Real part subelement with numeric type.")
            head += this.pr.length
            if (complex) {
                this.pi = new Element(arrayBuffer, head, lEN)
                assertNumeric(this.pi.data, "Expected Imaginary part subelement with numeric type.")
                head += this.pi.length
            }
    }
}

function assertNumeric(of: Data, msg: string = "Expected data element with numeric type."): asserts of is NumericData {
    if (!(of instanceof NumericData)) {
        throw new Error(msg, {
            cause: {code:"WrongTagType", at: of.element.tag,
            expect: [
                TYPE.indexOf(miINT8),
                TYPE.indexOf(miUINT8),
                TYPE.indexOf(miINT16),
                TYPE.indexOf(miUINT16),
                TYPE.indexOf(miINT32),
                TYPE.indexOf(miUINT32),
                TYPE.indexOf(miINT64),
                TYPE.indexOf(miUINT64),
                TYPE.indexOf(miSINGLE),
                TYPE.indexOf(miDOUBLE),
            ]}
        })
    }
}