import { shiftAsync } from "@braidai/lang/functional/asyncIterable/shift";

/**
 * Returns the first matching element of the iterable, discarding the rest.
 */
export async function firstAsync<Type>(iterable: AsyncIterable<Type>): Promise<Type | undefined> {
	const { head, rest } = await shiftAsync(iterable);
	await rest?.[Symbol.asyncIterator]().return?.();
	return head;
}
