function convert_dom_to_count(o) {
	return [o.outerHTML, o.style.cssText];
}

function convert_dom_to_element(window_object, str) {
	const data = JSON.parse(str);
	window_object.innerHTML += data[0];
	const r = window_object.lastChild;
	r.style.cssText = data[1];
	return r;
}

function load_project_source(code) {
	count_stack = 0;
	current_win_index = 0;
	GLOBAL_INIT_COUNT = 0;
	GLOBAL_INIT_ELEMENT = [];

	document.getElementById('main').innerHTML = code;
	win = document.getElementById('window_background');
	const tmp = addwinelm.onmousedown;
	addwinelm = document.getElementById('window');
	addwinelm.onmousedown = tmp;
	set_element_defunc(addwinelm);
	window_stack[count_stack++] = win;
	window_data[0] = {
		html: addwinelm.innerHTML,
		attrs: { 'data-name': win.getAttribute('data-name') || 'Window_1', 'data-caption': win.getAttribute('data-caption') || 'Окно', 'data-hide-prop': win.getAttribute('data-hide-prop') || '', 'data-align': '' },
		style: { width: win.style.width, height: win.style.height, background: win.style.background },
		components: []
	};
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = window_data[0].attrs['data-name'];
	select_element = null;
	select_element_added(win);
	update_component_tree();
}

function load_project(src) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', src, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('');
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) load_project_source(xhr.responseText);
	};
}

function set_element_defunc(window_object) {
	const list = window_object.children;
	for (const key in list) {
		if (list[key].onmousedown === undefined) {
			list[key].onmousedown = function () { select_element_added(this); global_lock_event = true; };
		}
	}
}

function source_convert_elements(w_obj) {
	const w = w_obj.children[0];
	const list = w.children;
	let count = list.length;
	const code = [];
	let code_count = 0;
	while (count) {
		const obj = list[--count];
		if (class_gui_list_elements.indexOf(obj.className) !== -1) {
			code[code_count++] = convert_dom_to_count(obj);
		}
	}
	return code;
}

function to_source_project() {
	return win.outerHTML;
}

function get_project_json() {
	save_window_state();
	const data = {
		version: 1,
		windows: [],
		initElements: GLOBAL_INIT_ELEMENT
	};
	for (let i = 0; i < count_stack; i++) {
		const wd = window_data[i];
		if (wd) data.windows.push(wd);
	}
	return JSON.stringify(data, null, '\t');
}

function export_project() {
	save_window_state();
	const json = get_project_json();
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'project.kcm';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

function import_project(input) {
	const file = input.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function (e) {
		let data;
		try {
			data = JSON.parse(e.target.result);
		} catch (err) {
			alert('Ошибка: неверный формат файла');
			return;
		}
		if (!data.windows || !data.windows.length) {
			alert('Ошибка: файл не содержит данных проекта');
			return;
		}
		count_stack = 0;
		current_win_index = 0;
		GLOBAL_INIT_ELEMENT = data.initElements || [];
		GLOBAL_INIT_COUNT = GLOBAL_INIT_ELEMENT.length;
		window_data = [];
		window_stack = [];
		for (let i = 0; i < data.windows.length; i++) {
			window_data[i] = data.windows[i];
			if (typeof window_data[i] === 'object' && !window_data[i].attrs) {
				// Backward compat with old JSON format
				window_data[i].html = window_data[i].html || '';
				window_data[i].attrs = {
					'data-name': window_data[i].name || ('Window_' + (i + 1)),
					'data-caption': window_data[i].caption || '',
					'data-hide-prop': window_data[i].hide_prop || '',
					'data-align': window_data[i].align || ''
				};
				window_data[i].style = {
					width: window_data[i].width || '300px',
					height: window_data[i].height || '230px',
					background: window_data[i].bg || '#ffffff'
				};
				delete window_data[i].name;
				delete window_data[i].caption;
				delete window_data[i].width;
				delete window_data[i].height;
				delete window_data[i].bg;
				delete window_data[i].hide_prop;
				delete window_data[i].align;
			}
			window_stack[i] = null;
			count_stack++;
		}
		current_win_index = -1;
		switch_window(0);
		select_element = null;
		render_props(win);
		update_component_tree();
	};
	reader.readAsText(file);
	input.value = '';
}
