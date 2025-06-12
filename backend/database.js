const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'receipts.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS receipt_file (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          is_valid BOOLEAN DEFAULT 0,
          invalid_reason TEXT,
          is_processed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS receipt (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_id INTEGER,
          purchased_at DATETIME,
          merchant_name TEXT,
          total_amount REAL,
          file_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES receipt_file (id)
        )
      `);

      this.db.run(`
        CREATE TRIGGER IF NOT EXISTS update_receipt_file_timestamp 
        AFTER UPDATE ON receipt_file
        BEGIN
          UPDATE receipt_file SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      this.db.run(`
        CREATE TRIGGER IF NOT EXISTS update_receipt_timestamp 
        AFTER UPDATE ON receipt
        BEGIN
          UPDATE receipt SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);
    });
  }

  insertReceiptFile(fileName, filePath, callback) {
    const stmt = this.db.prepare(`
      INSERT INTO receipt_file (file_name, file_path) 
      VALUES (?, ?)
    `);
    stmt.run([fileName, filePath], function(err) {
      callback(err, this.lastID);
    });
    stmt.finalize();
  }

  updateReceiptFileValidation(id, isValid, invalidReason, callback) {
    const stmt = this.db.prepare(`
      UPDATE receipt_file 
      SET is_valid = ?, invalid_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([isValid, invalidReason, id], callback);
    stmt.finalize();
  }

  updateReceiptFileProcessed(id, callback) {
    const stmt = this.db.prepare(`
      UPDATE receipt_file 
      SET is_processed = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run([id], callback);
    stmt.finalize();
  }

  insertReceipt(fileId, purchasedAt, merchantName, totalAmount, filePath, callback) {
    const stmt = this.db.prepare(`
      INSERT INTO receipt (file_id, purchased_at, merchant_name, total_amount, file_path) 
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run([fileId, purchasedAt, merchantName, totalAmount, filePath], function(err) {
      callback(err, this.lastID);
    });
    stmt.finalize();
  }

  getAllReceipts(callback) {
    this.db.all(`
      SELECT r.*, rf.file_name, rf.created_at as file_created_at
      FROM receipt r
      JOIN receipt_file rf ON r.file_id = rf.id
      ORDER BY r.created_at DESC
    `, callback);
  }

  getReceiptById(id, callback) {
    this.db.get(`
      SELECT r.*, rf.file_name, rf.created_at as file_created_at
      FROM receipt r
      JOIN receipt_file rf ON r.file_id = rf.id
      WHERE r.id = ?
    `, [id], callback);
  }

  getReceiptFileById(id, callback) {
    this.db.get(`
      SELECT * FROM receipt_file WHERE id = ?
    `, [id], callback);
  }

  checkDuplicateFile(fileName, callback) {
    this.db.get(`
      SELECT * FROM receipt_file WHERE file_name = ?
    `, [fileName], callback);
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;