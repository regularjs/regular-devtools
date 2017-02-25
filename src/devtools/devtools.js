// the real devtools script
// the UI layer of devtools
import Regular from "regularjs";
import CircularJSON from "../shared/circular-json";
import log from '../shared/log';
import {enter, input, mouseenter, mouseleave} from './events';
import {printInConsole, findElementByUuid, findElementByName, findElementByUuidNonRecursive, inspectNodeByUUID} from './utils';

// components
import DevtoolsViewComponent from './components/DevtoolsView';
import SidebarPane from './components/SidebarPane';
import SimpleJsonTree from './components/SimpleJsonTree';
import JsonTree from './components/JsonTree';
import Tabs from './components/Tabs';
import Element from './components/Element';

// register events
Regular.use(enter);
Regular.use(input);
Regular.use(mouseenter);
Regular.use(mouseleave);

// variables
var backgroundPageConnection;
var injectContentScript;
var makeElementTree;
var devtools;
var sidebarView;
var elementView;
var snycArr;
var focusNode;
var displayWarnning;
var searchView;
var ready = false;

// Create a current inspected page unique connection to the background page, by its tabId
backgroundPageConnection = chrome.runtime.connect({
    name: "devToBackCon_" + chrome.devtools.inspectedWindow.tabId
});

injectContentScript = function(tabId) {
    backgroundPageConnection.postMessage({
        tabId: tabId || chrome.devtools.inspectedWindow.tabId,
        file: "/src/frontend/content.js"
    });
};

makeElementTree = function(nodes, container) {
    for (var i = 0; i < nodes.length; i++) {
        var node = {
            name: nodes[i].name,
            uuid: nodes[i].uuid,
            shadowFlag: nodes[i].shadowFlag,
            inspectable: nodes[i].inspectable,
            childNodes: []
        };
        container.push(node);
        if (nodes[i].childNodes.length) {
            makeElementTree(nodes[i].childNodes, node.childNodes);
        }
    }
    return container;
};

Regular.extend({
    name: "elementView",
    template: `
        <div class='elementView' on-mouseleave={this.onMouseLeave()}>
            <div class="elementTree">
                {#if loading }
                    <img src='/assets/loading.svg' class='loading-img' />
                {#else}
                {#if nodes.length > 0}
                    {#list nodes as node}
                        <element node={node} level={1} >
                        </element>
                    {/list}
                {#else}
                    <div class="warnning">There is no Regular instance detected. Please check if you are using the latest version of Regularjs. Or try reloading Regular Devtools</div>
                {/if}
            {/if}
            </div>
            <searchView isolate ref=searchView ></searchView>
        </div>
    `,
    data: {
        nodes: [],
        loading: true
    },
    onMouseLeave: function() {
        sidebarView.highLightNode(null, false);
    }
})
.component('element', Element);

Regular.extend({
    name: "searchView",
    template: `
        <div class="searchView">
            <input type="text" r-model={value} on-enter={this.onEnter()} on-input={this.onInput()} class="searchView-input" placeholder="Search By Component Name"/>
            <div class="searchView-btns">
                <div class="searchView-text">
                    {#if hasSearched && !resultList.length}
                        Not found
                    {#else}
                        {#if resultList.length}
                            {index + 1}/{resultList.length} found
                        {/if}
                    {/if}
                </div>
                <img src="/assets/search.svg" class="searchView-btn" on-click={this.search()} alt="search" title="Search"/>
                <img src="/assets/prev.svg" class="searchView-btn" on-click={this.next(-1)} alt="prev" title="Previous result"/>
                <img src="/assets/next.svg" class="searchView-btn" on-click={this.next(1)} alt="next" title="Next result"/>
            </div>
        </div>
    `,
    data: {
        value: "",
        resultList: [],
        index: 0,
        hasSearched: false
    },
    onInput: function() {
        this.data.hasSearched = false;
    },
    onEnter: function() {
        if (this.data.hasSearched) {
            this.next(1);
        } else {
            this.search();
        }
    },
    search: function() {
        if (!this.data.value) {
            return;
        }
        var reg = new RegExp(this.data.value);
        this.data.resultList = [];
        this.data.index = 0;
        findElementByName(devtools.data.nodes, reg, this.data.resultList);
        this.data.hasSearched = true;
        if (this.data.resultList.length) {
            focusNode(this.data.resultList[0]);
        }
    },
    next: function(dir) {
        var data = this.data;
        if (data.resultList.length) {
            data.index += dir;
            if (data.index === data.resultList.length) data.index = 0;
            if (data.index === -1) data.index = data.resultList.length - 1;
            focusNode(data.resultList[data.index]);
        }
    },
    reset: function() {
        this.data.value = "";
        this.data.resultList = [];
        this.data.index = 0;
        this.data.hasSearched = false;
        this.$update();
    }
});

Regular.extend({
    name: 'sidebarView',
    template: `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="name item">&lt;{currentNode.name}&gt;</div>
                <div class="hint item">$r in the console</div>
            </div>
            <Tabs source="{ tabSource }" selected="{ tabSelected }" on-change="{ this.onTabChange( $event ) }"></Tabs>
            <div class="sidebar-content">
                {#if tabSelected == 'data'}
                <div>
                    {#if currentNode.inspectable }
                        <div class='inspect' on-click={this.onInspectNode(currentNode.uuid)}>
                            inspect
                        </div>
                    {/if}
                    <SidebarPane title="normal">
                        <JsonTree source="{ currentNode.data }" on-change="{ this.onDataChange($event) }" />
                    </SidebarPane>
                    <SidebarPane title="computed">
                        <JsonTree source="{ currentNode.computed }" />
                    </SidebarPane>
                </div>
                {#elseif tabSelected == 'others' && currentNode && others}
                <div>
                    <SidebarPane title="filters">
                        <SimpleJsonTree source="{ others._filters }" />
                    </SidebarPane>
                    <SidebarPane title="directives">
                        <SimpleJsonTree source="{ others._directives }" />
                    </SidebarPane>
                    <SidebarPane title="animations">
                        <SimpleJsonTree source="{ others._animations }" />
                    </SidebarPane>
                </div>
                {#else}
                {/if}
            </div>
        </div>
    `,
    config() {
        // defaultValue of currentNode
        this.data.currentNode = {
            name: "",
            uuid: "",
            data: {}
        };
        // others for currentNode
        this.data.others = {};
        this.data.tabSource = [{
            text: "data",
            key: "data"
        }, {
            text: 'others',
            key: 'others'
        }];
        // defaults to `data` pane
        this.data.tabSelected = 'data';
    },
    onTabChange(key) {
        this.data.tabSelected = key;
        log("Tab is Changed to", key);
        this.$update();
    },
    onDataChange(e) {
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
    onInspectNode: uuid => inspectNodeByUUID(uuid),
    highLightNode(uuid, inspectable) {
        var evalStr = inspectable ? "devtoolsModel.highLighter('" + uuid + "')" : "devtoolsModel.highLighter()";
        chrome.devtools.inspectedWindow.eval(
            evalStr,
            function(result, isException) {
                if (isException) {
                    log("Inspect Error: ", isException);
                }
            }
        );
    },
    updateOthersData(uuid) {
        function getOthersData(uuid) {
            var othersNameArr = ['_directives', '_filters', '_animations'];
            var node = window.__REGULAR_DEVTOOLS_GLOBAL_HOOK__.ins.filter(function(n) {
                return n.uuid === uuid;
            })[0];
            if (node) {
                var constructor = node.constructor;
                var result = {};
                for (var prop in constructor) {
                    if (constructor.hasOwnProperty(prop) && othersNameArr.indexOf(prop) !== -1) {
                        var tempObj = {};
                        var curObj = constructor[prop];
                        var curUI = constructor.prototype;
                        while (curObj && curUI) {
                            var tempArr = [];
                            for (var key in curObj) {
                                if (curObj.hasOwnProperty(key)) {
                                    tempArr.push(key);
                                }
                            }
                            /* eslint-disable no-proto, no-loop-func */

                            tempArr.sort(); // same level sort
                            tempArr.forEach(function(value) {
                                if (!tempObj[value]) { // same command big level not show
                                    if (curUI.constructor._addProtoInheritCache) {
                                        tempObj[value] = "regular";
                                    } else if (curUI.reset && !curUI.__proto__.reset && curUI.__proto__.constructor._addProtoInheritCache) {
                                        var funStr = curUI.reset.toString();
                                        if (funStr.indexOf("this.data = {}") !== -1 && funStr.indexOf("this.config()") !== -1) {
                                            tempObj[value] = "regularUI"; // very low possible be developer's Component
                                        } else {
                                            tempObj[value] = curUI.name === undefined ? '' : curUI.name;
                                        }
                                    } else {
                                        tempObj[value] = curUI.name === undefined ? '' : curUI.name; // same level same color
                                    }
                                }
                            });
                            curObj = curObj.__proto__;
                            curUI = curUI.__proto__;

                            /* eslint-enable no-proto, no-loop-func*/
                        }

                        result[prop] = tempObj;
                    }
                }
                return result;
            }
        }
        chrome.devtools.inspectedWindow.eval(
            "(" + getOthersData.toString() + ")(" + JSON.stringify(uuid) + ")",
            function(result, isException) {
                if (isException) {
                    log("Inspect Error: ", isException);
                    return;
                }
                this.data.others = result;
                this.$update();
            }.bind(this)
        );
    }
})
.component('SidebarPane', SidebarPane)
.component('SimpleJsonTree', SimpleJsonTree)
.component('Tabs', Tabs)
.component('JsonTree', JsonTree);

// init devtools
devtools = new DevtoolsViewComponent({
    data: {
        nodes: [],
        lastSelected: null
    }
}).$inject("#devtoolsInject");

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

displayWarnning = function() {
    if (elementView.data.loading) {
        elementView.data.loading = false;
        elementView.$update();
    }
};

// left element view
elementView = devtools.$refs.elementView;
// right sidebar view
sidebarView = devtools.$refs.sidebarView;
// searchView
searchView = elementView.$refs.searchView;

// register custom events
devtools
    .$on("initNodes", function(nodesStr) {
        log("On initNodes.");
        let nodes = CircularJSON.parse(nodesStr);
        this.data.nodes = nodes;
        sidebarView.data.currentNode = nodes[0];
        elementView.data.loading = false;
        elementView.data.nodes = makeElementTree(nodes, []);
        sidebarView.updateOthersData(nodes[0].uuid);
        sidebarView.$update();
        elementView.$update();
        ready = true;
    })
    .$on("clickElement", function(uuid) {
        if (uuid !== sidebarView.data.currentNode.uuid) {
            var node = findElementByUuid(this.data.nodes, uuid);
            sidebarView.data.currentNode = node;
            sidebarView.updateOthersData(uuid);
            sidebarView.$update();
        }
        printInConsole(uuid);
    }).$on("stateViewReRender", function(nodesStr) {
        log("On stateViewRender.");
        let nodes = CircularJSON.parse(nodesStr);
        this.data.nodes = nodes;
        var currNode = findElementByUuid(nodes, sidebarView.data.currentNode.uuid);
        if (currNode) {
            sidebarView.data.currentNode = currNode;
            sidebarView.updateOthersData(currNode.uuid);
            sidebarView.$update();
        } else {
            sidebarView.data.currentNode = nodes[0];
            sidebarView.updateOthersData(nodes[0].uuid);
            sidebarView.$update();
        }
    }).$on("elementViewReRender", function(nodesStr) {
        log("On elementViewRerender.");
        let nodes = CircularJSON.parse(nodesStr);
        /* eslint-disable no-unused-vars */
        var oldArr = elementView.data.nodes;
        var newArr = makeElementTree(nodes, []);
        elementView.data.nodes = snycArr(oldArr, newArr, []);
        /* eslint-enable no-unused-vars */
        elementView.$update();
    }).$on("currentNodeChange", function(uuid) {
        log("On currentNodeChange.");
        if (sidebarView.data.currentNode.uuid !== uuid) {
            focusNode(uuid);
        }
    }).$on("reload", function(event) {
        ready = false;
        log("On reload.");
        searchView.reset();
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
    if (event.data.type === "currNodeChange" && ready) {
        devtools.$emit("currentNodeChange", event.data.uuid);
    }
}, false);

injectContentScript();

// waiting 4000ms, if still loading, remove loading and show warnning
setTimeout(displayWarnning, 4000);
