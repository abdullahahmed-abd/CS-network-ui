export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d    = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60));
    if (diff < 1)  return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    const days = Math.floor(diff / 24);
    if (days === 1) return '1d ago';
    if (days < 7)   return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

export const formatFollowUp = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d      = new Date(dateStr);
    const now    = new Date(); now.setHours(0,0,0,0);
    const target = new Date(d); target.setHours(0,0,0,0);
    const diff   = Math.floor((target - now) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, overdue: true };
    if (diff === 0) return { text: 'Today',    overdue: false };
    if (diff === 1) return { text: 'Tomorrow', overdue: false };
    return { text: d.toLocaleDateString('en-US', { month:'short', day:'numeric' }), overdue: false };
  } catch { return { text: dateStr, overdue: false }; }
};

export const formatFullDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

export const fmtNumber = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n ?? 0);

export const fmtCurrency = (n, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n ?? 0);

export const getInitials = (name) => {
  if (!name) return 'BP';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

export const getStageConfig = (stageId, stages) =>
  stages.find(s => s.id === stageId);

export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getNowDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};