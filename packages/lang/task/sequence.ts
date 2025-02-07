import type { Operation, Pullable, PullableChannel, Receive } from "./utility.js";
import { driver } from "./driver.js";
import { Pull, acquire } from "./utility.js";

/**
 * Holder for a produced value in a sequence. At runtime this is indistinguishable from a regular
 * pullable, but extra type information is added to help with type inference.
 */
export interface Produced<Type> extends Pullable<unknown> {
	[Pull]: (signal: AbortSignal, channel: PullableChannel<unknown>) => void;
	// nb: This does not actually exist!
	value: Type;
}

/** This is the type of the `produce` function which is passed to `sequence` bodies */
type Produce = <Value>(value: Value) => Produced<Value>;

/** Body of a `sequence` invocation */
type SequenceBody<Type> = (produce: Produce) => Generator<Produced<Type> | Operation, unknown>;

/**
 * A `Sequence` is a pullable which produces a `Cursor`. The produced cursor can be repeatably
 * pulled to produce new values from the sequence. When the sequence is done the cursor will produce
 * `cursor.end`.
 */
export type Sequence<Type> = Pullable<Cursor<Type>>;

export type Cursor<Type> = Pullable<Type> & Record<"end", unknown>;

function finishedNext(receive: Receive<void>, signal: AbortSignal, channel: PullableChannel<any>) {
	channel.reject(new Error("Sequence has terminated"));
}

function runningNext(receive: Receive<void>, signal: AbortSignal, channel: PullableChannel<any>) {
	channel.reject(new Error("Sequence is already running"));
}

/**
 * `sequence` invokes the given body with a single parameter, `produce`. This parameter returns a
 * pullable value which will emit the value from the sequence. You can use `produce` from nested
 * scopes which allows for interesting composition of sequences.
 */
export function sequence<Type>(body: SequenceBody<Type>): Sequence<Type> {
	const holder = acquire(body);
	return {
		[Pull](signal, iteratorChannel) {
			const body = holder();
			const end: unknown = {};
			let next = (receive: Receive<void>, initialSignal: AbortSignal, initialChannel: PullableChannel<Type>) => {
				if (initialSignal !== signal) {
					initialChannel.reject(new Error("Pulled sequence value from another scope"));
					return;
				}
				next = runningNext;
				let nextChannel = initialChannel;

				// First pull begins the sequence. No need to invoke `receive` here since it will
				// unconditionally resolve.
				driver(signal, {
					resolve() {
						next = finishedNext;
						nextChannel.resolve(end as never);
					},

					reject(error) {
						next = finishedNext;
						nextChannel.reject(error);
					},

					halt(reason) {
						next = finishedNext;
						nextChannel.halt(reason);
					},
				}, body(value => ({
					[Pull](yieldSignal, yieldChannel) {
						next = (receive, nextSignal, channel) => {
							if (nextSignal !== signal) {
								channel.reject(new Error("Pulled sequence value from another scope"));
								return;
							}
							next = runningNext;
							nextChannel = channel;
							receive(yieldChannel);
						};
						nextChannel.resolve(value as unknown as Type);
					},
				} as Produced<never>)));
			};

			// Resolve the `Pullable<Type>` which is the sequence bound to the current scope.
			iteratorChannel.resolve({
				end,
				[Pull](signal, channel) {
					next(channel => channel.resolve(), signal, channel);
				},
			});
		},
	};
}

/**
 * Convert an `Iterable` into a `Sequence`.
 */
export function fromIterable<Type>(iterable: Iterable<Type>): Sequence<Type> {
	return sequence<Type>(function*(produce) {
		for (const value of iterable) {
			yield produce(value);
		}
	});
}

/**
 * Convert an `AsyncIterable` into a `Sequence`.
 */
export function fromAsyncIterable<Type>(iterable: AsyncIterable<Type, unknown, unknown>): Sequence<Type> {
	return sequence<Type>(function*(produce) {
		const iterator = iterable[Symbol.asyncIterator]();
		try {
			for (
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				let cursor: IteratorResult<Type> = yield iterator.next();
				!cursor.done;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				cursor = yield iterator.next()
			) {
				yield produce(cursor.value);
			}
		} finally {
			const final = iterator.return?.();
			if (final) {
				yield final;
			}
		}
	});
}
