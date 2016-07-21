// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon"
});

// Util
var isPrimitive = function(arg) {
    var type = typeof arg;
    return arg == null || (type != "object" && type != "function");
}

var type = function(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
}

// Regualr components for devtools' UI
var devtoolsView = Regular.extend({
    template: "#devtoolsView",
})

var element = Regular.extend({
    name: "element",
    template: "#element",
    onClick: function(node) {
        this.$root.$emit("clickElement", node)
    },
    getLocalState: function(uuid) {
        return this.$root.data.localStateMap[uuid];
    }
})

var stateView = Regular.extend({
    name: "stateView",
    template: "#stateView",
    onInspectNode: function() {
        var uuid = this.data.currentNode.uuid;
        console.log("inspect ", uuid)
        chrome.devtools.inspectedWindow.eval(
            "inspect(window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(node) { return node.uuid === '" + uuid + "'})[0].node)",
            function(result, isException) {
                //console.log("on ins!!", result, isException)
            }
        );
    }
})

var elementView = Regular.extend({
    name: "elementView",
    template: "#elementView"
})

var prop = Regular.extend({
    name: "prop",
    template: "#stateViewProp",
    data:{
        opened: true,
    },
    isPrimitive:isPrimitive,
    type:type
})


// init devtools
var devtools = new devtoolsView({
    data: {
        nodes: [],
        currentNode: {
            data: {}
        },
        localStateMap: {

        }
    }
}).$inject("#devtoolsInject")

// some utility functions
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
        opened: false,
        selected: false
    }
}

var clearProps = function(props, initValue) {
    var obj = devtools.data.localStateMap;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            obj[key][props] = initValue;
        }
    }
}

var snycObject = function(oldObj, newObj, container) {
    for (var key in newObj) {
        if (!newObj.hasOwnProperty(key)) {
            continue;
        }
        if (oldObj[key]) {
            if (oldObj[key] === newObj[key]) {
                container[key] = oldObj[key];
            } else if (JSON.stringify(oldObj[key]) === JSON.stringify(newObj[key])) {
                container[key] = oldObj[key];
            } else if ((typeof(oldObj[key]) === "object") && (typeof(newObj[key]) === "object")) {
                if ((newObj[key] instanceof Array) && (oldObj[key] instanceof Array)) {
                    var temp = snycObject(oldObj[key], newObj[key], []);
                    container[key] = temp;
                } else {
                    var temp = snycObject(oldObj[key], newObj[key], {});
                    container[key] = temp;
                }
            } else {
                container[key] = newObj[key];
            }
        } else {
            container[key] = newObj[key];
        }
    }
    return container;
}


// register custom events 
devtools
    .$on("initNodes", function(nodes, uuidArr) {
        this.data.nodes = nodes;
        this.data.currentNode = nodes[0];
        initLocalState(uuidArr);
        this.$update();
    })
    .$on("clickElement", function(node) {
        this.data.currentNode = node;
        clearProps("selected", false);
        this.data.localStateMap[node.uuid].selected = true;
        this.$refs.elementView.$update();
        this.$refs.stateView.$update();
    }).$on("stateViewReRender", function(nodes) {
        console.log("stateViewReRender rerender!!");
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, this.data.currentNode.uuid)
        if (currNode) {
            this.data.currentNode = snycObject(this.data.nodes.currentNode, currNode, {});
            this.$refs.stateView.$update();
        } else {
            this.data.currentNode = this.data.nodes[0];
            this.$refs.stateView.$update();
        }
    }).$on("elementViewReRender", function(nodes) {
        this.data.nodes = nodes;
        this.$refs.elemenView.$update();
        this.emit("stateViewReRender", nodes);
    }).$on("addNode", function(id) {
        addLocalState(id);
    }).$on("delNode", function(id) {

    })

backgroundPageConnection.onMessage.addListener(function(message) {
    if (message.type === "dataUpdate") {
        devtools.$emit("stateViewReRender", message.nodes);
    } else if (message.type === "reRender") {
        devtools.$emit("elementViewReRender", message.nodes);
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
