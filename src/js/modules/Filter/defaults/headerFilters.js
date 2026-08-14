function minmaxEditor(cell, onRendered, success, cancel){
	var container = document.createElement("div"),
		start = document.createElement("input"),
		end = document.createElement("input"),
		currentValue = cell.getValue() || {};

	container.classList.add("tabulator-header-filter-minmax");

	start.type = "date";
	start.placeholder = "Дата с";
	start.value = currentValue.start || "";

	end.type = "date";
	end.placeholder = "Дата по";
	end.value = currentValue.end || "";

	container.appendChild(start);
	container.appendChild(end);

	function updateValue(){
		success({
			start:start.value,
			end:end.value,
		});
	}

	start.addEventListener("change", updateValue);
	end.addEventListener("change", updateValue);

	container.addEventListener("keydown", function(e){
		if(e.key === "Escape"){
			cancel();
		}
	});

	return container;
}

function minmaxFilter(headerValue, rowValue){
	var start = headerValue && headerValue.start || "",
		end = headerValue && headerValue.end || "";

	if(!start && !end){
		return true;
	}

	if(!rowValue){
		return true;
	}

	return (!start || rowValue >= start) && (!end || rowValue <= end);
}

export default {
	minmax:{
		editor:minmaxEditor,
		func:minmaxFilter,
	},
};