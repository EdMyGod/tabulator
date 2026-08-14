function minmaxEditor(cell, onRendered, success, cancel){
	var currentValue = cell.getValue() || {},
		container = document.createElement("div"),
		button = document.createElement("input"),
		popup = document.createElement("div"),
		mode = document.createElement("select"),
		start = document.createElement("input"),
		end = document.createElement("input"),
		apply = document.createElement("button"),
		clear = document.createElement("button"),
		modeValue = currentValue.mode || (currentValue.start && currentValue.end ? "range" : currentValue.start ? "from" : currentValue.end ? "to" : "range"),
		popupOpen = false;

	container.classList.add("tabulator-header-filter-minmax");
	button.type = "text";
	button.readOnly = true;
	button.classList.add("tabulator-header-filter-minmax-trigger");
	button.placeholder = "Дата";
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
		var text = "";

		if(mode.value === "from" && start.value){
			text = "с " + formatDate(start.value);
		}else if(mode.value === "to" && end.value){
			text = "по " + formatDate(end.value);
		}else if(mode.value === "range" && (start.value || end.value)){
			text = (start.value ? formatDate(start.value) : "…") + " — " + (end.value ? formatDate(end.value) : "…");
		}

		button.value = text;
	}

	function positionPopup(){
		var rect = button.getBoundingClientRect(),
			width = 220,
			left = rect.left,
			top = rect.bottom + 4,
			maxLeft = window.innerWidth - width - 8;

		if(left > maxLeft){
			left = Math.max(8, maxLeft);
		}

		popup.style.left = left + "px";
		popup.style.top = top + "px";

		if(top + popup.offsetHeight > window.innerHeight - 8 && rect.top > popup.offsetHeight + 8){
			popup.style.top = (rect.top - popup.offsetHeight - 4) + "px";
		}
	}

	function closePopup(){
		if(!popupOpen){
			return;
		}

		popupOpen = false;
		popup.hidden = true;
		button.setAttribute("aria-expanded", "false");
		if(popup.parentNode){
			popup.parentNode.removeChild(popup);
		}
		document.removeEventListener("mousedown", outsideClick);
		window.removeEventListener("resize", positionPopup);
		window.removeEventListener("scroll", positionPopup, true);
	}

	function outsideClick(e){
		if(!container.contains(e.target) && !popup.contains(e.target)){
			closePopup();
		}
	}

	function togglePopup(){
		if(popupOpen){
			closePopup();
			return;
		}

		popupOpen = true;
		popup.hidden = false;
		document.body.appendChild(popup);
		button.setAttribute("aria-expanded", "true");
		updateInputs();
		positionPopup();
		start.focus();
		document.addEventListener("mousedown", outsideClick);
		window.addEventListener("resize", positionPopup);
		window.addEventListener("scroll", positionPopup, true);
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
		closePopup();
		success(value);
	}

	function clearFilter(){
		start.value = "";
		end.value = "";
		updateButton();
		closePopup();
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
			closePopup();
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