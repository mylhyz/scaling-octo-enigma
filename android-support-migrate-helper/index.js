const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const rules = require("./rules");

function replaceImportForLayout(file) {
  const contents = fs.readFileSync(file, { encoding: "utf-8" });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    for (let rule of Object.keys(rules)) {
      if (line.indexOf(rule) !== -1) {
        line = line.replace(rule, rules[rule]);
      }
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(file, newContents, { encoding: "utf-8" });
}

function replaceImportForJava(file) {
  const contents = fs.readFileSync(file, { encoding: "utf-8" });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    for (let rule of Object.keys(rules)) {
      if (line.indexOf(rule) !== -1) {
        line = line.replace(rule, rules[rule]);
      }
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(file, newContents, { encoding: "utf-8" });
}

function recursiveWalkDir(directoryPath, visitFile) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    // 遍历文件和文件夹
    files.forEach((file) => {
      // 构建文件的完整路径
      const fullPath = path.join(directoryPath, file);

      // 获取文件状态
      fs.stat(fullPath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats: " + err);
        } else {
          if (stats.isDirectory()) {
            // 如果是文件夹，递归调用遍历函数
            recursiveWalkDir(fullPath, visitFile);
          } else {
            visitFile(fullPath);
          }
        }
      });
    });
  });
}

function visitFile(file) {
  if (file.endsWith(".java")) {
    replaceImportForJava(file);
  } else if (file.endsWith(".xml") && file.indexOf("res/layout") !== -1) {
    replaceImportForLayout(file);
  }
}

function runMain(argv) {
  if (argv.length != 1) {
    console.log("Wrong arguments!");
    process.exit(1);
  }
  const root = argv[0];
  recursiveWalkDir(root, visitFile);
}

runMain(process.argv.slice(2));
