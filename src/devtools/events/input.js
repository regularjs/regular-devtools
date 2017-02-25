export default function(Component, Regular) {
    const dom = Regular.dom;

    Component.event('input', function(elem, fire) {
        function update(ev) {
            fire(ev); // if key is enter , we fire the event;
        }
        dom.on(elem, "input", update);
        return function destroy() { // return a destroy function
            dom.off(elem, "input", update);
        };
    });
}
