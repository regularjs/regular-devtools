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
}).$inject("#devtoolsInject")

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
    this.$update();
})

devtools.$on("reRender", function(nodes) {
    this.data.nodes = nodes;
    this.data.currentNode = null;
    this.data.currentNode = this.data.nodes[0];
    this.$update();
})


backgroundPageConnection.onMessage.addListener(function (message) {
    console.log("devtools received message", message)
    if (message.type === "dataUpdate") {
        devtools.$emit("reRender", message.nodes);
    }else if (message.type === "reRender") {
        devtools.$emit("reRender", message.nodes);
    }else if (message.type === "initNodes") {
        devtools.$emit("initNodes", message.nodes);
    }
});

backgroundPageConnection.postMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    scriptToInject: "frontend/content.js"
});
