import type { Comparator } from "@braidai/lang/comparator";
import { bisect } from "./bisect.js";

/**
 * Applies the generic `bisect` algorithm to search an array for the lower bound of a given value.
 */
export function arrayBisect<
	Type extends Value,
	Value,
>(
	array: Type[],
	value: Value,
	comparator: Comparator<Value>,
): number {
	return bisect(
		0, array.length,
		(left, right) => (left + right) >> 1,
		ii => comparator(array[ii]!, value));
}
