const WINDOW_PROPS = [
	{section: 'Главное'},
	{key: 'data-name', label: 'Имя окна', type: 'text', target: 'attr'},
	{key: 'data-caption', label: 'Заголовок', type: 'text', target: 'attr'},
	{key: 'color', label: 'Цвет фона', type: 'color', target: 'style'}
];

const WINDOW_EVENTS = ['create', 'close', 'closequery', 'active', 'deactive', 'show', 'hide', 'resize', 'paint', 'execute', 'keydown', 'keypress', 'keyup', 'mouseenter', 'mouseleave'];

const PROPS = [
	{key: 'data-name', label: 'Имя', type: 'text', target: 'attr', group: 'Главное'},
	{key: 'data-caption', label: 'Заголовок', type: 'text', target: 'attr', group: 'Главное'},
	{key: 'color', label: 'Цвет фона', type: 'color', target: 'style', group: 'Главное'},
	{
		key: 'data-align',
		label: 'Выравнивание',
		type: 'select',
		target: 'attr',
		options: [{v: '0', l: 'По умолчанию'}, {v: '1', l: 'По центру'}],
		group: 'Главное'
	},
	{key: 'left', label: 'Позиция X', type: 'number', target: 'style', group: 'Положение'},
	{key: 'top', label: 'Позиция Y', type: 'number', target: 'style', group: 'Положение'},
	{key: 'width', label: 'Ширина', type: 'number', target: 'style', group: 'Положение'},
	{key: 'height', label: 'Высота', type: 'number', target: 'style', group: 'Положение'},
	{key: 'image', label: 'Картинка', type: 'text', target: 'src', group: 'Главное'}
];

const COMPONENTS = [
	{
		name: 'Button',
		typeClass: 'button_element_gui',
		caption: 'Кнопка',
		icon: 'img/TBitBtn.png',
		group: 'Главное',
		defaultText: 'Кнопка',
		tag: 'div',
		events: ['click', 'dblclick'],
		props: ['data-name', 'data-caption', 'color', 'data-align', 'left', 'top', 'width', 'height']
	},
	{
		name: 'Label',
		typeClass: 'label_element_gui',
		caption: 'Текст',
		icon: 'img/TLabel.png',
		group: 'Главное',
		defaultText: 'Текст',
		events: ['click', 'dblclick'],
		props: ['data-name', {
			key: 'color',
			label: 'Цвет текста',
			type: 'color',
			target: 'style'
		}, 'data-align', 'left', 'top', 'width', 'height']
	},
	{
		name: 'Edit', typeClass: '', caption: 'Однострочное поле', icon: 'img/TEdit.png', group: 'Главное',
		events: ['click', 'dblclick', 'change'],
		props: ['data-name', {
			key: 'data-caption',
			label: 'Текст',
			type: 'text',
			target: 'attr'
		}, 'color', 'left', 'top', 'width', 'height']
	},
	{
		name: 'Memo', typeClass: '', caption: 'Многострочное поле', icon: 'img/TMemo.png', group: 'Главное',
		events: ['click', 'dblclick', 'change'],
		props: ['data-name', {
			key: 'data-caption',
			label: 'Текст',
			type: 'text',
			target: 'attr'
		}, 'color', 'left', 'top', 'width', 'height']
	},
	{
		name: 'Image', typeClass: 'image_element_gui', caption: 'Изображение', icon: 'img/TImage.png', group: 'Главное',
		events: ['click', 'dblclick'],
		props: ['data-name', 'image', 'left', 'top', 'width', 'height']
	},
	{
		name: 'Shape', typeClass: 'shape_element_gui', caption: 'Фигура', icon: 'img/TShape.png', group: 'Главное',
		events: ['click', 'dblclick'],
		props: ['data-name', 'color', 'left', 'top', 'width', 'height']
	},
	{
		name: 'ProgressBar', typeClass: '', caption: 'Прогресс', icon: 'img/TProgressBar.png', group: 'Главное',
		events: ['click'],
		props: ['data-name', {
			key: 'color',
			label: 'Цвет',
			type: 'color',
			target: 'style'
		}, 'left', 'top', 'width', 'height']
	},
	{
		name: 'ScrollBar',
		typeClass: '',
		caption: 'Панель прокрутки',
		icon: 'img/TScrollBar.png',
		group: 'Дополнительно',
		events: ['click', 'change'],
		props: ['data-name', {
			key: 'color',
			label: 'Цвет',
			type: 'color',
			target: 'style'
		}, 'left', 'top', 'width', 'height']
	},
	{
		name: 'TrackBar', typeClass: '', caption: 'Ползунок', icon: 'img/TTrackBar.png', group: 'Дополнительно',
		events: ['click', 'change'],
		props: ['data-name', {
			key: 'color',
			label: 'Цвет',
			type: 'color',
			target: 'style'
		}, 'left', 'top', 'width', 'height']
	},
	{
		name: 'Timer', typeClass: '', caption: 'Таймер', icon: 'img/TFuncTimer.png', group: 'Система', system: true,
		events: ['timer'],
		props: ['data-name']
	},
	{
		name: 'DataVar', typeClass: '', caption: 'Данные', icon: 'img/TDataVar.png', group: 'Система', system: true,
		events: [],
		props: ['data-name']
	},
	{
		name: 'Function', typeClass: '', caption: 'Функция', icon: 'img/TFunction.png', group: 'Система', system: true,
		events: [],
		props: ['data-name']
	},
	{
		name: 'SampleDialog',
		typeClass: '',
		caption: 'Простой диалог',
		icon: 'img/TSampleDialog.png',
		group: 'Диалоги',
		system: true,
		events: [],
		props: ['data-name']
	},
	{
		name: 'Download',
		typeClass: '',
		caption: 'Загрузчик файлов',
		icon: 'img/TDownload.png',
		group: 'Интернет',
		system: true,
		events: [],
		props: ['data-name']
	}
];

const EVENTS = [
	{name: 'click', label: 'Клик', icon: 'img/onclick.png'},
	{name: 'dblclick', label: 'Двойной клик', icon: 'img/ondblclick.png'},
	{name: 'change', label: 'Изменение', icon: '24/onchange.png'},
	{name: 'timer', label: 'Таймер', icon: '24/ontimer.bmp'},
	{name: 'execute', label: 'Выполнение', icon: '24/onexecute.bmp'},
	{name: 'active', label: 'Активация', icon: '24/onactive.bmp'},
	{name: 'deactive', label: 'Деактивация', icon: '24/ondeactive.bmp'},
	{name: 'close', label: 'Закрытие', icon: '24/onclose.bmp'},
	{name: 'closequery', label: 'Запрос закрытия', icon: '24/onclosequery.bmp'},
	{name: 'create', label: 'Создание', icon: '24/oncreate.bmp'},
	{name: 'hide', label: 'Скрытие', icon: '24/onhide.bmp'},
	{name: 'show', label: 'Показ', icon: '24/onshow.bmp'},
	{name: 'resize', label: 'Изменение размера', icon: '24/onresize.bmp'},
	{name: 'paint', label: 'Перерисовка', icon: '24/onpaint.bmp'},
	{name: 'mouseenter', label: 'Вход мыши', icon: '24/onmouseenter.bmp'},
	{name: 'mouseleave', label: 'Выход мыши', icon: '24/onmouseleave.bmp'},
	{name: 'keydown', label: 'Клавиша нажата', icon: '24/onkeydown.bmp'},
	{name: 'keypress', label: 'Клавиша зажата', icon: '24/onkeypress.bmp'},
	{name: 'keyup', label: 'Клавиша отпущена', icon: '24/onkeyup.bmp'},
	{name: 'scroll', label: 'Прокрутка', icon: '24/onscroll.bmp'},
	{name: 'select', label: 'Выбор', icon: '24/onselect.bmp'},
	{name: 'selectdialog', label: 'Выбор диалога', icon: '24/onselectdialog.bmp'},
	{name: 'starttrack', label: 'Начало трека', icon: '24/onstarttrack.bmp'},
	{name: 'endtrack', label: 'Конец трека', icon: '24/onendtrack.bmp'},
	{name: 'hotspotclick', label: 'Клик по hotspot', icon: '24/onhotspotclick.bmp'},
	{name: 'hotspotcovered', label: 'Наведение на hotspot', icon: '24/onhotspotcovered.bmp'}
];

const list_element_system = COMPONENTS.filter(function (c) {
	return c.system;
}).map(function (c) {
	return c.name;
});
const class_gui_list_elements = COMPONENTS.filter(function(c){return c.typeClass;}).map(function(c){return c.typeClass;});