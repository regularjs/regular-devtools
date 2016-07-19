// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon"
});

var devtoolsView = Regular.extend({
    template: "#devtoolsView",
})

var element = Regular.extend({
    name: "element",
    template: "#elementView",
    onClick: function(node) {
        this.$root.$emit("clickElement", node)
    },
    getLocalState: function(uuid) {
        console.log(this.$root, uuid)
        return this.$root.data.localStateMap[uuid];
    }
})

var devtools = new devtoolsView({
    data: {
        nodes: [],
        currentNode: {
            data: {}
        },
        localStateMap: {

        }
    },
    onInspectNode: function() {
        var uuid = this.data.currentNode.uuid;
        chrome.devtools.inspectedWindow.eval(
            "inspect(window.__RDGH__.filter(function(node) { return node.uuid === '" + uuid + "'})[0].node)",
            function(result, isException) {
                console.log("on ins!!", result, isException)
            }
        );
    }
}).$inject("#devtoolsInject")

var findElementByUuid = function(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i]
        } else {
            if (nodes[i].childNodes.length) {
                var result = findElementByUuid(nodes[i].childNodes, uuid);
                if (result) {
                    return result;
                }
            }
        }
    }
}

var initLocalState = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        addLocalState(arr[i])
    }
}

var addLocalState = function(uuid) {
    devtools.data.localStateMap[uuid] = {
        opened: false
    }
}

devtools
    .$on("initNodes", function(nodes, uuidArr) {
        this.data.nodes = nodes;
        this.data.currentNode = nodes[0];
        initLocalState(uuidArr);
        this.$update();
    })
    .$on("clickElement", function(node) {
        this.data.currentNode = node;
        this.$update();
    }).$on("dataUpdate", function(nodes) {
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, this.data.currentNode.uuid)
        if (currNode) {
            this.data.currentNode = currNode;
            this.$update();
        } 
    }).$on("addNode", function(nodes, id) {
        this.data.nodes = nodes;
        addLocalState(id);
        this.$update();
    }).$on("delNode", function(nodes, id) {
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, this.data.currentNode.uuid)
        if (currNode) {
            this.data.currentNode = currNode;
        } else {
            this.data.currentNode = this.data.nodes[0];
        }
        this.$update();
    })

backgroundPageConnection.onMessage.addListener(function(message) {
    if (message.type === "dataUpdate") {
        devtools.$emit("dataUpdate", message.nodes);
    } else if (message.type === "reRender") {
        devtools.$emit("dataUpdate", message.nodes);
    } else if (message.type === "initNodes") {
        devtools.$emit("initNodes", message.nodes, message.uuidArr);
    } else if (message.type === "addNode") {
        devtools.$emit("addNode", message.nodes, message.nodeId);
    } else if (message.type === "delNode") {
        devtools.$emit("delNode", message.nodes, message.nodeId);
    }
});

backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "frontend/content.js"
});
