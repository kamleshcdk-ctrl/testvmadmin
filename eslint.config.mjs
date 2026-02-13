// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      // HeadlessUI has components like "Dialog", "Menu", etc.
      "vue/no-reserved-component-names": "warn",
      // The 'Panel' component could be renamed to enable this, also index.vue
      "vue/multi-word-component-names": "off",
      // formatter and linter do not agree, formatter adds the self closing <img/>
      "vue/html-self-closing": "off",
      // formatter and linter do not agree
      "vue/first-attribute-linebreak": "off",
      "no-undef": "off", // Needed for Auto Import
      "no-alert": "error",
      'no-console': 'warn',
      // some are needed to allow volt imports
      'import/consistent-type-specifier-style': 'off'
    }
  },
)
