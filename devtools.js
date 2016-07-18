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
    }
})

var devtools = new devtoolsView({
    data: {
        nodes: [],
        currentNode: {
            data: {}
        },
    },
    onInspectNode: function() {
        var uuid = this.data.currentNode.uuid;
        console.log("inspect(window.__RDGH__.filter(function(node) { return node.uuid === '" + uuid + "'})[0].node)")
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



devtools.$on("initNodes", function(nodes) {
    this.data.nodes = nodes;
    this.data.currentNode = nodes[0];
    this.$update();
})

devtools.$on("clickElement", function(node) {
    this.data.currentNode = node;
    this.$update();
})

devtools.$on("dataUpdate", function(nodes) {
    this.data.nodes = nodes;
    var currNode = findElementByUuid(nodes, this.data.currentNode.uuid)
    if (currNode) {
        this.data.currentNode = currNode;
        this.$update();
    } else {
        this.data.currentNode = null;
        this.data.currentNode = this.data.nodes[0];
        this.$update();
    }
})

devtools.$on("reRender", function(nodes) {
    this.data.nodes = nodes;
    this.data.currentNode = null;
    this.data.currentNode = this.data.nodes[0];
    this.$update();
})

backgroundPageConnection.onMessage.addListener(function(message) {
    console.log("devtools received message", message)
    if (message.type === "dataUpdate") {
        devtools.$emit("dataUpdate", message.nodes);
    } else if (message.type === "reRender") {
        devtools.$emit("reRender", message.nodes);
    } else if (message.type === "initNodes") {
        devtools.$emit("initNodes", message.nodes);
    }
});

backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "frontend/content.js"
});
