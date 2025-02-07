import * as assert from "node:assert/strict";
import { describe, test } from "node:test";
import { numericComparator } from "@braidai/lang/comparator";
import { Fn } from "@braidai/lang/functional";

await describe("accumulate", async () => {
	await test("strict associativity", () => {
		const nothing: number[] = [];
		const negativeZero = [ -0 ];
		const left = Fn.accumulate(Fn.concat([ nothing, negativeZero ]));
		const right = Fn.accumulate(nothing) + Fn.accumulate(negativeZero);
		assert.strictEqual(left, right);
	});
});

await test("concat", () => {
	assert.deepStrictEqual([ ...Fn.concat([ [ 0, 1 ], [ 2, 3 ] ]) ], [ 0, 1, 2, 3 ]);
});

await test("every", () => {
	assert.strictEqual(Fn.every([ 0, 1 ], ii => ii >= 0), true);
	assert.strictEqual(Fn.every([ 0, 1 ], ii => ii >= 1), false);
	assert.strictEqual(Fn.every([ 0, 1 ], (ii, jj) => jj >= 0), true);
});

await test("filter", () => {
	assert.deepStrictEqual([ ...Fn.filter([ 0, 1, 2 ], ii => ii % 2 === 0) ], [ 0, 2 ]);
	assert.deepStrictEqual([ ...Fn.filter([ true, false ]) ], [ true ]);
	assert.deepStrictEqual([ ...Fn.filter([ 1 ], (ii, jj: number) => jj === 0) ], [ 1 ]);
});

await test("find", () => {
	assert.strictEqual(Fn.find([ 0, 1, 2 ], ii => ii === 1), 1);
	assert.strictEqual(Fn.find([ 1 ], (ii, jj) => jj === 0), 1);
});

await test("fold", () => {
	assert.strictEqual(Fn.fold([ 0, 1, 2 ], NaN, (aa, bb) => aa + bb), 3);
	// n-1 iterations
	assert.strictEqual(Fn.fold([ 0 ], NaN, () => { throw new Error(); }), 0);
	// default value
	assert.strictEqual(Fn.fold([], 0, () => { throw new Error(); }), 0);
});

await test("map", () => {
	assert.deepStrictEqual([ ...Fn.map([ 0, 1, 2 ], (ii, jj) => ii + jj) ], [ 0, 2, 4 ]);
});

await test("minimum", () => {
	assert.strictEqual(Fn.minimum([ 0, 1 ], numericComparator), 0);
	assert.strictEqual(Fn.minimum([ 1, 0 ], numericComparator), 0);
	assert.strictEqual(Fn.minimum([ "a", "b" ], () => 0), "a");
});

await test("maximum", () => {
	assert.strictEqual(Fn.maximum([ 0, 1 ], numericComparator), 1);
	assert.strictEqual(Fn.maximum([ 1, 0 ], numericComparator), 1);
	assert.strictEqual(Fn.maximum([ "a", "b" ], () => 0), "b");
});

await test("merge", () => {
	const comparator = (left: number, right: number) => left - right;
	assert.deepStrictEqual([ ...Fn.merge(comparator, [ 0, 1, 2 ]) ], [ 0, 1, 2 ]);
	assert.deepStrictEqual([
		...Fn.merge(comparator,
			[ 0, 1, 2 ],
			[ 3, 4, 5 ],
			[ 6, 7, 8 ],
		),
	], [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
	assert.deepStrictEqual([
		...Fn.merge(comparator,
			[ 6, 7, 8 ],
			[ 3, 4, 5 ],
			[ 0, 1, 2 ],
		),
	], [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ]);
	assert.deepStrictEqual([
		...Fn.merge(comparator,
			[ 1, 4, 7 ],
			[ 2, 5, 8 ],
			[ 3, 6, 9 ],
		),
	], [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
	assert.deepStrictEqual([
		...Fn.merge(comparator,
			[ 3, 6, 9 ],
			[ 2, 5, 8 ],
			[ 1, 4, 7 ],
		),
	], [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
	assert.deepStrictEqual([
		...Fn.merge(comparator,
			[ 1, 9 ],
			[ 2, 10 ],
			[ 3, 11 ],
			[ 4, 12 ],
			[ 5, 13 ],
			[ 6, 14 ],
			[ 7, 15 ],
			[ 8, 16 ],
		),
	], [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]);
});

await test("pipe", () => {
	const result = Fn.pipe(
		Fn.range(0, 10),
		$$ => Fn.map($$, ii => ii * 2),
		$$ => Fn.reject($$, ii => ii % 3 === 0),
		$$ => Fn.map($$, ii => `${ii}`),
		$$ => Fn.join($$, ","));
	assert.strictEqual(result, "2,4,8,10,14,16");
});

await test("reduce", () => {
	assert.strictEqual(Fn.reduce([ 0, 1, 2 ], 0, (aa, bb) => aa + bb), 3);
	assert.strictEqual(Fn.reduce([ 0 ], NaN, (aa, bb) => aa + bb), NaN);
	assert.strictEqual(Fn.reduce([ 0, 0, 0 ], 0, (aa, bb, cc) => aa + cc), 3);
});

await test("reject", () => {
	assert.deepStrictEqual([ ...Fn.reject([ 0, 1, 2 ], ii => ii % 2 === 0) ], [ 1 ]);
	assert.deepStrictEqual([ ...Fn.reject([ 0, 1, 2 ], (ii, jj) => jj === 2) ], [ 0, 1 ]);
});

await test("some", () => {
	assert.strictEqual(Fn.some([ 0, 1 ], ii => ii >= 1), true);
	assert.strictEqual(Fn.some([ 0, 1 ], ii => ii >= 2), false);
	assert.strictEqual(Fn.some([ 0, 0 ], (ii, jj) => jj === 1), true);
});

await test("slice", () => {
	assert.deepStrictEqual([ ...Fn.slice([ 0, 1, 2 ], 1) ], [ 1, 2 ]);
	assert.deepStrictEqual([ ...Fn.slice([ 0, 1, 2 ], 0, 2) ], [ 0, 1 ]);
});

await test("transform", () => {
	assert.deepStrictEqual([ ...Fn.transform([ 0, 1, 2, 3 ], ii => Fn.range(ii)) ], [ 0, 0, 1, 0, 1, 2 ]);
});
