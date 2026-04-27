const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const { authenticateToken, isAdmin, isStudent } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all complaints (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, category, priority, student_id } = req.query;

    let query = `
      SELECT c.*, u.full_name as student_name, u.room_number as student_room, u.email as student_email,
             cat.category_name, stat.status_name,
             sa.staff_id, s.full_name as assigned_staff_name
      FROM complaints c
      JOIN users u ON c.student_id = u.user_id
      JOIN complaint_categories cat ON c.category_id = cat.category_id
      JOIN complaint_status stat ON c.status_id = stat.status_id
      LEFT JOIN staff_assignments sa ON c.complaint_id = sa.complaint_id AND sa.status = 'assigned'
      LEFT JOIN users s ON sa.staff_id = s.user_id
      WHERE 1=1
    `;

    const params = [];

    // Students can only see their own complaints
    if (req.user.role === 'student') {
      query += ' AND c.student_id = ?';
      params.push(req.user.user_id);
    }

    // Apply filters
    if (status) {
      query += ' AND stat.status_name = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND cat.category_name = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND c.priority = ?';
      params.push(priority);
    }

    if (student_id && req.user.role === 'admin') {
      query += ' AND c.student_id = ?';
      params.push(student_id);
    }

    query += ' ORDER BY c.created_at DESC';

    const [complaints] = await db.query(query, params);

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complaints',
      error: error.message
    });
  }
});

// Get complaint by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [complaints] = await db.query(
      `
      SELECT c.*, u.full_name as student_name, u.room_number as student_room, u.email as student_email,
             cat.category_name, stat.status_name,
             sa.staff_id, s.full_name as assigned_staff_name, sa.assigned_at, sa.notes as assignment_notes
      FROM complaints c
      JOIN users u ON c.student_id = u.user_id
      JOIN complaint_categories cat ON c.category_id = cat.category_id
      JOIN complaint_status stat ON c.status_id = stat.status_id
      LEFT JOIN staff_assignments sa ON c.complaint_id = sa.complaint_id AND sa.status = 'assigned'
      LEFT JOIN users s ON sa.staff_id = s.user_id
      WHERE c.complaint_id = ?
      `,
      [id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Get complaint history
    const [history] = await db.query(
      `
      SELECT ch.*, stat.status_name, u.full_name as changed_by_name
      FROM complaint_history ch
      JOIN complaint_status stat ON ch.status_id = stat.status_id
      JOIN users u ON ch.changed_by = u.user_id
      WHERE ch.complaint_id = ?
      ORDER BY ch.changed_at DESC
      `,
      [id]
    );

    res.json({
      success: true,
      complaint: complaints[0],
      history
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get complaint',
      error: error.message
    });
  }
});

// Create new complaint (student only)
router.post('/', authenticateToken, isStudent, upload.single('image'), async (req, res) => {
  try {
    const { category_id, title, description, priority, location } = req.body;

    // Validate required fields
    if (!category_id || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get pending status ID
    const [statuses] = await db.query(
      'SELECT status_id FROM complaint_status WHERE status_name = ?',
      ['Pending']
    );

    if (statuses.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'System error: Pending status not found'
      });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      'INSERT INTO complaints (student_id, category_id, status_id, title, description, priority, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.user_id,
        category_id,
        statuses[0].status_id,
        title,
        description,
        priority || 'medium',
        location || null,
        image_url
      ]
    );

    // Add to complaint history
    await db.query(
      'INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
      [result.insertId, statuses[0].status_id, req.user.user_id, 'Complaint submitted']
    );

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint_id: result.insertId
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
});

// Update complaint status (admin only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id, notes } = req.body;

    if (!status_id) {
      return res.status(400).json({
        success: false,
        message: 'Status ID is required'
      });
    }

    // Update complaint status
    const [result] = await db.query(
      'UPDATE complaints SET status_id = ? WHERE complaint_id = ?',
      [status_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add to complaint history
    await db.query(
      'INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
      [id, status_id, req.user.user_id, notes || 'Status updated']
    );

    // If status is resolved, update resolved_at timestamp
    const [statusInfo] = await db.query(
      'SELECT status_name FROM complaint_status WHERE status_id = ?',
      [status_id]
    );

    if (statusInfo.length > 0 && statusInfo[0].status_name === 'Resolved') {
      await db.query(
        'UPDATE complaints SET resolved_at = NOW() WHERE complaint_id = ?',
        [id]
      );
    }

    res.json({
      success: true,
      message: 'Complaint status updated successfully'
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
});

// Delete complaint (admin only or own complaint by student)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the complaint or is admin
    if (req.user.role === 'student') {
      const [complaints] = await db.query(
        'SELECT student_id FROM complaints WHERE complaint_id = ?',
        [id]
      );

      if (complaints.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      if (complaints[0].student_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own complaints'
        });
      }
    }

    const [result] = await db.query(
      'DELETE FROM complaints WHERE complaint_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message
    });
  }
});

module.exports = router;