export function readString(from: DataView, length: number, offset = 0,
    encoding: "utf-8" | "utf-16" | "utf-16be" = "utf-8") {
    const int8arr = new Int8Array(from.buffer, offset, length)
    return new TextDecoder(encoding).decode(int8arr)    
}

export function round8byte(index: number) {
    if (index % 8 == 0) return index
    return index + 8 - index % 8
}
