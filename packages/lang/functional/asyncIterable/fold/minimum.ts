import type { Comparator } from "@braidai/lang/comparator";
import { foldAsync } from "./fold.js";

/**
 * Returns the minimum item in an async iterable based on a comparator.
 */

export async function minimumAsync<Type>(iterable: AsyncIterable<Type>, comparator: Comparator<Type>): Promise<Type | undefined> {
	return foldAsync(iterable, undefined, (left, right) => comparator(left, right) > 0 ? right : left);
}
