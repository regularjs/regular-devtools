module.exports = {
    entry: './src/extension/inject.js',
    filename: {
        js: 'inject.bundle.js'
    },
    copy: [
        {
            from: 'src/extension',
            to: './',
        },
    ],
    minimize: true,
    sourceMap: true,
    html: false,
    vendor: false
};
