import React, { useState } from "react";
import {
  LayoutGrid,
  Users,
  Handshake,
  Wallet,
  CalendarClock,
  Video,
  ShieldCheck,
  Search,
  Bell,
  ChevronRight,
  ArrowUpRight,
  Globe2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const kpis = [
  { label: "Total members", value: "1,284", delta: "+62 this month", icon: Users },
  { label: "Active deals", value: "97", delta: "+14 this month", icon: Handshake },
  { label: "Commission pending", value: "AED 184,200", delta: "38 entries", icon: Wallet },
  { label: "Event registrations", value: "412", delta: "3 events open", icon: CalendarClock },
];

const pipeline = [
  { stage: "Intent", count: 210 },
  { stage: "Connected", count: 168 },
  { stage: "Exploring", count: 121 },
  { stage: "Negotiating", count: 74 },
  { stage: "Agreed", count: 46 },
  { stage: "Closed Won", count: 31 },
  { stage: "On Hold", count: 12 },
];

const ledger = [
  { deal: "Textile Export — UAE/PK", partner: "Ahmed R.", value: "AED 240,000", pct: "6%", partnerShare: "AED 11,520", csShare: "AED 2,880", status: "Approved" },
  { deal: "Logistics Fleet Lease", partner: "Sara M.", value: "AED 98,000", pct: "5%", partnerShare: "AED 4,655", csShare: "AED 1,225", status: "Pending" },
  { deal: "F&B Franchise Rights", partner: "John K.", value: "AED 610,000", pct: "7%", partnerShare: "AED 34,160", csShare: "AED 8,540", status: "Paid" },
  { deal: "Construction Supply", partner: "Ahmed R.", value: "AED 152,000", pct: "6%", partnerShare: "AED 7,296", csShare: "AED 1,824", status: "Pending" },
];

const referralChain = [
  { name: "Abdulla", role: "Introducer · Level 1", share: "3%" },
  { name: "Ahmed", role: "Broker · Level 2", share: "2%" },
  { name: "John", role: "Closer · Level 3", share: "2%" },
];

const partners = [
  { name: "Ahmed R.", initials: "AR", deals: 14, earned: "AED 62,400", csi: 91 },
  { name: "John K.", initials: "JK", deals: 11, earned: "AED 58,900", csi: 88 },
  { name: "Sara M.", initials: "SM", deals: 9, earned: "AED 41,150", csi: 85 },
  { name: "Deepak V.", initials: "DV", deals: 7, earned: "AED 33,800", csi: 79 },
];

const upcoming = [
  { kind: "Member call", title: "Abdulla ↔ Faisal — sourcing intro", when: "Today · 4:30 PM" },
  { kind: "Operator meeting", title: "UAE Sector Group — monthly sync", when: "Tomorrow · 11:00 AM" },
  { kind: "Event", title: "Connect Souq Online Launch Event", when: "Fri · 6:00 PM · 236 registered" },
];

const nav = [
  { label: "Overview", icon: LayoutGrid, active: true },
  { label: "Members", icon: Users },
  { label: "Deal engine", icon: Handshake },
  { label: "Commission ledger", icon: Wallet },
  { label: "Meetings & events", icon: CalendarClock },
  { label: "Media hub", icon: Video },
  { label: "Governance", icon: ShieldCheck },
];

const statusTone = {
  Pending: "pending",
  Approved: "approved",
  Paid: "paid",
};

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Overview");

  return (
    <div className="cs-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..800&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

        :root{
          --sage:#A2CB8B;
          --sage-dark:#5F7D4C;
          --sage-deeper:#3E5631;
          --sage-tint:#EEF5E8;
          --sage-mid:#CFE3C1;
          --ink:#232B20;
          --muted:#75806E;
          --line:#E5EBDF;
          --amber:#B9812F;
          --amber-tint:#FBF1E1;
          --green-tint:#E9F5E4;
          --green-txt:#3E6B2E;
          --white:#FFFFFF;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }

        .cs-app{
          font-family:'Manrope', system-ui, sans-serif;
          color:var(--ink);
          background:var(--white);
          display:grid;
          grid-template-columns:248px 1fr;
          height:100vh;
          width:100%;
          overflow:hidden;
        }
        .cs-app *{ box-sizing:border-box; }

        /* ---------- Sidebar ---------- */
        .sidebar{
          background:var(--white);
          border-right:1px solid var(--line);
          padding:28px 18px;
          display:flex;
          flex-direction:column;
          gap:28px;
          height:100vh;
          overflow-y:auto;
          overflow-x:hidden;
          position:sticky;
          top:0;
        }

        /* Sidebar scrollbar */
        .sidebar::-webkit-scrollbar{ width:4px; }
        .sidebar::-webkit-scrollbar-track{ background:transparent; }
        .sidebar::-webkit-scrollbar-thumb{ background:var(--sage-mid); border-radius:4px; }
        .sidebar::-webkit-scrollbar-thumb:hover{ background:var(--sage); }

        .brand{
          display:flex;
          align-items:center;
          gap:10px;
          padding:0 6px;
          flex-shrink:0;
        }
        .brand-mark{
          width:34px;height:34px;border-radius:10px;
          background:var(--sage);
          display:flex;align-items:center;justify-content:center;
          color:var(--white);
          font-family:'Fraunces', serif;
          font-weight:700;
          font-size:16px;
        }
        .brand-text{
          font-family:'Fraunces', serif;
          font-weight:700;
          font-size:17px;
          line-height:1.1;
          color:var(--sage-deeper);
        }
        .brand-sub{
          font-size:10.5px;
          letter-spacing:.06em;
          text-transform:uppercase;
          color:var(--muted);
        }
        .nav{ display:flex; flex-direction:column; gap:3px; flex-shrink:0; }
        .nav-item{
          display:flex; align-items:center; gap:10px;
          padding:10px 12px;
          border-radius:10px;
          font-size:14px; font-weight:600;
          color:var(--muted);
          cursor:pointer;
          border-left:3px solid transparent;
          transition:background .15s ease, color .15s ease;
        }
        .nav-item:hover{ background:var(--sage-tint); color:var(--sage-deeper); }
        .nav-item.active{
          background:var(--sage-tint);
          color:var(--sage-deeper);
          border-left:3px solid var(--sage);
        }
        .nav-item svg{ width:17px; height:17px; flex-shrink:0; }

        .sidebar-foot{
          margin-top:auto;
          border-top:1px solid var(--line);
          padding-top:16px;
          display:flex; align-items:center; gap:10px;
          flex-shrink:0;
        }
        .foot-avatar{
          width:34px;height:34px;border-radius:50%;
          background:var(--sage-deeper); color:var(--white);
          display:flex;align-items:center;justify-content:center;
          font-size:12.5px;font-weight:700;
          flex-shrink:0;
        }
        .foot-name{ font-size:13px; font-weight:700; color:var(--ink); }
        .foot-role{ font-size:11px; color:var(--muted); }

        /* ---------- Main ---------- */
        .main{
          padding:28px 36px 48px;
          min-width:0;
          height:100vh;
          overflow-y:auto;
          overflow-x:hidden;
        }

        /* Main scrollbar */
        .main::-webkit-scrollbar{ width:6px; }
        .main::-webkit-scrollbar-track{ background:transparent; }
        .main::-webkit-scrollbar-thumb{
          background:var(--sage-mid);
          border-radius:6px;
        }
        .main::-webkit-scrollbar-thumb:hover{ background:var(--sage); }

        /* Firefox scrollbar */
        .main{
          scrollbar-width:thin;
          scrollbar-color:var(--sage-mid) transparent;
        }
        .sidebar{
          scrollbar-width:thin;
          scrollbar-color:var(--sage-mid) transparent;
        }

        .topbar{
          display:flex; align-items:center; justify-content:space-between;
          gap:18px; margin-bottom:26px;
          position:sticky;
          top:0;
          background:rgba(255,255,255,0.95);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
          z-index:20;
          padding:0 0 16px;
          margin-top:0;
          border-bottom:1px solid var(--line);
        }
        .search{
          display:flex; align-items:center; gap:8px;
          background:var(--sage-tint);
          border:1px solid var(--line);
          border-radius:10px;
          padding:9px 14px;
          width:340px;
          color:var(--muted);
          font-size:13px;
        }
        .search input{
          border:none; background:transparent; outline:none;
          font-family:'Manrope',sans-serif; font-size:13px; width:100%;
          color:var(--ink);
        }
        .topbar-right{ display:flex; align-items:center; gap:16px; }
        .icon-btn{
          width:36px;height:36px;border-radius:10px;
          border:1px solid var(--line);
          display:flex;align-items:center;justify-content:center;
          color:var(--sage-deeper); cursor:pointer; position:relative;
          background:var(--white);
        }
        .dot{
          position:absolute; top:7px; right:7px;
          width:6px;height:6px;border-radius:50%;
          background:var(--amber);
        }

        .greeting{ margin-bottom:24px; }
        .greeting h1{
          font-family:'Fraunces', serif;
          font-weight:600;
          font-size:28px;
          margin:0 0 4px;
          color:var(--ink);
        }
        .greeting p{ margin:0; color:var(--muted); font-size:14px; }

        /* ---------- KPI row ---------- */
        .kpi-row{
          display:grid;
          grid-template-columns:repeat(4, 1fr);
          gap:16px;
          margin-bottom:28px;
        }
        .kpi-card{
          background:var(--white);
          border:1px solid var(--line);
          border-radius:14px;
          padding:18px 18px 16px;
          position:relative;
          overflow:hidden;
        }
        .kpi-card::before{
          content:"";
          position:absolute; left:0; top:0; bottom:0; width:4px;
          background:var(--sage);
        }
        .kpi-icon{
          width:32px;height:32px;border-radius:9px;
          background:var(--sage-tint);
          color:var(--sage-dark);
          display:flex;align-items:center;justify-content:center;
          margin-bottom:12px;
        }
        .kpi-icon svg{ width:16px; height:16px; }
        .kpi-label{ font-size:12.5px; color:var(--muted); font-weight:600; margin-bottom:6px; }
        .kpi-value{
          font-family:'IBM Plex Mono', monospace;
          font-size:22px; font-weight:600; color:var(--ink);
          margin-bottom:4px;
        }
        .kpi-delta{ font-size:11.5px; color:var(--green-txt); font-weight:600; }

        /* ---------- Panels grid ---------- */
        .grid-2{
          display:grid;
          grid-template-columns:1.3fr 1fr;
          gap:18px;
          margin-bottom:18px;
        }
        .panel{
          background:var(--white);
          border:1px solid var(--line);
          border-radius:14px;
          padding:20px 22px;
        }
        .panel-head{
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:16px;
        }
        .panel-title{
          font-family:'Fraunces', serif;
          font-size:16px; font-weight:600; color:var(--ink);
        }
        .panel-link{
          font-size:12px; font-weight:700; color:var(--sage-dark);
          display:flex; align-items:center; gap:3px; cursor:pointer;
        }

        /* ---------- Referral chain ---------- */
        .chain{
          display:flex; align-items:center; justify-content:space-between;
          padding:8px 4px 4px;
          overflow-x:auto;
        }
        .chain::-webkit-scrollbar{ height:3px; }
        .chain::-webkit-scrollbar-thumb{ background:var(--sage-mid); border-radius:3px; }

        .chain-node{
          display:flex; flex-direction:column; align-items:center; gap:8px;
          min-width:100px; text-align:center; flex-shrink:0;
        }
        .chain-avatar{
          width:46px;height:46px;border-radius:50%;
          background:var(--sage-tint);
          border:2px solid var(--sage);
          color:var(--sage-deeper);
          display:flex;align-items:center;justify-content:center;
          font-family:'Fraunces',serif; font-weight:700; font-size:15px;
        }
        .chain-name{ font-size:12.5px; font-weight:700; color:var(--ink); }
        .chain-role{ font-size:10.5px; color:var(--muted); }
        .chain-link{
          flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;
          position:relative; top:-18px; min-width:60px;
        }
        .chain-link .line{
          width:100%; height:2px; background:var(--sage-mid); position:relative;
        }
        .chain-link .line::after{
          content:"";
          position:absolute; right:-1px; top:-3px;
          width:8px;height:8px; border-radius:50%; background:var(--sage);
        }
        .chain-share{
          font-family:'IBM Plex Mono', monospace;
          font-size:11px; font-weight:600; color:var(--sage-dark);
          background:var(--sage-tint);
          padding:2px 8px; border-radius:999px;
        }
        .chain-note{
          margin-top:14px; font-size:12px; color:var(--muted); line-height:1.5;
        }

        /* ---------- Table ---------- */
        .table-wrap{
          overflow-x:auto;
        }
        .table-wrap::-webkit-scrollbar{ height:4px; }
        .table-wrap::-webkit-scrollbar-thumb{ background:var(--sage-mid); border-radius:4px; }

        table{ width:100%; border-collapse:collapse; font-size:12.5px; min-width:420px; }
        thead th{
          text-align:left; font-size:11px; text-transform:uppercase;
          letter-spacing:.04em; color:var(--muted); font-weight:700;
          padding:0 8px 10px; border-bottom:1px solid var(--line);
          white-space:nowrap;
        }
        tbody td{
          padding:11px 8px; border-bottom:1px solid var(--line);
          color:var(--ink); vertical-align:middle;
        }
        tbody tr:last-child td{ border-bottom:none; }
        .mono{ font-family:'IBM Plex Mono', monospace; white-space:nowrap; }
        .chip{
          display:inline-block; padding:3px 10px; border-radius:999px;
          font-size:11px; font-weight:700; white-space:nowrap;
        }
        .chip.pending{ background:var(--amber-tint); color:var(--amber); }
        .chip.approved{ background:var(--sage-tint); color:var(--sage-dark); }
        .chip.paid{ background:var(--green-tint); color:var(--green-txt); }

        /* ---------- Upcoming ---------- */
        .upcoming-item{
          display:flex; align-items:flex-start; gap:12px;
          padding:12px 0; border-bottom:1px solid var(--line);
        }
        .upcoming-item:last-child{ border-bottom:none; }
        .upcoming-kind{
          font-size:10px; font-weight:700; text-transform:uppercase;
          letter-spacing:.04em; color:var(--sage-dark);
          background:var(--sage-tint); padding:3px 8px; border-radius:6px;
          flex-shrink:0; margin-top:2px; white-space:nowrap;
        }
        .upcoming-title{ font-size:13px; font-weight:700; color:var(--ink); margin-bottom:2px; }
        .upcoming-when{ font-size:11.5px; color:var(--muted); }

        /* ---------- Bottom grid ---------- */
        .grid-bottom{
          display:grid;
          grid-template-columns:1fr 1.2fr;
          gap:18px;
        }
        .partner-row{
          display:flex; align-items:center; gap:12px;
          padding:10px 0; border-bottom:1px solid var(--line);
        }
        .partner-row:last-child{ border-bottom:none; }
        .partner-avatar{
          width:34px;height:34px;border-radius:50%;
          background:var(--sage-deeper); color:var(--white);
          display:flex;align-items:center;justify-content:center;
          font-size:12px; font-weight:700; flex-shrink:0;
        }
        .partner-name{ font-size:13px; font-weight:700; color:var(--ink); }
        .partner-meta{ font-size:11.5px; color:var(--muted); }
        .partner-csi{
          margin-left:auto; text-align:right;
          font-family:'IBM Plex Mono', monospace;
          font-size:13px; font-weight:700; color:var(--sage-dark);
        }
        .partner-csi-label{ font-size:9.5px; color:var(--muted); font-weight:600; text-transform:uppercase; }

        .whitelabel-badge{
          display:flex; align-items:center; gap:8px;
          background:var(--sage-tint); border:1px solid var(--sage-mid);
          border-radius:10px; padding:10px 12px; margin-top:14px;
          font-size:12px; color:var(--sage-deeper); font-weight:600;
        }
        .whitelabel-badge svg{ width:15px; height:15px; flex-shrink:0; }

        /* ---------- Scroll-to-top ---------- */
        .scroll-top-btn{
          position:fixed;
          bottom:28px;
          right:28px;
          width:42px;
          height:42px;
          border-radius:12px;
          background:var(--sage-deeper);
          color:var(--white);
          border:none;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 4px 16px rgba(62,86,49,0.25);
          z-index:50;
          transition:all 0.2s ease;
          opacity:0;
          transform:translateY(10px);
          pointer-events:none;
        }
        .scroll-top-btn.visible{
          opacity:1;
          transform:translateY(0);
          pointer-events:auto;
        }
        .scroll-top-btn:hover{
          background:var(--sage);
          transform:translateY(-2px);
          box-shadow:0 6px 20px rgba(62,86,49,0.3);
        }

        @media (max-width: 1080px){
          .grid-2, .grid-bottom{ grid-template-columns:1fr; }
          .kpi-row{ grid-template-columns:repeat(2, 1fr); }
        }
        @media (max-width: 720px){
          .cs-app{ grid-template-columns:1fr; height:auto; }
          .sidebar{
            flex-direction:row;
            overflow-x:auto;
            overflow-y:hidden;
            border-right:none;
            border-bottom:1px solid var(--line);
            height:auto;
            position:sticky;
            top:0;
            z-index:30;
            background:rgba(255,255,255,0.97);
            backdrop-filter:blur(12px);
            padding:12px 14px;
          }
          .nav{ flex-direction:row; gap:4px; }
          .nav-item{ white-space:nowrap; padding:8px 10px; font-size:13px; border-left:none; border-bottom:2px solid transparent; }
          .nav-item.active{ border-left:none; border-bottom:2px solid var(--sage); }
          .sidebar-foot{ display:none; }
          .brand{ display:none; }
          .main{ height:auto; overflow:visible; padding:20px 16px 40px; }
          .topbar{ position:relative; backdrop-filter:none; background:var(--white); border-bottom:none; padding-bottom:12px; }
          .kpi-row{ grid-template-columns:1fr 1fr; }
          .search{ width:100%; min-width:0; }
          .greeting h1{ font-size:22px; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CS</div>
          <div>
            <div className="brand-text">Connect&nbsp;Souq</div>
            <div className="brand-sub">Leadership dashboard</div>
          </div>
        </div>

        <nav className="nav">
          {nav.map((item) => (
            <div
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <item.icon />
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="foot-avatar">AB</div>
          <div>
            <div className="foot-name">Abdulla</div>
            <div className="foot-role">Leadership</div>
          </div>
        </div>
      </aside>

      {/* ── Main (scrollable) ── */}
      <main
        className="main"
        id="main-scroll"
        onScroll={(e) => {
          const btn = document.getElementById("scroll-top-btn");
          if (btn) {
            if (e.target.scrollTop > 300) {
              btn.classList.add("visible");
            } else {
              btn.classList.remove("visible");
            }
          }
        }}
      >
        {/* Sticky Topbar */}
        <div className="topbar">
          <div className="search">
            <Search size={15} />
            <input placeholder="Search members, deals, partners…" />
          </div>
          <div className="topbar-right">
            <div className="icon-btn">
              <Bell size={16} />
              <span className="dot" />
            </div>
            <div className="foot-avatar" style={{ width: 36, height: 36 }}>AB</div>
          </div>
        </div>

        <div className="greeting">
          <h1>Welcome back, Abdulla</h1>
          <p>Here's how the network is moving today — Tuesday, 30 June.</p>
        </div>

        <div className="kpi-row">
          {kpis.map((k) => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-icon"><k.icon /></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-delta">{k.delta}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Deal pipeline</div>
              <div className="panel-link">Open deal engine <ChevronRight size={13} /></div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipeline} margin={{ left: -18, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#E5EBDF" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#75806E" }} axisLine={{ stroke: "#E5EBDF" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#75806E" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E5EBDF", fontSize: 12 }} cursor={{ fill: "#EEF5E8" }} />
                <Bar dataKey="count" fill="#A2CB8B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Meetings &amp; events</div>
              <div className="panel-link">View calendar <ChevronRight size={13} /></div>
            </div>
            {upcoming.map((u) => (
              <div className="upcoming-item" key={u.title}>
                <span className="upcoming-kind">{u.kind}</span>
                <div>
                  <div className="upcoming-title">{u.title}</div>
                  <div className="upcoming-when">{u.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral chain */}
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-head">
            <div className="panel-title">Referral chain — Textile Export deal</div>
            <div className="panel-link">All referral chains <ChevronRight size={13} /></div>
          </div>
          <div className="chain">
            {referralChain.map((p, i) => (
              <React.Fragment key={p.name}>
                <div className="chain-node">
                  <div className="chain-avatar">{p.name.slice(0, 2).toUpperCase()}</div>
                  <div className="chain-name">{p.name}</div>
                  <div className="chain-role">{p.role}</div>
                </div>
                {i < referralChain.length - 1 && (
                  <div className="chain-link">
                    <span className="chain-share">{p.share}</span>
                    <div className="line" />
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="chain-node">
              <div className="chain-avatar" style={{ background: "#3E5631", color: "#fff", borderColor: "#3E5631" }}>
                <Handshake size={18} />
              </div>
              <div className="chain-name">Deal closed</div>
              <div className="chain-role">AED 240,000</div>
            </div>
          </div>
          <div className="chain-note">
            Each introducer's share is locked at handshake and feeds the commission ledger automatically —
            no manual splitting once the deal closes.
          </div>
        </div>

        <div className="grid-bottom">
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Commission ledger</div>
              <div className="panel-link">Full ledger <ChevronRight size={13} /></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Partner share</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.deal}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{row.deal}</div>
                        <div style={{ color: "var(--muted)", fontSize: 11 }}>{row.partner} · {row.value} · {row.pct}</div>
                      </td>
                      <td className="mono">{row.partnerShare}</td>
                      <td>
                        <span className={`chip ${statusTone[row.status]}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Business partner leaderboard</div>
              <div className="panel-link">CSI rankings <ChevronRight size={13} /></div>
            </div>
            {partners.map((p) => (
              <div className="partner-row" key={p.name}>
                <div className="partner-avatar">{p.initials}</div>
                <div>
                  <div className="partner-name">{p.name}</div>
                  <div className="partner-meta">{p.deals} deals closed · {p.earned}</div>
                </div>
                <div className="partner-csi">
                  {p.csi}
                  <div className="partner-csi-label">CSI</div>
                </div>
              </div>
            ))}
            <div className="whitelabel-badge">
              <Globe2 />
              White-label-ready · Connect Souq is the first tenant on this architecture
            </div>
          </div>
        </div>
      </main>

      {/* ── Scroll to Top Button ── */}
      <button
        id="scroll-top-btn"
        className="scroll-top-btn"
        onClick={() => {
          document.getElementById("main-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}