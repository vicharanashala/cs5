/**
 * =============================================================================
 * QUERY.IN - BADGE COMPONENT
 * =============================================================================
 * Modern SaaS-style status badge with clean design.
 * Uses black, white, yellow highlight, and red for errors/warnings.
 *
 * @component Badge
 */

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    outline: 'border border-black text-black bg-white',
    filled: 'bg-black text-white',
    verified: 'bg-black text-white',
    highlight: 'bg-highlight text-black border border-black',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    errorFilled: 'bg-red-600 text-white border border-red-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;