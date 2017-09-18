export default function(Component, Regular) {
    const dom = Regular.dom;

    Component.event('mouseenter', function(elem, fire) {
        function update(ev) {
            fire(ev);
        }
        dom.on(elem, "mouseenter", update);
        return function destroy() { // return a destroy function
            dom.off(elem, "mouseenter", update);
        };
    });
}
