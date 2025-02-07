import type { Comparator } from "@braidai/lang/comparator";
import { foldAsync } from "./fold.js";

/**
 * Returns the maximum item in an async iterable based on a comparator.
 */
export function maximumAsync<Type>(iterable: AsyncIterable<Type>, comparator: Comparator<Type>): Promise<Type | undefined> {
	return foldAsync(iterable, undefined, (left, right) => comparator(left, right) > 0 ? left : right);
}
