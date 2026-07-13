var gui_list_init = [];
var gui_list_count = 0;
var img_list_load = {};
var img_list_count = 0;
var add_init_event_func = '';

function convert_elements(w_obj) {
	var w = w_obj.children[0];
	add_init_event_func = '';
	var list = w.children;
	var count = list.length;
	img_list_count = 0;
	img_list_load = [];
	var obj;
	var code = '';
	var name;
	var name_window = w_obj.getAttribute('data-name');
	var cmd;
	while (count) {
		obj = list[--count];
		cmd = class_gui_list_elements.indexOf(obj.className);

		if (cmd != -1) {
			name = obj.getAttribute('data-name');
			gui_list_init[gui_list_count++] = name;
			code += name_window + '.adds(#' + name + ',' + cmd + ');';
			var tmp = obj.style.left;
			if (tmp != '') code += name + '.left(' + parseInt(obj.offsetLeft) + ');';

			tmp = obj.getAttribute(cmd_event_name[0]);
			if (tmp != null) {
				code += name + '.mouseclick(#' + name + '__ptr_func__click_);';
				add_init_event_func += 'void ' + name + '__ptr_func__click_(dword key,x,y){' + decodeURIComponent(tmp) + '}';
			}

			tmp = obj.style.top;
			if (tmp != '') code += name + '.top(' + parseInt(obj.offsetTop) + ');';
			if (obj.className == 'image_element_gui') {
				code += name + '.width(' + parseInt(obj.offsetWidth) + ');';
				code += name + '.height(' + parseInt(obj.offsetHeight) + ');';
				tmp = obj.src;
				if (tmp != 'img/TImage.png' && tmp != '') {
					code += name + '.image(#' + name + '_img_src_data_);';
					img_list_load[name + '_img_src_data_'] = tmp;
					img_list_count = 1;
				}
			} else {
				tmp = obj.style.width;
				if (tmp != '') code += name + '.width(' + parseInt(obj.offsetWidth) + ');';
				tmp = obj.style.height;
				if (tmp != '') code += name + '.height(' + parseInt(obj.offsetHeight) + ');';
			}
			if (obj.className == 'label_element_gui') tmp = obj.style.color; else tmp = obj.style.background;
			if (tmp != '') code += name + '.color(0x' + eval(tmp) + ');';

			tmp = obj.style.borderColor;
			if (tmp != '') code += name + '.bordercolor(' + tmp + ');';
			tmp = obj.innerText;
			if (tmp != '') code += name + '.caption("' + tmp + '");';
		}
	}
	return code;
}

function compile_window_from_data(data) {
	addwinelm.innerHTML = data.html || '';
	if (data.attrs) {
		for (var key in data.attrs) {
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
	var s = data.style || {};
	win.style.width = (s.width || data.width || '300px');
	win.style.height = (s.height || data.height || '230px');
	win.style.background = (s.background || data.bg || '#f8f9fb');
	addwinelm.style.width = parseInt(win.style.width) - 2;
	addwinelm.style.height = parseInt(win.style.height) - 2;
	set_element_defunc(addwinelm);
}

function compile(cmd) {
	c_code = [];
	c_count = 0;
	gui_list_init = [];
	gui_list_count = 0;

	var main_code = '';
	var count = count_stack;
	c_code[c_count++] = 'window ' + GLOBAL_INIT_ELEMENT.join(',') + ';';
	var save_gui_init_position = c_count;
	c_code[c_count++] = '';
	var save_img_init_position = c_count;
	c_code[c_count++] = '';

	var saved_index = current_win_index;
	var saved_html = addwinelm.innerHTML;

	for (var i = 0; i < count; i++) {
		var data = window_data[i];
		if (!data) continue;

		compile_window_from_data(data);
		var name = data.attrs ? (data.attrs['data-name'] || 'Window') : (data.name || 'Window');
		var s = data.style || {};
		var w = parseInt(s.width || data.width || '300') - 2;
		var h = parseInt(s.height || data.height || '230') - 2;
		var cap = data.attrs ? (data.attrs['data-caption'] || '') : (data.caption || '');
		var tmp = data.attrs ? (data.attrs['data-align'] || '') : (data.align || '');

		main_code += name + '.prepare();';
		main_code += name + '.width(' + w + ');';
		main_code += name + '.height(' + h + ');';
		main_code += name + '.caption("' + cap + '");';
		main_code += name + '.color(0x' + eval(window.getComputedStyle(win).backgroundColor) + ');';
		if (tmp == '1') main_code += name + '.StartPosition(' + tmp + ');';
		main_code += convert_elements(win);
		main_code += name + '.create();';
	}

	addwinelm.innerHTML = saved_html;
	compile_window_from_data(window_data[saved_index]);

	if (gui_list_count) c_code[save_gui_init_position] = 'gui ' + gui_list_init.join(',') + ';';
	if (img_list_count) {
		var img = '';
		for (var key in img_list_load) {
			img += key + '=@img"' + img_list_load[key] + '"';
		}
		c_code[save_img_init_position] = 'dword ' + img + ';';
	}
	if (add_init_event_func != '') c_code[c_count++] = add_init_event_func;
	c_code[c_count++] = 'void main(){';
	c_code[c_count++] = main_code;
	c_code[c_count++] = '}';

	if (cmd == 1) return return_code(c_code.join(''));
	if (cmd == 2) return downloads_apps(c_code.join(''));
}

function return_code(codes) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://127.0.0.1/CMM_SERVER/server/compile.php", true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send("CODE=" + encodeURIComponent(codes));
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.responseText != 'okey') alert(xhr.responseText);
		}
	};
}

function downloads_apps(codes) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "api/save.php", true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send("CODE=" + encodeURIComponent(codes));
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			document.location.href = 'api/compile.php';
		}
	};
}
