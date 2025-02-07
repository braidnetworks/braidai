/**
 * Generic bisect algorithm. Returns the first value which compares >= 0 in the range created
 * between `first` and `last`.
 */
export function bisect<Type>(
	first: Type,
	last: Type,
	divide: (low: Type, high: Type) => Type,
	boundComparator: (value: Type) => number,
): Type {
	if (first === last) {
		return first;
	}
	let low = first;
	let high = last;
	while (true) {
		const mid = divide(low, high);
		if (boundComparator(mid) < 0) {
			if (mid === low) {
				return high;
			}
			low = mid;
		} else {
			if (mid === high) {
				return low;
			}
			high = mid;
		}
	}
}
