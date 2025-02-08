import { identity } from "@braidai/lang/functional/function/identity";
import { map } from "@braidai/lang/functional/iterable/map";
import { fold } from "./fold.js";

const add = (left: number, right: number) => left + right;

/**
 * Computes the sum of an iterable of numbers. Sure you could do it with reduce this is easier to
 * use.
 */
export function accumulate(
	iterable: Iterable<number>
): number;

export function accumulate<Type>(
	iterable: Iterable<Type>,
	mapper: (value: Type) => number
): number;

export function accumulate(
	iterable: Iterable<unknown>,
	mapper = identity as (value: unknown) => number,
) {
	return fold(map(iterable, mapper), -0, add);
}
