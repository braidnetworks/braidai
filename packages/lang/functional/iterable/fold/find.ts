import type { LooseIndexedPredicate } from "@braidai/lang/functional/iterable/filter";
import type { IndexedPredicateAs } from "@braidai/lang/predicate";
import { filter } from "@braidai/lang/functional/iterable/filter";
import { Iterator } from "@braidai/lang/functional/iterable/intrinsicIterator";
import { first } from "./first.js";

interface Find {
	/**
	 * Returns the first element of an iterable that matches the predicate or `undefined` if there is no
	 * match.
	 */
	<Type, Matched extends Type>(
		iterable: Iterable<Type>,
		predicate: IndexedPredicateAs<Type, Matched>,
	): Matched | undefined;

	<Type>(
		iterable: Iterable<Type>,
		predicate: LooseIndexedPredicate<Type>,
	): Type | undefined;
}

type AnyFind = (
	iterable: Iterable<unknown>,
	predicate: LooseIndexedPredicate<unknown>,
) => unknown;

export const find: Find = function(): AnyFind {
	if (Iterator) {
		return (iterable, predicate) =>
			Iterator!.from(iterable).find(predicate);
	} else {
		return (iterable, predicate) =>
			first(filter(iterable, predicate));
	}
}();
