/**
 * =============================================================================
 * QUERY.IN - ANNOUNCEMENT MODEL
 * =============================================================================
 * Represents system-wide announcements broadcast by admins to all users.
 * Only users with the 'admin' role can create announcements.
 *
 * @model Announcement
 * @field {ObjectId} admin_id - Reference to the admin User who created this
 * @field {String} heading - Announcement title/heading
 * @field {String} content - Announcement body text
 */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Admin ID is required'],
      ref: 'User',
    },
    heading: {
      type: String,
      required: [true, 'Heading is required'],
      trim: true,
      maxlength: [200, 'Heading cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;