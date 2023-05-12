const fs = require("fs");
const sass = require("sass");
const path = require("path");

const ignoredVars = ["fs-.+", "space", "key", "key"];

const convertVarDefinitions = (scss) => {
  return scss.replaceAll(
    /\$([\w-]+):\s*([^;{]+)(?:[;\n]|(?=\s*\}))/g,
    (match) => {
      const pair = [
        match.slice(0, match.indexOf(":")),
        match.slice(match.indexOf(":") + 1).replaceAll(";", ""),
      ];
      const name = pair[0].slice(1);
      const getValues = (value) => {
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
      };
      const values = getValues(pair[1]);
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

const convertVarInstances = (scss) => {
  return scss.replaceAll(/\$[a-zA-Z0-9_-]+/g, (match) => {
    const varName = match.slice(1);
    if (ignoredVars.some((v) => varName.match(new RegExp(v)))) {
      return match;
    }
    return `var(--${varName})`;
  });
};

const createFolder = (folderName) => {
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (err) {
    console.error(err);
  }
};

const isFile = (fileName) => {
  return fs.lstatSync(fileName).isFile();
};

const getFiles = (dirPath) => {
  return fs
    .readdirSync(dirPath)
    .map((fileName) => {
      return path.join(dirPath, fileName);
    })
    .filter(isFile);
};

const convert = () => {
  const srcPath = "src/sass";
  const buildPath = "build";
  const libPath = "lib";
  createFolder(buildPath);
  createFolder(buildPath + "/variables");
  createFolder(buildPath + "/mixins");
  createFolder(libPath);

  // Convert sass variables to css custom properties and output to build folder
  const varFiles = getFiles(srcPath + "/variables");
  varFiles.forEach((file) => {
    const scss = fs.readFileSync(file, {
      encoding: "utf8",
    });
    const convertedVars = convertVarInstances(convertVarDefinitions(scss));
    fs.writeFileSync(file.replace(srcPath, buildPath), convertedVars);
  });

  // Copy over global and mixins to build folder
  fs.copyFileSync(srcPath + "/tokens.scss", buildPath + "/tokens.scss");
  const mixinFiles = getFiles(srcPath + "/mixins");
  mixinFiles.forEach((file) => {
    const scss = fs.readFileSync(file, {
      encoding: "utf8",
    });
    const convertedVars = convertVarInstances(scss);
    fs.writeFileSync(file.replace(srcPath, buildPath), convertedVars);
  });

  const compiledCSS = sass.compile(buildPath + "/tokens.scss");
  fs.writeFileSync(libPath + "/tokens.css", compiledCSS.css);
};

convert();
