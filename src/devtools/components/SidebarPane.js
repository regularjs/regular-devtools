import Regular from 'regularjs';

const SidebarPane = Regular.extend({
    template: `
        <div class="sidebar-pane">
            <div class="sidebar-pane-header">
                { title }
            </div>
            <div class="sidebar-pane-content">
                {#inc this.$body}
            </div>
        </div>
    `
});

export default SidebarPane;
