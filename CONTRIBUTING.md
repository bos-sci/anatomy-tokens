# Anatomy Tokens

Design tokens for Anatomy, Boston Scientific's global design system.

## Managing Variables

Only the Sass variable declarations in the variables folder will be converted to CSS custom properties. Any variable declarations in the mixins folder are ignored as they are only used for the mixins. These variables are added to the ignoredVars array so that any references to those variables are not converted.

## Scripts

In the project directory, you can run:

## `npm run build`

Builds the tokens for production in the `lib` folder. The output includes scss and minified css.
