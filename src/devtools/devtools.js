// the real devtools script
// the UI layer of devtools
import Regular from "regularjs";
import CircularJSON from "../shared/circular-json";
import log from '../shared/log';
import {enter, input, mouseenter, mouseleave} from './events';
import {
    printInConsole,
    findElementByUuid, findElementByName, findElementByUuidNonRecursive,
    inspectNodeByUUID,
    updateInstanceByUUIDAndPath,
    highlightNode,
    getOthersData
} from './utils';

// components
import DevtoolsViewComponent from './components/DevtoolsView';
import Element from './components/Element';
import SearchView from './components/SearchView';

// register custom events
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
.component('element', Element)
.component('searchView', SearchView);

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

// listen for custom events
sidebarView
    .$on("dataChange", ({uuid, path, value}) => {
        updateInstanceByUUIDAndPath({uuid, path, value});
    })
    .$on("inspectNode", uuid => {
        inspectNodeByUUID(uuid);
    })
    .$on("highlightNode", ({uuid, inspectable}) => {
        highlightNode(uuid, inspectable);
    })
    .$on("updateOthersData", uuid => {
        getOthersData(uuid).then(data => {
            sidebarView.data.others = data;
            sidebarView.$update();
        });
    });

devtools
    .$on("initNodes", function(nodesStr) {
        log("On initNodes.");
        let nodes = CircularJSON.parse(nodesStr);
        this.data.nodes = nodes;
        sidebarView.data.currentNode = nodes[0];
        elementView.data.loading = false;
        elementView.data.nodes = makeElementTree(nodes, []);
        sidebarView.$emit('updateOthersData', nodes[0].uuid);
        sidebarView.$update();
        elementView.$update();
        ready = true;
    })
    .$on("clickElement", function(uuid) {
        if (uuid !== sidebarView.data.currentNode.uuid) {
            var node = findElementByUuid(this.data.nodes, uuid);
            sidebarView.data.currentNode = node;
            sidebarView.$emit('updateOthersData', uuid);
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
            sidebarView.$emit('updateOthersData', currNode.uuid);
            sidebarView.$update();
        } else {
            sidebarView.data.currentNode = nodes[0];
            sidebarView.$emit('updateOthersData', nodes[0].uuid);
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
            devtools.focusNode(uuid);
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
