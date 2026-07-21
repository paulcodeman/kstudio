function rgbToHex(rgb) {
	if (!rgb) return 'FFFFFF';
	if (rgb[0] === '#') return rgb.slice(1).toUpperCase();
	const m = rgb.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
	if (m) {
		return ((1 << 24) + (parseInt(m[1]) << 16) + (parseInt(m[2]) << 8) + parseInt(m[3])).toString(16).slice(1).toUpperCase();
	}
	return 'FFFFFF';
}

function applyWindowData(data) {
	if (!data) return;
	addwinelm.innerHTML = data.html || '';
	for (const key in data.attrs) {
		if (data.attrs[key]) win.setAttribute(key, data.attrs[key]);
		else win.removeAttribute(key);
	}
	const s = data.style || {};
	win.style.width = s.width || '300px';
	win.style.height = s.height || '230px';
	win.style.background = s.background || '#ffffff';
	addwinelm.style.width = (parseInt(win.style.width) - 2) + 'px';
	addwinelm.style.height = (parseInt(win.style.height) - 2) + 'px';
	set_element_defunc(addwinelm);
}

const EVENT_ARGS = {
	click: 'dword x, dword y, dword buttons',
	dblclick: 'dword x, dword y, dword buttons',
	change: '',
	timer: 'dword timer_id',
	create: '',
	close: '',
	paint: '',
	execute: '',
	active: '',
	deactive: '',
	show: '',
	hide: '',
	closequery: '',
	formsubmit: '',
	error: '',
	scroll: '',
	select: '',
	selectdialog: '',
	starttrack: '',
	endtrack: '',
	hotspotclick: 'dword x, dword y',
	hotspotcovered: 'dword x, dword y',
	mouseenter: 'dword x, dword y',
	mouseleave: 'dword x, dword y',
	mousemove: 'dword x, dword y',
	mousedown: 'dword x, dword y, dword buttons',
	mouseup: 'dword x, dword y, dword buttons',
	mousewheel: 'dword delta',
	keydown: 'dword keycode, dword scancode',
	keypress: 'dword keycode, dword scancode',
	keyup: 'dword keycode, dword scancode',
	resize: 'dword w, dword h'
};

function isEventType(eventName) {
	return eventName === 'click' || eventName === 'timer';
}


function argsToString(eventName) {
	return EVENT_ARGS[eventName] || '';
}

function collectEvents(element, componentName) {
	const componentDef = get_component_def(element);
	const eventList = componentDef ? componentDef.events : WINDOW_EVENTS;
	const events = [];
	for (const eventName of eventList) {
		const attr = event_attr_name(eventName);
		const code = element.getAttribute(attr);
		if (code !== null) {
			events.push({
				name: componentName,
				event: eventName,
				code: decodeURIComponent(code)
			});
		}
	}
	return events;
}

function generateDrawCode(element, componentName, btnId) {
	const componentDef = get_component_def(element);
	if (!componentDef || componentDef.system) return '';

	const x = parseInt(element.offsetLeft) || 0;
	const y = parseInt(element.offsetTop) || 0;
	const w = parseInt(element.offsetWidth) || 50;
	const h = parseInt(element.offsetHeight) || 25;
	const caption = element.innerText || '';
	const bgColor = element.style.background || '#CCCCCC';
	const hexColor = rgbToHex(bgColor);
	const textColor = componentDef.name === 'Label' ? rgbToHex(element.style.color || '#000000') : '000000';

	switch (componentDef.name) {
		case 'Button':
			return `\tDrawCaptButton(${x}, ${y}, ${w}, ${h}, ${btnId}, 0x${hexColor}, 0x${textColor}, "${caption}");\n`;
		case 'Label':
			return `\tWriteText(${x}, ${y}, 0x80, 0x${textColor}, "${caption}");\n`;
		case 'Edit':
			return `\tDrawBar(${x}, ${y}, ${w}, ${h}, 0xFFFFFF);\n` +
				`\tDrawRectangle3D(${x}, ${y}, ${w}, ${h}, 0xE7E7E7, 0xFFFFFF);\n`;
		case 'Shape':
			return `\tDrawBar(${x}, ${y}, ${w}, ${h}, 0x${hexColor});\n`;
		case 'GroupBox':
			let g = `\tDrawRectangle3D(${x}, ${y}, ${w}, ${h}, 0xCCCCCC, 0xFFFFFF);\n`;
			if (caption) g += `\tWriteText(${x+4}, ${y+2}, 0x80, 0x000000, "${caption}");\n`;
			return g;
		case 'Panel':
			return `\tDrawBar(${x}, ${y}, ${w}, ${h}, 0x${hexColor});\n`;
		default:
			let d = `\tDrawBar(${x}, ${y}, ${w}, ${h}, 0x${hexColor});\n`;
			if (caption) d += `\tWriteText(${x+2}, ${y+2}, 0x80, 0x000000, "${caption}");\n`;
			return d;
	}
}

function generateWindowCode(i, winData, isMain) {
	const wName = win_name(winData) || 'Window_' + (i + 1);
	const s = winData.style || {};
	const winW = parseInt(s.width || '300') - 2;
	const winH = parseInt(s.height || '230') - 2;
	const caption = winData.attrs ? (winData.attrs['data-caption'] || '') : (winData.caption || '');
	const bg = s.background ? rgbToHex(s.background) : 'FFFFFF';
	const drawFunc = 'draw_' + wName;
	const formName = 'Form' + (isMain ? '' : ('' + i));
	const indent = isMain ? '\t' : '\t';

	let drawCode = '';
	let eventFuncs = '';
	let btnCalls = '';
	let keyCalls = '';
	let mouseCalls = '';
	let paintCalls = '';
	let startupCalls = '';
	let unsupported = '';
	let hasKey = false;
	let hasMouse = false;
	let btnId = 99;

	// Window-level events
	if (winData.attrs) {
		const winEvents = collectEvents(win, wName);
		for (const ev of winEvents) {
			const funcName = ev.name + '_' + ev.event;
			const args = argsToString(ev.event);
			eventFuncs += `void ${funcName}(${args})\n{\n${ev.code}\n}\n\n`;
			switch (ev.event) {
				case 'create':
					startupCalls += `${indent}${funcName}();\n`;
					break;
				case 'paint':
					paintCalls += `${indent}${funcName}();\n`;
					break;
				case 'keydown': case 'keypress': case 'keyup':
					hasKey = true;
					keyCalls += `${indent}${funcName}(_key_ascii, _key_scancode);\n`;
					break;
				case 'mousemove': case 'mouseenter': case 'mouseleave':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.x, mouse.y);\n`;
					break;
				case 'mousedown': case 'mouseup':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.x, mouse.y, mouse.lkm | (mouse.pkm << 1) | (mouse.mkm << 2));\n`;
					break;
				case 'mousewheel':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.vert);\n`;
					break;
				default:
					unsupported += `\t// ${funcName}(): '${ev.event}' has no CMM mapping\n`;
			}
		}
	}

	const container = win.children[0];
	const children = container.children;

	for (let j = 0; j < children.length; j++) {
		const element = children[j];
		const componentDef = get_component_def(element);
		if (!componentDef || componentDef.system) continue;

		const componentName = element.getAttribute('data-name');
		const isButton = componentDef.name === 'Button';
		if (isButton) btnId++;

		drawCode += generateDrawCode(element, componentName, btnId);

		const events = collectEvents(element, componentName);
		for (const ev of events) {
			const funcName = ev.name + '_' + ev.event;
			const args = argsToString(ev.event);
			eventFuncs += `void ${funcName}(${args})\n{\n${ev.code}\n}\n\n`;

			switch (ev.event) {
				case 'click':
					hasMouse = true;
					btnCalls += `\t\t\tif (_click_id == ${btnId}) ${funcName}(mouse.x, mouse.y, mouse.lkm | (mouse.pkm << 1) | (mouse.mkm << 2));\n`;
					break;
				case 'mousemove': case 'mouseenter': case 'mouseleave':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.x, mouse.y);\n`;
					break;
				case 'mousedown': case 'mouseup':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.x, mouse.y, mouse.lkm | (mouse.pkm << 1) | (mouse.mkm << 2));\n`;
					break;
				case 'mousewheel':
					hasMouse = true;
					mouseCalls += `${indent}${funcName}(mouse.vert);\n`;
					break;
				case 'keydown': case 'keypress': case 'keyup':
					hasKey = true;
					keyCalls += `${indent}${funcName}(_key_ascii, _key_scancode);\n`;
					break;
				case 'dblclick':
					unsupported += `\t// ${funcName}(): dblclick not supported in CMM\n`;
					break;
				case 'change':
					unsupported += `\t// ${funcName}(): change not directly supported\n`;
					break;
				case 'paint':
					paintCalls += `${indent}${funcName}();\n`;
					break;
				default:
					unsupported += `\t// ${funcName}(): '${ev.event}' has no CMM mapping\n`;
			}
		}
	}

	let evMask = 'EVM_REDRAW + EVM_KEY + EVM_BUTTON';
	if (hasMouse) evMask += ' + EVM_MOUSE';

	let code = '';
	code += `void ${drawFunc}()\n{\n\tsc.get();\n`;
	code += drawCode;
	code += '}\n\n';

	code += eventFuncs;

	if (unsupported) {
		code += '/* Unsupported:\n' + unsupported + '*/\n\n';
	}

	if (isMain) {
		code += 'void main()\n{\n';
		code += startupCalls;

		code += `\t@SetEventMask(${evMask});\n`;
		code += '\tloop() switch(WaitEvent())\n\t{\n';
		code += `\t\tcase evReDraw:\n`;
		code += `\t\t\tDefineAndDrawWindow(100, 50, ${winW}, ${winH}, 0x34, 0x${bg}, "${caption}", 0);\n`;
		code += `\t\t\tGetProcessInfo(#${formName}, SelfInfo);\n`;
		code += `\t\t\tdraw_${wName}();\n`;
		if (paintCalls) code += paintCalls.replace(/\t/g, '\t\t\t');
		code += `\t\t\tbreak;\n`;
		code += `\t\tcase evButton:\n`;
		code += `\t\t\t_click_id = GetButtonID();\n`;
		code += `\t\t\tif (_click_id == 1) @ExitProcess();\n`;
		if (btnCalls) code += `\t\t\tmouse.get();\n`;
		code += btnCalls;
		code += `\t\t\tbreak;\n`;
		if (hasKey) {
			code += `\t\tcase evKey:\n`;
			code += `\t\t\t@GetKeyScancode();\n`;
			code += `\t\t\t_key_ascii = AL;\n`;
			code += `\t\t\t_key_scancode = AH;\n`;
			code += keyCalls.replace(/\t/g, '\t\t\t');
			code += `\t\t\tbreak;\n`;
		}
		if (hasMouse) {
			code += `\t\tcase evMouse:\n`;
			code += `\t\t\tmouse.get();\n`;
			code += mouseCalls.replace(/\t/g, '\t\t\t');
			code += `\t\t\tbreak;\n`;
		}
		code += '\t}\n';
		code += '}\n';
	} else {
		code += `void thread_${wName}()\n{\n`;
		code += `\tdword _click_id, _key_ascii, _key_scancode;\n\n`;
		if (startupCalls) code += startupCalls.replace(/\t/g, '\t') + '\n';
		code += `\t@SetEventMask(${evMask});\n`;
		code += `\tloop() switch(WaitEvent())\n\t{\n`;
		code += `\t\tcase evReDraw:\n`;
		code += `\t\t\tDefineAndDrawWindow(100, 50, ${winW}, ${winH}, 0x34, 0x${bg}, "${caption}", 0);\n`;
		code += `\t\t\tGetProcessInfo(#${formName}, SelfInfo);\n`;
		code += `\t\t\tdraw_${wName}();\n`;
		if (paintCalls) code += paintCalls.replace(/\t/g, '\t\t\t');
		code += `\t\t\tbreak;\n`;
		code += `\t\tcase evButton:\n`;
		code += `\t\t\t_click_id = GetButtonID();\n`;
		code += `\t\t\tif (_click_id == 1) @ExitProcess();\n`;
		if (btnCalls) code += `\t\t\tmouse.get();\n`;
		code += btnCalls;
		code += `\t\t\tbreak;\n`;
		if (hasKey) {
			code += `\t\tcase evKey:\n`;
			code += `\t\t\t@GetKeyScancode();\n`;
			code += `\t\t\t_key_ascii = AL;\n`;
			code += `\t\t\t_key_scancode = AH;\n`;
			code += keyCalls.replace(/\t/g, '\t\t\t');
			code += `\t\t\tbreak;\n`;
		}
		if (hasMouse) {
			code += `\t\tcase evMouse:\n`;
			code += `\t\t\tmouse.get();\n`;
			code += mouseCalls.replace(/\t/g, '\t\t\t');
			code += `\t\t\tbreak;\n`;
		}
		code += '\t}\n';
		code += '}\n\n';
	}

	return { code, formName, drawFunc };
}

function generateCode() {
	save_window_state();

	let allForms = '';
	let threadCalls = '';
	let result = '';

	const windowCount = count_stack;
	const savedIndex = current_win_index;
	const savedHtml = addwinelm.innerHTML;

	for (let i = 0; i < windowCount; i++) {
		const data = window_data[i];
		if (!data) continue;
		applyWindowData(data);

		const isMain = (i === 0);
		const wName = win_name(data) || 'Window_' + (i + 1);
		const gen = generateWindowCode(i, data, isMain);

		if (!isMain) {
			allForms += `proc_info ${gen.formName};\n`;
			threadCalls += `\tdword _th_${wName} = @CreateThread(#thread_${wName}, 4096);\n`;
		}
		result += gen.code;
	}

	let header = `#define MEMSIZE 4096*10\n\n#include "gui.h"\n\nproc_info Form;\n`;
	if (allForms) header += allForms;

	// Inject thread calls into main()
	const mainIdx = result.indexOf('void main()');
	if (mainIdx >= 0 && threadCalls) {
		const braceIdx = result.indexOf('{\n', mainIdx);
		if (braceIdx > 0) {
			const before = result.slice(0, braceIdx + 2);
			const after = result.slice(braceIdx + 2);
			result = before + threadCalls + '\n' + after;
		}
	}

	header += 'dword _click_id, _key_ascii, _key_scancode;\n\n';
	result = header + result;

	addwinelm.innerHTML = savedHtml;
	applyWindowData(window_data[savedIndex]);

	return result;
}

function compile(mode) {
	const code = generateCode();
	if (mode === 1) sendToCompiler(code);
	if (mode === 2) downloadExecutable(code);
}

function showGeneratedCode() {
	const code = generateCode();
	document.getElementById('view_code_text').value = code;
	document.getElementById('window_view_code').style.display = 'flex';
}

function closeCodeViewer() {
	document.getElementById('window_view_code').style.display = 'none';
}

function sendToCompiler(code) {
	set_text_stat_bar('Compiling...');
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/compile.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			try {
				const result = JSON.parse(xhr.responseText);
				if (result.status === 'ok') {
					set_text_stat_bar('Compilation successful!');
				} else {
					set_text_stat_bar('Compilation error');
					alert('Compilation error:\n' + (result.output || 'Unknown error'));
				}
			} catch (e) {
				alert('Compilation error:\n' + xhr.responseText);
				set_text_stat_bar('Compilation error');
			}
		}
	};
	xhr.send('CODE=' + encodeURIComponent(code) + '&MODE=run&NAME=app');
}

function downloadExecutable(code) {
	set_text_stat_bar('Compiling...');
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/save.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) {
			const xhr2 = new XMLHttpRequest();
			xhr2.open('POST', 'api/compile.php', true);
			xhr2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr2.responseType = 'blob';
			xhr2.onreadystatechange = () => {
				if (xhr2.readyState === 4) {
					if (xhr2.status === 200) {
						const blob = xhr2.response;
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = 'app.kex';
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
						set_text_stat_bar('Done: app.kex');
					} else {
						set_text_stat_bar('Compilation error');
					}
				}
			};
			xhr2.send('CODE=' + encodeURIComponent(code) + '&MODE=download&NAME=app');
		}
	};
	xhr.send('CODE=' + encodeURIComponent(code) + '&NAME=app');
}
