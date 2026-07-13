var WINDOW_PROPS = [
	{ section:'Главное' },
	{ key:'data-name', label:'Имя окна', type:'text', target:'attr' },
	{ key:'data-caption', label:'Заголовок', type:'text', target:'attr' },
	{ key:'color', label:'Цвет фона', type:'color', target:'style' }
];

var COMPONENTS = [
	{ name:'Button', typeClass:'button_element_gui', caption:'Кнопка', icon:'img/TBitBtn.png', group:'Главное', defaultText:'Кнопка',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'data-caption', label:'Заголовок', type:'text', target:'attr' },
			{ key:'color', label:'Цвет фона', type:'color', target:'style' },
			{ key:'data-align', label:'Выравнивание', type:'select', target:'attr', options:[{v:'0',l:'По умолчанию'},{v:'1',l:'По центру'}] },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Label', typeClass:'label_element_gui', caption:'Текст', icon:'img/TLabel.png', group:'Главное', defaultText:'Текст',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'color', label:'Цвет текста', type:'color', target:'style' },
			{ key:'data-align', label:'Выравнивание', type:'select', target:'attr', options:[{v:'0',l:'По умолчанию'},{v:'1',l:'По центру'}] },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Edit', typeClass:'', caption:'Однострочное поле', icon:'img/TEdit.png', group:'Главное',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'data-caption', label:'Текст', type:'text', target:'attr' },
			{ key:'color', label:'Цвет фона', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Memo', typeClass:'', caption:'Многострочное поле', icon:'img/TMemo.png', group:'Главное',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'data-caption', label:'Текст', type:'text', target:'attr' },
			{ key:'color', label:'Цвет фона', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Image', typeClass:'image_element_gui', caption:'Изображение', icon:'img/TImage.png', group:'Главное',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'image', label:'Картинка', type:'text', target:'src' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Shape', typeClass:'shape_element_gui', caption:'Фигура', icon:'img/TShape.png', group:'Главное',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'color', label:'Цвет фона', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'ProgressBar', typeClass:'', caption:'Прогресс', icon:'img/TProgressBar.png', group:'Главное',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'color', label:'Цвет', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'ScrollBar', typeClass:'', caption:'Панель прокрутки', icon:'img/TScrollBar.png', group:'Дополнительно',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'color', label:'Цвет', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'TrackBar', typeClass:'', caption:'Ползунок', icon:'img/TTrackBar.png', group:'Дополнительно',
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' },
			{ key:'color', label:'Цвет', type:'color', target:'style' },
			{ section:'Положение' },
			{ key:'left', label:'Позиция X', type:'number', target:'style' },
			{ key:'top', label:'Позиция Y', type:'number', target:'style' },
			{ key:'width', label:'Ширина', type:'number', target:'style' },
			{ key:'height', label:'Высота', type:'number', target:'style' }
		]
	},
	{ name:'Timer', typeClass:'', caption:'Таймер', icon:'img/TFuncTimer.png', group:'Система', system:true,
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' }
		]
	},
	{ name:'DataVar', typeClass:'', caption:'Данные', icon:'img/TDataVar.png', group:'Система', system:true,
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' }
		]
	},
	{ name:'Function', typeClass:'', caption:'Функция', icon:'img/TFunction.png', group:'Система', system:true,
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' }
		]
	},
	{ name:'SampleDialog', typeClass:'', caption:'Простой диалог', icon:'img/TSampleDialog.png', group:'Диалоги', system:true,
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' }
		]
	},
	{ name:'Download', typeClass:'', caption:'Загрузчик файлов', icon:'img/TDownload.png', group:'Интернет', system:true,
		props:[
			{ section:'Главное' },
			{ key:'data-name', label:'Имя', type:'text', target:'attr' }
		]
	}
];

var list_element_system = COMPONENTS.filter(function(c){return c.system;}).map(function(c){return c.name;});
var class_gui_list_elements = COMPONENTS.filter(function(c){return c.typeClass;}).map(function(c){return c.typeClass;});
