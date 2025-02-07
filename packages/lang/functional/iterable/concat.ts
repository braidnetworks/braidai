import { identity } from "@braidai/lang/functional/function/identity";
import { transform } from "./transform.js";

/**
 * Iterate each item from an iterable of iterables.
 */
export function concat<Type>(iterators: Iterable<Iterable<Type>>): Iterable<Type> {
	return transform(iterators, identity);
}
