#!/usr/bin/env node

/**
 * Hostel Complaint Management System - Startup Verification
 *
 * This script checks if the system is properly configured and ready to use.
 * It verifies database connectivity, sample data, and provides clear guidance.
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkSystem() {
  log('\n🏠 Hostel Complaint Management System - Startup Check', 'cyan');
  log('================================================\n', 'cyan');

  let allChecksPassed = true;

  // Check 1: Environment variables
  log('📋 Checking environment variables...', 'yellow');

  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    log('Please update your .env file with the required values.', 'red');
    allChecksPassed = false;
  } else {
    log('✅ Environment variables configured', 'green');
  }

  // Check 2: Database connection
  log('\n🔗 Checking database connection...', 'yellow');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_complaint_system'
    });

    log('✅ Database connection successful', 'green');
    await connection.end();
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('❌ Database access denied. Check your DB_USER and DB_PASSWORD in .env file', 'red');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log('❌ Database does not exist. Run: npm run setup-db', 'red');
    } else {
      log(`❌ Database connection failed: ${error.message}`, 'red');
    }
    allChecksPassed = false;
  }

  // Check 3: Database structure
  log('\n🏗️  Checking database structure...', 'yellow');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_complaint_system'
    });

    const [tables] = await connection.execute('SHOW TABLES');
    const requiredTables = ['users', 'complaints', 'complaint_categories', 'complaint_status', 'staff_assignments', 'complaint_history'];
    const tableNames = tables.map(t => Object.values(t)[0]);

    const missingTables = requiredTables.filter(table => !tableNames.includes(table));

    if (missingTables.length > 0) {
      log(`❌ Missing tables: ${missingTables.join(', ')}`, 'red');
      log('Run: npm run setup-db', 'red');
      allChecksPassed = false;
    } else {
      log('✅ All required tables exist', 'green');
    }

    await connection.end();
  } catch (error) {
    log(`❌ Could not check database structure: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Check 4: Sample data
  log('\n👥 Checking sample data...', 'yellow');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_complaint_system'
    });

    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [complaintCount] = await connection.execute('SELECT COUNT(*) as count FROM complaints');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM complaint_categories');

    log(`   Users: ${userCount[0].count}`, 'reset');
    log(`   Complaints: ${complaintCount[0].count}`, 'reset');
    log(`   Categories: ${categoryCount[0].count}`, 'reset');

    if (userCount[0].count === 0) {
      log('❌ No sample users found. Run: npm run setup-db', 'red');
      allChecksPassed = false;
    } else {
      log('✅ Sample data exists', 'green');
    }

    await connection.end();
  } catch (error) {
    log(`❌ Could not check sample data: ${error.message}`, 'red');
    allChecksPassed = false;
  }

  // Check 5: Password hashes
  log('\n🔐 Checking password security...', 'yellow');

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hostel_complaint_system'
    });

    const [users] = await connection.execute('SELECT username, password_hash FROM users LIMIT 1');

    if (users.length > 0) {
      const user = users[0];
      // Check if password looks like a bcrypt hash (starts with $2b$)
      if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        log('✅ Passwords are properly hashed with bcrypt', 'green');
      } else {
        log('⚠️  Passwords may not be properly hashed. Run: npm run setup-db', 'yellow');
      }
    } else {
      log('⚠️  No users found to check password hashes', 'yellow');
    }

    await connection.end();
  } catch (error) {
    log(`❌ Could not check password hashes: ${error.message}`, 'red');
  }

  // Final summary
  log('\n' + '='.repeat(50), 'cyan');

  if (allChecksPassed) {
    log('✅ All checks passed! System is ready to use.', 'green');
    log('\n🚀 Start the server with: npm start', 'cyan');
    log('\n📱 Access the application:', 'cyan');
    log('   Student Portal: http://localhost:3000/student.html', 'reset');
    log('   Admin Portal:  http://localhost:3000/admin.html', 'reset');
    log('\n🔐 Sample credentials:', 'cyan');
    log('   Admin:  admin1 / password123', 'reset');
    log('   Student: student1 / password123', 'reset');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    log('\n🔧 Quick fix:', 'cyan');
    log('   1. Update .env file with your database credentials', 'reset');
    log('   2. Run: npm run setup-db', 'reset');
    log('   3. Run this check again: node check-system.js', 'reset');
  }

  log('\n' + '='.repeat(50) + '\n', 'cyan');

  process.exit(allChecksPassed ? 0 : 1);
}

// Run the check
checkSystem().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});