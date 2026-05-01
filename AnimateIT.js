/**
 * AnimateIT! for draw.io
 * При выделении линии: поднимает на передний план, делает толще/ярче, включает анимацию.
 * При снятии выделения: возвращает оригинальный стиль.
 * Включить/выключить: Дополнительно → AnimateIT! или Ctrl+Alt+I
 */
Draw.loadPlugin(function(ui) {

    var graph = ui.editor.graph;

    // Состояние плагина
    var enabled = true;

    // Хранилище оригинальных стилей { cellId: originalStyle }
    var originalStyles = {};

    // --- Вспомогательные функции ---

    function applyAnimation(cell) {
        if (!graph.getModel().isEdge(cell)) return;
        var id = cell.getId();
        if (originalStyles[id] !== undefined) return;

        var currentStyle = graph.getModel().getStyle(cell) || '';
        originalStyles[id] = currentStyle;

        var newStyle = currentStyle;
        newStyle = newStyle.replace(/flowAnimation=\d;?/g, '');
        newStyle = newStyle.replace(/strokeWidth=[\d.]+;?/g, '');
        newStyle = newStyle.replace(/strokeColor=[^;]+;?/g, '');
        newStyle = newStyle.replace(/opacity=[\d.]+;?/g, '');
        if (newStyle.length > 0 && newStyle[newStyle.length - 1] !== ';') {
            newStyle += ';';
        }
        newStyle += 'flowAnimation=1;strokeWidth=4;strokeColor=#00FF44;opacity=100;';

        graph.getModel().beginUpdate();
        try {
            graph.getModel().setStyle(cell, newStyle);
            graph.orderCells(false, [cell]);
        } finally {
            graph.getModel().endUpdate();
        }
    }

    function removeAnimation(cell) {
        if (!graph.getModel().isEdge(cell)) return;
        var id = cell.getId();
        if (originalStyles[id] === undefined) return;

        graph.getModel().beginUpdate();
        try {
            graph.getModel().setStyle(cell, originalStyles[id]);
        } finally {
            graph.getModel().endUpdate();
        }
        delete originalStyles[id];
    }

    function removeAllAnimations() {
        Object.keys(originalStyles).forEach(function(id) {
            var cell = graph.getModel().getCell(id);
            if (cell) removeAnimation(cell);
        });
        originalStyles = {};
    }

    function togglePlugin() {
        enabled = !enabled;
        if (!enabled) removeAllAnimations();
    }

    // --- Слушатель выделения ---

    graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt) {
        if (!enabled) return;
        var selected   = evt.getProperty('removed') || [];
        var deselected = evt.getProperty('added')   || [];
        selected.forEach(function(cell) { applyAnimation(cell); });
        deselected.forEach(function(cell) { removeAnimation(cell); });
    });

    // --- Фикс: снимаем анимацию после перемещения линии ---

    graph.addListener(mxEvent.MOVE_CELLS, function(sender, evt) {
        if (!enabled) return;
        var cells = evt.getProperty('cells') || [];
        cells.forEach(function(cell) {
            if (graph.getModel().isEdge(cell)) removeAnimation(cell);
        });
    });

    // --- Горячая клавиша Ctrl+Alt+I через нативный keydown ---
    // bindAction не поддерживает Alt, поэтому вешаем напрямую на контейнер

    mxEvent.addListener(graph.container, 'keydown', function(evt) {
        if (evt.ctrlKey && evt.altKey && !evt.shiftKey && evt.keyCode === 73) {
            togglePlugin();
            mxEvent.consume(evt);
        }
    });

    // --- Кнопка в меню Дополнительно ---

    var origExtrasMenu = ui.menus.get('extras');
    if (origExtrasMenu) {
        var origFunct = origExtrasMenu.funct;
        origExtrasMenu.funct = function(menu, parent) {
            origFunct.apply(this, arguments);
            menu.addSeparator(parent);
            menu.addItem(
                (enabled ? '✅' : '⬜') + ' AnimateIT!  (Ctrl+Alt+I)',
                null,
                function() { togglePlugin(); },
                parent
            );
        };
    }

});
