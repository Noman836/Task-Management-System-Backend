const database = require('../utils/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Initialize database connection and create tables
    await database.initialize();
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Database configuration:');
    console.log('- Database type: SQLite (default)');
    console.log('- Tables created: tasks');
    console.log('\n🔧 To use MySQL or PostgreSQL:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Update DB_TYPE in .env file');
    console.log('3. Configure your database connection details');
    console.log('4. Restart the server');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('📝 Created .env file from .env.example');
}

// Run setup
setupDatabase();
