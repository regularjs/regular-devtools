// the real devtools script
// the UI layer of devtools

var backgroundPageConnection;
var injectContentScript;
var isPrimitive;
var type;
var prefix = "[Regular Devtools] ";
var makeElementTree;
var searchPath;
var searchPathWarpper;
var devtoolsViewComponent;
var elementComponent;
var stateViewComponent;
var elementViewComponent;
var propComponent;
var tabsComponent;
var devtools;
var findElementByUuid;
var stateView;
var elementView;
var snycArr;
var printInConsole;
var snycObject;
var findElementByUuidNonRecursive;

// Global Ref
var lastSelected = null;

// Create a connection to the background page
backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon"
});

injectContentScript = function() {
    backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        file: "/frontend/content.js"
    });
};

// Util
isPrimitive = function(arg) {
    var type = typeof arg;
    return arg === null || (type !== "object" && type !== "function");
};

type = function(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
};

makeElementTree = function(nodes, container) {
    for (var i = 0; i < nodes.length; i++) {
        var node = {
            name: nodes[i].name,
            uuid: nodes[i].uuid,
            shadowFlag: nodes[i].shadowFlag,
            childNodes: []
        };
        container.push(node);
        if (nodes[i].childNodes.length) {
            makeElementTree(nodes[i].childNodes, node.childNodes);
        }
    }
    return container;
};

searchPath = function(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.node.uuid === uuid) {
            path.push(nodes[i]);
            return true;
        } else if (nodes[i]._children.length > 0) {
            if (searchPath(nodes[i]._children, uuid, path)) {
                path.push(nodes[i]);
                return true;
            }
        }
    }
    return false;
};

searchPathWarpper = function(nodes, uuid, path) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].data.node.uuid === uuid) {
            path.push(nodes[i]);
            return path;
        } else if (searchPath(nodes[i]._children, uuid, path)) {
            path.push(nodes[i]);
            return path;
        }
    }
};



// Regualr components for devtools' UI
devtoolsViewComponent = Regular.extend({
    template: "#devtoolsView",
    config: function() {
        this.data.tabSource = [{
                text: "data",
                key: "data"
            },
            /*{
                text: 'others',
                key: 'others'
            }*/
        ];
        // defaults to `data` pane
        this.data.tabSelected = 'data';
    },
    onTabChange: function(key) {
        this.data.tabSelected = key;
        console.log(prefix + "Tab is Changed to", key);
        // TODO: switch tab pane content here
        this.$update();
    },
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    }
});

elementComponent = Regular.extend({
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
            }
            this.data.selected = true;
            if (!findElementByUuid(this.$root.data.nodes,
                    lastSelected.data.node.uuid)) {
                lastSelected = null;
            } else {
                lastSelected.data.selected = false;
            }
        }
        lastSelected = this;
        this.$root.$emit("clickElement", node.uuid);
    }
});

stateViewComponent = Regular.extend({
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
        chrome.devtools.inspectedWindow.eval(
            "var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) { return n.uuid === " + "'" + uuid + "'" + "})[0];" +
            "if (node) {" +
            "    inspect(node.group && node.group.children && node.group.children[0].node() || node.parentNode);" +
            "}",
            function(result, isException) {
                if (isException) {
                    console.log(prefix + "Inspect Error: ", isException);
                }
            }
        );
    }
})

elementViewComponent = Regular.extend({
    name: "elementView",
    template: "#elementView",
    data: {
        nodes: [],
        loading: true
    }
});

propComponent = Regular.extend({
    name: "prop",
    template: "#stateViewProp",
    data: {
        opened: false
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
});

tabsComponent = Regular.extend({
    name: 'tabs',
    template: '#tabs',
    onTabClick: function(key) {
        if (this.data.selected === key) {
            return;
        }
        this.$emit('change', key);
    },
    config: function() {

    }
});

// init devtools
devtools = new devtoolsViewComponent({
    data: {
        nodes: []
    }
}).$inject("#devtoolsInject");

// more utility functions
findElementByUuid = function(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i];
        }
        if (nodes[i].childNodes.length) {
            var result = findElementByUuid(nodes[i].childNodes, uuid);
            if (result) {
                return result;
            }
        }
    }
};

findElementByUuidNonRecursive = function(nodes, uuid) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uuid === uuid) {
            return nodes[i];
        }
    }
};

snycObject = function(oldObj, newObj, container) {
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
};

snycArr = function(oldArr, newArr, container) {
    for (var i = 0; i < newArr.length; i++) {
        var newNode = newArr[i];
        var oldNode = findElementByUuidNonRecursive(oldArr, newArr[i].uuid);
        if (oldNode) {
            if (JSON.stringify(oldNode) !== JSON.stringify(newNode)) {
                oldNode.name = newNode.name;
                oldNode.shadowFlag = newNode.shadowFlag;
                oldNode.childNodes = snycArr(oldNode.childNodes, newNode.childNodes, []);
            }
            container.push(oldNode);
        } else {
            container.push(newNode);
        }
    }
    return container;
};

printInConsole = function(uuid) {
    chrome.devtools.inspectedWindow.eval(
        "devtoolsModel.print('" + uuid + "')",
        function(result, isException) {
            if (isException) {
                console.log(prefix + "Inspect Error: ", isException);
            }
        }
    );
};

stateView = devtools.$refs.stateView;
elementView = devtools.$refs.elementView;

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
        if (uuid !== stateView.data.currentNode.uuid) {
            stateView.data.currentNode = findElementByUuid(this.data.nodes, uuid);
            stateView.$update();
        }
        printInConsole(uuid);
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
        if (stateView.data.currentNode.uuid !== uuid) {
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
        // wait for the page to fully intialize
        setTimeout(injectContentScript, 2000);
    });

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
        devtools.$emit("currentNodeChange", event.data.uuid);
    }
}, false);

injectContentScript();
