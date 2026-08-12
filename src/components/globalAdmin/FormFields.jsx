// components/globalAdmin/ui/FormFields.jsx
import { motion } from 'framer-motion';
import { getNowDateTimeString } from '../../utils/BpHelpers';

// ── Input ──────────────────────────────────
export function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 800,
        color: '#000000', marginBottom: 6,
      }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #CBD5E1',
          background: disabled ? '#F7FAF4' : '#fff',
          fontSize: 14, fontWeight: 700, color: '#000000',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          transition: 'border 0.2s', boxSizing: 'border-box',
          opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => { if (!disabled) e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e)  => { e.target.style.borderColor = '#CBD5E1'; }}
      />
    </div>
  );
}

// ── Textarea ───────────────────────────────
export function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 800,
        color: '#000000', marginBottom: 6,
      }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #CBD5E1', background: '#fff',
          fontSize: 14, fontWeight: 700, color: '#000000',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          transition: 'border 0.2s', resize: 'vertical',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#16A34A'; }}
        onBlur={(e)  => { e.target.style.borderColor = '#CBD5E1'; }}
      />
    </div>
  );
}

// ── Select ─────────────────────────────────
export function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 800,
        color: '#000000', marginBottom: 6,
      }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #CBD5E1', background: '#fff',
          fontSize: 14, fontWeight: 700, color: '#000000',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return <option key={val} value={val} style={{ color: '#000000', fontWeight: 700 }}>{lbl}</option>;
        })}
      </select>
    </div>
  );
}

// ── DateTime ───────────────────────────────
export function DateTimeField({ label, value, onChange, min, max }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 800,
        color: '#000000', marginBottom: 6,
      }}>{label}</label>
      <input
        type="datetime-local"
        min={min !== undefined ? min : getNowDateTimeString()}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 12,
          border: '1px solid #CBD5E1', background: '#fff',
          fontSize: 14, fontWeight: 700, color: '#000000',
          fontFamily: 'Manrope, sans-serif', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ── Checkbox ───────────────────────────────
export function CheckboxField({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 12,
      border: '1px solid #CBD5E1', background: '#fff',
      cursor: 'pointer', marginBottom: 16,
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: '#16A34A', cursor: 'pointer' }}
      />
      <span style={{ fontSize: 13, fontWeight: 800, color: '#000000' }}>
        {label}
      </span>
    </label>
  );
}

// ── Green Button ───────────────────────────
export function GreenButton({ onClick, loading, children, fullWidth, variant = 'primary' }) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #16A34A, #15803D)',
      color: '#fff', border: 'none',
    },
    outline: {
      background: '#fff', color: '#16A34A',
      border: '1.5px solid #16A34A',
    },
  };
  const s = styles[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      style={{
        ...s,
        padding: '12px 24px', borderRadius: 12,
        fontSize: 14, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{
            width: 16, height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff', borderRadius: '50%',
          }}
        />
      )}
      {children}
    </motion.button>
  );
}

// ── Section Title ──────────────────────────
export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 800, color: '#166534',
      margin: '20px 0 12px', padding: '8px 0',
      borderBottom: '2px solid #F0FDF4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>{children}</div>
  );
}

// ── Shared button styles ───────────────────
export const sectionAddBtnStyle = {
  padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
  background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer',
};

export const removeBtnStyle = {
  padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
  background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer',
};