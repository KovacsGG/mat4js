# mat4js
JavaScript library to load Matlab Level 5 MAT-files as JavaScript objects.
Based on the documentation: https://www.mathworks.com/help/pdf_doc/matlab/matfile_format.pdf released for 2019b

## Installation
### via npm
```
$ npm install mat-for-js
```

### via pnpm
```
$ pnpm add mat-for-js
```

then use as

```js
import { read as readmat } from "mat-for-js"
readmat(ArrayBuffer)
```

```js
import * from "mat-for-js"
mat4js.read(ArrayBuffer)
```

### via script tag
Download `dist/mat4js.read.min.js` to your webserver and include it in your HTML:
```html
<script type="text/javascript" src="./mat4js.read.min.js"></script>
```

## Read
Use `mat4js.read(ArrayBuffer)`.

It returns a JavaScript object with a `.header` and `.data` property.

#### `.header`
contains 116 bytes of text.

Padding characters are not truncated.

#### `.data`
is an object containing the named arrays in the file. (`{name: content}`)

Matlab stores vectors as 2D but flat arrays (1xn or nx1). These are converted to plain 1D arrays (`[1, 2, 3]` instead of `[[1, 2, 3]]`) or strings in case of character arrays. In multidimensional character arrays the characters are not concatenated to form strings, but are kept separate. (`{char_array: [["a", "b", "c"], ["d", "e", "f"]]}` instead of `{char_array: ["abc", "def"]}`)

Numeric arrays with `Int64` or `Uint64` data types are converted into an array of `BigInt`.

Numeric arrays with imaginary component are converted into an array of objects with `.r` and `.i` properties for the real and imaginary components respectively.

Scalar structs are converted into objects as would be expected, while non-scalar structs are more akin to cell arrays. For a struct constructed with

```
S = struct()
S.cell = {1 2; 3 4}
S.fruit = 'apple'
```

In JavaScript

```js
S.cell[1][0] == 3
S.fruit == "apple"
```

But for one constructed with `S = struct('cell', {1 2; 3 4}, 'fruit', 'apple')` (non-scalar):

```js
S[1][0].cell == 3
S[1][1].cell == 4
S[1][0].fruit == "apple"
S[1][1].fruit == "apple"
```

and `S.fruit == "apple"` is not accessible.

Sparse arrays are converted to objects with `.x` and `.y` properties describing the width and height of the array respectively, and an `.nz` property containing an array of objects representing non-zero values. These objects also have `.x` and `.y` properties for their indices in the matrix and an additional `.v` for the non-zero value at the index.

## Build
If you want to rebuild `dist/readmat.min.js`, first install the dev dependencies with `npm install`.  Once `webpack` is installed, run `npm run build`.

## Limitaions
There is no support for Object array types.  64-bit integer type support depends on using a version of JavaScript that includes the `DataView.getBigInt64()`/`DataView.getBigUint64()` methods.

Matlab v7.3 MAT-files use HDF5 data structure and are not supported. Reading such files will throw a `FeatureError` with the `.feature` property set to `"HDF5"`. There are other JavaScript projects to view HDF5 files: https://github.com/usnistgov/jsfive

There is no write functionality.
