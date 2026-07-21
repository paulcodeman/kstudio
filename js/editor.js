const data_help_status = [
    ['add_event', 'Добавить событие для исполнения отрывка кода.'],
    ['but_delete_event', 'Удалить событие из списка.'],
    ['edit_event', 'Редактировать событие из списка.']
];

function getID(x) {
    return document.getElementById(x);
}

function createELM(x) {
    return document.createElement(x);
}

function get_event_def(name) {
    for (let i = 0; i < EVENTS.length; i++) {
        if (EVENTS[i].name === name) return EVENTS[i];
    }
    return null;
}

function event_attr_name(name) {
    return 'data-event-' + name;
}

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

function refresh_prop_input(key, val) {
    const table = getID('attribute-panel');
    if (!table) return;
    const inputs = table.querySelectorAll('input[data-prop-key="' + key + '"]');
    if (inputs.length) inputs[0].value = val;
}

function RrefreshPOS(o) {
    const tmp = parseInt(o.offsetWidth);
    refresh_prop_input('width', tmp - 2);
    refresh_prop_input('left', o.offsetLeft);
    const r = o.getBoundingClientRect();
    S.r_size.style.left = (r.left + r.width - S.r_size.offsetWidth / 2) + 'px';
    S.r_size.style.top = (r.top + r.height / 2 - S.r_size.offsetHeight / 2) + 'px';
}

function TrefreshPOS(o) {
    const tmp = parseInt(o.offsetHeight);
    refresh_prop_input('height', tmp - 2);
    refresh_prop_input('top', o.offsetTop);
    const r = o.getBoundingClientRect();
    S.t_size.style.left = (r.left + r.width / 2 - S.t_size.offsetWidth / 2) + 'px';
    S.t_size.style.top = (r.top + tmp - S.t_size.offsetHeight / 2) + 'px';
}

function RTrefreshPOS(o) {
    const r = o.getBoundingClientRect();
    S.rt_size.style.left = (r.left + r.width - S.rt_size.offsetWidth / 2) + 'px';
    S.rt_size.style.top = (r.top + r.height - S.rt_size.offsetHeight / 2) + 'px';
}

function startResize(e, type) {
    const el = S.select_element || S.win;
    const rect = el.getBoundingClientRect();
    const containerRect = S.addwinelm.getBoundingClientRect();
    S.resizeData = {
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
    if (S.cmd_sensor) {
        document.addEventListener('touchmove', onResizeMove, {passive: false});
        document.addEventListener('touchend', onResizeEnd);
        document.addEventListener('touchcancel', onResizeEnd);
    }
    e.preventDefault();
    e.stopPropagation();
}

function onResizeMove(e) {
    if (!S.resizeData) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = cx - S.resizeData.startX;
    const dy = cy - S.resizeData.startY;
    const containerRect = S.addwinelm.getBoundingClientRect();
    let w = S.resizeData.startWidth, h = S.resizeData.startHeight;
    const el = S.resizeData.el;
    const isWin = (el === S.win);

    if (S.resizeData.type === 'right' || S.resizeData.type === 'corner') {
        w = Math.round((S.resizeData.startWidth + dx) / S.grid_distance) * S.grid_distance;
        if (isWin) {
            w = Math.max(20, Math.min(w, containerRect.width + containerRect.left));
        } else {
            w = Math.max(20, Math.min(w, containerRect.width - S.resizeData.startLeft));
        }
    }
    if (S.resizeData.type === 'top' || S.resizeData.type === 'corner') {
        h = Math.round((S.resizeData.startHeight + dy) / S.grid_distance) * S.grid_distance;
        if (isWin) {
            h = Math.max(20, Math.min(h, containerRect.height + containerRect.top));
        } else {
            h = Math.max(20, Math.min(h, containerRect.height - S.resizeData.startTop));
        }
    }
    if (isWin) {
        S.win.style.width = w + 'px';
        S.win.style.height = h + 'px';
        S.addwinelm.style.width = w - 2 + 'px';
        S.addwinelm.style.height = h - 2 + 'px';
    } else {
        el.style.width = w + 'px';
        el.style.height = h + 'px';
    }
    RrefreshPOS(el);
    TrefreshPOS(el);
    RTrefreshPOS(el);
    e.preventDefault();
}

function onResizeEnd() {
    if (!S.resizeData) return;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
    document.removeEventListener('touchmove', onResizeMove);
    document.removeEventListener('touchend', onResizeEnd);
    document.removeEventListener('touchcancel', onResizeEnd);
    S.resizeData = null;
}

function deleteElement(elem) {
    if (elem === null) return false;
    if (!elem.parentNode) return false;
    return elem.parentNode.removeChild(elem);
}

function select_element_menu(o) {
    S.list_element_select = o;
    o.className = 'element select';
    return false;
}

function startDrag(e, el) {
    S.select_element = el;
    render_props(el);
    const rect = el.getBoundingClientRect();
    const containerRect = S.addwinelm.getBoundingClientRect();
    S.dragData = {
        el,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left - containerRect.left,
        startTop: rect.top - containerRect.top
    };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    if (S.cmd_sensor) {
        document.addEventListener('touchmove', onDragMove, {passive: false});
        document.addEventListener('touchend', onDragEnd);
        document.addEventListener('touchcancel', onDragEnd);
    }
    e.preventDefault();
    S.global_lock_event = true;
}

function startGroupDrag(e, el) {
    const containerRect = S.addwinelm.getBoundingClientRect();
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

    for (let i = 0; i < S.selected_elements_array.length; i++) {
        collectElement(S.selected_elements_array[i].el);
    }
    if (S.select_element && !positions.some(function (p) {
        return p.el === S.select_element;
    })) {
        collectElement(S.select_element);
    }
    S.dragData = {
        el,
        isGroup: true,
        startX: e.clientX,
        startY: e.clientY,
        positions
    };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    if (S.cmd_sensor) {
        document.addEventListener('touchmove', onDragMove, {passive: false});
        document.addEventListener('touchend', onDragEnd);
        document.addEventListener('touchcancel', onDragEnd);
    }
    e.preventDefault();
    S.global_lock_event = true;
}

function onDragMove(e) {
    if (!S.dragData) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const containerRect = S.addwinelm.getBoundingClientRect();
    if (S.dragData.isGroup) {
        const dx = cx - S.dragData.startX;
        const dy = cy - S.dragData.startY;
        for (let i = 0; i < S.dragData.positions.length; i++) {
            const p = S.dragData.positions[i];
            let left = Math.round((p.startLeft + dx) / S.grid_distance) * S.grid_distance;
            let top = Math.round((p.startTop + dy) / S.grid_distance) * S.grid_distance;
            left = Math.max(0, Math.min(left, containerRect.width - p.width));
            top = Math.max(0, Math.min(top, containerRect.height - p.height));
            p.el.style.left = left + 'px';
            p.el.style.top = top + 'px';
        }
        if (S.select_element) {
            RrefreshPOS(S.select_element);
            TrefreshPOS(S.select_element);
            RTrefreshPOS(S.select_element);
        }
        update_selection_dots();
        e.preventDefault();
        return;
    }
    let left = Math.round((S.dragData.startLeft + (cx - S.dragData.startX)) / S.grid_distance) * S.grid_distance;
    let top = Math.round((S.dragData.startTop + (cy - S.dragData.startY)) / S.grid_distance) * S.grid_distance;
    left = Math.max(0, Math.min(left, containerRect.width - S.dragData.el.offsetWidth));
    top = Math.max(0, Math.min(top, containerRect.height - S.dragData.el.offsetHeight));
    S.dragData.el.style.left = left + 'px';
    S.dragData.el.style.top = top + 'px';
    RrefreshPOS(S.dragData.el);
    TrefreshPOS(S.dragData.el);
    RTrefreshPOS(S.dragData.el);
    e.preventDefault();
}

function onDragEnd() {
    if (!S.dragData) return;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('touchcancel', onDragEnd);
    S.dragData = null;
}

function select_element_added(o) {
    S.select_element = o;
    render_props(o);
    load_attribute_list_event();
    RrefreshPOS(o);
    TrefreshPOS(o);
    RTrefreshPOS(o);
    update_component_tree();
    return false;
}

function select_element_added_single(o) {
    clear_selected_elements();
    select_element_added(o);
}

function update_events_tab_visibility() {
    const events = S.select_element ? get_component_events(S.select_element) : WINDOW_EVENTS;
    const hasEvents = events && events.length > 0;
    const label = document.querySelector('label[for="tab-events"]');
    const content = document.getElementById('panel-events');
    if (!label || !content) return;
    label.style.display = hasEvents ? '' : 'none';
    content.hidden = !hasEvents;
}

function func_define_select(e) {
    e.stopPropagation();
    if (S.selected_elements_array.length > 0) {
        const clicked = this;
        const isInSelection = S.select_element === clicked || S.selected_elements_array.some(function (item) {
            return item.el === clicked;
        });
        if (isInSelection) {
            startGroupDrag(e, clicked);
            return;
        }
    }
    select_element_added_single(this);
    startDrag(e, this);
}

function get_prop_def(key) {
    for (let i = 0; i < PROPS.length; i++) {
        if (PROPS[i].key === key) return PROPS[i];
    }
    return null;
}

function get_props_for_element(el) {
    if (S.select_element === null) return WINDOW_PROPS;
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
                    resolved.push({section: currentGroup});
                }
                resolved.push(found);
            }
        } else {
            if (p.group && p.group !== currentGroup) {
                currentGroup = p.group;
                resolved.push({section: currentGroup});
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
        if ((el.className === 'gui-label' || el.className === 'label_element_gui') && el.style.color) return el.style.color;
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
    } else if (prop.target === 'src') val = el.src || '';
    else if (prop.target === 'innerText') val = el.innerText || '';
    if (prop.type === 'number' && val) val = '' + parseInt(val);
    return val;
}

function render_props(el) {
    if (!el) el = S.win;
    const props = get_props_for_element(el);
    const container = getID('attribute-panel');
    if (!container) return;
    container.innerHTML = '';
    container.className = 'prop-grid';
    let currentSection = null;
    for (let i = 0; i < props.length; i++) {
        const p = props[i];
        if (p.section) {
            currentSection = p.section;
            const header = createELM('div');
            header.className = 'title-pod';
            header.style.gridColumn = '1 / -1';
            header.style.cursor = 'pointer';
            const storageKey = 'kstudio_collapsed_' + currentSection;
            const collapsed = localStorage.getItem(storageKey) === '1';
            header.innerText = (collapsed ? '▶ ' : '▼ ') + currentSection;
            header.onclick = (function (key) {
                return function () {
                    localStorage.setItem(key, localStorage.getItem(key) === '1' ? '0' : '1');
                    render_props(S.select_element || S.win);
                };
            })(storageKey);
            container.appendChild(header);
            continue;
        }
        const value = get_prop_value(el, p);
        const label = createELM('label');
        label.className = 'attr-label';
        label.htmlFor = 'prop_' + p.key.replace(/\s/g, '_');
        label.innerText = p.label;
        const val = createELM('div');
        val.className = 'attr-value';
        let input;
        if (p.type === 'select') {
            input = createELM('select');
            input.name = p.key;
            input.id = 'prop_' + p.key.replace(/\s/g, '_');
            for (let j = 0; j < p.options.length; j++) {
                const opt = createELM('option');
                opt.value = p.options[j].v;
                opt.text = p.options[j].l;
                if ('' + opt.value === '' + value) opt.selected = true;
                input.add(opt);
            }
            input.onchange = function () {
                apply_prop(this);
            };
        } else if (p.type === 'color') {
            label.htmlFor = 'prop_' + p.key.replace(/\s/g, '_') + '_hex';
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
            textInput.name = p.key + '_hex';
            textInput.id = 'prop_' + p.key.replace(/\s/g, '_') + '_hex';
            textInput.value = hexVal;
            textInput.style.flex = '1';
            textInput.style.minWidth = '0';
            textInput.style.textTransform = 'uppercase';

            const colorInput = createELM('input');
            colorInput.type = 'color';
            colorInput.name = p.key + '_color';
            colorInput.id = 'prop_' + p.key.replace(/\s/g, '_') + '_color';
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
            input = createELM('input');
            input.type = 'number';
            input.name = p.key;
            input.id = 'prop_' + p.key.replace(/\s/g, '_');
            input.value = value;
            input.onmouseup = function () {
                this.select();
            };
            input.oninput = function () {
                apply_prop(this);
            };
        } else {
            input = createELM('input');
            input.name = p.key;
            input.id = 'prop_' + p.key.replace(/\s/g, '_');
            input.value = value;
            input.onmouseup = function () {
                this.select();
            };
            input.oninput = function () {
                apply_prop(this);
            };
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
    if (!S.select_element) load_attribute_list_event();
    update_events_tab_visibility();
}

function apply_prop(input) {
    const key = input.getAttribute('data-prop-key');
    const target = input.getAttribute('data-prop-target');
    const propType = input.getAttribute('data-prop-type');
    const val = input.value;
    const el = S.select_element || S.win;
    const isComponent = (S.select_element !== null);

    if (key === 'data-name') {
        const skip = isComponent ? S.select_element : S.window_data[S.current_win_index];
        if (is_name_taken(val, skip)) {
            alert('Имя "' + val + '" уже используется');
            input.value = get_prop_value(el, {key, target, type: propType || 'text'});
            return;
        }
        if (!isComponent && S.window_data[S.current_win_index]) {
            S.window_data[S.current_win_index] = upgrade_window_data(S.window_data[S.current_win_index]);
            S.window_data[S.current_win_index].attrs['data-name'] = val;
        }
    }

    if (target === 'attr') el.setAttribute(key, val);
    else if (target === 'style') {
        if (key === 'color') {
            if (isComponent && (el.className === 'gui-label' || el.className === 'label_element_gui')) el.style.color = val;
            else el.style.background = val;
        } else {
            el.style[key] = val;
            if (key.match(/^(left|top|width|height)$/)) el.style[key] = val + 'px';
        }
    } else if (target === 'src') el.src = val;
    else if (target === 'innerText') el.innerText = val;

    update_component_tree();
}

function past_gui_window(win, name_type) {
    let comp;
    for (let ci = 0; ci < COMPONENTS.length; ci++) {
        if (COMPONENTS[ci].name === name_type) {
            comp = COMPONENTS[ci];
            break;
        }
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
    const ev = window.event || {};
    element.style.left = Math.round((ev.offsetX || 0) / S.grid_distance) * S.grid_distance + 'px';
    element.style.top = Math.round((ev.offsetY || 0) / S.grid_distance) * S.grid_distance + 'px';

    if (S.count_element_add[name_type] === undefined) S.count_element_add[name_type] = 0;
    const name = name_type + '_' + (++S.count_element_add[name_type]);
    element.setAttribute('data-name', name);
    element.onmousedown = func_define_select;
    if (S.cmd_sensor) element.ontouchstart = element.onmousedown;
    element.oncontextmenu = function (e) {
        show_component_context_menu(e, this);
        e.stopPropagation();
        return false;
    };

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
    for (let i = 0; i < S.count_stack; i++) {
        const data = S.window_data[i];
        if (data && win_name(data) === newName && data !== skipElement) return true;
        const comps = (i === S.current_win_index) ? scan_window_components() : (data ? (data.components || []) : []);
        for (let j = 0; j < comps.length; j++) {
            if (comps[j] === newName) return true;
        }
    }
    return false;
}

function save_window_state() {
    if (S.current_win_index < 0) return;
    const attrs = {};
    for (let i = 0; i < S.win.attributes.length; i++) {
        const a = S.win.attributes[i];
        if (a.name.indexOf('data') === 0) attrs[a.name] = a.value;
    }
    S.window_data[S.current_win_index] = {
        html: S.addwinelm.innerHTML,
        attrs,
        style: {
            width: S.win.style.width,
            height: S.win.style.height,
            background: S.win.style.background
        },
        components: scan_window_components()
    };
}

function scan_window_components() {
    const comps = [];
    const list = S.addwinelm.children;
    for (let i = 0; i < list.length; i++) {
        const name = list[i].getAttribute('data-name');
        if (name) comps.push(name);
    }
    return comps;
}

function set_palette_view(mode) {
    const panel = getID('properties-panel');
    const btn = getID('palette-view-btn');
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
    const container = getID('properties-panel');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < COMPONENTS.length; i++) {
        if (i === 0 || COMPONENTS[i].group !== COMPONENTS[i - 1].group) {
            const title = createELM('div');
            title.className = 'title';
            title.innerText = COMPONENTS[i].group;
            container.appendChild(title);
        }
        const el = createELM('div');
        el.className = 'element';
        el.setAttribute('data-name', COMPONENTS[i].name);
        el.onclick = function () {
            select_element_menu(this);
            return false;
        };
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
    const sel = getID('window-selector');
    if (!sel) return;
    sel.innerHTML = '';
    for (let i = 0; i < S.count_stack; i++) {
        const data = S.window_data[i];
        const opt = createELM('option');
        opt.value = i;
        opt.text = data ? (win_name(data) || ('Window_' + (i + 1))) : ('Window_' + (i + 1));
        sel.add(opt);
    }
    sel.value = '' + S.current_win_index;
    const addOpt = createELM('option');
    addOpt.value = '-1';
    addOpt.text = '+ Добавить окно';
    sel.add(addOpt);
    sel.onchange = function () {
        const idx = parseInt(this.value);
        if (idx === -1) {
            add_new_window();
        } else if (idx !== S.current_win_index) switch_window(idx);
        else if (S.select_element !== null) {
            S.select_element = null;
            render_props(S.win);
        }
    };
}

function update_component_tree() {
    update_window_select();
    const sel = getID('component-tree');
    if (!sel) return;
    sel.innerHTML = '';
    const selCompName = S.select_element ? S.select_element.getAttribute('data-name') : null;
    let selectedValue = null;
    for (let i = 0; i < S.count_stack; i++) {
        const data = S.window_data[i];
        const winName = data ? (win_name(data) || ('Window_' + (i + 1))) : ('Window_' + (i + 1));
        let comps = data ? (data.components || []) : [];
        if (i === S.current_win_index) {
            comps = scan_window_components();
            if (data) data.components = comps;
        }

        const grp = createELM('optgroup');
        grp.label = winName;
        sel.add(grp);

        const winOpt = createELM('option');
        winOpt.value = i + '|';
        winOpt.text = winName;
        if (i === S.current_win_index && !selCompName) selectedValue = winOpt.value;
        grp.appendChild(winOpt);

        for (let j = 0; j < comps.length; j++) {
            const opt = createELM('option');
            opt.value = i + '|' + comps[j];
            opt.text = comps[j];
            if (i === S.current_win_index && comps[j] === selCompName) selectedValue = opt.value;
            grp.appendChild(opt);
        }
    }
    if (selectedValue) sel.value = selectedValue;
    sel.onchange = function () {
        const val = this.value.split('|');
        const winIdx = parseInt(val[0]);
        const compName = val[1];
        if (winIdx !== S.current_win_index) switch_window(winIdx);
        if (compName) {
            const children = S.addwinelm.children;
            for (let k = 0; k < children.length; k++) {
                if (children[k].getAttribute('data-name') === compName) {
                    select_element_added_single(children[k]);
                    S.global_lock_event = true;
                    break;
                }
            }
        } else if (S.select_element !== null) {
            S.select_element = null;
            render_props(S.win);
            RrefreshPOS(S.win);
            TrefreshPOS(S.win);
            RTrefreshPOS(S.win);
        } else {
            RrefreshPOS(S.win);
            TrefreshPOS(S.win);
            RTrefreshPOS(S.win);
        }
    };
}

function create_size_rect_change() {
    S.r_size = createELM('DIV');
    S.r_size.className = 'size';
    S.r_size.style.cursor = 'ew-resize';
    S.r_size.onmousedown = function (e) {
        startResize(e, 'right');
    };
    if (S.cmd_sensor) S.r_size.ontouchstart = S.r_size.onmousedown;
    document.body.appendChild(S.r_size);

    S.t_size = createELM('DIV');
    S.t_size.className = 'size';
    S.t_size.style.cursor = 'ns-resize';
    S.t_size.onmousedown = function (e) {
        startResize(e, 'top');
    };
    if (S.cmd_sensor) S.t_size.ontouchstart = S.t_size.onmousedown;
    document.body.appendChild(S.t_size);

    S.rt_size = createELM('DIV');
    S.rt_size.className = 'size';
    S.rt_size.style.cursor = 'nwse-resize';
    S.rt_size.onmousedown = function (e) {
        startResize(e, 'corner');
    };
    if (S.cmd_sensor) S.rt_size.ontouchstart = S.rt_size.onmousedown;
    document.body.appendChild(S.rt_size);

    if (!S.win) return;
    const r = S.win.getBoundingClientRect();
    const hw = S.r_size.offsetWidth / 2, hh = S.r_size.offsetHeight / 2;
    S.r_size.style.left = (r.left + r.width - hw) + 'px';
    S.r_size.style.top = (r.top + r.height / 2 - hh) + 'px';
    S.t_size.style.left = (r.left + r.width / 2 - hw) + 'px';
    S.t_size.style.top = (r.top + r.height - hh) + 'px';
    S.rt_size.style.left = (r.left + r.width - hw) + 'px';
    S.rt_size.style.top = (r.top + r.height - hh) + 'px';
}

function update_selection_dots() {
    const parentRect = S.addwinelm.getBoundingClientRect();
    const half = 5;
    for (let i = 0; i < S.selected_elements_array.length; i++) {
        const item = S.selected_elements_array[i];
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
    const rect = S.select_element_rect.getBoundingClientRect();
    const children = S.addwinelm.children;
    const parentRect = S.addwinelm.getBoundingClientRect();
    let firstFound = null;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child.getAttribute('data-name')) continue;
        const childRect = child.getBoundingClientRect();
        if (rectsIntersect(rect, childRect)) {
            if (!firstFound) {
                firstFound = child;
                continue;
            }
            const dots = [];
            for (let j = 0; j < 3; j++) {
                const dot = createELM('DIV');
                dot.className = 'selection-dot';
                S.addwinelm.appendChild(dot);
                dots.push(dot);
            }
            const r = child.getBoundingClientRect();
            const half = 5;
            dots[0].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
            dots[0].style.top = Math.round(r.top - parentRect.top + r.height / 2 - half) + 'px';
            dots[1].style.left = Math.round(r.left - parentRect.left + r.width / 2 - half) + 'px';
            dots[1].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
            dots[2].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
            dots[2].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
            S.selected_elements_array.push({el: child, dots});
        }
    }
    if (firstFound) {
        select_element_added(firstFound);
    }
}

function rectsIntersect(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function show_component_context_menu(e, el) {
    const clicked = el;
    const isInSelection = S.select_element === clicked || S.selected_elements_array.some(function (item) {
        return item.el === clicked;
    });
    if (!isInSelection) {
        select_element_added_single(clicked);
    }
    S.context_menu_component.innerHTML =
        '<div class="event-item" data-action="cut"><i class="fa-solid fa-scissors"></i><span class="title">Вырезать</span></div>' +
        '<div class="event-item" data-action="copy"><i class="fa-solid fa-copy"></i><span class="title">Копировать</span></div>' +
        '<div class="event-item" data-action="delete"><i class="fa-solid fa-trash"></i><span class="title">Удалить</span></div>' +
        '<div class="event-separator"></div>' +
        '<div class="event-item" data-action="bring-to-front"><i class="fa-solid fa-arrow-up-wide-short"></i><span class="title">На передний фон</span></div>' +
        '<div class="event-item" data-action="send-to-back"><i class="fa-solid fa-arrow-down-wide-short"></i><span class="title">На задний фон</span></div>';

    const target = S.select_element || S.win;
    const dataListEvent = target.getAttribute('data_list_event');
    const hasEvents = dataListEvent !== null && parseInt(dataListEvent) !== 0;
    if (hasEvents) {
        S.context_menu_component.innerHTML +=
            '<div class="event-separator"></div>' +
            '<div class="event-item" data-action="edit-code"><i class="fa-solid fa-pen"></i><span class="title">Редактировать код</span></div>';
    }

    Array.from(S.context_menu_component.children).forEach(function (item) {
        if (item.classList.contains('event-separator')) return;
        item.onclick = function () {
            const action = this.getAttribute('data-action');
            if (action === 'copy' || action === 'cut') {
                const items = [];
                S.selected_elements_array.forEach(function (si) {
                    items.push(si.el);
                });
                if (S.select_element && items.indexOf(S.select_element) < 0) items.push(S.select_element);
                S.copy_element_object = items;
                if (action === 'cut') {
                    clear_selected_elements();
                    items.forEach(function (el) {
                        el.parentNode.removeChild(el);
                    });
                    S.select_element = null;
                    TrefreshPOS(S.win);
                    RrefreshPOS(S.win);
                    RTrefreshPOS(S.win);
                    render_props(S.win);
                    update_component_tree();
                }
            } else if (action === 'delete') {
                const toDelete = [];
                S.selected_elements_array.forEach(function (si) {
                    toDelete.push(si.el);
                });
                if (S.select_element && toDelete.indexOf(S.select_element) < 0) toDelete.push(S.select_element);
                clear_selected_elements();
                toDelete.forEach(function (el) {
                    if (el.parentNode) el.parentNode.removeChild(el);
                });
                S.select_element = null;
                TrefreshPOS(S.win);
                RrefreshPOS(S.win);
                RTrefreshPOS(S.win);
                render_props(S.win);
                update_component_tree();
            } else if (action === 'bring-to-front') {
                bring_to_front();
            } else if (action === 'send-to-back') {
                send_to_back();
            } else if (action === 'edit-code') {
                context_edit_code();
            }
            S.context_menu_component.style.display = 'none';
        };
    });
    S.context_menu_component.style.top = e.pageY + 'px';
    S.context_menu_component.style.display = 'block';
    S.context_menu_component.style.left = Math.round(e.pageX - S.context_menu_component.offsetWidth / 2) + 'px';
}

function delete_select_element() {
    const toDelete = [];
    S.selected_elements_array.forEach(function (si) {
        toDelete.push(si.el);
    });
    if (S.select_element && toDelete.indexOf(S.select_element) < 0) toDelete.push(S.select_element);
    clear_selected_elements();
    toDelete.forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    S.select_element = null;
    TrefreshPOS(S.win);
    RrefreshPOS(S.win);
    RTrefreshPOS(S.win);
    render_props(S.win);
    update_component_tree();
}

function bring_to_front() {
    const parent = S.addwinelm;
    const arr = S.selected_elements_array.slice();
    const hasPrimary = S.selected_elements_array.some(function (item) {
        return item.el === S.select_element;
    });
    if (S.select_element && !hasPrimary) arr.push({el: S.select_element});
    arr.sort((a, b) => {
        const ai = Array.from(parent.children).indexOf(a.el || a);
        const bi = Array.from(parent.children).indexOf(b.el || b);
        return ai - bi;
    });
    arr.forEach(function (item) {
        const el = item.el || item;
        parent.appendChild(el);
    });
    TrefreshPOS(S.win);
    RrefreshPOS(S.win);
    RTrefreshPOS(S.win);
}

function send_to_back() {
    const parent = S.addwinelm;
    const arr = S.selected_elements_array.slice();
    const hasPrimary = S.selected_elements_array.some(function (item) {
        return item.el === S.select_element;
    });
    if (S.select_element && !hasPrimary) arr.push({el: S.select_element});
    arr.sort((a, b) => {
        const ai = Array.from(parent.children).indexOf(a.el || a);
        const bi = Array.from(parent.children).indexOf(b.el || b);
        return ai - bi;
    });
    arr.forEach(function (item) {
        const el = item.el || item;
        parent.insertBefore(el, parent.firstChild);
    });
    TrefreshPOS(S.win);
    RrefreshPOS(S.win);
    RTrefreshPOS(S.win);
}

function context_edit_code() {
    const el = S.select_element || S.win;
    const events = get_component_events(el);
    const dataList = el.getAttribute('data_list_event');
    const cmd = dataList !== '' ? parseInt(dataList) : 0;

    let html = '';
    for (let x = 0; x < events.length; x++) {
        if (cmd & (1 << x)) {
            const ev = events[x];
            const edef = get_event_def(ev);
            const icon = edef && edef.icon ? '<img src="' + edef.icon + '">' : '';
            html += '<div class="event-item" data-event="' + ev + '">' +
                icon + '<span class="title">' + ((edef && edef.label) || ev) + '</span></div>';
        }
    }
    if (!html) return;

    S.element_list.innerHTML = html;
    Array.from(S.element_list.children).forEach(function (item) {
        item.onmousedown = function () {
            const eventName = this.getAttribute('data-event');
            const compName = el.getAttribute('data-name') || 'Component';
            const attrName = event_attr_name(eventName);
            const tmp = el.getAttribute(attrName);
            const args = event_args(eventName);
            getID('code-textarea').value = tmp ? decodeURIComponent(tmp) : '';
            getID('code-editor-title').innerText = 'void ' + compName + '_' + eventName + '(' + args + ') {';
            getID('code-editor').style.display = 'flex';
            S.element_list.style.display = 'none';
        };
    });
    S.element_list.style.top = S.mouse.y + 'px';
    S.element_list.style.display = html ? 'block' : 'none';
    S.element_list.style.left = Math.round(S.mouse.x - S.element_list.offsetWidth / 2) + 'px';
}

function paste_element() {
    if (!S.copy_element_object || !S.copy_element_object.length) return;
    const pasted = [];
    S.copy_element_object.forEach(function (src) {
        const el = src.cloneNode(true);

        const baseName = (src.getAttribute('data-name') || 'Component').replace(/_\d+$/, '');
        let maxNum = 0;
        const allElements = S.addwinelm.querySelectorAll('[data-name]');
        Array.from(allElements).forEach(function (item) {
            const n = item.getAttribute('data-name');
            if (n && n.indexOf(baseName) === 0) {
                const suffix = n.slice(baseName.length);
                if (suffix === '' || /^_\d+$/.test(suffix)) {
                    const num = suffix === '' ? 0 : parseInt(suffix.slice(1));
                    if (num > maxNum) maxNum = num;
                }
            }
        });
        el.setAttribute('data-name', baseName + '_' + (maxNum + 1));

        const left = parseInt(src.style.left) || 0;
        const top = parseInt(src.style.top) || 0;
        el.style.left = (left + 20) + 'px';
        el.style.top = (top + 20) + 'px';

        el.onmousedown = func_define_select;
        if (S.cmd_sensor) el.ontouchstart = el.onmousedown;
        el.oncontextmenu = function (e) {
            show_component_context_menu(e, this);
            e.stopPropagation();
            return false;
        };

        S.addwinelm.appendChild(el);
        pasted.push(el);
    });
    if (pasted.length) {
        clear_selected_elements();
        const lastEl = pasted[pasted.length - 1];
        for (let i = 0; i < pasted.length - 1; i++) {
            const el = pasted[i];
            const r = el.getBoundingClientRect();
            const parentRect = S.addwinelm.getBoundingClientRect();
            const half = 5;
            const dots = [];
            for (let j = 0; j < 3; j++) {
                const dot = createELM('DIV');
                dot.className = 'selection-dot';
                S.addwinelm.appendChild(dot);
                dots.push(dot);
            }
            dots[0].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
            dots[0].style.top = Math.round(r.top - parentRect.top + r.height / 2 - half) + 'px';
            dots[1].style.left = Math.round(r.left - parentRect.left + r.width / 2 - half) + 'px';
            dots[1].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
            dots[2].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
            dots[2].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
            S.selected_elements_array.push({el, dots});
        }
        select_element_added(lastEl);
    }
    S.copy_element_object = [];
}

function show_window_context_menu(e) {
    S.context_menu_component.innerHTML = '';
    if (S.copy_element_object && S.copy_element_object.length) {
        S.context_menu_component.innerHTML +=
            '<div class="event-item" data-action="paste"><i class="fa-solid fa-paste"></i><span class="title">Вставить</span></div>';
    } else {
        S.context_menu_component.innerHTML +=
            '<div class="event-item" style="opacity:0.5;cursor:default;"><i class="fa-solid fa-paste"></i><span class="title">Вставить</span></div>';
    }
    Array.from(S.context_menu_component.children).forEach(function (item) {
        const action = item.getAttribute('data-action');
        if (!action) return;
        item.onclick = function () {
            if (action === 'paste') paste_element();
            S.context_menu_component.style.display = 'none';
        };
    });
    S.context_menu_component.style.top = e.pageY + 'px';
    S.context_menu_component.style.display = 'block';
    S.context_menu_component.style.left = Math.round(e.pageX - S.context_menu_component.offsetWidth / 2) + 'px';
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
    if (S.list_eval_select === null) return false;
    const el = S.select_element || S.win;
    deleteElement(S.list_eval_select);
    const eventName = S.list_eval_select.getAttribute('data-sel-event');
    const events = get_component_events(el);
    const x = events.indexOf(eventName);
    if (x < 0) return false;
    const idx = S.tmp_event_data.indexOf(eventName);
    if (idx >= 0) S.tmp_event_data.splice(idx, 1);

    const data_list_event_atr = el.getAttribute('data_list_event');
    let cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
    cmd &= 0xFFFFFFFF ^ (1 << x);

    el.removeAttribute(event_attr_name(eventName));
    el.setAttribute('data_list_event', cmd);
}

function replace_event_list(eventName) {
    if (S.list_eval_select === null) return;
    const el = S.select_element || S.win;
    const oldEventName = S.list_eval_select.getAttribute('data-sel-event');
    if (!oldEventName || oldEventName === eventName) return;
    if (S.tmp_event_data.indexOf(eventName) >= 0) return;

    const oldAttr = event_attr_name(oldEventName);
    const code = el.getAttribute(oldAttr);

    const events = get_component_events(el);
    const oldX = events.indexOf(oldEventName);
    const data_list_event_atr = el.getAttribute('data_list_event');
    let cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
    cmd &= 0xFFFFFFFF ^ (1 << oldX);
    el.removeAttribute(oldAttr);

    const newX = events.indexOf(eventName);
    cmd |= 1 << newX;
    el.setAttribute('data_list_event', '' + cmd);

    if (code) el.setAttribute(event_attr_name(eventName), code);

    load_attribute_list_event();

    const items = S.element_list_event.children;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.getAttribute('data-sel-event') === eventName || item.id === event_attr_name(eventName)) {
            if (S.list_eval_select !== null) S.list_eval_select.classList.remove('select');
            S.list_eval_select = item;
            S.list_eval_select.classList.add('select');
            break;
        }
    }

    S.element_list.style.display = 'none';
}

function add_event_list(eventName) {
    if (S.tmp_event_data.indexOf(eventName) >= 0) return false;
    const el = S.select_element || S.win;

    const events = get_component_events(el);
    const x = events.indexOf(eventName);
    if (x < 0) return false;

    S.tmp_event_data.push(eventName);

    const item = createELM('DIV');
    item.className = 'event-item';
    item.setAttribute('data-sel-event', eventName);
    const edef = get_event_def(eventName);
    if (edef && edef.icon) {
        const iconImg = createELM('IMG');
        iconImg.src = edef.icon;
        iconImg.style.cssText = 'vertical-align:middle;margin-right:4px;width:16px;height:16px;';
        item.appendChild(iconImg);
    }
    item.appendChild(document.createTextNode((edef && edef.label) || eventName));
    item.id = event_attr_name(eventName);

    const data_list_event_atr = el.getAttribute('data_list_event');
    let cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
    cmd |= 1 << x;
    el.setAttribute('data_list_event', '' + cmd);

    item.onmousedown = function () {
        if (S.list_eval_select !== null) S.list_eval_select.classList.remove('select');
        S.list_eval_select = this;
        this.classList.add('select');
    };
    item.addEventListener('dblclick', function () {
        click_edit_code();
    });
    S.element_list_event.appendChild(item);
    S.element_list.style.display = 'none';
}

function load_attribute_list_event() {
    S.tmp_event_data = [];
    S.list_eval_select = null;
    const tmp = S.element_list_event.children;
    let count = tmp.length;
    while (count--) S.element_list_event.removeChild(tmp[count]);

    const el = S.select_element || S.win;

    const events = get_component_events(el);
    const data_list_event_atr = el.getAttribute('data_list_event');
    const cmd = data_list_event_atr !== '' ? parseInt(data_list_event_atr) : 0;
    for (let x = 0; x < events.length; x++) {
        if (cmd & (1 << x)) {
            const eventName = events[x];
            const item = createELM('DIV');
            item.className = 'event-item';
            const edef = get_event_def(eventName);
            if (edef && edef.icon) {
                const iconImg = createELM('IMG');
                iconImg.src = edef.icon;
                iconImg.style.cssText = 'vertical-align:middle;margin-right:4px;width:16px;height:16px;';
                item.appendChild(iconImg);
            }
            item.appendChild(document.createTextNode((edef && edef.label) || eventName));
            item.id = event_attr_name(eventName);
            item.setAttribute('data-sel-event', eventName);
            S.tmp_event_data.push(eventName);
            item.onmousedown = function () {
                if (S.list_eval_select !== null) S.list_eval_select.classList.remove('select');
                S.list_eval_select = this;
                this.classList.add('select');
            };
            item.addEventListener('dblclick', function () {
                click_edit_code();
            });
            S.element_list_event.appendChild(item);
        }
    }
}

function cancel_edit_code() {
    getID('code-editor').style.display = 'none';
}

function save_edit_code() {
    getID('code-editor').style.display = 'none';
    const el = S.select_element || S.win;
    if (el && S.list_eval_select) {
        const attrName = S.list_eval_select.id || event_attr_name(S.list_eval_select.getAttribute('data-sel-event'));
        el.setAttribute(attrName, encodeURIComponent(getID('code-textarea').value));
    }
}

function event_args(eventName) {
    switch (eventName) {
        case 'click':
        case 'dblclick':
            return 'dword x, dword y, dword buttons [MOUSE_LEFT=1, MOUSE_RIGHT=2, MOUSE_MIDDLE=4]';
        case 'mousemove':
        case 'mouseenter':
        case 'mouseleave':
            return 'dword x, dword y';
        case 'mousedown':
        case 'mouseup':
            return 'dword x, dword y, dword buttons [MOUSE_LEFT=1, MOUSE_RIGHT=2, MOUSE_MIDDLE=4]';
        case 'mousewheel':
            return 'dword delta';
        case 'keydown':
        case 'keypress':
        case 'keyup':
            return 'dword keycode, dword scancode';
        case 'resize':
            return 'dword w, dword h';
        case 'timer':
            return 'dword timer_id';
        default:
            return '';
    }
}

function click_edit_code() {
    if (S.list_eval_select === null) return;
    const el = S.select_element || S.win;
    const compName = el.getAttribute('data-name') || 'Component';
    const eventName = S.list_eval_select.getAttribute('data-sel-event') || 'event';
    const attrName = S.list_eval_select.id || event_attr_name(eventName);
    const tmp = el.getAttribute(attrName);
    const args = event_args(eventName);
    getID('code-textarea').value = tmp ? decodeURIComponent(tmp) : '';
    getID('code-editor-title').innerText = 'void ' + compName + '_' + eventName + '(' + args + ') {';
    getID('code-editor').style.display = 'flex';
}

function getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function changeSetkaOption(e) {
    const px = parseInt(e.value);
    if (!isNaN(px) && px > 0) {
        const dotColor = getCSSVar('--color-canvas-dot') || '#b0b0c4';
        S.addwinelm.style.backgroundImage = 'radial-gradient(circle, ' + dotColor + ' 1px, transparent 1px)';
        S.addwinelm.style.backgroundSize = px + 'px ' + px + 'px';
        S.grid_distance = px;
    } else {
        S.addwinelm.style.backgroundImage = 'none';
        S.addwinelm.style.backgroundSize = '';
        S.grid_distance = 1;
    }
}

function set_text_stat_bar(txt) {
    const el = getID('status-compiler');
    if (el) el.innerText = txt;
}

function load_window_data(index) {
    const data = S.window_data[index];
    if (data) {
        S.window_data[index] = upgrade_window_data(data);
        S.addwinelm.innerHTML = S.window_data[index].html || '';
        for (const key in S.window_data[index].attrs) {
            if (S.window_data[index].attrs[key]) S.win.setAttribute(key, S.window_data[index].attrs[key]);
            else S.win.removeAttribute(key);
        }
        const s = S.window_data[index].style || {};
        S.win.style.width = s.width || '300px';
        S.win.style.height = s.height || '230px';
        S.win.style.background = s.background || '#ffffff';
    } else {
        S.addwinelm.innerHTML = '';
        S.win.setAttribute('data-name', 'Window_' + (index + 1));
        S.win.setAttribute('data-caption', 'Окно');
        S.win.style.width = '300px';
        S.win.style.height = '230px';
        S.win.style.background = '#ffffff';
    }
    S.addwinelm.style.width = (parseInt(S.win.style.width) - 2) + 'px';
    S.addwinelm.style.height = (parseInt(S.win.style.height) - 2) + 'px';
    set_element_defunc(S.addwinelm);
}

function switch_window(index) {
    if (index === S.current_win_index) return;
    save_window_state();
    S.current_win_index = index;
    load_window_data(index);
    S.select_element = null;
    render_props(S.win);
    TrefreshPOS(S.win);
    RrefreshPOS(S.win);
    RTrefreshPOS(S.win);
    update_component_tree();
}

function add_new_window(name) {
    if (!name) name = prompt('Введите название окна:', 'Window_' + (S.count_stack + 1));
    if (!name) return;
    if (is_name_taken(name)) {
        alert('Имя "' + name + '" уже используется');
        add_new_window();
        return;
    }
    const index = S.count_stack;
    S.window_stack[index] = null;
    S.window_data[S.current_win_index] = S.window_data[S.current_win_index] || upgrade_window_data({
        html: S.addwinelm.innerHTML,
        name: S.win.getAttribute('data-name'),
        caption: S.win.getAttribute('data-caption'),
        width: S.win.style.width,
        height: S.win.style.height,
        bg: S.win.style.background,
        hide_prop: S.win.getAttribute('data-hide-prop'),
        align: S.win.getAttribute('data-align'),
        components: scan_window_components()
    });
    S.window_data[index] = {
        html: '',
        attrs: {'data-name': name, 'data-caption': '', 'data-hide-prop': '', 'data-align': ''},
        style: {width: '300px', height: '230px', background: '#ffffff'},
        components: []
    };
    S.count_stack++;
    S.GLOBAL_INIT_ELEMENT[S.GLOBAL_INIT_COUNT++] = name;
    switch_window(index);
}

function set_element_defunc(window_object) {
    const list = window_object.children;
    for (let i = 0; i < list.length; i++) {
        const child = list[i];
        if (child.nodeType !== 1) continue;
        child.onmousedown = func_define_select;
        child.oncontextmenu = function (e) {
            show_component_context_menu(e, this);
            e.stopPropagation();
            return false;
        };
    }
}

function initPanelResizers() {
    const splitters = document.querySelectorAll('.splitter');
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
        } catch (e) {
        }
        if (S.select_element) {
            TrefreshPOS(S.select_element);
            RrefreshPOS(S.select_element);
            RTrefreshPOS(S.select_element);
        } else {
            TrefreshPOS(S.win);
            RrefreshPOS(S.win);
            RTrefreshPOS(S.win);
        }
        dragData = null;
    }

    splitters.forEach(splitter => {
        splitter.addEventListener('mousedown', e => {
            const side = splitter.getAttribute('data-side');
            const panel = side === 'left'
                ? splitter.previousElementSibling
                : splitter.nextElementSibling;
            if (!panel) return;
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
        const lp = document.querySelector('.side-left');
        if (lp) lp.style.width = leftW;
    }
    if (rightW) {
        const rp = document.querySelector('.side-right');
        if (rp) rp.style.width = rightW;
    }
}