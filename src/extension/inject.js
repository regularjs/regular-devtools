import CircularJSON from "../shared/circular-json";
import {findElementByUUID, highLightNode, clearMask} from '../devtools-ui/utils';
import log from '../shared/log';

// listen for message from content script
// ensure only executing window.addEventListener once
if (!window.devtoolsModel) {
    window.addEventListener('message', function(event) {
        // We only accept messages from ourselves
        if (event.source !== window)
            return;

        var data = event.data;

        if (data.type && (data.type === "FROM_CONTENT_SCRIPT")) {
            if (data.action === 'UPDATE_INSTANCE' && window.devtoolsModel) {
                window.devtoolsModel.updateInstance(data.payload.uuid, data.payload.path, data.payload.value);
            }
        }
    }, false);
}

// this is injected to the app page when the panel is activated.
// this script serves as the model layer of the devtools
// this lives in origin page context
window.devtoolsModel = (function() {
    let Regular;
    let hook = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__;
    let ins = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins || [];
    let store = [];
    let fetchComputedProps;
    let walker;
    let treeGen;
    let getDomNode;
    let searchGroupChildrenForDomNode;
    let getNodesByUUID;
    let highLighter;
    let inspectMode = false;
    let inspectResult = "";

    highLighter = function(uuid) {
        if (!uuid) {
            clearMask();
            return;
        }

        var node = ins.filter(n => {
            return n.uuid === uuid;
        })[0];

        var domNode = getNodesByUUID(uuid);
        domNode = domNode && domNode[0];

        if (!domNode) {
            return;
        }
        domNode.scrollIntoView();
        highLightNode(domNode, node.name || "[anonymous]");
    };

    function onMouseOver(e) {
        let result = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.contain(e.target);
        if (result) {
            if (inspectResult !== result) {
                inspectResult = result;
                highLightNode(e.target, e.target.tagName.toLowerCase());
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "currNodeChange",
                        uuid: inspectResult
                    }
                }, "*");
            }
        }
    }

    // reserve for future use
    function onClick(e) {
    }

    var stringifyStore = function(store) {
        return CircularJSON.stringify(store, function(key, item) {
            if ((item !== null && typeof item === "object")) {
                if (Object.prototype.toString.call(item) === "[object Object]" && !item.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                    return "[Circular]";
                } else if (isNode(item) || isElement(item)) {
                    return "[DOM node]";
                }
                return item;
            } else if (isFunction(item)) {
                return "Function";
            }
            return item;
        });
    };

    fetchComputedProps = function(ins) {
        var computed = {};
        Object.keys(ins.computed).forEach(function(v) {
            try {
                computed[v] = ins.$get(v);
            } catch (e) {
                log("Fetch computed props error:", e);
            }
        });
        return computed;
    };

    function isFunction(o) {
        return Object.prototype.toString.call(o) === "[object Function]";
    }

    // Returns true if it is a DOM node
    function isNode(o) {
        return (
            typeof Node === "object" ? o instanceof Node :
                o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
        );
    }

    // Returns true if it is a DOM element
    function isElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement :
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }
    // setObjectByPath start
    // https://github.com/sindresorhus/dot-prop
    var isObj = function(arg) {
        var type = typeof arg;
        return arg !== null && (type === "object" || type === "function");
    };

    function getPathSegments(path) {
        var pathArr = path.split('.');
        var parts = [];

        for (var i = 0; i < pathArr.length; i++) {
            var p = pathArr[i];

            while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
                p = p.slice(0, -1) + '.';
                p += pathArr[++i];
            }

            parts.push(p);
        }

        return parts;
    }

    var setObjectByPath = function(obj, path, value) {
        if (!isObj(obj) || typeof path !== 'string') {
            return;
        }

        var pathArr = getPathSegments(path);

        for (var i = 0; i < pathArr.length; i++) {
            var p = pathArr[i];

            if (!isObj(obj[p])) {
                obj[p] = {};
            }

            if (i === pathArr.length - 1) {
                obj[p] = value;
            }

            obj = obj[p];
        }
    };
    // setObjectByPath end

    getDomNode = function(node) {
        var container = [];
        if (node.group) {
            searchGroupChildrenForDomNode(node.group, container);
        }
        return container;
    };

    searchGroupChildrenForDomNode = function(group, container) {
        for (let i = 0; i < group.children.length; i++) {
            if (group.get(i).type === "element") {
                container.push(group.get(i).last());
            } else if (group.get(i).children) {
                searchGroupChildrenForDomNode(group.get(i), container);
            } else if (group.get(i) instanceof Regular) {
                if (group.get(i).group) {
                    searchGroupChildrenForDomNode(group.get(i).group, container);
                }
            }
        }
    };

    getNodesByUUID = function(uuid) {
        const element = findElementByUUID(store, uuid);
        return element && element.node;
    };

    function isASTElement(node) {
        return node.type && node.group;
    }

    function isASTGroup(node) {
        return node.children;
    }

    function isRegularInstance(node) {
        return node instanceof Regular;
    }

    walker = function(node, container, flag) {
        var n;
        var i;

        if (isRegularInstance(node)) {
            // if node.name not exists, find node name defined using Compnoent.component() on parent component
            if (!node.name && node.$parent) {
                let obj = node.$parent.constructor._components;
                let keys = Object.keys(obj);
                for (let i = 0; i < keys.length; i++) {
                    if (obj[keys[i]] === node.constructor) {
                        node.name = keys[i];
                        break;
                    }
                }
            }
            n = {
                uuid: node.uuid,
                name: node.name || "[anonymous]",
                childNodes: [],
                inspectable: false
            };

            n.node = getDomNode(node);

            if (node.$outer) {
                n.shadowFlag = true;
            }

            // fetch all computed props
            // n.computed = fetchComputedProps(node);
            node.visited = true;
            if (node.group) {
                treeGen(node, n.childNodes);
            }

            if (n.node.length) {
                n.inspectable = true;
            }

            container.push(n);
        } else if (isASTElement(node)) {
            for (i = 0; i < node.group.children.length; i++) {
                walker(node.group.children[i], container);
            }
        } else if (isASTGroup(node)) {
            for (i = 0; i < node.children.length; i++) {
                walker(node.children[i], container);
            }
        }
    };

    treeGen = function(root, container) {
        var tree = container || [];
        if (root.group) {
            for (var i = 0; i < root.group.children.length; i++) {
                walker(root.group.children[i], tree);
            }
        }
        return tree;
    };

    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    var uuidGen = function(obj) {
        if (!obj.uuid) {
            obj.uuid = guid();
        }
    };

    var uuidGenArr = function(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].uuid) {
                uuidGen(arr[i]);
            }
        }
    };

    var storeGen = function(flag) {
        var node;
        store = [];
        for (var i = 0; i < ins.length; i++) {
            if (ins[i].$root === ins[i]) {
                // fetch all computed props
                // var computed = fetchComputedProps(ins[i]);
                node = {
                    uuid: ins[i].uuid,
                    name: ins[i].name || "[anonymous]",
                    childNodes: [],
                    node: [],
                    inspectable: !!ins[i].parentNode
                };
                var body = document.body;
                if (ins[i].parentNode) {
                    if (ins[i].parentNode === body) {
                        for (var j = 0; j < ins[i].group.children.length; j++) {
                            if (ins[i].group.get(j).type) {
                                node.node.push(ins[i].group.get(j).node());
                            }
                        }
                    } else {
                        node.node.push(ins[i].parentNode);
                    }
                }
                ins[i].visited = true;
                treeGen(ins[i], node.childNodes);
                store.push(node);
            }
        }
        return stringifyStore(store);
    };

    // generate uuid for the first time
    uuidGenArr(ins);
    return {
        init: function() {
            if (ins.length === 0) {
                return;
            }

            /* eslint-disable no-proto */
            let proto = ins[0].__proto__;
            while (proto.__proto__ !== Object.prototype) {
                proto = proto.__proto__;
            }
             /* eslint-enable no-proto */
            Regular = proto.constructor;

            hook.on("flushMessage", function() {
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "dataUpdate"
                    }
                }, "*");
            });

            hook.on("addNodeMessage", function(obj) {
                uuidGen(obj);
            });

            hook.on("reRender", function(obj) {
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "reRender",
                        nodes: storeGen()
                    }
                }, "*");
            });

            window.postMessage({
                type: "FROM_PAGE",
                data: {
                    type: "initNodes",
                    nodes: storeGen()
                }
            }, "*");
        },
        getNodeTree: function() {
            return store;
        },
        updateInstance: function(uuid, path, value) {
            // find instance by uuid
            var instance;
            var i;
            var len;

            for (i = 0, len = ins.length; i < len; i++) {
                if (ins[i].uuid === uuid) {
                    instance = ins[i];
                    break;
                }
            }

            if (!instance) return;

            // update instance data by path
            setObjectByPath(instance.data, path, value);
            instance.$update();

            for (i = 0, len = ins.length; i < len; i++) {
                if (ins[i].parentNode) {
                    ins[i].$update();
                }
            }
        },
        print: function(uuid) {
            var i;
            for (i = 0; i < ins.length; i++) {
                if (ins[i].uuid === uuid) {
                    window.$r = ins[i]; // console output $component as curUI component
                    break;
                }
            }
        },
        enterInspectMode: function() {
            if (inspectMode) {
                return;
            }
            inspectMode = true;
            window.document.body.addEventListener("mouseover", onMouseOver);
            window.document.body.addEventListener("click", onClick);
        },
        exitInspectMode: function() {
            if (!inspectMode) {
                return;
            }
            window.document.body.removeEventListener("mouseover", onMouseOver);
            window.document.body.removeEventListener("click", onClick);
            clearMask();
            inspectMode = false;
        },
        highLighter: highLighter,
        stringify: stringifyStore,
        fetchComputedProps: fetchComputedProps
    };
})();

window.devtoolsModel.init();
