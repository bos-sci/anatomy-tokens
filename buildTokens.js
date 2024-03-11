import StyleDictionary from 'style-dictionary';

StyleDictionary.registerTransform({
  type: `name`,
  transitive: true,
  name: `name/shorten`,
  transformer: (token) => token.name
});

const platformsConfig = {
  transforms: ['name/shorten'],
  options: {
    outputReferences: true
  }
};

const getConfig = (theme, mode) => ({
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'lib/scss/',
      files: [
        {
          destination: `${theme}/${mode}.scss`,
          format: 'scss/variables'
        }
      ],
      ...platformsConfig
    },
    less: {
      transformGroup: 'less',
      buildPath: 'lib/less/',
      files: [
        {
          destination: `${theme}/${mode}.less`,
          format: 'less/variables'
        }
      ],
      ...platformsConfig
    },
    css: {
      transformGroup: 'css',
      buildPath: 'lib/css/',
      files: [
        {
          destination: `${theme}/${mode}.css`,
          format: 'css/variables'
        }
      ],
      ...platformsConfig
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
