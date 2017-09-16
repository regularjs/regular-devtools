module.exports = {
    entry: './src/frontend/inject.js',
    filename: {
        js: 'inject.bundle.js'
    },
    minimize: true,
    sourceMap: true,
    html: false,
    vendor: false
};
