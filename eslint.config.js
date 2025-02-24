import js from "@eslint/js";
export default [
 {
 rules: {
 "no-unused-vars": "warn",
 "no-undef": "warn"
 },
 files: ["*.js"]
 }
];


// import globals from "globals";
// import pluginJs from "@eslint/js";


// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
// ];