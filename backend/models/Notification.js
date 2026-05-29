/**
 * =============================================================================
 * QUERY.IN - NOTIFICATION MODEL
 * =============================================================================
 * Stores notification documents for persistence and offline retrieval.
 *
 * Notifications are created when:
 * 1. A peer answers an intern's query
 * 2. An admin/moderator resolves an intern's query
 * 3. An admin receives a yellow alert (10-occurrence threshold)
 * 4. A new announcement is created (broadcast to all interns)
 * 5. A new FAQ is added to the knowledge base (broadcast to all interns)
 *
 * @model Notification
 * @field {ObjectId} recipient_id - User who receives this notification
 * @field {String} type - Enum: 'peer_answer' | 'query_resolved' | 'admin_alert' | 'announcement' | 'faq_added'
 * @field {String} title - Short title for the notification
 * @field {String} message - Full notification text
 * @field {ObjectId} link_id - Related document ID (Query, FAQ, Announcement)
 * @field {String} link_type - Type of linked document: 'query' | 'faq' | 'announcement'
 * @field {Boolean} is_read - Whether user has dismissed/read this notification
 * @field {ObjectId} created_by - User who triggered the notification (nullable)
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Recipient ID is required'],
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: ['peer_answer', 'query_resolved', 'admin_alert', 'announcement', 'faq_added'],
        message: 'Type must be one of: peer_answer, query_resolved, admin_alert, announcement, faq_added',
      },
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    link_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    link_type: {
      type: String,
      enum: {
        values: ['query', 'faq', 'announcement', null],
        message: 'Invalid link type',
      },
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient_id: 1, is_read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
