module.exports = {
    entry: './src/devtools-ui/index.js',
    copy: [
        {
            from: 'src/devtools-ui/media',
            to: 'static/media',
        },
    ],
    webpack( config ) {
        config.resolve.alias[ 'regularjs' ] = require.resolve( 'regularjs/dist/regular.js' );
        return config;
    },
    minimize: true,
    sourceMap: true,
    extractCSS: true,
    vendor: true
};
