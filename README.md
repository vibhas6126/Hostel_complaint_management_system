# Hostel Complaint Management System

A comprehensive web-based application for managing hostel complaints with a fully functional MySQL database, professional frontend interfaces, and complete CRUD operations.

## 🌟 Features

### For Students
- **User Registration & Login**: Secure authentication system
- **Complaint Submission**: Submit complaints with categories, descriptions, priorities, and images
- **Progress Tracking**: Real-time status updates on submitted complaints
- **Complaint History**: View complete history of all complaints
- **Filter & Search**: Easy filtering by status, category, and priority

### For Administrators
- **Dashboard**: Comprehensive overview with statistics and charts
- **Complaint Management**: Approve, reject, and manage all complaints
- **Staff Assignment**: Assign staff members to specific complaints
- **User Management**: Manage students, staff, and admin accounts
- **Statistics & Reports**: Detailed analytics and performance metrics
- **Staff Workload Monitoring**: Track staff performance and workload

### Database Features
- **Normalized Schema**: 3NF compliant database design
- **Proper Relationships**: Foreign keys and referential integrity
- **Data Integrity**: Constraints and validation rules
- **Views**: Optimized queries for common operations
- **Complete DDL/DML**: Schema creation and sample data

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Charts**: Chart.js

### Database Schema
- `users` - Stores all user types (students, admins, staff)
- `complaint_categories` - Lookup table for complaint types
- `complaint_status` - Lookup table for complaint statuses
- `complaints` - Main complaints table with relationships
- `staff_assignments` - Tracks staff assignments to complaints
- `complaint_history` - Audit trail for all status changes

### API Endpoints
- `/api/auth/*` - Authentication (login, register)
- `/api/users/*` - User management
- `/api/complaints/*` - Complaint CRUD operations
- `/api/categories/*` - Category management
- `/api/status/*` - Status management
- `/api/assignments/*` - Staff assignments
- `/api/stats/*` - Statistics and reports

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn package manager
- Modern web browser

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dbms_project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Quick Setup (Recommended)
```bash
npm run setup-db
```

This will automatically:
- Create the database if it doesn't exist
- Create all required tables with proper relationships
- Insert sample data for testing
- Create sample user accounts with proper password hashes

#### Manual Setup
```bash
# Create database
mysql -u root -p < database/setup.sql

# Create schema
mysql -u root -p hostel_complaint_system < database/schema.sql

# Load sample data (optional)
mysql -u root -p hostel_complaint_system < database/sample_data.sql
```

### 4. Configure Environment Variables

Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hostel_complaint_system
DB_PORT=3306

PORT=3000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

### 5. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 6. Access the Application

- **Landing Page**: http://localhost:3000
- **Student Portal**: http://localhost:3000/student.html
- **Admin Portal**: http://localhost:3000/admin.html

## 👥 Default Users

The system comes with sample users for testing:

### Admin Users
- **Username**: admin1
- **Password**: password123
- **Username**: admin2
- **Password**: password123

### Staff Users
- **Username**: staff1
- **Password**: password123
- **Username**: staff2
- **Password**: password123
- **Username**: staff3
- **Password**: password123

### Student Users
- **Username**: student1
- **Password**: password123
- **Username**: student2
- **Password**: password123
- **Username**: student3
- **Password**: password123
- **Username**: student4
- **Password**: password123
- **Username**: student5
- **Password**: password123

⚠️ **Important**: Change these passwords in production!

## 📁 Project Structure

```
dbms_project/
├── config/
│   └── database.js          # Database configuration
├── database/
│   ├── schema.sql           # Database schema
│   ├── sample_data.sql      # Sample data
│   ├── setup.sql            # Database setup
│   └── README.md            # Database documentation
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── index.html           # Landing page
│   ├── student.html         # Student interface
│   ├── student.js           # Student functionality
│   ├── admin.html           # Admin interface
│   └── admin.js             # Admin functionality
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── complaints.js        # Complaint routes
│   ├── categories.js        # Category routes
│   ├── status.js            # Status routes
│   ├── assignments.js       # Assignment routes
│   └── stats.js             # Statistics routes
├── uploads/                 # Uploaded files directory
├── server.js                # Main server file
├── package.json             # Project dependencies
├── .env                     # Environment variables
└── README.md                # This file
```

## 🔧 API Documentation

### Authentication

#### POST /api/auth/register
Register a new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "student",
  "room_number": "A-101",
  "phone_number": "555-1234",
  "password": "password123"
}
```

#### POST /api/auth/login
Login user
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user info (requires authentication)

### Complaints

#### GET /api/complaints
Get all complaints (requires authentication)
- Query params: `status`, `category`, `priority`, `student_id`

#### POST /api/complaints
Create new complaint (student only)
- Content-Type: `multipart/form-data`
- Fields: `category_id`, `title`, `description`, `priority`, `location`, `image`

#### GET /api/complaints/:id
Get complaint details (requires authentication)

#### PUT /api/complaints/:id/status
Update complaint status (admin only)
```json
{
  "status_id": 2,
  "notes": "Complaint approved"
}
```

#### DELETE /api/complaints/:id
Delete complaint (admin or own complaint by student)

### Statistics

#### GET /api/stats/overview
Get overview statistics (admin only)

#### GET /api/stats/complaints-by-date
Get complaints by date range (admin only)

#### GET /api/stats/resolution-time
Get resolution time statistics (admin only)

## 🎨 Frontend Features

### Student Portal
- Modern, responsive design
- Real-time complaint tracking
- Image upload support
- Status badges and priority indicators
- Comprehensive filtering and search
- Complaint history timeline

### Admin Portal
- Interactive dashboard with charts
- Complaint management workflow
- Staff assignment interface
- User management system
- Performance analytics
- Workload monitoring

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- SQL injection prevention
- File upload validation
- CORS enabled
- Input validation

## 📊 Database Features

### Normalization
- Third Normal Form (3NF) compliant
- Proper primary and foreign keys
- Referential integrity constraints
- Optimized indexes for performance

### Views
- `active_complaints_view` - Active complaints with details
- `complaint_stats_by_category` - Category-wise statistics
- `staff_workload_view` - Staff workload statistics

### Sample Data
- 10 users (2 admins, 3 staff, 5 students)
- 8 complaint categories
- 5 complaint statuses
- 10 sample complaints with various statuses
- Staff assignments and history

## 🧪 Testing

### Manual Testing Steps

1. **Student Registration**
   - Navigate to Student Portal
   - Click "Register"
   - Fill in student details
   - Submit and verify account creation

2. **Complaint Submission**
   - Login as student
   - Navigate to "New Complaint"
   - Fill in complaint details
   - Upload optional image
   - Submit and verify in "My Complaints"

3. **Admin Approval**
   - Login as admin
   - Navigate to "Complaints"
   - View pending complaints
   - Approve or reject complaints
   - Assign staff to approved complaints

4. **Staff Assignment**
   - Select approved complaint
   - Choose staff member
   - Add assignment notes
   - Verify assignment in complaint details

5. **Statistics Viewing**
   - Navigate to "Statistics"
   - View dashboard charts
   - Check staff performance
   - Review resolution times

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service status
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql

# Test connection
mysql -u root -p -h localhost
```

### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F
```

### Permission Issues
```bash
# Grant MySQL permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON hostel_complaint_system.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📝 Development Notes

### Adding New Features
1. Update database schema if needed
2. Create API endpoints in routes/
3. Add frontend UI components
4. Update authentication middleware if required
5. Test thoroughly before deployment

### Database Modifications
- Always backup before schema changes
- Test migrations on development database first
- Update sample data accordingly
- Document any breaking changes

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in .env
2. Use strong JWT secret
3. Enable HTTPS
4. Configure proper file upload limits
5. Set up database backups
6. Use process manager (PM2)
7. Configure reverse proxy (Nginx)

### Environment Variables
```env
NODE_ENV=production
DB_HOST=production-db-host
DB_USER=production-user
DB_PASSWORD=strong-password
JWT_SECRET=very-strong-secret-key
```

## 📄 License

This project is created for educational purposes.

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review database documentation in `database/README.md`
- Verify environment variables are set correctly
- Ensure MySQL service is running

## 🎯 Future Enhancements

- [ ] Email notifications for status updates
- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with hostel management systems
- [ ] Real-time chat support
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export reports to PDF/Excel

---

**Built with ❤️ for efficient hostel complaint management**