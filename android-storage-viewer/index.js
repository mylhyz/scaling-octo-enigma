const sqlite3 = require("sqlite3").verbose();

const runMain = (argv) => {
  if (argv.length !== 1) {
    console.log("useage: node index.js <path-to-db>");
    return;
  }
  const db = new sqlite3.Database(argv[0]);
  db.serialize(() => {
    db.each("SELECT * FROM records", (err, row) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(row);
    });
  });
  db.close();
};

runMain(process.argv.slice(2));
