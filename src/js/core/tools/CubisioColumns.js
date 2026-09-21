function numberValue(value){
	if(value === null || typeof value === "undefined" || value === ""){
		return null;
	}

	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function rowsForCalc(data, calcParams){
	const table = calcParams && calcParams.table;

	if(!table || typeof table.getSelectedData !== "function"){
		return data;
	}

	const selected = table.getSelectedData();

	if(!selected.length){
		return data;
	}

	const dataSet = new Set(data);
	return selected.filter((row) => dataSet.has(row));
}

function sumField(data, field){
	return data.reduce((sum, row) => {
		const value = numberValue(row[field]);
		return value === null ? sum : sum + value;
	}, 0);
}

function signedNumberFormatter(suffix = ""){
	return function(cell){
		const value = numberValue(cell.getValue());

		if(value === null){
			return "";
		}

		const sign = value > 0 ? "+" : "";

		return sign + value.toLocaleString(undefined, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		}) + suffix;
	};
}

function mergeColumn(defaults, options){
	return Object.assign({}, defaults, options || {});
}

export function cubisioMoneyColumn(title, field, options){
	return mergeColumn({
		title,
		field,
		hozAlign: "right",
		vertAlign: "middle",
		formatter: "money",
		formatterParams: {
			decimal: ",",
			thousand: " ",
			negativeSign: "-",
			precision: true,
		},
	}, options);
}

export function cubisioDynamicPercentColumn(title, field, currentField, previousField, options){
	return mergeColumn({
		title,
		field,
		hozAlign: "right",
		vertAlign: "middle",
		mutator(value, data){
			const current = numberValue(data[currentField]);
			const previous = numberValue(data[previousField]);

			if(current === null || previous === null || previous === 0){
				return null;
			}

			return (current / previous - 1) * 100;
		},
		formatter: signedNumberFormatter("%"),
		bottomCalc(values, data, calcParams){
			const rows = rowsForCalc(data, calcParams);
			const current = sumField(rows, currentField);
			const previous = sumField(rows, previousField);

			if(!rows.length || previous === 0){
				return null;
			}

			return (current / previous - 1) * 100;
		},
		bottomCalcFormatter: signedNumberFormatter("%"),
	}, options);
}

export function cubisioDynamicAbsoluteColumn(title, field, currentField, previousField, options){
	return mergeColumn({
		title,
		field,
		hozAlign: "right",
		vertAlign: "middle",
		mutator(value, data){
			const current = numberValue(data[currentField]);
			const previous = numberValue(data[previousField]);

			if(current === null || previous === null){
				return null;
			}

			return current - previous;
		},
		formatter: signedNumberFormatter(),
		bottomCalc(values, data, calcParams){
			const rows = rowsForCalc(data, calcParams);

			if(!rows.length){
				return null;
			}

			return sumField(rows, currentField) - sumField(rows, previousField);
		},
		bottomCalcFormatter: signedNumberFormatter(),
	}, options);
}
