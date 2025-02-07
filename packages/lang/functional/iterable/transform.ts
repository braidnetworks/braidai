import { Iterator, toIterable } from "@braidai/lang/functional/iterable/intrinsicIterator";

/**
 * Similar to `map` except the mapper returns an iterable which delegates to the result.
 */
export const transform: <Type, Result>(
	iterable: Iterable<Type>,
	callback: (value: Type, index: number) => Iterable<Result>,
) => Iterable<Result> = function() {
	if (Iterator) {
		return (iterable, callback) =>
			toIterable(Iterator!.from(iterable).flatMap(callback));
	} else {
		return function*(iterable, callback) {
			let index = 0;
			for (const value of iterable) {
				yield* callback(value, index++);
			}
		};
	}
}();
