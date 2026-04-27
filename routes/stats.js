const express = require('express');
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get overall statistics
router.get('/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Total complaints by status
    const [statusStats] = await db.query(`
      SELECT
        stat.status_name,
        COUNT(c.complaint_id) as count
      FROM complaint_status stat
      LEFT JOIN complaints c ON stat.status_id = c.status_id
      GROUP BY stat.status_id, stat.status_name
      ORDER BY stat.status_id
    `);

    // Total complaints by category
    const [categoryStats] = await db.query(`
      SELECT
        cat.category_name,
        COUNT(c.complaint_id) as count
      FROM complaint_categories cat
      LEFT JOIN complaints c ON cat.category_id = c.category_id
      GROUP BY cat.category_id, cat.category_name
      ORDER BY count DESC
    `);

    // Total complaints by priority
    const [priorityStats] = await db.query(`
      SELECT
        priority,
        COUNT(*) as count
      FROM complaints
      GROUP BY priority
      ORDER BY
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END
    `);

    // Recent complaints
    const [recentComplaints] = await db.query(`
      SELECT
        c.complaint_id,
        c.title,
        c.priority,
        c.created_at,
        u.full_name as student_name,
        cat.category_name,
        stat.status_name
      FROM complaints c
      JOIN users u ON c.student_id = u.user_id
      JOIN complaint_categories cat ON c.category_id = cat.category_id
      JOIN complaint_status stat ON c.status_id = stat.status_id
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    // Staff workload
    const [staffWorkload] = await db.query(`
      SELECT
        u.user_id,
        u.full_name,
        COUNT(sa.assignment_id) as total_assignments,
        SUM(CASE WHEN sa.status = 'assigned' THEN 1 ELSE 0 END) as active_assignments,
        SUM(CASE WHEN sa.status = 'completed' THEN 1 ELSE 0 END) as completed_assignments
      FROM users u
      LEFT JOIN staff_assignments sa ON u.user_id = sa.staff_id
      WHERE u.role = 'staff'
      GROUP BY u.user_id, u.full_name
      ORDER BY active_assignments DESC
    `);

    // Total counts
    const [totalCounts] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'staff') as total_staff,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM complaints) as total_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status_id = (SELECT status_id FROM complaint_status WHERE status_name = 'Pending')) as pending_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status_id = (SELECT status_id FROM complaint_status WHERE status_name = 'In Progress')) as in_progress_complaints,
        (SELECT COUNT(*) FROM complaints WHERE status_id = (SELECT status_id FROM complaint_status WHERE status_name = 'Resolved')) as resolved_complaints
    `);

    res.json({
      success: true,
      stats: {
        status: statusStats,
        category: categoryStats,
        priority: priorityStats,
        recent_complaints: recentComplaints,
        staff_workload: staffWorkload,
        totals: totalCounts[0]
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overview statistics',
      error: error.message
    });
  }
});

// Get complaint statistics by date range
router.get('/complaints-by-date', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT
        DATE(c.created_at) as date,
        COUNT(*) as count,
        stat.status_name
      FROM complaints c
      JOIN complaint_status stat ON c.status_id = stat.status_id
      WHERE 1=1
    `;

    const params = [];

    if (start_date) {
      query += ' AND DATE(c.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(c.created_at) <= ?';
      params.push(end_date);
    }

    query += ' GROUP BY DATE(c.created_at), stat.status_name ORDER BY date DESC';

    const [complaintsByDate] = await db.query(query, params);

    res.json({
      success: true,
      complaints_by_date: complaintsByDate
    });
  } catch (error) {
    console.error('Get complaints by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complaints by date',
      error: error.message
    });
  }
});

// Get student statistics
router.get('/students', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [studentStats] = await db.query(`
      SELECT
        u.user_id,
        u.full_name,
        u.room_number,
        COUNT(c.complaint_id) as total_complaints,
        SUM(CASE WHEN stat.status_name = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN stat.status_name = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN stat.status_name = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM users u
      LEFT JOIN complaints c ON u.user_id = c.student_id
      LEFT JOIN complaint_status stat ON c.status_id = stat.status_id
      WHERE u.role = 'staff'
      GROUP BY u.user_id, u.full_name, u.room_number
      ORDER BY total_complaints DESC
    `);

    res.json({
      success: true,
      student_stats: studentStats
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student statistics',
      error: error.message
    });
  }
});

// Get resolution time statistics
router.get('/resolution-time', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [resolutionStats] = await db.query(`
      SELECT
        c.complaint_id,
        c.title,
        c.created_at,
        c.resolved_at,
        TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at) as resolution_hours,
        u.full_name as student_name,
        cat.category_name
      FROM complaints c
      JOIN users u ON c.student_id = u.user_id
      JOIN complaint_categories cat ON c.category_id = cat.category_id
      WHERE c.resolved_at IS NOT NULL
      ORDER BY c.resolved_at DESC
      LIMIT 20
    `);

    // Calculate average resolution time
    const [avgResolution] = await db.query(`
      SELECT
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours,
        MIN(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as min_hours,
        MAX(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as max_hours
      FROM complaints
      WHERE resolved_at IS NOT NULL
    `);

    res.json({
      success: true,
      resolution_stats: resolutionStats,
      averages: avgResolution[0]
    });
  } catch (error) {
    console.error('Get resolution time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resolution time statistics',
      error: error.message
    });
  }
});

module.exports = router;