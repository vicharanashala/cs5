/**
 * =============================================================================
 * QUERY.IN - NOTIFICATION CONTROLLER
 * =============================================================================
 * Handles CRUD operations for notifications and real-time emission.
 *
 * NOTIFICATION TYPES:
 * - peer_answer: A peer has answered your query
 * - query_resolved: Your query was resolved by admin/moderator
 * - admin_alert: Yellow alert - 10-occurrence threshold reached
 * - announcement: New admin announcement broadcast
 *
 * @module controllers/notificationController
 */

const Notification = require('../models/Notification');
const User = require('../models/User');

let getIO;
try {
  getIO = require('../config/socket').getIO;
} catch (e) {
  getIO = null;
}

/**
 * createNotification
 * ------------------
 * Helper function to create a notification and emit via Socket.IO.
 *
 * @async
 * @function createNotification
 * @param {ObjectId} recipient_id - User to receive notification
 * @param {String} type - Notification type
 * @param {String} title - Short title
 * @param {String} message - Full message
 * @param {ObjectId} link_id - Related document ID
 * @param {String} link_type - Type of linked doc
 * @param {ObjectId} created_by - User who triggered it
 */
const createNotification = async ({
  recipient_id,
  type,
  title,
  message,
  link_id = null,
  link_type = null,
  created_by = null,
}) => {
  const notification = await Notification.create({
    recipient_id,
    type,
    title,
    message,
    link_id,
    link_type,
    created_by,
  });

  if (getIO) {
    const io = getIO();
    io.to(`user:${recipient_id.toString()}`).emit('new_notification', {
      _id: notification._id,
      type,
      title,
      message,
      link_id: link_id?.toString(),
      link_type,
      is_read: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

/**
 * getNotifications
 * ----------------
 * Get notifications for the current user.
 * Supports pagination and unread filtering.
 *
 * @async
 * @function getNotifications
 * @param {Object} req - Express request (query: page, limit, unread_only)
 * @param {Object} res - Express response
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unread_only = 'false' } = req.query;

    const query = { recipient_id: userId };
    if (unread_only === 'true') {
      query.is_read = false;
    }

    const notifications = await Notification.find(query)
      .populate('created_by', 'email role')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      unread_count: unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message,
    });
  }
};

/**
 * markAsRead
 * ----------
 * Mark a single notification as read.
 *
 * @async
 * @function markAsRead
 * @param {Object} req - Express request (params: id)
 * @param {Object} res - Express response
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: id, recipient_id: userId });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message,
    });
  }
};

/**
 * markAllAsRead
 * -------------
 * Mark all notifications for current user as read.
 *
 * @async
 * @function markAllAsRead
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient_id: userId, is_read: false },
      { $set: { is_read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message,
    });
  }
};

/**
 * deleteNotification
 * ------------------
 * Delete a single notification.
 *
 * @async
 * @function deleteNotification
 * @param {Object} req - Express request (params: id)
 * @param {Object} res - Express response
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient_id: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message,
    });
  }
};

/**
 * getUnreadCount
 * --------------
 * Get the count of unread notifications for current user.
 *
 * @async
 * @function getUnreadCount
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      recipient_id: userId,
      is_read: false,
    });

    res.status(200).json({
      success: true,
      unread_count: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
      message: error.message,
    });
  }
};

/**
 * emitAdminYellowAlert
 * --------------------
 * Emits a yellow alert to all admins when a NoFaq suggestion hits 10 occurrences.
 *
 * @async
 * @function emitAdminYellowAlert
 * @param {Object} suggestion - The NoFaq document
 */
const emitAdminYellowAlert = async (suggestion) => {
  const admins = await User.find({ role: 'admin' }).select('_id');

  for (const admin of admins) {
    await createNotification({
      recipient_id: admin._id,
      type: 'admin_alert',
      title: 'New FAQ Suggestion Alert',
      message: `Query "${suggestion.queryText}" has reached ${suggestion.occurrenceCount} occurrences. Review for potential FAQ creation.`,
      link_id: suggestion._id,
      link_type: 'faq',
    });
  }

  if (getIO) {
    const io = getIO();
    io.to('room:admins').emit('yellow_alert', {
      _id: suggestion._id,
      queryText: suggestion.queryText,
      occurrenceCount: suggestion.occurrenceCount,
      threshold: 10,
    });
  }
};

/**
 * broadcastAnnouncement
 * --------------------
 * Sends announcement notification to all interns.
 *
 * @async
 * @function broadcastAnnouncement
 * @param {Object} announcement - Announcement document
 * @param {ObjectId} adminId - Admin who created it
 */
const broadcastAnnouncement = async (announcement, adminId) => {
  const interns = await User.find({ role: 'intern' }).select('_id');

  for (const intern of interns) {
    await Notification.create({
      recipient_id: intern._id,
      type: 'announcement',
      title: announcement.heading,
      message: announcement.content.length > 200
        ? announcement.content.substring(0, 200) + '...'
        : announcement.content,
      link_id: announcement._id,
      link_type: 'announcement',
      created_by: adminId,
    });
  }

  if (getIO) {
    const io = getIO();
    io.to('room:admins').emit('announcement_created', {
      _id: announcement._id.toString(),
      heading: announcement.heading,
      content: announcement.content,
    });

    for (const intern of interns) {
      io.to(`user:${intern._id.toString()}`).emit('new_notification', {
        type: 'announcement',
        title: announcement.heading,
        message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
        link_id: announcement._id.toString(),
        link_type: 'announcement',
        is_read: false,
        createdAt: announcement.createdAt,
      });
    }
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  emitAdminYellowAlert,
  broadcastAnnouncement,
};
