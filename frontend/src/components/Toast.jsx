/**
 * =============================================================================
 * QUERY.IN - TOAST COMPONENT
 * =============================================================================
 * Slide-in toast notification from bottom-right corner.
 * B&W theme, auto-dismisses after 5 seconds.
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
    }, 4700);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'admin_alert':
        return 'border-l-4 border-l-yellow-500';
      case 'announcement':
        return 'border-l-4 border-l-black';
      default:
        return 'border-l-4 border-l-black';
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 w-80 bg-white border border-black rounded-sm shadow-elevated
        transform transition-all duration-300 z-50
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`flex items-start gap-3 p-4 ${getTypeColor(notification.type)}`}>
        <button
          onClick={onClick}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide text-black">
              {notification.type === 'admin_alert' ? 'Alert' :
               notification.type === 'announcement' ? 'Announcement' :
               notification.type === 'peer_answer' ? 'New Answer' :
               notification.type === 'query_resolved' ? 'Resolved' : 'Notification'}
            </span>
          </div>
          <p className="text-sm font-medium text-black line-clamp-2">
            {notification.title}
          </p>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {notification.message}
          </p>
        </button>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-sm transition-colors"
        >
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="h-1 bg-black/10 rounded-b-sm overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-100 ease-linear"
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
