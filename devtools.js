var devtoolsModel = (function() {
    var ins = window.__RDGH__;
    var store = [];
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
            console.log(store)
            return store;
        },
        getStore: function() {
            return store;
        },
        addEvent: function() {
            for (var i = 0; i < ins.length; i++) {
                ins[i].$on("update", function() {
                    devtools.$emit("dataUpdate");
                })
            }
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
        currentNode: "",
        currentData: {}
    },
}).$inject("#devtoolsInject")

devtools.$on("clickElement", function(node) {
    this.data.currentNode = node.name
    this.data.currentData = node.data;
    this.$update();
})

devtoolsModel.addEvent();

devtools.$on("dataUpdate", function(node) {
    this.$update();
})
