let gui_list_init = [];
let gui_list_count = 0;
let img_list_load = {};
let img_list_count = 0;
let add_init_event_func = '';

const PROP_METHODS = {
	left:         { m: 'left',        f: 'int' },
	top:          { m: 'top',         f: 'int' },
	width:        { m: 'width',       f: 'int' },
	height:       { m: 'height',      f: 'int' },
	color:        { m: 'color',       f: 'hexcolor' },
	image:        { m: 'image',       f: 'imgsrc' },
};

function resolve_compiler_props(def) {
	if (!def || !def.props) return [];
	const resolved = [];
	for (let i = 0; i < def.props.length; i++) {
		const p = def.props[i];
		if (typeof p === 'string') {
			const found = get_prop_def(p);
			if (found) resolved.push(found);
		} else {
			resolved.push(p);
		}
	}
	return resolved;
}

function convert_elements(w_obj) {
	const w = w_obj.children[0];
	const list = w.children;
	let count = list.length;
	img_list_count = 0;
	img_list_load = [];
	let code = '';
	const name_window = w_obj.getAttribute('data-name');

	while (count) {
		const obj = list[--count];
		const def = get_component_def(obj);
		if (!def) continue;
		const cmd = class_gui_list_elements.indexOf(def.typeClass);
		if (cmd === -1) continue;

		const name = obj.getAttribute('data-name');
		gui_list_init[gui_list_count++] = name;
		code += name_window + '.adds(#' + name + ',' + cmd + ');';

		const hasImage = def.props.indexOf('image') !== -1;
		const props = resolve_compiler_props(def);

		for (const prop of props) {
			if (prop.key === 'data-name') continue;
			const map = PROP_METHODS[prop.key];
			if (!map) continue;

			let val;
			if (prop.key === 'width') {
				if (!hasImage && obj.style.width === '') continue;
				val = '' + parseInt(obj.offsetWidth);
			} else if (prop.key === 'height') {
				if (!hasImage && obj.style.height === '') continue;
				val = '' + parseInt(obj.offsetHeight);
			} else if (prop.key === 'color') {
				val = (obj.className === 'label_element_gui' && obj.style.color) ? obj.style.color : obj.style.background;
			} else if (prop.key === 'left') {
				if (obj.style.left === '') continue;
				val = '' + parseInt(obj.offsetLeft);
			} else if (prop.key === 'top') {
				if (obj.style.top === '') continue;
				val = '' + parseInt(obj.offsetTop);
			} else if (prop.target === 'attr') {
				val = obj.getAttribute(prop.key) || '';
			} else if (prop.target === 'src') {
				val = obj.src || '';
			} else {
				val = obj.style[prop.key] || '';
			}
			if (!val) continue;

			if (prop.key === 'image') {
				if (val !== 'img/TImage.png' && val !== '') {
					code += name + '.image(#' + name + '_img_src_data_);';
					img_list_load[name + '_img_src_data_'] = val;
					img_list_count = 1;
				}
				continue;
			}

			if (map.f === 'int') {
				code += name + '.' + map.m + '(' + parseInt(val) + ');';
			} else if (map.f === 'string') {
				code += name + '.' + map.m + '("' + val + '");';
			} else if (map.f === 'hexcolor') {
				code += name + '.color(0x' + eval(val) + ');';
			} else if (map.f === 'raw') {
				code += name + '.' + map.m + '(' + val + ');';
			}
		}

		const bc = obj.style.borderColor;
		if (bc !== '') code += name + '.bordercolor(' + bc + ');';

		const text = obj.innerText;
		if (text !== '') code += name + '.caption("' + text + '");';

		const events = get_component_events(obj);
		for (let ei = 0; ei < events.length; ei++) {
			const evName = events[ei];
			const evAttr = event_attr_name(evName);
			const evCode = obj.getAttribute(evAttr);
			if (evCode !== null) {
				const funcSuffix = evName.replace(/-/g, '_');
				code += name + '.' + evName + '(#' + name + '__ptr_func__' + funcSuffix + '_);';
				add_init_event_func += 'void ' + name + '__ptr_func__' + funcSuffix + '_(dword key,x,y){' + decodeURIComponent(evCode) + '}';
			}
		}
	}
	return code;
}

function compile_window_from_data(data) {
	addwinelm.innerHTML = data.html || '';
	if (data.attrs) {
		for (const key in data.attrs) {
			if (data.attrs[key]) win.setAttribute(key, data.attrs[key]);
			else win.removeAttribute(key);
		}
	} else {
		win.setAttribute('data-name', data.name || 'Window');
		win.setAttribute('data-caption', data.caption || '');
		win.setAttribute('data-hide-prop', data.hide_prop || '');
		if (data.align) win.setAttribute('data-align', data.align);
		else win.removeAttribute('data-align');
	}
	const s = data.style || {};
	win.style.width = (s.width || data.width || '300px');
	win.style.height = (s.height || data.height || '230px');
	win.style.background = (s.background || data.bg || '#ffffff');
	addwinelm.style.width = parseInt(win.style.width) - 2;
	addwinelm.style.height = parseInt(win.style.height) - 2;
	set_element_defunc(addwinelm);
}

function generate_code_string() {
	c_code = [];
	c_count = 0;
	gui_list_init = [];
	gui_list_count = 0;
	add_init_event_func = '';

	save_window_state();

	let main_code = '';
	const count = count_stack;
	c_code[c_count++] = 'window ' + GLOBAL_INIT_ELEMENT.join(',') + ';';
	const save_gui_init_position = c_count;
	c_code[c_count++] = '';
	const save_img_init_position = c_count;
	c_code[c_count++] = '';

	const saved_index = current_win_index;
	const saved_html = addwinelm.innerHTML;

	for (let i = 0; i < count; i++) {
		const data = window_data[i];
		if (!data) continue;

		compile_window_from_data(data);
		const name = data.attrs ? (data.attrs['data-name'] || 'Window') : (data.name || 'Window');
		const s = data.style || {};
		const w = parseInt(s.width || data.width || '300') - 2;
		const h = parseInt(s.height || data.height || '230') - 2;
		const cap = data.attrs ? (data.attrs['data-caption'] || '') : (data.caption || '');
		const tmp = data.attrs ? (data.attrs['data-align'] || '') : (data.align || '');

		main_code += name + '.prepare();';
		main_code += name + '.width(' + w + ');';
		main_code += name + '.height(' + h + ');';
		main_code += name + '.caption("' + cap + '");';
		main_code += name + '.color(0x' + eval(window.getComputedStyle(win).backgroundColor) + ');';
		if (tmp === '1') main_code += name + '.StartPosition(' + tmp + ');';
		main_code += convert_elements(win);
		main_code += name + '.create();';
	}

	addwinelm.innerHTML = saved_html;
	compile_window_from_data(window_data[saved_index]);

	if (gui_list_count) c_code[save_gui_init_position] = 'gui ' + gui_list_init.join(',') + ';';
	if (img_list_count) {
		let img = '';
		for (const key in img_list_load) {
			img += key + '=@img"' + img_list_load[key] + '"';
		}
		c_code[save_img_init_position] = 'dword ' + img + ';';
	}
	if (add_init_event_func !== '') c_code[c_count++] = add_init_event_func;
	c_code[c_count++] = 'void main(){';
	c_code[c_count++] = main_code;
	c_code[c_count++] = '}';

	return c_code.join('');
}

function compile(cmd) {
	const codes = generate_code_string();
	if (cmd === 1) return return_code(codes);
	if (cmd === 2) return downloads_apps(codes);
}

function show_compiled_code() {
	const codes = generate_code_string();
	document.getElementById('view_code_text').value = codes;
	document.getElementById('window_view_code').style.display = 'flex';
}

function close_view_code() {
	document.getElementById('window_view_code').style.display = 'none';
}

function return_code(codes) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://127.0.0.1/CMM_SERVER/server/compile.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('CODE=' + encodeURIComponent(codes));
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.responseText !== 'okey') alert(xhr.responseText);
	};
}

function downloads_apps(codes) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/save.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('CODE=' + encodeURIComponent(codes));
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) document.location.href = 'api/compile.php';
	};
}
