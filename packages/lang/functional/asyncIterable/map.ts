/**
 * Applies a given function to an async iterable.
 */
export async function *mapAsync<Type, Result>(
	asyncIterable: AsyncIterable<Type>,
	callback: (value: Type) => Result | PromiseLike<Result>,
): AsyncIterable<Result> {
	for await (const value of asyncIterable) {
		yield callback(value);
	}
}
