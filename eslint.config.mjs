import globals from "globals"

import jsLint from "@eslint/js"
import tsLint from "typescript-eslint"
import vueLint from "eslint-plugin-vue"

export default [
    {
        // https://eslint.org/docs/latest/use/configure/ignore
        ignores: [
            "**/node_modules",
            "**/dist",
            "**/dist-electron",
            "**/coverage",
            "src-tauri/target",
            "src-tauri/gen",
            "public",
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
    ...vueLint.configs["flat/essential"],
    // test files may use looser typing for mocks
    {
        files: ["**/*.test.ts", "**/*.spec.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    }
]
