function load_project_source(code) {
    S.count_stack = 0;
    S.current_win_index = 0;
    S.GLOBAL_INIT_COUNT = 0;
    S.GLOBAL_INIT_ELEMENT = [];

    const mainLayout = getID('main-layout');
    if (!mainLayout) return;
    mainLayout.innerHTML = code;
    S.win = document.getElementById('window-background');
    const tmp = S.addwinelm.onmousedown;
    S.addwinelm = document.getElementById('window-canvas');
    if (S.addwinelm) S.addwinelm.onmousedown = tmp;
    set_element_defunc(S.addwinelm);
    S.window_stack[0] = S.win;
    S.window_data[0] = {
        html: S.addwinelm ? S.addwinelm.innerHTML : '',
        attrs: {
            'data-name': S.win ? S.win.getAttribute('data-name') || 'Window_1' : 'Window_1',
            'data-caption': S.win ? S.win.getAttribute('data-caption') || 'Окно' : 'Окно',
            'data-hide-prop': S.win ? S.win.getAttribute('data-hide-prop') || '' : '',
            'data-align': ''
        },
        style: {
            width: S.win ? S.win.style.width : '300px',
            height: S.win ? S.win.style.height : '230px',
            background: S.win ? S.win.style.background : '#ffffff'
        },
        components: []
    };
    S.GLOBAL_INIT_ELEMENT[S.GLOBAL_INIT_COUNT++] = S.window_data[0].attrs['data-name'];
    S.select_element = null;
    select_element_added(S.win);
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

function get_project_json() {
    save_window_state();
    const data = {
        version: 1,
        windows: [],
        initElements: S.GLOBAL_INIT_ELEMENT
    };
    for (let i = 0; i < S.count_stack; i++) {
        const wd = S.window_data[i];
        if (wd) data.windows.push(wd);
    }
    return JSON.stringify(data, null, '\t');
}

function export_project() {
    save_window_state();
    const json = get_project_json();
    const blob = new Blob([json], {type: 'application/json'});
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
        S.count_stack = 0;
        S.current_win_index = 0;
        S.GLOBAL_INIT_ELEMENT = data.initElements || [];
        S.GLOBAL_INIT_COUNT = S.GLOBAL_INIT_ELEMENT.length;
        S.window_data = {};
        S.window_stack = [];
        for (let i = 0; i < data.windows.length; i++) {
            S.window_data[i] = data.windows[i];
            if (typeof S.window_data[i] === 'object' && !S.window_data[i].attrs) {
                if (!S.window_data[i].name) S.window_data[i].name = 'Window_' + (i + 1);
                S.window_data[i] = upgrade_window_data(S.window_data[i]);
            }
            S.window_stack[i] = null;
            S.count_stack++;
        }
        S.current_win_index = -1;
        switch_window(0);
        S.select_element = null;
        render_props(S.win);
        update_component_tree();
    };
    reader.readAsText(file);
    input.value = '';
}

function switch_window(index) {
    if (index === S.current_win_index) return;
    save_window_state();
    S.current_win_index = index;
    const data = S.window_data[index];
    if (data) {
        S.window_data[index] = upgrade_window_data(data);
        if (S.addwinelm) S.addwinelm.innerHTML = S.window_data[index].html || '';
        const savedAttrs = S.window_data[index].attrs;
        if (S.win) {
            for (let i = S.win.attributes.length - 1; i >= 0; i--) {
                const a = S.win.attributes[i];
                if (a.name.indexOf('data') === 0 && !(a.name in savedAttrs)) {
                    S.win.removeAttribute(a.name);
                }
            }
            for (const key in savedAttrs) {
                if (savedAttrs[key]) S.win.setAttribute(key, savedAttrs[key]);
                else S.win.removeAttribute(key);
            }
        }
        const s = S.window_data[index].style || {};
        if (S.win) {
            S.win.style.width = s.width || '300px';
            S.win.style.height = s.height || '230px';
            S.win.style.background = s.background || '#ffffff';
        }
    } else {
        if (S.addwinelm) S.addwinelm.innerHTML = '';
        if (S.win) {
            for (let i = S.win.attributes.length - 1; i >= 0; i--) {
                const a = S.win.attributes[i];
                if (a.name.indexOf('data') === 0) S.win.removeAttribute(a.name);
            }
            S.win.setAttribute('data-name', 'Window_' + (index + 1));
            S.win.setAttribute('data-caption', 'Окно');
            S.win.style.width = '300px';
            S.win.style.height = '230px';
            S.win.style.background = '#ffffff';
        }
    }
    if (S.addwinelm && S.win) {
        S.addwinelm.style.width = (parseInt(S.win.style.width) - 2) + 'px';
        S.addwinelm.style.height = (parseInt(S.win.style.height) - 2) + 'px';
    }
    set_element_defunc(S.addwinelm);
    S.select_element = null;
    render_props(S.win);
    load_attribute_list_event();
    update_component_tree();
    if (S.win) {
        RrefreshPOS(S.win);
        TrefreshPOS(S.win);
        RTrefreshPOS(S.win);
    }
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