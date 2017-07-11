import Regular from 'regularjs';

const Tabs = Regular.extend({
    template: `
        <div class="tabs">
            <div class="tabs-header">
                <div class="tabs-header-items">
                    {#list source as s}
                        <div class="tabs-header-item" on-click="{ this.onTabClick( s.key ) }">
                            { s.text }
                        </div>
                    {/list}
                    <div class="tab-indicator" style="{ 'transform:translateX(' + currentIndex*60 + 'px)'}"></div>
                </div>
            </div>
        </div>
    `,
    onTabClick: function(key) {
        if (this.data.selected === key) {
            return;
        }
        this.$emit('change', key);
    }
});

export default Tabs;
