# Hostel Complaint Management System - Database Setup Guide

## Overview
This database is designed for a hostel complaint management system with proper normalization, relationships, and data integrity.

## Database Structure

### Tables

#### 1. `users`
Stores all user types (students, admins, staff)
- **Primary Key**: user_id
- **Fields**: username, password_hash, email, full_name, role, room_number, phone_number
- **Indexes**: username, email, role

#### 2. `complaint_categories`
Lookup table for complaint types
- **Primary Key**: category_id
- **Fields**: category_name, description

#### 3. `complaint_status`
Lookup table for complaint statuses
- **Primary Key**: status_id
- **Fields**: status_name, description

#### 4. `complaints`
Main table storing all complaints
- **Primary Key**: complaint_id
- **Foreign Keys**: student_id → users, category_id → complaint_categories, status_id → complaint_status
- **Fields**: title, description, priority, location, image_url, created_at, updated_at, resolved_at

#### 5. `staff_assignments`
Tracks staff assignments to complaints
- **Primary Key**: assignment_id
- **Foreign Keys**: complaint_id → complaints, staff_id → users, assigned_by → users
- **Fields**: assigned_at, notes, status

#### 6. `complaint_history`
Tracks all status changes and updates
- **Primary Key**: history_id
- **Foreign Keys**: complaint_id → complaints, status_id → complaint_status, changed_by → users
- **Fields**: notes, changed_at

### Views

#### 1. `active_complaints_view`
Shows all active complaints with user and staff details

#### 2. `complaint_stats_by_category`
Statistics of complaints by category and status

#### 3. `staff_workload_view`
Workload statistics for each staff member

## Normalization

This database follows **Third Normal Form (3NF)**:
- All tables have a primary key
- All non-key attributes are fully dependent on the primary key
- No transitive dependencies
- Proper foreign key relationships maintain referential integrity

## Setup Instructions

### Prerequisites
- MySQL Server installed and running
- MySQL command line client or MySQL Workbench

### Step 1: Create Database
```bash
mysql -u root -p < database/setup.sql
```

### Step 2: Create Schema
```bash
mysql -u root -p hostel_complaint_system < database/schema.sql
```

### Step 3: Load Sample Data (Optional)
```bash
mysql -u root -p hostel_complaint_system < database/sample_data.sql
```

### Alternative: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Run SQL Script
4. Select `database/setup.sql`
5. Repeat for `schema.sql` and `sample_data.sql`

## Sample Data

The database includes:
- **2 Admin users**: admin1, admin2
- **3 Staff users**: staff1, staff2, staff3
- **5 Student users**: student1, student2, student3, student4, student5
- **8 Complaint categories**: Electrical, Plumbing, Furniture, Cleaning, Security, Internet, Food, Other
- **5 Complaint statuses**: Pending, Approved, In Progress, Resolved, Rejected
- **10 Sample complaints** with various statuses and assignments

## Common Queries

### Get all complaints for a specific student
```sql
SELECT * FROM complaints WHERE student_id = 6;
```

### Get active complaints with staff assignments
```sql
SELECT * FROM active_complaints_view;
```

### Get complaint statistics
```sql
SELECT * FROM complaint_stats_by_category;
```

### Get staff workload
```sql
SELECT * FROM staff_workload_view;
```

### Get complaint history for a specific complaint
```sql
SELECT * FROM complaint_history WHERE complaint_id = 1;
```

## Security Notes

⚠️ **Important**: The sample data uses simple password hashes for demonstration purposes. In production:
- Use proper password hashing (bcrypt, argon2)
- Implement proper authentication
- Use prepared statements to prevent SQL injection
- Set up proper user permissions
- Enable SSL for database connections

## Database Maintenance

### Backup
```bash
mysqldump -u root -p hostel_complaint_system > backup.sql
```

### Restore
```bash
mysql -u root -p hostel_complaint_system < backup.sql
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS hostel_complaint_system;"
mysql -u root -p < database/setup.sql
mysql -u root -p hostel_complaint_system < database/schema.sql
mysql -u root -p hostel_complaint_system < database/sample_data.sql
```

## Troubleshooting

### Connection Issues
- Ensure MySQL server is running
- Check username and password
- Verify database exists: `SHOW DATABASES;`

### Foreign Key Errors
- Ensure tables are created in correct order
- Check that referenced tables exist
- Verify data types match

### Permission Issues
- Grant necessary permissions:
```sql
GRANT ALL PRIVILEGES ON hostel_complaint_system.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Performance Optimization

- All frequently queried columns are indexed
- Views optimize common queries
- Foreign keys ensure data integrity
- Consider adding more indexes based on query patterns
- Use EXPLAIN to analyze query performance

## Support

For issues or questions about the database:
1. Check MySQL error logs
2. Verify table structures: `DESCRIBE table_name;`
3. Test queries in MySQL Workbench
4. Review foreign key constraints