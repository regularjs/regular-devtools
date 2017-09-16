module.exports = {
    entry: './src/devtools/devtools.js',
    filename: {
        js: 'devtools.[name].js'
    },
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
