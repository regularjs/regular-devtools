import Regular from 'regularjs';
import SidebarView from './SidebarView';
import ElementView from './ElementView';
import {findElementByUuid, searchPath, printInConsole} from '../utils';

// Regular components for devtools' UI
const DevtoolsViewComponent = Regular.extend({
    template: `
        <div class='regualrDevtools'>
            <div class='devtoolsHeader roboto'>
                <div class="devtoolsHeader-container logo">
                    Regular Devtools
                </div>
                <div class="devtoolsHeader-container refresh">
                    <img src='/assets/refresh.svg' on-click={this.onRefresh()} class='devtoolsHeader-refresh' title="Refresh"/>
                </div>
            </div>
            <div class="devtoolsMain">
                <ElementView ref=elementView isolate />
                <SidebarView ref=sidebarView isolate />
            </div>
        </div>
    `,
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    },
    focusNode: function(uuid) {
        const elementViewDOM = document.querySelector(".elementTree");
        const {height: evHeight} = elementViewDOM.getBoundingClientRect();

        const sidebarView = this.$refs.sidebarView;
        const elementView = this.$refs.elementView;

        // unselect last selected
        if (this.data.lastSelected) {
            this.data.lastSelected.data.selected = false;
        }

        // update sidebarView
        sidebarView.data.currentNode = findElementByUuid(this.data.nodes, uuid);
        sidebarView.$update();

        // update elementView
        const path = [];
        searchPath(elementView._children, uuid, path);
        for (let i = 0; i < path.length; i++) {
            path[i].data.opened = true;
        }
        this.data.lastSelected = path[0];
        path[0].data.selected = true;
        printInConsole(uuid);
        elementView.$update();

        // scroll into view
        const currTop = path[0].group.children[0].last().getBoundingClientRect().top;
        if ((currTop > evHeight) || (currTop < 0)) {
            if (currTop < 0) {
                elementViewDOM.scrollTop = Math.abs(currTop);
            } else {
                elementViewDOM.scrollTop += (currTop - evHeight);
            }
        }
    }
});

DevtoolsViewComponent.component('SidebarView', SidebarView);
DevtoolsViewComponent.component('ElementView', ElementView);

export default DevtoolsViewComponent;
