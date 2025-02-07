import type { Comparator } from "@braidai/lang/comparator";
import { fold } from "./fold.js";

/**
 * Returns the minimum item in an iterable based on a comparator.
 */
export function minimum<Type>(iterable: Iterable<Type>, comparator: Comparator<Type>): Type | undefined {
	return fold(iterable, undefined, (left, right) => comparator(left, right) > 0 ? right : left);
}
