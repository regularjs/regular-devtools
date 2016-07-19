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
    var listeners = {}

    var hook = {
        ins: [],

        on: function(event, fn) {
            event = '$' + event;
            (listeners[event] || (listeners[event] = [])).push(fn)
        },

        once: function(event, fn) {
            event = '$' + event

            function on() {
                this.off(event, on)
                fn.apply(this, arguments)
            };
            (listeners[event] || (listeners[event] = [])).push(on)
        },

        off: function(event, fn) {
            event = '$' + event
            if (!arguments.length) {
                listeners = {}
            } else {
                const cbs = listeners[event]
                if (cbs) {
                    if (!fn) {
                        listeners[event] = null
                    } else {
                        for (let i = 0, l = cbs.length; i < l; i++) {
                            const cb = cbs[i]
                            if (cb === fn || cb.fn === fn) {
                                cbs.splice(i, 1)
                                break
                            }
                        }
                    }
                }
            }
        },

        emit: function(event) {
            event = '$' + event
            let cbs = listeners[event]
            if (cbs) {
                const args = [].slice.call(arguments, 1)
                cbs = cbs.slice()
                for (let i = 0, l = cbs.length; i < l; i++) {
                    cbs[i].apply(this, args)
                }
            }
        }
    }


    Object.defineProperty(window, '__REGULAR_DEVTOOLS_GLOBAL_HOOK__', {
        get() {
            return hook
        }
    })

    hook.on('init', function(obj) {
        hook.ins.push(obj);
        this.emit('addNodeMessage', obj);
    })

    hook.on('destroy', function(obj) {
        hook.ins.splice(hook.ins.indexOf(obj), 1);
        this.emit('delNodeMessage', obj);
    })

}



// inject the hook
var script = document.createElement('script')
script.textContent = ';(' + installHook.toString() + ')(window)'
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
