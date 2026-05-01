// ==UserScript==
// @name         AnimateIT! for draw.io
// @namespace    https://github.com/HugoFiermein/drawio-animateit
// @version      1.3.0
// @description  Animate selected connectors in draw.io / diagrams.net.
// @match        https://app.diagrams.net/*
// @match        https://diagrams.net/*
// @match        https://www.diagrams.net/*
// @match        https://*.diagrams.net/*
// @match        https://draw.io/*
// @match        https://www.draw.io/*
// @match        https://*.draw.io/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    var page = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    var attempts = 0;
    var maxAttempts = 180;

    page.__AnimateITStatus = {
        started: true,
        ready: false,
        attempts: 0,
        message: 'Userscript started',
        href: page.location.href
    };

    function log(message) {
        page.__AnimateITStatus.message = message;
        console.log('[AnimateIT] ' + message);
    }

    function fail(message) {
        page.__AnimateITStatus.message = message;
        console.error('[AnimateIT] ' + message);
    }

    log('Userscript started on ' + page.location.href);

    function waitForDraw() {
        attempts++;
        page.__AnimateITStatus.attempts = attempts;

        if (page.Draw && typeof page.Draw.loadPlugin === 'function') {
            log('Draw.loadPlugin found after attempt ' + attempts);
            registerPlugin();
            return;
        }

        if (attempts >= maxAttempts) {
            fail('Timeout: Draw.loadPlugin was not found');
            return;
        }

        setTimeout(waitForDraw, 500);
    }

    function registerPlugin() {
        page.Draw.loadPlugin(function(ui) {
            if (!ui || !ui.editor || !ui.editor.graph) {
                fail('Plugin callback fired, but ui.editor.graph is missing');
                return;
            }

            log('Plugin callback fired, attaching listeners');

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

                var newStyle = page.mxUtils.setStyle(currentStyle, 'flowAnimation', '1');
                newStyle = page.mxUtils.setStyle(newStyle, 'strokeWidth', '4');
                newStyle = page.mxUtils.setStyle(newStyle, 'strokeColor', '#00FF44');
                newStyle = page.mxUtils.setStyle(newStyle, 'opacity', '100');

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
                log(enabled ? 'Enabled' : 'Disabled');
            }

            graph.getSelectionModel().addListener(page.mxEvent.CHANGE, function(sender, evt) {
                if (!enabled) return;

                // mxGraphSelectionModel keeps these event property names inverted for compatibility.
                var selected = evt.getProperty('removed') || [];
                var deselected = evt.getProperty('added') || [];

                selected.forEach(function(cell) { applyAnimation(cell); });
                deselected.forEach(function(cell) { removeAnimation(cell); });
            });

            graph.addListener(page.mxEvent.MOVE_CELLS, function(sender, evt) {
                if (!enabled) return;

                var cells = evt.getProperty('cells') || [];
                cells.forEach(function(cell) {
                    if (graph.getModel().isEdge(cell)) removeAnimation(cell);
                });
            });

            page.mxEvent.addListener(graph.container, 'keydown', function(evt) {
                if (evt.ctrlKey && evt.altKey && !evt.shiftKey && evt.keyCode === 73) {
                    togglePlugin();
                    page.mxEvent.consume(evt);
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

            page.__AnimateITStatus.ready = true;
            log('Ready');
        });
    }

    waitForDraw();
})();
