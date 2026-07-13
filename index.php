<!DOCTYPE html>
<meta charset="UTF-8">
<link rel="stylesheet" href="style/style.css">
<link rel="stylesheet" href="style/gui.css">
<script src="js/download.js"></script>
<script src="js/serializer.js"></script>
<script src="js/core.js"></script>
<script src="js/compiler.js"></script>
<body onmousedown="element_list.style.display='none';" onmousemove="mouse.getX(event);mouse.getY(event);" onkeydown="window.ee = event;CmdKeyDown(event);">
	<div id="list_add_event" class="list_event">
		<div class="event-item" onmousedown="add_event_list(0);"><img src="img/onclick.png"><span class="title">Клик</span></div>
		<div class="event-item" onmousedown="add_event_list(1);"><img src="img/ondblclick.png"><span class="title">2х Клик</span></div>
	</div>
	<div class="panel" id="TopPanel">
		<div class="toolbar">
			<div class="tool-group">
				<div class="button" onmousedown="compile(1);" title="Скомпилировать и запустить">▶ Запустить</div>
				<div class="button" onmousedown="compile(2);" title="Скомпилировать и скачать .exe">↓ Скачать</div>
			</div>
			<div class="tool-sep"></div>
			<div class="tool-group">
				<a href="" onmousedown="downloadfile(to_source_project(),this);" download="project.kcm" class="button" title="Сохранить проект .kcm">💾 Проект</a>
			</div>
			<div class="tool-sep"></div>
			<div class="tool-group">
				<label class="tool-label">Окно:</label>
				<select class="list_window" id="list_window_add"></select>
			</div>
			<div class="tool-sep"></div>
			<div class="tool-group">
				<label class="tool-label">Сетка:</label>
				<select class="list_window" onchange="change_setka_option(this);">
					<option>Без сетки</option>
					<option selected>5 px</option>
					<option>10 px</option>
					<option>15 px</option>
				</select>
			</div>
		</div>
	</div>
	<div class="mid-layout" id="MidLayout">
		<div class="mid-panel mid-left" id="LeftPanel"><?php include 'element.php'; ?></div>
		<div class="panel-splitter" data-side="left"></div>
		<div class="mid-panel mid-center" id="CenterPanel"><?php include 'main.php'; ?></div>
		<div class="panel-splitter" data-side="right"></div>
		<div class="mid-panel mid-right" id="RightPanel"><?php include 'attr.php'; ?></div>
	</div>
	<div class="statbar" id="text_status_bar"></div>

	<div id="window_edit_code" class="EditCode">
		<div class="code-editor-body">
			<div class="code_title">void onClick(byte key){</div>
			<div class="body_code_conteiner">
				<textarea id="code_edit_rect"></textarea>
			</div>
		</div>
		<div class="table_button_edit_code"><button onclick="save_edit_code();">Ок</button><button onclick="cancel_edit_code();">Отмена</button></div>
	</div>

	<div id="select_elements_rect"></div>
</body>
