function init() {
	applySavedTheme();
	initPanelResizers();
	render_palette();
	set_palette_view(localStorage.getItem('kstudio_palette_view') || 'list');

	document.getElementById('btn-theme').onclick = toggleTheme;

	document.querySelectorAll('#right-panel .tab-bar input[type="radio"]').forEach(function(radio) {
		radio.addEventListener('change', function() {
			var panelId = this.id.replace('tab-', 'panel-');
			var panel = document.getElementById(panelId);
			if (panel) {
				document.querySelectorAll('#right-panel .tab-panel').forEach(function(p) { p.classList.remove('active'); });
				panel.classList.add('active');
			}
		});
	});

	S.win = document.getElementById('window-background');
	S.addwinelm = document.getElementById('window-canvas');
	S.select_element_rect = document.getElementById('selection-rect');
	S.element_add_event = document.getElementById('btn-add-event');
	S.element_list = document.getElementById('event-menu');
	S.element_list_event = document.getElementById('event-list-items');
	S.context_menu_component = document.getElementById('context-menu');

	if (S.win) {
		S.win_x = document.getElementById('left-panel') ? document.getElementById('left-panel').offsetWidth : 0;
		S.win_y = 0;
	}

	create_size_rect_change();

	if (S.win) {
		try { TrefreshPOS(S.win); RrefreshPOS(S.win); RTrefreshPOS(S.win); } catch (e) { console.error('refreshPOS error:', e); }
	}

	S.addwinelm.onmousedown = function (event) {
		if (S.list_element_select !== null) {
			const type = S.list_element_select.getAttribute('data-name');
			for (let ci = 0; ci < COMPONENTS.length; ci++) {
				if (COMPONENTS[ci].name === type) { past_gui_window(this, type); return true; }
			}
		}
		if (!S.global_lock_event) {
			S.select_element = null;
			TrefreshPOS(S.win); RrefreshPOS(S.win); RTrefreshPOS(S.win);
			render_props(S.win);
			clear_selected_elements();
			update_component_tree();
			const ey = event && event.pageY ? event.pageY : (event && event.clientY ? event.clientY : S.mouse.y);
			const ex = event && event.pageX ? event.pageX : (event && event.clientX ? event.clientX : S.mouse.x);
			S.sel_rect_y = ey;
			S.sel_rect_x = ex;
			S.select_element_rect.style.top = ey + 'px';
			S.select_element_rect.style.left = ex + 'px';
			S.select_element_rect.style.display = 'none';
			document.addEventListener('mousemove', onRectSelectMove);
			if (S.cmd_sensor) document.addEventListener('touchmove', onRectSelectMove, { passive: false });
			S.rect_select_active = true;
			return true;
		}
		return false;
	};

	S.addwinelm.oncontextmenu = function (e) {
		if (S.select_element) {
			show_component_context_menu(e, S.select_element);
		} else {
			show_window_context_menu(e);
		}
		return false;
	};

	if (S.cmd_sensor) S.addwinelm.ontouchstart = S.addwinelm.onmousedown;

	setupEventButtons();
	setupToolbar();

	S.win.setAttribute('data-name', 'Window_1');
	S.win.setAttribute('data-caption', 'Окно');
	S.win.setAttribute('data-hide-prop', '');
	S.win.style.background = '#ffffff';
	S.addwinelm.style.width = S.win.offsetWidth - 2;
	S.addwinelm.style.height = S.win.offsetHeight - 2;

	const gridSel = document.getElementById('grid-selector');
	if (gridSel) changeSetkaOption(gridSel);

	S.window_stack[0] = S.win;
	S.window_data = {};
	S.window_data[0] = {
		html: S.addwinelm.innerHTML,
		attrs: { 'data-name': 'Window_1', 'data-caption': 'Окно', 'data-hide-prop': '', 'data-align': '' },
		style: { width: S.win.style.width, height: S.win.style.height, background: S.win.style.background },
		components: []
	};
	S.count_stack = 1;
	S.current_win_index = 0;
	S.GLOBAL_INIT_ELEMENT[S.GLOBAL_INIT_COUNT++] = 'Window_1';

	update_component_tree();
	render_props(S.win);
	load_help_stat(data_help_status);

	document.addEventListener('mousedown', function (e) {
		if (S.context_menu_component && S.context_menu_component.style.display !== 'none' && !S.context_menu_component.contains(e.target)) {
			S.context_menu_component.style.display = 'none';
		}
	});

	setupGlobalListeners();
}

function onRectSelectMove(e) {
	if (!S.rect_select_active) return;
	const cx = e.touches ? e.touches[0].clientX : e.clientX;
	const cy = e.touches ? e.touches[0].clientY : e.clientY;
	let x = cx - S.sel_rect_x;
	let y = cy - S.sel_rect_y;
	if (Math.abs(x) < 3 && Math.abs(y) < 3) return;
	S.select_element_rect.style.display = 'block';
	if (x < 0) { S.select_element_rect.style.left = (S.sel_rect_x + x) + 'px'; x = -x; }
	if (y < 0) { S.select_element_rect.style.top = (S.sel_rect_y + y) + 'px'; y = -y; }
	S.select_element_rect.style.width = x + 'px';
	S.select_element_rect.style.height = y + 'px';
}

function clear_selected_elements() {
	for (let i = 0; i < S.selected_elements_array.length; i++) {
		const item = S.selected_elements_array[i];
		if (item.dots) {
			for (let j = 0; j < item.dots.length; j++) {
				if (item.dots[j].parentNode) {
					item.dots[j].parentNode.removeChild(item.dots[j]);
				}
			}
		}
	}
	S.selected_elements_array = [];
}

function setupEventButtons() {
	const btnAddEvent = document.getElementById('btn-add-event');
	const btnDeleteEvent = document.getElementById('btn-delete-event');
	const btnReplaceEvent = document.getElementById('btn-replace-event');
	const btnEditCode = document.getElementById('btn-edit-code');
	const btnSaveCode = document.getElementById('btn-save-code');
	const btnCancelCode = document.getElementById('btn-cancel-code');

	if (btnAddEvent) {
		btnAddEvent.onclick = function (e) {
			const el = S.select_element || S.win;
			const events = get_component_events(el);
			if (!events.length) return;
			let html = '';
			for (let i = 0; i < events.length; i++) {
				const ev = events[i];
				if (S.tmp_event_data.indexOf(ev) >= 0) continue;
				const edef = getEventDef(ev);
				const icon = edef && edef.icon ? '<img src="' + edef.icon + '">' : '';
				html += '<div class="event-item" data-event="' + ev + '">' +
					icon + '<span class="title">' + ((edef && edef.label) || ev) + '</span></div>';
			}
			S.element_list.innerHTML = html;
			Array.from(S.element_list.children).forEach(item => {
				item.onmousedown = function () {
					add_event_list(this.getAttribute('data-event'));
				};
			});
			const ex = e && e.pageX ? e.pageX : (e && e.clientX ? e.clientX : S.mouse.x);
			const ey = e && e.pageY ? e.pageY : (e && e.clientY ? e.clientY : S.mouse.y);
			S.element_list.style.top = ey + 'px';
			S.element_list.style.display = html ? 'block' : 'none';
			S.element_list.style.left = (ex - S.element_list.offsetWidth / 2) + 'px';
		};
	}

	if (btnDeleteEvent) {
		btnDeleteEvent.onclick = function () {
			delete_event_list();
		};
	}

	if (btnReplaceEvent) {
		btnReplaceEvent.onclick = function (e) {
			if (S.list_eval_select === null) return;
			const el = S.select_element || S.win;
			const events = get_component_events(el);
			const oldName = S.list_eval_select.getAttribute('data-sel-event');
			if (!events.length || !oldName) return;
			let html = '';
			for (let i = 0; i < events.length; i++) {
				const ev = events[i];
				if (ev === oldName || S.tmp_event_data.indexOf(ev) >= 0) continue;
				const edef = getEventDef(ev);
				const icon = edef && edef.icon ? '<img src="' + edef.icon + '">' : '';
				html += '<div class="event-item" data-event="' + ev + '">' +
					icon + '<span class="title">' + ((edef && edef.label) || ev) + '</span></div>';
			}
			S.element_list.innerHTML = html;
			Array.from(S.element_list.children).forEach(item => {
				item.onmousedown = function () {
					replace_event_list(this.getAttribute('data-event'));
				};
			});
			const ex = e && e.pageX ? e.pageX : (e && e.clientX ? e.clientX : S.mouse.x);
			const ey = e && e.pageY ? e.pageY : (e && e.clientY ? e.clientY : S.mouse.y);
			S.element_list.style.top = ey + 'px';
			S.element_list.style.display = html ? 'block' : 'none';
			S.element_list.style.left = (ex - S.element_list.offsetWidth / 2) + 'px';
		};
	}

	if (btnEditCode) {
		btnEditCode.onclick = function () {
			click_edit_code();
		};
	}

	if (btnSaveCode) {
		btnSaveCode.onclick = function () {
			save_edit_code();
		};
	}
	if (btnCancelCode) {
		btnCancelCode.onclick = function () {
			cancel_edit_code();
		};
	}
}

function setupToolbar() {
	const btnRun = document.getElementById('btn-run');
	const btnBuild = document.getElementById('btn-build');
	const btnCode = document.getElementById('btn-code');
	const btnExport = document.getElementById('btn-export');
	const btnImportTrigger = document.getElementById('btn-import-trigger');
	const importInput = document.getElementById('import-input');
	const paletteViewBtn = document.getElementById('palette-view-btn');
	const btnCloseViewer = document.getElementById('btn-close-viewer');

	if (btnRun) btnRun.onclick = () => compile(1);
	if (btnBuild) btnBuild.onclick = () => compile(2);
	if (btnCode) btnCode.onclick = showGeneratedCode;
	if (btnExport) btnExport.onclick = export_project;
	if (btnImportTrigger && importInput) {
		btnImportTrigger.onclick = () => importInput.click();
		importInput.onchange = () => import_project(importInput);
	}

	const gridSelector = document.getElementById('grid-selector');
	if (gridSelector) gridSelector.onchange = function () { changeSetkaOption(this); };

	if (paletteViewBtn) {
		paletteViewBtn.onclick = function () {
			toggle_palette_view();
		};
	}

	if (btnCloseViewer) btnCloseViewer.onclick = closeCodeViewer;
}

function setupGlobalListeners() {
	window.onresize = () => {};

	document.addEventListener('mouseup', () => {
		if (S.dragData) onDragEnd();
		if (S.resizeData) onResizeEnd();
		if (S.select_element_rect) {
			if (S.rect_select_active) {
				select_components_in_rect();
			}
			S.select_element_rect.style.display = 'none';
			S.select_element_rect.style.width = '0px';
			S.select_element_rect.style.height = '0px';
		}
		document.removeEventListener('mousemove', onRectSelectMove);
		S.rect_select_active = false;
		S.global_lock_event = false;
	});

	document.addEventListener('mousedown', () => {
		if (S.list_element_select !== null) {
			S.list_element_select.className = 'element';
			S.list_element_select = null;
		}
	});

	if (S.cmd_sensor) {
		document.addEventListener('touchstart', () => {
			if (S.list_element_select !== null) {
				S.list_element_select.className = 'element';
				S.list_element_select = null;
			}
		});
		document.addEventListener('touchend', () => {
			if (S.dragData) onDragEnd();
			if (S.resizeData) onResizeEnd();
			if (S.select_element_rect) {
				if (S.rect_select_active) {
					select_components_in_rect();
				}
				S.select_element_rect.style.display = 'none';
				S.select_element_rect.style.width = '0px';
				S.select_element_rect.style.height = '0px';
			}
			document.removeEventListener('touchmove', onRectSelectMove);
			S.rect_select_active = false;
			S.global_lock_event = false;
		});
	}

	document.addEventListener('keydown', function (e) {
		const ev = window.event || e;
		if (ev.ctrlKey) S.cmd_event_ctrl = true;
		else if (ev.keyCode === 46) delete_select_element();
	});

	document.addEventListener('keyup', function (e) {
		const ev = window.event || e;
		if (S.cmd_event_ctrl) {
			if (ev.keyCode === 67) {
				const items = [];
				S.selected_elements_array.forEach(function (si) { items.push(si.el); });
				if (S.select_element && items.indexOf(S.select_element) < 0) items.push(S.select_element);
				S.copy_element_object = items;
			} else if (ev.keyCode === 88) {
				const items = [];
				S.selected_elements_array.forEach(function (si) { items.push(si.el); });
				if (S.select_element && items.indexOf(S.select_element) < 0) items.push(S.select_element);
				S.copy_element_object = items;
				clear_selected_elements();
				items.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
				S.select_element = null;
				TrefreshPOS(S.win); RrefreshPOS(S.win); RTrefreshPOS(S.win);
				render_props(S.win);
				update_component_tree();
			} else if (ev.keyCode === 86) {
				paste_element();
			} else if (ev.keyCode === 65) {
				e.preventDefault();
				clear_selected_elements();
				const children = S.addwinelm.children;
				let firstFound = null;
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (!child.getAttribute('data-name')) continue;
					if (!firstFound) { firstFound = child; continue; }
					const dots = [];
					for (let j = 0; j < 3; j++) {
						const dot = document.createElement('DIV');
						dot.className = 'selection-dot';
						S.addwinelm.appendChild(dot);
						dots.push(dot);
					}
					const r = child.getBoundingClientRect();
					const parentRect = S.addwinelm.getBoundingClientRect();
					const half = 5;
					dots[0].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
					dots[0].style.top = Math.round(r.top - parentRect.top + r.height / 2 - half) + 'px';
					dots[1].style.left = Math.round(r.left - parentRect.left + r.width / 2 - half) + 'px';
					dots[1].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
					dots[2].style.left = Math.round(r.left - parentRect.left + r.width - half) + 'px';
					dots[2].style.top = Math.round(r.top - parentRect.top + r.height - half) + 'px';
					S.selected_elements_array.push({ el: child, dots });
				}
				if (firstFound) select_element_added(firstFound);
			}
		}
		S.cmd_event_ctrl = false;
	});
}

function toggleTheme() {
	const html = document.documentElement;
	const current = html.getAttribute('data-theme');
	const next = current === 'dark' ? 'light' : 'dark';
	html.setAttribute('data-theme', next);
	localStorage.setItem('kstudio_theme', next);
	const icon = document.querySelector('#btn-theme i');
	if (icon) icon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
	const gridSel = document.getElementById('grid-selector');
	if (gridSel && gridSel.value !== '0') changeSetkaOption(gridSel);
}

function applySavedTheme() {
	const saved = localStorage.getItem('kstudio_theme');
	if (saved) {
		document.documentElement.setAttribute('data-theme', saved);
		const icon = document.querySelector('#btn-theme i');
		if (icon) icon.className = saved === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
	}
}

window.addEventListener('load', init);
