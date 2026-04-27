const express = require('express');
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all statuses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [statuses] = await db.query(
      'SELECT * FROM complaint_status ORDER BY status_name'
    );

    res.json({
      success: true,
      statuses
    });
  } catch (error) {
    console.error('Get statuses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statuses',
      error: error.message
    });
  }
});

// Get status by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [statuses] = await db.query(
      'SELECT * FROM complaint_status WHERE status_id = ?',
      [id]
    );

    if (statuses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }

    res.json({
      success: true,
      status: statuses[0]
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

// Create new status (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status_name, description } = req.body;

    if (!status_name) {
      return res.status(400).json({
        success: false,
        message: 'Status name is required'
      });
    }

    const [result] = await db.query(
      'INSERT INTO complaint_status (status_name, description) VALUES (?, ?)',
      [status_name, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Status created successfully',
      status_id: result.insertId
    });
  } catch (error) {
    console.error('Create status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create status',
      error: error.message
    });
  }
});

// Update status (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_name, description } = req.body;

    const [result] = await db.query(
      'UPDATE complaint_status SET status_name = ?, description = ? WHERE status_id = ?',
      [status_name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Delete status (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM complaint_status WHERE status_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Status not found'
      });
    }

    res.json({
      success: true,
      message: 'Status deleted successfully'
    });
  } catch (error) {
    console.error('Delete status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete status',
      error: error.message
    });
  }
});

module.exports = router;