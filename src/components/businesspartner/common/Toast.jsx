import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      className={`bp-toast bp-toast-${type}`}
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
    >
      {type === 'success'
        ? <CheckCircle2 size={16} />
        : <AlertCircle  size={16} />
      }
      {message}
    </motion.div>
  );
}