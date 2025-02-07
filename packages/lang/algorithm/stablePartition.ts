import type { Predicate } from "@braidai/lang/predicate";

/**
 * Reorder the elements such that elements matching `predicate` are first. Relative order of
 * elements is preserved.
 */
export function stablePartition<Type>(
	array: Type[],
	predicate: Predicate<Type>,
	first = 0,
	last: number = array.length,
): number {
	let current = first;
	const notMatched: Type[] = [];
	for (let ii = current; ii < last; ++ii) {
		if (predicate(array[ii]!)) {
			array[current++] = array[ii]!;
		} else {
			notMatched.push(array[ii]!);
		}
	}
	const result = current;
	for (const value of notMatched) {
		array[current++] = value;
	}
	return result;
}
