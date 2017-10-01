import Regular from 'regularjs';
import SidebarPane from './SidebarPane';
import SimpleJsonTree from './SimpleJsonTree';
import JsonTree from './JsonTree';
import Tabs from './Tabs';
import log from '../../shared/log';
import './Sidebar.css';

const Sidebar = Regular.extend({
    template: `
        <div class="sidebar">
            <div class="sidebar__header roboto">
                <div class="sidebar__header-left">
                    {#if currentNode.name}
                        &lt;{currentNode.name}&gt;
                    {/if}
                </div>
                <div class="sidebar__header-right">$r in the console</div>
            </div>

            <Tabs
                currentIndex={ currentTabIndex }
                source="{ tabSource }"
                selected="{ tabSelected }"
                on-change="{ this.onTabChange( $event ) }"
            ></Tabs>

            <div class="sidebar__content">
                {#if tabSelected == 'data'}
                <div>
                    <div class="sidebar__tools">
                        {#if currentNode.inspectable }
                            <div class="sidebar__inspect" on-click={this.onInspectNode(currentNode.uuid)}>
                                inspect
                            </div>
                        {/if}

                        <div class="sidebar__definition" on-click={this.onShowDefinition(currentNode.uuid)}>
                            definition
                        </div>
                    </div>
                    <SidebarPane title="Normal">
                        <JsonTree source="{ currentNode.data }" on-change="{ this.onDataChange($event) }" />
                    </SidebarPane>
                    <SidebarPane title="Computed">
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
            inspectable: false,
            computed: {},
            data: {}
        };
        // others for currentNode
        this.data.others = {};
        this.data.tabSource = [
            {text: "Data", key: "data"},
            {text: 'Others', key: 'others'}
        ];
        // defaults to `data` pane
        this.data.tabSelected = 'data';
        this.data.lockHighlight = false;
    },
    computed: {
        currentTabIndex: {
            get() {
                const source = this.data.tabSource;
                for (let i = 0; i < source.length; i++) {
                    if (this.data.tabSelected === source[i].key) {
                        return i;
                    }
                }
                return 0;
            }
        }
    },
    onTabChange(key) {
        this.data.tabSelected = key;
        this.$update();
        log("Tab is Changed to", key);
    },
    onDataChange({path, value}) {
        const uuid = this.data.currentNode.uuid;
        this.$emit('dataChange', {uuid, path, value});
    },
    onInspectNode(uuid) {
        this.$emit('inspectNode', uuid);
    },
    onShowDefinition(uuid) {
        this.$emit('showDefinition', uuid);
    },
    highLightNode(uuid, inspectable) {
        this.$emit('highLightNode', {uuid, inspectable});
    }
});

Sidebar.component('SidebarPane', SidebarPane);
Sidebar.component('SimpleJsonTree', SimpleJsonTree);
Sidebar.component('Tabs', Tabs);
Sidebar.component('JsonTree', JsonTree);

export default Sidebar;
