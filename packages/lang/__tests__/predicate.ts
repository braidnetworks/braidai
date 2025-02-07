import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { everyPredicate, somePredicate } from "@braidai/lang/predicate";

await describe("everyPredicate", async () => {
	const unknownValue: unknown = null;
	const predicateWithoutContext = everyPredicate([
		(value: unknown) => value === 0,
		(value: unknown) => typeof value === "number",
	]);
	if (predicateWithoutContext(unknownValue)) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const result: 0 = unknownValue;
	}
	// @ts-expect-error -- Don't accept extra arguments
	predicateWithoutContext(null, null);

	const predicateWithContext = everyPredicate([ (value: unknown, context: number) => context === 0 ]);
	// @ts-expect-error -- Extra argument is required
	predicateWithContext(null);
	predicateWithContext(null, 0);

	await test("short circuit", () => {
		const predicate = everyPredicate([
			() => false,
			() => { throw new Error(); },
		]);
		assert.strictEqual(predicate(null), false);
	});

	await test("includes rest", () => {
		const predicate = everyPredicate([
			(val, ii: number) => ii === 0,
			(val, ii: number) => ii === 0,
		]);
		assert.strictEqual(predicate(null, 0), true);
	});
});

await describe("somePredicate", async () => {
	const unknownValue: unknown = null;
	const singleAssertion = somePredicate([ (value: unknown) => value === 0 ]);
	if (singleAssertion(unknownValue)) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const result: 0 = unknownValue;
	}
	// @ts-expect-error -- Don't accept extra arguments
	singleAssertion(null, null);

	const unionAssertion = somePredicate([
		(value: unknown) => value === 0,
		(value: unknown) => value === 1,
	]);
	if (unionAssertion(unknownValue)) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const result: 0 | 1 = unknownValue;
		// @ts-expect-error -- Should not be 0
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const itsNotZero: 0 = unknownValue;
		// @ts-expect-error -- Should not be 1
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const itsNotOne: 1 = unknownValue;
	}

	await test("short circuit", () => {
		const predicate = somePredicate([
			() => true,
			() => { throw new Error(); },
		]);
		assert.strictEqual(predicate(null), true);
	});

	await test("includes rest", () => {
		const predicate = somePredicate([
			(val, ii: number) => ii === 0,
			(val, ii: number) => ii === -1,
		]);
		assert.strictEqual(predicate(null, 0), true);
	});
});
