var c_code = [];
var c_count = 0;
var grid_distance = 5;

var data_help_status = [
	['add_event', 'Добавить событие для исполнения отрывка кода.'],
	['but_delete_event', 'Удалить событие из списка.'],
	['edit_event', 'Редактировать событие из списка.']
];

var win, addwinelm, select_element = null;
var select_element_rect, select_element_rect_timer = null, sel_rect_x, sel_rect_y;
var win_x, win_y, win_w, win_h, r_size, int_ptr = null, t_size, rt_size;
var element_width_atr, element_height_atr, element_name;
var element_add_event, element_list, caption_element, align_element;
var pos_x_element, pos_y_element;
var element_list_event, tmp_event_data = [];
var list_eval_select = null;
var list_element_select = null;
var window_stack = [], count_stack = 0;
var element_stack = [];
var count_element_add = {};
var list_element_system = ['Timer', 'DataVar', 'Function', 'Download', 'SampleDialog'];
var class_gui_list_elements = ['button_element_gui', 'shape_element_gui', 'label_element_gui', 'image_element_gui'];
var cmd_event_name = ['data-event-click', 'data-event-dblclick'];
var GLOBAL_INIT_ELEMENT = [], GLOBAL_INIT_COUNT = 0;
var cmd_sensor = false;
var global_lock_event = false;
var save_x, save_y;
var copy_element_object = null;
var cmd_event_ctrl = false;
var test_;

if ('ontouchstart' in window) cmd_sensor = true;

var mouse = {
	x: 0, y: 0,
	getX: function (e) {
		if (!e) return this.x;
		if (e.pageX !== undefined) { this.x = e.pageX; return this.x; }
		if (e.clientX !== undefined) {
			this.x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
			return this.x;
		}
		return this.x;
	},
	getY: function (e) {
		if (!e) return this.y;
		if (e.pageY !== undefined) { this.y = e.pageY; return this.y; }
		if (e.clientY !== undefined) {
			this.y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
			return this.y;
		}
		return this.y;
	}
};

document.addEventListener('mousemove', function (e) {
	mouse.x = e.pageX !== undefined ? e.pageX : e.clientX;
	mouse.y = e.pageY !== undefined ? e.pageY : e.clientY;
}, { passive: true });

function getID(x) { return document.getElementById(x); }
function createELM(x) { return document.createElement(x); }
function elmADD(x) { return document.body.appendChild(x); }

function RrefreshPOS(o) {
	var tmp = parseInt(o.offsetWidth);
	element_width_atr.value = tmp - 2;
	pos_x_element.value = o.offsetLeft;
	var r = o.getBoundingClientRect();
	r_size.style.left = r.left + r.width - r_size.offsetWidth / 2;
	r_size.style.top = r.top + r.height / 2 - r_size.offsetHeight / 2;
}

function TrefreshPOS(o) {
	var tmp = parseInt(o.offsetHeight);
	element_height_atr.value = tmp - 2;
	pos_y_element.value = o.offsetTop;
	var r = o.getBoundingClientRect();
	t_size.style.left = r.left + r.width / 2 - t_size.offsetWidth / 2;
	t_size.style.top = r.top + tmp - t_size.offsetHeight / 2;
}

function RTrefreshPOS(o) {
	var r = o.getBoundingClientRect();
	rt_size.style.left = r.left + r.width - rt_size.offsetWidth / 2;
	rt_size.style.top = r.top + r.height - rt_size.offsetHeight / 2;
}

function newRightPosition(x) {
	var r = addwinelm.getBoundingClientRect();
	var tmp = x - r.left;
	if (tmp < 0) tmp = 0;
	if (select_element == null) {
		addwinelm.style.width = win.style.width = Math.round(tmp / grid_distance) * grid_distance;
		RrefreshPOS(win); TrefreshPOS(win); RTrefreshPOS(win);
	} else {
		tmp = Math.round(tmp / grid_distance) * grid_distance;
		select_element.style.width = tmp - select_element.offsetLeft;
		if (tmp > addwinelm.offsetWidth) select_element.style.width = addwinelm.offsetWidth - select_element.offsetLeft - 2;
		RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
	}
}

function newTopPosition(y) {
	var r = addwinelm.getBoundingClientRect();
	var tmp = y - r.top;
	if (tmp < 0) tmp = 0;
	if (select_element == null) {
		addwinelm.style.height = win.style.height = Math.round(tmp / grid_distance) * grid_distance;
		RrefreshPOS(win); TrefreshPOS(win); RTrefreshPOS(win);
	} else {
		tmp = Math.round(tmp / grid_distance) * grid_distance;
		select_element.style.height = tmp - select_element.offsetTop;
		if (tmp > addwinelm.offsetHeight) select_element.style.height = addwinelm.offsetHeight - select_element.offsetTop - 2;
		RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
	}
}

function deleteElement(elem) {
	if (elem == null) return false;
	return elem.parentNode.removeChild(elem);
}

function select_element_menu(o) {
	list_element_select = o;
	o.className = 'select';
	return false;
}

function MoveSelectedElement() {
	var tmp = Math.round((mouse.x - save_x) / grid_distance) * grid_distance;
	if (tmp < 0) tmp = 0;
	else if (tmp + select_element.offsetWidth > addwinelm.offsetWidth) tmp = addwinelm.offsetWidth - select_element.offsetWidth;
	select_element.style.left = tmp;

	tmp = Math.round((mouse.y - save_y) / grid_distance) * grid_distance;
	if (tmp < 0) tmp = 0;
	else if (tmp + select_element.offsetHeight > addwinelm.offsetHeight) tmp = addwinelm.offsetHeight - select_element.offsetHeight;
	select_element.style.top = tmp;

	RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
}

function select_element_added(o) {
	hide_atr_element(o);
	if (int_ptr == null) {
		save_x = mouse.x - parseInt(o.style.left);
		save_y = mouse.y - parseInt(o.style.top);
		select_element = o;
		int_ptr = window.setInterval(MoveSelectedElement, grid_distance);
		load_attribute_list_event();
	} else {
		save_x -= parseInt(o.style.left);
		save_y -= parseInt(o.style.top);
		select_element = o;
	}
	RrefreshPOS(o); TrefreshPOS(o); RTrefreshPOS(o);
	update_component_tree();
	return false;
}

function func_define_select() {
	select_element_added(this);
	global_lock_event = true;
}

function getElementComputedStyle(elem, prop) {
	if (typeof elem != "object") elem = document.getElementById(elem);
	if (document.defaultView && document.defaultView.getComputedStyle) {
		if (prop.match(/[A-Z]/)) prop = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
		return document.defaultView.getComputedStyle(elem, "").getPropertyValue(prop);
	}
	if (elem.currentStyle) {
		var i;
		while ((i = prop.indexOf("-")) != -1) prop = prop.substr(0, i) + prop.substr(i + 1, 1).toUpperCase() + prop.substr(i + 2);
		return elem.currentStyle[prop];
	}
	return "";
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgb(r, g, b) {
	return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hide_atr_element(o) {
	if (o == null) o = win;
	var a = o.getAttribute('data-hide-prop').split(',');
	var i = 0;
	var atr_tr = getID('attribute_element').children[0].children;
	test_ = atr_tr;
	var count = atr_tr.length;
	while (i < count) {
		if (a.indexOf('' + i) != -1) { atr_tr[i].style.display = 'none'; ++i; continue; }
		if (i == 1) {
			var name = o.getAttribute('data-name');
			atr_tr[i].children[2].children[0].value = name;
		} else if (i == 2) {
			if (select_element == null) atr_tr[i].children[2].children[0].value = o.getAttribute('data-caption');
			else atr_tr[i].children[2].children[0].value = o.innerText;
		}
		atr_tr[i].style.display = 'table-row';
		++i;
	}
}

function past_gui_window(win, type, atr, name_type) {
	if (list_element_system.indexOf(name_type) != -1) {
		var element = createELM('TABLE');
		var img_url = list_element_select.children[0].children[0].children[0].children[0].children[0].src;
		element.className = 'simple_object_code';
		element.style.left = Math.round(event.offsetX / grid_distance) * grid_distance;
		element.style.top = Math.round(event.offsetY / grid_distance) * grid_distance;

		if (count_element_add[name_type] == undefined) count_element_add[name_type] = 0;
		var name = name_type + '_' + (++count_element_add[name_type]);
		element.setAttribute('data-name', name);
		element.onmousedown = function () { select_element_added(this); global_lock_event = true; };
		if (cmd_sensor) element.ontouchstart = element.onmousedown;
		element.setAttribute('data-hide-prop', atr);
		hide_atr_element(element);

		var tr = createELM('TR');
		var td = createELM('TD');
		var img = createELM('IMG');
		img.src = img_url;
		td.appendChild(img);
		tr.appendChild(td);
		element.appendChild(tr);

		tr = createELM('TR');
		td = createELM('TD');
		td.innerText = name;
		tr.appendChild(td);
		element.appendChild(tr);

		win.appendChild(element);
		select_element_added(element);
	} else {
		var element;
		if (name_type == 'Image') {
			element = createELM('IMG');
			element.src = 'img/TImage.png';
		} else element = createELM('DIV');
		element.className = type;
		element.style.left = Math.round(event.offsetX / grid_distance) * grid_distance;
		element.style.top = Math.round(event.offsetY / grid_distance) * grid_distance;
		if (name_type == 'Button') element.innerText = 'Кнопка';
		if (name_type == 'Label') element.innerText = 'Текст';

		if (count_element_add[name_type] == undefined) count_element_add[name_type] = 0;
		element.setAttribute('data-name', name_type + '_' + (++count_element_add[name_type]));
		element.onmousedown = func_define_select;
		if (cmd_sensor) element.ontouchstart = element.onmousedown;
		element.setAttribute('data-hide-prop', atr);
		hide_atr_element(element);

		win.appendChild(element);
		select_element_added(element);
	}
	update_component_tree();
}

function change_value_element(name, o) {
	if (o.value == '') {
		o.value = win.getAttribute(name);
		return;
	}
	if (select_element == null) {
		if (name == 'color') win.style.background = o.value;
		else {
			if (name == 'data-name') {
				if (window_data[current_win_index]) window_data[current_win_index].name = o.value;
			}
			win.setAttribute(name, o.value);
		}
	} else {
		if (name == 'data-caption') select_element.innerText = o.value;
		else if (name == 'color') {
			if (select_element.className == 'label_element_gui') select_element.style.color = o.value;
			else select_element.style.background = o.value;
		} else if (name == 'image') {
			select_element.src = o.value;
		} else select_element.setAttribute(name, o.value);
	}
	update_component_tree();
}

function change_setka_option(e) {
	var data = e.value.split(' ');
	if (data[1] == 'px') {
		var px = parseInt(data[0]);
		addwinelm.style.backgroundImage = 'radial-gradient(circle, #c0c4d0 1px, transparent 1px)';
		addwinelm.style.backgroundSize = px + 'px ' + px + 'px';
		grid_distance = px;
		return true;
	} else {
		addwinelm.style.backgroundImage = 'none';
		addwinelm.style.backgroundSize = '';
		grid_distance = 1;
		return true;
	}
}

function set_text_stat_bar(txt) {
	var el = getID('text_status_bar');
	if (el) el.innerText = txt;
}

var window_data = {};
var current_win_index = 0;

function save_window_state() {
	if (current_win_index < 0) return;
	window_data[current_win_index] = {
		html: addwinelm.innerHTML,
		name: win.getAttribute('data-name'),
		caption: win.getAttribute('data-caption'),
		width: win.style.width,
		height: win.style.height,
		bg: win.style.background,
		hide_prop: win.getAttribute('data-hide-prop'),
		align: win.getAttribute('data-align'),
		components: scan_window_components()
	};
}

function load_window_data(index) {
	var data = window_data[index];
	if (data) {
		addwinelm.innerHTML = data.html || '';
		win.setAttribute('data-name', data.name);
		win.setAttribute('data-caption', data.caption || '');
		win.style.width = data.width || '300px';
		win.style.height = data.height || '230px';
		win.style.background = data.bg || '#e6e9ef';
		win.setAttribute('data-hide-prop', data.hide_prop || '');
		if (data.align) win.setAttribute('data-align', data.align);
		else win.removeAttribute('data-align');
	} else {
		addwinelm.innerHTML = '';
		win.setAttribute('data-name', 'Window_' + (index + 1));
		win.setAttribute('data-caption', 'Окно');
		win.style.width = '300px';
		win.style.height = '230px';
		win.style.background = '#e6e9ef';
		win.setAttribute('data-hide-prop', '');
		win.removeAttribute('data-align');
	}
	addwinelm.style.width = parseInt(win.style.width) - 2;
	addwinelm.style.height = parseInt(win.style.height) - 2;
	set_element_defunc(addwinelm);
}

function switch_window(index) {
	if (index == current_win_index) return;
	save_window_state();
	current_win_index = index;
	load_window_data(index);
	select_element = null;
	hide_atr_element(win);
	TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
	update_component_tree();
}

function add_new_window(name) {
	if (!name) name = prompt('Введите название окна:', 'Window_' + (count_stack + 1));
	if (!name) return;
	var index = count_stack;
	window_stack[index] = null;
	window_data[index] = null;
	window_data[current_win_index] = window_data[current_win_index] || {
		html: addwinelm.innerHTML,
		name: win.getAttribute('data-name'),
		caption: win.getAttribute('data-caption'),
		width: win.style.width,
		height: win.style.height,
		bg: win.style.background,
		hide_prop: win.getAttribute('data-hide-prop'),
		align: win.getAttribute('data-align'),
		components: scan_window_components()
	};
	count_stack++;
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = name;
	switch_window(index);
	win.setAttribute('data-name', name);
	if (window_data[index]) window_data[index].name = name;
}

function scan_window_components() {
	var comps = [];
	var list = addwinelm.children;
	for (var i = 0; i < list.length; i++) {
		var name = list[i].getAttribute('data-name');
		if (name) comps.push(name);
	}
	return comps;
}

function update_window_select() {
	var sel = getID('list_window_add');
	if (!sel) return;
	sel.innerHTML = '';
	for (var i = 0; i < count_stack; i++) {
		var data = window_data[i];
		var opt = createELM('option');
		opt.value = i;
		opt.text = data ? data.name : ('Window_' + (i + 1));
		sel.add(opt);
	}
	sel.value = '' + current_win_index;
	var addOpt = createELM('option');
	addOpt.value = '-1';
	addOpt.text = '+ Добавить окно';
	sel.add(addOpt);
	sel.onchange = function () {
		var idx = parseInt(this.value);
		if (idx == -1) { add_new_window(); }
		else if (idx != current_win_index) switch_window(idx);
	};
}

function update_component_tree() {
	update_window_select();
	var sel = getID('component_tree');
	if (!sel) return;
	sel.innerHTML = '';
	var selCompName = select_element ? select_element.getAttribute('data-name') : null;
	var selectedValue = null;
	for (var i = 0; i < count_stack; i++) {
		var data = window_data[i];
		var winName = data ? data.name : ('Window_' + (i + 1));
		var comps = data ? (data.components || []) : [];
		if (i == current_win_index) {
			comps = scan_window_components();
			if (data) data.components = comps;
		}

		var grp = createELM('optgroup');
		grp.label = winName;
		sel.add(grp);

		var winOpt = createELM('option');
		winOpt.value = i + '|';
		winOpt.text = winName;
		if (i == current_win_index && !selCompName) selectedValue = winOpt.value;
		grp.appendChild(winOpt);

		for (var j = 0; j < comps.length; j++) {
			var opt = createELM('option');
			opt.value = i + '|' + comps[j];
			opt.text = comps[j];
			if (i == current_win_index && comps[j] == selCompName) selectedValue = opt.value;
			grp.appendChild(opt);
		}
	}
	if (selectedValue) sel.value = selectedValue;
	sel.onchange = function () {
		var val = this.value.split('|');
		var winIdx = parseInt(val[0]);
		var compName = val[1];
		if (winIdx != current_win_index) switch_window(winIdx);
		if (compName) {
			var children = addwinelm.children;
			for (var k = 0; k < children.length; k++) {
				if (children[k].getAttribute('data-name') == compName) {
					select_element_added(children[k]);
					global_lock_event = true;
					break;
				}
			}
		}
	};
}

function create_size_rect_change() {
	r_size = createELM('DIV');
	r_size.className = "size";
	r_size.style.cursor = 'ew-resize';
	r_size.onmousedown = function () {
		int_ptr = window.setInterval(function () { newRightPosition(mouse.x); }, grid_distance);
		return false;
	};
	if (cmd_sensor) r_size.ontouchstart = r_size.onmousedown;
	elmADD(r_size);

	t_size = createELM('DIV');
	t_size.className = "size";
	t_size.style.cursor = 'ns-resize';
	t_size.onmousedown = function () {
		int_ptr = window.setInterval(function () { newTopPosition(mouse.y); }, grid_distance);
		return false;
	};
	if (cmd_sensor) t_size.ontouchstart = t_size.onmousedown;
	elmADD(t_size);

	rt_size = createELM('DIV');
	rt_size.className = "size";
	rt_size.style.cursor = 'nwse-resize';
	rt_size.onmousedown = function () {
		int_ptr = window.setInterval(function () { newRightPosition(mouse.x); newTopPosition(mouse.y); }, grid_distance);
		return false;
	};
	if (cmd_sensor) rt_size.ontouchstart = rt_size.onmousedown;
	elmADD(rt_size);
}

function changer_rect_select() {
	var x = mouse.x - sel_rect_x;
	var y = mouse.y - sel_rect_y;
	if (x < 0) { select_element_rect.style.left = sel_rect_x + x; x = -x; }
	if (y < 0) { select_element_rect.style.top = sel_rect_y + y; y = -y; }
	select_element_rect.style.width = x;
	select_element_rect.style.height = y;
}

function delete_select_element() {
	if (select_element != null) {
		select_element.parentNode.removeChild(select_element);
		select_element = null;
		TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
		hide_atr_element(win);
		update_component_tree();
	}
}

function add_stat_element_help(id, txt) {
	var el = getID(id);
	if (!el) return;
	el.onmouseover = function () { set_text_stat_bar(txt); };
	el.onmouseout = function () { set_text_stat_bar(''); };
}

function load_help_stat(txt) {
	var i = 0, l = txt.length, d;
	while (i < l) {
		d = txt[i++];
		add_stat_element_help(d[0], d[1]);
	}
}

function delete_event_list() {
	if (list_eval_select == null) return false;
	var tmp = list_eval_select.parentNode;
	if (tmp == null) return false;
	deleteElement(list_eval_select.parentNode);
	var x = parseInt(list_eval_select.getAttribute('data-sel-num'));
	delete tmp_event_data[tmp_event_data.indexOf(x)];

	var data_list_event_atr = select_element.getAttribute('data_list_event');
	var cmd = data_list_event_atr != '' ? parseInt(data_list_event_atr) : 0;
	cmd &= 0xFFFFFFFF ^ (1 << x);

	select_element.removeAttribute(cmd_event_name[x]);
	select_element.setAttribute('data_list_event', cmd);
}

function add_event_list(x) {
	if (tmp_event_data.indexOf(x) >= 0) return false;
	tmp_event_data[tmp_event_data.length] = x;

	var a = createELM('TR');
	var b = createELM('TD');
	b.setAttribute('data-sel-num', x);
	if (!x) { b.innerText = 'Клик'; b.id = cmd_event_name[x]; }
	else if (x == 1) { b.innerText = 'Двойной клик'; b.id = cmd_event_name[x]; }
	if (select_element == null) return false;

	var data_list_event_atr = select_element.getAttribute('data_list_event');
	var cmd = data_list_event_atr != '' ? parseInt(data_list_event_atr) : 0;
	cmd |= 1 << x;
	select_element.setAttribute('data_list_event', '' + cmd);

	b.className = 'default';
	b.onmousedown = function () {
		if (list_eval_select != null) list_eval_select.className = 'default';
		list_eval_select = this;
		this.className = 'select';
	};
	a.appendChild(b);
	element_list_event.appendChild(a);
}

function load_attribute_list_event() {
	tmp_event_data = [];
	var tmp = element_list_event.children;
	var count = tmp.length;
	while (count--) element_list_event.removeChild(tmp[count]);

	var data_list_event_atr = select_element.getAttribute('data_list_event');
	var cmd = data_list_event_atr != '' ? parseInt(data_list_event_atr) : 0;
	var x = 0;
	while (cmd) {
		if (cmd & 1) {
			var a = createELM('TR');
			var b = createELM('TD');
			b.id = cmd_event_name[x];
			if (!x) b.innerText = 'Клик';
			else if (x == 1) b.innerText = 'Двойной клик';
			b.setAttribute('data-sel-num', x);
			tmp_event_data[tmp_event_data.length] = x;
			b.className = 'default';
			b.onmousedown = function () {
				if (list_eval_select != null) list_eval_select.className = 'default';
				list_eval_select = this;
				this.className = 'select';
			};
			a.appendChild(b);
			element_list_event.appendChild(a);
		}
		++x;
		cmd >>= 1;
	}
}

function cancel_edit_code() {
	getID('window_edit_code').style.display = 'none';
}

function save_edit_code() {
	getID('window_edit_code').style.display = 'none';
	select_element.setAttribute(list_eval_select.id, encodeURIComponent(getID('code_edit_rect').value));
}

function click_edit_code() {
	var tmp = select_element.getAttribute(list_eval_select.id);
	getID('code_edit_rect').value = tmp == undefined ? '' : decodeURIComponent(tmp);
	if (list_eval_select != null) getID('window_edit_code').style.display = 'block';
}

function CmdKeyDown(event) {
	if (select_element != null) {
		if (event.keyCode == 38) {
			select_element.style.top = parseInt(select_element.style.top) - grid_distance;
			RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
		}
	}
}

function init_panel_resizers() {
	var splitters = document.querySelectorAll('.panel-splitter');
	var dragData = null;

	function onMouseMove(e) {
		if (!dragData) return;
		var dx = e.clientX - dragData.startX;
		var panel = dragData.panel;
		var w = dragData.startWidth + dx * dragData.sign;
		w = Math.max(dragData.minWidth, Math.min(w, dragData.maxWidth));
		panel.style.width = w + 'px';
	}

	function onMouseUp() {
		if (!dragData) return;
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		dragData.splitter.classList.remove('active');
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		try {
			localStorage.setItem('kstudio_panel_' + dragData.side, dragData.panel.style.width);
		} catch (e) {}
		if (select_element) {
			TrefreshPOS(select_element); RrefreshPOS(select_element); RTrefreshPOS(select_element);
		} else {
			TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
		}
		dragData = null;
	}

	splitters.forEach(function (splitter) {
		splitter.addEventListener('mousedown', function (e) {
			var side = splitter.getAttribute('data-side');
			var panel = side === 'left'
				? splitter.previousElementSibling
				: splitter.nextElementSibling;
			if (!panel || !panel.classList.contains('mid-panel')) return;
			e.preventDefault();
			var rect = panel.getBoundingClientRect();
			dragData = {
				startX: e.clientX,
				startWidth: rect.width,
				minWidth: 120,
				maxWidth: 500,
				panel: panel,
				splitter: splitter,
				side: side,
				sign: side === 'right' ? -1 : 1
			};
			splitter.classList.add('active');
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		});
	});

	var leftW = localStorage.getItem('kstudio_panel_left');
	var rightW = localStorage.getItem('kstudio_panel_right');
	if (leftW) {
		var lp = document.querySelector('.mid-left');
		if (lp) lp.style.width = leftW;
	}
	if (rightW) {
		var rp = document.querySelector('.mid-right');
		if (rp) rp.style.width = rightW;
	}
}

window.onload = function () {
	init_panel_resizers();
	win = getID('window_background');
	addwinelm = getID('window');
	select_element_rect = getID('select_elements_rect');
	element_width_atr = getID("size_width_atr");
	element_height_atr = getID("size_height_atr");
	element_name = getID("name_window");
	element_add_event = getID("add_event");
	caption_element = getID("CaptionElement");
	element_list = getID("list_add_event");
	element_list_event = getID("list_event");

	pos_x_element = getID('position_x_atr');
	pos_y_element = getID('position_y_atr');

	var colorborder_element = getID("color_border_element");
	align_element = getID("align_element");
	win_x = getID("LeftPanel").offsetWidth;
	win_y = getID("TopPanel").offsetHeight;

	if (align_element) {
		align_element.onchange = function () {
			win.setAttribute('data-align', this.value);
		};
	}

	create_size_rect_change();

	TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);

	if (caption_element) caption_element.value = "Окно " + count_stack;

	addwinelm.onmousedown = function (event) {
		if (list_element_select != null) {
			var type = list_element_select.getAttribute('data-name');
			if (type == 'Button') { past_gui_window(this, 'button_element_gui', '', type); return true; }
			if (type == 'Shape') { past_gui_window(this, 'shape_element_gui', '', type); return true; }
			if (type == 'Label') { past_gui_window(this, 'label_element_gui', '', type); return true; }
			if (type == 'Image') { past_gui_window(this, 'image_element_gui', '', type); return true; }
			if (type == 'Timer' || type == 'Function' || type == 'DataVar' || type == 'SampleDialog' || type == 'Download') {
				past_gui_window(this, 0, '', type); return true;
			}
		}
		if (!global_lock_event) {
			select_element = null;
			TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
			hide_atr_element(win);
			update_component_tree();
			var ey = event && event.pageY ? event.pageY : (event && event.clientY ? event.clientY : mouse.y);
			var ex = event && event.pageX ? event.pageX : (event && event.clientX ? event.clientX : mouse.x);
			sel_rect_y = select_element_rect.style.top = ey;
			sel_rect_x = select_element_rect.style.left = ex;
			select_element_rect.style.display = 'block';
			select_element_rect_timer = setInterval(changer_rect_select, 50);
			return true;
		}
		return false;
	};

	if (cmd_sensor) addwinelm.ontouchstart = addwinelm.onmousedown;

	if (colorborder_element) {
		colorborder_element.onchange = function () {
			select_element.style.borderColor = this.value;
		};
	}
	if (element_add_event) {
		element_add_event.onclick = function (e) {
			var ex = e && e.pageX ? e.pageX : (e && e.clientX ? e.clientX : mouse.x);
			var ey = e && e.pageY ? e.pageY : (e && e.clientY ? e.clientY : mouse.y);
			element_list.style.top = ey;
			element_list.style.display = 'block';
			element_list.style.left = ex - element_list.offsetWidth / 2;
		};
	}

	win.setAttribute('data-name', 'Window_1');
	win.setAttribute('data-caption', 'Окно');
	win.setAttribute('data-hide-prop', '');
	addwinelm.style.width = win.offsetWidth - 2;
	addwinelm.style.height = win.offsetHeight - 2;

	window_stack[0] = win;
	window_data[0] = {
		html: addwinelm.innerHTML,
		name: 'Window_1',
		caption: 'Окно',
		width: win.style.width,
		height: win.style.height,
		bg: win.style.background,
		hide_prop: '',
		align: null,
		components: []
	};
	count_stack = 1;
	current_win_index = 0;
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = 'Window_1';

	update_component_tree();
	load_help_stat(data_help_status);
};

window.onresize = function () {};

window.onmouseup = function () {
	clearInterval(int_ptr);
	int_ptr = null;
	global_lock_event = false;
	if (select_element_rect) {
		select_element_rect.style.display = 'none';
		select_element_rect.style.width = select_element_rect.style.height = 0;
	}
	clearInterval(select_element_rect_timer);
};

window.onmousedown = function () {
	if (list_element_select != null) {
		list_element_select.className = 'element';
		list_element_select = null;
	}
};
if (cmd_sensor) window.ontouchstart = window.onmousedown;

window.onkeydown = function (e) {
	var ev = window.event || e;
	if (ev.ctrlKey) cmd_event_ctrl = true;
	else if (ev.keyCode == 46) delete_select_element();
};

window.onkeyup = function (e) {
	var ev = window.event || e;
	if (cmd_event_ctrl && ev.keyCode == 67) copy_element_object = select_element;
	cmd_event_ctrl = false;
};
