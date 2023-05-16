const fs = require("fs");
const sass = require("sass");
const path = require("path");
const postcss = require("postcss");
const cssnano = require("cssnano");
const combineSelectors = require("postcss-combine-duplicated-selectors");

const paths = {
  src: "src",
  build: "build",
  lib: "lib",
  get sass() {
    return this.src + "/sass";
  },
};

/**
 * Variables to be ignored when translating from scss variables to css variables.
 * These are ignored as there is no 1-1 equivalent way to do these in css.
 */
const ignoredVars = ["fs-.+", "space", "key", "key"];

/**
 * Converts all sass variable declarations into css custom property declarations.
 * e.g. $foo: 'bar' -> :root {--foo: 'bar'}
 * @param {string} scss
 * @return {string}
 */
const convertVarDeclarations = (scss) => {
  return scss.replaceAll(
    /\$([\w-]+):\s*([^;{]+)(?:[;\n]|(?=\s*\}))/g, // Regex to get all sass var declarations e.g. $foo: 'bar'
    (match) => {
      // Split variables into name and value
      const pair = [
        match.slice(0, match.indexOf(":")),
        match.slice(match.indexOf(":") + 1).replaceAll(";", ""),
      ];
      const name = pair[0].slice(1);
      const values = ((value) => {
        // If sass var has multiple values, split into multiple css custom properties e.g. space var
        if (value.trim().charAt(0) == "(") {
          return value
            .replaceAll("\n", "")
            .trim()
            .slice(1, -1)
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v);
        } else {
          return [value.trim()];
        }
      })(pair[1]);

      // Create css custom property
      if (values.length > 1) {
        const valueString = values
          .map((value) => {
            const subName = value.split(":")[0];
            const subValue = value.split(":")[1];
            return `--${name}-${subName}: ${subValue};`;
          })
          .join("\n");
        return `:root {${valueString}}`;
      }
      return `:root {--${name}: ${values[0]}}`;
    }
  );
};

/**
 * Converts all sass variable instances into css custom property instances.
 * e.g. $foo -> var(--foo)
 * @param {string} scss
 * @return {string}
 */
const convertVarInstances = (scss) => {
  return scss.replaceAll(/\$[a-zA-Z0-9_-]+/g, (match) => {
    const varName = match.slice(1);
    if (ignoredVars.some((v) => varName.match(new RegExp(v)))) {
      return match;
    }
    return `var(--${varName})`;
  });
};

/**
 * Checks to see if a folder of the provided name already exists. If not, it creates the folder.
 * @param {string} folderName
 */
const createFolder = (folderName) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Checks if the path points to a file.
 * @param {string} fileName
 * @return {boolean}
 */
const isFile = (fileName) => {
  return fs.lstatSync(fileName).isFile();
};

/**
 * Checks if the path points to a directory.
 * @param {string} fileName
 * @return {boolean}
 */
const isDirectory = (fileName) => {
  return fs.lstatSync(fileName).isDirectory();
};

/**
 * Recursively copies a directory and its contents.
 * @param {string} from
 * @param {string} to
 */
const copyDir = (from, to) => {
  createFolder(to);
  const dirContents = fs.readdirSync(from);
  dirContents.forEach((node) => {
    const fullPath = path.join(from, node);
    if (isFile(fullPath)) {
      fs.copyFileSync(fullPath, path.join(to, node));
    } else if (isDirectory(fullPath)) {
      copyDir(fullPath, path.join(to, node));
    }
  });
};

/**
 * Gets all the files in a directory. Filters out any sub-directories.
 * @param {string} dirPath
 * @return {string[]}
 */
const getFiles = (dirPath) => {
  return fs
    .readdirSync(dirPath)
    .map((fileName) => {
      return path.join(dirPath, fileName);
    })
    .filter(isFile);
};

/**
 * Converts sass tokens into equivalent css tokens where possible.
 *
 */
const buildCssFromSass = () => {
  // Create temporary build folders to write sass with css custom properties to
  createFolder(paths.build);
  createFolder(paths.build + "/variables");
  createFolder(paths.build + "/mixins");

  // Create lib folder which will contain the final tokens package
  createFolder(paths.lib);

  // Convert sass variables to css custom properties and output to temporary build folder
  const varFiles = getFiles(paths.sass + "/variables");
  varFiles.forEach((file) => {
    const scss = fs.readFileSync(file, {
      encoding: "utf8",
    });
    // Convert sass vars into css custom properties
    const convertedVars = convertVarInstances(convertVarDeclarations(scss));
    fs.writeFileSync(file.replace(paths.sass, paths.build), convertedVars);
  });

  // Copy over global and mixins to build folder
  fs.copyFileSync(paths.sass + "/tokens.scss", paths.build + "/tokens.scss");
  const mixinFiles = getFiles(paths.sass + "/mixins");
  mixinFiles.forEach((file) => {
    const scss = fs.readFileSync(file, {
      encoding: "utf8",
    });
    // Convert sass var instances in mixins to use the newly converted css custom properties
    const convertedVars = convertVarInstances(scss);
    fs.writeFileSync(file.replace(paths.sass, paths.build), convertedVars);
  });

  // Compiles sass (with converted variables) to css
  const compiledCSS = sass.compile(paths.build + "/tokens.scss");
  // Combine duplicate selectors
  postcss([combineSelectors()])
    .process(compiledCSS.css, { from: paths.lib + "/tokens.css" })
    .then((result) => fs.writeFileSync(paths.lib + "/tokens.css", result.css));

  // Create minified css file
  postcss([cssnano()])
    .process(compiledCSS.css, { from: paths.lib + "/tokens.css" })
    .then((result) =>
      fs.writeFileSync(paths.lib + "/tokens.min.css", result.css)
    );

  // Delete build directory
  fs.rmSync(paths.build, { recursive: true, force: true });
};

buildCssFromSass();
copyDir(paths.sass, paths.lib + "/sass");
copyDir(paths.src + "/fonts", paths.lib + "/fonts");