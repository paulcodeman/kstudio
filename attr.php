<div class="conteiner">
	<input type="radio" name="odin" checked="checked" id="vkl1"/><label for="vkl1" onmousedown="return false;">Свойства</label>
	<input type="radio" name="odin" id="vkl2"/><label for="vkl2" onmousedown="return false;">События</label>
	<div>
		<div class="glob_title">Компоненты</div>
		<div class="title"><select class="list"></select></div>
		<div class="attr">
			<table id='attribute_element' style="width:100%;" cellspacing='1' cellpadding='0'>
				<tr><td class="opt_spis"><div id="open_block"></div></td><td class="title_pod" colspan="2">Главное</td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Имя</td><td><input onkeyup="change_value_element('name',this);" onmouseup="this.select();" value="Win1" id="name_window"/></td></tr>
				<tr><td class="opt_spis"></td><td class="title_atr">Заголовок</td><td><input onkeyup="change_value_element('caption',this);" onmouseup="this.select();" id="CaptionElement"/></td></tr>
				<tr><td class="opt_spis"></td><td class="title_atr">Цвет</td><td><input id="color" onchange="change_value_element('color',this);" type="color" value='#FFFFFF'></td></tr>
				<tr id='display_border_color'><td class="opt_spis"></td><td class="title_atr">Цвет рамки</td><td><input id="color_border_element" onchange="change_value_element('image',this);" type="color" value='#FFFFFF' /></td></tr>
				
				<tr id='display_border_color'><td class="opt_spis"></td><td class="title_atr">Картинка</td><td><input onchange="change_value_element('image',this);"/></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Стиль</td>
					<td>
						<select id="style_element" class="list_atr">
							<option value='0'>Плоский</option>
							<option value='1'>Объемный</option>
							<option value='2'>Градиент</option>
							
						</select>
					</td>
				</tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Прилипание</td><td><input class="check_atr" type="checkbox"></td></tr>
				
				<tr><td class="opt_spis"><div id="open_block"></div></td><td class="title_pod" colspan="2">Дополнительно</td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Курсор</td><td>
					<select class="list_atr">
						<option>crDefault</option>
					</select>
				</td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Позиция X</td><td><input onmouseup="this.select();" id='position_x_atr' type='number' /></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Позиция Y</td><td><input onmouseup="this.select();" id='position_y_atr' type='number' /></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Позиция Z</td><td><input onmouseup="this.select();" id='position_y_atr' type='number' /></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Ширина</td><td><input onmouseup="this.select();" id='size_width_atr' type='number' /></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Высота</td><td><input onmouseup="this.select();" id='size_height_atr' type='number' /></td></tr>
				
				<tr><td class="opt_spis"></td><td class="title_atr">Выравнивание</td>
					<td>
						<select id="align_element" class="list_atr">
							<option value='0'>По умолчанию</option>
							<option value='1'>По центру</option>
							
						</select>
					</td>
				</tr>
				
			</table>
		</div>
	</div>
		
	<div>
		<div class="attr">
			<table style="width:100%;" cellspacing=0 cellpadding=0>
				<tr><td colspan="3"><div class="button" id='add_event' onmousedown="return false;"><image src="img/add_list.PNG"></image>Добавить событие</div></td></tr>
				<tr>
					<td><div onmousedown="return false;" onclick="delete_event_list();" class="button"><image id="delete_event" src="img/delete.PNG"></image></div></td>
					<td><div onmousedown="return false;" class="button"><image id="replace_event" src="img/replace_event.PNG"></image></div></td>
					<td><div onmousedown="return false;" onclick="click_edit_code();" class="button" id="edit_event"><image id="img_replace_event" src="img/edit_event.PNG"></image>Редактировать</div></td>
				</tr>
				<tr><td colspan="3">
					<div id="event_cont">
						<table id='list_event'>
						</table>
					</div>
				</td></tr>
			</table>
		</div>
	</div>
</div>