import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadEventCoverPhoto, resolvePhotoUrl } from '../../api/profileOperationsApi';

export default function EventCoverUploadModal({
  eventId,
  eventTitle,
  currentCoverUrl,
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);
    setSuccessMsg('');
    setUploading(true);

    try {
      const res = await uploadEventCoverPhoto(eventId, file);
      const newFileUrl = res?.fileUrl ? resolvePhotoUrl(res.fileUrl) : objectUrl;
      setSuccessMsg(res?.message || 'Event cover photo uploaded successfully!');

      onUploadSuccess?.({
        eventId,
        fileUrl: newFileUrl,
        rawResponse: res,
      });
    } catch (err) {
      console.error('Failed to upload event cover photo:', err);
      setError(err.message || 'Failed to upload event photo.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const displayCover = previewUrl || (currentCoverUrl ? resolvePhotoUrl(currentCoverUrl) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Upload Event Cover Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {eventTitle && (
            <p className="text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Event #{eventId}: <span className="text-slate-900">{eventTitle}</span>
            </p>
          )}

          {/* Notifications */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Preview Box */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative h-44 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
          >
            {displayCover ? (
              <>
                <img
                  src={displayCover}
                  alt="Event Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                  <Upload className="w-6 h-6 text-white" />
                  <span>Click to Replace Cover Image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to Upload Event Cover Image
                </p>
                <p className="text-[10px] text-slate-500">
                  Allowed: JPEG, PNG, WEBP, GIF (Max 5MB)
                </p>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span>Uploading cover image...</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              {successMsg ? 'Close' : 'Cancel'}
            </button>
            {!successMsg && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all flex items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Select Image</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
