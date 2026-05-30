/**
 * =============================================================================
 * QUERY.IN - TOAST COMPONENT
 * =============================================================================
 * Modern slide-in toast notification with smooth animations.
 * Black, white, and yellow highlight theme.
 *
 * @component Toast
 */

import { useEffect, useState } from 'react';

const Toast = ({ notification, onClose, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'admin_alert':
        return {
          border: 'border-l-4 border-l-highlight',
          bg: 'bg-white',
          bar: 'bg-highlight',
        };
      case 'announcement':
        return {
          border: 'border-l-4 border-l-black',
          bg: 'bg-white',
          bar: 'bg-black',
        };
      case 'peer_answer':
        return {
          border: 'border-l-4 border-l-black',
          bg: 'bg-white',
          bar: 'bg-black',
        };
      case 'query_resolved':
        return {
          border: 'border-l-4 border-l-green-500',
          bg: 'bg-white',
          bar: 'bg-green-500',
        };
      case 'intern_warning':
        return {
          border: 'border-l-4 border-l-red-600',
          bg: 'bg-red-50',
          bar: 'bg-red-600',
        };
      default:
        return {
          border: 'border-l-4 border-l-black',
          bg: 'bg-white',
          bar: 'bg-black',
        };
    }
  };

  const styles = getTypeStyles(notification.type);

  return (
    <div
      className={`
        fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl border border-gray-200
        transform transition-all duration-300 ease-out z-50 overflow-hidden
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`flex items-start gap-4 p-5 ${styles.border}`}>
        <button
          onClick={onClick}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`
              text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full
              ${notification.type === 'admin_alert' ? 'bg-highlight text-black'
                : notification.type === 'intern_warning' ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-black text-white'}
            `}>
              {notification.type === 'admin_alert' ? 'Alert' :
               notification.type === 'announcement' ? 'Announcement' :
               notification.type === 'peer_answer' ? 'New Answer' :
               notification.type === 'query_resolved' ? 'Resolved' :
               notification.type === 'intern_warning' ? 'Warning' : 'Notification'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {notification.message}
          </p>
        </button>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all duration-[5000ms] ease-linear ${styles.bar}`}
          style={{ width: '100%', animation: 'shrink 5s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
