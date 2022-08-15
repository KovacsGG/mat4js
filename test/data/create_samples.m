samples = ["mxSINGLE", "mxDOUBLE", "mxINT8", "mxUINT8", ...
    "mxINT16", "mxUINT16", "mxINT32", "mxUINT32", ...
    "mxINT64", "mxUINT64", "mxCHAR", ...
    "mxCELL", "mxSTRUCT1", "mxSTRUCT2", "mxSPARSE", ...
    "LOGICAL"];

mxSINGLE = single([2, 3, 5]);
mxDOUBLE = [2, 3, 5];
mxINT8 = int8([2, 3, 5]);
mxUINT8 = uint8([2, 3, 5]);
mxINT16 = int16([2, 3, 5]);
mxUINT16 = uint16([2, 3, 5]);
mxINT32 = int32([2, 3, 5 + 5i]);
mxUINT32 = uint32([2, 3, 5]);
mxINT64 = [int64(10000000000000001), int64(10000000000000002), int64(10000000000000003)];
mxUINT64 = uint64([2, 3, 5]);

global mxCHAR;
mxCHAR = 'abc';

utf8_bytes = unicode2native('UTF-8', "UTF-8");
utf16_bytes = unicode2native('UTF-16', "UTF-16");
utf32_bytes = unicode2native('UTF-32', "UTF-32");
utf8 = native2unicode(utf8_bytes, "UTF-8");
utf16 = native2unicode(utf16_bytes, "UTF-16");
utf32 = native2unicode(utf32_bytes, "UTF-32");
mxCELL = {utf8, utf16, utf32};

mxSTRUCT1.alpha = 'num';
mxSTRUCT1.num_123 = [1, 2, 3];
mxSTRUCT2 = struct;

%mxOBJECT

mxSPARSE = sparse(eye(5) * 5);

LOGICAL = logical(mxSPARSE);

for name = samples
    save(name, name, "-v7", "-nocompression");
end

save("compressed", "mxDOUBLE", "-v7");
save("v7-3", "mxDOUBLE", "-v7.3");
save("v6", "mxDOUBLE", "-v6");
save("v4", "mxDOUBLE", "-v4");
