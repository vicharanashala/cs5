/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENT CONTROLLER
 * =============================================================================
 * Handles CRUD operations for admin announcements.
 *
 * @module controllers/announcementController
 */

const Announcement = require('../models/Announcement');
const { broadcastAnnouncement } = require('./notificationController');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

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
    const { heading, content, priority } = req.body;
    const admin_id = req.user.userId;

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
      priority: priority || 'medium',
    });

    await broadcastAnnouncement(announcement, admin_id);

    if (getIO) {
      getIO().emit('announcements_updated');
    }

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

const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, content, priority } = req.body;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    if (heading) announcement.heading = heading;
    if (content) announcement.content = content;
    if (priority) announcement.priority = priority;

    await announcement.save();

    if (getIO) {
      getIO().emit('announcements_updated');
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update announcement',
      message: error.message,
    });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found',
      });
    }

    if (getIO) {
      getIO().emit('announcements_updated');
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete announcement',
      message: error.message,
    });
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};