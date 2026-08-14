function minmaxEditor(cell, onRendered, success, cancel){
	var currentValue = cell.getValue() || {},
	container = document.createElement("div"),
	button = document.createElement("button"),
	popup = document.createElement("div"),
	mode = document.createElement("select"),
	start = document.createElement("input"),
	end = document.createElement("input"),
	apply = document.createElement("button"),
	clear = document.createElement("button"),
	modeValue = currentValue.mode || (currentValue.start && currentValue.end ? "range" : currentValue.start ? "from" : currentValue.end ? "to" : "range");

	container.classList.add("tabulator-header-filter-minmax");
	button.type = "button";
	button.classList.add("tabulator-header-filter-minmax-trigger");
	button.setAttribute("aria-haspopup", "dialog");
	button.setAttribute("aria-expanded", "false");

	popup.classList.add("tabulator-header-filter-minmax-popup");
	popup.hidden = true;

	mode.classList.add("tabulator-header-filter-minmax-mode");
	[
		["from", "С даты"],
		["to", "По дату"],
		["range", "Интервал дат"],
	].forEach(function(option){
		var item = document.createElement("option");
		item.value = option[0];
		item.textContent = option[1];
		mode.appendChild(item);
	});
	mode.value = modeValue;

	start.type = "date";
	start.classList.add("tabulator-header-filter-minmax-date");
	start.value = currentValue.start || "";
	start.setAttribute("aria-label", "Дата с");

	end.type = "date";
	end.classList.add("tabulator-header-filter-minmax-date");
	end.value = currentValue.end || "";
	end.setAttribute("aria-label", "Дата по");

	apply.type = "button";
	apply.textContent = "Применить";
	apply.classList.add("tabulator-header-filter-minmax-apply");

	clear.type = "button";
	clear.textContent = "Очистить";
	clear.classList.add("tabulator-header-filter-minmax-clear");

	popup.appendChild(mode);
	popup.appendChild(start);
	popup.appendChild(end);
	popup.appendChild(apply);
	popup.appendChild(clear);
	container.appendChild(button);
	container.appendChild(popup);

	function updateInputs(){
		start.hidden = mode.value === "to";
		end.hidden = mode.value === "from";
	}

	function formatDate(value){
		if(!value){
			return "";
		}

		var parts = value.split("-");
		return parts.length === 3 ? parts[2] + "." + parts[1] + "." + parts[0].slice(-2) : value;
	}

	function updateButton(){
		var text = "Дата";

		if(mode.value === "from" && start.value){
			text = "с " + formatDate(start.value);
		}else if(mode.value === "to" && end.value){
			text = "по " + formatDate(end.value);
		}else if(mode.value === "range" && (start.value || end.value)){
			text = (start.value ? formatDate(start.value) : "…") + " — " + (end.value ? formatDate(end.value) : "…");
		}

		button.textContent = text;
	}

	function togglePopup(){
		popup.hidden = !popup.hidden;
		button.setAttribute("aria-expanded", popup.hidden ? "false" : "true");

		if(!popup.hidden){
			updateInputs();
			start.focus();
		}
	}

	function applyFilter(){
		var value = {
			mode: mode.value,
			start: mode.value === "to" ? "" : start.value,
			end: mode.value === "from" ? "" : end.value,
		};

		if(!value.start && !value.end){
			value = {};
		}

		updateButton();
		popup.hidden = true;
		button.setAttribute("aria-expanded", "false");
		success(value);
	}

	function clearFilter(){
		start.value = "";
		end.value = "";
		updateButton();
		popup.hidden = true;
		button.setAttribute("aria-expanded", "false");
		success({});
	}

	button.addEventListener("click", togglePopup);
	mode.addEventListener("change", function(){
		updateInputs();
		updateButton();
	});
	apply.addEventListener("click", applyFilter);
	clear.addEventListener("click", clearFilter);

	container.addEventListener("keydown", function(e){
		if(e.key === "Escape"){
			popup.hidden = true;
			button.setAttribute("aria-expanded", "false");
			cancel();
		}
	});

	updateInputs();
	updateButton();

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