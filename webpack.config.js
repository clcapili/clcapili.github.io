const path = require('path');

module.exports = {
    name: 'hofstra',
    mode: 'development', // production / development
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: 'site.js',
        libraryTarget: 'var',
        library: 'Hofstra'
    },
    optimization: {
        concatenateModules: true,
        minimize: true,
    }
};