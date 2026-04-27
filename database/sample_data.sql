-- Hostel Complaint Management System - DML Scripts
-- Sample data for testing and demonstration

USE hostel_complaint_system;

-- Insert complaint categories
INSERT INTO complaint_categories (category_name, description) VALUES
('Electrical', 'Issues related to electrical fittings, lights, fans, and other electrical appliances'),
('Plumbing', 'Issues related to water supply, drainage, taps, and sanitary fittings'),
('Furniture', 'Issues related to beds, tables, chairs, and other furniture'),
('Cleaning', 'Issues related to room cleaning, corridor cleaning, and general hygiene'),
('Security', 'Issues related to security concerns, locks, and safety equipment'),
('Internet', 'Issues related to Wi-Fi connectivity and network problems'),
('Food', 'Issues related to mess food quality and service'),
('Other', 'Any other type of complaint not covered by the above categories');

-- Insert complaint statuses
INSERT INTO complaint_status (status_name, description) VALUES
('Pending', 'Complaint submitted and awaiting admin review'),
('Approved', 'Complaint approved by admin and awaiting staff assignment'),
('In Progress', 'Complaint is being addressed by assigned staff'),
('Resolved', 'Complaint has been successfully resolved'),
('Rejected', 'Complaint rejected by admin');

-- Insert sample users (passwords are hashed using bcrypt)
-- Note: In production, use proper password hashing
-- For demo purposes, these are simple hashes (you should use bcrypt in production)

-- Admin users
INSERT INTO users (username, password_hash, email, full_name, role, phone_number) VALUES
('admin1', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'admin1@hostel.edu', 'Admin User 1', 'admin', '555-0101'),
('admin2', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'admin2@hostel.edu', 'Admin User 2', 'admin', '555-0102');

-- Staff users
INSERT INTO users (username, password_hash, email, full_name, role, phone_number) VALUES
('staff1', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'staff1@hostel.edu', 'John Smith', 'staff', '555-0201'),
('staff2', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'staff2@hostel.edu', 'Jane Doe', 'staff', '555-0202'),
('staff3', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'staff3@hostel.edu', 'Mike Johnson', 'staff', '555-0203');

-- Student users
INSERT INTO users (username, password_hash, email, full_name, role, room_number, phone_number) VALUES
('student1', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'student1@hostel.edu', 'Alice Williams', 'student', 'A-101', '555-0301'),
('student2', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'student2@hostel.edu', 'Bob Brown', 'student', 'A-102', '555-0302'),
('student3', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'student3@hostel.edu', 'Charlie Davis', 'student', 'B-201', '555-0303'),
('student4', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'student4@hostel.edu', 'Diana Evans', 'student', 'B-202', '555-0304'),
('student5', '$2b$10$X7OpI5v5v5v5v5v5v5v5vO', 'student5@hostel.edu', 'Frank Miller', 'student', 'C-301', '555-0305');

-- Insert sample complaints
INSERT INTO complaints (student_id, category_id, status_id, title, description, priority, location) VALUES
-- Student 1 complaints
(6, 1, 1, 'Fan not working', 'The ceiling fan in my room is not working properly. It makes strange noises and rotates very slowly.', 'high', 'A-101'),
(6, 2, 2, 'Water leakage', 'There is a water leakage from the tap in the bathroom. Water is continuously dripping.', 'medium', 'A-101 Bathroom'),
(6, 3, 3, 'Broken chair', 'One of the chairs in my room is broken. The backrest is loose and unsafe.', 'low', 'A-101'),

-- Student 2 complaints
(7, 4, 1, 'Room not cleaned', 'My room has not been cleaned for the past 3 days. Please arrange cleaning.', 'medium', 'A-102'),
(7, 6, 4, 'No internet connection', 'There is no internet connection in my room for the past 2 days.', 'high', 'A-102'),

-- Student 3 complaints
(8, 1, 2, 'Light flickering', 'The tube light in my room keeps flickering. It needs to be replaced.', 'medium', 'B-201'),
(8, 5, 1, 'Lock not working', 'The door lock of my room is not working properly. It gets stuck frequently.', 'high', 'B-201'),

-- Student 4 complaints
(9, 7, 3, 'Food quality issue', 'The food served in the mess yesterday was not fresh. Many students got sick.', 'high', 'Mess Hall'),
(9, 2, 1, 'Drainage blocked', 'The drainage in the bathroom is blocked. Water is not flowing properly.', 'medium', 'B-202 Bathroom'),

-- Student 5 complaints
(10, 3, 4, 'Table wobbly', 'The study table in my room is wobbly. One leg seems to be loose.', 'low', 'C-301'),
(10, 8, 1, 'Noise complaint', 'There is excessive noise from the neighboring room late at night.', 'medium', 'C-301');

-- Insert sample staff assignments
INSERT INTO staff_assignments (complaint_id, staff_id, assigned_by, notes, status) VALUES
-- Assign staff to approved complaints
(2, 3, 1, 'Please check the tap and fix the leakage', 'in_progress'),
(5, 4, 1, 'Check the internet connection and router', 'completed'),
(7, 3, 2, 'Replace the flickering light', 'in_progress'),
(9, 5, 2, 'Investigate the food quality issue', 'in_progress'),
(11, 4, 1, 'Fix the wobbly table', 'completed');

-- Insert sample complaint history
INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES
-- Complaint 2 history
(2, 1, 6, 'Complaint submitted'),
(2, 2, 1, 'Complaint approved by admin'),
(2, 3, 3, 'Staff assigned and work in progress'),

-- Complaint 5 history
(5, 1, 7, 'Complaint submitted'),
(5, 2, 1, 'Complaint approved by admin'),
(5, 3, 4, 'Staff assigned and working on it'),
(5, 4, 4, 'Internet connection restored'),

-- Complaint 7 history
(7, 1, 8, 'Complaint submitted'),
(7, 2, 2, 'Complaint approved by admin'),
(7, 3, 3, 'Staff assigned and working on it'),

-- Complaint 9 history
(9, 1, 9, 'Complaint submitted'),
(9, 2, 2, 'Complaint approved by admin'),
(9, 3, 5, 'Staff assigned and investigating'),

-- Complaint 11 history
(11, 1, 10, 'Complaint submitted'),
(11, 2, 1, 'Complaint approved by admin'),
(11, 3, 4, 'Staff assigned and working on it'),
(11, 4, 4, 'Table repaired successfully');

-- Update resolved_at timestamp for resolved complaints
UPDATE complaints SET resolved_at = NOW() WHERE status_id = (SELECT status_id FROM complaint_status WHERE status_name = 'Resolved');

-- Display sample data
SELECT 'Users:' AS info;
SELECT * FROM users;

SELECT 'Complaint Categories:' AS info;
SELECT * FROM complaint_categories;

SELECT 'Complaint Status:' AS info;
SELECT * FROM complaint_status;

SELECT 'Complaints:' AS info;
SELECT * FROM complaints;

SELECT 'Staff Assignments:' AS info;
SELECT * FROM staff_assignments;

SELECT 'Complaint History:' AS info;
SELECT * FROM complaint_history;

-- Display views
SELECT 'Active Complaints View:' AS info;
SELECT * FROM active_complaints_view;

SELECT 'Complaint Statistics by Category:' AS info;
SELECT * FROM complaint_stats_by_category;

SELECT 'Staff Workload View:' AS info;
SELECT * FROM staff_workload_view;