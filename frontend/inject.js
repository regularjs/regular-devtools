// this is injected to the app page when the panel is activated.
// this script serves as the model layer of the devtools
var devtoolsModel = (function() {
    var hook = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__;
    var ins = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins || [];
    var store = [];
    var length = ins.length;
    var initialUuidArr = [];

    var treeWalker = function(parentNode, children, uuidFlag) {
        for (var i = 0; i < children.length; i++) {
            var node = {
                uuid: children[i].uuid,
                name: children[i].name || "node",
                data: children[i].data,
                childNodes: []
            }
            parentNode.childNodes.push(node);
            if (uuidFlag) {
                initialUuidArr.push(node.uuid);
            }
            if (children[i]._children) {
                treeWalker(node, children[i]._children, uuidFlag);
            }
        }
    }

    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    var uuidGen = function(obj) {
        if (!obj.uuid) {
            obj.uuid = guid();
        }
    }

    var uuidGenArr = function(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].uuid) {
                uuidGen(arr[i]);
            }
        }
    }



    // generate uuid for the first time
    uuidGenArr(ins);
    return {
        initialUuidArr: initialUuidArr,
        init: function() {
            var self = this;
            hook.on("flush", function() {
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "dataUpdate",
                        nodes: self.storeGen()
                    }
                }, "*");
            })

            hook.on("addNodeMessage", function(obj) {
                uuidGen(obj)
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "addNode",
                        nodes: self.storeGen(),
                        nodeId: obj.uuid
                    }
                }, "*");
            })

            hook.on("delNodeMessage", function(obj) {
                window.postMessage({
                    type: "FROM_PAGE",
                    data: {
                        type: "delNode",
                        nodes: self.storeGen(),
                        nodeId: obj.uuid
                    }
                }, "*");
            })

        },
        sanitize: function(store) {
            var str = JSON.stringify(store, function(key, value) {
                if (value instanceof Regular) {
                    return;
                }
                return value;
            });
            return JSON.parse(str);
        },
        get: function(index) {
            if (index) {
                return ins[index];
            }
            return ins;
        },
        storeGen: function(uuidFlag) {
            store = [];
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].$root === ins[i]) {
                    if (ins[i].parentNode) {
                        var name = "root#" + ins[i].parentNode.tagName + "." + ins[i].parentNode.className.split(" ").join(".");
                    }
                    var node = {
                        uuid: ins[i].uuid,
                        name: name || "root",
                        data: ins[i].data,
                        childNodes: []
                    }
                    if (uuidFlag) {
                        initialUuidArr.push(node.uuid);
                    }
                    store.push(node);
                    if (ins[i]._children.length) {
                        treeWalker(node, ins[i]._children, uuidFlag)
                    }
                }
            }
            store = this.sanitize(store)
            return store;
        },
        getStore: function() {
            return store;
        },
        remove: function(i) {
            var self = this;
            ins.splice(ins.indexOf(i), 1);
            window.postMessage({
                type: "FROM_PAGE",
                data: {
                    type: "reRender",
                    nodes: self.storeGen()
                }
            }, "*");
        }
    }
})();

window.postMessage({
    type: "FROM_PAGE",
    data: {
        type: "initNodes",
        nodes: devtoolsModel.storeGen(true),
        uuidArr: devtoolsModel.initialUuidArr
    }
}, "*");

devtoolsModel.init();
