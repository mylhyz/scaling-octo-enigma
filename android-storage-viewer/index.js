const sqlite3 = require("sqlite3").verbose();

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
  console.log("done " + path);
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
      console.log("???")
    });
  });
  db.close();
};

runMain(process.argv.slice(2));
