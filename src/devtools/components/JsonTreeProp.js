import Regular from 'regularjs';
import {isPrimitive, type} from '../utils';

const JsonTreeProp = Regular.extend({
    template: `
        <div class='json-tree-data'>
            <div class='json-tree-data-key'>
                <img
                    src="/assets/arrow.svg"
                    alt="arrow"
                    class="arrow item {opened ? 'arrow-down' : null} {hasChildren ? '': 'hide'}"
                    on-click={opened = !opened}
                />
                <span class="key item" on-click={opened = !opened}>{key + ':'}</span>

                <span on-dblclick="{ this.onEdit() }">
                {#if !editing}
                    {#if this.isPrimitive(value)}
                        {#if type === 'String'}
                            <span class='item string'>"{value}"</span>
                        {#else}
                            <span class='item primitive'>{value}</span>
                        {/if}
                    {#elseif type === 'Array'}
                        <span class='item others'>Array[{value.length}]</span>
                    {#else}
                        <span class='item others'>{type}</span>
                    {/if}
                {/if}
                <input
                    r-hide="{ !editing }"
                    class="edit"
                    type="text"
                    value="{ type === 'String' ? JSON.stringify(value) : value }"
                    on-blur="{ this.onBlur($event) }"
                    on-keyup="{ this.onEnter($event) }"
                    ref="edit"
                >
                </span>
            </div>
            {#if opened && hasChildren}
            <div class='json-tree-data-props' style='padding-left:20px'>
                {#list Object.keys(value) as k}
                    <JsonTreeProp path={path + '.' + k} key={k} value={value[k]} padding={true} />
                {/list}
            </div>
            {/if}
        </div>
    `,
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
        if (this.data.value === 'function') {
            return;
        }
        if (!this.isPrimitive(this.data.value)) {
            return;
        }
        this.data.editing = true;
        this.$update();
        // select all when active
        var input = this.$refs.edit;
        if (type(this.data.value) === "String") {
            input.setSelectionRange(1, input.value.length - 1);
        } else {
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
            e.target.value = (type(tmp) ? JSON.stringify(tmp) : tmp);
        }

        // if not primitive or new value equals original one, return
        if (!this.isPrimitive(tmp) || tmp === this.data.value) {
            return;
        }

        var parent = this.$parent;
        while (parent) {
            if (typeof parent.isJsonTree === 'function' && parent.isJsonTree() === true) {
                parent.$emit('change', {
                    path: this.data.path,
                    value: tmp,
                    oldValue: this.data.value
                });
                break;
            }
            parent = parent.$parent;
        }
        // TODO: maybe this can be deleted
        this.data.value = tmp;
        this.$update();
    },
    isPrimitive: isPrimitive,
    type: type
});

JsonTreeProp.component('JsonTreeProp', JsonTreeProp);

export default JsonTreeProp;
