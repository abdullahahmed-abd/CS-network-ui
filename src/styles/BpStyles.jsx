import { THEME } from '../components/constants/BpConstants';

const generateCSSVars = (theme) =>
  Object.entries(theme)
    .map(([key, val]) =>
      `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${val};`
    )
    .join('\n    ');

export const BP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

  :root {
    ${generateCSSVars(THEME)}
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; overflow: hidden; }

  .bp-app {
    font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
    background:
      radial-gradient(ellipse at top left, var(--primary-cloud) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, var(--primary-mist) 0%, transparent 50%),
      radial-gradient(ellipse at center, var(--primary-sky) 0%, var(--white) 100%),
      linear-gradient(135deg, var(--white) 0%, var(--primary-cloud) 50%, var(--primary-mist) 100%);
    display: grid;
    grid-template-columns: 240px 1fr;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .bp-app::before {
    content: '';
    position: fixed;
    top: -50%; right: -20%;
    width: 800px; height: 800px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.15), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .bp-app::after {
    content: '';
    position: fixed;
    bottom: -50%; left: -20%;
    width: 800px; height: 800px;
    background: radial-gradient(circle, rgba(var(--primary-light-rgb), 0.12), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--primary-light), var(--primary));
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--primary-bright), var(--primary-dark));
  }

  /* ═══════════════════ SIDEBAR ═══════════════════ */
  .sidebar {
    background: linear-gradient(180deg, var(--white) 0%, var(--primary-sky) 100%);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(var(--primary-rgb), 0.15);
    padding: 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 10;
    box-shadow: 4px 0 24px rgba(var(--primary-rgb), 0.06);
  }

  .sidebar::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 4px; height: 100%;
    background: linear-gradient(180deg, transparent, var(--primary), var(--primary-light), var(--primary), transparent);
    opacity: 0.3;
  }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px 10px 20px;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.15);
    margin-bottom: 12px;
    flex-shrink: 0;
    position: relative;
  }

  .brand-diamond {
    width: 56px; height: 56px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .brand-diamond::before {
    content: '';
    position: absolute;
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    transform: rotate(45deg);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(var(--primary-rgb), 0.3);
  }
  .brand-diamond::after {
    content: '';
    position: absolute;
    width: 20px; height: 20px;
    background: var(--white);
    transform: rotate(45deg);
    border-radius: 3px;
  }

  .brand-text {
    font-family: 'Inter', sans-serif;
    font-weight: 800; font-size: 15px;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.02em;
    text-align: center;
  }
  .brand-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-muted);
    font-weight: 700;
    margin-top: 2px;
    text-align: center;
  }

  .nav { display: flex; flex-direction: column; gap: 3px; flex-shrink: 0; }
  .nav-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--text-muted);
    padding: 12px 12px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    color: var(--text-med);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }
  .nav-item::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08), rgba(var(--primary-light-rgb), 0.08));
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .nav-item:hover {
    color: var(--primary-dark);
    transform: translateX(2px);
  }
  .nav-item:hover::before { opacity: 1; }
  .nav-item.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
    font-weight: 700;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    transform: translateX(4px);
  }
  .nav-item.active::before { opacity: 0; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; position: relative; z-index: 1; }
  .nav-item span { position: relative; z-index: 1; }

  .nav-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.2), transparent);
    margin: 12px 8px;
  }

  .nav-stage {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    color: var(--text-light);
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;
  }
  .nav-stage:hover {
    background: rgba(var(--primary-rgb), 0.06);
    color: var(--primary-dark);
    border-color: rgba(var(--primary-rgb), 0.1);
  }
  .nav-stage.active {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-dark);
    border-color: rgba(var(--primary-rgb), 0.2);
    font-weight: 700;
  }

  .nav-stage-icon-box {
    width: 24px; height: 24px;
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .nav-stage-icon-box svg { width: 13px; height: 13px; }
  .nav-stage.active .nav-stage-icon-box {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
  }
  .nav-stage.active .nav-stage-icon-box svg { color: var(--white) !important; }

  .nav-stage-count {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    color: var(--text-muted);
    padding: 2px 7px;
    background: rgba(var(--primary-rgb), 0.06);
    border-radius: 6px;
  }
  .nav-stage.active .nav-stage-count {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: var(--white);
  }

  .sidebar-foot {
    margin-top: auto;
    padding-top: 16px;
    flex-shrink: 0;
  }
  .profile-card {
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 100%);
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 16px;
    padding: 14px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.08);
  }
  .profile-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 60px; height: 60px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.15;
  }
  .profile-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px;
  }
  .profile-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 800;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.35);
    position: relative;
  }
  .profile-avatar::after {
    content: '';
    position: absolute;
    bottom: -2px; right: -2px;
    width: 12px; height: 12px;
    background: var(--success);
    border: 2px solid var(--white);
    border-radius: 50%;
  }
  .profile-name {
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
    line-height: 1.2;
  }
  .profile-role {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; color: var(--text-light);
    display: flex; align-items: center; gap: 3px;
    font-weight: 600; margin-top: 2px;
  }
  .profile-role svg { width: 10px; height: 10px; color: var(--primary); }

  .profile-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px; margin-bottom: 10px;
  }
  .profile-stat {
    background: rgba(var(--primary-rgb), 0.06);
    border-radius: 8px;
    padding: 8px 6px;
    text-align: center;
  }
  .profile-stat-val {
    font-family: 'Inter', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--primary);
    line-height: 1;
  }
  .profile-stat-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 8px; color: var(--text-light);
    text-transform: uppercase; letter-spacing: 0.08em;
    font-weight: 700; margin-top: 3px;
  }

  .profile-rating {
    display: flex; align-items: center; justify-content: center; gap: 3px;
    padding: 6px 0;
    margin-bottom: 8px;
    border-top: 1px dashed rgba(var(--primary-rgb), 0.15);
    border-bottom: 1px dashed rgba(var(--primary-rgb), 0.15);
  }

  .logout-btn {
    width: 100%;
    background: transparent;
    border: 1px solid rgba(239,83,80,0.25);
    border-radius: 10px; padding: 8px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    color: var(--danger);
    cursor: pointer; transition: all 0.2s ease;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .logout-btn:hover {
    background: rgba(239,83,80,0.08);
    border-color: rgba(239,83,80,0.4);
  }

  /* ═══════════════════ MAIN ═══════════════════ */
  .main {
    display: flex; flex-direction: column;
    height: 100vh; overflow: hidden; min-width: 0;
    background: transparent;
    position: relative;
    z-index: 1;
  }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; flex-shrink: 0;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.12);
    padding: 14px 28px;
    z-index: 20; min-height: 68px;
    box-shadow: 0 2px 20px rgba(var(--primary-rgb), 0.04);
  }
  .topbar-left {
    display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;
  }
  .search {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px; padding: 10px 16px;
    flex: 1; max-width: 400px; min-width: 180px;
    color: var(--text-light);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.04);
  }
  .search:focus-within {
    border-color: var(--primary);
    background: var(--white);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.15);
  }
  .search input {
    border: none; background: transparent; outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    width: 100%; color: var(--text-dark);
  }
  .search input::placeholder { color: var(--text-muted); }

  .topbar-right {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }

  .icon-btn {
    width: 40px; height: 40px; border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    display: flex; align-items: center; justify-content: center;
    color: var(--primary-dark); cursor: pointer;
    position: relative;
    background: rgba(255,255,255,0.8);
    transition: all 0.2s ease; flex-shrink: 0;
  }
  .icon-btn:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-color: transparent;
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.3);
  }
  .dot {
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px;
    border-radius: 50%; background: var(--danger);
    border: 2px solid var(--white);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }

  .refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: rgba(255,255,255,0.8);
    color: var(--primary-dark);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
  }
  .refresh-btn:hover {
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    border-color: var(--primary);
  }
  .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .add-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    position: relative;
    overflow: hidden;
  }
  .add-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--primary-bright), var(--primary));
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .add-btn > * { position: relative; z-index: 1; }
  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.45);
  }
  .add-btn:hover::before { opacity: 1; }
  .add-btn:active { transform: translateY(0); }

  .main-scroll {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 24px 28px 48px;
    position: relative;
  }

  .greeting-hero {
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 60%, var(--primary-mist) 100%);
    border-radius: 24px;
    padding: 28px 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.08);
  }
  .greeting-hero::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 200px; height: 200px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.1;
  }
  .greeting-hero::after {
    content: '';
    position: absolute;
    bottom: -50px; right: 100px;
    width: 150px; height: 150px;
    background: linear-gradient(135deg, var(--primary-mist), var(--primary-light));
    border-radius: 50%;
    opacity: 0.2;
    filter: blur(30px);
  }
  .greeting-inner {
    display: flex; align-items: center; gap: 20px;
    position: relative; z-index: 1;
  }
  .greeting-diamond {
    width: 64px; height: 64px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    position: relative;
  }
  .greeting-diamond::before {
    content: '';
    position: absolute;
    width: 52px; height: 52px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    transform: rotate(45deg);
    border-radius: 10px;
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.4);
  }
  .greeting-diamond::after {
    content: '';
    position: absolute;
    width: 24px; height: 24px;
    background: var(--white);
    transform: rotate(45deg);
    border-radius: 4px;
  }
  .greeting-text h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 800; font-size: 28px;
    color: var(--text-dark);
    margin: 0 0 4px;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .greeting-text p {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-med);
    font-weight: 500;
    display: flex; align-items: center; gap: 6px;
  }

  .kpi-row {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 16px; margin-bottom: 24px;
  }
  .kpi-card {
    background: linear-gradient(135deg, var(--white) 0%, var(--off-white) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 20px;
    padding: 22px;
    position: relative; overflow: hidden;
    cursor: default;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    background: linear-gradient(135deg, var(--kpi-color, var(--primary)), transparent);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.12;
  }
  .kpi-card::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -20px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, var(--kpi-color, var(--primary)), transparent 70%);
    opacity: 0.08;
    pointer-events: none;
  }
  .kpi-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(var(--primary-rgb), 0.15);
    border-color: var(--kpi-color, var(--primary));
  }
  .kpi-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
    background: linear-gradient(135deg, var(--kpi-color, var(--primary)), var(--kpi-color-dark, var(--primary-dark)));
    color: var(--white);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
    position: relative;
    z-index: 1;
  }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text-light); margin-bottom: 6px;
  }
  .kpi-value {
    font-family: 'Inter', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 4px;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .kpi-delta {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500;
    color: var(--text-light);
    display: flex; align-items: center; gap: 4px;
  }

  .panel {
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 24px;
    padding: 24px;
    display: flex; flex-direction: column;
    min-height: 0; flex: 1;
    box-shadow: 0 8px 32px rgba(var(--primary-rgb), 0.06);
  }
  .panel-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; flex-shrink: 0;
    flex-wrap: wrap; gap: 12px;
  }
  .panel-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px; font-weight: 800;
    color: var(--text-dark);
    letter-spacing: -0.01em;
  }
  .panel-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-light);
    margin-top: 3px; font-weight: 500;
  }
  .panel-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--primary);
    display: flex; align-items: center; gap: 4px; cursor: pointer;
    transition: all 0.2s ease;
    padding: 8px 14px; border-radius: 10px;
    background: rgba(var(--primary-rgb), 0.08);
  }
  .panel-link:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .panel-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  /* ═══════════════════ KANBAN ═══════════════════ */
  .kanban-board {
    display: flex; gap: 16px;
    overflow-x: auto; overflow-y: hidden;
    flex: 1; min-height: 0;
    padding-bottom: 8px;
    align-items: flex-start;
  }

  .kanban-column {
    min-width: 320px; width: 320px; flex-shrink: 0;
    display: flex; flex-direction: column;
    max-height: 100%;
    background: rgba(255,255,255,0.5);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 20px;
    padding: 8px;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.04);
  }
  .kanban-col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; margin-bottom: 10px; flex-shrink: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--white), var(--primary-sky));
    position: relative;
    overflow: hidden;
  }
  .kanban-col-header::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--col-color);
    border-radius: 4px;
  }
  .kanban-col-title {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--text-dark);
  }
  .kanban-stage-icon {
    width: 26px; height: 26px;
    border-radius: 8px;
    background: var(--col-color);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(0,0,0,0.1);
  }
  .kanban-stage-icon svg { width: 13px; height: 13px; color: var(--white); }

  .kanban-col-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700;
    padding: 3px 9px; border-radius: 8px;
    background: var(--col-color);
    color: var(--white);
  }
  .kanban-col-add {
    width: 30px; height: 30px; border-radius: 10px;
    border: 1px dashed rgba(var(--primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: rgba(var(--primary-rgb), 0.06);
    color: var(--primary-dark);
    transition: all 0.2s ease;
  }
  .kanban-col-add:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-color: transparent;
    color: var(--white);
    transform: rotate(90deg);
  }

  .kanban-cards {
    display: flex; flex-direction: column; gap: 12px;
    min-height: 60px; flex: 1;
    overflow-y: auto; padding: 0 4px 6px;
  }

  /* Lead Card */
  .lead-card {
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .lead-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 40px rgba(var(--primary-rgb), 0.2);
    border-color: rgba(var(--primary-rgb), 0.3);
  }
  .lead-card-header {
    position: relative;
    padding: 18px 18px 14px;
    background: linear-gradient(135deg, var(--white) 0%, var(--primary-sky) 100%);
    overflow: hidden;
  }
  .lead-card-header::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 100px; height: 60px;
    background: linear-gradient(135deg, var(--card-color-light), var(--card-color));
    clip-path: polygon(100% 0, 30% 0, 100% 100%);
    opacity: 0.25;
  }
  .lead-card-header::after {
    content: '';
    position: absolute;
    bottom: -20px; left: -10px;
    width: 60px; height: 60px;
    background: linear-gradient(135deg, var(--card-color-light), var(--card-color));
    border-radius: 50%;
    opacity: 0.15;
    filter: blur(15px);
  }

  .lead-card-footer {
    background: linear-gradient(135deg, var(--primary-sky) 0%, var(--primary-cloud) 100%);
    padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative;
    overflow: hidden;
    margin-top: 8px;
  }

  .lead-card-avatar-wrap {
    display: flex; align-items: center; justify-content: center;
    padding: 8px 0 14px;
    position: relative; z-index: 1;
  }
  .lead-card-diamond {
    width: 60px; height: 60px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .lead-card-diamond::before {
    content: '';
    position: absolute;
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--card-color), var(--card-color-dark));
    transform: rotate(45deg);
    border-radius: 8px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  }
  .lead-card-initials {
    position: relative; z-index: 2;
    color: var(--white);
    font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 800;
    letter-spacing: 0.02em;
  }
  .lead-card-name-block {
    text-align: center;
    padding: 0 8px;
    position: relative; z-index: 1;
  }
  .lead-card-company {
    font-family: 'Inter', sans-serif;
    font-size: 16px; font-weight: 800;
    color: var(--text-dark);
    line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
  .lead-card-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .lead-card-divider-fancy {
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
    padding: 12px 20px 4px;
  }
  .lead-card-divider-fancy::before,
  .lead-card-divider-fancy::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.25), transparent);
  }
  .lead-card-divider-dot {
    width: 6px; height: 6px;
    background: var(--primary);
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
  }
  .lead-card-info {
    padding: 12px 18px 14px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .lead-info-row {
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-med);
    font-weight: 500;
  }
  .lead-info-icon {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
    color: var(--primary-dark);
    flex-shrink: 0;
  }
  .lead-info-icon svg { width: 12px; height: 12px; }
  .lead-info-text {
    flex: 1; min-width: 0;
    color: var(--text-dark);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .lead-card-badges-row {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 18px 8px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    white-space: nowrap; flex-shrink: 0;
    letter-spacing: 0.02em;
  }
  .chip svg { width: 10px; height: 10px; }
  .chip.internal {
    background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
    color: #2E7D32;
    border: 1px solid rgba(46,125,50,0.2);
  }
  .chip.external {
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    color: var(--primary-dark);
    border: 1px solid rgba(var(--primary-rgb), 0.2);
  }
  .lead-tag {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 600;
    padding: 4px 10px; border-radius: 8px;
    white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .lead-tag svg { width: 9px; height: 9px; }
  .lead-tag.followup {
    background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
    color: #E65100;
    border: 1px solid rgba(230,81,0,0.2);
  }
  .lead-tag.overdue {
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    color: #C62828;
    border: 1px solid rgba(198,40,40,0.2);
  }
  .lead-card-intent {
    margin: 8px 14px;
    padding: 12px 14px;
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.2s ease;
  }
  .lead-card-intent-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.25);
  }
  .lead-card-intent-icon svg { width: 13px; height: 13px; color: var(--white); }
  .lead-card-intent-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
    flex: 1; min-width: 0;
    display: -webkit-box; -webkit-line-clamp: 1;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .lead-card-notes {
    margin: 4px 14px 8px;
    padding: 10px 14px;
    background: rgba(var(--primary-rgb), 0.04);
    border-left: 3px solid var(--primary);
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: var(--text-med);
    line-height: 1.5;
    font-style: italic;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }

  .lead-card-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: var(--text-light);
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.9);
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: 600;
    position: relative; z-index: 1;
  }
  .lead-card-time svg { width: 10px; height: 10px; }
  .lead-card-actions {
    display: flex; gap: 6px;
    position: relative; z-index: 1;
  }
  .lead-action-btn {
    width: 32px; height: 32px; border-radius: 10px;
    border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: var(--white);
    color: var(--primary);
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.15);
  }
  .lead-action-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }
  .lead-action-btn.call {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: var(--white);
  }
  .lead-action-btn.email {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .lead-action-btn.whatsapp {
    background: linear-gradient(135deg, var(--stage-contact), #00897B);
    color: var(--white);
  }
  .lead-card-id {
    position: absolute;
    top: 10px; right: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; font-weight: 700;
    color: var(--text-light);
    background: rgba(255,255,255,0.9);
    padding: 3px 8px;
    border-radius: 6px;
    z-index: 3;
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    display: flex; align-items: center; gap: 3px;
  }
  .lead-card-id svg { width: 8px; height: 8px; }

  .kanban-empty {
    padding: 40px 16px; text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    color: var(--text-light);
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
    border-radius: 16px;
    background: rgba(255,255,255,0.4);
  }
  .kanban-empty-icon {
    display: inline-flex;
    width: 48px; height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    align-items: center; justify-content: center;
    margin-bottom: 10px;
    opacity: 0.6;
  }
  .kanban-empty-icon svg { width: 22px; height: 22px; color: var(--primary-dark); }
  .kanban-empty-sub {
    font-size: 11px; color: var(--text-muted); margin-top: 6px;
    font-weight: 400;
  }

  /* ═══════════════════ INTENTS GRID ═══════════════════ */
  .intents-toolbar {
    display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .intents-filter-btn {
    padding: 8px 16px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    color: var(--text-med);
  }
  .intents-filter-btn:hover {
    border-color: var(--primary);
    color: var(--primary-dark);
  }
  .intents-filter-btn.active {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  }

  .intents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding-bottom: 8px;
  }

  .intent-card {
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    border-radius: 18px;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.06);
  }
  .intent-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(var(--primary-rgb), 0.2);
    border-color: rgba(var(--primary-rgb), 0.3);
  }

  .intent-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    opacity: 0.3;
    z-index: 0;
  }

  .intent-header {
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 14px;
    padding: 18px 18px 0;
    position: relative;
    z-index: 1;
  }
  .intent-type-icon {
    width: 40px; height: 40px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .intent-type-icon svg { width: 18px; height: 18px; color: var(--white); }
  .intent-type-icon.buy {
    background: linear-gradient(135deg, #64B5F6, #1976D2);
    box-shadow: 0 4px 12px rgba(25,118,210,0.3);
  }
  .intent-type-icon.sell {
    background: linear-gradient(135deg, #FFB74D, #F57C00);
    box-shadow: 0 4px 12px rgba(245,124,0,0.3);
  }
  .intent-header-text {
    flex: 1; min-width: 0;
  }
  .intent-title {
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 700;
    color: var(--text-dark);
    line-height: 1.3;
    margin-bottom: 3px;
    display: -webkit-box; -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; overflow: hidden;
  }
  .intent-category {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 600;
    color: var(--text-light);
  }

  .intent-badges {
    display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;
    padding: 0 18px;
    position: relative;
    z-index: 1;
  }
  .intent-badge {
    padding: 3px 10px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.03em;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .intent-badge.type-buy {
    background: rgba(25,118,210,0.1);
    color: #1976D2;
  }
  .intent-badge.type-sell {
    background: rgba(245,124,0,0.1);
    color: #F57C00;
  }

  .intent-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; margin-bottom: 14px;
    padding: 0 18px;
    position: relative;
    z-index: 1;
  }
  .intent-detail-box {
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border-radius: 10px;
    padding: 10px 12px;
  }
  .intent-detail-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px; font-weight: 700;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .intent-detail-value {
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--text-dark);
  }
  .intent-detail-value.highlight {
    color: var(--success-dark);
  }

  .intent-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px 18px;
    border-top: 1px solid rgba(var(--primary-rgb), 0.08);
    position: relative;
    z-index: 1;
  }
  .intent-creator {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    color: var(--text-light);
  }
  .intent-view-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; gap: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.25);
  }
  .intent-view-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.35);
  }

  .intent-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 12px; margin-top: 20px;
  }
  .pagination-btn {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(var(--primary-rgb), 0.2);
    background: var(--white);
    color: var(--primary-dark);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .pagination-btn:hover:not(:disabled) {
    background: var(--primary);
    color: var(--white);
    border-color: transparent;
  }
  .pagination-btn:disabled {
    opacity: 0.4; cursor: not-allowed;
  }
  .pagination-info {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--text-dark);
  }

  /* ═══════════════════ EMPTY STATE ═══════════════════ */
  .empty-state {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; gap: 16px;
    background: var(--white);
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
    border-radius: 20px;
  }
  .empty-state-icon-box {
    width: 72px; height: 72px;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
  }
  .empty-state-icon-box svg { width: 32px; height: 32px; color: var(--primary-dark); }
  .empty-state-title {
    font-family: 'Inter', sans-serif;
    font-size: 15px; font-weight: 700;
    color: var(--text-dark);
  }
  .empty-state-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: var(--text-light);
    text-align: center;
  }

  /* ═══════════════════ LOADING / ERROR ═══════════════════ */
  .bp-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 20px; gap: 16px;
  }
  .bp-loading-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--primary-dark);
  }
  .bp-error {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 20px; gap: 12px; text-align: center;
  }
  .bp-error-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: var(--danger);
    max-width: 400px;
  }
  .retry-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
  }
  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
  }

  /* ═══════════════════ MODAL ═══════════════════ */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .modal-backdrop {
    position: absolute; inset: 0;
    background: rgba(26, 58, 26, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .modal-content {
    position: relative; z-index: 1;
    background: linear-gradient(160deg, var(--white), var(--primary-sky));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 24px;
    width: 100%; max-width: 540px; max-height: 88vh;
    overflow-y: auto;
    box-shadow: 0 32px 80px rgba(122, 171, 101, 0.25);
  }
  .modal-content::before {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 120px; height: 80px;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    clip-path: polygon(100% 0, 20% 0, 100% 100%);
    opacity: 0.15;
    border-radius: 24px 24px 0 0;
  }
  .modal-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 24px 24px 18px;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
    position: relative;
    z-index: 1;
  }
  .modal-header h2 {
    font-family: 'Inter', sans-serif;
    font-size: 18px; font-weight: 800;
    color: var(--text-dark); margin: 0;
    letter-spacing: -0.01em;
  }
  .modal-header p {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; color: var(--text-light);
    margin: 6px 0 0; font-weight: 500;
  }
  .modal-close {
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: var(--white);
    color: var(--text-light);
    transition: all 0.2s ease; flex-shrink: 0;
  }
  .modal-close:hover {
    background: var(--danger);
    border-color: var(--danger);
    color: var(--white);
  }
  .modal-body { padding: 18px 24px 24px; }
  .modal-section { margin-bottom: 20px; }
  .modal-section-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: var(--primary); margin-bottom: 10px;
  }
  .modal-field {
    display: flex; align-items: center; gap: 12px; padding: 8px 0;
  }
  .modal-field-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .modal-field-icon svg { width: 15px; height: 15px; color: var(--primary-dark); }
  .modal-field-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; color: var(--text-light);
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .modal-field-value {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text-dark); font-weight: 600;
    word-break: break-word;
  }
  .modal-notes {
    background: linear-gradient(135deg, var(--primary-sky), var(--primary-cloud));
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    border-radius: 12px; padding: 14px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-dark);
    line-height: 1.6; font-weight: 400;
  }
  .modal-actions {
    display: flex; gap: 8px; margin-top: 10px;
    padding-top: 14px;
    border-top: 1px solid rgba(var(--primary-rgb), 0.1);
  }
  .modal-action-link {
    flex: 1; display: flex; align-items: center;
    justify-content: center; gap: 6px;
    padding: 12px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700; font-size: 12px;
    text-decoration: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
  }
  .modal-action-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.35);
  }

  /* Add Lead type list */
  .lead-type-list { display: flex; flex-direction: column; gap: 10px; }
  .lead-type-option {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; border-radius: 16px;
    cursor: pointer; transition: all 0.25s ease;
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.05);
  }
  .lead-type-option:hover {
    background: linear-gradient(135deg, var(--white), var(--primary-sky));
    border-color: var(--primary);
    transform: translateX(4px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.15);
  }
  .lead-type-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lead-type-icon svg { width: 22px; height: 22px; color: var(--primary-dark); }
  .lead-type-info { flex: 1; min-width: 0; }
  .lead-type-title {
    font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 700;
    color: var(--text-dark);
  }
  .lead-type-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    margin-top: 2px;
  }
  .lead-type-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: var(--text-light);
    margin-top: 4px; line-height: 1.4; font-weight: 400;
  }
  .lead-type-arrow { color: var(--primary); flex-shrink: 0; }

  /* Form */
  .form-group { margin-bottom: 14px; }
  .form-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 700;
    color: var(--text-dark); margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .form-label-required::after { content: ' *'; color: var(--danger); }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--text-dark); border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    outline: none; transition: all 0.2s ease;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
  }
  .form-input::placeholder, .form-textarea::placeholder {
    color: var(--text-muted); font-weight: 400;
  }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; color: var(--text-light);
    margin-top: 4px;
  }
  .form-back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.08); border: none; cursor: pointer;
    padding: 8px 14px; border-radius: 10px;
    margin-bottom: 14px; transition: all 0.2s ease;
  }
  .form-back-btn:hover {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
  }
  .form-submit-btn {
    width: 100%; padding: 13px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    cursor: pointer; margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.25s ease;
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.35);
    letter-spacing: 0.02em;
  }
  .form-submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(var(--primary-rgb), 0.45);
  }
  .form-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-error {
    background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
    border: 1px solid rgba(239,83,80,0.25);
    color: #C62828;
    padding: 10px 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 6px;
  }

  /* Intent type toggle */
  .intent-type-toggle {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-bottom: 14px;
  }
  .intent-type-btn {
    padding: 12px; border-radius: 12px;
    border: 2px solid rgba(var(--primary-rgb), 0.15);
    background: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: all 0.2s ease;
    color: var(--text-med);
  }
  .intent-type-btn svg { width: 14px; height: 14px; }
  .intent-type-btn.active-buy {
    background: linear-gradient(135deg, #64B5F6, #1976D2);
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(25,118,210,0.3);
  }
  .intent-type-btn.active-sell {
    background: linear-gradient(135deg, #FFB74D, #F57C00);
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 12px rgba(245,124,0,0.3);
  }

  /* Toast */
  .bp-toast {
    position: fixed; top: 20px; right: 20px; z-index: 200;
    padding: 14px 20px; border-radius: 14px;
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    max-width: 400px;
  }
  .bp-toast-success {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: var(--white);
    box-shadow: 0 12px 40px rgba(67,160,71,0.35);
  }
  .bp-toast-error {
    background: linear-gradient(135deg, var(--danger), var(--danger-dark));
    color: var(--white);
    box-shadow: 0 12px 40px rgba(229,57,53,0.35);
  }

  .scroll-top-btn {
    position: fixed; bottom: 28px; right: 28px;
    width: 48px; height: 48px; border-radius: 14px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border: none;
    color: var(--white); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 24px rgba(var(--primary-rgb), 0.4); z-index: 50;
    transition: all 0.25s ease;
    opacity: 0; transform: translateY(10px); pointer-events: none;
  }
  .scroll-top-btn.visible {
    opacity: 1; transform: translateY(0); pointer-events: auto;
  }
  .scroll-top-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 32px rgba(var(--primary-rgb), 0.5);
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Coming soon placeholder */
  .coming-soon {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 20px; gap: 16px; text-align: center;
    background: rgba(255,255,255,0.5);
    border-radius: 20px;
    border: 2px dashed rgba(var(--primary-rgb), 0.15);
  }
  .coming-soon-icon {
    width: 80px; height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, var(--primary-cloud), var(--primary-mist));
    display: flex; align-items: center; justify-content: center;
  }
  .coming-soon-icon svg { width: 36px; height: 36px; color: var(--primary-dark); }
  .coming-soon-title {
    font-family: 'Inter', sans-serif;
    font-size: 20px; font-weight: 800;
    color: var(--text-dark);
  }
  .coming-soon-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-light);
    max-width: 300px;
  }

  @media (max-width: 900px) {
    .kpi-row { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 720px) {
    .bp-app { grid-template-columns: 1fr; height: auto; }
    .sidebar {
      flex-direction: row; overflow-x: auto; overflow-y: hidden;
      border-right: none; border-bottom: 1px solid rgba(var(--primary-rgb), 0.15);
      height: auto; padding: 10px 12px; gap: 6px;
    }
    .sidebar::before { display: none; }
    .nav { flex-direction: row; gap: 3px; }
    .nav-item { white-space: nowrap; padding: 8px 10px; }
    .sidebar-foot, .brand, .nav-label, .nav-divider, .nav-stage { display: none; }
    .main { height: auto; overflow: visible; }
    .main-scroll { overflow: visible; padding: 16px 14px 40px; }
    .topbar { padding: 10px 14px; }
    .kanban-column { min-width: 280px; width: 280px; }
    .form-row { grid-template-columns: 1fr; }
    .kpi-row { grid-template-columns: 1fr 1fr; }
    .greeting-hero { padding: 20px; }
    .greeting-inner { flex-direction: column; text-align: center; }
    .intents-grid { grid-template-columns: 1fr; }
  }
`;