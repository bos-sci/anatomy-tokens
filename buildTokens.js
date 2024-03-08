import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  type: `name`,
  transitive: true,
  name: `name/shorten`,
  transformer: (token) => token.name
});

const getConfig = (theme, mode) => ({
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      transforms: ['name/shorten'],
      options: {
        outputReferences: true
      },
      files: [
        {
          destination: `${theme}/${mode}.scss`,
          format: 'scss/variables'
        }
      ]
    },
    less: {
      transformGroup: 'less',
      buildPath: 'build/less/',
      options: {
        outputReferences: true
      },
      files: [
        {
          destination: `${theme}/${mode}.less`,
          format: 'less/variables'
        }
      ]
    },
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      options: {
        outputReferences: true
      },
      files: [
        {
          destination: `${theme}/${mode}.css`,
          format: 'css/variables'
        }
      ]
    }
  }
});

const brands = [
  {
    name: 'corporate',
    modes: ['light', 'dark']
  },
  {
    name: 'watchman',
    modes: ['light', 'dark']
  }
];

brands.forEach((brand) => {
  brand.modes.forEach((mode) => {
    StyleDictionary.extend({
      include: [`tokens/*.json`, `tokens/${brand.name}/globals/*.json`],
      source: [`tokens/${brand.name}/${mode}.json`],
      ...getConfig(brand.name, mode)
    }).buildAllPlatforms();
  });
});
