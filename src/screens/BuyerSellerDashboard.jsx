// ══════════════════════════════════════════════
// BuyerSellerDashboard.jsx — PART 1 of 2
// ══════════════════════════════════════════════
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import {
  ShoppingCart, Store, Plus, Search,
  TrendingUp, Package, CheckCircle2,
  ChevronRight, LogOut, Bell,
  BarChart3, Wheat, RefreshCw, X, AlertCircle,
  ChevronLeft, Eye, Loader2, Filter, SlidersHorizontal,
  Menu, FileText, Send, Clock, CheckCheck,
  Users, ArrowRight, BadgeCheck,
  Calendar, DollarSign, MessageCircle, Paperclip,
  Inbox, Ticket, Video, Building2, Award, UserPlus,
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import {
  authenticatedFetch,
  getUserData,
  getAccessToken,
  refreshAccessToken,
  getItem,
} from '../api/auth';
import { resolvePhotoUrl, fetchMyProfile } from '../api/profileOperationsApi';
import { fetchMyPipeline, fetchLeadProposals } from '../api/businessPartnerApi';
import MyProfileModal from '../components/profile/MyProfileModal';
import { EventsTab } from './EventsComponents';
import MyRegistrationsTab from './MyRegistrationsTab';
import { getTodayDateString, getNowDateTimeString } from '../utils/BpHelpers';
import MeetingsTab from '../components/meetings/MeetingsTab';
import TrustLeaderboardTab from '../components/globalAdmin/tabs/TrustLeaderboardTab';

import ScheduleMeetingModal from '../components/meetings/ScheduleMeetingModal';
import DirectoryTab from '../components/directory/DirectoryTab';
import PartnershipsTab from '../components/partnerships/PartnershipsTab';
import { BusinessPartnerDeals as DealsTab } from '../components/businesspartner/BusinessPartnerDeals';

const BASE_URL = 'https://connectsouq.sundukpay.com';
const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/cs-network/ws';

// ─────────────────────────────────────────────
// chatFetch
// ─────────────────────────────────────────────
const chatFetch = async (url, formData) => {
  const doRequest = (token) =>
    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

  let token = getAccessToken();
  let res = await doRequest(token);

  if (res.status === 401) {
    console.log('🔒 chatFetch 401 — refreshing token...');
    try {
      token = await refreshAccessToken();
      console.log('✅ Token refreshed — retrying chatFetch');
      res = await doRequest(token);
    } catch (err) {
      console.error('❌ Refresh failed in chatFetch:', err);
      throw new Error('Session expired. Please login again.');
    }
  }

  return res;
};

const CATEGORIES = [
  'Wheat', 'Rice', 'Corn', 'Barley', 'Soybean',
  'Cotton', 'Sugar', 'Coffee', 'Cocoa', 'Palm Oil',
  'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Other',
];
const UNITS = ['KG', 'TON', 'QUINTAL', 'POUND', 'LITER', 'BARREL'];
const COUNTRIES = [
  'India', 'UAE', 'Saudi Arabia', 'USA', 'UK',
  'Australia', 'Canada', 'Germany', 'France', 'Singapore',
];
const BUSINESS_SECTORS = [
  'Agriculture', 'Food Processing', 'Trading', 'Export/Import',
  'Retail', 'Wholesale', 'Manufacturing', 'Logistics',
];

const STATUS_CONFIG = {
  OPEN: { color: 'text-emerald-700', bg: 'bg-emerald-50/60', border: 'border-emerald-200/70', dot: 'bg-emerald-500', label: 'Open' },
  CLOSED: { color: 'text-gray-600', bg: 'bg-gray-50/60', border: 'border-gray-200/70', dot: 'bg-gray-400', label: 'Closed' },
  EXPIRED: { color: 'text-red-600', bg: 'bg-red-50/60', border: 'border-red-200/70', dot: 'bg-red-500', label: 'Expired' },
  MATCHED: { color: 'text-blue-700', bg: 'bg-blue-50/60', border: 'border-blue-200/70', dot: 'bg-blue-500', label: 'Matched' },
};

const PROPOSAL_STATUS_CONFIG = {
  PENDING: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Pending', icon: Clock },
  ACCEPTED: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Accepted', icon: CheckCheck },
  REJECTED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected', icon: X },
};

const BRAND = '#A2CB8B';
const BRAND_DARK = '#7aab65';
const BRAND_LIGHT = '#e8f5e2';
const BUYER_COLOR = '#3b82f6';
const SELLER_COLOR = '#f97316';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n ?? 0);

const fmtCurrency = (n, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  }) : '';

const brandBtn = {
  background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
  color: '#fff',
  boxShadow: `0 4px 14px ${BRAND}55`,
};

// ══════════════════════════════════════════════
// AuthImage
// ══════════════════════════════════════════════
function AuthImage({ conversationId, messageId, alt, className, onClick }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let currentUrl = null;

    const load = async () => {
      setLoading(true); setFailed(false);
      try {
        const token = getAccessToken() || '';
        const res = await fetch(
          `${BASE_URL}/cs-network/fetch-media/${conversationId}/${messageId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res.status === 401) {
          const newToken = await refreshAccessToken();
          const retryRes = await fetch(
            `${BASE_URL}/cs-network/fetch-media/${conversationId}/${messageId}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'ngrok-skip-browser-warning': 'true',
                ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
              },
            }
          );
          if (!retryRes.ok) throw new Error('Failed');
          const blob = await retryRes.blob();
          currentUrl = URL.createObjectURL(blob);
          if (!cancelled) { setBlobUrl(currentUrl); setLoading(false); }
          return;
        }

        if (!res.ok) throw new Error('Failed to load image');
        const blob = await res.blob();
        currentUrl = URL.createObjectURL(blob);
        if (!cancelled) { setBlobUrl(currentUrl); setLoading(false); }
      } catch {
        if (!cancelled) { setFailed(true); setLoading(false); }
      }
    };

    load();
    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [conversationId, messageId]);

  if (loading)
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}
        style={{ minHeight: 180, minWidth: 240 }}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );

  if (failed || !blobUrl)
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-400 text-xs p-4`}
        style={{ minHeight: 180, minWidth: 240 }}>
        Failed to load image
      </div>
    );

  return (
    <img src={blobUrl} alt={alt} className={className}
      onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }} />
  );
}

// ══════════════════════════════════════════════
// AuthFileLink
// ══════════════════════════════════════════════
function AuthFileLink({ conversationId, messageId, fileName, children }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const doFetch = (token) =>
        fetch(
          `${BASE_URL}/cs-network/fetch-media/${conversationId}/${messageId}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'ngrok-skip-browser-warning': 'true',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

      let token = getAccessToken();
      let res = await doFetch(token);

      if (res.status === 401) {
        token = await refreshAccessToken();
        res = await doFetch(token);
      }

      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName || `file-${messageId}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch { alert('Failed to download file'); }
    finally { setDownloading(false); }
  };

  return (
    <button onClick={handleDownload} disabled={downloading} className="w-full text-left">
      {downloading
        ? <div className="flex items-center gap-2 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Downloading...</span>
        </div>
        : children}
    </button>
  );
}

// ══════════════════════════════════════════════
// TradeChatScreen
// ══════════════════════════════════════════════
export function TradeChatScreen({
  conversationId, title, otherPartyName, otherPartyId,
  dealId, tradeProposalId, tradeIntentId,
  isOwner = false, onClose, onDealCompleted
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [completingDeal, setCompletingDeal] = useState(false);
  const [dealSuccessMsg, setDealSuccessMsg] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [targetParticipantId, setTargetParticipantId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const clientRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const user = getUserData() || {};
  const currentUserId = String(user.id || user.userId || user.memberId || '');
  const currentName = user.fullName || '';

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 400); }, []);

  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;
    setHistoryLoading(true);
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'FETCH_CHAT');
      fd.append('conversationId', String(conversationId));
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load history');
      setMessages(data?.messageResponses || []);
    } catch (err) {
      setError(err.message || 'Failed to load chat history');
    } finally { setHistoryLoading(false); }
  }, [conversationId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Real-time polling fallback when WebSocket is unavailable over ngrok
  useEffect(() => {
    if (connected || !conversationId) return;
    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, [connected, conversationId, fetchHistory]);

  useEffect(() => {
    if (!conversationId) return;

    const token = getAccessToken();
    if (!token) {
      setConnecting(false);
      return;
    }

    // Ensure all cookies are written with SameSite=None; Secure for cross-origin ngrok requests
    document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; SameSite=None; Secure`;
    document.cookie = `token=${encodeURIComponent(token)}; path=/; SameSite=None; Secure`;
    document.cookie = `Authorization=Bearer ${encodeURIComponent(token)}; path=/; SameSite=None; Secure`;

    setConnecting(true);
    setError('');

    // Append token & ngrok bypass parameters for HTTP 101 WebSocket Upgrade GET /cs-network/ws
    const wsUrlWithParams = `${WS_URL}?token=${encodeURIComponent(token)}&ngrok-skip-browser-warning=true`;

    const client = new Client({
      brokerURL: wsUrlWithParams,
      reconnectDelay: 0, // Disable automatic STOMP reconnect loop on ngrok WSS failure
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (str.includes('STOMP') || str.includes('Websocket')) console.log('📡 STOMP Debug:', str);
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log('✅ WebSocket GET /cs-network/ws connected');
        setConnected(true);
        setConnecting(false);
        setError('');

        client.subscribe(`/topic/chat/${conversationId}`, (frame) => {
          try {
            const msg = JSON.parse(frame.body);
            const myIdStr = String(user.id || user.userId || user.memberId || '').trim().toLowerCase();
            const senderIdStr = String(msg.senderId || msg.sender_id || msg.userId || msg.sender?.id || '').trim().toLowerCase();
            if (myIdStr && senderIdStr && myIdStr === senderIdStr) {
              msg.mine = true;
            }
            setMessages(prev => {
              if (msg.messageId && prev.some(m => m.messageId === msg.messageId)) return prev;
              return [...prev, msg];
            });
          } catch { }
        });
      },

      onStompError: (f) => {
        console.warn('⚠️ STOMP error:', f.headers?.message);
        setConnected(false);
        setConnecting(false);
        try { client.deactivate(); } catch { }
      },

      onWebSocketError: (e) => {
        console.warn('⚠️ Ngrok WebSocket proxy restricted. Switching chat to real-time REST mode.');
        setConnected(false);
        setConnecting(false);
        try { client.deactivate(); } catch { }
      },

      onDisconnect: () => {
        setConnected(false);
        setConnecting(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      try { client.deactivate(); } catch { }
    };
  }, [conversationId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');

    // If WebSocket is connected, try sending over STOMP
    if (clientRef.current?.connected) {
      try {
        clientRef.current.publish({
          destination: '/app/chat.send',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            conversationId: Number(conversationId),
            content: text,
            messageType: 'TEXT',
          }),
        });
        setInput('');
        setSending(false);
        return;
      } catch (err) {
        console.warn('⚠️ STOMP publish error, attempting REST fallback...', err);
      }
    }

    // Fallback: Send via REST API (/cs-network/chat-operations)
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'SEND_MESSAGE');
      fd.append('conversationId', String(conversationId));
      fd.append('content', text);
      fd.append('messageType', 'TEXT');
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      if (res.ok) {
        const data = await res.json();
        const sent = data?.messageResponse || data?.messageResponses?.[0];
        if (sent) {
          sent.mine = true;
          setMessages(prev => [...prev, sent]);
        } else {
          fetchHistory();
        }
        setInput('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [input, sending, conversationId, fetchHistory]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File size must be less than 10MB'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'UPLOAD_MEDIA');
      fd.append('conversationId', String(conversationId));
      fd.append('file', file);
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const uploaded = data?.messageResponse || data?.messageResponses?.[0];
      if (uploaded) {
        uploaded.mine = true;
        setMessages(prev => {
          if (uploaded.messageId && prev.some(m => m.messageId === uploaded.messageId)) return prev;
          return [...prev, uploaded];
        });
      } else { fetchHistory(); }
    } catch (err) { setError(err.message || 'Failed to upload file'); }
    finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleMarkDealCompleted = async () => {
    console.log('🔍 [MARK_DEAL_COMPLETED] Debugging received IDs:', {
      dealId,
      tradeProposalId,
      tradeIntentId,
      conversationId,
    });

    const targetDealId = dealId || tradeProposalId || tradeIntentId;
    console.log('🔍 [MARK_DEAL_COMPLETED] Computed targetDealId:', targetDealId);

    if (!targetDealId) {
      console.warn('⚠️ [MARK_DEAL_COMPLETED] Missing targetDealId!');
      setError('Unable to mark complete: Deal ID or Intent ID is missing for this trade session.');
      return;
    }
    if (completingDeal) return;

    setCompletingDeal(true);
    setError('');
    try {
      const payload = {
        memberRequestType: 'MARK_DEAL_COMPLETED',
        dealId: Number(targetDealId),
        ...(tradeProposalId && { tradeProposalId: Number(tradeProposalId) }),
        ...(tradeIntentId && { tradeIntentId: Number(tradeIntentId) }),
      };
      console.log('🚀 [MARK_DEAL_COMPLETED] Sending payload to /cs-network/member:', payload);

      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('✅ [MARK_DEAL_COMPLETED] Success response:', data);
      const msg = data?.message || '✓ Deal marked as completed! Commission ledger generated.';
      setDealSuccessMsg(msg);
      onDealCompleted?.(targetDealId);
    } catch (err) {
      console.error('❌ [MARK_DEAL_COMPLETED] Error response:', err);
      setError(err.message || 'Failed to mark deal completed');
    } finally {
      setCompletingDeal(false);
    }
  };

  const handleInviteParticipant = async (e) => {
    if (e) e.preventDefault();

    setInviting(true);
    setInviteError('');
    try {
      let fetchedDealId = dealId;
      if (!fetchedDealId && conversationId) {
        try {
          const inboxFd = new FormData();
          inboxFd.append('chatRequestType', 'FETCH_INBOX');
          const inboxRes = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, inboxFd);
          const inboxData = await inboxRes.json();
          const convs = inboxData?.conversations || [];
          const match = convs.find(c => String(c.conversationId) === String(conversationId));
          if (match?.dealId) fetchedDealId = match.dealId;
        } catch (e) { }
      }

      const fd = new FormData();
      fd.append('chatRequestType', 'INVITE_PARTICIPANT');
      fd.append('conversationId', String(conversationId));
      if (fetchedDealId) {
        fd.append('dealId', String(fetchedDealId));
      }

      console.log('🚀 [INVITE_PARTICIPANT] Sending HTTP POST request to /cs-network/chat-operations with FormData:', {
        chatRequestType: 'INVITE_PARTICIPANT',
        conversationId: String(conversationId),
        ...(fetchedDealId && { dealId: String(fetchedDealId) }),
      });

      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      const data = await res.json();
      console.log('✅ [INVITE_PARTICIPANT] Response:', data);

      if (!res.ok || data?.status >= 400 || (data?.error && data?.error !== 'OK')) {
        throw new Error(data?.message || data?.error || 'Failed to invite participant');
      }

      setDealSuccessMsg(data?.message || '✓ Participant invited to conversation successfully!');
      setShowAddLeadModal(false);
      setTargetParticipantId('');
      fetchHistory();
    } catch (err) {
      console.error('❌ [INVITE_PARTICIPANT] Error:', err);
      setInviteError(err.message || 'Failed to invite participant.');
    } finally {
      setInviting(false);
    }
  };

  const isMine = (msg) => {
    if (!msg) return false;

    // 1. Explicit true flag set locally on sending
    if (msg.mine === true || msg.isMine === true) return true;

    // Extract current logged-in user identifiers
    const storedUserId = getItem('userId');
    const myIdList = [
      user.id,
      user.userId,
      user.memberId,
      user.sub,
      user.user_id,
      storedUserId,
    ].filter(Boolean).map(v => String(v).trim().toLowerCase());

    // Extract sender identifiers from message
    const senderId = String(
      msg.senderId ||
      msg.sender_id ||
      msg.createdById ||
      msg.userId ||
      msg.senderUserId ||
      msg.authorId ||
      msg.fromUserId ||
      msg.fromId ||
      msg.sender?.id ||
      msg.senderUser?.id ||
      msg.createdUser?.id ||
      ''
    ).trim().toLowerCase();

    // 2. Direct ID match with current logged in user
    if (senderId && myIdList.includes(senderId)) return true;

    // 3. Email match with current logged in user
    const myEmail = String(user.email || '').toLowerCase().trim();
    const senderEmail = String(
      msg.senderEmail ||
      msg.email ||
      msg.sender?.email ||
      msg.senderUser?.email ||
      ''
    ).toLowerCase().trim();

    if (myEmail && senderEmail && myEmail === senderEmail) return true;

    // 4. Name match with current logged in user
    const myName = String(user.fullName || user.name || user.username || '').toLowerCase().trim();
    const senderName = String(
      msg.senderName ||
      msg.createdByName ||
      msg.sender?.fullName ||
      msg.sender?.name ||
      msg.senderUser?.fullName ||
      ''
    ).toLowerCase().trim();

    if (myName && senderName && myName === senderName) return true;

    // 5. Check against OTHER party (if message sender is explicitly the other party -> return false)
    const otherName = String(otherPartyName || '').toLowerCase().trim();
    const otherId = String(otherPartyId || '').toLowerCase().trim();

    if (otherId && senderId && otherId === senderId) return false;
    if (otherName && senderName && (otherName === senderName || (otherName.length > 2 && senderName.length > 2 && (otherName.includes(senderName) || senderName.includes(otherName))))) return false;

    // Default to false (Receiver message -> Left side, White background)
    return false;
  };

  const getSenderName = (msg) => msg.senderName || msg.createdByName || msg.sender?.fullName || 'Trader';
  const getMsgTime = (msg) => fmtTime(msg.sentAt || msg.createdAt || msg.timestamp);
  const isImageMsg = (msg) => (msg.fileType || '').toLowerCase().startsWith('image/');
  const formatFileSize = (b) => {
    if (!b) return '';
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full h-full sm:h-[88vh] sm:max-w-2xl bg-white sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        <div className="flex-shrink-0 px-5 py-4 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(otherPartyName || 'T').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{otherPartyName || title || 'Trade Chat'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${connected ? 'bg-emerald-300' : connecting ? 'bg-yellow-300 animate-pulse' : 'bg-red-400'
                  }`} />
                <span className="text-white/80 text-[11px] font-medium">
                  {connected ? 'Connected' : connecting ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && (
              <button
                onClick={handleMarkDealCompleted}
                disabled={completingDeal}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 transition shadow-sm disabled:opacity-50"
                title="Mark this deal as completed"
              >
                {completingDeal ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <CheckCircle2 className="h-4 w-4 text-white" />}
                <span className="hidden sm:inline">{dealSuccessMsg ? 'Completed ✓' : 'Mark Complete'}</span>
              </button>
            )}
            <button
              onClick={() => {
                setInviteError('');
                setShowAddLeadModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-1.5 transition shadow-sm"
              title="Invite Participant to this chat"
            >
              <UserPlus className="h-4 w-4 text-white" />
              <span className="hidden sm:inline">Invite Participant</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-white hover:bg-white/30 transition text-xs font-semibold shadow-sm"
              title="Schedule 1-on-1 Meeting"
            >
              <Calendar className="h-4 w-4 text-white" />
              <span className="hidden sm:inline">1-on-1 Meeting</span>
            </button>
            <button onClick={onClose} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30 transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {dealSuccessMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 flex items-center gap-2 bg-emerald-50 border-b border-emerald-200 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs font-semibold text-emerald-800 flex-1">{dealSuccessMsg}</p>
              <button onClick={() => setDealSuccessMsg('')}><X className="h-3.5 w-3.5 text-emerald-500" /></button>
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 flex items-center gap-2 bg-red-50 border-b border-red-200 px-4 py-2.5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-red-600 flex-1">{error}</p>
              <button onClick={() => setError('')}><X className="h-3.5 w-3.5 text-red-400" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
          style={{ background: 'linear-gradient(180deg, #f8fdf5 0%, #f0f9eb 100%)' }}>
          {historyLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: BRAND_DARK }} />
              <p className="text-xs text-gray-600 font-medium">Loading chat history...</p>
            </div>
          )}
          {!historyLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: `${BRAND}20` }}>
                <MessageCircle className="h-8 w-8" style={{ color: BRAND_DARK }} />
              </div>
              <div>
                <p className="font-bold text-gray-800">Start the conversation</p>
                <p className="text-sm text-gray-500 mt-1">Send a message to discuss the trade details.</p>
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const mine = isMine(msg);
              const showName = !mine && (idx === 0 || isMine(messages[idx - 1]));
              const isFile = msg.messageType === 'FILE' || !!msg.fileUrl;
              return (
                <motion.div key={msg.messageId ? `msg-${msg.messageId}-${idx}` : `msg-idx-${idx}`}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] ${mine ? 'flex flex-col items-end' : 'flex gap-2 items-end'}`}>
                    {!mine && (
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mb-1"
                        style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}>
                        {getSenderName(msg).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      {showName && (
                        <p className="text-[10px] font-bold text-gray-500 mb-1 ml-1">{getSenderName(msg)}</p>
                      )}
                      {isFile ? (
                        <div className={`rounded-2xl overflow-hidden shadow-md ${mine ? 'rounded-tr-none text-white' : 'rounded-tl-none bg-white border border-gray-200 text-gray-900'
                          }`} style={mine ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : { background: '#ffffff' }}>
                          {isImageMsg(msg) ? (
                            <AuthImage
                              conversationId={msg.conversationId} messageId={msg.messageId}
                              alt={msg.fileName || 'image'}
                              className="max-w-[280px] max-h-[280px] object-cover hover:opacity-90 transition rounded-2xl"
                              onClick={() => setImagePreview({
                                conversationId: msg.conversationId,
                                messageId: msg.messageId,
                                fileName: msg.fileName,
                              })} />
                          ) : (
                            <AuthFileLink conversationId={msg.conversationId} messageId={msg.messageId} fileName={msg.fileName}>
                              <div className="flex items-center gap-3 px-4 py-3 hover:opacity-90 transition">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${mine ? 'bg-white/25' : 'bg-gray-100'}`}>
                                  <FileText className={`h-5 w-5 ${mine ? 'text-white' : 'text-emerald-700'}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm font-bold truncate ${mine ? 'text-white' : 'text-gray-900'}`}>{msg.fileName || 'File'}</p>
                                  <p className={`text-[10px] font-medium ${mine ? 'text-white/80' : 'text-gray-500'}`}>
                                    {formatFileSize(msg.fileSize)} · Click to download
                                  </p>
                                </div>
                              </div>
                            </AuthFileLink>
                          )}
                          {msg.content && (
                            <div className={`px-4 py-2 border-t ${mine ? 'border-white/20' : 'border-gray-100'}`}>
                              <p className={`text-sm ${mine ? 'text-white' : 'text-gray-900'}`}>{msg.content}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`rounded-2xl px-4 py-2.5 shadow-md ${mine ? 'rounded-tr-none text-white' : 'rounded-tl-none bg-white border border-gray-200 text-gray-900'
                          }`} style={mine ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' } : { background: '#ffffff' }}>
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${mine ? 'text-white' : 'text-gray-900'}`}>
                            {msg.content}
                          </p>
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 font-medium ${mine ? 'text-right text-gray-500' : 'text-left text-gray-400 ml-1'}`}>
                        {getMsgTime(msg)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3">
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" onChange={handleFileUpload} className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()} disabled={!connected || uploading}
              className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Attach file">
              {uploading
                ? <Loader2 className="h-5 w-5 animate-spin" style={{ color: BRAND_DARK }} />
                : <Paperclip className="h-5 w-5" />}
            </motion.button>
            <div className="flex-1 relative">
              <textarea ref={inputRef} rows={1} value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={connected ? 'Type a message… (Enter to send)' : 'Waiting for connection…'}
                disabled={!connected}
                className="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; e.target.style.background = ''; }}
              />
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={sendMessage} disabled={!connected || !input.trim() || sending}
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={brandBtn}>
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
            Trade Chat · Max 10MB
          </p>
        </div>

        <ScheduleMeetingModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          initialConversationId={conversationId}
          initialScenario="DIRECT"
          onMeetingScheduled={() => {
            fetchHistory();
          }}
        />
      </motion.div>

      <AnimatePresence>
        {imagePreview && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setImagePreview(null)}>
            <motion.div className="relative max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setImagePreview(null)}
                className="absolute -top-12 right-0 rounded-full bg-white/20 backdrop-blur p-2 text-white hover:bg-white/30 transition">
                <X className="h-5 w-5" />
              </button>
              <AuthImage
                conversationId={imagePreview.conversationId} messageId={imagePreview.messageId}
                alt={imagePreview.fileName || 'preview'}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
              {imagePreview.fileName && (
                <p className="text-center text-white text-sm mt-3 font-medium">{imagePreview.fileName}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddLeadModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Invite Participant</h3>
                    <p className="text-xs text-gray-500">Invite participant to conversation #{conversationId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {inviteError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <form onSubmit={handleInviteParticipant} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Clicking <span className="font-extrabold text-emerald-700">Invite Participant</span> will send an invitation request to add a participant to conversation <span className="font-bold text-gray-800">#{conversationId}</span>. The backend will handle participant processing automatically.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                  >
                    {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{inviting ? 'Inviting...' : 'Invite Participant'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════
// InboxTab
// ══════════════════════════════════════════════
export function InboxTab() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState('');

  const resolveParticipantName = (conv) => {
    if (!conv) return 'Trade Partner';

    if (Array.isArray(conv.participants) && conv.participants.length > 0) {
      const user = getUserData() || {};
      const storedUserId = getItem('userId');
      const myIdList = [
        user.id,
        user.userId,
        user.memberId,
        user.sub,
        user.user_id,
        storedUserId,
      ].filter(Boolean).map(v => String(v).trim().toLowerCase());

      const others = conv.participants.filter(p => {
        const pUserId = String(p.userId || p.participantId || '').trim().toLowerCase();
        return !myIdList.includes(pUserId);
      });

      const listToUse = others.length > 0 ? others : conv.participants;
      const names = listToUse
        .map(p => p.participantName || p.name || p.userName || p.user_name)
        .filter(Boolean);

      if (names.length > 0) {
        return names.join(', ');
      }
    }

    const candidate = String(
      conv.participantName ||
      conv.otherPartyName ||
      conv.otherUserName ||
      conv.userName ||
      conv.proposerName ||
      conv.receiverName ||
      conv.companyName ||
      conv.contactPerson ||
      conv.intentTitle ||
      conv.tradeIntentTitle ||
      conv.title ||
      conv.commodity ||
      conv.productName ||
      ''
    ).trim();

    if (candidate && candidate.toLowerCase() !== 'unknown' && candidate.toLowerCase() !== 'null' && candidate.toLowerCase() !== 'undefined') {
      return candidate;
    }

    if (conv.tradeIntentId || conv.intentId) {
      return `Trade #${conv.tradeIntentId || conv.intentId}`;
    }
    if (conv.tradeProposalId || conv.proposalId) {
      return `Proposal #${conv.tradeProposalId || conv.proposalId}`;
    }
    if (conv.participantId || conv.otherUserId) {
      return `Trader #${conv.participantId || conv.otherUserId}`;
    }
    return 'Trade Partner';
  };

  const fetchInbox = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'FETCH_INBOX');
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch inbox');

      const rawList = data?.conversations || data?.content || (Array.isArray(data) ? data : []);
      const list = Array.isArray(rawList) ? rawList : [];

      const enriched = list.map(c => ({
        ...c,
        resolvedName: resolveParticipantName(c),
      }));

      setConversations(enriched);
    } catch (err) { setError(err.message || 'Failed to load inbox'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);

  const filtered = conversations.filter(c => {
    const name = c.resolvedName || resolveParticipantName(c);
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  const fmtRelative = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return fmtDate(iso);
  };

  return (
    <>
      <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900">Inbox</h2>
              {totalUnread > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                  style={{ background: BRAND_DARK }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">All your trade conversations</p>
          </div>
          <button onClick={fetchInbox}
            className="self-start sm:self-auto rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search conversations..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/60 bg-white/40 backdrop-blur pl-10 pr-4 py-2.5 text-sm text-gray-800 outline-none transition"
            onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 2px ${BRAND}40`; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          />
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-600 flex-1">{error}</p>
            <button onClick={() => setError('')}><X className="h-4 w-4 text-red-400" /></button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
            <p className="text-sm text-gray-600 font-medium">Loading inbox...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
              <Inbox className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800 mb-1">
                {search ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-gray-600">
                {search ? 'Try a different search term' : 'Accepted proposals will create conversations here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((conv, idx) => {
                const name = conv.resolvedName || resolveParticipantName(conv);
                return (
                  <motion.div key={conv.conversationId || idx}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: idx * 0.04 }}
                    whileHover={{ y: -2 }} onClick={() => setActiveChat(conv)}
                    className="flex items-center gap-4 rounded-2xl bg-white border cursor-pointer p-4 transition-all"
                    style={{
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      borderColor: conv.unreadCount > 0 ? `${BRAND}50` : 'rgba(229,231,235,0.8)',
                    }}>
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                          style={{ background: '#ef4444' }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-extrabold text-gray-900' : 'font-bold text-gray-900'}`}>
                          {name}
                        </p>
                        {conv.lastMessageAt && (
                          <p className="text-[10px] text-gray-400 font-medium flex-shrink-0">
                            {fmtRelative(conv.lastMessageAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                          {conv.lastMessage || 'No messages yet — tap to open'}
                        </p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${BRAND}20`, color: BRAND_DARK }}>
                          Chat
                        </span>
                      </div>
                      {conv.lastMessageAt && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(conv.lastMessageAt)}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {activeChat && (
          <TradeChatScreen
            conversationId={activeChat.conversationId}
            title={activeChat.resolvedName || resolveParticipantName(activeChat)}
            otherPartyName={activeChat.resolvedName || resolveParticipantName(activeChat)}
            otherPartyId={activeChat.participantId || activeChat.otherUserId || activeChat.partnerId}
            dealId={activeChat.dealId || activeChat.tradeDealId || activeChat.tradeProposalId || activeChat.proposalId || activeChat.tradeIntentId || activeChat.intentId}
            tradeProposalId={activeChat.tradeProposalId || activeChat.proposalId}
            tradeIntentId={activeChat.tradeIntentId || activeChat.intentId}
            isOwner={
              activeChat.isOwner === true ||
              (activeChat.intentOwnerId && String(activeChat.intentOwnerId) === String(user?.id || user?.userId || user?.memberId))
            }
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ══════════════════════════════════════════════
// WindOpsShell
// ══════════════════════════════════════════════
function WindOpsShell({
  appName, navItems, activeTab, setActiveTab,
  searchValue, onSearchChange, userInitial, userPhotoUrl, userFullName, userEmail,
  notifications, onNewIntent, onLogout, onOpenProfile, children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full p-3 sm:p-6 font-[Manrope,sans-serif]"
      style={{ background: `linear-gradient(135deg, ${BRAND_LIGHT} 0%, #f0f9eb 50%, ${BRAND_LIGHT} 100%)` }}>
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-3rem)] lg:h-[calc(100vh-3rem)] max-w-[1400px] overflow-hidden rounded-[28px] sm:rounded-[34px] border border-white/40 bg-white/25 backdrop-blur-xl"
        style={{ boxShadow: `0 30px 90px ${BRAND}40` }}>

        <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col p-6 text-white"
          style={{ background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-white/20 grid place-items-center">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight leading-none">{appName}</div>
              <div className="text-xs text-white/75 mt-1">Dashboard</div>
            </div>
          </div>
          <nav className="space-y-1.5 flex-1 overflow-y-auto min-h-0 pr-1">
            {navItems.map(item => {
              const active = item.id === activeTab;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-white/25' : 'hover:bg-white/15'}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/30 px-1.5 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="pt-4 mt-2 space-y-2.5 flex-shrink-0 border-t border-white/15">
            {/* Sidebar Profile Card */}
            <div
              onClick={onOpenProfile}
              title="Click to view / edit My Profile"
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer border border-white/10"
            >
              {(() => {
                const photoSrc = resolvePhotoUrl(userPhotoUrl);
                return photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={userFullName || 'User'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                    className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-white/40"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/30 font-extrabold text-sm flex items-center justify-center flex-shrink-0 text-white border border-white/30">
                    {userInitial || 'U'}
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {userFullName || 'Member Profile'}
                </div>
                <div className="text-[10px] text-white/70 truncate">
                  {userEmail || 'Click to edit profile'}
                </div>
              </div>
            </div>

            <button onClick={onNewIntent}
              className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition"
              style={{ background: 'rgba(255,255,255,0.22)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.30)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}>
              <Plus className="h-4 w-4" /> New Intent
            </button>
            <button onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500/25 transition">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </aside>

        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)} />
              <motion.aside className="fixed left-0 top-0 z-50 h-full w-72 p-6 text-white lg:hidden flex flex-col"
                style={{ background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                  <div className="font-extrabold text-lg">{appName}</div>
                  <button onClick={() => setDrawerOpen(false)} className="rounded-xl bg-white/15 p-2 hover:bg-white/25">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="space-y-1.5 flex-1 overflow-y-auto min-h-0 pr-1">
                  {navItems.map(item => {
                    const active = item.id === activeTab;
                    return (
                      <button key={item.id}
                        onClick={() => { setActiveTab(item.id); setDrawerOpen(false); }}
                        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? 'bg-white/25' : 'hover:bg-white/15'}`}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/30 px-1.5 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
                <div className="pt-4 mt-2 space-y-2.5 flex-shrink-0 border-t border-white/15">
                  <div
                    onClick={() => { onOpenProfile(); setDrawerOpen(false); }}
                    title="Click to view / edit My Profile"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer border border-white/10"
                  >
                    {(() => {
                      const photoSrc = resolvePhotoUrl(userPhotoUrl);
                      return photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={userFullName || 'User'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-white/40"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-white/30 font-extrabold text-sm flex items-center justify-center flex-shrink-0 text-white border border-white/30">
                          {userInitial || 'U'}
                        </div>
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">
                        {userFullName || 'Member Profile'}
                      </div>
                      <div className="text-[10px] text-white/70 truncate">
                        {userEmail || 'Click to edit profile'}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => { onNewIntent(); setDrawerOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-xs font-bold hover:bg-white/30 transition">
                    <Plus className="h-4 w-4" /> New Intent
                  </button>
                  <button onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-500/25 transition">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <section className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 overflow-hidden min-h-0">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button onClick={() => setDrawerOpen(true)}
                className="lg:hidden rounded-xl border border-white/60 bg-white/40 p-2.5 text-gray-700 hover:bg-white/50 transition">
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative w-full max-w-[560px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input placeholder="Search" value={searchValue} onChange={e => onSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-white/60 bg-white/40 backdrop-blur px-10 py-2.5 text-sm text-gray-800 outline-none transition"
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 2px ${BRAND}40`; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={onNewIntent}
                className="hidden sm:inline-flex rounded-xl border border-white/60 bg-white/40 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white/50 transition">
                New
              </button>
              <button className="relative rounded-xl border border-white/60 bg-white/40 p-2.5 text-gray-700 hover:bg-white/50 transition">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {notifications}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenProfile}
                title="View / Edit My Profile"
                className="relative flex items-center justify-center rounded-full border-2 border-white/80 shadow-md hover:scale-105 transition cursor-pointer p-0.5"
                style={{ background: BRAND }}
              >
                {(() => {
                  const photoSrc = resolvePhotoUrl(userPhotoUrl);
                  return photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="User Profile"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full grid place-items-center font-bold text-white text-sm">
                      {userInitial}
                    </div>
                  );
                })()}
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">{children}</div>
        </section>
      </div>
    </div>
  );
}

// ── StatCard ──
function StatCard({ icon: Icon, label, value, sub, delay = 0, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border border-white/50 bg-white/35 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-xl p-2.5" style={{ background: `${accent || BRAND}22`, color: accent || BRAND_DARK }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── InfoRow ──
function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${BRAND}18`, color: BRAND_DARK }}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold truncate" style={highlight ? { color: BRAND_DARK } : { color: '#111827' }}>{value}</span>
      </div>
    </div>
  );
}

// ── IntentCard ──
const IntentCard = forwardRef(function IntentCard({ intent, onView, onSendProposal, isOwn }, ref) {
  const st = STATUS_CONFIG[intent.status] || STATUS_CONFIG.OPEN;
  const isBuy = intent.intentType === 'BUY';
  const showPropose = intent.status === 'OPEN' && !!onSendProposal && !isOwn;

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985 }} whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl bg-white"
      style={{ boxShadow: `0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px ${BRAND}20` }}>
      <div className="absolute bottom-0 left-0 right-0 h-24">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill={BRAND} opacity="0.3" />
          <path d="M0,20 C200,100 400,100 600,60 C800,20 1000,20 1200,60 L1200,120 L0,120 Z" fill={BRAND} opacity="0.2" />
          <path d="M0,40 C250,120 450,120 600,80 C750,40 950,40 1200,80 L1200,120 L0,120 Z" fill={BRAND_DARK} opacity="0.15" />
        </svg>
      </div>
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-11 w-11 rotate-45 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`, boxShadow: `0 6px 16px ${BRAND}55` }}>
              <div className="-rotate-45">
                {isBuy ? <ShoppingCart className="h-5 w-5 text-white" /> : <Store className="h-5 w-5 text-white" />}
              </div>
            </div>
            <div className="min-w-0 ml-1">
              <p className="font-bold text-sm text-gray-900 truncate">{intent.title}</p>
              <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: BRAND_DARK }}>{intent.category}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${st.color} ${st.bg} ${st.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{
                background: isBuy
                  ? `linear-gradient(135deg, ${BUYER_COLOR}, #2563eb)`
                  : `linear-gradient(135deg, ${SELLER_COLOR}, #ea580c)`
              }}>
              {isBuy ? 'BUY' : 'SELL'}
            </span>
          </div>
        </div>
        <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${BRAND}55, transparent)` }} />
        <div className="space-y-2.5 mb-4">
          <InfoRow icon={Package} label="Quantity" value={`${fmt(intent.quantity)} ${intent.unit}`} />
          <InfoRow icon={TrendingUp} label="Price / Unit" value={fmtCurrency(intent.pricePerUnit, intent.currency)} />
          <InfoRow icon={BarChart3} label="Total Value" value={fmtCurrency(intent.totalValue, intent.currency)} highlight />
          <InfoRow icon={CheckCircle2} label="Expires" value={fmtDate(intent.expiresAt)} />
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${BRAND}25` }}>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Posted By</p>
            <p className="text-xs font-bold text-gray-800 truncate">{intent.createdByName}</p>
          </div>
          <div className="flex items-center gap-2">
            {showPropose && (
              <button onClick={() => onSendProposal(intent)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:shadow-lg border"
                style={{ borderColor: BRAND, color: BRAND_DARK, background: BRAND_LIGHT }}>
                <Send className="h-3.5 w-3.5" /> Propose
              </button>
            )}
            <button onClick={() => onView(intent)}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`, boxShadow: `0 4px 12px ${BRAND}55` }}>
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ── ProposalCard ──
export const ProposalCard = forwardRef(function ProposalCard(
  { proposal, onAccept, isOwner, accepting, onOpenChat, onMarkCompleted, completingId }, ref
) {
  useEffect(() => {
    console.log('🔍 [PROPOSAL_CARD] Proposal item rendered:', proposal);
  }, [proposal]);

  const st = PROPOSAL_STATUS_CONFIG[proposal.status] || PROPOSAL_STATUS_CONFIG.PENDING;
  const StatusIcon = st.icon;
  const canAccept = isOwner && proposal.status === 'PENDING';
  const canChat = proposal.status === 'ACCEPTED' && typeof onOpenChat === 'function';

  // Resolved metadata for informative card layout
  const rawItemTitle =
    proposal.intentTitle ||
    proposal.tradeIntentTitle ||
    proposal.title ||
    proposal.productName ||
    proposal.commodity ||
    proposal.commodityName ||
    proposal.crop ||
    proposal.cropName ||
    proposal.item ||
    proposal.itemName ||
    proposal.tradeIntent?.title ||
    proposal.intent?.title ||
    proposal.tradeIntent?.commodity ||
    proposal.intent?.commodity ||
    proposal.tradeIntent?.productName ||
    proposal.intent?.productName ||
    proposal.tradeIntent?.cropName ||
    proposal.intent?.cropName ||
    proposal.category ||
    proposal.tradeIntentCategory ||
    proposal.intentCategory ||
    proposal.intent?.category;

  const intentTitle = rawItemTitle
    ? rawItemTitle
    : (proposal.leadName ? `Lead: ${proposal.leadName}` : `Trade Intent #${proposal.tradeIntentId || proposal.intentId || proposal.id}`);

  const commodityTag =
    proposal.commodity ||
    proposal.commodityName ||
    proposal.crop ||
    proposal.cropName ||
    proposal.productName ||
    (rawItemTitle && rawItemTitle !== intentTitle ? rawItemTitle : null);

  const intentType = String(
    proposal.intentType ||
    proposal.tradeIntentType ||
    proposal.type ||
    proposal.intent?.intentType ||
    'TRADE'
  ).toUpperCase();

  const category =
    proposal.category ||
    proposal.tradeIntentCategory ||
    proposal.intentCategory ||
    proposal.intent?.category;

  const proposerName =
    proposal.proposerName ||
    proposal.proposerMemberName ||
    proposal.proposerUserName ||
    proposal.createdByName ||
    proposal.senderName ||
    'Proposer';

  const quantity = Number(
    proposal.quantityRequested ||
    proposal.offeredQuantity ||
    proposal.quantity ||
    proposal.qty ||
    0
  );

  const price = Number(
    proposal.price ||
    proposal.pricePerUnit ||
    proposal.offeredPrice ||
    proposal.rate ||
    0
  );

  const timeline =
    proposal.timelineDays ||
    proposal.timeline ||
    proposal.deliveryTimeline ||
    30;

  const totalValue =
    (quantity * price) > 0
      ? quantity * price
      : Number(proposal.totalValue || proposal.totalPrice || 0);

  const isBuy = intentType === 'BUY';

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }} whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl bg-white border"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
        borderColor: proposal.status === 'ACCEPTED' || proposal.status === 'COMPLETED' ? `${BRAND}40` : 'rgba(229,231,235,0.8)',
      }}>
      {(proposal.status === 'ACCEPTED' || proposal.status === 'COMPLETED') && (
        <div className="absolute inset-0 opacity-5 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }} />
      )}
      <div className="h-1.5 w-full" style={{
        background: proposal.status === 'ACCEPTED' || proposal.status === 'COMPLETED'
          ? `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK})`
          : proposal.status === 'PENDING'
            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
            : 'linear-gradient(90deg, #ef4444, #dc2626)',
      }} />

      <div className="relative z-10 p-5">
        {/* Top Badges (BUY/SELL badge, Commodity, Category, Status) */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${isBuy ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
              {isBuy ? <ShoppingCart className="h-3 w-3" /> : <Store className="h-3 w-3" />}
              {intentType}
            </span>

            {commodityTag && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                <Wheat className="h-3 w-3 text-amber-600" />
                {commodityTag}
              </span>
            )}

            {category && (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200">
                {category}
              </span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold flex-shrink-0 ${st.color} ${st.bg} ${st.border}`}>
            <StatusIcon className="h-3 w-3" /> {st.label}
          </span>
        </div>

        {/* Intent Title & Proposer Info */}
        <div className="mb-4">
          <h3 className="font-extrabold text-base text-gray-900 leading-snug line-clamp-2" title={intentTitle}>
            {intentTitle}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
                {proposerName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800">{proposerName}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">Proposal #{proposal.proposalId || proposal.id}</span>
            {proposal.tradeIntentId && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">Intent #{proposal.tradeIntentId}</span>
              </>
            )}
          </div>
          {proposal.leadName && (
            <p className="text-xs font-medium text-amber-700 mt-1 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-amber-600" /> Lead: {proposal.leadName}
            </p>
          )}
        </div>

        <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${BRAND}40, transparent)` }} />

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Package className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Quantity</p>
            </div>
            <p className="text-sm font-extrabold text-gray-900">
              {fmt(quantity)} {proposal.unit || 'units'}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Price / Unit</p>
            </div>
            <p className="text-sm font-extrabold" style={{ color: BRAND_DARK }}>
              ₹{fmt(price)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Timeline</p>
            </div>
            <p className="text-xs font-bold text-gray-800">
              {timeline} Days
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Deadline</p>
            </div>
            <p className="text-xs font-bold text-gray-800 truncate">
              {fmtDate(proposal.deadlineDate || proposal.createdAt)}
            </p>
          </div>
        </div>

        {/* Total Value Banner */}
        <div className="rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between"
          style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}30` }}>
          <span className="text-xs font-bold text-gray-700">Total Proposed Value</span>
          <span className="text-base font-extrabold" style={{ color: BRAND_DARK }}>
            ₹{fmt(totalValue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-4">
          <span>Created: {fmtDateTime(proposal.createdAt)}</span>
          {proposal.updatedAt && <span>Updated: {fmtDateTime(proposal.updatedAt)}</span>}
        </div>

        {/* Action Buttons */}
        {canAccept && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              console.log('🔍 [PROPOSAL_CARD] Accept clicked for proposal:', proposal);
              onAccept(proposal.proposalId || proposal.id);
            }} disabled={accepting === (proposal.proposalId || proposal.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60"
            style={brandBtn}>
            {accepting === (proposal.proposalId || proposal.id)
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Accepting...</>
              : <><BadgeCheck className="h-4 w-4" /> Accept Proposal</>}
          </motion.button>
        )}

        {proposal.status === 'ACCEPTED' && (
          <div className="space-y-2.5">
            <div className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: BRAND_LIGHT, color: BRAND_DARK }}>
              <CheckCheck className="h-4 w-4" /> Proposal Accepted
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {canChat && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    console.log('🔍 [PROPOSAL_CARD] Open Chat clicked for proposal:', proposal);
                    onOpenChat(proposal);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-all shadow-sm"
                  style={brandBtn}>
                  <MessageCircle className="h-4 w-4" /> Open Chat
                </motion.button>
              )}

              {isOwner && typeof onMarkCompleted === 'function' && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    console.log('🔍 [PROPOSAL_CARD] Mark Complete button clicked for proposal:', proposal);
                    onMarkCompleted(proposal);
                  }}
                  disabled={completingId === (proposal.proposalId || proposal.id)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50">
                  {completingId === (proposal.proposalId || proposal.id)
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />}
                  <span>Mark Complete</span>
                </motion.button>
              )}
            </div>
          </div>
        )}

        {proposal.status === 'COMPLETED' && (
          <div className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-emerald-600 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-white" /> Deal Completed ✓
          </div>
        )}
      </div>
    </motion.div>
  );
});
// ══════════════════════════════════════════════
// BuyerSellerDashboard.jsx — PART 2 of 2
// ══════════════════════════════════════════════

// ── CreateProposalModal ──
function CreateProposalModal({ intent, onClose, onSuccess }) {
  const [form, setForm] = useState({
    quantityRequested: intent?.quantity ? String(intent.quantity) : '',
    pricePerUnit: intent?.pricePerUnit ? String(intent.pricePerUnit) : '',
    timelineDays: '30',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.quantityRequested) return setError('Quantity is required');
    if (!form.pricePerUnit) return setError('Price per unit is required');
    if (!form.timelineDays) return setError('Timeline is required');
    setLoading(true);
    try {
      await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'CREATE_PROPOSAL',
          tradeIntentId: intent.id,
          quantityRequested: Number(form.quantityRequested),
          pricePerUnit: Number(form.pricePerUnit),
          timelineDays: Number(form.timelineDays),
        }),
      });
      onSuccess?.(); onClose();
    } catch (err) { setError(err.message || 'Failed to create proposal'); }
    finally { setLoading(false); }
  };

  const estimatedTotal = (Number(form.quantityRequested) || 0) * (Number(form.pricePerUnit) || 0);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full sm:max-w-lg sm:rounded-3xl bg-white shadow-2xl overflow-hidden rounded-t-3xl max-h-[95vh] flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
        <div className="px-6 py-5 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Send Proposal</h2>
              <p className="text-sm text-white/80 truncate max-w-[280px]">{intent?.title}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Intent Details</p>
            <p className="text-xs font-bold text-gray-800">
              {intent?.intentType} · {intent?.category} · {fmt(intent?.quantity)} {intent?.unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Listed Price</p>
            <p className="text-xs font-bold" style={{ color: BRAND_DARK }}>{fmtCurrency(intent?.pricePerUnit, intent?.currency)}/unit</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantity Requested</label>
              <div className="relative">
                <input type="number" min="0" onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }} placeholder={`Max: ${fmt(intent?.quantity)} ${intent?.unit}`}
                  value={form.quantityRequested} onChange={e => update('quantityRequested', e.target.value.replace(/-/g, ''))}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-16 text-sm text-gray-800 outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; e.target.style.background = ''; }} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{intent?.unit}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Price Per Unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                <input type="number" step="0.01" min="0" onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }} placeholder={String(intent?.pricePerUnit || '')}
                  value={form.pricePerUnit} onChange={e => update('pricePerUnit', e.target.value.replace(/-/g, ''))}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-sm text-gray-800 outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; e.target.style.background = ''; }} />
              </div>
              {intent?.pricePerUnit && form.pricePerUnit && (
                <p className={`text-xs mt-1 font-medium ${Number(form.pricePerUnit) <= intent.pricePerUnit ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {Number(form.pricePerUnit) <= intent.pricePerUnit
                    ? `✓ ${((1 - Number(form.pricePerUnit) / intent.pricePerUnit) * 100).toFixed(1)}% below listed price`
                    : `↑ ${((Number(form.pricePerUnit) / intent.pricePerUnit - 1) * 100).toFixed(1)}% above listed price`}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Timeline (Days)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[7, 14, 30, 60].map(d => (
                  <button key={d} type="button" onClick={() => update('timelineDays', String(d))}
                    className="rounded-xl py-2 text-xs font-bold transition-all border"
                    style={form.timelineDays === String(d)
                      ? { background: BRAND, color: '#fff', borderColor: BRAND }
                      : { background: '#f9fafb', color: '#374151', borderColor: '#e5e7eb' }}>
                    {d}d
                  </button>
                ))}
              </div>
              <input type="number" min="0" onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }} placeholder="Custom days" value={form.timelineDays}
                onChange={e => update('timelineDays', e.target.value.replace(/-/g, ''))}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all"
                onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; e.target.style.background = ''; }} />
            </div>
            {estimatedTotal > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4" style={{ background: `${BRAND}12`, border: `1px solid ${BRAND}30` }}>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Qty × Price</span>
                    <span>{fmt(form.quantityRequested)} × ₹{fmt(form.pricePerUnit)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold" style={{ color: BRAND_DARK }}>
                    <span>Total Value</span><span>₹{fmt(estimatedTotal)}</span>
                  </div>
                  {form.timelineDays && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Deadline</span>
                      <span>{fmtDate(new Date(Date.now() + Number(form.timelineDays) * 86400000).toISOString())}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={brandBtn}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : <><Send className="h-4 w-4" /> Send Proposal</>}
            </motion.button>
            <div className="h-4" />
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── IntentDetailModal ──
function IntentDetailModal({ intent, onClose, onSendProposal, onViewProposals, isOwner }) {
  const st = STATUS_CONFIG[intent.status] || STATUS_CONFIG.OPEN;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full sm:max-w-md sm:rounded-3xl bg-white shadow-2xl overflow-hidden rounded-t-3xl max-h-[95vh] flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
        <div className="px-6 py-5 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">{intent.intentType}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${st.bg} ${st.color}`}>{st.label}</span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">{intent.title}</h2>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
          {intent.description && <p className="text-sm text-gray-600 leading-relaxed">{intent.description}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Category', value: intent.category },
              { label: 'Quantity', value: `${fmt(intent.quantity)} ${intent.unit}` },
              { label: 'Price/Unit', value: fmtCurrency(intent.pricePerUnit, intent.currency) },
              { label: 'Total', value: fmtCurrency(intent.totalValue, intent.currency) },
              { label: 'Expires', value: fmtDate(intent.expiresAt) },
              { label: 'Created', value: fmtDate(intent.createdAt) },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-0.5">Posted By</p>
            <p className="text-sm font-bold text-gray-900">{intent.createdByName}</p>
            <p className="text-xs text-gray-500">{intent.franchiseName}</p>
          </div>
          <div className="space-y-2.5 pt-1">
            {isOwner && (
              <button onClick={() => { onClose(); onViewProposals(intent); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all"
                style={brandBtn}>
                <FileText className="h-4 w-4" /> View Proposals
              </button>
            )}
            {!isOwner && intent.status === 'OPEN' && (
              <button onClick={() => { onClose(); onSendProposal(intent); }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all border-2"
                style={{ borderColor: BRAND, color: BRAND_DARK, background: BRAND_LIGHT }}>
                <Send className="h-4 w-4" /> Send Proposal
              </button>
            )}
            <button onClick={onClose}
              className="w-full rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Close
            </button>
          </div>
          <div className="h-4" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── ReceivedProposalsContent ──
export function ReceivedProposalsContent({ myIntents = [], myIntentsLoading = false, onRefreshMyIntents }) {
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [chatProposal, setChatProposal] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAllReceivedProposals = useCallback(async () => {
    setProposalsLoading(true);
    setError('');
    try {
      const myUserData = getUserData() || {};
      const myIdStr = String(
        myUserData?.id ||
        myUserData?.userId ||
        myUserData?.memberId ||
        myUserData?.member_id ||
        myUserData?.user_id ||
        myUserData?.profile?.id ||
        myUserData?.profile?.memberId ||
        ''
      ).trim().toLowerCase();

      // 1. Target intents from member intents
      let targetIntents = myIntents || [];

      if (!targetIntents || targetIntents.length === 0) {
        try {
          const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
            method: 'POST',
            body: JSON.stringify({ memberRequestType: 'FETCH_MY_INTENT' }),
          });
          const list =
            data?.myIntents?.content || data?.myIntents ||
            data?.intents?.content || data?.intents ||
            data?.content || (Array.isArray(data) ? data : []);
          if (Array.isArray(list) && list.length > 0) {
            targetIntents = list;
          }
        } catch (e) {
          console.warn('Failed to fetch my intents inside ReceivedProposalsContent:', e);
        }
      }

      // 2. Fetch BP pipeline leads to get BP leads and their intents/proposals
      let bpLeads = [];
      try {
        const pipelineData = await fetchMyPipeline();
        let rawLeads = [];
        const boardObj = pipelineData?.pipeline?.board || pipelineData?.board;
        if (boardObj && typeof boardObj === 'object' && !Array.isArray(boardObj)) {
          Object.values(boardObj).forEach(arr => {
            if (Array.isArray(arr)) rawLeads.push(...arr);
          });
        }
        if (rawLeads.length === 0) {
          rawLeads =
            pipelineData?.pipeline?.leads ||
            pipelineData?.leads ||
            pipelineData?.pipeline?.content ||
            pipelineData?.pipeline ||
            pipelineData?.content ||
            (Array.isArray(pipelineData) ? pipelineData : []);
        }
        bpLeads = Array.isArray(rawLeads) ? rawLeads : [];
      } catch (e) {
        console.warn('Failed to fetch BP pipeline leads inside ReceivedProposalsContent:', e);
      }

      // Collect intent IDs from member intents and BP leads
      const leadIntentIds = bpLeads
        .map(l => l?.tradeIntentId || l?.tradeIntent?.id || l?.intentId || l?.intent?.id)
        .filter(Boolean);

      const allIntentIds = Array.from(new Set([
        ...targetIntents.map(i => i?.id || i?.tradeIntentId || i?.intentId).filter(Boolean),
        ...leadIntentIds,
      ]));

      // 3. Fetch proposals for all trade intents
      let intentProps = [];
      if (allIntentIds.length > 0) {
        const results = await Promise.all(
          allIntentIds.map(async (intentId) => {
            try {
              const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
                method: 'POST',
                body: JSON.stringify({
                  memberRequestType: 'FETCH_PROPOSALS_FOR_INTENT',
                  tradeIntentId: Number(intentId),
                }),
              });
              const list = data?.proposals?.content || data?.proposals || data?.content || (Array.isArray(data) ? data : []);
              return Array.isArray(list) ? list : [];
            } catch (e) {
              return [];
            }
          })
        );
        intentProps = results.flat();
      }

      // 4. Fetch proposals for BP leads via FETCH_LEAD_PROPOSALS
      let leadProps = [];
      if (bpLeads.length > 0) {
        const leadResults = await Promise.all(
          bpLeads.map(async (lead) => {
            const leadId = lead?.id || lead?.leadId;
            if (!leadId) return [];

            const embedded = lead.proposals || lead.tradeProposals || [];
            let fetched = [];
            try {
              const data = await fetchLeadProposals(leadId);
              const list = data?.proposals?.content || data?.proposals || data?.content || data?.leadProposals || (Array.isArray(data) ? data : []);
              fetched = Array.isArray(list) ? list : [];
            } catch (e) { }

            return [...(Array.isArray(embedded) ? embedded : []), ...fetched];
          })
        );
        leadProps = leadResults.flat();
      }

      // 5. Fetch member proposals list
      let memberProps = [];
      try {
        const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
          method: 'POST',
          body: JSON.stringify({
            memberRequestType: 'FETCH_PROPOSALS_FOR_MEMBER',
            page: 0,
            size: 100,
          }),
        });
        const list = data?.proposals?.content || data?.proposals || data?.content || (Array.isArray(data) ? data : []);
        memberProps = Array.isArray(list) ? list : [];
      } catch (e) { }

      // Build metadata map for intents and leads
      const intentMetaMap = new Map();
      targetIntents.forEach(i => {
        const id = String(i?.id || i?.tradeIntentId || i?.intentId || '');
        if (id) {
          intentMetaMap.set(id, {
            title: i.title || i.name || i.productName,
            intentType: i.intentType || i.type,
            category: i.category,
          });
        }
      });
      bpLeads.forEach(l => {
        const id = String(l?.tradeIntentId || l?.tradeIntent?.id || l?.intentId || l?.intent?.id || '');
        const leadName = l?.companyName || l?.contactPerson || l?.leadName;
        if (id && !intentMetaMap.has(id)) {
          intentMetaMap.set(id, {
            title: l?.tradeIntent?.title || (leadName ? `Lead: ${leadName}` : 'Lead Trade Intent'),
            intentType: l?.tradeIntent?.intentType || 'BUY',
            category: l?.tradeIntent?.category || l?.category,
            leadName,
          });
        }
      });

      // Combine ALL candidates and enrich with metadata
      const targetIntentIdSet = new Set(allIntentIds.map(id => String(id)));
      const bpLeadIdSet = new Set(bpLeads.map(l => String(l?.id || l?.leadId)).filter(Boolean));
      const directReceivedPropIds = new Set([
        ...intentProps.map(ip => String(ip?.proposalId || ip?.id || ip?.tradeProposalId || '')).filter(Boolean),
        ...leadProps.map(lp => String(lp?.proposalId || lp?.id || lp?.tradeProposalId || '')).filter(Boolean),
      ]);

      const combined = [...intentProps, ...leadProps, ...memberProps];
      const map = new Map();
      combined.forEach((p) => {
        const id = String(p.proposalId || p.id || p.tradeProposalId || '');
        if (!id) return;

        const pProposerId = String(
          p.proposerId || p.proposerMemberId || p.proposerUserId || p.userId || p.createdBy || ''
        ).trim().toLowerCase();

        const pIntentId = String(p.tradeIntentId || p.intentId || '');
        const pLeadId = String(p.leadId || p.lead_id || '');
        const pIntentOwnerId = String(
          p.intentOwnerId || p.receiverId || p.memberId || p.ownerId || p.businessPartnerId || ''
        ).trim().toLowerCase();

        if (!map.has(id)) {
          const isDirectReceived = directReceivedPropIds.has(id);
          const isTargetIntent = pIntentId && targetIntentIdSet.has(pIntentId);
          const isTargetLead = pLeadId && bpLeadIdSet.has(pLeadId);
          const isMeOwner = Boolean(myIdStr && pIntentOwnerId && pIntentOwnerId === myIdStr);
          const isNotMeProposer = Boolean(myIdStr && pProposerId ? pProposerId !== myIdStr : true);

          const meta = intentMetaMap.get(pIntentId) || {};
          const enrichedP = {
            ...p,
            intentTitle: p.intentTitle || p.tradeIntentTitle || p.title || p.productName || p.tradeIntent?.title || p.intent?.title || meta.title,
            intentType: p.intentType || p.tradeIntentType || p.type || p.intent?.intentType || meta.intentType,
            category: p.category || p.tradeIntentCategory || p.intent?.category || meta.category,
            leadName: p.leadName || meta.leadName,
          };

          if (
            isDirectReceived ||
            isTargetIntent ||
            isTargetLead ||
            isMeOwner ||
            (isNotMeProposer && (isTargetIntent || isTargetLead || isMeOwner || !pProposerId))
          ) {
            map.set(id, enrichedP);
          } else if (!myIdStr && (isDirectReceived || isTargetIntent || isTargetLead)) {
            map.set(id, enrichedP);
          }
        }
      });

      setProposals(Array.from(map.values()));
    } catch (err) {
      setError(err.message || 'Failed to load received proposals');
    } finally {
      setProposalsLoading(false);
    }
  }, [myIntents]);

  useEffect(() => {
    fetchAllReceivedProposals();
  }, [fetchAllReceivedProposals]);

  const handleAccept = async (proposalId) => {
    setAccepting(proposalId);
    setError('');
    try {
      await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'ACCEPT_TRADE_PROPOSAL',
          tradeProposalId: String(proposalId),
        }),
      });
      setSuccessMsg('✓ Proposal accepted! You can now chat with the proposer.');
      await fetchAllReceivedProposals();
    } catch (err) {
      try {
        await authenticatedFetch(`${BASE_URL}/cs-network/business-partner`, {
          method: 'POST',
          body: JSON.stringify({
            businessPartnerRequestType: 'ACCEPT_TRADE_PROPOSAL',
            tradeProposalId: Number(proposalId),
            proposalId: Number(proposalId),
          }),
        });
        setSuccessMsg('✓ Proposal accepted! You can now chat with the proposer.');
        await fetchAllReceivedProposals();
      } catch (err2) {
        setError(err.message || err2.message || 'Failed to accept proposal');
      }
    } finally {
      setAccepting(null);
    }
  };

  const handleMarkProposalCompleted = async (prop) => {
    setCompletingId(prop.proposalId || prop.id);
    setError('');

    let inboxDealId = null;
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'FETCH_INBOX');
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      const data = await res.json();
      const convs = data?.conversations || [];
      const match = convs.find(c => {
        if (prop.conversationId && String(c.conversationId) === String(prop.conversationId)) return true;
        if (prop.tradeIntentId && String(c.tradeIntentId || c.intentId) === String(prop.tradeIntentId)) return true;
        return false;
      }) || convs[0];
      if (match?.dealId) inboxDealId = match.dealId;
    } catch (e) { }

    const candidateIds = Array.from(new Set([
      inboxDealId,
      prop.dealId,
      prop.tradeDealId,
      prop.deal_id,
      prop.tradeIntentId,
      prop.intentId,
      prop.tradeProposalId,
      prop.proposalId,
      prop.id,
    ].filter(Boolean)));

    if (candidateIds.length === 0) {
      setError('Unable to mark complete: Proposal or Deal ID is missing.');
      setCompletingId(null);
      return;
    }

    let lastError = null;
    let succeeded = false;

    for (const candidateId of candidateIds) {
      try {
        const payload = {
          memberRequestType: 'MARK_DEAL_COMPLETED',
          dealId: Number(candidateId),
        };

        const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSuccessMsg(data?.message || '✓ Deal marked as completed! Commission ledger generated.');
        succeeded = true;
        await fetchAllReceivedProposals();
        break;
      } catch (err) {
        console.warn(`MARK_DEAL_COMPLETED failed with candidate dealId=${candidateId}:`, err);
        lastError = err;
      }
    }

    if (!succeeded && lastError) {
      setError(lastError.message || 'Failed to mark deal completed');
    }

    setCompletingId(null);
  };

  const filteredProposals = proposals.filter(p => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const pendingCount = proposals.filter(p => p.status === 'PENDING').length;
  const acceptedCount = proposals.filter(p => p.status === 'ACCEPTED').length;

  return (
    <>
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700 flex-1">{successMsg}</p>
            <button onClick={() => setSuccessMsg('')}><X className="h-4 w-4 text-emerald-500" /></button>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-600 flex-1">{error}</p>
            <button onClick={() => setError('')}><X className="h-4 w-4 text-red-500" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'].map(status => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={statusFilter === status
                ? { background: BRAND, color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` }
                : { border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.35)', color: '#374151' }}>
              {status}
            </button>
          ))}
        </div>
        <button onClick={() => { onRefreshMyIntents?.(); fetchAllReceivedProposals(); }}
          className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Received" value={proposals.length} delay={0.05} />
        <StatCard icon={Clock} label="Pending Approval" value={pendingCount} delay={0.1} accent="#f59e0b" />
        <StatCard icon={CheckCheck} label="Accepted" value={acceptedCount} delay={0.15} accent="#10b981" />
        <StatCard icon={Award} label="Completed" value={proposals.filter(p => p.status === 'COMPLETED').length} delay={0.2} accent="#6366f1" />
      </div>

      {proposalsLoading || myIntentsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
          <p className="text-sm text-gray-700 font-medium">Loading received proposals...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
            <Inbox className="h-10 w-10 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 mb-1">No received proposals</p>
            <p className="text-sm text-gray-700 max-w-sm">
              {statusFilter === 'ALL'
                ? 'When other members submit trade proposals to your intents for approval, they will appear here.'
                : `No ${statusFilter.toLowerCase()} proposals found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProposals.map(proposal => (
              <ProposalCard key={proposal.proposalId || proposal.id} proposal={proposal}
                onAccept={handleAccept} isOwner={true} accepting={accepting}
                onOpenChat={setChatProposal}
                onMarkCompleted={handleMarkProposalCompleted}
                completingId={completingId} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {chatProposal?.conversationId && (
          <TradeChatScreen conversationId={chatProposal.conversationId}
            title={`Trade #${chatProposal.tradeIntentId}`}
            otherPartyName={chatProposal.proposerName || 'Trader'}
            otherPartyId={chatProposal.proposerId || chatProposal.proposerMemberId || chatProposal.memberId}
            dealId={chatProposal.dealId || chatProposal.tradeProposalId || chatProposal.proposalId}
            isOwner={true}
            onClose={() => setChatProposal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── SentProposalsContent ──
export function SentProposalsContent() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [chatProposal, setChatProposal] = useState(null);

  const fetchMyProposals = useCallback(async (pg = 0, status = statusFilter) => {
    setLoading(true); setError('');
    try {
      const myUserData = getUserData() || {};
      const myIdStr = String(
        myUserData?.id ||
        myUserData?.userId ||
        myUserData?.memberId ||
        myUserData?.member_id ||
        myUserData?.user_id ||
        myUserData?.profile?.id ||
        myUserData?.profile?.memberId ||
        ''
      ).trim().toLowerCase();

      const body = {
        memberRequestType: 'FETCH_PROPOSALS_FOR_MEMBER',
        page: pg, size: 20, sortBy: 'createdAt', sortDirection: 'desc',
      };
      if (status !== 'ALL') body.proposalStatus = status;

      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST', body: JSON.stringify(body),
      });

      const list = data?.proposals?.content || data?.proposals || data?.content || (Array.isArray(data) ? data : []);
      const rawList = Array.isArray(list) ? list : [];

      // Filter sent proposals (where proposer is the current logged in user)
      const filteredSent = rawList.filter(p => {
        const pProposerId = String(p.proposerId || p.proposerMemberId || p.proposerUserId || p.userId || p.createdBy || '').trim().toLowerCase();
        if (myIdStr && pProposerId) {
          return pProposerId === myIdStr;
        }
        return true;
      });

      // Fetch intent details for sent proposals if title is missing
      const intentIds = Array.from(new Set(filteredSent.map(p => p.tradeIntentId || p.intentId).filter(Boolean)));
      const intentMetaMap = new Map();

      if (intentIds.length > 0) {
        await Promise.all(
          intentIds.map(async (intentId) => {
            try {
              const res = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
                method: 'POST',
                body: JSON.stringify({
                  memberRequestType: 'FETCH_INTENT',
                  tradeIntentId: Number(intentId),
                  intentId: Number(intentId),
                }),
              });
              const item = res?.tradeIntent || res?.intent || res;
              if (item && (item.title || item.name)) {
                intentMetaMap.set(String(intentId), {
                  title: item.title || item.name || item.productName,
                  intentType: item.intentType || item.type,
                  category: item.category,
                });
              }
            } catch (e) { }
          })
        );
      }

      const enrichedSent = filteredSent.map(p => {
        const meta = intentMetaMap.get(String(p.tradeIntentId || p.intentId || '')) || {};
        return {
          ...p,
          intentTitle: p.intentTitle || p.tradeIntentTitle || p.title || p.productName || meta.title,
          intentType: p.intentType || p.tradeIntentType || p.type || meta.intentType,
          category: p.category || p.tradeIntentCategory || meta.category,
        };
      });

      setProposals(enrichedSent);
      setTotalPages(data?.totalPages || 1);
      setTotalRecords(enrichedSent.length);
    } catch (err) { setError(err.message || 'Failed to load your proposals'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchMyProposals(page, statusFilter); }, [page, statusFilter, fetchMyProposals]);

  const pagePendingCount = proposals.filter(p => p.status === 'PENDING').length;
  const pageAcceptedCount = proposals.filter(p => p.status === 'ACCEPTED').length;
  const pageRejectedCount = proposals.filter(p => p.status === 'REJECTED').length;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
            <button key={status} onClick={() => { setStatusFilter(status); setPage(0); }}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={statusFilter === status
                ? { background: BRAND, color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` }
                : { border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.35)', color: '#374151' }}>
              {status}
            </button>
          ))}
        </div>
        <button onClick={() => fetchMyProposals(page, statusFilter)}
          className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Records" value={totalRecords} delay={0.05} />
        <StatCard icon={Clock} label="Pending" value={pagePendingCount} delay={0.1} accent="#f59e0b" />
        <StatCard icon={CheckCheck} label="Accepted" value={pageAcceptedCount} delay={0.15} accent="#10b981" />
        <StatCard icon={X} label="Rejected" value={pageRejectedCount} delay={0.2} accent="#ef4444" />
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
          <p className="text-sm text-gray-700 font-medium">Loading your proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
            <Send className="h-10 w-10 text-gray-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 mb-1">No proposals found</p>
            <p className="text-sm text-gray-700">
              {statusFilter === 'ALL' ? 'You have not sent any proposals yet.' : `No ${statusFilter.toLowerCase()} proposals found.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {proposals.map(proposal => (
                <ProposalCard key={proposal.proposalId} proposal={proposal}
                  onAccept={() => { }} isOwner={false} accepting={null}
                  onOpenChat={setChatProposal} />
              ))}
            </AnimatePresence>
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-gray-800">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {chatProposal?.conversationId && (
          <TradeChatScreen conversationId={chatProposal.conversationId}
            title={`Trade #${chatProposal.tradeIntentId}`}
            otherPartyName={chatProposal.intentOwnerName || chatProposal.createdByName || chatProposal.receiverName || chatProposal.proposerName || `Intent #${chatProposal.tradeIntentId}`}
            otherPartyId={chatProposal.intentOwnerId || chatProposal.createdById || chatProposal.receiverId}
            dealId={chatProposal.dealId || chatProposal.tradeDealId || chatProposal.tradeProposalId || chatProposal.proposalId || chatProposal.tradeIntentId}
            tradeProposalId={chatProposal.tradeProposalId || chatProposal.proposalId || chatProposal.id}
            tradeIntentId={chatProposal.tradeIntentId}
            isOwner={false}
            onClose={() => setChatProposal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── ProposalsTab ──
export function ProposalsTab({ myIntents, myIntentsLoading, onRefreshMyIntents }) {
  const [subTab, setSubTab] = useState('received');

  return (
    <motion.div key="proposals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5">
        <h2 className="text-base font-extrabold text-gray-900">Proposals</h2>
        <p className="text-sm text-gray-600">Manage all your sent and received trade proposals</p>
      </div>

      <div className="mb-6">
        <div className="inline-flex rounded-2xl p-1.5 gap-1"
          style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
          {[
            { id: 'received', label: 'Received', icon: Inbox, desc: 'On your intents' },
            { id: 'sent', label: 'Sent', icon: Send, desc: "To others' intents" },
          ].map(tab => {
            const active = subTab === tab.id;
            return (
              <motion.button key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => setSubTab(tab.id)}
                className="relative flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`, color: '#fff', boxShadow: `0 4px 14px ${BRAND}55` }
                  : { background: 'transparent', color: '#6b7280' }}>
                <tab.icon className="h-4 w-4" />
                <div className="text-left">
                  <p className="leading-none">{tab.label}</p>
                  <p className="text-[10px] font-medium mt-0.5 leading-none"
                    style={{ color: active ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>
                    {tab.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'received' ? (
          <motion.div key="received"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.22 }}>
            <ReceivedProposalsContent myIntents={myIntents} myIntentsLoading={myIntentsLoading}
              onRefreshMyIntents={onRefreshMyIntents} />
          </motion.div>
        ) : (
          <motion.div key="sent"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}>
            <SentProposalsContent />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── FilterPanel ──
function FilterPanel({ filters, onChange, onReset, onApply }) {
  const iF = e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 2px ${BRAND}40`; };
  const bF = e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; };
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="mb-5 rounded-2xl border border-white/60 bg-white/35 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" style={{ color: BRAND_DARK }} />
          <p className="text-sm font-bold text-gray-800">Advanced Filters</p>
        </div>
        <button onClick={onReset} className="text-xs font-semibold text-red-500 hover:text-red-700">Reset All</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Country', key: 'country', options: COUNTRIES },
          { label: 'Sector', key: 'businessSector', options: BUSINESS_SECTORS },
        ].map(f => (
          <div key={f.key} className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
            <div className="relative">
              <select value={filters[f.key]} onChange={e => onChange(f.key, e.target.value)} onFocus={iF} onBlur={bF}
                className="w-full appearance-none rounded-xl border border-white/70 bg-white/40 px-3 py-2 pr-8 text-xs text-gray-800 outline-none transition-all">
                <option value="">All</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ))}
        {[
          { label: 'Keyword', key: 'search', placeholder: 'e.g. Rice' },
          { label: 'Min Price', key: 'minPrice', placeholder: 'e.g. 100', type: 'number' },
          { label: 'Max Price', key: 'maxPrice', placeholder: 'e.g. 500', type: 'number' },
          { label: 'Timeline (days)', key: 'timelineDays', placeholder: 'e.g. 7', type: 'number' },
        ].map(f => (
          <div key={f.key} className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</label>
            <input type={f.type || 'text'} placeholder={f.placeholder} value={filters[f.key]}
              onChange={e => onChange(f.key, e.target.value)} onFocus={iF} onBlur={bF}
              className="w-full rounded-xl border border-white/70 bg-white/40 px-3 py-2 text-xs text-gray-800 outline-none transition-all" />
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Sort By</label>
          <div className="relative">
            <select value={filters.sortBy} onChange={e => onChange('sortBy', e.target.value)} onFocus={iF} onBlur={bF}
              className="w-full appearance-none rounded-xl border border-white/70 bg-white/40 px-3 py-2 pr-8 text-xs text-gray-800 outline-none transition-all">
              <option value="pricePerUnit">Price Per Unit</option>
              <option value="quantity">Quantity</option>
              <option value="totalValue">Total Value</option>
              <option value="createdAt">Created Date</option>
              <option value="expiresAt">Expiry Date</option>
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Direction</label>
          <div className="flex gap-2">
            {['asc', 'desc'].map(dir => (
              <button key={dir} type="button" onClick={() => onChange('sortDirection', dir)}
                className="flex-1 rounded-xl border py-2 text-xs font-bold transition-all"
                style={filters.sortDirection === dir
                  ? { borderColor: BRAND, background: BRAND, color: '#fff' }
                  : { borderColor: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.4)', color: '#374151' }}>
                {dir === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onApply} className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all" style={brandBtn}>
        Apply Filters
      </button>
    </motion.div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/35 backdrop-blur px-3 py-1 text-xs font-semibold"
      style={{ color: BRAND_DARK }}>
      {label}
      <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-white/50"><X className="h-3 w-3" /></button>
    </span>
  );
}

function ModalInput({ label, onChange, type, min, onKeyDown, ...props }) {
  const minVal = min || (type === 'date' ? getTodayDateString() : type === 'datetime-local' ? getNowDateTimeString() : (type === 'number' ? '0' : undefined));
  const handleKeyDown = (e) => {
    if (type === 'number' && ['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
    if (onKeyDown) onKeyDown(e);
  };
  const handleChange = (valOrEvt) => {
    let val = typeof valOrEvt === 'object' && valOrEvt?.target ? valOrEvt.target.value : valOrEvt;
    if (type === 'number' && typeof val === 'string') {
      val = val.replace(/-/g, '');
    }
    onChange(val);
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} min={minVal} onKeyDown={handleKeyDown} {...props} onChange={handleChange}
        className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all"
        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; }}
        onBlur={e => { e.target.style.borderColor = ''; e.target.style.background = ''; e.target.style.boxShadow = ''; }}
      />
    </div>
  );
}

function ModalSelect({ label, options, onChange, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <select {...props} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-800 outline-none transition-all"
          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.background = ''; e.target.style.boxShadow = ''; }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}

// ── CreateIntentModal ──
function CreateIntentModal({ roles, onClose, onSuccess }) {
  const canBuy = roles.includes('BUYER');
  const canSell = roles.includes('SELLER');
  const [form, setForm] = useState({
    intentType: canBuy ? 'BUY' : 'SELL',
    category: 'Wheat', title: '', description: '',
    quantity: '', unit: 'KG', pricePerUnit: '', currency: 'INR', expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.quantity) return setError('Quantity is required');
    if (!form.pricePerUnit) return setError('Price per unit is required');
    if (!form.expiresAt) return setError('Expiry date is required');
    setLoading(true);
    try {
      await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST',
        body: JSON.stringify({
          memberRequestType: 'CREATE_INTENT', franchiseId: 2,
          intentType: form.intentType, category: form.category,
          title: form.title, description: form.description,
          quantity: Number(form.quantity), unit: form.unit,
          pricePerUnit: Number(form.pricePerUnit), currency: form.currency,
          expiresAt: new Date(form.expiresAt).toISOString(),
        }),
      });
      onSuccess?.(); onClose();
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const availableTypes = [];
  if (canBuy) availableTypes.push('BUY');
  if (canSell) availableTypes.push('SELL');
  if (!availableTypes.length) availableTypes.push('BUY', 'SELL');

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative z-10 w-full sm:max-w-lg sm:rounded-3xl bg-white shadow-2xl overflow-hidden rounded-t-3xl max-h-[95vh] flex flex-col"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
        <div className="px-6 py-5 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)` }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Create Trade Intent</h2>
              <p className="text-sm text-white/80">{form.intentType === 'BUY' ? 'Buy Request' : 'Sell Offer'}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Intent Type</label>
              {availableTypes.length === 1 ? (
                <div className="rounded-xl border-2 py-3 text-center text-sm font-bold"
                  style={{ borderColor: BRAND, background: BRAND_LIGHT, color: BRAND_DARK }}>{form.intentType}</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableTypes.map(type => {
                    const sel = form.intentType === type;
                    return (
                      <motion.button key={type} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => update('intentType', type)}
                        className="relative rounded-xl border-2 py-4 text-sm font-bold transition-all flex flex-col items-center gap-1.5"
                        style={sel
                          ? { borderColor: BRAND, background: BRAND_LIGHT, color: BRAND_DARK, boxShadow: `0 4px 14px ${BRAND}44` }
                          : { borderColor: '#e5e7eb', background: '#f9fafb', color: '#6b7280' }}>
                        {type}
                        {sel && <motion.div layoutId="intent-type-dot" className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full" style={{ background: BRAND }} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
            <ModalSelect label="Category" value={form.category} onChange={v => update('category', v)}
              options={CATEGORIES.map(c => ({ label: c, value: c }))} />
            <ModalInput label="Title" placeholder="e.g. BUY Premium Wheat" value={form.title} onChange={v => update('title', v)} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea rows={3} placeholder="Describe your trade intent..." value={form.description}
                onChange={e => update('description', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-all resize-none"
                onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = '#fff'; e.target.style.boxShadow = `0 0 0 3px ${BRAND}30`; }}
                onBlur={e => { e.target.style.borderColor = ''; e.target.style.background = ''; e.target.style.boxShadow = ''; }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ModalInput label="Quantity" type="number" placeholder="e.g. 5000" value={form.quantity} onChange={v => update('quantity', v)} />
              <ModalSelect label="Unit" value={form.unit} onChange={v => update('unit', v)} options={UNITS.map(u => ({ label: u, value: u }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ModalInput label="Price per Unit" type="number" placeholder="e.g. 46" value={form.pricePerUnit} onChange={v => update('pricePerUnit', v)} />
              <ModalSelect label="Currency" value={form.currency} onChange={v => update('currency', v)}
                options={[
                  { label: 'INR ₹', value: 'INR' }, { label: 'USD $', value: 'USD' },
                  { label: 'AED د.إ', value: 'AED' }, { label: 'EUR €', value: 'EUR' },
                ]} />
            </div>
            <ModalInput label="Expires At" type="datetime-local" value={form.expiresAt} onChange={v => update('expiresAt', v)} />
            {(form.quantity || form.pricePerUnit) && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Estimated Total</span>
                <span className="text-sm font-bold text-gray-900">
                  {fmtCurrency((Number(form.quantity) || 0) * (Number(form.pricePerUnit) || 0), form.currency)}
                </span>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={brandBtn}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
                : `Create ${form.intentType} Intent`}
            </motion.button>
            <div className="h-4" />
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

const DEFAULT_FILTERS = {
  country: '', businessSector: '', search: '',
  minPrice: '', maxPrice: '', timelineDays: '',
  sortBy: 'pricePerUnit', sortDirection: 'asc',
};

// ══════════════════════════════════════════════
// Main Dashboard
// ══════════════════════════════════════════════
export default function BuyerSellerDashboard({ roles = [], onLogout }) {
  const isBuyer = roles.includes('BUYER');
  const isSeller = roles.includes('SELLER');
  const isBoth = isBuyer && isSeller;
  const defaultFilterType = isBoth ? 'ALL' : isBuyer ? 'SELL' : 'BUY';

  const [activeTab, setActiveTab] = useState('market');
  const [intents, setIntents] = useState([]);
  const [myIntents, setMyIntents] = useState([]);
  const [myIntentIds, setMyIntentIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [myLoading, setMyLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [filterType, setFilterType] = useState(defaultFilterType);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [notifications] = useState(3);
  const [proposalTargetIntent, setProposalTargetIntent] = useState(null);
  const [viewProposalsIntent, setViewProposalsIntent] = useState(null);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserData() || {});

  useEffect(() => {
    fetchMyProfile()
      .then((res) => {
        if (res?.profile) {
          setUserProfile((prev) => ({ ...prev, ...res.profile }));
        }
      })
      .catch((err) => {
        console.warn('Auto fetchMyProfile failed:', err);
      });
  }, []);

  const handleProfileUpdated = (updated) => {
    if (updated) {
      setUserProfile((prev) => ({ ...prev, ...updated }));
    }
  };

  const user = userProfile;
  const roleBadge = isBoth
    ? { label: 'Buyer & Seller', bg: `linear-gradient(135deg, ${BUYER_COLOR}, ${SELLER_COLOR})`, color: '#fff' }
    : isBuyer
      ? { label: 'Buyer', bg: `linear-gradient(135deg, ${BUYER_COLOR}, #2563eb)`, color: '#fff' }
      : { label: 'Seller', bg: `linear-gradient(135deg, ${SELLER_COLOR}, #ea580c)`, color: '#fff' };

  const activeFilterCount = Object.entries(appliedFilters).filter(([k, v]) => {
    if (k === 'sortBy' && v === 'pricePerUnit') return false;
    if (k === 'sortDirection' && v === 'asc') return false;
    return v !== '';
  }).length;

  const buildFetchBody = useCallback((pg, af, ft) => {
    const body = {
      memberRequestType: 'FETCH_INTENT',
      page: pg, size: 10, sortBy: af.sortBy, sortDirection: af.sortDirection,
    };
    if (ft !== 'ALL') body.intentType = ft;
    if (af.country) body.country = af.country;
    if (af.businessSector) body.businessSector = af.businessSector;
    if (af.search) body.search = af.search;
    if (af.minPrice !== '') body.minPrice = Number(af.minPrice);
    if (af.maxPrice !== '') body.maxPrice = Number(af.maxPrice);
    if (af.timelineDays !== '') body.timelineDays = Number(af.timelineDays);
    return body;
  }, []);

  const fetchIntents = useCallback(async (pg = 0, af = appliedFilters, ft = filterType) => {
    setLoading(true); setError('');
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST', body: JSON.stringify(buildFetchBody(pg, af, ft)),
      });
      setIntents(data?.intents?.content || []);
      setTotalPages(data?.intents?.totalPages || 1);
    } catch (err) { setError(err.message || 'Failed to load market intents'); }
    finally { setLoading(false); }
  }, [appliedFilters, filterType, buildFetchBody]);

  const fetchMyIntents = useCallback(async () => {
    setMyLoading(true);
    try {
      const data = await authenticatedFetch(`${BASE_URL}/cs-network/member`, {
        method: 'POST', body: JSON.stringify({ memberRequestType: 'FETCH_MY_INTENT' }),
      });
      const list =
        data?.myIntents?.content || data?.myIntents ||
        data?.intents?.content || data?.intents ||
        data?.content || (Array.isArray(data) ? data : []);
      setMyIntents(list);
      setMyIntentIds(new Set(list.map(i => i.id)));
    } catch (err) { console.error('fetchMyIntents error:', err); }
    finally { setMyLoading(false); }
  }, []);

  const fetchInboxUnread = useCallback(async () => {
    try {
      const fd = new FormData();
      fd.append('chatRequestType', 'FETCH_INBOX');
      const res = await chatFetch(`${BASE_URL}/cs-network/chat-operations`, fd);
      if (!res.ok) return;
      const data = await res.json();
      const total = (data?.conversations || []).reduce((s, c) => s + (c.unreadCount || 0), 0);
      setInboxUnread(total);
    } catch { }
  }, []);

  useEffect(() => { fetchIntents(page, appliedFilters, filterType); }, [page, appliedFilters, filterType]);
  useEffect(() => { fetchMyIntents(); fetchInboxUnread(); }, []);
  useEffect(() => {
    if (activeTab === 'my_intents' || activeTab === 'proposals') fetchMyIntents();
    if (activeTab === 'inbox') setInboxUnread(0);
  }, [activeTab]);

  const handleFilterChange = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const handleApplyFilters = () => { setAppliedFilters({ ...filters }); setPage(0); setShowFilters(false); };
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS);
    setPage(0); setShowFilters(false);
  };

  const totalValue = intents.reduce((s, i) => s + (i.totalValue || 0), 0);
  const openCount = intents.filter(i => i.status === 'OPEN').length;
  const buyCount = intents.filter(i => i.intentType === 'BUY').length;
  const sellCount = intents.filter(i => i.intentType === 'SELL').length;

  const marketStats = isBoth
    ? [
      { icon: TrendingUp, label: 'Total Market Value', value: fmtCurrency(totalValue), delay: 0.05 },
      { icon: CheckCircle2, label: 'Open Intents', value: openCount, delay: 0.10 },
      { icon: ShoppingCart, label: 'Buy Intents', value: buyCount, delay: 0.15, accent: BUYER_COLOR },
      { icon: Store, label: 'Sell Intents', value: sellCount, delay: 0.20, accent: SELLER_COLOR },
    ]
    : isBuyer
      ? [
        { icon: TrendingUp, label: 'Total Market Value', value: fmtCurrency(totalValue), delay: 0.05 },
        { icon: CheckCircle2, label: 'Open Intents', value: openCount, delay: 0.10 },
        { icon: ShoppingCart, label: 'Buy Intents', value: buyCount, delay: 0.15, accent: BUYER_COLOR },
      ]
      : [
        { icon: TrendingUp, label: 'Total Market Value', value: fmtCurrency(totalValue), delay: 0.05 },
        { icon: CheckCircle2, label: 'Open Intents', value: openCount, delay: 0.10 },
        { icon: Store, label: 'Sell Intents', value: sellCount, delay: 0.15, accent: SELLER_COLOR },
      ];

  const NAV_ITEMS = [
    { id: 'market', label: 'Market', icon: BarChart3, badge: 0 },
    { id: 'leaderboard', label: 'Leaderboards', icon: Award, badge: 0 },
    { id: 'my_intents', label: 'My Intents', icon: Package, badge: 0 },
    { id: 'proposals', label: 'Proposals', icon: FileText, badge: 0 },
    { id: 'deals', label: 'Deals', icon: CheckCheck, badge: 0 },
    { id: 'directory', label: 'Directory', icon: Users, badge: 0 },
    { id: 'events', label: 'Events', icon: Calendar, badge: 0 },
    { id: 'my_registrations', label: 'My Tickets', icon: Ticket, badge: 0 },
    { id: 'meetings', label: 'Meetings', icon: Video, badge: 0 },
    { id: 'partnerships', label: 'Partnerships', icon: Building2, badge: 0 },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: inboxUnread },
  ];


  const isOwnerOfSelected = selectedIntent ? myIntentIds.has(selectedIntent.id) : false;

  return (
    <>
      <WindOpsShell
        appName="Connect Souq" navItems={NAV_ITEMS}
        activeTab={activeTab} setActiveTab={setActiveTab}
        searchValue={filters.search}
        onSearchChange={v => {
          handleFilterChange('search', v);
          setAppliedFilters(p => ({ ...p, search: v }));
          setPage(0);
        }}
        userInitial={(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
        userPhotoUrl={user.profilePhotoUrl || user.profilePicture}
        userFullName={user.fullName || 'Member'}
        userEmail={user.email || ''}
        onOpenProfile={() => setProfileModalOpen(true)}
        notifications={notifications}
        onNewIntent={() => setShowCreate(true)}
        onLogout={onLogout}
      >
        {/* Welcome Banner */}
        <div className="mb-6 rounded-2xl border border-white/60 backdrop-blur-md p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          style={{ background: `linear-gradient(135deg, ${BRAND}55 0%, ${BRAND_LIGHT} 100%)` }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-gray-700 font-semibold">Welcome back,</p>
                <span className="rounded-full px-3 py-0.5 text-[11px] font-bold"
                  style={{ background: roleBadge.bg, color: roleBadge.color }}>
                  {roleBadge.label}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900">{user.fullName || 'Trader'}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isBoth
                  ? 'Browse buy & sell intents and manage your trade portfolio'
                  : isBuyer
                    ? 'Browse buy intents and find sellers for your needs'
                    : 'Post sell intents and connect with buyers worldwide'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition"
                style={brandBtn}>
                <Plus className="h-4 w-4" /> New Intent
              </button>
              <button onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/40 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-white/55 transition">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ══ MARKET TAB ══ */}
        {activeTab === 'market' && (
          <>
            <div className={`mb-6 grid grid-cols-1 sm:grid-cols-2 ${isBoth ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
              {marketStats.map(s => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} delay={s.delay} accent={s.accent} />
              ))}
            </div>

            <motion.div key="market" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {isBoth && ['ALL', 'BUY', 'SELL'].map(type => (
                  <button key={type} onClick={() => { setFilterType(type); setPage(0); }}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
                    style={filterType === type
                      ? {
                        background: type === 'BUY' ? BUYER_COLOR : type === 'SELL' ? SELLER_COLOR : BRAND,
                        color: '#fff', boxShadow: `0 4px 14px ${BRAND}55`
                      }
                      : { border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', color: '#374151' }}>
                    {type}
                  </button>
                ))}
                <button onClick={() => setShowFilters(v => !v)}
                  className="relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
                  style={showFilters || activeFilterCount > 0
                    ? { borderColor: BRAND, background: `${BRAND}18`, color: BRAND_DARK }
                    : { borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', color: '#374151' }}>
                  <Filter className="h-4 w-4" /> Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: BRAND }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button onClick={() => fetchIntents(page)}
                  className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2.5 text-gray-700 hover:bg-white/50 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <FilterPanel filters={filters} onChange={handleFilterChange}
                    onReset={handleResetFilters} onApply={handleApplyFilters} />
                )}
              </AnimatePresence>

              {activeFilterCount > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {appliedFilters.country && <FilterChip label={`Country: ${appliedFilters.country}`} onRemove={() => { setFilters(p => ({ ...p, country: '' })); setAppliedFilters(p => ({ ...p, country: '' })); }} />}
                  {appliedFilters.businessSector && <FilterChip label={`Sector: ${appliedFilters.businessSector}`} onRemove={() => { setFilters(p => ({ ...p, businessSector: '' })); setAppliedFilters(p => ({ ...p, businessSector: '' })); }} />}
                  {appliedFilters.minPrice !== '' && <FilterChip label={`Min ₹${appliedFilters.minPrice}`} onRemove={() => { setFilters(p => ({ ...p, minPrice: '' })); setAppliedFilters(p => ({ ...p, minPrice: '' })); }} />}
                  {appliedFilters.maxPrice !== '' && <FilterChip label={`Max ₹${appliedFilters.maxPrice}`} onRemove={() => { setFilters(p => ({ ...p, maxPrice: '' })); setAppliedFilters(p => ({ ...p, maxPrice: '' })); }} />}
                  {appliedFilters.timelineDays !== '' && <FilterChip label={`${appliedFilters.timelineDays} days`} onRemove={() => { setFilters(p => ({ ...p, timelineDays: '' })); setAppliedFilters(p => ({ ...p, timelineDays: '' })); }} />}
                  <button onClick={handleResetFilters} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                    Clear all
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
                  <p className="text-sm text-gray-700 font-medium">Loading market data...</p>
                </div>
              ) : intents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
                    <Package className="h-10 w-10 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 mb-1">No intents found</p>
                    <p className="text-sm text-gray-700">
                      {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Be the first to post a trade intent.'}
                    </p>
                  </div>
                  {activeFilterCount > 0 ? (
                    <button onClick={handleResetFilters}
                      className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/35 backdrop-blur px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-white/50">
                      <X className="h-4 w-4" /> Clear Filters
                    </button>
                  ) : (
                    <button onClick={() => setShowCreate(true)}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={brandBtn}>
                      <Plus className="h-4 w-4" /> Create Intent
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {intents.map(intent => (
                        <IntentCard key={intent.id} intent={intent}
                          onView={setSelectedIntent}
                          onSendProposal={setProposalTargetIntent}
                          isOwn={myIntentIds.has(intent.id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                        className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-800">Page {page + 1} of {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                        className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 disabled:opacity-40 hover:bg-white/50 transition">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}

        {/* ══ MY INTENTS TAB ══ */}
        {activeTab === 'my_intents' && (
          <motion.div key="my_intents" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">My Trade Intents</h2>
                <p className="text-sm text-gray-700">Intents you have created</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchMyIntents}
                  className="rounded-xl border border-white/60 bg-white/35 backdrop-blur p-2 text-gray-800 hover:bg-white/50 transition">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white" style={brandBtn}>
                  <Plus className="h-4 w-4" /> New
                </button>
              </div>
            </div>
            {myLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_DARK }} />
                <p className="text-sm text-gray-700">Loading your intents...</p>
              </div>
            ) : myIntents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="rounded-2xl border border-white/60 bg-white/35 backdrop-blur p-6">
                  <Package className="h-10 w-10 text-gray-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 mb-1">No intents yet</p>
                  <p className="text-sm text-gray-700">Create your first trade intent to get started</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={brandBtn}>
                  <Plus className="h-4 w-4" /> Create Intent
                </button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {myIntents.map(intent => (
                    <IntentCard key={intent.id} intent={intent}
                      onView={i => setSelectedIntent(i)}
                      onSendProposal={null} isOwn={true} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ LEADERBOARD TAB ══ */}
        {activeTab === 'leaderboard' && (
          <TrustLeaderboardTab userRole={isBoth ? 'MEMBER' : isBuyer ? 'BUYER' : 'SELLER'} />
        )}

        {/* ══ PROPOSALS TAB ══ */}

        {activeTab === 'proposals' && (
          <ProposalsTab
            myIntents={myIntents}
            myIntentsLoading={myLoading}
            onRefreshMyIntents={fetchMyIntents}
          />
        )}

        {/* ══ DEALS TAB ══ */}
        {activeTab === 'deals' && <DealsTab />}

        {/* ══ DIRECTORY TAB ══ */}
        {activeTab === 'directory' && <DirectoryTab />}

        {/* ══ EVENTS TAB ══ */}
        {activeTab === 'events' && <EventsTab />}

        {/* ══ MY REGISTRATIONS TAB ══ */}
        {activeTab === 'my_registrations' && <MyRegistrationsTab />}

        {/* ══ MEETINGS TAB ══ */}
        {activeTab === 'meetings' && <MeetingsTab />}

        {/* ══ PARTNERSHIPS TAB ══ */}
        {activeTab === 'partnerships' && <PartnershipsTab />}

        {/* ══ INBOX TAB ══ */}
        {activeTab === 'inbox' && <InboxTab />}

      </WindOpsShell>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateIntentModal roles={roles} onClose={() => setShowCreate(false)}
            onSuccess={() => { fetchIntents(0, appliedFilters, filterType); fetchMyIntents(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIntent && (
          <IntentDetailModal intent={selectedIntent} onClose={() => setSelectedIntent(null)}
            isOwner={isOwnerOfSelected}
            onSendProposal={i => { setSelectedIntent(null); setProposalTargetIntent(i); }}
            onViewProposals={i => { setSelectedIntent(null); setViewProposalsIntent(i); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {proposalTargetIntent && (
          <CreateProposalModal intent={proposalTargetIntent}
            onClose={() => setProposalTargetIntent(null)} onSuccess={() => { }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewProposalsIntent && (
          <IntentDetailModal intent={viewProposalsIntent} onClose={() => setViewProposalsIntent(null)}
            isOwner={true} onSendProposal={() => { }} onViewProposals={() => { }} />
        )}
      </AnimatePresence>

      {/* My Profile Modal */}
      <MyProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}