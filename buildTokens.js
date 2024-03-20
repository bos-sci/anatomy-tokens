import fs from 'fs';
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

const getConfig = (destination) => ({
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath: 'lib/scss/',
      files: [
        {
          destination: `${destination}.scss`,
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
          destination: `${destination}.less`,
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
          destination: `${destination}.css`,
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
      ...getConfig(`${brand.name}/${mode}`)
    }).buildAllPlatforms();
  });
});

fs.cpSync('src/sass/base-styles', 'lib/scss/base-styles', { recursive: true });
fs.cpSync('src/fonts', 'lib/fonts', { recursive: true });
