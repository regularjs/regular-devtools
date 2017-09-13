import Regular from 'regularjs';

export default Regular.extend({
    template: `
        <div class="header roboto">
            <div class="header__logo">Regular Devtools</div>

            <div class="header__toolbar">
                <img class="header__inspect" r-md="" id='tt3' src="/assets/target{inspecting ? '_active' : '' }.svg" on-click={this.onInspect()} />
                <img class="header__refresh" r-md="" id='tt1' src='/assets/refresh.svg' on-click={this.onRefresh()} />
                <img class="header__github" r-md="" id='tt4' src='/assets/github.svg' on-click={this.onVisitGithub()} />
                <div class="mdl-tooltip" data-mdl-for="tt3">Select a DOM node to inspect its component</div>
                <div class="mdl-tooltip" data-mdl-for="tt1">Reload</div>
                <div class="mdl-tooltip" data-mdl-for="tt4">Visit project homepage for detailed documentation</div>
            </div>
        </div>
    `,
    onInspect() {
        this.$emit('inspect');
    },
    onRefresh() {
        this.$emit('refresh');
    },
    onVisitGithub() {
        this.$emit('visit-github');
    }
});
