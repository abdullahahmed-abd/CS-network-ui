import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingInput({
  label,
  value = '',
  onChange,
  type = 'text',
  error,
  helperText,
  suffix,
  placeholder,
  autoFocus = false,
  maxLength,
  pattern,
  inputMode,
  disabled = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block mb-2 text-sm font-semibold"
          style={{ color: '#374151' }}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          maxLength={maxLength}
          pattern={pattern}
          inputMode={inputMode}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full outline-none"
          style={{
            height: '54px',
            borderRadius: '14px',
            border: `1.5px solid ${error ? '#EF4444' : '#E5E7EB'}`,
            background: disabled ? '#F3F4F6' : 'rgba(255,255,255,0.95)',
            paddingLeft: '16px',
            paddingRight: suffix ? '52px' : '16px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1F2937',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease',
            boxShadow: error
              ? '0 0 0 4px rgba(239,68,68,0.08)'
              : '0 4px 14px rgba(15,23,42,0.04)',
          }}
          onFocus={(e) => {
            e.target.style.border = error ? '1.5px solid #EF4444' : '1.5px solid #A2CB8B';
            e.target.style.boxShadow = error
              ? '0 0 0 4px rgba(239,68,68,0.08)'
              : '0 0 0 4px rgba(162,203,139,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.border = error ? '1.5px solid #EF4444' : '1.5px solid #E5E7EB';
            e.target.style.boxShadow = error
              ? '0 0 0 4px rgba(239,68,68,0.08)'
              : '0 4px 14px rgba(15,23,42,0.04)';
          }}
        />

        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {suffix}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            className="mt-2 ml-1 text-xs font-medium"
            style={{ color: '#EF4444' }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {error}
          </motion.p>
        ) : helperText ? (
          <motion.p
            key="helper"
            className="mt-2 ml-1 text-xs font-medium"
            style={{ color: '#6B7280' }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {helperText}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}