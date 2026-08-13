import React, { useState, useEffect } from 'react';
import {
  X, ArrowLeft, AlertCircle,
  Loader2, Globe, FileEdit, Link2,
  Building2, User, Phone, Mail, Package,
  DollarSign, Clock, Calendar, FileText, Search, Check, Briefcase, Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  createExternalLead,
  createInternalLead,
  createTradeIntentForMember,
  fetchFranchiseMembers,
  fetchMemberIntents,
} from '../../../api/businessPartnerApi';
import { LEAD_TYPES } from '../../constants/BpConstants';
import { BUSINESS_SECTORS } from '../../directory/DirectoryConstants';
import { getTodayDateString } from '../../../utils/BpHelpers';

export function AddLeadModal({ onClose, onSuccess, showToast }) {
  const [step, setStep] = useState('choose'); // 'choose' | 'form'
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. External Lead Form
  const [extForm, setExtForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    intentType: 'BUY',
    category: 'AGRICULTURE',
    title: '',
    description: '',
    quantity: '',
    unit: 'KG',
    pricePerUnit: '',
    currency: 'INR',
    expiresAt: '',
    notes: '',
    followUpDate: '',
  });

  // 2. Internal Lead Form
  const [intForm, setIntForm] = useState({
    memberId: '',
    tradeIntentId: '',
    notes: '',
    followUpDate: '',
  });

  // 3. Trade Intent for Member Form
  const [memIntForm, setMemIntForm] = useState({
    memberId: '',
    intentType: 'SELL',
    category: 'AGRICULTURE',
    title: '',
    description: '',
    quantity: '',
    unit: 'KG',
    pricePerUnit: '',
    currency: 'INR',
    expiresAt: '',
  });

  // Franchise Member Search State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearchPage, setMemberSearchPage] = useState(0);
  const [memberSearchTotalPages, setMemberSearchTotalPages] = useState(1);
  const [memberSearchMessage, setMemberSearchMessage] = useState('');

  // Member Trade Intents State
  const [memberIntents, setMemberIntents] = useState([]);
  const [loadingIntents, setLoadingIntents] = useState(false);

  const loadMemberIntents = async (mId) => {
    if (!mId) {
      setMemberIntents([]);
      return;
    }
    setLoadingIntents(true);
    try {
      const res = await fetchMemberIntents(mId);
      const intents = res?.tradeIntents || res?.memberIntents || res?.intents || res?.content || (Array.isArray(res) ? res : []);
      setMemberIntents(intents);
    } catch (err) {
      console.error('fetchMemberIntents error:', err);
      setMemberIntents([]);
    } finally {
      setLoadingIntents(false);
    }
  };

  const handleSearchMembers = async (query = memberSearchQuery, pageNum = 0) => {
    if (!query || !query.trim()) {
      setMemberSearchResults([]);
      setMemberSearchMessage('');
      return;
    }
    setSearchingMembers(true);
    setError('');
    try {
      const res = await fetchFranchiseMembers({
        search: query.trim(),
        page: pageNum,
        size: 100,
      });
      setMemberSearchResults(res?.franchiseMembers || []);
      setMemberSearchPage(res?.currentPage || 0);
      setMemberSearchTotalPages(res?.totalPages || 1);
      setMemberSearchMessage(res?.message || `${(res?.franchiseMembers || []).length} member(s) found.`);
    } catch (err) {
      console.error('fetchFranchiseMembers error:', err);
      setError(err.message || 'Failed to search franchise members');
    } finally {
      setSearchingMembers(false);
    }
  };

  useEffect(() => {
    if (!memberSearchQuery || !memberSearchQuery.trim()) {
      setMemberSearchResults([]);
      setMemberSearchMessage('');
      return;
    }
    const timer = setTimeout(() => {
      handleSearchMembers(memberSearchQuery, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setIntForm(prev => ({ ...prev, memberId: String(member.id), tradeIntentId: '' }));
    setMemIntForm(prev => ({ ...prev, memberId: String(member.id) }));
    loadMemberIntents(member.id);
  };

  const handleClearSelectedMember = () => {
    setSelectedMember(null);
    setIntForm(prev => ({ ...prev, memberId: '', tradeIntentId: '' }));
    setMemIntForm(prev => ({ ...prev, memberId: '' }));
    setMemberIntents([]);
  };

  const handleSelectType = (type) => {
    setSelected(type);
    setStep('form');
    setError('');
  };

  const handleBack = () => {
    setStep('choose');
    setSelected(null);
    setError('');
  };

  const validate = () => {
    const rt = selected?.id;
    if (rt === 'CREATE_EXTERNAL_LEAD') {
      if (!extForm.companyName.trim()) return 'Company Name is required';
      if (!extForm.phone.trim() && !extForm.email.trim()) return 'At least one contact method (Phone or Email) is required';
      if (!extForm.title.trim()) return 'Trade Intent Title is required';
      if (!extForm.quantity || Number(extForm.quantity) <= 0) return 'Valid Quantity is required';
      if (!extForm.pricePerUnit || Number(extForm.pricePerUnit) <= 0) return 'Valid Price Per Unit is required';
    }
    if (rt === 'CREATE_INTERNAL_LEAD') {
      if (!intForm.memberId) return 'Member ID is required';
    }
    if (rt === 'CREATE_TRADE_INTENT_FOR_MEMBER') {
      if (!memIntForm.memberId) return 'Member ID is required';
      if (!memIntForm.title.trim()) return 'Trade Intent Title is required';
      if (!memIntForm.quantity || Number(memIntForm.quantity) <= 0) return 'Valid Quantity is required';
      if (!memIntForm.pricePerUnit || Number(memIntForm.pricePerUnit) <= 0) return 'Valid Price Per Unit is required';
    }
    return null;
  };

  const formatExpiresAt = (dateStr) => {
    if (!dateStr) return undefined;
    if (dateStr.includes('T')) return dateStr;
    return `${dateStr}T23:59:59Z`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ve = validate();
    if (ve) {
      setError(ve);
      return;
    }

    setLoading(true);
    const rt = selected.id;

    try {
      let res;
      if (rt === 'CREATE_EXTERNAL_LEAD') {
        res = await createExternalLead({
          ...extForm,
          quantity: Number(extForm.quantity),
          pricePerUnit: Number(extForm.pricePerUnit),
          followUpDate: extForm.followUpDate ? new Date(extForm.followUpDate).toISOString() : undefined,
          expiresAt: formatExpiresAt(extForm.expiresAt),
        });
      } else if (rt === 'CREATE_INTERNAL_LEAD') {
        res = await createInternalLead({
          memberId: Number(intForm.memberId),
          tradeIntentId: intForm.tradeIntentId ? Number(intForm.tradeIntentId) : undefined,
          notes: intForm.notes,
          followUpDate: intForm.followUpDate ? new Date(intForm.followUpDate).toISOString() : undefined,
        });
      } else if (rt === 'CREATE_TRADE_INTENT_FOR_MEMBER') {
        res = await createTradeIntentForMember({
          memberId: Number(memIntForm.memberId),
          intentType: memIntForm.intentType,
          category: memIntForm.category,
          title: memIntForm.title,
          description: memIntForm.description,
          quantity: Number(memIntForm.quantity),
          unit: memIntForm.unit,
          pricePerUnit: Number(memIntForm.pricePerUnit),
          currency: memIntForm.currency,
          expiresAt: formatExpiresAt(memIntForm.expiresAt),
        });
      }

      showToast?.(res?.message || 'Lead created successfully!', 'success');
      onSuccess?.(res?.lead);
      onClose();
    } catch (err) {
      console.error('createLead error:', err);
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const TypeIconMap = {
    CREATE_EXTERNAL_LEAD: Globe,
    CREATE_TRADE_INTENT_FOR_MEMBER: FileEdit,
    CREATE_INTERNAL_LEAD: Link2,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {step === 'form' && (
              <button onClick={handleBack} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {step === 'choose' ? 'Add New Pipeline Lead' : selected?.title}
              </h3>
              <p className="text-xs text-slate-500">
                {step === 'choose' ? 'Select the type of lead to create' : selected?.subtitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Choose Type */}
        {step === 'choose' ? (
          <div className="space-y-3 py-2">
            {LEAD_TYPES.map((lt) => {
              const Icon = TypeIconMap[lt.id] || Globe;
              return (
                <button
                  key={lt.id}
                  onClick={() => handleSelectType(lt)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 transition-all flex items-start gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 shadow-xs flex items-center justify-center border border-slate-200 group-hover:border-emerald-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">{lt.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{lt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Step 2: Form */
          <form onSubmit={handleSubmit} className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
            {/* 1. External Lead Form */}
            {selected?.id === 'CREATE_EXTERNAL_LEAD' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={extForm.companyName}
                      onChange={(e) => setExtForm({ ...extForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="Khalid Trading Co."
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={extForm.contactPerson}
                      onChange={(e) => setExtForm({ ...extForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="Khalid Hussain"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone</label>
                    <div className="flex gap-1">
                      <select
                        value={extForm.countryCode || '+91'}
                        onChange={(e) => setExtForm({ ...extForm, countryCode: e.target.value })}
                        className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+92">🇵🇰 +92</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={extForm.phone}
                        onChange={(e) => setExtForm({ ...extForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                        className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={extForm.email}
                      onChange={(e) => setExtForm({ ...extForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="khalid@example.com"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Trade Intent Details</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Intent Type *</label>
                      <select
                        value={extForm.intentType}
                        onChange={(e) => setExtForm({ ...extForm, intentType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={extForm.category}
                        onChange={(e) => setExtForm({ ...extForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      >
                        {BUSINESS_SECTORS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block font-bold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={extForm.title}
                      onChange={(e) => setExtForm({ ...extForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="e.g. Buy Premium Basmati Rice"
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block font-bold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={extForm.description}
                      onChange={(e) => setExtForm({ ...extForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
                      placeholder="Looking to purchase 1000 kg of premium basmati rice..."
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="0"
                        onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                        value={extForm.quantity}
                        onChange={(e) => setExtForm({ ...extForm, quantity: e.target.value.replace(/-/g, '') })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="1000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Price/Unit *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                        value={extForm.pricePerUnit}
                        onChange={(e) => setExtForm({ ...extForm, pricePerUnit: e.target.value.replace(/-/g, '') })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="85.50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={extForm.unit}
                        onChange={(e) => setExtForm({ ...extForm, unit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="KG"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Currency</label>
                      <input
                        type="text"
                        value={extForm.currency}
                        onChange={(e) => setExtForm({ ...extForm, currency: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="INR"
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date (expiresAt)</label>
                    <input
                      type="date"
                      min={getTodayDateString()}
                      value={extForm.expiresAt}
                      onChange={(e) => setExtForm({ ...extForm, expiresAt: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={extForm.notes}
                      onChange={(e) => setExtForm({ ...extForm, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
                      placeholder="Interested in purchasing in bulk..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      min={getTodayDateString()}
                      max={extForm.expiresAt || undefined}
                      value={extForm.followUpDate}
                      onChange={(e) => setExtForm({ ...extForm, followUpDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                </div>
              </>
            )}

            {/* 2. Internal Lead Form */}
            {selected?.id === 'CREATE_INTERNAL_LEAD' && (
              <>
                {/* Member Search & Selection */}
                <div className="space-y-2 pb-2 border-b border-slate-100">
                  <label className="block font-bold text-slate-700 text-xs">
                    Franchise Member *
                  </label>

                  {selectedMember ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{selectedMember.fullName}</span>
                          <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            ID: #{selectedMember.id}
                          </span>
                        </div>
                        {(selectedMember.companyName || selectedMember.businessSector) && (
                          <div className="text-[11px] text-emerald-800 font-medium truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>{selectedMember.companyName || 'Company'}</span>
                            {selectedMember.businessSector && <span className="opacity-75">({selectedMember.businessSector})</span>}
                          </div>
                        )}
                        <div className="text-[11px] text-emerald-700 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {selectedMember.whatsappNumber && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" /> {selectedMember.whatsappNumber}
                            </span>
                          )}
                          {selectedMember.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-emerald-600" /> {selectedMember.email}
                            </span>
                          )}
                        </div>
                        {(selectedMember.city || selectedMember.state || selectedMember.country) && (
                          <div className="text-[10px] text-emerald-600 font-medium">
                            📍 {[selectedMember.city, selectedMember.state, selectedMember.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedMember}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex-shrink-0 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="searchFranchiseMemberQuery"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={memberSearchQuery}
                            onChange={(e) => {
                              setMemberSearchQuery(e.target.value);
                              if (!e.target.value) {
                                setMemberSearchResults([]);
                                setMemberSearchMessage('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchMembers(memberSearchQuery, 0);
                              }
                            }}
                            placeholder="Search member by Name, Phone, Company..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          {memberSearchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setMemberSearchQuery('');
                                setMemberSearchResults([]);
                                setMemberSearchMessage('');
                              }}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSearchMembers(memberSearchQuery, 0)}
                          disabled={searchingMembers || !memberSearchQuery.trim()}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {searchingMembers ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span>Search</span>
                        </button>
                      </div>

                      {memberSearchMessage && (
                        <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between px-1">
                          <span>{memberSearchMessage}</span>
                          {searchingMembers && <span className="text-emerald-600">Searching...</span>}
                        </div>
                      )}

                      {memberSearchResults.length > 0 && (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/70">
                          {memberSearchResults.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleSelectMember(m)}
                              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                            >
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 flex items-center gap-1.5">
                                  <span>{m.fullName}</span>
                                </div>
                                {m.companyName && (
                                  <div className="text-[11px] text-slate-600 font-medium">
                                    {m.companyName} {m.businessSector ? `• ${m.businessSector}` : ''}
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-500 flex items-center gap-x-2">
                                  {m.whatsappNumber && <span>📱 {m.whatsappNumber}</span>}
                                  {m.email && <span className="truncate">✉️ {m.email}</span>}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white group-hover:bg-emerald-700 rounded-lg shadow-xs flex-shrink-0"
                              >
                                Select
                              </button>
                            </div>
                          ))}

                          {memberSearchTotalPages > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                              <button
                                type="button"
                                disabled={memberSearchPage === 0 || searchingMembers}
                                onClick={() => handleSearchMembers(memberSearchQuery, memberSearchPage - 1)}
                                className="px-2 py-1 text-slate-600 bg-white border border-slate-200 rounded disabled:opacity-40"
                              >
                                Prev
                              </button>
                              <span className="text-slate-500 font-medium">
                                Page {memberSearchPage + 1} of {memberSearchTotalPages}
                              </span>
                              <button
                                type="button"
                                disabled={memberSearchPage >= memberSearchTotalPages - 1 || searchingMembers}
                                onClick={() => handleSearchMembers(memberSearchQuery, memberSearchPage + 1)}
                                className="px-2 py-1 text-slate-600 bg-white border border-slate-200 rounded disabled:opacity-40"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Member's Trade Intent Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 text-xs flex items-center justify-between">
                    <span>Member's Trade Intent (Optional)</span>
                    {loadingIntents && (
                      <span className="text-emerald-600 text-[11px] font-normal flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading intents...
                      </span>
                    )}
                  </label>

                  {loadingIntents ? (
                    <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Fetching trade intents for member...</span>
                    </div>
                  ) : memberIntents.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
                      <div className="text-[11px] font-medium text-slate-500 mb-1 px-1">
                        Select an intent created by this member:
                      </div>
                      {memberIntents.map((intent) => {
                        const isSelected = String(intForm.tradeIntentId) === String(intent.id);
                        return (
                          <div
                            key={intent.id}
                            onClick={() => setIntForm({ ...intForm, tradeIntentId: isSelected ? '' : String(intent.id) })}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${intent.intentType === 'SELL' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {intent.intentType || 'INTENT'}
                                </span>
                                <span className="truncate">{intent.title || intent.tradeIntentTitle || `Trade Intent`}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2">
                                {intent.category && <span className="font-medium text-slate-700">{intent.category}</span>}
                                {intent.quantity && (
                                  <span>
                                    • {intent.quantity} {intent.unit || 'units'} {intent.pricePerUnit ? `@ ${intent.currency || 'INR'} ${intent.pricePerUnit}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors flex-shrink-0 ${
                              isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : intForm.memberId ? (
                    <div className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No active trade intents found for this member.
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={intForm.notes}
                    onChange={(e) => setIntForm({ ...intForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
                    placeholder="Initial conversation notes..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={intForm.followUpDate}
                    onChange={(e) => setIntForm({ ...intForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </>
            )}

            {/* 3. Trade Intent for Member Form */}
            {selected?.id === 'CREATE_TRADE_INTENT_FOR_MEMBER' && (
              <>
                <div className="space-y-2 pb-2 border-b border-slate-100">
                  <label className="block font-bold text-slate-700 text-xs">
                    Franchise Member *
                  </label>

                  {selectedMember ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{selectedMember.fullName}</span>
                          <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-100 px-1.5 py-0.5 rounded-md">
                            ID: #{selectedMember.id}
                          </span>
                        </div>
                        {(selectedMember.companyName || selectedMember.businessSector) && (
                          <div className="text-[11px] text-emerald-800 font-medium truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>{selectedMember.companyName || 'Company'}</span>
                            {selectedMember.businessSector && <span className="opacity-75">({selectedMember.businessSector})</span>}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedMember}
                        className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex-shrink-0 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            name="searchFranchiseMemberQueryTradeIntent"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={memberSearchQuery}
                            onChange={(e) => {
                              setMemberSearchQuery(e.target.value);
                              if (!e.target.value) {
                                setMemberSearchResults([]);
                                setMemberSearchMessage('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchMembers(memberSearchQuery, 0);
                              }
                            }}
                            placeholder="Search member by Name, Phone, Company..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          />
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          {memberSearchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setMemberSearchQuery('');
                                setMemberSearchResults([]);
                                setMemberSearchMessage('');
                              }}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSearchMembers(memberSearchQuery, 0)}
                          disabled={searchingMembers || !memberSearchQuery.trim()}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {searchingMembers ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                          <span>Search</span>
                        </button>
                      </div>

                      {memberSearchResults.length > 0 && (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/70">
                          {memberSearchResults.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleSelectMember(m)}
                              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                            >
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 flex items-center gap-1.5">
                                  <span>{m.fullName}</span>
                                </div>
                                {m.companyName && (
                                  <div className="text-[11px] text-slate-600 font-medium">
                                    {m.companyName} {m.businessSector ? `• ${m.businessSector}` : ''}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white group-hover:bg-emerald-700 rounded-lg shadow-xs flex-shrink-0"
                              >
                                Select
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Intent Type *</label>
                    <select
                      value={memIntForm.intentType}
                      onChange={(e) => setMemIntForm({ ...memIntForm, intentType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    >
                      <option value="SELL">SELL</option>
                      <option value="BUY">BUY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={memIntForm.category}
                      onChange={(e) => setMemIntForm({ ...memIntForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    >
                      {BUSINESS_SECTORS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={memIntForm.title}
                    onChange={(e) => setMemIntForm({ ...memIntForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="e.g. Premium Basmati Rice"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={memIntForm.description}
                    onChange={(e) => setMemIntForm({ ...memIntForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
                    placeholder="High-quality basmati rice available for bulk orders..."
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                      value={memIntForm.quantity}
                      onChange={(e) => setMemIntForm({ ...memIntForm, quantity: e.target.value.replace(/-/g, '') })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="1000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price/Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                      value={memIntForm.pricePerUnit}
                      onChange={(e) => setMemIntForm({ ...memIntForm, pricePerUnit: e.target.value.replace(/-/g, '') })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="75.50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={memIntForm.unit}
                      onChange={(e) => setMemIntForm({ ...memIntForm, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="KG"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Currency</label>
                    <input
                      type="text"
                      value={memIntForm.currency}
                      onChange={(e) => setMemIntForm({ ...memIntForm, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="INR"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date (expiresAt)</label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={memIntForm.expiresAt}
                    onChange={(e) => setMemIntForm({ ...memIntForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                  Notice: Creating a trade intent for a member automatically creates a pipeline lead starting at the <strong>QUALIFIED</strong> stage.
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Lead</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}