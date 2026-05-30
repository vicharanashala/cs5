/**
 * =============================================================================
 * QUERY.IN - BUTTON COMPONENT
 * =============================================================================
 * A foundational reusable button adhering to the strict B&W theme.
 * Primary state: solid black background with white text.
 * Highlight state: yellow background with black text for emphasis.
 * Black borders, rounded-xl corners, and soft shadows.
 *
 * @component Button
 */

const Button = ({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  size = 'md',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: `
      bg-black text-white border border-black rounded-xl shadow-md
      hover:bg-gray-800 hover:shadow-lg
      active:bg-gray-900
    `,
    secondary: `
      bg-white text-black border-2 border-black rounded-xl shadow-md
      hover:bg-gray-50 hover:shadow-lg
      active:bg-gray-100
    `,
    outline: `
      bg-transparent text-black border border-black rounded-xl shadow-sm
      hover:bg-black hover:text-white hover:shadow-lg
    `,
    highlight: `
      bg-highlight text-black border-2 border-black rounded-xl shadow-md
      hover:bg-highlight-dark hover:shadow-lg
      active:bg-highlight-dark
    `,
    ghost: `
      bg-transparent text-black rounded-xl
      hover:bg-gray-100 shadow-sm
      active:bg-gray-200
    `,
    error: `
      bg-red-600 text-white border border-red-700 rounded-xl shadow-md
      hover:bg-red-700 hover:shadow-lg
      active:bg-red-800
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;