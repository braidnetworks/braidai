import type { LooseIndexedPredicate } from "@braidai/lang/functional/iterable/filter";
import type { BooleanConvertible } from "@braidai/lang/types";
import { truthy } from "@braidai/lang/functional/iterable/filter";
import { Iterator } from "@braidai/lang/functional/iterable/intrinsicIterator";

interface Some {
	/**
	 * Returns `true` if the predicate is truthy for any element, otherwise `false`. Eagerly iterates
	 * the whole iterable until a truthy value is found.
	 */
	(iterable: Iterable<BooleanConvertible>): boolean;
	<Type>(
		iterable: Iterable<Type>,
		predicate: LooseIndexedPredicate<Type>,
	): boolean;
}

type AnySome = (
	iterable: Iterable<unknown>,
	predicate?: LooseIndexedPredicate<unknown>,
) => boolean;

export const some: Some = function(): AnySome {
	if (Iterator) {
		return (iterable, predicate = truthy) =>
			Iterator!.from(iterable).some(predicate);
	} else {
		return (iterable, predicate = truthy) => {
			let index = 0;
			for (const value of iterable) {
				if (Boolean(predicate(value, index++))) {
					return true;
				}
			}
			return false;
		};
	}
}();
