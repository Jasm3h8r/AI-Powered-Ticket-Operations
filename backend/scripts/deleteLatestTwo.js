const Database = require("better-sqlite3");

const db = new Database(process.env.DB_PATH || "/app/data/tickets.db");
const ids = db
  .prepare("SELECT id FROM tickets ORDER BY id DESC LIMIT 2")
  .all()
  .map((row) => row.id);

if (ids.length > 0) {
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`DELETE FROM tickets WHERE id IN (${placeholders})`).run(...ids);
}

const remaining = db.prepare("SELECT COUNT(*) AS count FROM tickets").get().count;
console.log(JSON.stringify({ deletedIds: ids, remaining }));
