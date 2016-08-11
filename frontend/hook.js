// https://github.com/vuejs/vue-devtools/blob/master/src/backend/hook.js
// this script is injected into every page.

/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag. That's why we have
 * to inline the whole event emitter implementation here.
 *
 * @param {Window} window
 */

function installHook(window) {
    var listeners = {};

    var hook = {
        ins: [],

        location: {
            finalUUID: "",
            level: 0
        },

        on: function(event, fn) {
            event = '$' + event;
            (listeners[event] || (listeners[event] = [])).push(fn);
        },

        once: function(event, fn) {
            event = '$' + event;

            function on() {
                this.off(event, on);
                fn.apply(this, arguments);
            }
            (listeners[event] || (listeners[event] = [])).push(on);
        },

        off: function(event, fn) {
            event = '$' + event;
            if (!arguments.length) {
                listeners = {};
            } else {
                const cbs = listeners[event];
                if (cbs) {
                    if (!fn) {
                        listeners[event] = null;
                    } else {
                        for (let i = 0, l = cbs.length; i < l; i++) {
                            const cb = cbs[i];
                            if (cb === fn || cb.fn === fn) {
                                cbs.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            }
        },

        emit: function(event) {
            event = '$' + event;
            let cbs = listeners[event];
            if (cbs) {
                const args = [].slice.call(arguments, 1);
                cbs = cbs.slice();
                for (let i = 0, l = cbs.length; i < l; i++) {
                    cbs[i].apply(this, args);
                }
            }
        },

        contain: function(selectedNode) {
            this.location.finalUUID = "";
            this.location.level = 0;
            var nodeTree = devtoolsModel.getNodeTree();
            for (var i = 0; i < nodeTree.length; i++) {
                this.containByNode(selectedNode, nodeTree[i], 0);
            }
            return this.location.finalUUID;
        },
        containByNode: function(selectedNode, node, level) {
            var currLevel;
            if (node.node.length) {
                for (var i = 0; i < node.node.length; i++) {
                    if (node.node[i].contains(selectedNode)) {
                        if (level >= this.location.level) {
                            this.location.finalUUID = node.uuid;
                            this.location.level = level;
                        }
                    }
                }
            }
            if (node.childNodes) {
                currLevel = level + 1;
                for (var j = 0; j < node.childNodes.length; j++) {
                    this.containByNode(selectedNode,
                        node.childNodes[j], currLevel);
                }
            }
        }
    };

    // debounce helper
    var debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    };

    var emitRerender = function() {
        hook.emit("reRender");
    };

    var emitStateRender = function() {
        hook.emit("flushMessage");
    };

    var reRender = debounce(emitRerender, 500);
    var reRenderState = debounce(emitStateRender, 500);

    window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__ = hook;

    hook.on('init', function(obj) {
        hook.ins.push(obj);
        this.emit('addNodeMessage', obj);
        reRender();
    });

    hook.on('destroy', function(obj) {
        hook.ins.splice(hook.ins.indexOf(obj), 1);
        reRender();
    });

    hook.on('flush', function() {
        reRenderState();
    });
}

// inject the hook
var script = document.createElement('script');
script.textContent = ';(' + installHook.toString() + ')(window)';
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);
