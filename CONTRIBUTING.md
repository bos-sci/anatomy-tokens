# Anatomy tokens

Design tokens for Anatomy, Boston Scientific's global design system.

## Managing variables

Only the Sass variable declarations in the variables folder will be converted to CSS custom properties. Any variable declarations in the mixins folder are ignored as they are only used for the mixins. These variables are added to the ignoredVars array so that any references to those variables are not converted.

## Publishing package

1. Create branch off of `develop` using the pattern `release/vX.Y.Z`
2. `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`
3. Create a pull request from `release/vX.Y.Z` into `develop`
4. Create a pull request from `develop` into `main`
5. Publish a release in GitHub
   - This will trigger an npm publish

\* _The repository secret `NPM_TOKEN` is an auth token that allows GitHub to publish. It comes from Ash Johns' npm account and is set to not expire._

## Scripts

In the project directory, run:

## `npm run build`

This builds the tokens for production in the `lib` folder and outputs Sass and minified CSS.

## `npm run version`

This updates the tokens version number in the readme, and stages the readme changes in git. This [runs automatically during the `npm version` command](https://docs.npmjs.com/cli/v7/commands/npm-version#description) before the commit and after the package version change. It does not need to be run manually.
