// the real devtools script
// the UI layer of devtools
import Regular from "regularjs";
import CircularJSON from "../shared/circular-json";
import log from '../shared/log';
import {enter, input, mouseenter, mouseleave} from './events';
import {
    printInConsole,
    findElementByUuid,
    inspectNodeByUUID,
    updateInstanceByUUIDAndPath,
    highlightNode,
    getOthersData,
    makeElementTree,
    syncArr
} from './utils';

// components
import DevtoolsViewComponent from './components/DevtoolsView';

// register custom events
Regular.use(enter);
Regular.use(input);
Regular.use(mouseenter);
Regular.use(mouseleave);

// variables
var backgroundPageConnection;
var injectContentScript;
var devtools;
var sidebarView;
var elementView;
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

// init devtools
devtools = new DevtoolsViewComponent({
    data: {
        nodes: [],
        lastSelected: null
    }
}).$inject("#devtoolsInject");

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
        elementView.data.nodes = syncArr(oldArr, newArr, []);
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
