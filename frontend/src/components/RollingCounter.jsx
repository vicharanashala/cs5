/**
 * =============================================================================
 * QUERY.IN - ROLLING COUNTER COMPONENT
 * =============================================================================
 * Animated odometer-style counter that rolls from 0 to target value.
 * Clean, premium slot-machine/wheel-scroll animation effect.
 *
 * @module components/RollingCounter
 */

import { useState, useEffect, useRef, useMemo } from 'react';

const RollingDigit = ({ digit, duration = 800 }) => {
  const [displayDigit, setDisplayDigit] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDigitRef = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const targetDigit = parseInt(digit, 10);
    const startDigit = prevDigitRef.current;

    if (startDigit === targetDigit) return;

    const steps = Math.max(Math.abs(targetDigit - startDigit), 1);
    const stepDuration = Math.min(duration / steps, 30);

    let current = startDigit;
    const direction = targetDigit > startDigit ? 1 : -1;

    setIsAnimating(true);

    const animate = () => {
      current += direction;
      setDisplayDigit(current);

      if ((direction > 0 && current >= targetDigit) || (direction < 0 && current <= targetDigit)) {
        setDisplayDigit(targetDigit);
        prevDigitRef.current = targetDigit;
        setIsAnimating(false);
      } else {
        animationRef.current = setTimeout(animate, stepDuration);
      }
    };

    animationRef.current = setTimeout(animate, stepDuration);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [digit, duration]);

  return (
    <span className="inline-block tabular-nums relative">
      <span
        className="block transition-transform duration-150 ease-out"
        style={{
          transform: isAnimating ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        {displayDigit}
      </span>
      {isAnimating && (
        <span
          className="absolute left-0 top-full block"
          style={{
            animation: `rollDigitUp ${duration}ms ease-out forwards`,
          }}
        >
          {digit}
        </span>
      )}
    </span>
  );
};

const getDigits = (num) => {
  const str = String(Math.abs(num));
  return str.split('').map((d) => d);
};

const RollingCounter = ({
  value = 0,
  duration = 1500,
  className = '',
  rollDigitDuration = 800,
  showPlusWhenMax = false,
  maxValue = 9999,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const animationRef = useRef(null);
  const hasRolledRef = useRef(false);

  useEffect(() => {
    const target = Math.min(Math.abs(value), maxValue);
    const start = hasRolledRef.current ? displayValue : 0;

    if (!hasRolledRef.current) {
      hasRolledRef.current = true;
    }

    if (start === target) {
      setDisplayValue(target);
      return;
    }

    setIsRolling(true);

    const startTime = performance.now();
    const difference = target - start;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.round(start + difference * eased);

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
        setIsRolling(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, maxValue]);

  const digits = getDigits(displayValue);
  const showPlus = showPlusWhenMax && Math.abs(value) > maxValue;

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="inline-flex overflow-hidden">
        {digits.map((digit, index) => (
          <span key={`${index}-${isRolling ? 'rolling' : 'static'}`} className="inline-block relative overflow-hidden">
            <RollingDigit digit={digit} duration={rollDigitDuration} />
          </span>
        ))}
      </span>
      {showPlus && <span className="ml-0.5">+</span>}
    </span>
  );
};

export default RollingCounter;