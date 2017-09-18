import Regular from 'regularjs';
import JsonTreeProp from './JsonTreeProp';
import './JsonTree.css';

const JsonTree = Regular.extend({
    template: `
        <div class='json-tree'>
            {#list Object.keys(source) as k}
                <JsonTreeProp path={k} key={k} value={source[k]} />
            {/list}
        </div>
    `,
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
    },
    isJsonTree() {
        return true;
    }
});

JsonTree.component('JsonTreeProp', JsonTreeProp);

export default JsonTree;
