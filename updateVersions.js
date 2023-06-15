import fs from 'fs';

const pkg = JSON.parse(
  fs.readFileSync('package.json', {
    encoding: 'utf8'
  })
);

const readme = fs.readFileSync('README.md', {
  encoding: 'utf8'
});

fs.writeFileSync('README.md', readme.replaceAll(/anatomy-tokens@\d+\.\d+\.\d+/g, `anatomy-tokens@${pkg.version}`));
