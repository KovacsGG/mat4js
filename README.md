# mat4js
JavaScript library to load Matlab Level 5 MAT-files as JavaScript objects and vice versa.
Based on the documentation: https://www.mathworks.com/help/pdf_doc/matlab/matfile_format.pdf released for 2019b

## Installation
One way is to download `readmat.js` to your webserver and include it in your HTML. As most MAT-files contain zlib compressed data elements, you will also need to download `lib/inflate.min.js`.
```html
<script type="text/javascript" src="readmat.js"></script>
<script type="text/javascript" src="lib/inflate.min.js"></script>
```

## Read
Use `readMat(ArrayBuffer)`.

It returns a JavaScript object with a `header` and `data` property.

#### `header`
contains 116 bytes of text.

Padding characters are not truncated.

#### `data`
is an object containing the named arrays in the file. (`{name: content}`)

Named arrays within arrays lose their names.

Matlab likes to use flat but 2D arrays (e.g. 1x3). These are not unboxed and stay as `[[1, 2, 3]]`. To support actually multi-dimensional character arrays, these are not processed either. (`[["a", "p", "p", "l", "e"]]`)

Numeric arrays with imaginary component are converted into an array of objects with `r` and `i` attributes for the real and imaginary components respectively.

Sparse arrays are converted to objects with `x` and `y` describing the width and height of the array respectively, and an `nz` property containing an array of objects representing non-zero values. These objects also have `x` and `y` properties for their indeces in the matrix and an additional `v` for the value.

## Limitaions
There is no support for 64-bit data types and Structure, Object and 64-bit integer array types.

Matlab v7.3 MAT-files use HDF5 data structure and are not supported. Such files will raise an `UnsupportedFeatureException` with the `.feature` propery set to `"HDF5"`. There are other JavaScript projects to view HDF5 files: https://github.com/usnistgov/jsfive

There is no write functionality.
