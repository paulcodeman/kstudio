var COMPONENTS = [
	{ name:'Button', typeClass:'button_element_gui', caption:'Кнопка', icon:'img/TBitBtn.png', group:'Главное', defaultText:'Кнопка' },
	{ name:'Label', typeClass:'label_element_gui', caption:'Текст', icon:'img/TLabel.png', group:'Главное', defaultText:'Текст' },
	{ name:'Edit', typeClass:'', caption:'Однострочное поле', icon:'img/TEdit.png', group:'Главное' },
	{ name:'Memo', typeClass:'', caption:'Многострочное поле', icon:'img/TMemo.png', group:'Главное' },
	{ name:'Image', typeClass:'image_element_gui', caption:'Изображение', icon:'img/TImage.png', group:'Главное' },
	{ name:'Shape', typeClass:'shape_element_gui', caption:'Фигура', icon:'img/TShape.png', group:'Главное' },
	{ name:'ProgressBar', typeClass:'', caption:'Прогресс', icon:'img/TProgressBar.png', group:'Главное' },
	{ name:'ScrollBar', typeClass:'', caption:'Панель прокрутки', icon:'img/TScrollBar.png', group:'Дополнительно' },
	{ name:'TrackBar', typeClass:'', caption:'Ползунок', icon:'img/TTrackBar.png', group:'Дополнительно' },
	{ name:'Timer', typeClass:'', caption:'Таймер', icon:'img/TFuncTimer.png', group:'Система', system:true },
	{ name:'DataVar', typeClass:'', caption:'Данные', icon:'img/TDataVar.png', group:'Система', system:true },
	{ name:'Function', typeClass:'', caption:'Функция', icon:'img/TFunction.png', group:'Система', system:true },
	{ name:'SampleDialog', typeClass:'', caption:'Простой диалог', icon:'img/TSampleDialog.png', group:'Диалоги', system:true },
	{ name:'Download', typeClass:'', caption:'Загрузчик файлов', icon:'img/TDownload.png', group:'Интернет', system:true }
];

var list_element_system = COMPONENTS.filter(function(c){return c.system;}).map(function(c){return c.name;});
var class_gui_list_elements = COMPONENTS.filter(function(c){return c.typeClass;}).map(function(c){return c.typeClass;});
