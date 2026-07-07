import { useRef, useEffect } from 'react';

export default function OTPInput({ value, onChange, length = 6 }) {
  const inputsRef = useRef([]);

  // Guard against undefined / wrong-length props so line 106 never crashes
  const otpValues = Array.isArray(value) && value.length === length
    ? value
    : Array(length).fill('');

  const focusInput = (index) => {
    const input = inputsRef.current[index];
    if (input) input.focus();
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;                 // reject non-digits
    const digit = val.slice(-1);                    // take last typed char
    const newValues = [...otpValues];
    newValues[index] = digit;
    onChange(newValues);

    if (digit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValues = [...otpValues];

      if (otpValues[index]) {
        newValues[index] = '';
        onChange(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        onChange(newValues);
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const newValues = [...otpValues];
    pasted.split('').forEach((char, i) => {
      if (i < length) newValues[i] = char;
    });
    onChange(newValues);

    const nextIndex = Math.min(pasted.length, length - 1);
    focusInput(nextIndex);
  };

  // Focus first empty box on mount
  useEffect(() => {
    const firstEmpty = otpValues.findIndex((v) => v === '');
    focusInput(firstEmpty !== -1 ? firstEmpty : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex justify-between gap-2 w-full">
      {otpValues.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-full aspect-square max-w-[3.5rem] text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
          style={{
            borderColor: digit ? '#25D366' : '#E5E7EB',
            color: '#1F2937',
            backgroundColor: '#FFFFFF',
          }}
        />
      ))}
    </div>
  );
}