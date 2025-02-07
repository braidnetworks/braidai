import type { Comparator } from "@braidai/lang/comparator";
import { every } from "@braidai/lang/functional/iterable/fold/every";
import { scan } from "@braidai/lang/functional/iterable/scan";
import { shift } from "@braidai/lang/functional/iterable/shift";

/**
 * Determines whether an iterable is sorted according to a comparator.
 */
export function isSorted<Type>(iterable: Iterable<Type>, comparator: Comparator<Type>): boolean {
	const { head, rest } = shift(iterable);
	if (rest) {
		const initial: readonly [ Type, Type ] = [ null as never, head ] as const;
		const pairs = scan(rest, initial, (prev, curr) => [ prev[1], curr ] as const);
		return every(pairs, ([ left, right ]) => comparator(left, right) <= 0);
	}
	return true;
}
