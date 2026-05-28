/**
 * =============================================================================
 * QUERY.IN - CARD COMPONENT
 * =============================================================================
 * A foundational reusable container component adhering to the strict B&W theme.
 * Features an elevated white background, sharp black border, and soft drop-shadow.
 *
 * @component Card
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.title] - Optional card title
 * @param {string} [props.subtitle] - Optional card subtitle
 */

const Card = ({ children, className = '', title, subtitle }) => {
  return (
    <div
      className={`
        bg-background-card border border-border-subtle rounded-lg
        shadow-card transition-shadow duration-200 hover:shadow-card-hover
        ${className}
      `}
    >
      {/* Optional Card Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-border-subtle">
          {title && (
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;