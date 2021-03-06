import Regular from 'regularjs';
import {findElementByUUID} from '../utils';
import './Element.css';

const Element = Regular.extend({
    template: `
        <div class="element__wrapper">
            {#if opened}
            <div class="element__joint" style="left: {level*30 - 5}px;top: 20px;bottom: 10px;"></div>
            {/if}
            <div
                class="element purple {selected ? 'selected' : 'element-tag'}"
                style="padding-left:{level*30}px;}"
                on-click={this.onClick(node)}
                on-mouseenter={this.onMouseEnter(node.uuid, node.inspectable)}
            >
                <div class="borderline"></div>
                <img src="/static/media/arrow.svg"
                    style="margin-left: -10px;"
                    alt="arrow" on-click={opened = !opened}
                    class="arrow ele-item {opened ? 'arrow-down' : null} {node.childNodes.length > 0 ? '': 'hide'}"
                />
                <span class="tag ele-item">&lt;</span>
                <span class="tagname ele-item { node.name === '[anonymous]' ? 'is-anonymous' : '' }">
                    {node.name}
                </span>
                <span class="tag ele-item">
                    {#if node.childNodes.length === 0} /{/if}&gt;{#if node.isIncluded }<span class="ele-include">#inc</span>{/if}
                </span>
            </div>
            {#if opened && node.childNodes.length > 0}
                {#list node.childNodes as n}
                    <element node={n} level={level+1} ></element>
                {/list}
            {/if}
            {#if node.childNodes.length > 0}
            <div
                class="element purple"
                style="padding-left:{level*30}px;{opened ? null : 'display:none;'}"
            >
                <span class="tag ele-item">&lt;/</span>
                <span class="tagname ele-item { node.name === '[anonymous]' ? 'is-anonymous' : '' }">{node.name}</span>
                <span class="tag ele-item">&gt;</span>
            </div>
            {/if}
        </div>
    `,
    data: {
        selected: false,
        opened: false
    },
    onMouseEnter: function(uuid, inspectable) {
        // Communication between two components(not directly related), should refactor using eventbus.
        this.$root.$refs.sidebarView.highLightNode(uuid, inspectable);
    },
    onClick: function(node) {
        let lastSelected = this.$root.data.lastSelected;
        if (lastSelected) {
            if (lastSelected === this) {
                return;
            }

            if (!findElementByUUID(this.$root.data.nodes, lastSelected.data.node.uuid)) {
                this.$root.data.lastSelected = null;
            } else {
                lastSelected.data.selected = false;
            }
        }
        this.data.selected = true;
        this.$root.data.lastSelected = this;
        this.$root.$emit("clickElement", node.uuid);
    }
});

Element.component('element', Element);

export default Element;
