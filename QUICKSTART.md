# Quick Start Guide - Hostel Complaint Management System

## 🚀 Quick Setup (5 Minutes)

### Prerequisites Check
- [ ] Node.js installed (v14+)
- [ ] MySQL Server installed and running
- [ ] Git (optional, for cloning)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# Create database and schema
mysql -u root -p < database/setup.sql
mysql -u root -p hostel_complaint_system < database/schema.sql
mysql -u root -p hostel_complaint_system < database/sample_data.sql
```

### Step 3: Configure Environment
Edit `.env` file with your MySQL password:
```env
DB_PASSWORD=your_mysql_password
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Access the Application
Open your browser and go to: http://localhost:3000

## 🔑 Default Login Credentials

### Admin Portal
- **Username**: admin1
- **Password**: password123

### Student Portal
- **Username**: student1
- **Password**: password123

## 📱 Testing the System

### 1. Test Student Portal
1. Go to http://localhost:3000/student.html
2. Login with student1/password123
3. Submit a new complaint
4. View your complaints in "My Complaints"
5. Check the status updates

### 2. Test Admin Portal
1. Go to http://localhost:3000/admin.html
2. Login with admin1/password123
3. View the dashboard statistics
4. Go to "Complaints" section
5. Approve pending complaints
6. Assign staff to approved complaints
7. View statistics and reports

## 🎯 Key Features to Try

### Student Features
- ✅ Register new student account
- ✅ Submit complaint with image
- ✅ Track complaint progress
- ✅ Filter complaints by status/category
- ✅ View complaint history

### Admin Features
- ✅ View dashboard statistics
- ✅ Approve/reject complaints
- ✅ Assign staff to complaints
- ✅ Manage users (add/remove)
- ✅ View staff performance
- ✅ Generate reports

## 🔧 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**: Check MySQL is running and credentials in `.env` are correct

### Issue: "Port 3000 already in use"
**Solution**: Change PORT in `.env` file or stop the process using port 3000

### Issue: "Cannot upload files"
**Solution**: Ensure `uploads` directory exists and has write permissions

### Issue: "Login failed"
**Solution**: Verify username/password from sample data or register new user

## 📊 Database Overview

### Tables Created
- `users` - All user accounts
- `complaint_categories` - 8 categories (Electrical, Plumbing, etc.)
- `complaint_status` - 5 statuses (Pending, Approved, In Progress, Resolved, Rejected)
- `complaints` - All complaints with relationships
- `staff_assignments` - Staff-to-complaint assignments
- `complaint_history` - Complete audit trail

### Sample Data Included
- 10 users (2 admins, 3 staff, 5 students)
- 10 sample complaints
- 5 staff assignments
- Complete history records

## 🎨 Interface Highlights

### Student Portal
- Clean, modern interface
- Real-time status updates
- Image upload support
- Comprehensive filtering
- Mobile responsive

### Admin Portal
- Interactive dashboard with charts
- Efficient complaint management
- Staff workload monitoring
- User management system
- Detailed statistics and reports

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Review database/README.md for database specifics
3. Verify all prerequisites are installed
4. Check browser console for errors
5. Ensure MySQL service is running

## 🎉 You're Ready!

Your Hostel Complaint Management System is now running. Start exploring the features and managing complaints efficiently!

For detailed information, see the main README.md file.