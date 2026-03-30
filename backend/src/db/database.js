const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "../../data/tickets.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    urgency INTEGER NOT NULL,
    confidence REAL NOT NULL,
    signals TEXT NOT NULL,
    keywords TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'incoming',
    customer_name TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    product TEXT NOT NULL DEFAULT 'Other',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migrate existing databases that predate the new columns
const existingColumns = db.pragma("table_info(tickets)").map((c) => c.name);
if (!existingColumns.includes("customer_name")) {
  db.exec("ALTER TABLE tickets ADD COLUMN customer_name TEXT NOT NULL DEFAULT ''");
}
if (!existingColumns.includes("customer_email")) {
  db.exec("ALTER TABLE tickets ADD COLUMN customer_email TEXT NOT NULL DEFAULT ''");
}
if (!existingColumns.includes("product")) {
  db.exec("ALTER TABLE tickets ADD COLUMN product TEXT NOT NULL DEFAULT 'Other'");
}
if (!existingColumns.includes("status")) {
  db.exec("ALTER TABLE tickets ADD COLUMN status TEXT NOT NULL DEFAULT 'incoming'");
}

function insertTicket(ticket) {
  const stmt = db.prepare(`
    INSERT INTO tickets (
      message,
      category,
      priority,
      urgency,
      confidence,
      signals,
      keywords,
      status,
      customer_name,
      customer_email,
      product
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    ticket.message,
    ticket.category,
    ticket.priority,
    ticket.urgency ? 1 : 0,
    ticket.confidence,
    JSON.stringify(ticket.signals || []),
    JSON.stringify(ticket.keywords || []),
    ticket.status || "incoming",
    ticket.customerName || "",
    ticket.customerEmail || "",
    ticket.product || "Other"
  );

  return result.lastInsertRowid;
}

function listTickets(limit = 50, customerEmail = "") {
  let rows;
  if (customerEmail) {
    const stmt = db.prepare(`
      SELECT *
      FROM tickets
      WHERE lower(customer_email) = lower(?)
      ORDER BY id DESC
      LIMIT ?
    `);
    rows = stmt.all(customerEmail, limit);
  } else {
    const stmt = db.prepare(`
      SELECT *
      FROM tickets
      ORDER BY id DESC
      LIMIT ?
    `);
    rows = stmt.all(limit);
  }

  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    product: row.product,
    message: row.message,
    category: row.category,
    priority: row.priority,
    urgency: Boolean(row.urgency),
    confidence: row.confidence,
    status: row.status || "incoming",
    signals: JSON.parse(row.signals),
    keywords: JSON.parse(row.keywords),
    createdAt: row.created_at
  }));
}

function updateTicketStatus(ticketId, status) {
  const stmt = db.prepare(`
    UPDATE tickets
    SET status = ?
    WHERE id = ?
  `);

  const result = stmt.run(status, ticketId);
  return result.changes > 0;
}

module.exports = {
  insertTicket,
  listTickets,
  updateTicketStatus
};
