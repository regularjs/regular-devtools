var devtoolsModel = (function() {
    var ins = window.__RDGH__ || [];
    var store = [];
    var length = ins.length;
    var treeWalker = function(parentNode, children) {
        for (var i = 0; i < children.length; i++) {
            var node = {
                uuid: children[i].uuid,
                name: children[i].name || "node",
                data: children[i].data,
                childNodes: []
            }
            parentNode.childNodes.push(node);
            if (children[i]._children) {
                treeWalker(node, children[i]._children);
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

    var uuidGen = function(arr) {
        for (var i = 0; i < arr.length; i++) {
            if (!arr[i].uuid) {
                arr[i].uuid = guid();
            }
        }
    }
    
    // generate uuid for the first time
    uuidGen(ins);
    return {

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
        storeGen: function() {
            store = [];
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].$root === ins[i]) {
                    var node = {
                        uuid: ins[i].uuid,
                        name: "root",
                        data: ins[i].data,
                        childNodes: []
                    }
                    store.push(node);
                    if (ins[i]._children.length) {
                        console.log(node, ins[i]._children)
                        treeWalker(node, ins[i]._children)
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
        },
        addEvent: function() {
            var self = this;
            for (var i = 0; i < ins.length; i++) {
                console.log('addEvent!!')
                ins[i].$off("update");
                ins[i].$off("$destory");
                ins[i].$on("update", function() {
                    if (self.ifChanged()) {
                        uuidGen(ins)
                        self.addEvent();
                        window.postMessage({
                            type: "FROM_PAGE",
                            data: {
                                type: "reRender",
                                nodes: self.storeGen()
                            }
                        }, "*");
                    } else {
                        window.postMessage({
                            type: "FROM_PAGE",
                            data: {
                                type: "dataUpdate",
                                nodes: self.storeGen()
                            }
                        }, "*");
                    }
                });

                ins[i].$on("$destroy", function() {
                    self.remove(this);
                });
            }
        },
        ifChanged: function() {
            if (length != ins.length) {
                length = ins.length;
                return true;
            }
            return false;
        },
    }
})();

devtoolsModel.addEvent();

window.postMessage({
    type: "FROM_PAGE",
    data: {
        type: "initNodes",
        nodes: devtoolsModel.storeGen()
    }
}, "*");
