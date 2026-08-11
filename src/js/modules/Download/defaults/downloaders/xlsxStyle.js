function fitToColumn(arrayOfArray){
	return arrayOfArray[0].map((a, i) => ({
		wch: Math.max(...arrayOfArray.map(a2 => a2[i] ? a2[i].toString().length : 0))
	}));
}

function rgba2hex(orig){
	var a,
		rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
		alpha = (rgb && rgb[4] || "").trim(),
		hex = rgb ?
			(rgb[1] | 1 << 8).toString(16).slice(1) +
			(rgb[2] | 1 << 8).toString(16).slice(1) +
			(rgb[3] | 1 << 8).toString(16).slice(1) : orig;

	if(alpha !== ""){
		a = alpha;
	}else{
		a = 1;
	}

	a = ((a * 255) | 1 << 8).toString(16).slice(1);
	hex = hex + a;

	return hex;
}

function createCell(value, component, style, horizontal){
	var type = typeof value === "number" ? "n" : "s",
		numFmt = typeof value === "number" ? "#,##0.0" : "",
		cellStyle = {
			font:{
				name:"Times New Roman",
				sz:style.fontSize || 12,
				bold:!!style.bold,
				italic:!!style.italic,
			},
			alignment:{
				vertical:"center",
				wrapText:true,
				horizontal:style.horizontal || horizontal,
			}
		};

	if(component){
		var color = rgba2hex(component.getElement().style.backgroundColor);

		if(color && color !== "ff" && color.length >= 6){
			cellStyle.fill = {
				patternType:"solid",
				fgColor:{
					rgb:color.substring(0, 6),
				}
			};
		}
	}

	return {
		v:value,
		t:type,
		z:numFmt,
		s:cellStyle,
	};
}

export default function(list, options, setFileContents){
	var XLSXLib = this.dependencyRegistry.lookup("XLSX"),
		workbook = XLSXLib.utils.book_new(),
		fileContents = [],
		merges = [],
		r = 0;

	list.forEach((row) => {
		var item = [];

		if(row.type === "header"){
			row.columns.forEach((col) => {
				if(col){
					item.push(createCell(col.value, null, {
						fontSize:14,
						bold:true,
						horizontal:"center",
					}));

					if(col.height > 1){
						merges.push({
							s:{r:r,c:item.length - 1},
							e:{r:r + col.height - 1,c:item.length - 1}
						});
					}else if(col.width > 1){
						merges.push({
							s:{r:r,c:item.length - 1},
							e:{r:r,c:item.length + col.width - 2}
						});
					}
				}else{
					item.push(createCell("", null, {
						fontSize:14,
						bold:true,
						horizontal:"center",
					}));
				}
			});
		}else if(row.type === "group"){
			row.columns.forEach((col) => {
				if(col){
					item.push(createCell(col.value, null, {
						fontSize:14,
						italic:true,
						horizontal:"middle",
					}));
				}
			});

			merges.push({
				s:{r:r,c:0},
				e:{r:r,c:11}
			});
		}else{
			row.columns.forEach((col) => {
				if(col){
					var component = row.component.getCell(col.component.getDefinition().field);
					item.push(createCell(
						col.value,
						component,
						{},
						col.component.getDefinition().hozAlign
					));
				}else{
					item.push(createCell("", null, {}, undefined));
				}
			});
		}

		fileContents.push(item);
		r++;
	});

	var ws = XLSXLib.utils.aoa_to_sheet(fileContents);

	if(fileContents.length){
		ws['!cols'] = fitToColumn(fileContents);
	}

	if(merges.length){
		ws['!merges'] = merges;
	}

	XLSXLib.utils.book_append_sheet(workbook, ws, options.sheetName || "Таблица");

	var output = XLSXLib.write(workbook, Object.assign({
		bookType:"xlsx",
		type:"array",
	}, options.writeOptions || {}));

	setFileContents(output, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
