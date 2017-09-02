/**
 * Get a random number of elements from an array
 * from: https://stackoverflow.com/a/19270021
 */
export default function getRandom<T>(arr: T[], n: number) : T[] {
	var result = new Array(n),
		len = arr.length,
		taken = new Array(len);
	if (n > len)
		throw new RangeError("getRandom: more elements taken than available");
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len;
	}
	return result;
}
