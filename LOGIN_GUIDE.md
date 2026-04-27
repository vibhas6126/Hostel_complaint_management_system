# 🔐 LOGIN CREDENTIALS & TROUBLESHOOTING GUIDE

## 📋 **SAMPLE LOGIN CREDENTIALS**

### 👨‍💼 **Admin Portal Credentials**

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `admin1` | `password123` | Admin | Primary admin account |
| `admin2` | `password123` | Admin | Secondary admin account |

**Access Admin Portal**: http://localhost:3000/admin.html

### 👨‍🎓 **Student Portal Credentials**

| Username | Password | Room | Email |
|----------|----------|------|-------|
| `student1` | `password123` | A-101 | student1@hostel.edu |
| `student2` | `password123` | A-102 | student2@hostel.edu |
| `student3` | `password123` | B-201 | student3@hostel.edu |
| `student4` | `password123` | B-202 | student4@hostel.edu |
| `student5` | `password123` | C-301 | student5@hostel.edu |

**Access Student Portal**: http://localhost:3000/student.html

### 👷 **Staff Portal Credentials**

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `staff1` | `password123` | Staff | John Smith |
| `staff2` | `password123` | Staff | Jane Doe |
| `staff3` | `password123` | Staff | Mike Johnson |

**Note**: Staff portal functionality is part of the admin system in this version.

---

## 🧪 **TESTING THE SYSTEM**

### **Step 1: Verify Server is Running**

```bash
# Check if server is running
curl http://localhost:3000

# Expected response: HTML content of landing page
```

### **Step 2: Test Student Registration**

1. Go to http://localhost:3000/student.html
2. Click "Don't have an account? Register"
3. Fill in the form:
   - **Username**: testuser
   - **Email**: test@example.com
   - **Full Name**: Test User
   - **Room Number**: D-401
   - **Phone Number**: 555-0199
   - **Password**: testpass123
   - **Confirm Password**: testpass123
4. Click "Register"
5. You should see: "Registration successful! Please login."

### **Step 3: Test Student Login**

1. Go to http://localhost:3000/student.html
2. Enter credentials:
   - **Username**: student1
   - **Password**: password123
3. Click "Login"
4. You should see: "Login successful!" and be redirected to dashboard

### **Step 4: Test Admin Login**

1. Go to http://localhost:3000/admin.html
2. Enter credentials:
   - **Username**: admin1
   - **Password**: password123
3. Click "Login"
4. You should see: "Login successful!" and be redirected to admin dashboard

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Cannot connect to server"**

**Symptoms:**
- Error message: "Cannot connect to server. Please check if the server is running."
- Login/registration fails immediately

**Causes:**
- Server is not running
- Server is running on different port
- Network connectivity issues

**Solutions:**
```bash
# Check if server is running
curl http://localhost:3000

# If not running, start the server:
npm start

# Or in development mode:
npm run dev

# Check if port 3000 is in use:
netstat -ano | findstr :3000

# Kill process if needed:
taskkill /PID <process_id> /F
```

### **Issue 2: "Database connection failed"**

**Symptoms:**
- Error message: "Database connection failed"
- Login/registration fails with database error

**Causes:**
- MySQL is not installed
- MySQL is not running
- Incorrect database credentials
- Database doesn't exist

**Solutions:**
```bash
# 1. Check if MySQL is running
# For XAMPP: Start MySQL from XAMPP Control Panel
# For MySQL: Check service status

# 2. Test MySQL connection
mysql -u root -p

# 3. Create database if needed
mysql -u root -p < database/setup.sql
mysql -u root -p hostel_complaint_system < database/schema.sql
mysql -u root -p hostel_complaint_system < database/sample_data.sql

# 4. Update .env file with correct credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostel_complaint_system
```

### **Issue 3: "Login failed" without specific error**

**Symptoms:**
- Generic "Login failed" message
- No detailed error information

**Causes:**
- Incorrect username or password
- User doesn't exist in database
- Database connection issues

**Solutions:**
```bash
# 1. Verify user exists in database
mysql -u root -p hostel_complaint_system
SELECT username, email, full_name, role FROM users;

# 2. Try with sample credentials
# Student: student1 / password123
# Admin: admin1 / password123

# 3. Check browser console for detailed errors
# Press F12 → Console tab

# 4. Check server logs for errors
# Server logs will show detailed error messages
```

### **Issue 4: "Registration failed"**

**Symptoms:**
- Registration form submission fails
- Error message about registration failure

**Causes:**
- Username already exists
- Email already registered
- Database connection issues
- Invalid form data

**Solutions:**
```bash
# 1. Check if username/email already exists
mysql -u root -p hostel_complaint_system
SELECT username, email FROM users;

# 2. Try with different credentials
# Use unique username and email

# 3. Verify all required fields are filled
# Username, Email, Full Name, Room Number, Password are required

# 4. Check password confirmation matches
# Both password fields must be identical
```

### **Issue 5: "Access denied" for admin login**

**Symptoms:**
- Error: "Access denied. Admin privileges required"
- Cannot login to admin portal

**Causes:**
- Using non-admin credentials
- User role is not 'admin'
- Database role mismatch

**Solutions:**
```bash
# 1. Verify user has admin role
mysql -u root -p hostel_complaint_system
SELECT username, role FROM users WHERE role = 'admin';

# 2. Use correct admin credentials
# admin1 / password123
# admin2 / password123

# 3. Check if you're on correct portal
# Admin portal: http://localhost:3000/admin.html
# Student portal: http://localhost:3000/student.html
```

### **Issue 6: "Passwords do not match"**

**Symptoms:**
- Registration fails with password mismatch error
- Cannot complete registration

**Causes:**
- Password and confirm password fields don't match
- Typing errors in password fields

**Solutions:**
```
1. Ensure both password fields are identical
2. Check for typos and extra spaces
3. Password must be at least 6 characters
4. Try copying and pasting the password
```

### **Issue 7: "Please enter a valid email address"**

**Symptoms:**
- Registration fails with email validation error

**Causes:**
- Invalid email format
- Missing @ symbol or domain

**Solutions:**
```
1. Use proper email format: username@domain.com
2. Examples: student@test.com, admin@example.org
3. Ensure no extra spaces in email field
```

---

## 🔧 **ADVANCED TROUBLESHOOTING**

### **Check Server Status**

```bash
# Test if server responds
curl http://localhost:3000

# Test API endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password123"}'

# Expected response: JSON with success=true and token
```

### **Check Database Connection**

```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1"

# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'hostel_complaint_system'"

# Check if tables exist
mysql -u root -p hostel_complaint_system -e "SHOW TABLES"

# Check if users exist
mysql -u root -p hostel_complaint_system -e "SELECT COUNT(*) FROM users"
```

### **Clear Browser Data**

```
1. Clear browser cache and cookies
2. Clear localStorage:
   - Press F12 → Application tab → Local Storage
   - Right-click → Clear
3. Refresh the page
4. Try login again
```

### **Check Network Requests**

```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Attempt login/registration
4. Check the request details:
   - Request URL
   - Request method
   - Request payload
   - Response status
   - Response body
```

### **View Server Logs**

```bash
# Server logs are displayed in terminal
# Look for error messages and stack traces

# Common log messages:
# - "Database connected successfully" ✅
# - "Database connection failed" ❌
# - Error details with stack traces
```

---

## 📱 **TESTING CHECKLIST**

### **Before Testing**

- [ ] Server is running (`npm start`)
- [ ] MySQL is installed and running
- [ ] Database is created and populated
- [ ] .env file has correct credentials
- [ ] No firewall blocking port 3000

### **Student Portal Testing**

- [ ] Can access student.html
- [ ] Can see sample credentials
- [ ] Can register new student account
- [ ] Can login with sample credentials
- [ ] Can access dashboard after login
- [ ] Can submit new complaint
- [ ] Can view complaint history
- [ ] Can logout successfully

### **Admin Portal Testing**

- [ ] Can access admin.html
- [ ] Can see sample credentials
- [ ] Can login with admin credentials
- [ ] Can access admin dashboard
- [ ] Can view all complaints
- [ ] Can approve/reject complaints
- [ ] Can assign staff to complaints
- [ ] Can view statistics
- [ ] Can logout successfully

---

## 🎯 **QUICK REFERENCE**

### **URLs**
```
Landing Page:    http://localhost:3000
Student Portal:  http://localhost:3000/student.html
Admin Portal:    http://localhost:3000/admin.html
Demo Page:       http://localhost:3000/demo.html
```

### **Default Credentials**
```
Admin:  admin1 / password123
Student: student1 / password123
```

### **Common Commands**
```bash
# Start server
npm start

# Stop server
Ctrl + C

# Restart server
# Stop and start again

# Check database
mysql -u root -p hostel_complaint_system
```

---

## 🆘 **GETTING HELP**

### **Still Having Issues?**

1. **Check the Console**
   - Press F12 in browser
   - Look at Console tab for errors
   - Note any red error messages

2. **Check Network Tab**
   - Press F12 → Network tab
   - Look for failed requests (red)
   - Click request to see details

3. **Check Server Logs**
   - Look at terminal where server is running
   - Note any error messages
   - Check for database connection errors

4. **Verify Database**
   - Ensure MySQL is running
   - Check database exists
   - Verify sample data is loaded

5. **Try Different Browser**
   - Chrome, Firefox, Edge
   - Clear cache and cookies
   - Try incognito mode

---

## 📞 **CONTACT & SUPPORT**

### **Documentation**
- README.md - Complete system documentation
- QUICKSTART.md - Quick setup guide
- TESTING_GUIDE.md - Testing scenarios
- database/README.md - Database documentation

### **Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to server" | Server not running | Start server with `npm start` |
| "Database connection failed" | MySQL not running | Start MySQL service |
| "Login failed" | Wrong credentials | Use sample credentials |
| "Registration failed" | Duplicate user | Use different username |
| "Access denied" | Wrong portal | Use correct portal for role |

---

## ✅ **SUCCESS INDICATORS**

### **When Everything Works**

✅ Server shows: "Server is running on port 3000"
✅ Server shows: "Database connected successfully"
✅ Login shows: "Login successful!"
✅ Registration shows: "Registration successful!"
✅ Dashboard loads with user data
✅ Can submit complaints
✅ Can view complaint history
✅ Admin can manage complaints
✅ Statistics display correctly

---

**🎉 Your system is ready to use! Follow this guide to resolve any issues.**