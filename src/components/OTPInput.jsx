import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

export default function OTPInput({ value = [], onChange, length = 6 }) {
  const inputRefs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const updateValue = (index, digit) => {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);

    if (!digit) {
      updateValue(index, '');
      return;
    }

    updateValue(index, digit);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        updateValue(index, '');
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateValue(index - 1, '');
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (!pasted) return;

    const next = Array(length).fill('');
    pasted.split('').forEach((digit, i) => {
      next[i] = digit;
    });

    onChange(next);

    const focusIndex = pasted.length >= length ? length - 1 : pasted.length;
    setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
  };

  return (
    <div className="w-full" onPaste={handlePaste}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${length}, 1fr)`,
          gap: '8px',
        }}
      >
        {Array.from({ length }).map((_, i) => {
          const isFilled = !!value[i];
          const isActive = focusedIndex === i;

          return (
            <motion.div
              key={i}
              animate={{ scale: isActive ? 1.05 : 1 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'relative' }}
            >
              <input
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value[i] || ''}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(-1)}
                className="w-full text-center outline-none"
                style={{
                  height: '56px',
                  borderRadius: '14px',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'Inter, monospace',
                  color: '#1F2937',
                  background: isActive
                    ? '#ffffff'
                    : isFilled
                    ? 'rgba(240,250,233,0.6)'
                    : 'rgba(249,250,251,0.95)',
                  border: `2px solid ${
                    isActive
                      ? '#A2CB8B'
                      : isFilled
                      ? 'rgba(162,203,139,0.5)'
                      : '#E5E7EB'
                  }`,
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(162,203,139,0.15), 0 8px 20px rgba(162,203,139,0.1)'
                    : isFilled
                    ? '0 4px 12px rgba(162,203,139,0.06)'
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
              />

              {/* Bottom active indicator */}
              {isActive && (
                <motion.div
                  layoutId="otp-indicator"
                  style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '16px',
                    height: '3px',
                    borderRadius: '99px',
                    background:
                      'linear-gradient(90deg, #A2CB8B, #7FB068)',
                  }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Filled check dot */}
              {isFilled && !isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #A2CB8B, #7FB068)',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}