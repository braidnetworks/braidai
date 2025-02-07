import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { arrayBisect, bisect, stablePartition } from "@braidai/lang/algorithm";
import { Fn } from "@braidai/lang/functional";

await describe("arrayBisect", async () => {
	for (const ii of Fn.range(8)) {
		await test(`${ii}`, () => {
			// nb: Also tests past array length
			assert.equal(arrayBisect([ 0, 1, 2, 3, 4, 5, 6 ], ii, (left, right) => left - right), ii);
		});
	}
});

await describe("bisect sqrt", async () => {
	for (const ii of Fn.range(15)) {
		await test(`${ii}`, () => {
			const sqrt = (value: number) =>
				bisect(
					0, value,
					(low, high) => (low + high) / 2,
					guess => guess * guess - value);
			assert.ok(Math.abs(sqrt(ii) - Math.sqrt(ii)) < 1e-14);
		});
	}
});

await describe("stablePartition (mappedDefinedFirstComparator)", async () => {
	await test("values", () => {
		const values = [ 1, 2, 3, 4, 5 ];
		const evensFirst = (value: number) => value % 2 === 0;
		stablePartition(values, evensFirst);
		assert.deepStrictEqual(values, [ 2, 4, 1, 3, 5 ]);
	});
});
