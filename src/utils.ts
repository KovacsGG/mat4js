export function readString(from: DataView, length: number, offset = 0,
    encoding: "utf-8" | "utf-16" | "utf-16be" = "utf-8") {
    const int8arr = new Int8Array(from.buffer, offset, length)
    return new TextDecoder(encoding).decode(int8arr)    
}

export function round8byte(index: number) {
    return (index + 7) & (~7)
}
