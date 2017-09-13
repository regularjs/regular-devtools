export default function(...args) {
    args.unshift('[Regular Devtools]');
    console.log.apply(console, args);
}
