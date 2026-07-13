function convert_dom_to_count(o) {
	return [o.outerHTML, o.style.cssText];
}

function convert_dom_to_element(window_object, str) {
	var data = JSON.parse(str);
	window_object.innerHTML += data[0];
	var r = window_object.lastChild;
	r.style.cssText = data[1];
	return r;
}

function load_project_source(code) {
	count_stack = 0;
	GLOBAL_INIT_COUNT = 0;
	GLOBAL_INIT_ELEMENT = [];

	document.getElementById('main').innerHTML = code;
	win = document.getElementById('window_background');
	var tmp = addwinelm.onmousedown;
	addwinelm = document.getElementById('window');
	addwinelm.onmousedown = tmp;
	set_element_defunc(addwinelm);
	window_stack[count_stack++] = win;
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = win.getAttribute('data-name');
	select_element = null;
	select_element_added(win);
}

function load_project(src) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", src, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('');
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			return load_project_source(xhr.responseText);
		}
	};
}

function set_element_defunc(window_object) {
	var list = window_object.children;
	for (var key in list) {
		if (list[key].onmousedown === undefined) {
			list[key].onmousedown = function () { select_element_added(this); global_lock_event = true; };
		}
	}
}

function source_convert_elements(w_obj) {
	var w = w_obj.children[0];
	var list = w.children;
	var count = list.length;
	var code = [];
	var code_count = 0;
	while (count) {
		var obj = list[--count];
		if (class_gui_list_elements.indexOf(obj.className) != -1) {
			code[code_count++] = convert_dom_to_count(obj);
		}
	}
	return code;
}

function to_source_project() {
	return win.outerHTML;
}
