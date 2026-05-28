/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENT CONTROLLER
 * =============================================================================
 * Handles CRUD operations for admin announcements.
 *
 * @module controllers/announcementController
 */

const Announcement = require('../models/Announcement');

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .populate('admin_id', 'email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch announcements',
      message: error.message,
    });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { heading, content } = req.body;
    const admin_id = req.user.id;

    if (!heading || !content) {
      return res.status(400).json({
        success: false,
        error: 'Heading and content are required',
      });
    }

    const announcement = await Announcement.create({
      admin_id,
      heading,
      content,
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement',
      message: error.message,
    });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
};