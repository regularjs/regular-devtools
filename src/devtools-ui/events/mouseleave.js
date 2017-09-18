export default function(Component, Regular) {
    const dom = Regular.dom;

    Regular.event('mouseleave', function(elem, fire) {
        function update(ev) {
            fire(ev);
        }
        dom.on(elem, "mouseleave", update);
        return function destroy() { // return a destroy function
            dom.off(elem, "mouseleave", update);
        };
    });
}
