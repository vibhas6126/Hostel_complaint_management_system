# 🔧 DATABASE SETUP GUIDE

## 📋 Prerequisites

Before setting up the database, ensure you have:

1. **MySQL Server installed and running**
2. **MySQL root password** (or a user with database creation privileges)
3. **Node.js and npm installed**

## 🚀 Quick Setup

### Step 1: Configure Database Credentials

Edit the `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=hostel_complaint_system
DB_PORT=3306
```

**Important**: Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 2: Run Database Setup

```bash
npm run setup-db
```

This will:
- ✅ Create the database if it doesn't exist
- ✅ Create all required tables with proper relationships
- ✅ Insert sample data for testing
- ✅ Create sample user accounts with proper password hashes
- ✅ Set up foreign keys and indexes
- ✅ Create optimized database views

### Step 3: Verify Setup

After setup completes, you should see:

```
=== Database Setup Complete ===
Users: 10
Complaints: 11
Categories: 8
Statuses: 5

=== Sample Login Credentials ===
Admin: admin1 / password123
Student: student1 / password123
Staff: staff1 / password123
```

## 🔐 Default Login Credentials

### Admin Accounts
```
Username: admin1
Password: password123

Username: admin2
Password: password123
```

### Student Accounts
```
Username: student1
Password: password123
Username: student2
Password: password123
Username: student3
Password: password123
Username: student4
Password: password123
Username: student5
Password: password123
```

### Staff Accounts
```
Username: staff1
Password: password123
Username: staff2
Password: password123
Username: staff3
Password: password123
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup or encounter issues:

### 1. Create Database

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE IF NOT EXISTS hostel_complaint_system;
USE hostel_complaint_system;
SOURCE database/schema.sql;
```

### 2. Create Sample Users with Proper Passwords

The system uses bcrypt for password hashing. Here's how to create users manually:

```sql
-- Note: You'll need to generate bcrypt hashes for passwords
-- For testing, you can use the setup script which handles this automatically
```

### 3. Load Sample Data

```sql
SOURCE database/sample_data.sql;
```

## 🔍 Troubleshooting

### Issue: "Access denied for user 'root'@'localhost'"

**Solution**: 
1. Check your MySQL password
2. Update `.env` file with correct credentials
3. Ensure MySQL service is running

### Issue: "Database connection failed"

**Solution**:
1. Verify MySQL is running: `mysql -u root -p`
2. Check database exists: `SHOW DATABASES;`
3. Verify credentials in `.env` file

### Issue: "Port 3306 already in use"

**Solution**:
1. Check what's using the port: `netstat -ano | findstr :3306`
2. Update `.env` to use different port if needed

### Issue: Setup script fails

**Solution**:
1. Ensure you have required dependencies: `npm install`
2. Check Node.js version: `node --version` (should be v14+)
3. Try manual setup as alternative

## 📊 Database Schema Overview

### Tables Created

1. **users** - All user accounts (students, admins, staff)
2. **complaint_categories** - Complaint type classifications
3. **complaint_status** - Status tracking (Pending, Approved, etc.)
4. **complaints** - Main complaints table
5. **staff_assignments** - Staff-to-complaint assignments
6. **complaint_history** - Audit trail for status changes

### Database Views

1. **active_complaints_view** - Active complaints with full details
2. **complaint_stats_by_category** - Category-wise statistics
3. **staff_workload_view** - Staff workload statistics

### Key Features

- ✅ **Foreign Key Relationships**: Proper referential integrity
- ✅ **Indexes**: Optimized for common queries
- ✅ **Cascade Operations**: Automatic cleanup
- ✅ **Data Validation**: Constraints and rules
- ✅ **3NF Compliant**: Proper normalization

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
node -e "const db = require('./config/database'); db.getConnection().then(conn => { console.log('✅ Database connected'); conn.release(); }).catch(err => console.error('❌ Connection failed:', err.message));"
```

### 2. Test Sample Data

```bash
mysql -u root -p hostel_complaint_system -e "SELECT COUNT(*) as user_count FROM users; SELECT COUNT(*) as complaint_count FROM complaints;"
```

### 3. Test Application

1. Start server: `npm start`
2. Go to http://localhost:3000/student.html
3. Login with: `student1` / `password123`
4. Submit a test complaint
5. Check admin portal to verify it appears

## 🔄 Resetting the Database

If you need to start fresh:

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS hostel_complaint_system;"
npm run setup-db
```

## 📝 Post-Setup Checklist

- [ ] Database created successfully
- [ ] All tables created with proper structure
- [ ] Sample data loaded
- [ ] Sample users can login
- [ ] Foreign key relationships working
- [ ] Database views created
- [ ] Application can connect to database
- [ ] Sample complaints visible in both portals

## 🚀 Next Steps

After database setup:

1. **Start the application**: `npm start`
2. **Test student portal**: http://localhost:3000/student.html
3. **Test admin portal**: http://localhost:3000/admin.html
4. **Submit a test complaint** and verify it appears in both interfaces
5. **Check admin statistics** to ensure data is flowing correctly

## 💡 Tips

- **Keep your .env file secure** - don't commit it to version control
- **Use strong passwords** in production
- **Regular backups** - set up automated database backups
- **Monitor performance** - check slow queries and optimize indexes
- **Test thoroughly** - verify all features work before deployment

---

**🎉 Your database is now ready to use!**