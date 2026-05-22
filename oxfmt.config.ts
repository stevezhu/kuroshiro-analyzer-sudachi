import { defineConfig, type OxfmtConfig } from 'oxfmt';

export default defineConfig<OxfmtConfig>({
  ignorePatterns: ['dist/'],
  printWidth: 80,
  singleQuote: true,
  jsdoc: {
    commentLineStrategy: 'multiline',
  },
  sortImports: {},
  sortPackageJson: {
    sortScripts: true,
  },
});
