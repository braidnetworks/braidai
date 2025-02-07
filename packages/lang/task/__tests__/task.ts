/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable require-yield */
/* eslint-disable no-unsafe-finally */
import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { sequence } from "@braidai/lang/task/sequence";
import { expect as get, task } from "@braidai/lang/task/task";
import { accept } from "@braidai/lang/task/utility";

await describe("task tests", async () => {
	await test("basic result", () => {
		const result = get(task(function*() {
			return 1;
		}));
		assert.strictEqual(result, 1);
	});

	await test("with yield", () => {
		const result = get(task(function*() {
			return yield task(function*() {
				return 1;
			});
		}));
		assert.strictEqual(result, 1);
	});

	await test("thrown", () => {
		const error = new Error();
		const result = () => get(task(function*() {
			yield task(function*() {
				throw error;
			});
		}));
		assert.throws(result, error);
	});

	await test("thrown with finalizer", () => {
		const error = new Error();
		const result = () => get(task(function*() {
			try {
				yield task(function*() {
					throw error;
				});
			} finally {
				yield task(function*() {});
			}
		}));
		assert.throws(result, error);
	});

	await test("thrown with resumption", () => {
		const error = new Error();
		const result = get(task(function*() {
			try {
				yield task(function*() {
					throw error;
				});
			} finally {
				return 1;
			}
		}));
		assert.strictEqual(result, 1);
	});

	await test("flat stack", () => {
		const stackSize = () => {
			const trace: { stack?: string } = {};
			Error.captureStackTrace(trace);
			return trace.stack!.split("\n").length;
		};
		get(task(function*() {
			Error.stackTraceLimit = Infinity;
			const size = stackSize();
			for (let ii = 0; ii < 50; ++ii) {
				yield task(function*() {});
			}
			assert.ok(stackSize() < size * 2);
		}));
	});

	await test("loop with yield halt", () => {
		const controller = new AbortController();
		const numbers = sequence(function*(produce) {
			for (let ii = 0; ;++ii) {
				yield produce(ii);
			}
		});
		const result = get(task(function*() {
			let ii = 0;
			try {
				const seq = yield* accept(numbers);
				while (true) {
					ii = yield* accept(seq);
					if (ii === 2) {
						controller.abort();
					}
				}
			} finally {
				return ii;
			}
		}, controller));
		assert.strictEqual(result, 2);
	});

	await test("loop with produce halt", () => {
		const controller = new AbortController();
		const numbers = sequence(function*(produce) {
			for (let ii = 0; ;++ii) {
				yield produce(ii);
				if (ii === 2) {
					controller.abort();
				}
			}
		});
		const result = get(task(function*() {
			let ii = 0;
			try {
				const seq = yield* accept(numbers);
				while (true) {
					ii = yield* accept(seq);
				}
			} finally {
				return ii;
			}
		}, controller));
		assert.strictEqual(result, 2);
	});

	await test("task with aborted signal should invoke before halting", () => {
		const controller = new AbortController();
		const { signal } = controller;
		controller.abort();
		const nothing = () => {};
		assert.throws(() => get(task(function*() {
			nothing();
		}, { signal })));
		assert.throws(() => get(task(function*() {
			yield Promise.resolve();
			assert.fail("This should not be reached");
		}, { signal })));
		assert.throws(() => get(task(function*() {
			throw new Error("Wow!");
		}, { signal })), /Wow!/);
	});
});
