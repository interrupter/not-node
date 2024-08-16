const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

module.exports = [
    {
        ignores: [
            "node_modules/**/*",
            "src/rollup.js",
            "src/repos.js",
            "src/lib.js",
        ],
    },
    ...compat.extends(
        "eslint:recommended",
        //"plugin:node/recommended",
        "plugin:sonarjs/recommended-legacy"
    ),
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.mongo,
                ...globals.mocha,
            },

            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                requireConfigFile: false,
                allowImportExportEverywhere: false,

                ecmaFeatures: {
                    globalReturn: false,
                },
            },
        },

        rules: {
            //    "node/exports-style": ["error", "module.exports"],
            /*"node/file-extension-in-import": ["error", "always"],
            "node/prefer-global/buffer": ["error", "always"],
            "node/prefer-global/console": ["error", "always"],
            "node/prefer-global/process": ["error", "always"],
            "node/prefer-global/url-search-params": ["error", "always"],
            "node/prefer-global/url": ["error", "always"],
            "node/no-unpublished-require": "warn",*/

            indent: [
                "error",
                4,
                {
                    SwitchCase: 1,
                },
            ],

            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            "no-useless-escape": [0],
        },
    },
];
