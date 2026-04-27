const express = require('express');
const db = require('../config/database');
const { authenticateToken, isAdmin, isStaff } = require('../middleware/auth');

const router = express.Router();

// Get all assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { complaint_id, staff_id } = req.query;

    let query = `
      SELECT sa.*, c.title as complaint_title, c.status_id,
             s.full_name as staff_name, s.role as staff_role,
             a.full_name as assigned_by_name,
             stat.status_name
      FROM staff_assignments sa
      JOIN complaints c ON sa.complaint_id = c.complaint_id
      JOIN users s ON sa.staff_id = s.user_id
      JOIN users a ON sa.assigned_by = a.user_id
      JOIN complaint_status stat ON c.status_id = stat.status_id
      WHERE 1=1
    `;

    const params = [];

    // Staff can only see their own assignments
    if (req.user.role === 'staff') {
      query += ' AND sa.staff_id = ?';
      params.push(req.user.user_id);
    }

    if (complaint_id) {
      query += ' AND sa.complaint_id = ?';
      params.push(complaint_id);
    }

    if (staff_id && req.user.role === 'admin') {
      query += ' AND sa.staff_id = ?';
      params.push(staff_id);
    }

    query += ' ORDER BY sa.assigned_at DESC';

    const [assignments] = await db.query(query, params);

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignments',
      error: error.message
    });
  }
});

// Get assignment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [assignments] = await db.query(
      `
      SELECT sa.*, c.title as complaint_title, c.description as complaint_description,
             c.status_id, c.priority, c.location,
             s.full_name as staff_name, s.role as staff_role,
             a.full_name as assigned_by_name,
             stat.status_name
      FROM staff_assignments sa
      JOIN complaints c ON sa.complaint_id = c.complaint_id
      JOIN users s ON sa.staff_id = s.user_id
      JOIN users a ON sa.assigned_by = a.user_id
      JOIN complaint_status stat ON c.status_id = stat.status_id
      WHERE sa.assignment_id = ?
      `,
      [id]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user has access to this assignment
    const assignment = assignments[0];
    if (req.user.role === 'staff' && assignment.staff_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own assignments'
      });
    }

    res.json({
      success: true,
      assignment: assignments[0]
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get assignment',
      error: error.message
    });
  }
});

// Create new assignment (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { complaint_id, staff_id, notes } = req.body;

    if (!complaint_id || !staff_id) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and Staff ID are required'
      });
    }

    // Verify complaint exists
    const [complaints] = await db.query(
      'SELECT * FROM complaints WHERE complaint_id = ?',
      [complaint_id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify staff exists
    const [staff] = await db.query(
      'SELECT * FROM users WHERE user_id = ? AND role = ?',
      [staff_id, 'staff']
    );

    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Create assignment
    const [result] = await db.query(
      'INSERT INTO staff_assignments (complaint_id, staff_id, assigned_by, notes, status) VALUES (?, ?, ?, ?, ?)',
      [complaint_id, staff_id, req.user.user_id, notes || null, 'assigned']
    );

    // Update complaint status to "In Progress" if it was "Approved"
    const [statusInfo] = await db.query(
      'SELECT status_id FROM complaint_status WHERE status_name = ?',
      ['In Progress']
    );

    if (statusInfo.length > 0) {
      await db.query(
        'UPDATE complaints SET status_id = ? WHERE complaint_id = ?',
        [statusInfo[0].status_id, complaint_id]
      );

      // Add to complaint history
      await db.query(
        'INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
        [complaint_id, statusInfo[0].status_id, req.user.user_id, 'Staff assigned: ' + (staff[0].full_name)]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Staff assigned successfully',
      assignment_id: result.insertId
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
      error: error.message
    });
  }
});

// Update assignment status (staff or admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Get assignment details
    const [assignments] = await db.query(
      'SELECT * FROM staff_assignments WHERE assignment_id = ?',
      [id]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const assignment = assignments[0];

    // Check if user has access to update this assignment
    if (req.user.role === 'staff' && assignment.staff_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own assignments'
      });
    }

    // Update assignment status
    const [result] = await db.query(
      'UPDATE staff_assignments SET status = ?, notes = ? WHERE assignment_id = ?',
      [status, notes || assignment.notes, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If assignment is completed, update complaint status to "Resolved"
    if (status === 'completed') {
      const [resolvedStatus] = await db.query(
        'SELECT status_id FROM complaint_status WHERE status_name = ?',
        ['Resolved']
      );

      if (resolvedStatus.length > 0) {
        await db.query(
          'UPDATE complaints SET status_id = ?, resolved_at = NOW() WHERE complaint_id = ?',
          [resolvedStatus[0].status_id, assignment.complaint_id]
        );

        // Add to complaint history
        await db.query(
          'INSERT INTO complaint_history (complaint_id, status_id, changed_by, notes) VALUES (?, ?, ?, ?)',
          [assignment.complaint_id, resolvedStatus[0].status_id, req.user.user_id, 'Assignment completed by staff']
        );
      }
    }

    res.json({
      success: true,
      message: 'Assignment status updated successfully'
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment status',
      error: error.message
    });
  }
});

// Delete assignment (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM staff_assignments WHERE assignment_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
});

module.exports = router;