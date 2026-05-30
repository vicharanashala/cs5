/**
 * =============================================================================
 * QUERY.IN - CARD COMPONENT
 * =============================================================================
 * A foundational reusable container with modern SaaS-style design.
 * Black borders, rounded-xl corners, and soft shadows.
 *
 * @component Card
 */

const Card = ({ children, className = '', title, subtitle, action, hover = true }) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-black shadow-md
        ${hover ? 'hover:shadow-xl transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;