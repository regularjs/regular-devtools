// this is injected to the app page when the panel is activated.
// this script serves as the model layer of the devtools
var devtoolsModel = (function() {
    var hook = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__;
    var ins = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins || [];
    var store = [];
    // node tree for DOM-Component search
    var findElementByUuid;
    var nodeTree = [];
    var walker;
    var treeGen;

    findElementByUuid = function(nodes, uuid) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].uuid === uuid) {
                return nodes[i];
            }
            if (nodes[i].childNodes.length) {
                var result = findElementByUuid(nodes[i].childNodes, uuid);
                if (result) {
                    return result;
                }
            }
        }
    };

    walker = function(node, container, flag) {
        var n;
        var i;
        // node is a element
        if (node.type && node.group) {
            for (i = 0; i < node.group.children.length; i++) {
                walker(node.group.children[i], container, flag);
            }
            // node is a Group
        } else if (node.children) {
            for (i = 0; i < node.children.length; i++) {
                walker(node.children[i], container, flag);
            }
            // node is a regular instance
        } else if (node.uuid) {
            if (flag) {
                n = {
                    uuid: node.uuid,
                    childNodes: [],
                    node: [],
                    ref: node
                };
                if (node.node && (typeof node.node === "object")) {
                    n.node.push(node.node);
                } else if (node.group) {
                    for (i = 0; i < node.group.children.length; i++) {
                        if (node.group.get(i).type) {
                            n.node.push(node.group.get(i).node());
                        }
                    }
                }
                if (node.group) {
                    treeGen(node, n.childNodes, flag);
                }
                container.push(n);
            } else {
                n = {
                    uuid: node.uuid,
                    name: node.name || "node",
                    data: node.data,
                    childNodes: [],
                    inspectable: (node.node || node.group.children)
                };
                if (node.node) {
                    n.inspectable = true;
                } else if (node.group.children) {
                    for (i = 0; i < node.group.children.length; i++) {
                        if (node.group.get(i).type) {
                            n.inspectable = true;
                            break;
                        }
                    }
                }
                if (node.$outer) {
                    n.shadowFlag = true;
                }
                node.visited = true;
                container.push(n);
                if (node.group) {
                    treeGen(node, n.childNodes);
                }
            }
        }
    };

    treeGen = function(root, container, flag) {
        var tree = container || [];
        if (root.group) {
            for (var i = 0; i < root.group.children.length; i++) {
                walker(root.group.children[i], tree, flag);
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

    // eliminate circular reference
    var sanitize = function(store) {
        var str = JSON.stringify(store, function(key, value) {
            if (value instanceof Regular) {
                return;
            }
            return value;
        });
        return JSON.parse(str);
    };

    var storeGen = function(flag) {
        var node;
        if (!flag) {
            store = [];
        } else {
            nodeTree = [];
        }
        for (var i = 0; i < ins.length; i++) {
            if (ins[i].$root === ins[i]) {
                if (flag && ins[i].parentNode) {
                    node = {
                        uuid: ins[i].uuid,
                        childNodes: [],
                        node: []
                    };
                    var body = document.querySelector("body");
                    if (ins[i].parentNode === body) {
                        for (var j = 0; j < ins[i].group.children.length; j++) {
                            if (ins[i].group.get(j).type) {
                                node.node.push(ins[i].group.get(j).node());
                            }
                        }
                    } else {
                        node.node.push(ins[i].parentNode);
                    }
                    treeGen(ins[i], node.childNodes, flag);
                    nodeTree.push(node);
                } else {
                    node = {
                        uuid: ins[i].uuid,
                        name: name || "root",
                        data: ins[i].data,
                        childNodes: [],
                        inspectable: !!ins[i].parentNode
                    };
                    ins[i].visited = true;
                    treeGen(ins[i], node.childNodes);
                    store.push(node);
                }
            }
        }
        if (flag) {
            return nodeTree;
        }
        store = sanitize(store);
        return store;
    };

    // generate uuid for the first time
    uuidGenArr(ins);
    return {
        init: function() {
            if (ins.length === 0) {
                return;
            }
            hook.on("flushMessage", function() {
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "dataUpdate",
                        nodes: storeGen()
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
            return storeGen(true);
        },
        print: function(uuid) {
            var i;
            for (i = 0; i < ins.length; i++) {
                if (ins[i].uuid === uuid) {
                    console.log(ins[i]);
                }
            }
        }
    };
})();

devtoolsModel.init();
