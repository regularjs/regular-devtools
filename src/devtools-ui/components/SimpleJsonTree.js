import Regular from 'regularjs';

const SimpleJsonTree = Regular.extend({
    template: `
        <div class='json-tree simpleJsonTree'>
            {#list Object.keys(source) as k}
              <div class="json-tree-data">
                  <div class='json-tree-data-key'>
                      <span class="key item">{k}{source[k] ===''? '': ':'}</span>
                      <span class='item gray'>{source[k]}</span>
                  </div>
              </div>
            {/list}
        </div>
    `,
    config() {
        this.data.source = this.data.source || {};
    }
});

export default SimpleJsonTree;
