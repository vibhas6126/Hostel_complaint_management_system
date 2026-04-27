const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;

  try {
    // Connect to MySQL without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: false
    });

    console.log('Connected to MySQL server');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS hostel_complaint_system');
    console.log('Database created or already exists');

    // Close connection and reconnect to the specific database
    await connection.end();

    // Connect to the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'hostel_complaint_system',
      multipleStatements: false
    });

    console.log('Using hostel_complaint_system database');

    // Read and execute schema
    const fs = require('fs');
    const schema = fs.readFileSync('./database/schema.sql', 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }
    console.log('Schema created successfully');

    // Generate proper password hashes
    const password = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('Generated password hash for sample users');

    // Insert sample data with proper password hash
    await connection.execute(`
      INSERT INTO users (username, password_hash, email, full_name, role, phone_number) VALUES
      ('admin1', ?, 'admin1@hostel.edu', 'Admin User 1', 'admin', '555-0101'),
      ('admin2', ?, 'admin2@hostel.edu', 'Admin User 2', 'admin', '555-0102')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [passwordHash, passwordHash]);

    await connection.execute(`
      INSERT INTO users (username, password_hash, email, full_name, role, phone_number) VALUES
      ('staff1', ?, 'staff1@hostel.edu', 'John Smith', 'staff', '555-0201'),
      ('staff2', ?, 'staff2@hostel.edu', 'Jane Doe', 'staff', '555-0202'),
      ('staff3', ?, 'staff3@hostel.edu', 'Mike Johnson', 'staff', '555-0203')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [passwordHash, passwordHash, passwordHash]);

    await connection.execute(`
      INSERT INTO users (username, password_hash, email, full_name, role, room_number, phone_number) VALUES
      ('student1', ?, 'student1@hostel.edu', 'Alice Williams', 'student', 'A-101', '555-0301'),
      ('student2', ?, 'student2@hostel.edu', 'Bob Brown', 'student', 'A-102', '555-0302'),
      ('student3', ?, 'student3@hostel.edu', 'Charlie Davis', 'student', 'B-201', '555-0303'),
      ('student4', ?, 'student4@hostel.edu', 'Diana Evans', 'student', 'B-202', '555-0304'),
      ('student5', ?, 'student5@hostel.edu', 'Frank Miller', 'student', 'C-301', '555-0305')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [passwordHash, passwordHash, passwordHash, passwordHash, passwordHash]);

    console.log('Sample users created/updated successfully');

    // Insert categories if they don't exist
    await connection.execute(`
      INSERT IGNORE INTO complaint_categories (category_name, description) VALUES
      ('Electrical', 'Issues related to electrical fittings, lights, fans, and other electrical appliances'),
      ('Plumbing', 'Issues related to water supply, drainage, taps, and sanitary fittings'),
      ('Furniture', 'Issues related to beds, tables, chairs, and other furniture'),
      ('Cleaning', 'Issues related to room cleaning, corridor cleaning, and general hygiene'),
      ('Security', 'Issues related to security concerns, locks, and safety equipment'),
      ('Internet', 'Issues related to Wi-Fi connectivity and network problems'),
      ('Food', 'Issues related to mess food quality and service'),
      ('Other', 'Any other type of complaint not covered by the above categories')
    `);
    console.log('Categories created successfully');

    // Insert statuses if they don't exist
    await connection.execute(`
      INSERT IGNORE INTO complaint_status (status_name, description) VALUES
      ('Pending', 'Complaint submitted and awaiting admin review'),
      ('Approved', 'Complaint approved by admin and awaiting staff assignment'),
      ('In Progress', 'Complaint is being addressed by assigned staff'),
      ('Resolved', 'Complaint has been successfully resolved'),
      ('Rejected', 'Complaint rejected by admin')
    `);
    console.log('Statuses created successfully');

    // Insert sample complaints
    const [categories] = await connection.execute('SELECT category_id FROM complaint_categories');
    const [statuses] = await connection.execute('SELECT status_id FROM complaint_status');
    const [students] = await connection.execute('SELECT user_id FROM users WHERE role = "student"');

    if (students.length > 0 && categories.length > 0 && statuses.length > 0) {
      // Clear existing sample complaints
      await connection.execute('DELETE FROM complaints');
      await connection.execute('DELETE FROM staff_assignments');
      await connection.execute('DELETE FROM complaint_history');

      // Insert sample complaints
      const sampleComplaints = [
        { student_id: students[0].user_id, category_id: categories[0].category_id, status_id: statuses[0].status_id, title: 'Fan not working', description: 'The ceiling fan in my room is not working properly. It makes strange noises and rotates very slowly.', priority: 'high', location: 'A-101' },
        { student_id: students[0].user_id, category_id: categories[1].category_id, status_id: statuses[1].status_id, title: 'Water leakage', description: 'There is a water leakage from the tap in the bathroom. Water is continuously dripping.', priority: 'medium', location: 'A-101 Bathroom' },
        { student_id: students[0].user_id, category_id: categories[2].category_id, status_id: statuses[2].status_id, title: 'Broken chair', description: 'One of the chairs in my room is broken. The backrest is loose and unsafe.', priority: 'low', location: 'A-101' },
        { student_id: students[1].user_id, category_id: categories[3].category_id, status_id: statuses[0].status_id, title: 'Room not cleaned', description: 'My room has not been cleaned for the past 3 days. Please arrange cleaning.', priority: 'medium', location: 'A-102' },
        { student_id: students[1].user_id, category_id: categories[5].category_id, status_id: statuses[3].status_id, title: 'No internet connection', description: 'There is no internet connection in my room for the past 2 days.', priority: 'high', location: 'A-102' },
        { student_id: students[2].user_id, category_id: categories[0].category_id, status_id: statuses[1].status_id, title: 'Light flickering', description: 'The tube light in my room keeps flickering. It needs to be replaced.', priority: 'medium', location: 'B-201' },
        { student_id: students[2].user_id, category_id: categories[4].category_id, status_id: statuses[0].status_id, title: 'Lock not working', description: 'The door lock of my room is not working properly. It gets stuck frequently.', priority: 'high', location: 'B-201' },
        { student_id: students[3].user_id, category_id: categories[6].category_id, status_id: statuses[2].status_id, title: 'Food quality issue', description: 'The food served in the mess yesterday was not fresh. Many students got sick.', priority: 'high', location: 'Mess Hall' },
        { student_id: students[3].user_id, category_id: categories[1].category_id, status_id: statuses[0].status_id, title: 'Drainage blocked', description: 'The drainage in the bathroom is blocked. Water is not flowing properly.', priority: 'medium', location: 'B-202 Bathroom' },
        { student_id: students[4].user_id, category_id: categories[2].category_id, status_id: statuses[3].status_id, title: 'Table wobbly', description: 'The study table in my room is wobbly. One leg seems to be loose.', priority: 'low', location: 'C-301' },
        { student_id: students[4].user_id, category_id: categories[7].category_id, status_id: statuses[0].status_id, title: 'Noise complaint', description: 'There is excessive noise from the neighboring room late at night.', priority: 'medium', location: 'C-301' }
      ];

      for (const complaint of sampleComplaints) {
        await connection.execute(
          'INSERT INTO complaints (student_id, category_id, status_id, title, description, priority, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [complaint.student_id, complaint.category_id, complaint.status_id, complaint.title, complaint.description, complaint.priority, complaint.location]
        );
      }
      console.log('Sample complaints created successfully');

      // Get staff and admin users
      const [staff] = await connection.execute('SELECT user_id FROM users WHERE role = "staff"');
      const [admins] = await connection.execute('SELECT user_id FROM users WHERE role = "admin"');

      // Get the complaints we just created
      const [complaints] = await connection.execute('SELECT complaint_id, status_id FROM complaints');

      // Insert sample staff assignments
      if (staff.length > 0 && admins.length > 0 && complaints.length > 0) {
        const assignments = [
          { complaint_id: complaints[1].complaint_id, staff_id: staff[0].user_id, assigned_by: admins[0].user_id, notes: 'Please check the tap and fix the leakage', status: 'in_progress' },
          { complaint_id: complaints[4].complaint_id, staff_id: staff[1].user_id, assigned_by: admins[0].user_id, notes: 'Check the internet connection and router', status: 'completed' },
          { complaint_id: complaints[5].complaint_id, staff_id: staff[0].user_id, assigned_by: admins[1].user_id, notes: 'Replace the flickering light', status: 'in_progress' },
          { complaint_id: complaints[7].complaint_id, staff_id: staff[2].user_id, assigned_by: admins[1].user_id, notes: 'Investigate the food quality issue', status: 'in_progress' },
          { complaint_id: complaints[9].complaint_id, staff_id: staff[1].user_id, assigned_by: admins[0].user_id, notes: 'Fix the wobbly table', status: 'completed' }
        ];

        for (const assignment of assignments) {
          await connection.execute(
            'INSERT INTO staff_assignments (complaint_id, staff_id, assigned_by, notes, status) VALUES (?, ?, ?, ?, ?)',
            [assignment.complaint_id, assignment.staff_id, assignment.assigned_by, assignment.notes, assignment.status]
          );
        }
        console.log('Sample staff assignments created successfully');

        // Insert sample complaint history
        const historyEntries = [
          { complaint_id: complaints[1].complaint_id, status_id: statuses[0].status_id, changed_by: students[0].user_id, notes: 'Complaint submitted' },
          { complaint_id: complaints[1].complaint_id, status_id: statuses[1].status_id, changed_by: admins[0].user_id, notes: 'Complaint approved by admin' },
          { complaint_id: complaints[1].complaint_id, status_id: statuses[2].status_id, changed_by: staff[0].user_id, notes: 'Staff assigned and work in progress' },
          { complaint_id: complaints[4].complaint_id, status_id: statuses[0].status_id, changed_by: students[1].user_id, notes: 'Complaint submitted' },
          { complaint_id: complaints[4].complaint_id, status_id: statuses[1].status_id, changed_by: admins[0].user_id, notes: 'Complaint approved by admin' },
          { complaint_id: complaints[4].complaint_id, status_id: statuses[2].status_id, changed_by: staff[1].user_id, notes: 'Staff assigned and working on it' },
          { complaint_id: complaints[4].complaint_id, status_id: statuses[3].status_id, changed_by: staff[1].user_id, notes: 'Internet connection restored' },
          { complaint_id: complaints[5].complaint_id, status_id: statuses[0].status_id, changed_by: students[2].user_id, notes: 'Complaint submitted' },
          { complaint_id: complaints[5].complaint_id, status_id: statuses[1].status_id, changed_by: admins[1].user_id, notes: 'Complaint approved by admin' },
          { complaint_id: complaints[5].complaint_id, status_id: statuses[2].status_id, changed_by: staff[0].user_id, notes: 'Staff assigned and working on it' },
          { complaint_id: complaints[7].complaint_id, status_id: statuses[0].status_id, changed_by: students[3].user_id, notes: 'Complaint submitted' },
          { complaint_id: complaints[7].complaint_id, status_id: statuses[1].status_id, changed_by: admins[1].user_id, notes: 'Complaint approved by admin' },
          { complaint_id: complaints[7].complaint_id, status_id: statuses[2].status_id, changed_by: staff[2].user_id, notes: 'Staff assigned and investigating' },
          { complaint_id: complaints[9].complaint_id, status_id: statuses[0].status_id, changed_by: students[4].user_id, notes: 'Complaint submitted' },
          { complaint_id: complaints[9].complaint_id, status_id: statuses[1].status_id, changed_by: admins[0].user_id, notes: 'Complaint approved by admin' },
          { complaint_id: complaints[9].complaint_id, status_id: statuses[2].status_id, changed_by: staff[1].user_id, notes: 'Staff assigned and working on it' },
          { complaint_id: complaints[9].complaint_id, status_id: statuses[3].status_id, changed_by: staff[1].user_id, notes: 'Table repaired successfully' }
        ];

        for (const history of historyEntries) {
          await connection.execute(
            'INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
            [history.complaint_id, history.status_id, history.changed_by, history.notes]
          );
        }
        console.log('Sample complaint history created successfully');

        // Update resolved_at timestamp for resolved complaints
        await connection.execute(
          'UPDATE complaints SET resolved_at = NOW() WHERE status_id = ?',
          [statuses[3].status_id]
        );
        console.log('Resolved timestamps updated successfully');
      }
    }

    // Verify data
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [complaintCount] = await connection.execute('SELECT COUNT(*) as count FROM complaints');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM complaint_categories');
    const [statusCount] = await connection.execute('SELECT COUNT(*) as count FROM complaint_status');

    console.log('\n=== Database Setup Complete ===');
    console.log(`Users: ${userCount[0].count}`);
    console.log(`Complaints: ${complaintCount[0].count}`);
    console.log(`Categories: ${categoryCount[0].count}`);
    console.log(`Statuses: ${statusCount[0].count}`);
    console.log('\n=== Sample Login Credentials ===');
    console.log('Admin: admin1 / password123');
    console.log('Student: student1 / password123');
    console.log('Staff: staff1 / password123');

    await connection.end();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();