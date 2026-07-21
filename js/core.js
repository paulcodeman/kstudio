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
let rect_select_active = false;
let selected_elements_array = [];
let win_x, win_y, win_w, win_h, r_size, int_ptr = null, t_size, rt_size;
let dragData = null, resizeData = null;
let element_add_event, element_list;
let element_list_event, tmp_event_data = [];
let context_menu_component;
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
	r_size.style.left = (r.left + r.width - r_size.offsetWidth / 2) + 'px';
	r_size.style.top = (r.top + r.height / 2 - r_size.offsetHeight / 2) + 'px';
}

function TrefreshPOS(o) {
	const tmp = parseInt(o.offsetHeight);
	refresh_prop_input('height', tmp - 2);
	refresh_prop_input('top', o.offsetTop);
	const r = o.getBoundingClientRect();
	t_size.style.left = (r.left + r.width / 2 - t_size.offsetWidth / 2) + 'px';
	t_size.style.top = (r.top + tmp - t_size.offsetHeight / 2) + 'px';
}

function RTrefreshPOS(o) {
	const r = o.getBoundingClientRect();
	rt_size.style.left = (r.left + r.width - rt_size.offsetWidth / 2) + 'px';
	rt_size.style.top = (r.top + r.height - rt_size.offsetHeight / 2) + 'px';
}

function startResize(e, type) {
	const el = select_element || win;
	const rect = el.getBoundingClientRect();
	const containerRect = addwinelm.getBoundingClientRect();
	resizeData = {
		el, type,
		startX: e.clientX,
		startY: e.clientY,
		startLeft: rect.left - containerRect.left,
		startTop: rect.top - containerRect.top,
		startWidth: rect.width,
		startHeight: rect.height
	};
	document.addEventListener('mousemove', onResizeMove);
	document.addEventListener('mouseup', onResizeEnd);
	if (cmd_sensor) {
		document.addEventListener('touchmove', onResizeMove, { passive: false });
		document.addEventListener('touchend', onResizeEnd);
		document.addEventListener('touchcancel', onResizeEnd);
	}
	e.preventDefault();
	e.stopPropagation();
}

function onResizeMove(e) {
	if (!resizeData) return;
	const cx = e.touches ? e.touches[0].clientX : e.clientX;
	const cy = e.touches ? e.touches[0].clientY : e.clientY;
	const dx = cx - resizeData.startX;
	const dy = cy - resizeData.startY;
	const containerRect = addwinelm.getBoundingClientRect();
	let w = resizeData.startWidth, h = resizeData.startHeight;
	const el = resizeData.el;
	const isWin = (el === win);

	if (resizeData.type === 'right' || resizeData.type === 'corner') {
		w = Math.round((resizeData.startWidth + dx) / grid_distance) * grid_distance;
		if (isWin) {
			w = Math.max(20, Math.min(w, containerRect.width + containerRect.left));
		} else {
			w = Math.max(20, Math.min(w, containerRect.width - resizeData.startLeft));
		}
	}
	if (resizeData.type === 'top' || resizeData.type === 'corner') {
		h = Math.round((resizeData.startHeight + dy) / grid_distance) * grid_distance;
		if (isWin) {
			h = Math.max(20, Math.min(h, containerRect.height + containerRect.top));
		} else {
			h = Math.max(20, Math.min(h, containerRect.height - resizeData.startTop));
		}
	}
	if (isWin) {
		win.style.width = w + 'px';
		win.style.height = h + 'px';
		addwinelm.style.width = w - 2 + 'px';
		addwinelm.style.height = h - 2 + 'px';
	} else {
		el.style.width = w + 'px';
		el.style.height = h + 'px';
	}
	RrefreshPOS(el); TrefreshPOS(el); RTrefreshPOS(el);
	e.preventDefault();
}

function onResizeEnd() {
	if (!resizeData) return;
	document.removeEventListener('mousemove', onResizeMove);
	document.removeEventListener('mouseup', onResizeEnd);
	document.removeEventListener('touchmove', onResizeMove);
	document.removeEventListener('touchend', onResizeEnd);
	document.removeEventListener('touchcancel', onResizeEnd);
	resizeData = null;
}

function deleteElement(elem) {
	if (elem === null) return false;
	return elem.parentNode.removeChild(elem);
}

function select_element_menu(o) {
	list_element_select = o;
	o.className = 'element select';
	return false;
}

function startDrag(e, el) {
	select_element = el;
	render_props(el);
	const rect = el.getBoundingClientRect();
	const containerRect = addwinelm.getBoundingClientRect();
	dragData = {
		el,
		startX: e.clientX,
		startY: e.clientY,
		startLeft: rect.left - containerRect.left,
		startTop: rect.top - containerRect.top
	};
	document.addEventListener('mousemove', onDragMove);
	document.addEventListener('mouseup', onDragEnd);
	if (cmd_sensor) {
		document.addEventListener('touchmove', onDragMove, { passive: false });
		document.addEventListener('touchend', onDragEnd);
		document.addEventListener('touchcancel', onDragEnd);
	}
	e.preventDefault();
	global_lock_event = true;
}

function startGroupDrag(e, el) {
	const containerRect = addwinelm.getBoundingClientRect();
	const positions = [];
	function collectElement(item) {
		const r = item.getBoundingClientRect();
		positions.push({
			el: item,
			startLeft: r.left - containerRect.left,
			startTop: r.top - containerRect.top,
			width: r.width,
			height: r.height
		});
	}
	for (let i = 0; i < selected_elements_array.length; i++) {
		collectElement(selected_elements_array[i].el);
	}
	if (select_element && !positions.some(function (p) { return p.el === select_element; })) {
		collectElement(select_element);
	}
	dragData = {
		el,
		isGroup: true,
		startX: e.clientX,
		startY: e.clientY,
		positions
	};
	document.addEventListener('mousemove', onDragMove);
	document.addEventListener('mouseup', onDragEnd);
	if (cmd_sensor) {
		document.addEventListener('touchmove', onDragMove, { passive: false });
		document.addEventListener('touchend', onDragEnd);
		document.addEventListener('touchcancel', onDragEnd);
	}
	e.preventDefault();
	global_lock_event = true;
}

function onDragMove(e) {
	if (!dragData) return;
	const cx = e.touches ? e.touches[0].clientX : e.clientX;
	const cy = e.touches ? e.touches[0].clientY : e.clientY;
	const containerRect = addwinelm.getBoundingClientRect();
	if (dragData.isGroup) {
		const dx = cx - dragData.startX;
		const dy = cy - dragData.startY;
		for (let i = 0; i < dragData.positions.length; i++) {
			const p = dragData.positions[i];
			let left = Math.round((p.startLeft + dx) / grid_distance) * grid_distance;
			let top = Math.round((p.startTop + dy) / grid_distance) * grid_distance;
			left = Math.max(0, Math.min(left, containerRect.width - p.width));
			top = Math.max(0, Math.min(top, containerRect.height - p.height));
			p.el.style.left = left + 'px';
			p.el.style.top = top + 'px';
		}
		if (select_element) {
			RrefreshPOS(select_element); TrefreshPOS(select_element); RTrefreshPOS(select_element);
		}
		update_selection_dots();
		e.preventDefault();
		return;
	}
	let left = Math.round((dragData.startLeft + (cx - dragData.startX)) / grid_distance) * grid_distance;
	let top = Math.round((dragData.startTop + (cy - dragData.startY)) / grid_distance) * grid_distance;
	left = Math.max(0, Math.min(left, containerRect.width - dragData.el.offsetWidth));
	top = Math.max(0, Math.min(top, containerRect.height - dragData.el.offsetHeight));
	dragData.el.style.left = left + 'px';
	dragData.el.style.top = top + 'px';
	RrefreshPOS(dragData.el); TrefreshPOS(dragData.el); RTrefreshPOS(dragData.el);
	e.preventDefault();
}

function onDragEnd() {
	if (!dragData) return;
	document.removeEventListener('mousemove', onDragMove);
	document.removeEventListener('mouseup', onDragEnd);
	document.removeEventListener('touchmove', onDragMove);
	document.removeEventListener('touchend', onDragEnd);
	document.removeEventListener('touchcancel', onDragEnd);
	dragData = null;
}

function select_element_added(o) {
	select_element = o;
	render_props(o);
	load_attribute_list_event();
	RrefreshPOS(o); TrefreshPOS(o); RTrefreshPOS(o);
	update_component_tree();
	return false;
}

function select_element_added_single(o) {
	clear_selected_elements();
	select_element_added(o);
}

function update_events_tab_visibility() {
	const events = select_element ? get_component_events(select_element) : WINDOW_EVENTS;
	const hasEvents = events && events.length > 0;
	const label = document.querySelector('label[for="vkl2"]');
	const radio = getID('vkl2');
	const content = document.querySelector('.container > div:nth-of-type(2)');
	if (!label || !radio || !content) return;
	label.style.display = hasEvents ? '' : 'none';
	radio.style.display = hasEvents ? '' : 'none';
	content.style.display = hasEvents ? '' : 'none';
	if (!hasEvents && radio.checked) {
		getID('vkl1').checked = true;
	}
}

function func_define_select(e) {
	if (selected_elements_array.length > 0) {
		const clicked = this;
		const isInSelection = select_element === clicked || selected_elements_array.some(function (item) { return item.el === clicked; });
		if (isInSelection) {
			startGroupDrag(e, clicked);
			return;
		}
	}
	select_element_added_single(this);
	startDrag(e, this);
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
			const toHex = function (v) {
				const m = v && v.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
				if (m) return '#' + ((1 << 24) + (parseInt(m[1]) << 16) + (parseInt(m[2]) << 8) + parseInt(m[3])).toString(16).slice(1).toUpperCase();
				if (v && /^#[0-9a-f]{6}$/i.test(v)) return v.slice(0, 7).toUpperCase();
				if (v && /^#[0-9a-f]{3}$/i.test(v)) return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toUpperCase();
				return '#FFFFFF';
			};
			const hexVal = toHex(value);

			const colorWrap = createELM('div');
			colorWrap.style.display = 'flex';
			colorWrap.style.gap = '4px';
			colorWrap.style.alignItems = 'center';

			const textInput = createELM('input');
			textInput.type = 'text';
			textInput.value = hexVal;
			textInput.style.flex = '1';
			textInput.style.minWidth = '0';
			textInput.style.textTransform = 'uppercase';

			const colorInput = createELM('input');
			colorInput.type = 'color';
			colorInput.value = hexVal;
			colorInput.style.width = '28px';
			colorInput.style.height = '28px';
			colorInput.style.flex = 'none';
			colorInput.style.padding = '0';
			colorInput.style.border = 'none';
			colorInput.style.borderRadius = '4px';
			colorInput.style.cursor = 'pointer';
			colorInput.style.background = 'none';

			let lastValid = hexVal;
			textInput.oninput = function () {
				this.value = this.value.toUpperCase();
				colorInput.value = toHex(this.value);
			};
			textInput.onchange = function () {
				const h = toHex(this.value);
				if (h === '#FFFFFF' && this.value !== '#FFFFFF') {
					this.value = lastValid;
					colorInput.value = lastValid;
				} else {
					this.value = h;
					lastValid = h;
					colorInput.value = h;
					apply_prop(this);
				}
			};
			colorInput.oninput = function () {
				const h = this.value.toUpperCase();
				textInput.value = h;
				lastValid = h;
				apply_prop(this);
			};
			textInput.setAttribute('data-prop-key', p.key);
			textInput.setAttribute('data-prop-target', p.target);
			colorInput.setAttribute('data-prop-key', p.key);
			colorInput.setAttribute('data-prop-target', p.target);

			colorWrap.appendChild(textInput);
			colorWrap.appendChild(colorInput);
			input = colorWrap;
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
	element.style.left = Math.round(event.offsetX / grid_distance) * grid_distance + 'px';
	element.style.top = Math.round(event.offsetY / grid_distance) * grid_distance + 'px';

	if (count_element_add[name_type] === undefined) count_element_add[name_type] = 0;
	const name = name_type + '_' + (++count_element_add[name_type]);
	element.setAttribute('data-name', name);
	element.onmousedown = comp.system ? function (e) { select_element_added_single(this); global_lock_event = true; } : func_define_select;
	if (cmd_sensor) element.ontouchstart = element.onmousedown;
	element.oncontextmenu = function (e) { show_component_context_menu(e, this); return false; };

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
	select_element_added_single(element);
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
	addwinelm.style.width = (parseInt(win.style.width) - 2) + 'px';
	addwinelm.style.height = (parseInt(win.style.height) - 2) + 'px';
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
	const container = getID('properties');
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
					select_element_added_single(children[k]);
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
	r_size.onmousedown = function (e) { startResize(e, 'right'); };
	if (cmd_sensor) r_size.ontouchstart = r_size.onmousedown;
	elmADD(r_size);

	t_size = createELM('DIV');
	t_size.className = 'size';
	t_size.style.cursor = 'ns-resize';
	t_size.onmousedown = function (e) { startResize(e, 'top'); };
	if (cmd_sensor) t_size.ontouchstart = t_size.onmousedown;
	elmADD(t_size);

	rt_size = createELM('DIV');
	rt_size.className = 'size';
	rt_size.style.cursor = 'nwse-resize';
	rt_size.onmousedown = function (e) { startResize(e, 'corner'); };
	if (cmd_sensor) rt_size.ontouchstart = rt_size.onmousedown;
	elmADD(rt_size);

	if (!win) return;
	const r = win.getBoundingClientRect();
	const hw = r_size.offsetWidth / 2, hh = r_size.offsetHeight / 2;
	r_size.style.left = (r.left + r.width - hw) + 'px';
	r_size.style.top = (r.top + r.height / 2 - hh) + 'px';
	t_size.style.left = (r.left + r.width / 2 - hw) + 'px';
	t_size.style.top = (r.top + r.height - hh) + 'px';
	rt_size.style.left = (r.left + r.width - hw) + 'px';
	rt_size.style.top = (r.top + r.height - hh) + 'px';
}

function changer_rect_select() {
	let x = mouse.x - sel_rect_x;
	let y = mouse.y - sel_rect_y;
	if (x < 0) { select_element_rect.style.left = (sel_rect_x + x) + 'px'; x = -x; }
	if (y < 0) { select_element_rect.style.top = (sel_rect_y + y) + 'px'; y = -y; }
	select_element_rect.style.width = x + 'px';
	select_element_rect.style.height = y + 'px';
}

function rectsIntersect(r1, r2) {
	return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function clear_selected_elements() {
	for (let i = 0; i < selected_elements_array.length; i++) {
		const item = selected_elements_array[i];
		if (item.dots) {
			for (let j = 0; j < item.dots.length; j++) {
				if (item.dots[j].parentNode) {
					item.dots[j].parentNode.removeChild(item.dots[j]);
				}
			}
		}
	}
	selected_elements_array = [];
}

function update_selection_dots() {
	const parentRect = addwinelm.getBoundingClientRect();
	const half = 5;
	for (let i = 0; i < selected_elements_array.length; i++) {
		const item = selected_elements_array[i];
		const r = item.el.getBoundingClientRect();
		if (item.dots && item.dots.length === 3) {
			item.dots[0].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
			item.dots[0].style.top = Math.round(r.top - parentRect.top + r.height / 2 - half) + 'px';
			item.dots[1].style.left = Math.round(r.left - parentRect.left + r.width / 2 - half) + 'px';
			item.dots[1].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
			item.dots[2].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
			item.dots[2].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
		}
	}
}

function select_components_in_rect() {
	clear_selected_elements();
	const rect = select_element_rect.getBoundingClientRect();
	const children = addwinelm.children;
	const parentRect = addwinelm.getBoundingClientRect();
	let firstFound = null;
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		if (!child.getAttribute('data-name')) continue;
		const childRect = child.getBoundingClientRect();
		if (rectsIntersect(rect, childRect)) {
			if (!firstFound) { firstFound = child; continue; }
			const dots = [];
			for (let j = 0; j < 3; j++) {
				const dot = createELM('DIV');
				dot.className = 'selection-dot';
				addwinelm.appendChild(dot);
				dots.push(dot);
			}
			const r = child.getBoundingClientRect();
			const dotSize = 10;
			const half = dotSize / 2;
			dots[0].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
			dots[0].style.top = Math.round(r.top - parentRect.top + r.height / 2 - half) + 'px';
			dots[1].style.left = Math.round(r.left - parentRect.left + r.width / 2 - half) + 'px';
			dots[1].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
			dots[2].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
			dots[2].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
			selected_elements_array.push({ el: child, dots });
		}
	}
	if (firstFound) {
		select_element_added(firstFound);
	}
}

function show_component_context_menu(e, el) {
	const clicked = el;
	const isInSelection = select_element === clicked || selected_elements_array.some(function (item) { return item.el === clicked; });
	if (!isInSelection) {
		select_element_added_single(clicked);
	}
	context_menu_component.innerHTML =
		'<div class="event-item" data-action="copy"><i class="fa-solid fa-copy"></i><span class="title">Копировать</span></div>' +
		'<div class="event-item" data-action="delete"><i class="fa-solid fa-trash"></i><span class="title">Удалить</span></div>';
	Array.from(context_menu_component.children).forEach(function (item) {
		item.onmousedown = function () {
			const action = this.getAttribute('data-action');
			if (action === 'copy') {
				copy_element_object = select_element;
			} else if (action === 'delete') {
				delete_select_element();
			}
			context_menu_component.style.display = 'none';
		};
	});
	context_menu_component.style.top = e.pageY + 'px';
	context_menu_component.style.display = 'block';
	context_menu_component.style.left = Math.round(e.pageX - context_menu_component.offsetWidth / 2) + 'px';
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

function event_args(eventName) {
	switch (eventName) {
		case 'click': case 'dblclick': return 'dword x, dword y, dword buttons [MOUSE_LEFT=1, MOUSE_RIGHT=2, MOUSE_MIDDLE=4]';
		case 'mousemove': case 'mouseenter': case 'mouseleave': return 'dword x, dword y';
		case 'mousedown': case 'mouseup': return 'dword x, dword y, dword buttons [MOUSE_LEFT=1, MOUSE_RIGHT=2, MOUSE_MIDDLE=4]';
		case 'mousewheel': return 'dword delta';
		case 'keydown': case 'keypress': case 'keyup': return 'dword keycode, dword scancode';
		case 'resize': return 'dword w, dword h';
		case 'timer': return 'dword timer_id';
		default: return '';
	}
}

function click_edit_code() {
	if (list_eval_select === null) return;
	const el = select_element || win;
	const compName = el.getAttribute('data-name') || 'Component';
	const eventName = list_eval_select.getAttribute('data-sel-event') || 'event';
	const attrName = list_eval_select.id || event_attr_name(eventName);
	const tmp = el.getAttribute(attrName);
	const args = event_args(eventName);
	getID('code_edit_rect').value = tmp ? decodeURIComponent(tmp) : '';
	getID('code_edit_title').innerText = 'void ' + compName + '_' + eventName + '(' + args + ')';
	getID('window_edit_code').style.display = 'flex';
}

function CmdKeyDown(event) {
	if (select_element !== null) {
		if (event.keyCode === 38) {
			select_element.style.top = (parseInt(select_element.style.top) - grid_distance) + 'px';
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
	try {
		init_panel_resizers();
		render_palette();
		set_palette_view(localStorage.getItem('kstudio_palette_view') || 'list');
	} catch (e) { console.error('init error:', e); }

	win = getID('window_background');
	addwinelm = getID('window');
	select_element_rect = getID('select_elements_rect');
	element_add_event = getID('add_event');
	element_list = getID('list_add_event');
	element_list_event = getID('list_event');
	context_menu_component = getID('context_menu_component');
	if (win) {
		win_x = getID('LeftPanel') ? getID('LeftPanel').offsetWidth : 0;
		win_y = getID('TopPanel') ? getID('TopPanel').offsetHeight : 0;
	}

	create_size_rect_change();

	if (win) {
		try { TrefreshPOS(win); RrefreshPOS(win); RTrefreshPOS(win); } catch (e) { console.error('refreshPOS error:', e); }
	}

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
			clear_selected_elements();
			update_component_tree();
			const ey = event && event.pageY ? event.pageY : (event && event.clientY ? event.clientY : mouse.y);
			const ex = event && event.pageX ? event.pageX : (event && event.clientX ? event.clientX : mouse.x);
			sel_rect_y = ey;
			sel_rect_x = ex;
			select_element_rect.style.top = ey + 'px';
			select_element_rect.style.left = ex + 'px';
			select_element_rect.style.display = 'block';
			select_element_rect_timer = setInterval(changer_rect_select, 50);
			rect_select_active = true;
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
			element_list.style.top = ey + 'px';
			element_list.style.display = html ? 'block' : 'none';
			element_list.style.left = (ex - element_list.offsetWidth / 2) + 'px';
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

	document.addEventListener('mousedown', function (e) {
		if (context_menu_component && context_menu_component.style.display !== 'none' && !context_menu_component.contains(e.target)) {
			context_menu_component.style.display = 'none';
		}
	});
};

window.onresize = () => {};

window.onmouseup = () => {
	if (dragData) onDragEnd();
	if (resizeData) onResizeEnd();
	clearInterval(int_ptr);
	int_ptr = null;
	clearInterval(select_element_rect_timer);
	select_element_rect_timer = null;
	global_lock_event = false;
	if (select_element_rect) {
		if (rect_select_active) {
			select_components_in_rect();
		}
		select_element_rect.style.display = 'none';
		select_element_rect.style.width = '0px';
		select_element_rect.style.height = '0px';
	}
	rect_select_active = false;
};

window.onmousedown = () => {
	if (list_element_select !== null) {
		list_element_select.className = 'element';
		list_element_select = null;
	}
};
if (cmd_sensor) {
	window.ontouchstart = window.onmousedown;
	window.ontouchend = window.onmouseup;
	window.ontouchcancel = window.onmouseup;
}

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
