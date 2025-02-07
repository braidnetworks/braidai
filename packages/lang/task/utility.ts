export const Pull: unique symbol = Symbol.for("Task.Pull");

/**
 * This is a generator function which yields individual operations and eventually returns a result.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Task<Type> = Generator<Operation | null | undefined | void, Type>;

/** Any value which can be yielded to return a response. */
export type Operation<Type = unknown> = Pullable<Type> | PromisePullable<Type>;

/** Any task-native yieldable value */
export interface Pullable<Type> {
	[Pull]: (signal: AbortSignal, channel: PullableChannel<Type>) => void;
	then?: PromiseLike<Type>["then"];
}

/** [Pull] added to internal `Promise` types to simplify implementation */
interface PromisePullable<Type> extends PromiseLike<Type> {
	[Pull]?: never;
}

/**
 * Resolution channel for a pulled value.
 */
export interface PullableChannel<Type> {
	resolve: (value: Type) => void;
	reject: (reason?: unknown) => void;
	halt: (reason?: any) => void;
}

/** @internal */
export type Receive<Type> = (channel: PullableChannel<Type>) => void;

/**
 * Convenience function which stashes a value and then ensures it can only be returned once. Used to
 * prevent double-pulling certain one-shot values.
 * @internal
 */
export function acquire<Type>(value: Type) {
	let initial: Type | typeof Never = value;
	return () => {
		if (initial === Never) {
			throw new Error("Value was acquired more than once");
		}
		const result = initial;
		initial = Never;
		return result;
	};
}
const Never = Symbol("Never");

/**
 * `accept` is a helper to unwrap type information for the yielded value. This trick is used to pass
 * type information along since TypeScript doesn't have the ability to dynamically specify the type
 * of a yield. You do not need to use `accept` unless you care about the return value of the
 * promise. If you just want to yield for side-effects and exceptions, a simple `yield promise` is
 * enough.
 * https://github.com/microsoft/TypeScript/issues/32523
 */
export function *accept<Type>(value: Operation<Type>): Generator<Operation, Type> {
	const result = (yield value) as Type;
	return result;
}
