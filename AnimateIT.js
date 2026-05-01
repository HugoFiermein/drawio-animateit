/**
 * AnimateIT! for draw.io
 *
 * Highlights selected connectors with flow animation, temporarily brings them
 * to the front, and restores their original style and layer order on deselect.
 */
Draw.loadPlugin(function(ui) {
    var graph = ui.editor.graph;
    var enabled = true;
    var originalStyles = {};
    var originalOrders = {};

    function applyAnimation(cell) {
        if (!graph.getModel().isEdge(cell)) return;

        var model = graph.getModel();
        var id = cell.getId();
        if (originalStyles[id] !== undefined) return;

        var currentStyle = model.getStyle(cell) || '';
        originalStyles[id] = currentStyle;

        var parent = model.getParent(cell);
        originalOrders[id] = {
            parent: parent,
            index: parent ? parent.getIndex(cell) : -1
        };

        var newStyle = mxUtils.setStyle(currentStyle, 'flowAnimation', '1');
        newStyle = mxUtils.setStyle(newStyle, 'strokeWidth', '4');
        newStyle = mxUtils.setStyle(newStyle, 'strokeColor', '#00FF44');
        newStyle = mxUtils.setStyle(newStyle, 'opacity', '100');

        model.beginUpdate();
        try {
            model.setStyle(cell, newStyle);
            graph.orderCells(false, [cell]);
        } finally {
            model.endUpdate();
        }
    }

    function removeAnimation(cell) {
        if (!graph.getModel().isEdge(cell)) return;

        var model = graph.getModel();
        var id = cell.getId();
        if (originalStyles[id] === undefined) return;

        model.beginUpdate();
        try {
            model.setStyle(cell, originalStyles[id]);

            var order = originalOrders[id];
            if (order && order.parent && model.getParent(cell) === order.parent) {
                var maxIndex = Math.max(0, model.getChildCount(order.parent) - 1);
                model.add(order.parent, cell, Math.min(order.index, maxIndex));
            }
        } finally {
            model.endUpdate();
        }

        delete originalStyles[id];
        delete originalOrders[id];
    }

    function removeAllAnimations() {
        Object.keys(originalStyles).forEach(function(id) {
            var cell = graph.getModel().getCell(id);
            if (cell) removeAnimation(cell);
        });

        originalStyles = {};
        originalOrders = {};
    }

    function togglePlugin() {
        enabled = !enabled;
        if (!enabled) removeAllAnimations();
    }

    graph.getSelectionModel().addListener(mxEvent.CHANGE, function(sender, evt) {
        if (!enabled) return;

        // mxGraphSelectionModel keeps these event property names inverted for compatibility.
        var selected = evt.getProperty('removed') || [];
        var deselected = evt.getProperty('added') || [];

        selected.forEach(function(cell) { applyAnimation(cell); });
        deselected.forEach(function(cell) { removeAnimation(cell); });
    });

    graph.addListener(mxEvent.MOVE_CELLS, function(sender, evt) {
        if (!enabled) return;

        var cells = evt.getProperty('cells') || [];
        cells.forEach(function(cell) {
            if (graph.getModel().isEdge(cell)) removeAnimation(cell);
        });
    });

    mxEvent.addListener(graph.container, 'keydown', function(evt) {
        if (evt.ctrlKey && evt.altKey && !evt.shiftKey && evt.keyCode === 73) {
            togglePlugin();
            mxEvent.consume(evt);
        }
    });

    var origExtrasMenu = ui.menus.get('extras');
    if (origExtrasMenu) {
        var origFunct = origExtrasMenu.funct;
        origExtrasMenu.funct = function(menu, parent) {
            origFunct.apply(this, arguments);
            menu.addSeparator(parent);
            menu.addItem(
                (enabled ? 'ON' : 'OFF') + ' AnimateIT! (Ctrl+Alt+I)',
                null,
                function() { togglePlugin(); },
                parent
            );
        };
    }
});
