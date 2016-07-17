var devtoolsModel = (function() {
    var ins = window.__RDGH__;
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
                if (ins[i].parentNode && (ins[i].$root != devtools)) {
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
            ins.splice(ins.indexOf(i), 1);
            devtools.$emit("reRender");
        },
        addEvent: function() {
            var self = this;
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].$root != devtools) {
                    ins[i].$off("update");
                    ins[i].$off("$destory");

                    ins[i].$on("update", function() {
                        devtools.$emit("dataUpdate");
                    })

                    ins[i].$on("$destroy", function() {
                        self.remove(this);
                    })
                }
            }
        },
        ifChanged: function() {
            var l = 0;
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].$root != devtools) {
                    l += 1;
                }
            }
            if (l === length) {
                return false;
            } else {
                length = l;
                return true;
            }
        },
        cleanUp: function() {
            var newIns = [];
            for (var i = 0; i < ins.length; i++) {
                if (ins[i].$root != devtools) {
                    newIns.push(ins[i]);
                }
            }
            ins = newIns;
        }
    }
})();


var devtoolsView = Regular.extend({
    template: "#devtoolsView",
})

var element = Regular.extend({
    name: "element",
    template: "#elementView",
    onClick: function(node) {
        this.$root.$emit("clickElement", node)
    }
})

var devtools = new devtoolsView({
    data: {
        nodes: devtoolsModel.storeGen(),
        currentNode: {
            data: {}
        },
    },
}).$inject("#devtoolsInject")

devtools.$on("clickElement", function(node) {
    this.data.currentNode = node;
    this.$update();
})

// init logic
devtoolsModel.addEvent();
devtools.data.currentNode =  devtools.data.nodes[0];


devtools.$on("dataUpdate", function(node) {
    if (devtoolsModel.ifChanged) {
        this.$emit("reRender");
    }
    this.$update();
})

devtools.$on("reRender", function() {
    devtoolsModel.addEvent();
    this.data.nodes = devtoolsModel.storeGen();
    if (!(devtoolsModel.get().indexOf(this.data.currentNode))) {
        this.data.currentNode = null;
        this.data.currentNode = this.data.node[0];
    }
    this.$update();
    devtoolsModel.cleanUp();
})

devtools.$emit("dataUpdate");
