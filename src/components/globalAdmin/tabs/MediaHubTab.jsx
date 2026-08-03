import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchMediaSections,
  createMediaSection,
  updateMediaSection,
  deleteMediaSection,
  createMediaVideo,
  updateMediaVideo,
  deleteMediaVideo,
} from '../../../api/adminApi';

const CATEGORIES = [
  { id: 'EVENTS', label: 'Events', icon: '🎉' },
  { id: 'PODCASTS', label: 'Podcasts', icon: '🎙️' },
  { id: 'GENERAL_VIDEOS', label: 'General Videos', icon: '🎥' },
];

export default function MediaHubTab() {
  const [category, setCategory] = useState('EVENTS');
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [toast, setToast] = useState(null);

  // Section Modals & State
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showEditSection, setShowEditSection] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionOrder, setSectionOrder] = useState('0');
  const [sectionLoading, setSectionLoading] = useState(false);

  // Video Modals & State
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [showEditVideo, setShowEditVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('0');
  const [videoOrder, setVideoOrder] = useState('0');
  const [videoPublished, setVideoPublished] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);

  // Section filter for videos view
  const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');

  // Load Sections
  const loadSections = useCallback(async (cat) => {
    setLoadingSections(true);
    try {
      const res = await fetchMediaSections({ mediaCategory: cat });
      setSections(res?.mediaSections || []);
    } catch (err) {
      console.error('Fetch sections error:', err);
      setToast({ message: err.message || 'Failed to load sections', type: 'error' });
    } finally {
      setLoadingSections(false);
    }
  }, []);

  useEffect(() => {
    loadSections(category);
    setActiveSectionFilter('ALL');
  }, [category, loadSections]);

  // Section Handlers
  const handleCreateSection = async () => {
    if (!sectionName.trim()) {
      setToast({ message: 'Section name is required.', type: 'error' });
      return;
    }
    setSectionLoading(true);
    try {
      const res = await createMediaSection({
        mediaCategory: category,
        sectionName: sectionName.trim(),
        displayOrder: Number(sectionOrder) || 0,
      });
      setToast({ message: res?.message || 'Section created successfully!', type: 'success' });
      setShowCreateSection(false);
      setSectionName('');
      setSectionOrder('0');
      loadSections(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to create section', type: 'error' });
    } finally {
      setSectionLoading(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!showEditSection) return;
    setSectionLoading(true);
    try {
      const res = await updateMediaSection({
        sectionId: showEditSection.sectionId,
        sectionName: sectionName.trim() || undefined,
        displayOrder: Number(sectionOrder),
      });
      setToast({ message: res?.message || 'Section updated successfully!', type: 'success' });
      setShowEditSection(null);
      setSectionName('');
      setSectionOrder('0');
      loadSections(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update section', type: 'error' });
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDeleteSection = async (secId) => {
    if (!window.confirm('Delete this section? Any contained videos will remain in the category without a section.')) return;
    try {
      const res = await deleteMediaSection(secId);
      setToast({ message: res?.message || 'Section deleted!', type: 'success' });
      loadSections(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete section', type: 'error' });
    }
  };

  // Video Handlers
  const handleCreateVideo = async () => {
    if (!videoTitle.trim() || !youtubeUrl.trim()) {
      setToast({ message: 'Title and YouTube URL are required.', type: 'error' });
      return;
    }
    setVideoLoading(true);
    try {
      const secIdNum = Number(selectedSectionId);
      const res = await createMediaVideo({
        mediaCategory: category,
        videoTitle: videoTitle.trim(),
        youtubeUrl: youtubeUrl.trim(),
        videoDescription: videoDesc.trim(),
        sectionId: secIdNum > 0 ? secIdNum : undefined,
        displayOrder: Number(videoOrder) || 0,
        published: videoPublished,
      });
      setToast({ message: res?.message || 'Video added to Media Hub!', type: 'success' });
      setShowCreateVideo(false);
      resetVideoForm();
      loadSections(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to create video', type: 'error' });
    } finally {
      setVideoLoading(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!showEditVideo) return;
    setVideoLoading(true);
    try {
      const secIdNum = Number(selectedSectionId);
      const res = await updateMediaVideo({
        videoId: showEditVideo.videoId,
        videoTitle: videoTitle.trim() || undefined,
        videoDescription: videoDesc.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        mediaCategory: category,
        sectionId: secIdNum, // 0 = unassign
        displayOrder: Number(videoOrder),
        published: videoPublished,
      });
      setToast({ message: res?.message || 'Video updated!', type: 'success' });
      setShowEditVideo(null);
      resetVideoForm();
      loadSections(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update video', type: 'error' });
    } finally {
      setVideoLoading(false);
    }
  };

  const resetVideoForm = () => {
    setVideoTitle('');
    setVideoDesc('');
    setYoutubeUrl('');
    setSelectedSectionId('0');
    setVideoOrder('0');
    setVideoPublished(true);
  };

  const openEditSectionModal = (sec) => {
    setShowEditSection(sec);
    setSectionName(sec.sectionName || '');
    setSectionOrder(String(sec.displayOrder || 0));
  };

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: '#000000' }}>
      <style>{`
        input::placeholder, textarea::placeholder {
          color: #374151 !important;
          opacity: 1 !important;
          font-weight: 600 !important;
        }
        select option {
          color: #000000 !important;
          background: #FFFFFF !important;
          font-weight: 700 !important;
        }
      `}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 20, left: '50%',
              background: toast.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              border: `2px solid ${toast.type === 'error' ? '#EF4444' : '#16A34A'}`,
              color: '#000000',
              borderRadius: 14, padding: '14px 28px', zIndex: 9999,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 900,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span>{toast.type === 'error' ? '❌' : '✅'}</span>
            <span style={{ color: '#000000' }}>{toast.message}</span>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#000000', fontWeight: 900 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#000000', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            🎬 Media Hub Content Manager
          </h2>
          <p style={{ fontSize: 14, color: '#111827', margin: 0, fontWeight: 700 }}>
            Organize YouTube videos into categories and sections across ConnectSouq.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            onClick={() => { setShowCreateSection(true); setSectionName(''); setSectionOrder('0'); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 22px', borderRadius: 14, background: '#F3F4F6',
              border: '2px solid #000000', color: '#000000', fontSize: 14, fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <span>➕</span>
            <span style={{ color: '#000000' }}>New Section</span>
          </motion.button>

          <motion.button
            onClick={() => { setShowCreateVideo(true); resetVideoForm(); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 22px', borderRadius: 14,
              background: '#DCFCE7', border: '2.5px solid #15803D',
              color: '#000000', fontSize: 14, fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(22,163,74,0.25)',
            }}
          >
            <span>🎥</span>
            <span style={{ color: '#000000' }}>Add Video</span>
          </motion.button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                flex: 1, padding: '18px 24px', borderRadius: 18,
                background: isActive ? '#DCFCE7' : '#FFFFFF',
                color: '#000000',
                border: isActive ? '3px solid #15803D' : '2px solid #9CA3AF',
                fontSize: 15, fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: isActive ? '0 6px 20px rgba(22,163,74,0.25)' : '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <span style={{ color: '#000000', fontWeight: 900 }}>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Sections Overview Panel */}
      <div style={{ background: '#FFFFFF', borderRadius: 22, padding: 28, border: '2px solid #000000', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#000000', margin: 0 }}>
            📁 Sections under {CATEGORIES.find((c) => c.id === category)?.label}
          </h3>
          <button
            onClick={() => loadSections(category)}
            style={{ background: '#F3F4F6', border: '2px solid #000000', color: '#000000', padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
          >
            🔄 Refresh Sections
          </button>
        </div>

        {loadingSections ? (
          <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 15, color: '#000000', fontWeight: 800 }}>
            Loading sections...
          </div>
        ) : sections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', background: '#F9FAFB', borderRadius: 16, border: '2px dashed #9CA3AF' }}>
            <p style={{ fontSize: 15, color: '#000000', margin: '0 0 6px', fontWeight: 900 }}>No sections created under {category} yet.</p>
            <p style={{ fontSize: 13, color: '#111827', margin: 0, fontWeight: 700 }}>Click "New Section" above to organize videos into playlists/series.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {sections.map((sec) => (
              <motion.div
                key={sec.sectionId}
                whileHover={{ y: -3 }}
                style={{
                  background: '#F9FAFB', borderRadius: 18, padding: 20, border: '2px solid #000000',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#000000', background: '#FEF3C7', border: '1.5px solid #D97706', padding: '4px 12px', borderRadius: 8 }}>
                      Order #{sec.displayOrder || 0}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#000000', background: '#E0E7FF', border: '1px solid #4338CA', padding: '3px 10px', borderRadius: 8 }}>
                      📹 {sec.videoCount || 0} Videos
                    </span>
                  </div>

                  <h4 style={{ fontSize: 16, fontWeight: 900, color: '#000000', margin: 0, wordBreak: 'break-word' }}>
                    {sec.sectionName}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: 10, borderTop: '2px solid #E5E7EB', paddingTop: 14 }}>
                  <button
                    onClick={() => openEditSectionModal(sec)}
                    style={{ flex: 1, padding: '8px', borderRadius: 10, background: '#FFFFFF', border: '2px solid #000000', fontSize: 13, fontWeight: 900, color: '#000000', cursor: 'pointer' }}
                  >
                    ✏️ Edit Section
                  </button>
                  <button
                    onClick={() => handleDeleteSection(sec.sectionId)}
                    style={{ flex: 1, padding: '8px', borderRadius: 10, background: '#FEE2E2', border: '2px solid #DC2626', fontSize: 13, fontWeight: 900, color: '#7F1D1D', cursor: 'pointer' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE SECTION MODAL */}
      <AnimatePresence>
        {showCreateSection && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, maxWidth: 480, width: '100%', border: '3px solid #000000', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#000000' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Create Section in {category}</h3>
              <p style={{ fontSize: 14, color: '#111827', marginBottom: 22, fontWeight: 700 }}>Group videos into playlists or series within {category}.</p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Section Name *</label>
                <input
                  type="text" placeholder="e.g. Webinar Series / Season 1" value={sectionName} onChange={(e) => setSectionName(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 26 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Display Order</label>
                <input
                  type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setShowCreateSection(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #000000', background: '#F3F4F6', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={handleCreateSection} disabled={sectionLoading} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2.5px solid #15803D', background: '#DCFCE7', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>
                  {sectionLoading ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT SECTION MODAL */}
      <AnimatePresence>
        {showEditSection && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, maxWidth: 480, width: '100%', border: '3px solid #000000', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#000000' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Edit Section #{showEditSection.sectionId}</h3>
              <p style={{ fontSize: 14, color: '#111827', marginBottom: 22, fontWeight: 700 }}>Update section name or display order.</p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Section Name</label>
                <input
                  type="text" value={sectionName} onChange={(e) => setSectionName(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 26 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Display Order</label>
                <input
                  type="number" value={sectionOrder} onChange={(e) => setSectionOrder(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setShowEditSection(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #000000', background: '#F3F4F6', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={handleUpdateSection} disabled={sectionLoading} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2.5px solid #15803D', background: '#DCFCE7', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>
                  {sectionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE VIDEO MODAL */}
      <AnimatePresence>
        {showCreateVideo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, maxWidth: 540, width: '100%', border: '3px solid #000000', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#000000' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#000000', marginBottom: 18 }}>Add Video to {category}</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Video Title *</label>
                <input
                  type="text" placeholder="e.g. How ConnectSouq Works" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>YouTube URL *</label>
                <input
                  type="text" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Section (Optional)</label>
                <select
                  value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                >
                  <option value="0" style={{ color: '#000000', fontWeight: '800' }}>No Section (Direct under {category})</option>
                  {sections.map((s) => (
                    <option key={s.sectionId} value={s.sectionId} style={{ color: '#000000', fontWeight: '800' }}>{s.sectionName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Video Description</label>
                <textarea
                  placeholder="Optional details..." value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)}
                  style={{ width: '100%', height: 75, padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 14, fontWeight: 800, color: '#000000', outline: 'none', resize: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Display Order</label>
                  <input
                    type="number" value={videoOrder} onChange={(e) => setVideoOrder(e.target.value)}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 900, color: '#000000', cursor: 'pointer', marginTop: 24 }}>
                    <input type="checkbox" checked={videoPublished} onChange={(e) => setVideoPublished(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#16A34A' }} />
                    Published
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setShowCreateVideo(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #000000', background: '#F3F4F6', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={handleCreateVideo} disabled={videoLoading} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2.5px solid #15803D', background: '#DCFCE7', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>
                  {videoLoading ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT VIDEO MODAL */}
      <AnimatePresence>
        {showEditVideo && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, maxWidth: 540, width: '100%', border: '3px solid #000000', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#000000' }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#000000', marginBottom: 18 }}>Edit Video #{showEditVideo.videoId}</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Video Title</label>
                <input
                  type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>YouTube URL</label>
                <input
                  type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Section</label>
                <select
                  value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                >
                  <option value="0" style={{ color: '#000000', fontWeight: '800' }}>0 — Unassign from Section (Direct under {category})</option>
                  {sections.map((s) => (
                    <option key={s.sectionId} value={s.sectionId} style={{ color: '#000000', fontWeight: '800' }}>{s.sectionName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Description</label>
                <textarea
                  value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)}
                  style={{ width: '100%', height: 75, padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 14, fontWeight: 800, color: '#000000', outline: 'none', resize: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 900, color: '#000000', marginBottom: 6 }}>Display Order</label>
                  <input
                    type="number" value={videoOrder} onChange={(e) => setVideoOrder(e.target.value)}
                    style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '2px solid #000000', fontSize: 15, fontWeight: 800, color: '#000000', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 900, color: '#000000', cursor: 'pointer', marginTop: 24 }}>
                    <input type="checkbox" checked={videoPublished} onChange={(e) => setVideoPublished(e.target.checked)} style={{ width: 20, height: 20, accentColor: '#16A34A' }} />
                    Published
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setShowEditVideo(null)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #000000', background: '#F3F4F6', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={handleUpdateVideo} disabled={videoLoading} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2.5px solid #15803D', background: '#DCFCE7', color: '#000000', fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>
                  {videoLoading ? 'Saving...' : 'Save Video'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
