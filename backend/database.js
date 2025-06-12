const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Get MySQL connection URL from environment variables
      const dbUrl = process.env.MYSQL_URL;

      if (!dbUrl) {
        throw new Error('MYSQL_URL environment variable is not set');
      }

      // Create the connection pool
      this.pool = mysql.createPool(dbUrl);
      console.log('Connected to MySQL database');

      // Initialize tables
      await this.initTables();
    } catch (err) {
      console.error('Error connecting to database:', err.message);
    }
  }

  async initTables() {
    try {
      const connection = await this.pool.getConnection();

      try {
        // Create receipt_file table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS receipt_file (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            is_valid BOOLEAN DEFAULT 0,
            invalid_reason TEXT,
            is_processed BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        // Create receipt table
        await connection.query(`
          CREATE TABLE IF NOT EXISTS receipt (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_id INT,
            purchased_at DATETIME,
            merchant_name TEXT,
            total_amount DECIMAL(10, 2),
            file_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (file_id) REFERENCES receipt_file (id)
          )
        `);

      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('Error initializing tables:', err.message);
      throw err;
    }
  }

  async insertReceiptFile(fileName, filePath) {
    try {
      const [result] = await this.pool.query(
        'INSERT INTO receipt_file (file_name, file_path) VALUES (?, ?)',
        [fileName, filePath]
      );
      return result.insertId;
    } catch (err) {
      console.error('Error inserting receipt file:', err.message);
      throw err;
    }
  }

  async updateReceiptFileValidation(id, isValid, invalidReason) {
    try {
      await this.pool.query(
        'UPDATE receipt_file SET is_valid = ?, invalid_reason = ? WHERE id = ?',
        [isValid, invalidReason, id]
      );
    } catch (err) {
      console.error('Error updating receipt validation:', err.message);
      throw err;
    }
  }

  async updateReceiptFileProcessed(id) {
    try {
      await this.pool.query(
        'UPDATE receipt_file SET is_processed = 1 WHERE id = ?',
        [id]
      );
    } catch (err) {
      console.error('Error updating receipt processed status:', err.message);
      throw err;
    }
  }

  async insertReceipt(fileId, purchasedAt, merchantName, totalAmount, filePath) {
    try {
      const [result] = await this.pool.query(
        'INSERT INTO receipt (file_id, purchased_at, merchant_name, total_amount, file_path) VALUES (?, ?, ?, ?, ?)',
        [fileId, purchasedAt, merchantName, totalAmount, filePath]
      );
      return result.insertId;
    } catch (err) {
      console.error('Error inserting receipt:', err.message);
      throw err;
    }
  }

  async getAllReceipts() {
    try {
      const [rows] = await this.pool.query(`
        SELECT r.*, rf.file_name, rf.created_at as file_created_at
        FROM receipt r
        JOIN receipt_file rf ON r.file_id = rf.id
        ORDER BY r.created_at DESC
      `);
      return rows;
    } catch (err) {
      console.error('Error getting all receipts:', err.message);
      throw err;
    }
  }

  async getReceiptById(id) {
    try {
      const [rows] = await this.pool.query(`
        SELECT r.*, rf.file_name, rf.created_at as file_created_at
        FROM receipt r
        JOIN receipt_file rf ON r.file_id = rf.id
        WHERE r.id = ?
      `, [id]);
      return rows[0];
    } catch (err) {
      console.error('Error getting receipt by id:', err.message);
      throw err;
    }
  }

  async getReceiptFileById(id) {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM receipt_file WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (err) {
      console.error('Error getting receipt file by id:', err.message);
      throw err;
    }
  }

  async checkDuplicateFile(fileName) {
    try {
      const [rows] = await this.pool.query(
        'SELECT * FROM receipt_file WHERE file_name = ?',
        [fileName]
      );
      return rows[0];
    } catch (err) {
      console.error('Error checking duplicate file:', err.message);
      throw err;
    }
  }

  async close() {
    try {
      await this.pool.end();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err.message);
    }
  }
}

module.exports = Database;
