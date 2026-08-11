// components/globalAdmin/tabs/TrustLeaderboardTab.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTrustLeaderboard, fetchTrustProfileDetail } from '../../../api/adminApi';

// ── Level Badge Colors ─────────────────────────────────────────
const LEVEL_STYLES = {
  CONNECTOR: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', icon: '🌱' },
  BUILDER:   { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', icon: '🔨' },
  INFLUENCER:{ bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF', icon: '⭐' },
  MAESTRO:   { bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5', icon: '🔥' },
  LEGEND:    { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: '👑' },
};

function getLevelStyle(level) {
  const normalized = String(level || 'CONNECTOR').toUpperCase();
  return LEVEL_STYLES[normalized] || { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB', icon: '🎖️' };
}

// ── Trust Profile Detail Modal (Global Admin Only) ─────────────
function TrustProfileDetailModal({ userId, userName, onClose }) {
  const [profileDetail, setProfileDetail] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [detailPage, setDetailPage]       = useState(0);
  const pageSize                          = 10;

  const loadDetail = useCallback(async (pg = detailPage) => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchTrustProfileDetail(userId, pg, pageSize);
      if (res?.profileDetail) {
        setProfileDetail(res.profileDetail);
      } else {
        setError('Trust profile details not found for this user.');
      }
    } catch (err) {
      console.error('Failed to load trust profile detail:', err);
      setError(err.message || 'Failed to fetch trust profile details.');
    } finally {
      setLoading(false);
    }
  }, [userId, detailPage]);

  useEffect(() => {
    loadDetail(detailPage);
  }, [userId, detailPage, loadDetail]);

  const summary = profileDetail?.summary || {};
  const entriesData = profileDetail?.entries || {};
  const entriesList = entriesData?.content || [];
  const totalEntriesRecords = entriesData?.totalElements || entriesList.length;
  const totalEntriesPages = entriesData?.totalPages || Math.ceil(totalEntriesRecords / pageSize) || 1;
  const levelStyle = getLevelStyle(summary.currentLevel);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justify: 'center', padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 850,
            maxHeight: '90vh', overflowY: 'auto', border: '1px solid #E2E8F0',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
            background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)', color: '#fff',
            display: 'flex', alignItems: 'center', justify: 'space-between',
            borderTopLeftRadius: 24, borderTopRightRadius: 24, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justify: 'center',
                fontWeight: 900, fontSize: 20, border: '2px solid rgba(255,255,255,0.3)',
              }}>
                {(profileDetail?.fullName || userName || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#fff' }}>
                    {profileDetail?.fullName || userName || 'User Profile'}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.25)',
                    padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase',
                  }}>
                    ID: #{userId}
                  </span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🛡️ Global Admin Trust Audit View</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.15)',
                border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justify: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content Body */}
          <div style={{ padding: 24, flex: 1 }}>
            {loading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⌛</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Loading Trust Profile & Details...</div>
              </div>
            ) : error ? (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16,
                padding: '20px', color: '#991B1B', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{error}</div>
                <button
                  onClick={() => loadDetail(detailPage)}
                  style={{
                    marginTop: 12, padding: '6px 16px', background: '#DC2626',
                    color: '#fff', border: 'none', borderRadius: 8, fontSize: 12,
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                {/* ── Summary & Scores Cards ── */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: 12, marginBottom: 24,
                }}>
                  {/* Total Score */}
                  <div style={{
                    background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16,
                    padding: '16px', display: 'flex', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      Total Score
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#15803D', marginTop: 4 }}>
                      {summary.totalScore ?? 0} Pts
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                      fontSize: 11, fontWeight: 800, color: levelStyle.color,
                      background: levelStyle.bg, border: `1px solid ${levelStyle.border}`,
                      padding: '2px 8px', borderRadius: 12, width: 'fit-content',
                    }}>
                      {levelStyle.icon} {summary.currentLevel || 'CONNECTOR'}
                    </span>
                  </div>

                  {/* Percentile Rank */}
                  <div style={{
                    background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: 16,
                    padding: '16px', display: 'flex', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#854D0E', textTransform: 'uppercase' }}>
                      Percentile Rank
                    </span>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#CA8A04', marginTop: 4 }}>
                      {summary.percentileRank !== undefined ? `${Number(summary.percentileRank).toFixed(1)}%` : 'N/A'}
                    </span>
                    <span style={{ fontSize: 11, color: '#A16207', fontWeight: 600, marginTop: 6 }}>
                      ⭐ Top percentile tier
                    </span>
                  </div>

                  {/* Growth Impact */}
                  <div style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16,
                    padding: '16px', display: 'flex', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      📈 Growth Impact
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                      {summary.growthImpactScore ?? 0} Pts
                    </span>
                  </div>

                  {/* Business Impact */}
                  <div style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16,
                    padding: '16px', display: 'flex', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      💼 Business Impact
                    </span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                      {summary.businessImpactScore ?? 0} Pts
                    </span>
                  </div>

                  {/* Community & Leadership Impact */}
                  <div style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16,
                    padding: '16px', display: 'flex', flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      👥 Community & Leadership
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                      Comm: {summary.communityImpactScore ?? 0} | Lead: {summary.leadershipImpactScore ?? 0}
                    </span>
                  </div>
                </div>

                {/* ── Trust History Entries Table ── */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#1E293B', marginBottom: 12 }}>
                    📜 Trust Score Audit History ({totalEntriesRecords} entries)
                  </h4>

                  {entriesList.length === 0 ? (
                    <div style={{
                      padding: '30px 16px', background: '#F8FAFC', borderRadius: 12,
                      textAlign: 'center', border: '1px dashed #CBD5E1', color: '#64748B',
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📜</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>No trust history entries found for this user.</div>
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{
                            background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
                            fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase',
                          }}>
                            <th style={{ padding: '10px 14px' }}>Rule / Activity Name</th>
                            <th style={{ padding: '10px 14px' }}>Dimension</th>
                            <th style={{ padding: '10px 14px' }}>Points</th>
                            <th style={{ padding: '10px 14px' }}>Status</th>
                            <th style={{ padding: '10px 14px' }}>Entity</th>
                            <th style={{ padding: '10px 14px' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entriesList.map((entry) => (
                            <tr key={entry.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: 12 }}>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1E293B' }}>
                                {entry.scoringRuleName || 'General Rule'}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                  background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                                }}>
                                  {entry.dimension || 'GROWTH_IMPACT'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#16A34A' }}>
                                +{entry.points} pts
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                  background: entry.status === 'APPROVED' ? '#DCFCE7' : '#FEF3C7',
                                  color: entry.status === 'APPROVED' ? '#166534' : '#92400E',
                                }}>
                                  {entry.status || 'APPROVED'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B', fontSize: 11 }}>
                                {entry.relatedEntityType || 'USER'} #{entry.relatedEntityId || entry.id}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748B', fontSize: 11 }}>
                                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Entries Pagination */}
                      {totalEntriesPages > 1 && (
                        <div style={{
                          padding: '10px 14px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                            Page {detailPage + 1} of {totalEntriesPages}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              disabled={detailPage === 0}
                              onClick={() => setDetailPage(p => Math.max(0, p - 1))}
                              style={{
                                padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E1',
                                background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              Prev
                            </button>
                            <button
                              disabled={detailPage >= totalEntriesPages - 1}
                              onClick={() => setDetailPage(p => Math.min(totalEntriesPages - 1, p + 1))}
                              style={{
                                padding: '4px 10px', borderRadius: 6, border: '1px solid #CBD5E1',
                                background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC',
            display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24, flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px', borderRadius: 10, border: '1px solid #CBD5E1',
                background: '#fff', color: '#334155', fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Close Detail View
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Leaderboard Component ─────────────────────────────────
export default function TrustLeaderboardTab({ isAdmin = true }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [page, setPage]               = useState(0);
  const [pageSize, setPageSize]       = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);

  const loadLeaderboard = useCallback(async (pg = page, size = pageSize) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchTrustLeaderboard(pg, size);
      if (res?.leaderboard) {
        setData(res.leaderboard);
      } else if (Array.isArray(res?.content)) {
        setData(res);
      } else {
        setData({ content: [], page: 0, size, totalElements: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load trust leaderboard:', err);
      setError(err.message || 'Failed to fetch leaderboard data.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadLeaderboard(page, pageSize);
  }, [page, pageSize, loadLeaderboard]);

  const rawList = data?.content || [];

  // ── Filtered list by Search and Level ──
  const filteredList = rawList.filter((item) => {
    const nameMatch = (item.fullName || 'Unknown').toLowerCase().includes(searchQuery.toLowerCase());
    const franchiseMatch = (item.franchiseName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || franchiseMatch;

    const matchesLevel = levelFilter === 'ALL' || String(item.currentLevel || '').toUpperCase() === levelFilter.toUpperCase();

    return matchesSearch && matchesLevel;
  });

  const totalRecords = data?.totalElements || rawList.length;
  const totalPages = data?.totalPages || Math.ceil(totalRecords / pageSize) || 1;

  // Max score on page for relative progress bar calculation
  const maxScore = Math.max(...rawList.map(i => i.totalScore || 0), 1);

  // Top 3 Podium Candidates
  const top1 = rawList[0];
  const top2 = rawList[1];
  const top3 = rawList[2];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 24, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A3A1A', margin: 0, letterSpacing: '-0.3px' }}>
              Trust - Leaderboards
            </h2>
            <span style={{
              background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
              borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
            }}>
              Top 100 Members
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6B8F71', margin: '4px 0 0', fontWeight: 500 }}>
            Real-time rankings of members based on highest accumulated trust scores and reputation.
          </p>
        </div>

        <button
          onClick={() => loadLeaderboard(page, pageSize)}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 12, border: '1px solid #E8F0E0',
            background: '#fff', color: '#16A34A', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{
            display: 'inline-block',
            transform: loading ? 'rotate(360deg)' : 'none',
            transition: 'transform 0.8s linear',
          }}>🔄</span>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16,
          padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center',
          justify: 'space-between', gap: 12, color: '#991B1B',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{error}</span>
          </div>
          <button
            onClick={() => loadLeaderboard(page, pageSize)}
            style={{
              padding: '6px 14px', background: '#DC2626', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)',
            borderRadius: 16, padding: '18px 20px', color: '#fff',
            boxShadow: '0 4px 16px rgba(22,101,52,0.2)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            👑 Top Rank (#1)
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {top1?.fullName || '—'}
          </div>
          <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🏢 {top1?.franchiseName || 'Independent Member'}</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
              {top1?.totalScore ?? 0} pts
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            background: '#fff', borderRadius: 16, padding: '18px 20px',
            border: '1px solid #E8F0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B8F71', textTransform: 'uppercase' }}>Highest Trust Score</span>
            <span style={{ fontSize: 20 }}>⭐</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1A3A1A', marginTop: 4 }}>
            {top1 ? `${top1.totalScore} Pts` : '—'}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>
            Peak network rating
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: '#fff', borderRadius: 16, padding: '18px 20px',
            border: '1px solid #E8F0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B8F71', textTransform: 'uppercase' }}>Ranked Members</span>
            <span style={{ fontSize: 20 }}>👥</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1A3A1A', marginTop: 4 }}>
            {totalRecords}
          </div>
          <div style={{ fontSize: 11, color: '#6B8F71', fontWeight: 600, marginTop: 2 }}>
            Total entries evaluated
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: '#fff', borderRadius: 16, padding: '18px 20px',
            border: '1px solid #E8F0E0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B8F71', textTransform: 'uppercase' }}>Current Page</span>
            <span style={{ fontSize: 20 }}>📊</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1A3A1A', marginTop: 4 }}>
            {page + 1} / {totalPages}
          </div>
          <div style={{ fontSize: 11, color: '#6B8F71', fontWeight: 600, marginTop: 2 }}>
            Showing top {pageSize} entries per page
          </div>
        </motion.div>
      </div>

      {/* ── Top 3 Podium Section ── */}
      {page === 0 && rawList.length >= 2 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A3A1A', marginBottom: 14 }}>
            🏆 Podium Winners
          </h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16, alignItems: 'stretch',
          }}>
            {/* Rank 2 - Silver */}
            {top2 && (
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: 'linear-gradient(145deg, #FFFFFF, #F1F5F9)',
                  border: '2px solid #CBD5E1', borderRadius: 20, padding: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(148,163,184,0.15)', position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: -14, background: '#64748B', color: '#fff',
                  borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(100,116,139,0.3)',
                }}>
                  🥈 RANK #2
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#E2E8F0',
                  color: '#334155', fontWeight: 800, fontSize: 22, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 10,
                  border: '3px solid #CBD5E1',
                }}>
                  {(top2.fullName || 'U')[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>{top2.fullName}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                  🏢 {top2.franchiseName || 'Direct Member'}
                </div>
                <div style={{
                  marginTop: 12, background: '#E2E8F0', color: '#1E293B',
                  borderRadius: 12, padding: '6px 16px', fontWeight: 800, fontSize: 15,
                }}>
                  ⭐ {top2.totalScore} Pts
                </div>

                {/* Global Admin Details Button */}
                {isAdmin && (
                  <button
                    onClick={() => setSelectedUserForDetail(top2)}
                    style={{
                      marginTop: 12, padding: '6px 12px', borderRadius: 8,
                      border: '1px solid #16A34A', background: '#F0FDF4', color: '#15803D',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    📜 View Trust History & Details
                  </button>
                )}
              </motion.div>
            )}

            {/* Rank 1 - Gold */}
            {top1 && (
              <motion.div
                whileHover={{ y: -6 }}
                style={{
                  background: 'linear-gradient(145deg, #FEFCE8, #FEF08A)',
                  border: '2px solid #EAB308', borderRadius: 22, padding: '24px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  boxShadow: '0 12px 32px rgba(234,179,8,0.25)', position: 'relative',
                  transform: 'scale(1.02)',
                }}
              >
                <div style={{
                  position: 'absolute', top: -16, background: 'linear-gradient(135deg, #EAB308, #CA8A04)',
                  color: '#fff', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(234,179,8,0.4)', letterSpacing: '0.5px',
                }}>
                  👑 RANK #1 CHAMPION
                </div>
                <div style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDE047, #EAB308)',
                  color: '#713F12', fontWeight: 900, fontSize: 28, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 12,
                  border: '4px solid #FEF9C3', boxShadow: '0 0 20px rgba(234,179,8,0.5)',
                }}>
                  {(top1.fullName || 'U')[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#713F12' }}>{top1.fullName}</div>
                <div style={{ fontSize: 12, color: '#854D0E', fontWeight: 700, marginTop: 2 }}>
                  🏢 {top1.franchiseName || 'Direct Member'}
                </div>
                <div style={{
                  marginTop: 14, background: '#CA8A04', color: '#fff',
                  borderRadius: 14, padding: '8px 20px', fontWeight: 900, fontSize: 17,
                  boxShadow: '0 4px 14px rgba(202,138,4,0.3)',
                }}>
                  ⭐ {top1.totalScore} Pts
                </div>

                {/* Global Admin Details Button */}
                {isAdmin && (
                  <button
                    onClick={() => setSelectedUserForDetail(top1)}
                    style={{
                      marginTop: 12, padding: '6px 14px', borderRadius: 8,
                      border: '1px solid #CA8A04', background: '#FEF08A', color: '#713F12',
                      fontSize: 11, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    📜 View Trust History & Details
                  </button>
                )}
              </motion.div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  background: 'linear-gradient(145deg, #FFF7ED, #FFEDD5)',
                  border: '2px solid #F97316', borderRadius: 20, padding: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.15)', position: 'relative',
                }}
              >
                <div style={{
                  position: 'absolute', top: -14, background: '#EA580C', color: '#fff',
                  borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(234,88,12,0.3)',
                }}>
                  🥉 RANK #3
                </div>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#FFEDD5',
                  color: '#9A3412', fontWeight: 800, fontSize: 22, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 10,
                  border: '3px solid #FED7AA',
                }}>
                  {(top3.fullName || 'U')[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#431407' }}>{top3.fullName}</div>
                <div style={{ fontSize: 12, color: '#9A3412', fontWeight: 600, marginTop: 2 }}>
                  🏢 {top3.franchiseName || 'Direct Member'}
                </div>
                <div style={{
                  marginTop: 12, background: '#EA580C', color: '#fff',
                  borderRadius: 12, padding: '6px 16px', fontWeight: 800, fontSize: 15,
                }}>
                  ⭐ {top3.totalScore} Pts
                </div>

                {/* Global Admin Details Button */}
                {isAdmin && (
                  <button
                    onClick={() => setSelectedUserForDetail(top3)}
                    style={{
                      marginTop: 12, padding: '6px 12px', borderRadius: 8,
                      border: '1px solid #EA580C', background: '#FFEDD5', color: '#9A3412',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    📜 View Trust History & Details
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '16px 20px',
        border: '1px solid #E8F0E0', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center',
        justify: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}>
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, color: '#94A3B8',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by member or franchise name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10,
              border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B',
              outline: 'none', background: '#F8FAFC',
            }}
          />
        </div>

        {/* Level Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Level:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: 10, border: '1px solid #CBD5E1',
              fontSize: 13, fontWeight: 700, color: '#1E293B', background: '#F8FAFC',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="ALL">All Levels</option>
            <option value="CONNECTOR">CONNECTOR</option>
            <option value="BUILDER">BUILDER</option>
            <option value="INFLUENCER">INFLUENCER</option>
            <option value="MAESTRO">MAESTRO</option>
            <option value="LEGEND">LEGEND</option>
          </select>
        </div>

        {/* Page Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            style={{
              padding: '9px 14px', borderRadius: 10, border: '1px solid #CBD5E1',
              fontSize: 13, fontWeight: 700, color: '#1E293B', background: '#F8FAFC',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* ── Main Leaderboard Table Card ── */}
      <div style={{
        background: '#fff', borderRadius: 20, border: '1px solid #E8F0E0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⌛</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Loading Leaderboard Rankings...</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Fetching trust scores from Connect Souq server</div>
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>No Leaderboard Entries Found</div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
              {searchQuery || levelFilter !== 'ALL'
                ? 'Try adjusting your search query or level filters.'
                : 'Leaderboard records will appear here once trust scores are generated.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
                  color: '#475569', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}>
                  <th style={{ padding: '14px 20px', width: 90 }}>Rank</th>
                  <th style={{ padding: '14px 20px' }}>Member</th>
                  <th style={{ padding: '14px 20px' }}>Franchise / Organization</th>
                  <th style={{ padding: '14px 20px' }}>Current Level</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Trust Score</th>
                  <th style={{ padding: '14px 20px', width: 120 }}>Relative Bar</th>
                  {isAdmin && <th style={{ padding: '14px 20px', textAlign: 'center' }}>Admin Action</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredList.map((item, idx) => {
                    const globalRank = page * pageSize + idx + 1;
                    const style = getLevelStyle(item.currentLevel);
                    const pct = Math.min(100, Math.round(((item.totalScore || 0) / maxScore) * 100));

                    // Rank Badges
                    let rankBadge = (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justify: 'center',
                        width: 32, height: 32, borderRadius: 10, background: '#F1F5F9',
                        color: '#475569', fontWeight: 800, fontSize: 13,
                      }}>
                        #{globalRank}
                      </span>
                    );

                    if (globalRank === 1) {
                      rankBadge = (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justify: 'center',
                          width: 34, height: 34, borderRadius: 12,
                          background: 'linear-gradient(135deg, #FEF08A, #F59E0B)',
                          color: '#78350F', fontWeight: 900, fontSize: 14,
                          boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                        }}>
                          🥇 1
                        </span>
                      );
                    } else if (globalRank === 2) {
                      rankBadge = (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justify: 'center',
                          width: 34, height: 34, borderRadius: 12,
                          background: 'linear-gradient(135deg, #F1F5F9, #94A3B8)',
                          color: '#1E293B', fontWeight: 900, fontSize: 14,
                          boxShadow: '0 2px 8px rgba(148,163,184,0.3)',
                        }}>
                          🥈 2
                        </span>
                      );
                    } else if (globalRank === 3) {
                      rankBadge = (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justify: 'center',
                          width: 34, height: 34, borderRadius: 12,
                          background: 'linear-gradient(135deg, #FFEDD5, #D97706)',
                          color: '#7C2D12', fontWeight: 900, fontSize: 14,
                          boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
                        }}>
                          🥉 3
                        </span>
                      );
                    }

                    return (
                      <motion.tr
                        key={item.userId || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: globalRank <= 3 ? '#FCFDFB' : 'transparent',
                        }}
                      >
                        {/* Rank */}
                        <td style={{ padding: '14px 20px' }}>
                          {rankBadge}
                        </td>

                        {/* Member */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: globalRank <= 3
                                ? 'linear-gradient(135deg, #16A34A, #15803D)'
                                : '#E2E8F0',
                              color: globalRank <= 3 ? '#fff' : '#334155',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: 14, flexShrink: 0,
                            }}>
                              {(item.fullName || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                                {item.fullName || 'Unknown Member'}
                              </div>
                              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                                User ID: #{item.userId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Franchise */}
                        <td style={{ padding: '14px 20px' }}>
                          {item.franchiseName ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '4px 10px', borderRadius: 8, background: '#F8FAFC',
                              border: '1px solid #E2E8F0', color: '#334155', fontSize: 12,
                              fontWeight: 700,
                            }}>
                              🏢 {item.franchiseName}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 12, color: '#94A3B8', fontStyle: 'italic', fontWeight: 500,
                            }}>
                              Direct Member
                            </span>
                          )}
                        </td>

                        {/* Current Level */}
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 20, fontSize: 11,
                            fontWeight: 800, background: style.bg, color: style.color,
                            border: `1px solid ${style.border}`, letterSpacing: '0.3px',
                          }}>
                            <span>{style.icon}</span>
                            {item.currentLevel || 'CONNECTOR'}
                          </span>
                        </td>

                        {/* Trust Score */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span style={{
                            fontSize: 16, fontWeight: 900, color: '#16A34A',
                            letterSpacing: '-0.3px',
                          }}>
                            {item.totalScore ?? 0}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginLeft: 4 }}>
                            pts
                          </span>
                        </td>

                        {/* Relative Progress Bar */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              flex: 1, height: 8, borderRadius: 4, background: '#F1F5F9',
                              overflow: 'hidden', position: 'relative',
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                  height: '100%', borderRadius: 4,
                                  background: globalRank === 1
                                    ? 'linear-gradient(90deg, #EAB308, #CA8A04)'
                                    : 'linear-gradient(90deg, #22C55E, #16A34A)',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', width: 32 }}>
                              {pct}%
                            </span>
                          </div>
                        </td>

                        {/* Admin Action (GLOBAL ADMIN ONLY) */}
                        {isAdmin && (
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedUserForDetail(item)}
                              style={{
                                padding: '6px 12px', borderRadius: 8, border: '1px solid #16A34A',
                                background: '#F0FDF4', color: '#15803D', fontSize: 11,
                                fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                                alignItems: 'center', gap: 4, transition: 'all 0.2s ease',
                              }}
                              title="View Trust History & Additional Details (Global Admin Only)"
                            >
                              📜 View Trust History & Details
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table Footer / Pagination Controls ── */}
        {!loading && filteredList.length > 0 && (
          <div style={{
            padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Showing Page <span style={{ fontWeight: 800, color: '#1E293B' }}>{page + 1}</span> of{' '}
              <span style={{ fontWeight: 800, color: '#1E293B' }}>{totalPages}</span> ({totalRecords} total entries)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: '1px solid #CBD5E1',
                  background: page === 0 ? '#F1F5F9' : '#fff',
                  color: page === 0 ? '#94A3B8' : '#334155',
                  fontSize: 12, fontWeight: 700, cursor: page === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ◀ Previous
              </button>

              <span style={{ fontSize: 12, fontWeight: 800, color: '#16A34A', padding: '0 6px' }}>
                {page + 1}
              </span>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: '1px solid #CBD5E1',
                  background: page >= totalPages - 1 ? '#F1F5F9' : '#fff',
                  color: page >= totalPages - 1 ? '#94A3B8' : '#334155',
                  fontSize: 12, fontWeight: 700, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Global Admin Trust Profile Detail Modal ── */}
      {selectedUserForDetail && (
        <TrustProfileDetailModal
          userId={selectedUserForDetail.userId}
          userName={selectedUserForDetail.fullName}
          onClose={() => setSelectedUserForDetail(null)}
        />
      )}
    </div>
  );
}
