module.exports = {
    "extends": "google",
    "installedESLint": true,
    "rules": {
        "indent": ["error", 4],
        "no-negated-condition": 0,
        "no-implicit-coercion":0
    },
    "env": {
        "browser": true,
    },
    "globals": {
        "devtoolsModel": true,
        "chrome":true,
        "Regular":true
    }
};