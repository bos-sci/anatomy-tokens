# Anatomy tokens

Design tokens for Anatomy, Boston Scientific's global design system.

## Managing variables

Only the Sass variable declarations in the variables folder will be converted to CSS custom properties. Any variable declarations in the mixins folder are ignored as they are only used for the mixins. These variables are added to the ignoredVars array so that any references to those variables are not converted.

## Publishing package

1. Create branch off of `develop` using the pattern `release/vX.Y.Z`
2. `npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]`
3. `npm run build`
4. Create a pull request from `release/vX.Y.Z` into `develop`
5. Create a pull request from `develop` into `main`
6. Checkout and pull `main`
7. `npm publish --access public`
   - Ensure you are logged in locally in the npm CLI

## Scripts

In the project directory, run:

## `npm run build`

This builds the tokens for production in the `lib` folder and outputs Sass and minified CSS.
