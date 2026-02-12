# Database Configuration

This backend supports multiple SQL databases: SQLite, MySQL, and PostgreSQL. The database configuration is managed through environment variables and a flexible database utility class.

## Supported Databases

### 1. SQLite (Default)
- **Use Case**: Development, testing, small applications
- **Setup**: No additional setup required
- **File**: `tasks.db` (created automatically)

### 2. MySQL
- **Use Case**: Production applications, high concurrency
- **Requirements**: MySQL server installed and running
- **Connection**: Connection pooling for performance

### 3. PostgreSQL
- **Use Case**: Production applications, advanced features
- **Requirements**: PostgreSQL server installed and running
- **Connection**: Connection pooling for performance

## Configuration

### Environment Variables

Create a `.env` file in the backend root directory:

```bash
# Copy the example file
cp .env.example .env
```

#### SQLite Configuration
```env
DB_TYPE=sqlite
DB_PATH=./tasks.db
```

#### MySQL Configuration
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_management
DB_USER=root
DB_PASSWORD=your_password
```

#### PostgreSQL Configuration
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=your_password
```

### Connection Pool Settings (MySQL/PostgreSQL)
```env
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
```

## Setup Commands

### General Setup
```bash
npm run setup
```

### Database-Specific Setup
```bash
# SQLite (default)
npm run setup

# MySQL
npm run setup:mysql

# PostgreSQL
npm run setup:postgres
```

## Database Schema

The `tasks` table structure varies slightly by database type:

### SQLite
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### MySQL
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### PostgreSQL
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Database Switching

To switch between databases:

1. **Update `.env` file** with the desired `DB_TYPE`
2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```
3. **Run setup script**:
   ```bash
   npm run setup
   ```
4. **Restart the server**:
   ```bash
   npm start
   ```

## Database-Specific Setup Instructions

### MySQL Setup

1. **Install MySQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server
   
   # macOS (with Homebrew)
   brew install mysql
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Create Database**:
   ```sql
   mysql -u root -p
   CREATE DATABASE task_management;
   ```

3. **Create User** (optional):
   ```sql
   CREATE USER 'taskuser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON task_management.* TO 'taskuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update `.env`**:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=task_management
   DB_USER=taskuser
   DB_PASSWORD=password
   ```

### PostgreSQL Setup

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS (with Homebrew)
   brew install postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE task_management;
   ```

3. **Create User** (optional):
   ```sql
   CREATE USER taskuser WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE task_management TO taskuser;
   ```

4. **Update `.env`**:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=task_management
   DB_USER=taskuser
   DB_PASSWORD=password
   ```

## Connection Management

### Connection Pooling
- **MySQL/PostgreSQL**: Uses connection pooling for better performance
- **SQLite**: Single connection (suitable for development)

### Error Handling
- Automatic connection retry logic
- Graceful degradation on connection failures
- Comprehensive error logging

### Performance Considerations
- **SQLite**: Best for single-threaded applications
- **MySQL**: Good for read-heavy applications
- **PostgreSQL**: Best for complex queries and high concurrency

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Check if database server is running
   - Verify host and port in `.env`
   - Check firewall settings

2. **Authentication Failed**:
   - Verify username and password
   - Check user permissions
   - Ensure database exists

3. **Table Creation Failed**:
   - Check database permissions
   - Verify disk space
   - Check SQL syntax for specific database

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed database operation logs in the console.

## Migration Guide

### From SQLite to MySQL/PostgreSQL

1. **Export data from SQLite**:
   ```bash
   sqlite3 tasks.db .dump > backup.sql
   ```

2. **Update `.env`** with new database configuration

3. **Run setup**:
   ```bash
   npm run setup:mysql
   # or
   npm run setup:postgres
   ```

4. **Import data** (manual process required due to SQL dialect differences)

## Security Considerations

- Use environment variables for sensitive data
- Limit database user permissions
- Use SSL connections in production
- Regular database backups
- Monitor connection logs
