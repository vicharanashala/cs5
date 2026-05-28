/**
 * =============================================================================
 * QUERY.IN - BADGE COMPONENT
 * =============================================================================
 * A reusable pill-shaped status badge component for query tracking.
 * Strict B&W theme with high contrast for readability.
 *
 * Variants:
 * - AI Generated: Black outline, white fill (pending/unknown)
 * - Peer Answered: Black fill, white text (active/peer response)
 * - Verified by Admin: White outline, black fill (official/approved)
 * - Ambiguous: Dashed border, muted text (special states)
 *
 * @component Badge
 */

const Badge = ({ children, variant = 'outline', className = '' }) => {
  const variants = {
    outline: 'border border-black text-black bg-white',
    filled: 'bg-black text-white',
    verified: 'border-2 border-black bg-black text-white',
    ambiguous: 'border border-dashed border-black text-text-muted bg-white',
    success: 'border border-black bg-white text-black',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wide rounded-full
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;