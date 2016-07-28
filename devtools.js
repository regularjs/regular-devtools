// the real devtools script
// the UI layer of devtools

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon"
});

var injectContentScript = function() {
    backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        file: "/frontend/content.js"
    });
}

// Util
var prefix = "[Regular Devtools] ";

var isPrimitive = function(arg) {
    var type = typeof arg;
    return arg == null || (type != "object" && type != "function");
}

var type = function(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
}

var makeElementTree = function(nodes, container) {
    for (var i = 0; i < nodes.length; i++) {
        var node = {
            name: nodes[i].name,
            uuid: nodes[i].uuid,
            shadowFlag: nodes[i].shadowFlag,
            childNodes: []
        }
        container.push(node);
        if (nodes[i].childNodes.length) {
            makeElementTree(nodes[i].childNodes, node.childNodes);
        }
    }
    return container;
}


var searchPathWarpper = function(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            path.push(nodes[i])
            return path;
        } else if (searchPath(nodes[i]._children, uuid, path)) {
            path.push(nodes[i])
            return path;
        }
    }
}

var searchPath = function(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.node.uuid === uuid) {
            path.push(nodes[i])
            return true;
        } else if (nodes[i]._children.length > 0) {
            if (searchPath(nodes[i]._children, uuid, path)) {
                path.push(nodes[i]);
                return true;;
            }
        }
    }
    return false
}

// Global Ref
var lastSelected = null;

// Regualr components for devtools' UI
var devtoolsView = Regular.extend({
    template: "#devtoolsView",
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    }
})

var element = Regular.extend({
    name: "element",
    template: "#element",
    data: {
        selected: false,
        opened: false
    },
    onClick: function(node) {
        if (lastSelected) {
            if (lastSelected === this) {
                return;
            } else {
                this.data.selected = true;
                if (!findElementByUuid(this.$root.data.nodes, lastSelected.data.node.uuid)) {
                    lastSelected = null;
                } else {
                    lastSelected.data.selected = false;
                }

            }
        }
        lastSelected = this;
        this.$root.$emit("clickElement", node.uuid);
    }
})

var stateView = Regular.extend({
    name: "stateView",
    template: "#stateView",
    data: {
        currentNode: {
            name: "",
            uuid: "",
            data: {}
        }
    },
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
    template: "#elementView",
    data: {
        nodes: [],
        loading: true
    }
})

var prop = Regular.extend({
    name: "prop",
    template: "#stateViewProp",
    data: {
        opened: false,
    },
    computed: {
        type: {
            get: function(data) {
                return this.type(data.value);
            }
        },
        hasChildren: {
            get: function(data) {
                return ((this.type(data.value) === 'Array') || (this.type(data.value) === 'Object')) &&
                    ((data.value.length || Object.keys(data.value).length))
            }
        }
    },
    isPrimitive: isPrimitive,
    type: type
})


// init devtools
var devtools = new devtoolsView({
    data: {
        nodes: []
    }
}).$inject("#devtoolsInject")

// more utility functions
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

var findElementByUuidNonRecursive = function(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i]
        }
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

var snycArr = function(oldArr, newArr, container) {
    for (var i = 0; i < newArr.length; i++) {
        var newNode = newArr[i];
        var oldNode = findElementByUuidNonRecursive(oldArr, newArr[i].uuid);
        if (oldNode) {
            if (JSON.stringify(oldNode) != JSON.stringify(newNode)) {
                oldNode['name'] = newNode['name'];
                oldNode['shadowFlag'] = newNode['shadowFlag'];
                oldNode['childNodes'] = snycArr(oldNode['childNodes'], newNode['childNodes'], [])
            }
            container.push(oldNode);
        } else {
            container.push(newNode);
        }
    }
    return container;
}

var stateView = devtools.$refs.stateView;
var elementView = devtools.$refs.elementView;

// register custom events 
devtools
    .$on("initNodes", function(nodes) {
        console.log(prefix + "On initNodes.");
        this.data.nodes = nodes;
        stateView.data.currentNode = nodes[0];
        elementView.data.loading = false;
        elementView.data.nodes = makeElementTree(nodes, []);
        stateView.$update();
        elementView.$update();
    })
    .$on("clickElement", function(uuid) {
        if (uuid != stateView.data.currentNode.uuid) {
            stateView.data.currentNode = findElementByUuid(this.data.nodes, uuid);
            stateView.$update();
        }
    }).$on("stateViewReRender", function(nodes) {
        console.log(prefix + "On stateViewRender.");
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, stateView.data.currentNode.uuid);
        if (currNode) {
            stateView.data.currentNode = snycObject(stateView.data.currentNode, currNode, {});
            stateView.$update();
        } else {
            stateView.data.currentNode = nodes[0];
            stateView.$update();
        }
    }).$on("elementViewReRender", function(nodes) {
        console.log(prefix + "On elementViewRerender.");
        var oldArr = elementView.data.nodes;
        var newArr = makeElementTree(nodes, []);
        oldArr = snycArr(oldArr, newArr, []);
        elementView.$update();
    }).$on("currentNodeChange", function(uuid) {
        console.log(prefix + "On currentNodeChange.");
        if (stateView.data.currentNode.uuid != uuid) {
            stateView.data.currentNode = findElementByUuid(this.data.nodes, uuid);
            stateView.$update();
            var path = [];
            searchPathWarpper(elementView._children, uuid, path);
            for (var i = 0; i < path.length; i++) {
                path[i].data.opened = true;
            }
            if (lastSelected) {
                lastSelected.data.selected = false;
            }
            lastSelected = path[0];
            path[0].data.selected = true;
            elementView.$update();
        }
    }).$on("reload", function() {
        console.log(prefix + "On reload.");
        setTimeout(injectContentScript, 2000);
    })

backgroundPageConnection.onMessage.addListener(function(message) {
    if (message.type === "dataUpdate") {
        devtools.$emit("stateViewReRender", message.nodes);
    } else if (message.type === "reRender") {
        devtools.$emit("elementViewReRender", message.nodes);
    } else if (message.type === "initNodes") {
        devtools.$emit("initNodes", message.nodes);
    } else if (message.type === "pageReload") {
        elementView.data.loading = true;
        elementView.$update();
        devtools.$emit("reload");
    }
});


// listen for messge when switch from element tab to regular tab
window.addEventListener("message", function(event) {
    if (event.data.type === "currNodeChange") {
        devtools.$emit("currentNodeChange", event.data.uuid)
    }
}, false);

injectContentScript();
