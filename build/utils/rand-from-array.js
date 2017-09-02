"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get a random number of elements from an array
 * from: https://stackoverflow.com/a/19270021
 */
function getRandom(arr, n) {
    var result = new Array(n), len = arr.length, taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}
exports.default = getRandom;
