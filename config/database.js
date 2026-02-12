require('dotenv').config();
const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'task_management',
      waitForConnections: true,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
      connectTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000
    });

    const conn = await this.pool.getConnection();
    conn.release();
    console.log('✅ Connected to MySQL database.');
  }

  // Create tables if not exist
  async createTables() {
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE NOT NULL,
        priority ENUM('Low','Medium','High') NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await this.pool.execute(createTasksTable);
    console.log('✅ Tables created/verified.');
  }

  async initialize() {
    await this.connect();
    await this.createTables();
  }
  async query(sql, params = []) {
    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      if (sql.trim().toLowerCase().startsWith('insert')) {
        const insertResult = rows;
        return {
          insertId: insertResult.insertId,
          affectedRows: insertResult.affectedRows
        };
      }
      
      if (sql.trim().toLowerCase().startsWith('update') || sql.trim().toLowerCase().startsWith('delete')) {
        return {
          affectedRows: rows.affectedRows
        };
      }
      
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows[0] || null;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Database connection closed.');
    }
  }
}

module.exports = new Database();
