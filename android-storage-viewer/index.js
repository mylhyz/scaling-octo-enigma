const sqlite3 = require("sqlite3").verbose();
const fs = require("node:fs");

// 基本流程
// 遍历每一个item，对每个路径进行分割，构造出一个树形结构，这个树的节点分为目录和文件，目录下有文件列表，文件只有大小属性

const Tree = { name: "", children: [] };

const createNode = (path, size) => {
  let paths = path.split("/");
  let file = paths[paths.length - 1];
  let dirs = paths.slice(1, paths.length - 1);
  let parent = Tree;
  for (let dir of dirs) {
    // parent指向当前要遍历的根目录
    let children = parent.children;
    let found = false;
    // 遍历所有子路径
    for (let child of children) {
      // 如果子路径名称等于当前遍历的路径，则切换parent
      if (child.name == dir) {
        parent = child;
        found = true;
        break;
      }
    }
    if (!found) {
      // 如果没有找到匹配的子路径，则创建一个
      let newChild = { name: dir, children: [] };
      children.push(newChild);
      parent = newChild;
    }
  }
  parent.children.push({ name: file, size: size });
};

const findNode = (path) => {
  let paths = path.split("/");
  let dirs = paths.slice(1);
  let parent = Tree;
  for (let dir of dirs) {
    let children = parent.children;
    for (let child of children) {
      if (child.name == dir) {
        parent = child;
        break;
      }
    }
  }
  // 这里必然是能够找到parent，这里不考虑路径传入错误的情况
  return parent;
};

const useDepth = (node, depth) => {
  if (depth == 0 || node.children === undefined) {
    if (node && node.children !== undefined) {
      node.children = [];
    }
    return;
  }
  let children = node.children;
  for (let child of children) {
    useDepth(child, depth - 1);
  }
};

const sumSize = (node) => {
  // 计算指定路径下的所有文件大小总和
  if (node.size !== undefined) {
    return node.size;
  }
  let sum = 0;
  const children = node.children;
  for (let child of children) {
    sum = sum + sumSize(child);
  }
  return sum;
};

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

const normalSize = (size) => {
  if (size > GB) {
    return (size / GB).toFixed(2) + " GB";
  } else if (size > MB) {
    return (size / MB).toFixed(2) + " MB";
  } else if (size > KB) {
    return (size / KB).toFixed(2) + " KB";
  }
  return size + " B";
};

const deepClone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

const writeJSON = (node, depth = 0) => {
  const cloned = deepClone(node);
  if (depth !== 0) {
    useDepth(cloned, depth);
  }
  const json = JSON.stringify(cloned, null, 2);
  fs.writeFileSync("data.json", json, { encoding: "utf-8" });
};

const runMain = (argv) => {
  if (argv.length !== 1) {
    console.log("useage: node index.js <path-to-db>");
    return;
  }
  const db = new sqlite3.Database(argv[0]);
  db.serialize(() => {
    db.all("SELECT * FROM records", (err, rows) => {
      if (err) {
        console.log(err);
        return;
      }
      for (let row of rows) {
        let path = row.path;
        let size = row.size;
        createNode(path, size);
      }
      writeJSON(findNode("/storage/emulated/0"), 2);
      const size = sumSize(findNode("/storage/emulated/0"));
      console.log(normalSize(size));
    });
  });
  db.close();
};

runMain(process.argv.slice(2));
