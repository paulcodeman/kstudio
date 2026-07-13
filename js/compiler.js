let componentDeclarations = [];
let imageResources = {};
let eventHandlerCode = '';
let eventHandlerId = 0;

const PROPERTY_FORMATS = {
	left:   { method: 'left',   format: 'int' },
	top:    { method: 'top',    format: 'int' },
	width:  { method: 'width',  format: 'int' },
	height: { method: 'height', format: 'int' },
	color:  { method: 'color',  format: 'hexColor' },
	image:  { method: 'image',  format: 'imageSource' },
};

function getComponentProps(componentDef) {
	if (!componentDef || !componentDef.props) return [];
	const result = [];
	for (const prop of componentDef.props) {
		if (typeof prop === 'string') {
			const found = get_prop_def(prop);
			if (found) result.push(found);
		} else {
			result.push(prop);
		}
	}
	return result;
}

function readPropertyValue(element, prop) {
	switch (prop.key) {
		case 'color':
			return element.className === 'label_element_gui' && element.style.color
				? element.style.color : element.style.background;
		case 'left':
			return element.style.left ? '' + parseInt(element.offsetLeft) : '';
		case 'top':
			return element.style.top ? '' + parseInt(element.offsetTop) : '';
		case 'width':
		case 'height':
			return '' + parseInt(element['offset' + prop.key[0].toUpperCase() + prop.key.slice(1)]);
		default:
			if (prop.target === 'attr') return element.getAttribute(prop.key) || '';
			if (prop.target === 'src') return element.src || '';
			if (prop.target === 'style') return element.style[prop.key] || '';
			return '';
	}
}

function formatPropertyValue(method, format, value) {
	switch (format) {
		case 'int':        return method + '(' + parseInt(value) + ');';
		case 'string':     return method + '("' + value + '");';
		case 'hexColor':   return method + '(0x' + eval(value) + ');';
		case 'imageSource': return '';
		default:           return method + '(' + value + ');';
	}
}

function convertElements(windowElement) {
	const container = windowElement.children[0];
	const children = container.children;
	let code = '';
	const windowName = windowElement.getAttribute('data-name');

	imageResources = {};

	for (let i = children.length - 1; i >= 0; i--) {
		const element = children[i];
		const componentDef = get_component_def(element);
		if (!componentDef) continue;

		const typeIndex = class_gui_list_elements.indexOf(componentDef.typeClass);
		if (typeIndex === -1) continue;

		const componentName = element.getAttribute('data-name');
		componentDeclarations.push(componentName);
		code += windowName + '.adds(#' + componentName + ',' + typeIndex + ');';

		const isImage = componentDef.props.indexOf('image') !== -1;
		const props = getComponentProps(componentDef);

		for (const prop of props) {
			if (prop.key === 'data-name') continue;
			const propFormat = PROPERTY_FORMATS[prop.key];
			if (!propFormat) continue;

			if ((prop.key === 'width' || prop.key === 'height') && !isImage && !element.style[prop.key]) continue;

			const value = readPropertyValue(element, prop);
			if (!value) continue;

			if (prop.key === 'image') {
				if (value !== 'img/TImage.png') {
					code += componentName + '.image(#' + componentName + '_img_src_data_);';
					imageResources[componentName + '_img_src_data_'] = value;
				}
				continue;
			}

			code += componentName + '.' + formatPropertyValue(propFormat.method, propFormat.format, value);
		}

		const borderColor = element.style.borderColor;
		if (borderColor) code += componentName + '.bordercolor(' + borderColor + ');';

		const captionText = element.innerText;
		if (captionText) code += componentName + '.caption("' + captionText + '");';

		const events = get_component_events(element);
		for (const eventName of events) {
			const eventAttr = event_attr_name(eventName);
			const eventCode = element.getAttribute(eventAttr);
			if (eventCode !== null) {
				const handlerId = '_ev' + (eventHandlerId++);
				code += componentName + '.' + eventName + '(#' + componentName + handlerId + '_);';
				eventHandlerCode += 'void ' + componentName + handlerId + '_(dword key,x,y){' + decodeURIComponent(eventCode) + '}';
			}
		}
	}
	return code;
}

function applyWindowData(data) {
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
	win.style.width = s.width || data.width || '300px';
	win.style.height = s.height || data.height || '230px';
	win.style.background = s.background || data.bg || '#ffffff';
	addwinelm.style.width = parseInt(win.style.width) - 2;
	addwinelm.style.height = parseInt(win.style.height) - 2;
	set_element_defunc(addwinelm);
}

function generateCode() {
	componentDeclarations = [];
	eventHandlerCode = '';
	eventHandlerId = 0;

	save_window_state();

	const codeParts = [];
	const windowCount = count_stack;

	codeParts.push('window ' + GLOBAL_INIT_ELEMENT.join(',') + ';');

	const guiDeclIndex = codeParts.length;
	codeParts.push('');

	const imgDeclIndex = codeParts.length;
	codeParts.push('');

	let mainCode = '';
	const savedIndex = current_win_index;
	const savedHtml = addwinelm.innerHTML;

	for (let i = 0; i < windowCount; i++) {
		const data = window_data[i];
		if (!data) continue;

		applyWindowData(data);

		const name = data.attrs ? (data.attrs['data-name'] || 'Window') : (data.name || 'Window');
		const s = data.style || {};
		const windowWidth = parseInt(s.width || data.width || '300') - 2;
		const windowHeight = parseInt(s.height || data.height || '230') - 2;
		const caption = data.attrs ? (data.attrs['data-caption'] || '') : (data.caption || '');
		const align = data.attrs ? (data.attrs['data-align'] || '') : (data.align || '');

		mainCode += name + '.prepare();';
		mainCode += name + '.width(' + windowWidth + ');';
		mainCode += name + '.height(' + windowHeight + ');';
		mainCode += name + '.caption("' + caption + '");';
		mainCode += name + '.color(0x' + eval(window.getComputedStyle(win).backgroundColor) + ');';
		if (align === '1') mainCode += name + '.StartPosition(' + align + ');';
		mainCode += convertElements(win);
		mainCode += name + '.create();';
	}

	addwinelm.innerHTML = savedHtml;
	applyWindowData(window_data[savedIndex]);

	if (componentDeclarations.length) {
		codeParts[guiDeclIndex] = 'gui ' + componentDeclarations.join(',') + ';';
	}

	const imageKeys = Object.keys(imageResources);
	if (imageKeys.length) {
		let imgPart = '';
		for (const key of imageKeys) {
			imgPart += key + '=@img"' + imageResources[key] + '"';
		}
		codeParts[imgDeclIndex] = 'dword ' + imgPart + ';';
	}

	if (eventHandlerCode) codeParts.push(eventHandlerCode);
	codeParts.push('void main(){');
	codeParts.push(mainCode);
	codeParts.push('}');

	return codeParts.join('');
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
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://127.0.0.1/CMM_SERVER/server/compile.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('CODE=' + encodeURIComponent(code));
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4 && xhr.responseText !== 'okey') alert(xhr.responseText);
	};
}

function downloadExecutable(code) {
	const xhr = new XMLHttpRequest();
	xhr.open('POST', 'api/save.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.send('CODE=' + encodeURIComponent(code));
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) document.location.href = 'api/compile.php';
	};
}
