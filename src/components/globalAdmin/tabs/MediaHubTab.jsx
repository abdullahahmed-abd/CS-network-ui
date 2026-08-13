import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Plus,
  Play,
  Pencil,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Check,
  Radio,
  Search,
  X,
  Tv,
  Eye,
  ArrowRight
} from 'lucide-react';
import {
  fetchMediaSections,
  createMediaVideo,
  updateMediaVideo,
  deleteMediaVideo,
} from '../../../api/adminApi';

const CATEGORIES = [
  { id: 'EVENTS', label: 'Events', icon: Sparkles, desc: 'Event highlights & coverage' },
  { id: 'PODCASTS', label: 'Podcasts', icon: Radio, desc: 'Interviews & audio shows' },
  { id: 'GENERAL_VIDEOS', label: 'General Videos', icon: Tv, desc: 'Tutorials & promotional videos' },
];

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2] && match[2].length === 11
    ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
    : null;
};

export default function MediaHubTab() {
  const [category, setCategory] = useState('EVENTS');
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Video Modals & State
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [showEditVideo, setShowEditVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoOrder, setVideoOrder] = useState('0');
  const [videoPublished, setVideoPublished] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);

  // Load Videos for current Category
  const loadVideos = useCallback(async (cat) => {
    setLoadingVideos(true);
    try {
      const res = await fetchMediaSections({ mediaCategory: cat });
      const sectionList = res?.mediaSections || [];
      let allVideos = res?.mediaVideos || res?.videos || res?.content || [];

      if (!allVideos.length && sectionList.length) {
        sectionList.forEach((sec) => {
          if (sec.videos && Array.isArray(sec.videos)) {
            allVideos = [...allVideos, ...sec.videos];
          }
        });
      }
      setVideos(allVideos);
    } catch (err) {
      console.error('Fetch videos error:', err);
      setToast({ message: err.message || 'Failed to load videos', type: 'error' });
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    loadVideos(category);
  }, [category, loadVideos]);

  // Filtered videos based on search
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase().trim();
    return videos.filter((v) => {
      const title = (v.videoTitle || v.title || '').toLowerCase();
      const desc = (v.videoDescription || v.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [videos, searchQuery]);

  // Handlers
  const handleCreateVideo = async (e) => {
    e?.preventDefault();
    if (!videoTitle.trim() || !youtubeUrl.trim()) {
      setToast({ message: 'Video Title and YouTube URL are required.', type: 'error' });
      return;
    }
    setVideoLoading(true);
    try {
      const res = await createMediaVideo({
        mediaCategory: category,
        videoTitle: videoTitle.trim(),
        youtubeUrl: youtubeUrl.trim(),
        videoDescription: videoDesc.trim(),
        displayOrder: Number(videoOrder) || 0,
        published: videoPublished,
      });
      setToast({ message: res?.message || 'Video published successfully to Media Hub!', type: 'success' });
      setShowCreateVideo(false);
      resetVideoForm();
      loadVideos(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to create video', type: 'error' });
    } finally {
      setVideoLoading(false);
    }
  };

  const handleUpdateVideo = async (e) => {
    e?.preventDefault();
    if (!showEditVideo) return;
    setVideoLoading(true);
    try {
      const videoIdNum = Number(showEditVideo.videoId || showEditVideo.id);
      const res = await updateMediaVideo({
        videoId: videoIdNum,
        videoTitle: videoTitle.trim() || undefined,
        videoDescription: videoDesc.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        mediaCategory: category,
        displayOrder: Number(videoOrder),
        published: videoPublished,
      });
      setToast({ message: res?.message || 'Video updated successfully!', type: 'success' });
      setShowEditVideo(null);
      resetVideoForm();
      loadVideos(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update video', type: 'error' });
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDeleteVideo = async (vid) => {
    const vId = vid.videoId || vid.id;
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await deleteMediaVideo(vId);
      setToast({ message: res?.message || 'Video deleted successfully!', type: 'success' });
      loadVideos(category);
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete video', type: 'error' });
    }
  };

  const resetVideoForm = () => {
    setVideoTitle('');
    setVideoDesc('');
    setYoutubeUrl('');
    setVideoOrder('0');
    setVideoPublished(true);
  };

  const openEditVideoModal = (vid) => {
    setShowEditVideo(vid);
    setVideoTitle(vid.videoTitle || vid.title || '');
    setVideoDesc(vid.videoDescription || vid.description || '');
    setYoutubeUrl(vid.youtubeUrl || vid.url || '');
    setVideoOrder(String(vid.displayOrder || 0));
    setVideoPublished(vid.published !== false);
  };

  return (
    <div className="space-y-8 font-sans text-black">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[99999] px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
            }`}
          >
            {toast.type === 'error' ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className="text-xs font-black">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 text-slate-500 hover:text-black rounded-lg transition-colors text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-8 text-white shadow-2xl border border-emerald-500/20">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Media Hub Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Video className="w-8 h-8 text-emerald-400" />
              Media Hub Content Manager
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-semibold max-w-xl">
              Curate, organize, and publish YouTube videos across ConnectSouq seamlessly by category.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setShowCreateVideo(true);
              resetVideoForm();
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Video</span>
          </motion.button>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(cat.id)}
              className={`relative p-5 rounded-3xl border transition-all duration-300 text-left flex items-center gap-4 ${
                isActive
                  ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl transition-colors ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-extrabold transition-colors ${
                    isActive ? 'text-emerald-950' : 'text-slate-900'
                  }`}
                >
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                  {cat.desc}
                </p>
              </div>
              {isActive && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {CATEGORIES.find((c) => c.id === category)?.label} Catalog
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Showing {filteredVideos.length} of {videos.length} video(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadVideos(category)}
              disabled={loadingVideos}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 flex items-center justify-center"
              title="Refresh videos"
            >
              <RefreshCw className={`w-4 h-4 ${loadingVideos ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        {loadingVideos ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-extrabold text-slate-600">Loading media library...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-black text-slate-900">
                {searchQuery ? 'No matching videos found' : `No videos in ${CATEGORIES.find((c) => c.id === category)?.label}`}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {searchQuery
                  ? 'Try searching with a different keyword or title.'
                  : 'Click the Add New Video button above to add your first YouTube video.'}
              </p>
            </div>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setShowCreateVideo(true);
                  resetVideoForm();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video Now</span>
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((vid, idx) => {
              const thumbUrl = getYouTubeThumbnail(vid.youtubeUrl || vid.url);
              const isPub = vid.published !== false;
              return (
                <motion.div
                  key={vid.videoId || vid.id || idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={vid.videoTitle || 'Video'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Video className="w-10 h-10" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/30" />

                    {/* Order Badge */}
                    {vid.displayOrder !== undefined && (
                      <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-md">
                        Order #{vid.displayOrder}
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 right-3 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-xl border shadow-md ${
                        isPub
                          ? 'bg-emerald-500/80 text-white border-emerald-400/40'
                          : 'bg-amber-500/80 text-white border-amber-400/40'
                      }`}
                    >
                      {isPub ? 'Published' : 'Draft'}
                    </span>

                    {/* Play Button Overlay */}
                    {(vid.youtubeUrl || vid.url) && (
                      <a
                        href={vid.youtubeUrl || vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center group-hover:bg-slate-950/20 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 transition-all">
                          <Play className="w-5 h-5 ml-0.5 fill-white" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {vid.videoTitle || vid.title || 'Untitled Video'}
                      </h4>
                      {(vid.videoDescription || vid.description) ? (
                        <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                          {vid.videoDescription || vid.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic font-medium">No description provided</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {(vid.youtubeUrl || vid.url) && (
                        <a
                          href={vid.youtubeUrl || vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] transition-colors w-fit border border-slate-200/60"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Watch on YouTube</span>
                        </a>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditVideoModal(vid)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid)}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200/70"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE VIDEO MODAL */}
      <AnimatePresence>
        {showCreateVideo && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Add Video to {CATEGORIES.find((c) => c.id === category)?.label}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Publish a new YouTube video link to this category.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateVideo(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateVideo} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    Video Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ConnectSouq Platform Walkthrough"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    YouTube URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    Video Description
                  </label>
                  <textarea
                    placeholder="Optional details or summary of the video..."
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                      value={videoOrder}
                      onChange={(e) => setVideoOrder(e.target.value.replace(/-/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={videoPublished}
                        onChange={(e) => setVideoPublished(e.target.checked)}
                        className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">Publish Immediately</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateVideo(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={videoLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {videoLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{videoLoading ? 'Publishing...' : 'Publish Video'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT VIDEO MODAL */}
      <AnimatePresence>
        {showEditVideo && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Edit Video #{showEditVideo.videoId || showEditVideo.id}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      Update video details, URL, or display order.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditVideo(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleUpdateVideo} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                      value={videoOrder}
                      onChange={(e) => setVideoOrder(e.target.value.replace(/-/g, ''))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-black focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={videoPublished}
                        onChange={(e) => setVideoPublished(e.target.checked)}
                        className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">Published</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditVideo(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={videoLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {videoLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{videoLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
