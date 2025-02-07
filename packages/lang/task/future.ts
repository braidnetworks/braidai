import type { Pullable, PullableChannel, Receive } from "./utility.js";
import { Pull } from "./utility.js";

/**
 * A `Future` provides a `PromiseLike`-compatible interface on top of `Pullable` operations.
 */
export class Future<Type> implements Pullable<Type>, PromiseLike<Type> {
	private replay: Receive<Type> | null = null;
	private readonly pending: PullableChannel<Type>[] = [];

	constructor(executor: (
		resolve: PullableChannel<Type>["resolve"],
		reject: PullableChannel<Type>["reject"],
		abort: PullableChannel<Type>["halt"]
	) => void) {
		const settle = (replay: Receive<Type>) => {
			this.replay = replay;
			for (const channel of this.pending.splice(0)) {
				replay(channel);
			}
		};
		executor(
			value => settle(channel => channel.resolve(value)),
			error => settle(channel => channel.reject(error)),
			reason => settle(channel => channel.halt(reason)),
		);
	}

	static resolve<Type>(value: Type): Future<Type> {
		return new Future(resolve => resolve(value));
	}

	static reject(reason: Error): Future<never> {
		return new Future<never>((resolve, reject) => reject(reason));
	}

	static halt(reason?: any): Future<never> {
		return new Future<never>((resolve, reject, halt) => halt(reason));
	}

	[Pull](signal: unknown, channel: PullableChannel<Type>): void {
		if (this.replay === null) {
			this.pending.push(channel);
		} else {
			this.replay(channel);
		}
	}

	/**
	 * Return a promise which does not automatically throw if halted.
	 */
	continue<Next = never>(halted?: (reason: unknown) => Next): Promise<Type | Next> {
		return new Promise<Type | Next>((resolve, reject) => {
			this[Pull](null, {
				resolve,
				reject,
				halt(reason) {
					try {
						resolve(halted?.(reason) as never);
					} catch (error) {
						// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
						reject(error);
					}
				},
			});
		});
	}

	/**
	 * `PromiseLike`-compatible `then` method. On `halt` the promise will throw.
	 */
	then<Resolved = Type, Rejected = never>(
		resolved: ((value: Type) => PromiseLike<Resolved> | Resolved) | null | undefined,
		rejected?: ((reason: any) => PromiseLike<Rejected> | Rejected) | null,
	): Promise<Resolved | Rejected> {
		const promise = new Promise<Type>((resolve, reject) => {
			this[Pull](null, {
				resolve,
				reject,
				halt(reason) {
					reject(new Error(`Future was halted with reason: ${reason}`));
				},
			});
		});
		return promise.then(resolved, rejected);
	}
}
