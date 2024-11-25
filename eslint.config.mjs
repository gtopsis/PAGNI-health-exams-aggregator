import globals from "globals"

import jsLint from "@eslint/js"
import tsLint from "typescript-eslint"
import vueLint from "eslint-plugin-vue"

export default [
    {
        // https://eslint.org/docs/latest/use/configure/ignore
        ignores: [
            // only ignore node_modules in the same directory
            // as the configuration file
            "node_modules",
            // so you have to add `**/` pattern to include nested directories
            // for example, if you use pnpm workspace
            "**/node_modules",
            // also you can add a new rule to revert a ignore
            "!./packages/manual-add-lib/node_modules/local-lib.js"
        ]
    },
    // config parsers
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
    },
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: "@typescript-eslint/parser",
                sourceType: "module"
            }
        }
    },
    // config envs
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node }
        }
    },
    // syntax rules
    jsLint.configs.recommended,
    ...tsLint.configs.recommended,
    ...vueLint.configs["flat/essential"]
]
