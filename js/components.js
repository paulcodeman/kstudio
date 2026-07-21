const WINDOW_PROPS = [
    {section: 'Window'},
    {key: 'data-name', label: 'Name', type: 'text', target: 'attr'},
    {key: 'data-caption', label: 'Caption', type: 'text', target: 'attr'},
    {key: 'color', label: 'Background', type: 'color', target: 'style'}
];

const WINDOW_EVENTS = [
    'create', 'close', 'closequery', 'active', 'deactive',
    'show', 'hide', 'resize', 'paint', 'execute',
    'keydown', 'keypress', 'keyup',
    'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'mousemove', 'mousewheel',
    'formsubmit', 'error'
];

const PROPS = [
    {key: 'data-name', label: 'Name', type: 'text', target: 'attr', group: 'General'},
    {key: 'data-caption', label: 'Caption', type: 'text', target: 'attr', group: 'General'},
    {key: 'color', label: 'Color', type: 'color', target: 'style', group: 'General'},
    {
        key: 'data-align', label: 'Alignment', type: 'select', target: 'attr',
        options: [{v: '0', l: 'No'}, {v: '1', l: 'Yes'}],
        group: 'General'
    },
    {key: 'left', label: 'Position X', type: 'number', target: 'style', group: 'Position'},
    {key: 'top', label: 'Position Y', type: 'number', target: 'style', group: 'Position'},
    {key: 'width', label: 'Width', type: 'number', target: 'style', group: 'Position'},
    {key: 'height', label: 'Height', type: 'number', target: 'style', group: 'Position'},
    {key: 'image', label: 'Image', type: 'text', target: 'src', group: 'Content'},
    {
        key: 'visible', label: 'Visible', type: 'select', target: 'attr',
        options: [{v: '1', l: 'Yes'}, {v: '0', l: 'No'}],
        group: 'Behavior'
    },
    {
        key: 'enabled', label: 'Enabled', type: 'select', target: 'attr',
        options: [{v: '1', l: 'Yes'}, {v: '0', l: 'No'}],
        group: 'Behavior'
    },
    {key: 'hint', label: 'Hint', type: 'text', target: 'attr', group: 'Behavior'}
];

const COMPONENTS = [
    {
        name: 'Button', typeClass: 'gui-button', caption: 'Button',
        icon: 'img/TBitBtn.png', group: 'Standard',
        defaultText: 'Button',
        tag: 'div',
        events: ['click', 'dblclick'],
        props: ['data-name', 'data-caption', 'color', 'data-align', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Label', typeClass: 'gui-label', caption: 'Label',
        icon: 'img/TLabel.png', group: 'Standard',
        defaultText: 'Label',
        events: ['click', 'dblclick'],
        props: ['data-name', {
            key: 'color', label: 'Text Color', type: 'color', target: 'style'
        }, 'data-align', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Edit', typeClass: '', caption: 'Edit Box',
        icon: 'img/TEdit.png', group: 'Standard',
        events: ['click', 'dblclick', 'change'],
        props: ['data-name', {
            key: 'data-caption', label: 'Text', type: 'text', target: 'attr'
        }, 'color', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Memo', typeClass: '', caption: 'Memo',
        icon: 'img/TMemo.png', group: 'Standard',
        events: ['click', 'dblclick', 'change'],
        props: ['data-name', {
            key: 'data-caption', label: 'Text', type: 'text', target: 'attr'
        }, 'color', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Image', typeClass: 'gui-image', caption: 'Image',
        icon: 'img/TImage.png', group: 'Standard',
        events: ['click', 'dblclick'],
        props: ['data-name', 'image', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Shape', typeClass: 'gui-shape', caption: 'Shape',
        icon: 'img/TShape.png', group: 'Standard',
        events: ['click', 'dblclick'],
        props: ['data-name', 'color', 'left', 'top', 'width', 'height']
    },
    {
        name: 'ProgressBar', typeClass: '', caption: 'Progress',
        icon: 'img/TProgressBar.png', group: 'Standard',
        events: ['click'],
        props: ['data-name', {
            key: 'color', label: 'Color', type: 'color', target: 'style'
        }, 'left', 'top', 'width', 'height']
    },
    {
        name: 'GroupBox', typeClass: 'gui-groupbox', caption: 'Group',
        icon: 'img/TGroupBox.png', group: 'Containers',
        events: ['click', 'dblclick', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup'],
        props: ['data-name', 'data-caption', 'color', 'visible', 'enabled', 'hint', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Panel', typeClass: 'gui-panel', caption: 'Panel',
        icon: 'img/TPanel.png', group: 'Containers',
        events: ['click', 'dblclick', 'mouseenter', 'mouseleave'],
        props: ['data-name', 'color', 'visible', 'enabled', 'left', 'top', 'width', 'height']
    },
    {
        name: 'ScrollBox', typeClass: 'gui-scrollbox', caption: 'ScrollBox',
        icon: 'img/TScrollBox.png', group: 'Containers',
        events: ['click', 'dblclick', 'scroll', 'mouseenter', 'mouseleave'],
        props: ['data-name', 'visible', 'enabled', 'left', 'top', 'width', 'height']
    },
    {
        name: 'ScrollBar', typeClass: '', caption: 'ScrollBar',
        icon: 'img/TScrollBar.png', group: 'Misc',
        events: ['click', 'change'],
        props: ['data-name', {
            key: 'color', label: 'Color', type: 'color', target: 'style'
        }, 'left', 'top', 'width', 'height']
    },
    {
        name: 'TrackBar', typeClass: '', caption: 'TrackBar',
        icon: 'img/TTrackBar.png', group: 'Misc',
        events: ['click', 'change'],
        props: ['data-name', {
            key: 'color', label: 'Color', type: 'color', target: 'style'
        }, 'left', 'top', 'width', 'height']
    },
    {
        name: 'WebBrowserEx', typeClass: 'gui-browser', caption: 'WebBrowser',
        icon: 'img/TWebBrowserEx.png', group: 'Misc',
        events: ['execute', 'closequery', 'create', 'hide', 'show', 'resize', 'paint', 'error', 'formsubmit'],
        props: ['data-name', 'visible', 'enabled', 'left', 'top', 'width', 'height']
    },
    {
        name: 'Timer', typeClass: '', caption: 'Timer',
        icon: 'img/TFuncTimer.png', group: 'System', system: true,
        events: ['timer'],
        props: ['data-name']
    },
    {
        name: 'DataVar', typeClass: '', caption: 'DataVar',
        icon: 'img/TDataVar.png', group: 'System', system: true,
        events: [],
        props: ['data-name']
    },
    {
        name: 'Function', typeClass: '', caption: 'Function',
        icon: 'img/TFunction.png', group: 'System', system: true,
        events: [],
        props: ['data-name']
    },
    {
        name: 'Cursor', typeClass: '', caption: 'Cursor',
        icon: 'img/TCursor.png', group: 'System', system: true,
        events: [],
        props: ['data-name']
    },
    {
        name: 'SampleDialog', typeClass: '', caption: 'SampleDialog',
        icon: 'img/TSampleDialog.png', group: 'System', system: true,
        events: [],
        props: ['data-name']
    },
    {
        name: 'Download', typeClass: '', caption: 'Download',
        icon: 'img/TDownload.png', group: 'Network', system: true,
        events: [],
        props: ['data-name']
    },
    {
        name: 'HttpClient', typeClass: '', caption: 'HTTP Client',
        icon: 'img/THttpClient.png', group: 'Network', system: true,
        events: ['error', 'execute'],
        props: ['data-name']
    }
];

const EVENTS = [
    {name: 'click', label: 'Click', icon: 'img/onclick.png'},
    {name: 'dblclick', label: 'Double Click', icon: 'img/ondblclick.png'},
    {name: 'change', label: 'Change', icon: '24/onchange.png'},
    {name: 'timer', label: 'Timer', icon: '24/ontimer.bmp'},
    {name: 'execute', label: 'Execute', icon: '24/onexecute.bmp'},
    {name: 'active', label: 'Active', icon: '24/onactive.bmp'},
    {name: 'deactive', label: 'Deactive', icon: '24/ondeactive.bmp'},
    {name: 'close', label: 'Close', icon: '24/onclose.bmp'},
    {name: 'closequery', label: 'Close Query', icon: '24/onclosequery.bmp'},
    {name: 'create', label: 'Create', icon: '24/oncreate.bmp'},
    {name: 'hide', label: 'Hide', icon: '24/onhide.bmp'},
    {name: 'show', label: 'Show', icon: '24/onshow.bmp'},
    {name: 'resize', label: 'Resize', icon: '24/onresize.bmp'},
    {name: 'paint', label: 'Paint', icon: '24/onpaint.bmp'},
    {name: 'mouseenter', label: 'Mouse Enter', icon: '24/onmouseenter.bmp'},
    {name: 'mouseleave', label: 'Mouse Leave', icon: '24/onmouseleave.bmp'},
    {name: 'keydown', label: 'Key Down', icon: '24/onkeydown.bmp'},
    {name: 'keypress', label: 'Key Press', icon: '24/onkeypress.bmp'},
    {name: 'keyup', label: 'Key Up', icon: '24/onkeyup.bmp'},
    {name: 'scroll', label: 'Scroll', icon: '24/onscroll.bmp'},
    {name: 'select', label: 'Select', icon: '24/onselect.bmp'},
    {name: 'selectdialog', label: 'Select Dialog', icon: '24/onselectdialog.bmp'},
    {name: 'starttrack', label: 'Start Track', icon: '24/onstarttrack.bmp'},
    {name: 'endtrack', label: 'End Track', icon: '24/onendtrack.bmp'},
    {name: 'hotspotclick', label: 'Hotspot Click', icon: '24/onhotspotclick.bmp'},
    {name: 'hotspotcovered', label: 'Hotspot Covered', icon: '24/onhotspotcovered.bmp'},
    {name: 'mousewheel', label: 'Mouse Wheel', icon: '24/omousewheel.bmp'},
    {name: 'formsubmit', label: 'Form Submit', icon: '24/onformsubmit.png'},
    {name: 'mousedown', label: 'Mouse Down', icon: '24/mousedown.bmp'},
    {name: 'mouseup', label: 'Mouse Up', icon: '24/mouseup.bmp'},
    {name: 'mousemove', label: 'Mouse Move', icon: '24/mousemove.bmp'},
    {name: 'error', label: 'Error', icon: '24/error.png'}
];

const SYSTEM_COMPONENT_NAMES = new Set(
    COMPONENTS.filter(c => c.system).map(c => c.name)
);

const GUI_CLASSES = new Set(
    COMPONENTS.filter(c => c.typeClass).map(c => c.typeClass)
);

function getComponentDef(name) {
    return COMPONENTS.find(c => c.name === name);
}

function getEventDef(name) {
    return EVENTS.find(e => e.name === name);
}

function eventAttrName(eventName) {
    return 'data-' + eventName;
}