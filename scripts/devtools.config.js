module.exports = {
    entry: './src/devtools/devtools.js',
    copy: [
        {
            from: 'src/devtools/media',
            to: 'static/media',
        },
    ],
    webpack( config ) {
        config.output.publicPath = '/dist/';
        config.resolve.alias[ 'regularjs' ] = require.resolve( 'regularjs/dist/regular.js' );
        return config;
    },
    minimize: true,
    sourceMap: true,
    extractCSS: true,
    vendor: true
};
