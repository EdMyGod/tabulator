import {
	cubisioMoneyColumn,
	cubisioDynamicPercentColumn,
	cubisioDynamicAbsoluteColumn,
} from "../../../src/js/core/tools/CubisioColumns.js";

describe("Cubisio column presets", () => {
	test("money preset keeps Cubisio formatting and allows overrides", () => {
		const column = cubisioMoneyColumn("2027", "budget", {width: 120});

		expect(column.title).toBe("2027");
		expect(column.field).toBe("budget");
		expect(column.formatter).toBe("money");
		expect(column.hozAlign).toBe("right");
		expect(column.formatterParams.decimal).toBe(",");
		expect(column.formatterParams.thousand).toBe(" ");
		expect(column.width).toBe(120);
	});

	test("percent preset calculates row value and handles zero base", () => {
		const column = cubisioDynamicPercentColumn("2027", "delta", "current", "previous");

		expect(column.mutator(null, {current: 120, previous: 100})).toBeCloseTo(20);
		expect(column.mutator(null, {current: 120, previous: 0})).toBeNull();
		expect(column.mutator(null, {current: null, previous: 100})).toBeNull();
	});

	test("absolute preset calculates row value", () => {
		const column = cubisioDynamicAbsoluteColumn("2027", "delta", "current", "previous");

		expect(column.mutator(null, {current: 125, previous: 100})).toBe(25);
		expect(column.mutator(null, {current: null, previous: 100})).toBeNull();
	});

	test("percent total uses selected rows when selection exists", () => {
		const column = cubisioDynamicPercentColumn("2027", "delta", "current", "previous");
		const first = {current: 120, previous: 100};
		const second = {current: 300, previous: 200};
		const table = {getSelectedData: () => [first]};

		expect(column.bottomCalc([], [first, second], {table})).toBeCloseTo(20);
	});

	test("absolute total uses all rows when nothing is selected", () => {
		const column = cubisioDynamicAbsoluteColumn("2027", "delta", "current", "previous");
		const data = [
			{current: 120, previous: 100},
			{current: 300, previous: 250},
		];
		const table = {getSelectedData: () => []};

		expect(column.bottomCalc([], data, {table})).toBe(70);
	});
});
