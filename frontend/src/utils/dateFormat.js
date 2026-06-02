/**
 * =============================================================================
 * QUERY.IN - DATE FORMATTING UTILITIES
 * =============================================================================
 * Standardized date and time formatting for the application.
 * Format: DD/MM/YYYY for dates, hh:MM AM/PM for time (12-hour format)
 *
 * @module utils/dateFormat
 */

/**
 * Format date as DD/MM/YYYY
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format time as hh:MM AM/PM (12-hour format)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${hoursStr}:${minutes} ${ampm}`;
};

/**
 * Format date and time as DD/MM/YYYY hh:MM AM/PM
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format date as short format (e.g., "Jan 15, 2026")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${month} ${day}, ${year}`;
};