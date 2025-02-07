import type { LooseIndexedPredicate } from "@braidai/lang/functional/iterable/filter";
import type { BooleanConvertible } from "@braidai/lang/types";
import { truthy } from "@braidai/lang/functional/iterable/filter";
import { Iterator } from "@braidai/lang/functional/iterable/intrinsicIterator";
import { some } from "./some.js";

interface Every {
	/**
	 * Returns `true` if the predicate is truthy for all elements, otherwise `false`. Eagerly iterates
	 * the whole iterable until a falsey value is found.
	 */
	(iterable: Iterable<BooleanConvertible>): boolean;
	<Type>(
		iterable: Iterable<Type>,
		predicate: LooseIndexedPredicate<Type>,
	): boolean;
}

type AnyEvery = (
	iterable: Iterable<unknown>,
	predicate?: LooseIndexedPredicate<unknown>,
) => boolean;

export const every: Every = function(): AnyEvery {
	if (Iterator) {
		return (iterable, predicate = truthy) =>
			Iterator!.from(iterable).every(predicate);
	} else {
		return (iterable, predicate = truthy) =>
			!some(iterable, (value, index) => !Boolean(predicate(value, index)));
	}
}();
