import type { Pullable, Task } from "./utility.js";
import { driver } from "./driver.js";
import { Future } from "./future.js";
import { Pull, acquire } from "./utility.js";

type WithSignal = { signal?: AbortSignal };

/**
 * Returns a `Future` from a task, beginning the task in the process.
 */
export function begin<Result>(task: Pullable<Result>, { signal }: WithSignal = {}): Future<Result> {
	return pullAsFuture(task, signal);
}

/**
 * Initializes a task, but does not dispatch it. If `Pull` or `then` are not invoked then the task
 * will not be run.
 */
export function task<Result>(body: () => Task<Result>, { signal }: WithSignal = {}): Pullable<Result> & PromiseLike<Result> {
	let future: Future<Result> | undefined;
	const holder = acquire(body());
	const pullable: Pullable<Result> & PromiseLike<Result> = {
		[Pull](pullSignal, channel) {
			const combinedSignal = function() {
				if (signal) {
					if (signal.aborted) {
						// We can assume `pullSignal` is not aborted.
						return signal;
					} else {
						const controller = new AbortController();
						const cleanup = () => {
							signal.removeEventListener("abort", handleSignal);
							pullSignal.removeEventListener("abort", handlePullSignal);
						};
						const handleSignal = () => {
							cleanup();
							controller.abort(signal.reason);
						};
						const handlePullSignal = () => {
							cleanup();
							controller.abort(pullSignal.reason);
						};
						signal.addEventListener("abort", handleSignal);
						pullSignal.addEventListener("abort", handlePullSignal);
						return controller.signal;
					}
				} else {
					return pullSignal;
				}
			}();
			// Dispatch the task.
			driver(combinedSignal, channel, holder());
		},

		then(resolve, reject) {
			future ??= pullAsFuture(pullable, signal);
			return future.then(resolve, reject);
		},
	};
	return pullable;
}

/**
 * Pulls a value and wraps it in a `Future`.
 */
function pullAsFuture<Type>(pullable: Pullable<Type>, signal?: AbortSignal) {
	return new Future<Type>(
		(resolve, reject, abort) => pullable[Pull](
			signal ?? new AbortController().signal,
			{ resolve, reject, halt: abort }));
}

/**
 * Pull a value from a `Pullable` and assert that it resolves synchronously. If it does not resolve
 * then the operation halts and an error is thrown. Otherwise the resolved value is returned.
 */
export function expect<Type>(pullable: Pullable<Type>): Type {
	const controller = new AbortController();
	let send = (): Type => {
		const error = new Error("Expected value was not resolved");
		controller.abort(error);
		throw error;
	};
	pullable[Pull](controller.signal, {
		resolve(value) {
			send = () => value;
		},
		reject(error) {
			controller.abort(error);
			send = () => {
				throw error;
			};
		},
		halt(reason) {
			send = () => {
				throw new Error(`Expected value was halted with reason: ${reason}`);
			};
		},
	});
	return send();
}
