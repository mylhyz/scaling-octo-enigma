const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function recursiveWalkDir(directoryPath, visitFile) {
  fs.stat(directoryPath, (err, stats) => {
    if (err) {
      console.error("Error getting file stats: " + err);
    } else {
      if (stats.isDirectory()) {
        // 如果判断是文件夹，读取文件夹下所有文件
        fs.readdir(directoryPath, (err, files) => {
          if (err) {
            return console.log("Unable to scan directory: " + err);
          }

          // 遍历文件和文件夹
          files.forEach((file) => {
            // 构建文件的完整路径
            const fullPath = path.join(directoryPath, file);
            recursiveWalkDir(fullPath, visitFile);
          });
        });
      } else {
        visitFile(directoryPath);
      }
    }
  });
}

function visitFile(file) {
  const SourceCode = fs.readFileSync(file, { encoding: "utf-8" });
  const AST = parser.parse(SourceCode);
  traverse(AST, {
    VariableDeclaration(path) {
      path.node.declarations.forEach((declaration) => {
        if (declaration.init && declaration.init.type === "CallExpression") {
          const callee = declaration.init.callee;
          if (callee.type === "Identifier" && callee.name === "require") {
            const args = declaration.init.arguments;
            if (args.length === 1 && args[0].type === "StringLiteral") {
              console.log(`import ${declaration.id.name} from "${args[0].value}"`);
            }
          }
        }
      });
    },
  });
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
