import Regular from 'regularjs';
import Header from './Header';
import SidebarView from './SidebarView';
import ElementView from './ElementView';
import {searchPath, printInConsole, enter, exit} from '../utils';

// Regular components for devtools' UI
const DevtoolsViewComponent = Regular.extend({
    template: `
        <devtools-header
            inspecting="{ inspecting }"
            on-inspect="{ this.onInspect() }"
            on-refresh="{ this.onRefresh() }"
            on-visit-github="{ this.onVisitGithub() }"
        ></devtools-header>

        <div class="devtoolsMain">
            <devtools-element ref=elementView isolate />
            <devtools-sidebar ref=sidebarView isolate />
        </div>
    `,
    data: {
        inspecting: false
    },
    onVisitGithub: function() {
        this.$emit("openNewTab", "https://github.com/regularjs/regular-devtools");
    },
    onInspect: function() {
        if (this.data.inspecting) {
            this.data.inspecting = false;
            this.$refs.sidebarView.$emit("lockHighLight", false);
            exit();
        } else {
            this.data.inspecting = true;
            this.$refs.sidebarView.$emit("lockHighLight", true);
            enter();
        }
        this.$update();
    },
    onRefresh: function() {
        chrome.devtools.inspectedWindow.reload();
    },
    focusNode: function(uuid) {
        const elementViewDOM = document.querySelector(".elementTree");
        const elementView = this.$refs.elementView;
        const relativeOffset = elementView._children[0].group.children[0].last().getBoundingClientRect().top;
        // unselect last selected
        if (this.data.lastSelected) {
            this.data.lastSelected.data.selected = false;
        }

        // update sidebarView
        this.$emit("clickElement", uuid);

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
        console.log(currTop);
        elementViewDOM.scrollTop = currTop - relativeOffset;
    }
});

DevtoolsViewComponent.component('devtools-header', Header);
DevtoolsViewComponent.component('devtools-sidebar', SidebarView);
DevtoolsViewComponent.component('devtools-element', ElementView);

export default DevtoolsViewComponent;
