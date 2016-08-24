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
var jsonTreeComponent;
var elementViewComponent;
var propComponent;
var sidebarViewComponent;
var tabsComponent;
var searchViewComponent;
var devtools;
var findElementByUuid;
var sidebarView;
var elementView;
var snycArr;
var printInConsole;
var snycObject;
var findElementByUuidNonRecursive;
var findElementByName;
var dom = Regular.dom;
var foucsNode;
var displayWarnning;

// Global Ref
var lastSelected = null;

// Create a current inspected page unique connection to the background page, by its tabId
backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon_" + chrome.devtools.inspectedWindow.tabId
});

injectContentScript = function(tabId) {
    backgroundPageConnection.postMessage({
        tabId: tabId || chrome.devtools.inspectedWindow.tabId,
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

// on enter logic
Regular.event('enter', function(elem, fire) {
    function update(ev) {
        if (ev.which === 13) { // ENTER key
            ev.preventDefault();
            fire(ev); // if key is enter , we fire the event;
        }
    }
    dom.on(elem, "keypress", update);
    return function destroy() { // return a destroy function
        dom.off(elem, "keypress", update);
    };
});

// Regualr components for devtools' UI
devtoolsViewComponent = Regular.extend({
    template: "#devtoolsView",
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

elementViewComponent = Regular.extend({
    name: "elementView",
    template: "#elementView",
    data: {
        nodes: [],
        loading: true
    }
});

searchViewComponent = Regular.extend({
    name: "searchView",
    template: "#searchView",
    data: {
        value: "",
        resultList: [],
        index: 0
    },
    search: function() {
        this.data.resultList = [];
        this.data.index = 0;
        findElementByName(devtools.data.nodes, this.data.value, this.data.resultList);
        if (this.data.resultList.length) {
            foucsNode(this.data.resultList[0]);
        }
    },
    next: function(dir) {
        var data = this.data;
        if (data.resultList.length) {
            data.index += dir;
            if (data.index === data.resultList.length) data.index = 0;
            if (data.index === -1) data.index = data.resultList.length - 1;
            foucsNode(data.resultList[data.index]);
        }
    }
});

jsonTreeComponent = Regular.extend({
    name: "jsonTree",
    template: "#jsonTree",
    data: {
        source: {}
    },
    config: function() {
        var self = this;

        function onClick(e) {
            self.$emit('checkClickOutside', e.target);
        }
        document.addEventListener('click', onClick, false);
        this.$on('$destroy', function() {
            document.removeEventListener('click', onClick, false);
        });
    }
});

propComponent = Regular.extend({
    name: "jsonTreeProp",
    template: "#jsonTreeProp",
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
                    ((data.value.length || Object.keys(data.value).length));
            }
        }
    },
    config: function() {
        var self = this;
        this.$parent.$on('checkClickOutside', function(v) {
            if (self.$refs && self.$refs.edit && !self.$refs.edit.contains(v)) {
                self.data.editing = false;
                self.$update();
            }
            self.$emit('checkClickOutside', v);
        });
    },
    onEdit: function() {
        if(this.data.value == 'function'){
            return;
        }
        if( !this.isPrimitive(this.data.value)) {
            return;
        }
        this.data.editing = true;
        this.$update();
        // select all when active
        var input = this.$refs.edit;
        if(type(this.data.value) === "String"){
            input.setSelectionRange(1, input.value.length-1);
        }else{
            input.setSelectionRange(0, input.value.length);
        }
    },
    onBlur: function(e) {
        this.data.editing = false;
        this.$update();
        this.editDone(e);
    },
    onEnter: function(e) {
        // press enter
        if (e.which === 13) {
            this.$refs.edit.blur();
        }
    },
    // when editing is finished
    editDone: function(e) {
        var v = e.target.value;
        var tmp = this.data.value;
        try {
            tmp = JSON.parse(v);
        } catch (error) {
            e.target.value = this.data.value;
        }

        // if type is not primitive or new value equals original value, return
        if (!this.isPrimitive(tmp) || tmp === this.data.value) {
            return;
        }

        var parent = this;
        while (parent = parent.$parent) {
            if (parent.name === 'jsonTree') {
                parent.$emit('change', {
                    path: this.data.path,
                    value: tmp,
                    oldValue: this.data.value
                });
                break;
            }
        }
        // TODO: maybe this can be deleted
        this.data.value = tmp;
        this.$update();
    },
    isPrimitive: isPrimitive,
    type: type
});

sidebarViewComponent = Regular.extend({
    name: 'sidebarView',
    template: '#sidebarView',
    config: function() {
        // defaultValue of currentNode
        this.data.currentNode = {
            name: "",
            uuid: "",
            data: {},
            others:{}
        };
        this.data.tabSource = [{
                text: "data",
                key: "data"
            },
            {
                text: 'others',
                key: 'others'
            }
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
    onDataChange: function(e) {
        // send message to page, update instance by uuid and path
        var fn = function(uuid, path, value) {
            window.postMessage({
                type: 'FROM_CONTENT_SCRIPT',
                action: 'UPDATE_INSTANCE',
                payload: {
                    uuid: uuid,
                    path: path,
                    value: value
                }
            }, '*');
        };
        var uuid = this.data.currentNode.uuid;
        chrome.devtools.inspectedWindow.eval(
            '(' + fn + ')(' + JSON.stringify(uuid) + ',' + JSON.stringify(e.path) + ',' + JSON.stringify(e.value) + ')', {
                useContentScriptContext: true
            },
            function() {}
        );
    },
    onInspectNode: function() {
        var uuid = this.data.currentNode.uuid;
        chrome.devtools.inspectedWindow.eval(
            "var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) { return n.uuid === " + "'" + uuid + "'" + "})[0];" +
            "if (node) {" +
            "    inspect(node.group && node.group.children && node.group.children[0] && node.group.children[0].node && node.group.children[0].node() || node.parentNode);" +
            "}",
            function(result, isException) {
                if (isException) {
                    console.log(prefix + "Inspect Error: ", isException);
                }
            }
        );
    },
    updateOthersData: function(uuid){
        function getOthersData (uuid){
            var othersNameArr = ['_directives','_filters', '_animations'];
            var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) { return n.uuid === uuid })[0];
            if (node) {
                var constructor = node.constructor;
                var result = {};
                for (var prop in constructor) {
                    if ( othersNameArr.indexOf(prop) != -1) {
                        var tempObj= {};
                        for (var key in constructor[prop]) {
                            //tempObj[key] =  constructor[prop][key]; can't be function
                            tempObj[key] = "function";
                        }
                        result[prop] = tempObj;
                    }
                }
                return result;
            }
        }
        chrome.devtools.inspectedWindow.eval(
            "(" + getOthersData.toString() + ")" + "("  + JSON.stringify(uuid) + ")",
            function(result, isException) {
                if (isException) {
                    console.log(prefix + "Inspect Error: ", isException);
                    return;
                }
                this.data.currentNode.others =  result;
                this.$update();
            }.bind(this)
        );
    }
});

tabsComponent = Regular.extend({
    name: 'tabs',
    template: '#tabs',
    onTabClick: function(key) {
        if (this.data.selected === key) {
            return;
        }
        this.$emit('change', key);
    }
});

var sidebarPaneComponent = Regular.extend({
    name: 'sidebarPane',
    template: '#sidebarPane'
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

findElementByName = function(nodes, name, container) {
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) {
            container.push(nodes[i].uuid);
        }
        if (nodes[i].childNodes.length) {
            findElementByName(nodes[i].childNodes, name, container);
        }
    }
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

displayWarnning = function() {
    if (elementView.data.loading) {
        elementView.data.loading = false;
        elementView.$update();
    }
};

foucsNode = function(uuid) {
    var elementViewDOM = document.querySelector(".elementTree");
    var elementViewRect = elementViewDOM.getBoundingClientRect();
    var evTop = elementViewRect.top;
    var evHeight = elementViewRect.height;
    var node = findElementByUuid(devtools.data.nodes, uuid);
    var path = [];
    var i;
    var currTop;

    sidebarView.data.currentNode = node;
    sidebarView.$update();
    searchPathWarpper(elementView._children, uuid, path);
    for (i = 0; i < path.length; i++) {
        path[i].data.opened = true;
    }
    if (lastSelected) {
        lastSelected.data.selected = false;
    }
    lastSelected = path[0];
    path[0].data.selected = true;
    printInConsole(uuid);
    elementView.$update();
    currTop = path[0].group.children[0].last().getBoundingClientRect().top;
    if ((currTop > evHeight) || (currTop < 0)) {
        if (currTop < 0) {
            elementViewDOM.scrollTop = Math.abs(currTop);
        } else {
            elementViewDOM.scrollTop += (currTop - evHeight);
        }
    }
};

// left element view
elementView = devtools.$refs.elementView;
// right sidebar view
sidebarView = devtools.$refs.sidebarView;

// register custom events
devtools
    .$on("initNodes", function(nodes) {
        console.log(prefix + "On initNodes.");
        this.data.nodes = nodes;
        sidebarView.data.currentNode = nodes[0];
        elementView.data.loading = false;
        elementView.data.nodes = makeElementTree(nodes, []);
        sidebarView.updateOthersData(nodes[0].uuid);
        sidebarView.$update();
        elementView.$update();
    })
    .$on("clickElement", function(uuid) {
        if (uuid !== sidebarView.data.currentNode.uuid) {
            var node = findElementByUuid(this.data.nodes, uuid);
            sidebarView.data.currentNode = node;
            sidebarView.updateOthersData(uuid);
            sidebarView.$update();
        }
        printInConsole(uuid);
    }).$on("stateViewReRender", function(nodes) {
        console.log(prefix + "On stateViewRender.");
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, sidebarView.data.currentNode.uuid);
        if (currNode) {
            sidebarView.data.currentNode = currNode;
            sidebarView.$update();
        } else {
            sidebarView.data.currentNode = nodes[0];
            sidebarView.updateOthersData(nodes[0].uuid);
            sidebarView.$update();
        }
    }).$on("elementViewReRender", function(nodes) {
        console.log(prefix + "On elementViewRerender.");
        var oldArr = elementView.data.nodes;
        var newArr = makeElementTree(nodes, []);
        oldArr = snycArr(oldArr, newArr, []);
        elementView.$update();
    }).$on("currentNodeChange", function(uuid) {
        console.log(prefix + "On currentNodeChange.");
        if (sidebarView.data.currentNode.uuid !== uuid) {
            foucsNode(uuid);
        }
    }).$on("reload", function(event) {
        console.log(prefix + "On reload.");
        // wait for the page to fully intialize
        setTimeout(function() {
            injectContentScript(event.tabId);
            setTimeout(displayWarnning, 4000);
        }, 2000);
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
        devtools.$emit("reload", {
            tabId: message.tabId
        });
    }
});

// listen for messge when switch from element tab to regular tab
window.addEventListener("message", function(event) {
    if (event.data.type === "currNodeChange") {
        devtools.$emit("currentNodeChange", event.data.uuid);
    }
}, false);

injectContentScript();

// waiting 4000ms, if still loading, remove loading and show warnning
setTimeout(displayWarnning, 4000);
