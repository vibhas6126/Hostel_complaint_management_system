-- Hostel Complaint Management System Database Schema
-- MySQL Database with proper normalization and relationships

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hostel_complaint_system;
USE hostel_complaint_system;

-- Drop tables if they exist (in correct order due to foreign key constraints)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS complaint_history;
DROP TABLE IF EXISTS staff_assignments;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS complaint_status;
DROP TABLE IF EXISTS complaint_categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Create Users table
-- Stores all user types: students, admins, and staff
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'admin', 'staff') NOT NULL,
    room_number VARCHAR(20),  -- Only for students
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Complaint Categories table
-- Normalized lookup table for complaint types
CREATE TABLE complaint_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Complaint Status table
-- Normalized lookup table for complaint statuses
CREATE TABLE complaint_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Complaints table
-- Main table storing all complaints with proper foreign key relationships
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category_id INT NOT NULL,
    status_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    location VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,

    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES complaint_categories(category_id),
    FOREIGN KEY (status_id) REFERENCES complaint_status(status_id),

    INDEX idx_student_id (student_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status_id (status_id),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Staff Assignments table
-- Tracks which staff member is assigned to which complaint
CREATE TABLE staff_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_by INT NOT NULL,  -- Admin who made the assignment
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    status ENUM('assigned', 'in_progress', 'completed', 'reassigned') DEFAULT 'assigned',

    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id),

    INDEX idx_complaint_id (complaint_id),
    INDEX idx_staff_id (staff_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Complaint History table
-- Tracks all status changes and updates to complaints
CREATE TABLE complaint_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_by INT NOT NULL,
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES complaint_status(status_id),
    FOREIGN KEY (changed_by) REFERENCES users(user_id),

    INDEX idx_complaint_id (complaint_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create views for common queries

-- View: Active complaints with details
CREATE VIEW active_complaints_view AS
SELECT
    c.complaint_id,
    c.title,
    c.description,
    c.priority,
    c.location,
    c.created_at,
    c.updated_at,
    u.full_name AS student_name,
    u.room_number AS student_room,
    u.email AS student_email,
    cat.category_name,
    stat.status_name,
    sa.staff_id,
    s.full_name AS assigned_staff_name,
    sa.assigned_at
FROM complaints c
JOIN users u ON c.student_id = u.user_id
JOIN complaint_categories cat ON c.category_id = cat.category_id
JOIN complaint_status stat ON c.status_id = stat.status_id
LEFT JOIN staff_assignments sa ON c.complaint_id = sa.complaint_id AND sa.status = 'assigned'
LEFT JOIN users s ON sa.staff_id = s.user_id
WHERE c.status_id != (SELECT status_id FROM complaint_status WHERE status_name = 'Resolved');

-- View: Complaint statistics by category
CREATE VIEW complaint_stats_by_category AS
SELECT
    cat.category_name,
    COUNT(c.complaint_id) AS total_complaints,
    SUM(CASE WHEN stat.status_name = 'Pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN stat.status_name = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
    SUM(CASE WHEN stat.status_name = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
    SUM(CASE WHEN stat.status_name = 'Rejected' THEN 1 ELSE 0 END) AS rejected
FROM complaint_categories cat
LEFT JOIN complaints c ON cat.category_id = c.category_id
LEFT JOIN complaint_status stat ON c.status_id = stat.status_id
GROUP BY cat.category_id, cat.category_name;

-- View: Staff workload statistics
CREATE VIEW staff_workload_view AS
SELECT
    u.user_id,
    u.full_name,
    COUNT(sa.assignment_id) AS total_assignments,
    SUM(CASE WHEN sa.status = 'assigned' THEN 1 ELSE 0 END) AS active_assignments,
    SUM(CASE WHEN sa.status = 'completed' THEN 1 ELSE 0 END) AS completed_assignments
FROM users u
LEFT JOIN staff_assignments sa ON u.user_id = sa.staff_id
WHERE u.role = 'staff'
GROUP BY u.user_id, u.full_name;