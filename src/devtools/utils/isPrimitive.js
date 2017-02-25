export default function isPrimitive(arg) {
    var type = typeof arg;
    return arg === null || (type !== "object" && type !== "function");
}
