var devtoolsModel = (function() {
    var ins = window.__RDGH__ || [];
    var store = [];
    var length = ins.length;
    var treeWalker = function(parentNode, children) {
        for (var i = 0; i < children.length; i++) {
            var node = {
                name: children[i].name || "node",
                data: children[i].data,
                childNodes: []
            }
            parentNode.childNodes.push(node);
            if (children[i]._children) {
                treeWalker(children[i], children[i]._children);
            }
        }
    }
    return {
        get: function(index) {
            if (index) {
                return ins[index];
            }
            return ins;
        },
        storeGen: function() {
            store = [];
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].parentNode) {
                    var node = {
                        name: "root",
                        data: ins[i].data,
                        childNodes: []
                    }
                    store.push(node);
                    treeWalker(node, ins[i]._children)
                }
            }
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
                        self.addEvent();
                        window.postMessage({
                            type: "FROM_PAGE",
                            data: {
                                type: "reRender",
                                nodes: self.storeGen()
                            }
                        }, "*");
                    } else {
                        console.log(self)
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
                    console.log('on des!!', this.name)
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
