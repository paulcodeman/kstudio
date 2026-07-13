let c_code = [];
let c_count = 0;
let grid_distance = 5;

const data_help_status = [
	['add_event', 'Добавить событие для исполнения отрывка кода.'],
	['but_delete_event', 'Удалить событие из списка.'],
	['edit_event', 'Редактировать событие из списка.']
];

let win, addwinelm, select_element = null;
let select_element_rect, select_element_rect_timer = null, sel_rect_x, sel_rect_y;
let win_x, win_y, win_w, win_h, r_size, int_ptr = null, t_size, rt_size;
let element_add_event, element_list;
let element_list_event, tmp_event_data = [];
let list_eval_select = null;
let list_element_select = null;
let window_stack = [], count_stack = 0;
const element_stack = [];
const count_element_add = {};

function get_event_def(name) {
	for (let i = 0; i < EVENTS.length; i++) {
		if (EVENTS[i].name === name) return EVENTS[i];
	}
	return null;
}

function event_attr_name(name) { return 'data-event-' + name; }

function get_component_def(el) {
	if (!el) return null;
	const dataName = el.getAttribute('data-name');
	if (!dataName) return null;
	for (let i = 0; i < COMPONENTS.length; i++) {
		if (dataName === COMPONENTS[i].name) return COMPONENTS[i];
		const prefix = COMPONENTS[i].name + '_';
		if (dataName.indexOf(prefix) === 0) return COMPONENTS[i];
	}
	return null;
}

function get_component_events(el) {
	const def = get_component_def(el);
	if (def) return def.events || WINDOW_EVENTS;
	return WINDOW_EVENTS;
}

let GLOBAL_INIT_ELEMENT = [], GLOBAL_INIT_COUNT = 0;
let cmd_sensor = false;
let global_lock_event = false;
let save_x, save_y;
let copy_element_object = null;
let cmd_event_ctrl = false;
let test_;

if ('ontouchstart' in window) cmd_sensor = true;

const mouse = {
	x: 0, y: 0,
	getX(e) {
		if (!e) return this.x;
		if (e.pageX !== undefined) { this.x = e.pageX; return this.x; }
		if (e.clientX !== undefined) {
			this.x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
			return this.x;
		}
		return this.x;
	},
	getY(e) {
		if (!e) return this.y;
		if (e.pageY !== undefined) { this.y = e.pageY; return this.y; }
		if (e.clientY !== undefined) {
			this.y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
			return this.y;
		}
		return this.y;
	}
};

document.addEventListener('mousemove', e => {
	mouse.x = e.pageX !== undefined ? e.pageX : e.clientX;
	mouse.y = e.pageY !== undefined ? e.pageY : e.clientY;
}, { passive: true });

function getID(x) { return document.getElementById(x); }
function createELM(x) { return document.createElement(x); }
function elmADD(x) { return document.body.appendChild(x); }

function refresh_prop_input(key, val) {
	const table = getID('attribute_element');
	if (!table) return;
	const inputs = table.querySelectorAll('input[data-prop-key="' + key + '"]');
	if (inputs.length) inputs[0].value = val;
}

function RrefreshPOS(o) {
	const tmp = parseInt(o.offsetWidth);
	refresh_prop_input('width', tmp - 2);
	refresh_prop_input('left', o.offsetLeft);
	const r = o.getBoundingClientRect();
	r_size.style.left = r.left + r.width - r_size.offsetWidth / 2;
	r_size.style.top = r.top + r.height / 2 - r_size.offsetHeight / 2;
}

function TrefreshPOS(o) {
	const tmp = parseInt(o.offsetHeight);
	refresh_prop_input('height', tmp - 2);
	refresh_prop_input('top', o.offsetTop);
	const r = o.getBoundingClientRect();
	t_size.style.left = r.left + r.width / 2 - t_size.offsetWidth / 2;
	t_size.style.top = r.top + tmp - t_size.offsetHeight / 2;
}

function RTrefreshPOS(o) {
	const r = o.getBoundingClientRect();
	rt_size.style.left = r.left + r.width - rt_size.offsetWidth / 2;
	rt_size.style.top = r.top + r.height - rt_size.offsetHeight / 2;
}

function newRightPosition(x) {
	const r = addwinelm.getBoundingClientRect();
	let tmp = x - r.left;
	if (tmp < 0) tmp = 0;
	if (select_element === null) {
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
	const r = addwinelm.getBoundingClientRect();
	let tmp = y - r.top;
	if (tmp < 0) tmp = 0;
	if (select_element === null) {
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
	if (elem === null) return false;
	return elem.parentNode.removeChild(elem);
}

function select_element_menu(o) {
	list_element_select = o;
	o.className = 'select';
	return false;
}

function MoveSelectedElement() {
	let tmp = Math.round((mouse.x - save_x) / grid_distance) * grid_distance;
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
	select_element = o;
	render_props(o);
	if (int_ptr === null) {
		save_x = mouse.x - parseInt(o.style.left);
		save_y = mouse.y - parseInt(o.style.top);
		int_ptr = window.setInterval(MoveSelectedElement, grid_distance);
		load_attribute_list_event();
	} else {
		save_x -= parseInt(o.style.left);
		save_y -= parseInt(o.style.top);
	}
	RrefreshPOS(o); TrefreshPOS(o); RTrefreshPOS(o);
	update_component_tree();
	return false;
}

function update_events_tab_visibility() {
	const events = select_element ? get_component_events(select_element) : WINDOW_EVENTS;
	const hasEvents = events && events.length > 0;
	const label = document.querySelector('label[for="vkl2"]');
	const radio = getID('vkl2');
	const content = document.querySelector('.conteiner > div:nth-of-type(2)');
	if (!label || !radio || !content) return;
	label.style.display = hasEvents ? '' : 'none';
	radio.style.display = hasEvents ? '' : 'none';
	content.style.display = hasEvents ? '' : 'none';
	if (!hasEvents && radio.checked) {
		getID('vkl1').checked = true;
	}
}

function func_define_select() {
	select_element_added(this);
	global_lock_event = true;
}

function getElementComputedStyle(elem, prop) {
	if (typeof elem !== 'object') elem = document.getElementById(elem);
	if (document.defaultView && document.defaultView.getComputedStyle) {
		if (prop.match(/[A-Z]/)) prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
		return document.defaultView.getComputedStyle(elem, '').getPropertyValue(prop);
	}
	if (elem.currentStyle) {
		let i;
		while ((i = prop.indexOf('-')) !== -1) prop = prop.substring(0, i) + prop.substring(i + 1, 1).toUpperCase() + prop.substring(i + 2);
		return elem.currentStyle[prop];
	}
	return '';
}

function componentToHex(c) {
	const hex = c.toString(16);
	return hex.length === 1 ? '0' + hex : hex;
}

function rgb(r, g, b) {
	return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function get_prop_def(key) {
	for (let i = 0; i < PROPS.length; i++) {
		if (PROPS[i].key === key) return PROPS[i];
	}
	return null;
}

function get_props_for_element(el) {
	if (select_element === null) return WINDOW_PROPS;
	const def = get_component_def(el);
	if (!def || !def.props) return COMPONENTS[0].props;
	const resolved = [];
	let currentGroup = null;
	for (let i = 0; i < def.props.length; i++) {
		const p = def.props[i];
		if (typeof p === 'string') {
			const found = get_prop_def(p);
			if (found) {
				if (found.group && found.group !== currentGroup) {
					currentGroup = found.group;
					resolved.push({ section: currentGroup });
				}
				resolved.push(found);
			}
		} else {
			if (p.group && p.group !== currentGroup) {
				currentGroup = p.group;
				resolved.push({ section: currentGroup });
			} else if (!p.group && !p.section) {
				const prev = resolved.length > 0 ? resolved[resolved.length - 1] : null;
				if (prev && prev.group) currentGroup = prev.group;
			}
			resolved.push(p);
		}
	}
	return resolved;
}

function get_prop_value(el, prop) {
	if (prop.key === 'color') {
		if (el.className === 'label_element_gui' && el.style.color) return el.style.color;
		return el.style.background || '#ffffff';
	}
	let val = '';
	if (prop.target === 'attr') val = el.getAttribute(prop.key) || '';
	else if (prop.target === 'style') {
		val = el.style[prop.key] || '';
		if (!val) {
			const cs = getComputedStyle(el);
			if (cs && prop.key.match(/^(left|top|width|height)$/)) val = parseInt(cs[prop.key]) + 'px';
		}
	}
	else if (prop.target === 'src') val = el.src || '';
	else if (prop.target === 'innerText') val = el.innerText || '';
	if (prop.type === 'number' && val) val = '' + parseInt(val);
	return val;
}

function render_props(el) {
	if (!el) el = win;
	const props = get_props_for_element(el);
	const container = getID('attribute_element');
	if (!container) return;
	container.innerHTML = '';
	container.className = 'prop-grid';
	let currentSection = null;
	for (let i = 0; i < props.length; i++) {
		const p = props[i];
		if (p.section) {
			currentSection = p.section;
			const header = createELM('div');
			header.className = 'title_pod';
			header.style.gridColumn = '1 / -1';
			header.style.cursor = 'pointer';
			const storageKey = 'kstudio_collapsed_' + currentSection;
			const collapsed = localStorage.getItem(storageKey) === '1';
			header.innerText = (collapsed ? '▶ ' : '▼ ') + currentSection;
			header.onclick = (function (key) {
				return function () {
					localStorage.setItem(key, localStorage.getItem(key) === '1' ? '0' : '1');
					render_props(select_element || win);
				};
			})(storageKey);
			container.appendChild(header);
			continue;
		}
		const value = get_prop_value(el, p);
		const label = createELM('div');
		label.className = 'title_atr';
		label.innerText = p.label;
		const val = createELM('div');
		val.className = 'prop-val';
		let input;
		if (p.type === 'select') {
			input = createELM('select'); input.className = 'list_atr';
			for (let j = 0; j < p.options.length; j++) {
				const opt = createELM('option'); opt.value = p.options[j].v; opt.text = p.options[j].l;
				if ('' + opt.value === '' + value) opt.selected = true;
				input.add(opt);
			}
			input.onchange = function () { apply_prop(this); };
		} else if (p.type === 'color') {
			input = createELM('input'); input.type = 'color';
			if (value) input.value = value;
			input.onchange = function () { apply_prop(this); };
		} else if (p.type === 'number') {
			input = createELM('input'); input.type = 'number'; input.value = value;
			input.onmouseup = function () { this.select(); };
			input.oninput = function () { apply_prop(this); };
		} else {
			input = createELM('input'); input.value = value;
			input.onmouseup = function () { this.select(); };
			input.oninput = function () { apply_prop(this); };
		}
		input.setAttribute('data-prop-key', p.key);
		input.setAttribute('data-prop-target', p.target);
		if (p.type === 'select') input.setAttribute('data-prop-type', 'select');
		val.appendChild(input);
		if (currentSection) {
			const storageKey = 'kstudio_collapsed_' + currentSection;
			if (localStorage.getItem(storageKey) === '1') {
				label.style.display = 'none';
				val.style.display = 'none';
			}
		}
		container.appendChild(label);
		container.appendChild(val);
	}
	if (!select_element) load_attribute_list_event();
	update_events_tab_visibility();
}

function apply_prop(input) {
	const key = input.getAttribute('data-prop-key');
	const target = input.getAttribute('data-prop-target');
	const propType = input.getAttribute('data-prop-type');
	const val = input.value;
	const el = select_element || win;
	const isComponent = (select_element !== null);

	if (key === 'data-name') {
		const skip = isComponent ? select_element : window_data[current_win_index];
		if (is_name_taken(val, skip)) { alert('Имя "' + val + '" уже используется'); input.value = get_prop_value(el, {key, target, type: propType || 'text'}); return; }
		if (!isComponent && window_data[current_win_index]) {
			window_data[current_win_index] = upgrade_window_data(window_data[current_win_index]);
			window_data[current_win_index].attrs['data-name'] = val;
		}
	}

	if (target === 'attr') el.setAttribute(key, val);
	else if (target === 'style') {
		if (key === 'color') {
			if (isComponent && el.className === 'label_element_gui') el.style.color = val;
			else el.style.background = val;
		} else {
			el.style[key] = val;
			if (key.match(/^(left|top|width|height)$/)) el.style[key] = val + 'px';
		}
	}
	else if (target === 'src') el.src = val;
	else if (target === 'innerText') el.innerText = val;

	update_component_tree();
}

function past_gui_window(win, name_type) {
	let comp;
	for (let ci = 0; ci < COMPONENTS.length; ci++) {
		if (COMPONENTS[ci].name === name_type) { comp = COMPONENTS[ci]; break; }
	}
	if (!comp) return;

	let element;
	if (comp.system) {
		element = createELM('DIV');
		element.className = 'simple_object_code';
	} else if (name_type === 'Image') {
		element = createELM('IMG');
		element.src = comp.icon || 'img/TImage.png';
	} else {
		element = createELM('DIV');
		element.className = comp.typeClass || '';
	}
	element.style.left = Math.round(event.offsetX / grid_distance) * grid_distance;
	element.style.top = Math.round(event.offsetY / grid_distance) * grid_distance;

	if (count_element_add[name_type] === undefined) count_element_add[name_type] = 0;
	const name = name_type + '_' + (++count_element_add[name_type]);
	element.setAttribute('data-name', name);
	element.onmousedown = comp.system ? function () { select_element_added(this); global_lock_event = true; } : func_define_select;
	if (cmd_sensor) element.ontouchstart = element.onmousedown;

	if (comp.system) {
		const img = createELM('IMG');
		img.src = comp.icon;
		element.appendChild(img);
		const nameDiv = createELM('DIV');
		nameDiv.className = 'soc_name';
		nameDiv.innerText = name;
		element.appendChild(nameDiv);
	} else if (comp.defaultText) {
		element.innerText = comp.defaultText;
	}

	win.appendChild(element);
	select_element_added(element);
	update_component_tree();
}

function win_name(data) {
	if (!data) return '';
	return (data.attrs && data.attrs['data-name']) || data.name || '';
}

function is_name_taken(newName, skipElement) {
	for (let i = 0; i < count_stack; i++) {
		const data = window_data[i];
		if (data && win_name(data) === newName && data !== skipElement) return true;
		const comps = (i === current_win_index) ? scan_window_components() : (data ? (data.components || []) : []);
		for (let j = 0; j < comps.length; j++) {
			if (comps[j] === newName) return true;
		}
	}
	return false;
}

function change_value_element(name, o) {
	if (o.value === '') {
		o.value = win.getAttribute(name);
		return;
	}
	if (select_element === null) {
		if (name === 'color') win.style.background = o.value;
		else {
			if (name === 'data-name') {
				if (is_name_taken(o.value, window_data[current_win_index])) { alert('Имя "' + o.value + '" уже используется'); o.value = win.getAttribute(name); return; }
				if (window_data[current_win_index]) {
					window_data[current_win_index] = upgrade_window_data(window_data[current_win_index]);
					window_data[current_win_index].attrs['data-name'] = o.value;
				}
			}
			win.setAttribute(name, o.value);
		}
	} else {
		if (name === 'data-caption') select_element.innerText = o.value;
		else if (name === 'color') {
			if (select_element.className === 'label_element_gui') select_element.style.color = o.value;
			else select_element.style.background = o.value;
		} else if (name === 'image') {
			select_element.src = o.value;
		} else {
			if (name === 'data-name' && is_name_taken(o.value, select_element)) { alert('Имя "' + o.value + '" уже используется'); o.value = select_element.getAttribute(name); return; }
			select_element.setAttribute(name, o.value);
		}
	}
	update_component_tree();
}

function change_setka_option(e) {
	const data = e.value.split(' ');
	if (data[1] === 'px') {
		const px = parseInt(data[0]);
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
	const el = getID('text_status_bar');
	if (el) el.innerText = txt;
}

let window_data = {};
let current_win_index = 0;

function save_window_state() {
	if (current_win_index < 0) return;
	const attrs = {};
	for (let i = 0; i < win.attributes.length; i++) {
		const a = win.attributes[i];
		if (a.name.indexOf('data-') === 0) attrs[a.name] = a.value;
	}
	window_data[current_win_index] = {
		html: addwinelm.innerHTML,
		attrs,
		style: {
			width: win.style.width,
			height: win.style.height,
			background: win.style.background
		},
		components: scan_window_components()
	};
}

function upgrade_window_data(data) {
	if (data.attrs) return data;
	return {
		html: data.html || '',
		attrs: {
			'data-name': data.name || 'Window',
			'data-caption': data.caption || '',
			'data-hide-prop': data.hide_prop || '',
			'data-align': data.align || ''
		},
		style: {
			width: data.width || '300px',
			height: data.height || '230px',
			background: data.bg || '#ffffff'
		},
		components: data.components || []
	};
}

function load_window_data(index) {
	const data = window_data[index];
	if (data) {
		window_data[index] = upgrade_window_data(data);
		addwinelm.innerHTML = window_data[index].html || '';
		for (const key in window_data[index].attrs) {
			if (window_data[index].attrs[key]) win.setAttribute(key, window_data[index].attrs[key]);
			else win.removeAttribute(key);
		}
		const s = window_data[index].style || {};
		win.style.width = s.width || '300px';
		win.style.height = s.height || '230px';
		win.style.background = s.background || '#ffffff';
	} else {
		addwinelm.innerHTML = '';
		win.setAttribute('data-name', 'Window_' + (index + 1));
		win.setAttribute('data-caption', 'Окно');
		win.style.width = '300px';
		win.style.height = '230px';
		win.style.background = '#ffffff';
	}
	addwinelm.style.width = parseInt(win.style.width) - 2;
	addwinelm.style.height = parseInt(win.style.height) - 2;
	set_element_defunc(addwinelm);
}

function switch_window(index) {
	if (index === current_win_index) return;
	save_window_state();
	current_win_index = index;
	load_window_data(index);
	select_element = null;
	render_props(win);
	TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
	update_component_tree();
}

function add_new_window(name) {
	if (!name) name = prompt('Введите название окна:', 'Window_' + (count_stack + 1));
	if (!name) return;
	if (is_name_taken(name)) { alert('Имя "' + name + '" уже используется'); add_new_window(); return; }
	const index = count_stack;
	window_stack[index] = null;
	window_data[current_win_index] = window_data[current_win_index] || upgrade_window_data({
		html: addwinelm.innerHTML,
		name: win.getAttribute('data-name'),
		caption: win.getAttribute('data-caption'),
		width: win.style.width,
		height: win.style.height,
		bg: win.style.background,
		hide_prop: win.getAttribute('data-hide-prop'),
		align: win.getAttribute('data-align'),
		components: scan_window_components()
	});
	window_data[index] = {
		html: '',
		attrs: { 'data-name': name, 'data-caption': '', 'data-hide-prop': '', 'data-align': '' },
		style: { width: '300px', height: '230px', background: '#ffffff' },
		components: []
	};
	count_stack++;
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = name;
	switch_window(index);
}

function scan_window_components() {
	const comps = [];
	const list = addwinelm.children;
	for (let i = 0; i < list.length; i++) {
		const name = list[i].getAttribute('data-name');
		if (name) comps.push(name);
	}
	return comps;
}

function set_palette_view(mode) {
	const panel = getID('LeftPanel');
	const btn = getID('palette_view_btn');
	if (!panel || !btn) return;
	if (mode === 'tile') {
		panel.classList.add('palette-tile');
		btn.innerHTML = '<i class="fa-solid fa-list"></i>';
	} else {
		panel.classList.remove('palette-tile');
		btn.innerHTML = '<i class="fa-solid fa-table-cells"></i>';
	}
	localStorage.setItem('kstudio_palette_view', mode);
}

function toggle_palette_view() {
	const current = localStorage.getItem('kstudio_palette_view') || 'list';
	set_palette_view(current === 'list' ? 'tile' : 'list');
}

function render_palette() {
	const container = getID('properies');
	if (!container) return;
	container.innerHTML = '';
	for (let i = 0; i < COMPONENTS.length; i++) {
		if (i === 0 || COMPONENTS[i].group !== COMPONENTS[i-1].group) {
			const title = createELM('div');
			title.className = 'title';
			title.innerText = COMPONENTS[i].group;
			container.appendChild(title);
		}
		const el = createELM('div');
		el.className = 'element';
		el.setAttribute('data-name', COMPONENTS[i].name);
		el.onclick = function () { select_element_menu(this); return false; };
		const img = createELM('img');
		img.src = COMPONENTS[i].icon;
		el.appendChild(img);
		const span = createELM('span');
		span.innerText = COMPONENTS[i].caption;
		el.appendChild(span);
		container.appendChild(el);
	}
}

function update_window_select() {
	const sel = getID('list_window_add');
	if (!sel) return;
	sel.innerHTML = '';
	for (let i = 0; i < count_stack; i++) {
		const data = window_data[i];
		const opt = createELM('option');
		opt.value = i;
		opt.text = data ? (win_name(data) || ('Window_' + (i + 1))) : ('Window_' + (i + 1));
		sel.add(opt);
	}
	sel.value = '' + current_win_index;
	const addOpt = createELM('option');
	addOpt.value = '-1';
	addOpt.text = '+ Добавить окно';
	sel.add(addOpt);
	sel.onchange = function () {
		const idx = parseInt(this.value);
		if (idx === -1) { add_new_window(); }
		else if (idx !== current_win_index) switch_window(idx);
		else if (select_element !== null) {
			select_element = null;
			render_props(win);
		}
	};
}

function update_component_tree() {
	update_window_select();
	const sel = getID('component_tree');
	if (!sel) return;
	sel.innerHTML = '';
	const selCompName = select_element ? select_element.getAttribute('data-name') : null;
	let selectedValue = null;
	for (let i = 0; i < count_stack; i++) {
		const data = window_data[i];
		const winName = data ? (win_name(data) || ('Window_' + (i + 1))) : ('Window_' + (i + 1));
		let comps = data ? (data.components || []) : [];
		if (i === current_win_index) {
			comps = scan_window_components();
			if (data) data.components = comps;
		}

		const grp = createELM('optgroup');
		grp.label = winName;
		sel.add(grp);

		const winOpt = createELM('option');
		winOpt.value = i + '|';
		winOpt.text = winName;
		if (i === current_win_index && !selCompName) selectedValue = winOpt.value;
		grp.appendChild(winOpt);

		for (let j = 0; j < comps.length; j++) {
			const opt = createELM('option');
			opt.value = i + '|' + comps[j];
			opt.text = comps[j];
			if (i === current_win_index && comps[j] === selCompName) selectedValue = opt.value;
			grp.appendChild(opt);
		}
	}
	if (selectedValue) sel.value = selectedValue;
	sel.onchange = function () {
		const val = this.value.split('|');
		const winIdx = parseInt(val[0]);
		const compName = val[1];
		if (winIdx !== current_win_index) switch_window(winIdx);
		if (compName) {
			const children = addwinelm.children;
			for (let k = 0; k < children.length; k++) {
				if (children[k].getAttribute('data-name') === compName) {
					select_element_added(children[k]);
					global_lock_event = true;
					break;
				}
			}
		} else if (select_element !== null) {
			select_element = null;
			render_props(win);
		}
	};
}

function create_size_rect_change() {
	r_size = createELM('DIV');
	r_size.className = 'size';
	r_size.style.cursor = 'ew-resize';
	r_size.onmousedown = function () {
		int_ptr = window.setInterval(() => newRightPosition(mouse.x), grid_distance);
		return false;
	};
	if (cmd_sensor) r_size.ontouchstart = r_size.onmousedown;
	elmADD(r_size);

	t_size = createELM('DIV');
	t_size.className = 'size';
	t_size.style.cursor = 'ns-resize';
	t_size.onmousedown = function () {
		int_ptr = window.setInterval(() => newTopPosition(mouse.y), grid_distance);
		return false;
	};
	if (cmd_sensor) t_size.ontouchstart = t_size.onmousedown;
	elmADD(t_size);

	rt_size = createELM('DIV');
	rt_size.className = 'size';
	rt_size.style.cursor = 'nwse-resize';
	rt_size.onmousedown = function () {
		int_ptr = window.setInterval(() => { newRightPosition(mouse.x); newTopPosition(mouse.y); }, grid_distance);
		return false;
	};
	if (cmd_sensor) rt_size.ontouchstart = rt_size.onmousedown;
	elmADD(rt_size);
}

function changer_rect_select() {
	let x = mouse.x - sel_rect_x;
	let y = mouse.y - sel_rect_y;
	if (x < 0) { select_element_rect.style.left = sel_rect_x + x; x = -x; }
	if (y < 0) { select_element_rect.style.top = sel_rect_y + y; y = -y; }
	select_element_rect.style.width = x;
	select_element_rect.style.height = y;
}

function delete_select_element() {
	if (select_element !== null) {
		select_element.parentNode.removeChild(select_element);
		select_element = null;
		TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
		render_props(win);
		update_component_tree();
	}
}

function add_stat_element_help(id, txt) {
	const el = getID(id);
	if (!el) return;
	el.onmouseover = () => set_text_stat_bar(txt);
	el.onmouseout = () => set_text_stat_bar('');
}

function load_help_stat(txt) {
	let i = 0, l = txt.length, d;
	while (i < l) {
		d = txt[i++];
		add_stat_element_help(d[0], d[1]);
	}
}

function delete_event_list() {
	if (list_eval_select === null) return false;
	const el = select_element || win;
	const tmp = list_eval_select.parentNode;
	if (tmp === null) return false;
	deleteElement(list_eval_select.parentNode);
	const eventName = list_eval_select.getAttribute('data-sel-event');
	const events = get_component_events(el);
	const x = events.indexOf(eventName);
	if (x < 0) return false;
	delete tmp_event_data[tmp_event_data.indexOf(eventName)];

	const data_list_event_atr = el.getAttribute('data_list_event');
	let cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
	cmd &= 0xFFFFFFFF ^ (1 << x);

	el.removeAttribute(event_attr_name(eventName));
	el.setAttribute('data_list_event', cmd);
}

function add_event_list(eventName) {
	if (tmp_event_data.indexOf(eventName) >= 0) return false;
	const el = select_element || win;

	const events = get_component_events(el);
	const x = events.indexOf(eventName);
	if (x < 0) return false;

	tmp_event_data[tmp_event_data.length] = eventName;

	const a = createELM('TR');
	const b = createELM('TD');
	b.setAttribute('data-sel-event', eventName);
	const edef = get_event_def(eventName);
	if (edef && edef.icon) {
		const iconImg = createELM('IMG');
		iconImg.src = edef.icon;
		iconImg.style.cssText = 'vertical-align:middle;margin-right:4px;width:16px;height:16px;';
		b.appendChild(iconImg);
	}
	b.appendChild(document.createTextNode((edef && edef.label) || eventName));
	b.id = event_attr_name(eventName);

	const data_list_event_atr = el.getAttribute('data_list_event');
	let cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
	cmd |= 1 << x;
	el.setAttribute('data_list_event', '' + cmd);

	b.className = 'default';
	b.onmousedown = function () {
		if (list_eval_select !== null) list_eval_select.className = 'default';
		list_eval_select = this;
		this.className = 'select';
	};
	a.appendChild(b);
	element_list_event.appendChild(a);
	element_list.style.display = 'none';
}

function load_attribute_list_event() {
	tmp_event_data = [];
	const tmp = element_list_event.children;
	let count = tmp.length;
	while (count--) element_list_event.removeChild(tmp[count]);

	const el = select_element || win;

	const events = get_component_events(el);
	const data_list_event_atr = el.getAttribute('data_list_event');
	const cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
	for (let x = 0; x < events.length; x++) {
		if (cmd & (1 << x)) {
			const eventName = events[x];
			const a = createELM('TR');
			const b = createELM('TD');
			const edef = get_event_def(eventName);
			if (edef && edef.icon) {
				const iconImg = createELM('IMG');
				iconImg.src = edef.icon;
				iconImg.style.cssText = 'vertical-align:middle;margin-right:4px;width:16px;height:16px;';
				b.appendChild(iconImg);
			}
			b.appendChild(document.createTextNode((edef && edef.label) || eventName));
			b.id = event_attr_name(eventName);
			b.setAttribute('data-sel-event', eventName);
			tmp_event_data[tmp_event_data.length] = eventName;
			b.className = 'default';
			b.onmousedown = function () {
				if (list_eval_select !== null) list_eval_select.className = 'default';
				list_eval_select = this;
				this.className = 'select';
			};
			a.appendChild(b);
			element_list_event.appendChild(a);
		}
	}
}

function cancel_edit_code() {
	getID('window_edit_code').style.display = 'none';
}

function save_edit_code() {
	getID('window_edit_code').style.display = 'none';
	const el = select_element || win;
	if (el && list_eval_select) {
		const attrName = list_eval_select.id || event_attr_name(list_eval_select.getAttribute('data-sel-event'));
		el.setAttribute(attrName, encodeURIComponent(getID('code_edit_rect').value));
	}
}

function click_edit_code() {
	if (list_eval_select === null) return;
	const el = select_element || win;
	const attrName = list_eval_select.id || event_attr_name(list_eval_select.getAttribute('data-sel-event'));
	const tmp = el.getAttribute(attrName);
	getID('code_edit_rect').value = tmp === undefined ? '' : decodeURIComponent(tmp);
	getID('window_edit_code').style.display = 'block';
}

function CmdKeyDown(event) {
	if (select_element !== null) {
		if (event.keyCode === 38) {
			select_element.style.top = parseInt(select_element.style.top) - grid_distance;
			RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
		}
	}
}

function init_panel_resizers() {
	const splitters = document.querySelectorAll('.panel-splitter');
	let dragData = null;

	function onMouseMove(e) {
		if (!dragData) return;
		const dx = e.clientX - dragData.startX;
		const panel = dragData.panel;
		const w = Math.max(dragData.minWidth, Math.min(dragData.startWidth + dx * dragData.sign, dragData.maxWidth));
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

	splitters.forEach(splitter => {
		splitter.addEventListener('mousedown', e => {
			const side = splitter.getAttribute('data-side');
			const panel = side === 'left'
				? splitter.previousElementSibling
				: splitter.nextElementSibling;
			if (!panel || !panel.classList.contains('mid-panel')) return;
			e.preventDefault();
			const rect = panel.getBoundingClientRect();
			dragData = {
				startX: e.clientX,
				startWidth: rect.width,
				minWidth: 120,
				maxWidth: 500,
				panel,
				splitter,
				side,
				sign: side === 'right' ? -1 : 1
			};
			splitter.classList.add('active');
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
		});
	});

	const leftW = localStorage.getItem('kstudio_panel_left');
	const rightW = localStorage.getItem('kstudio_panel_right');
	if (leftW) {
		const lp = document.querySelector('.mid-left');
		if (lp) lp.style.width = leftW;
	}
	if (rightW) {
		const rp = document.querySelector('.mid-right');
		if (rp) rp.style.width = rightW;
	}
}

window.onload = function () {
	init_panel_resizers();
	render_palette();
	set_palette_view(localStorage.getItem('kstudio_palette_view') || 'list');
	win = getID('window_background');
	addwinelm = getID('window');
	select_element_rect = getID('select_elements_rect');
	element_add_event = getID('add_event');
	element_list = getID('list_add_event');
	element_list_event = getID('list_event');
	win_x = getID('LeftPanel').offsetWidth;
	win_y = getID('TopPanel').offsetHeight;

	create_size_rect_change();

	TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);

	addwinelm.onmousedown = function (event) {
		if (list_element_select !== null) {
			const type = list_element_select.getAttribute('data-name');
			for (let ci = 0; ci < COMPONENTS.length; ci++) {
				if (COMPONENTS[ci].name === type) { past_gui_window(this, type); return true; }
			}
		}
		if (!global_lock_event) {
			select_element = null;
			TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win);
			render_props(win);
			update_component_tree();
			const ey = event && event.pageY ? event.pageY : (event && event.clientY ? event.clientY : mouse.y);
			const ex = event && event.pageX ? event.pageX : (event && event.clientX ? event.clientX : mouse.x);
			sel_rect_y = select_element_rect.style.top = ey;
			sel_rect_x = select_element_rect.style.left = ex;
			select_element_rect.style.display = 'block';
			select_element_rect_timer = setInterval(changer_rect_select, 50);
			return true;
		}
		return false;
	};

	if (cmd_sensor) addwinelm.ontouchstart = addwinelm.onmousedown;

	if (element_add_event) {
		element_add_event.onclick = function (e) {
			const el = select_element || win;
			const events = get_component_events(el);
			if (!events.length) return;
			let html = '';
			for (let i = 0; i < events.length; i++) {
				const ev = events[i];
				if (tmp_event_data.indexOf(ev) >= 0) continue;
				const edef = get_event_def(ev);
				const icon = edef && edef.icon ? '<img src="' + edef.icon + '">' : '';
				html += '<div class="event-item" data-event="' + ev + '">' +
					icon + '<span class="title">' + ((edef && edef.label) || ev) + '</span></div>';
			}
			element_list.innerHTML = html;
			Array.from(element_list.children).forEach(item => {
				item.onmousedown = function () {
					add_event_list(this.getAttribute('data-event'));
				};
			});
			const ex = e && e.pageX ? e.pageX : (e && e.clientX ? e.clientX : mouse.x);
			const ey = e && e.pageY ? e.pageY : (e && e.clientY ? e.clientY : mouse.y);
			element_list.style.top = ey;
			element_list.style.display = html ? 'block' : 'none';
			element_list.style.left = ex - element_list.offsetWidth / 2;
		};
	}

	win.setAttribute('data-name', 'Window_1');
	win.setAttribute('data-caption', 'Окно');
	win.setAttribute('data-hide-prop', '');
	win.style.background = '#ffffff';
	addwinelm.style.width = win.offsetWidth - 2;
	addwinelm.style.height = win.offsetHeight - 2;

	window_stack[0] = win;
	window_data[0] = {
		html: addwinelm.innerHTML,
		attrs: { 'data-name': 'Window_1', 'data-caption': 'Окно', 'data-hide-prop': '', 'data-align': '' },
		style: { width: win.style.width, height: win.style.height, background: win.style.background },
		components: []
	};
	count_stack = 1;
	current_win_index = 0;
	GLOBAL_INIT_ELEMENT[GLOBAL_INIT_COUNT++] = 'Window_1';

	update_component_tree();
	render_props(win);
	load_help_stat(data_help_status);
};

window.onresize = () => {};

window.onmouseup = () => {
	clearInterval(int_ptr);
	int_ptr = null;
	global_lock_event = false;
	if (select_element_rect) {
		select_element_rect.style.display = 'none';
		select_element_rect.style.width = select_element_rect.style.height = 0;
	}
	clearInterval(select_element_rect_timer);
};

window.onmousedown = () => {
	if (list_element_select !== null) {
		list_element_select.className = 'element';
		list_element_select = null;
	}
};
if (cmd_sensor) window.ontouchstart = window.onmousedown;

window.onkeydown = function (e) {
	const ev = window.event || e;
	if (ev.ctrlKey) cmd_event_ctrl = true;
	else if (ev.keyCode === 46) delete_select_element();
};

window.onkeyup = function (e) {
	const ev = window.event || e;
	if (cmd_event_ctrl && ev.keyCode === 67) copy_element_object = select_element;
	cmd_event_ctrl = false;
};
