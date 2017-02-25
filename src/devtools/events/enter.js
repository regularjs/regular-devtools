export default function(Component, Regular) {
    const dom = Regular.dom;

    Component.event('enter', function(elem, fire) {
        function update(ev) {
            if (ev.which === 13) { // ENTER key
                ev.preventDefault();
                fire(ev); // if key is enter , we fire the event;
            }
        }
        dom.on(elem, "keypress", update);
        return function destroy() { // return a destroy function
            dom.off(elem, "keypress", update);
        };
    });
}
