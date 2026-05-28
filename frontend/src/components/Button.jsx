/**
 * =============================================================================
 * QUERY.IN - BUTTON COMPONENT
 * =============================================================================
 * A foundational reusable button adhering to the strict B&W theme.
 * Primary state: solid black background with white text.
 * Features clean hover effects and inverted outline style on hover.
 *
 * @component Button
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button label/content
 * @param {'primary' | 'secondary' | 'outline'} [props.variant='primary'] - Button style variant
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {'button' | 'submit' | 'reset'} [props.type='button'] - HTML button type
 */

const Button = ({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center px-6 py-3
    font-medium text-sm uppercase tracking-wide
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    rounded-lg
  `;

  const variants = {
    primary: `
      bg-primary-black text-primary-white
      hover:bg-gray-800 hover:shadow-elevated
      focus:ring-primary-black
    `,
    secondary: `
      bg-primary-white text-primary-black border-2 border-primary-black
      hover:bg-gray-100 hover:shadow-elevated
      focus:ring-primary-black
    `,
    outline: `
      bg-transparent text-primary-black border border-primary-black
      hover:bg-primary-black hover:text-primary-white
      focus:ring-primary-black
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;