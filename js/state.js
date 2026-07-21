const S = {
    c_code: [],
    c_count: 0,
    grid_distance: 8,

    win: null,
    addwinelm: null,
    select_element: null,
    select_element_rect: null,
    select_element_rect_timer: null,
    sel_rect_x: 0,
    sel_rect_y: 0,
    rect_select_active: false,
    selected_elements_array: [],
    win_x: 0,
    win_y: 0,
    win_w: 0,
    win_h: 0,
    r_size: null,
    int_ptr: null,
    t_size: null,
    rt_size: null,
    dragData: null,
    resizeData: null,
    element_add_event: null,
    element_list: null,
    element_list_event: null,
    tmp_event_data: [],
    context_menu_component: null,
    list_eval_select: null,
    list_element_select: null,
    window_stack: [],
    count_stack: 0,
    element_stack: [],
    count_element_add: {},

    GLOBAL_INIT_ELEMENT: [],
    GLOBAL_INIT_COUNT: 0,
    cmd_sensor: ('ontouchstart' in window),
    global_lock_event: false,
    save_x: 0,
    save_y: 0,
    copy_element_object: [],
    cmd_event_ctrl: false,

    window_data: {},
    current_win_index: 0,

    mouse: {
        x: 0, y: 0,
        getX(e) {
            if (!e) return this.x;
            if (e.pageX !== undefined) {
                this.x = e.pageX;
                return this.x;
            }
            if (e.clientX !== undefined) {
                this.x = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - document.documentElement.clientLeft;
                return this.x;
            }
            return this.x;
        },
        getY(e) {
            if (!e) return this.y;
            if (e.pageY !== undefined) {
                this.y = e.pageY;
                return this.y;
            }
            if (e.clientY !== undefined) {
                this.y = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - document.documentElement.clientTop;
                return this.y;
            }
            return this.y;
        }
    }
};

document.addEventListener('mousemove', e => {
    S.mouse.x = e.pageX !== undefined ? e.pageX : e.clientX;
    S.mouse.y = e.pageY !== undefined ? e.pageY : e.clientY;
}, {passive: true});