// components/businesspartner/modals/ReferLeadModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, Send, UserCheck, ShieldAlert, Loader2, AlertCircle, ArrowRight,
  Search, Building2, MapPin, User, Star, RefreshCw, Check, Briefcase, ChevronRight, Globe
} from 'lucide-react';
import { referLead, findBusinessPartners } from '../../../api/businessPartnerApi';
import { BUSINESS_SECTORS } from '../../directory/DirectoryConstants';

const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'United States',
  'United Kingdom',
  'Turkey',
  'Qatar',
  'Oman',
  'Kuwait',
  'Bahrain',
  'Singapore',
  'Malaysia',
  'Germany',
  'China',
  'Canada',
];

export function ReferLeadModal({ lead, onClose, onSuccess, showToast }) {
  const [selectedBp, setSelectedBp] = useState(null);
  const [toBpId, setToBpId] = useState('');
  const [bpList, setBpList] = useState([]);
  const [loadingBps, setLoadingBps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPartners = async (overrides = {}) => {
    setLoadingBps(true);
    setError('');

    const activeCountry = overrides.hasOwnProperty('country') ? overrides.country : countryFilter;
    const activeSector  = overrides.hasOwnProperty('businessSector') ? overrides.businessSector : sectorFilter;
    const activeSearch  = overrides.hasOwnProperty('search') ? overrides.search : searchQuery;

    try {
      const params = {
        ...(activeSearch.trim() && { search: activeSearch.trim() }),
        ...(activeCountry && { country: activeCountry }),
        ...(activeSector && { businessSector: activeSector }),
      };
      const res = await findBusinessPartners(params);
      setBpList(res?.businessPartners || []);
    } catch (err) {
      console.error('findBusinessPartners error:', err);
      setError(err.message || 'Failed to fetch business partners');
    } finally {
      setLoadingBps(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCountryChange = (val) => {
    setCountryFilter(val);
    fetchPartners({ country: val });
  };

  const handleSectorChange = (val) => {
    setSectorFilter(val);
    fetchPartners({ businessSector: val });
  };

  const handleSelectBp = (bp) => {
    setSelectedBp(bp);
    setToBpId(String(bp.id));
    setError('');
  };

  const handleClearSelection = () => {
    setSelectedBp(null);
    setToBpId('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead?.id) return;

    const finalBpId = selectedBp ? selectedBp.id : toBpId;
    if (!finalBpId || Number(finalBpId) <= 0) {
      setError('Please select or enter a valid target Business Partner');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await referLead(lead.id, finalBpId);
      showToast?.(res?.message || `Lead referred successfully!`, 'success');
      onSuccess?.(lead.id, res?.lead);
      onClose();
    } catch (err) {
      console.error('referLead error:', err);
      setError(err.message || 'Failed to refer lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Refer Lead to Business Partner</h3>
              <p className="text-xs text-slate-500">Hand off lead: <span className="font-semibold text-slate-700">{lead?.companyName || lead?.contactPerson}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1 flex-shrink-0">
          <div className="font-bold flex items-center gap-1.5 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Ownership Transfer Warning
          </div>
          <p className="text-[11px] text-amber-900/80 leading-relaxed">
            Referring a lead transfers ownership completely. The lead will be removed from your pipeline view immediately. Maximum 7 referral hops allowed network-wide.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1 flex flex-col justify-between">
          <div className="space-y-3 flex-1">
            {/* Selected Business Partner Card */}
            {selectedBp ? (
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>{selectedBp.fullName}</span>
                      <span className="text-xs bg-indigo-200/70 text-indigo-800 font-mono px-2 py-0.5 rounded-md">
                        ID: #{selectedBp.id}
                      </span>
                    </div>
                    {selectedBp.companyName && (
                      <div className="text-xs text-indigo-900 font-semibold flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span>{selectedBp.companyName}</span>
                      </div>
                    )}
                    {(selectedBp.city || selectedBp.state || selectedBp.country) && (
                      <div className="text-[11px] text-indigo-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        <span>{[selectedBp.city, selectedBp.state, selectedBp.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {selectedBp.businessSector && (
                      <div className="text-[11px] text-indigo-700 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        <span>Sector: <strong className="font-semibold text-indigo-900">{selectedBp.businessSector}</strong></span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs transition-colors flex-shrink-0"
                  >
                    Change Partner
                  </button>
                </div>
              </div>
            ) : (
              /* Partner Search & Selection List */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> Select Target Business Partner *
                  </label>
                </div>

                {/* 2 Dropdowns: Country & Business Sector */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] flex items-center gap-1">
                      <Globe className="w-3 h-3 text-indigo-500" /> Country
                    </label>
                    <select
                      value={countryFilter}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">All Countries</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-indigo-500" /> Business Sector
                    </label>
                    <select
                      value={sectorFilter}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">All Business Sectors</option>
                      {BUSINESS_SECTORS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Text Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      name="searchBusinessPartnerQueryNoAutofill"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value) fetchPartners({ search: '' });
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchPartners(); } }}
                      placeholder="Search partner by Name, Company..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          fetchPartners({ search: '' });
                        }}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchPartners()}
                    disabled={loadingBps}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {loadingBps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Search</span>
                  </button>
                </div>

                {/* Partners List */}
                {loadingBps ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">Fetching available Business Partners...</p>
                  </div>
                ) : bpList.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-1">
                    <User className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No Business Partners found</p>
                    <p className="text-[11px] text-slate-400">Try selecting a different country, sector or search query.</p>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/60">
                    {bpList.map((bp) => (
                      <div
                        key={bp.id}
                        onClick={() => handleSelectBp(bp)}
                        className="p-3 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="font-bold text-slate-900 text-xs group-hover:text-indigo-800 flex items-center gap-1.5">
                            <span>{bp.fullName}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                              #{bp.id}
                            </span>
                          </div>
                          {bp.companyName && (
                            <div className="text-[11px] text-slate-600 font-medium truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                              <span>{bp.companyName}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            {(bp.city || bp.state || bp.country) && (
                              <span className="flex items-center gap-0.5">
                                📍 {[bp.city, bp.state, bp.country].filter(Boolean).join(', ')}
                              </span>
                            )}
                            {bp.businessSector && (
                              <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                {bp.businessSector}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 text-[11px] font-bold bg-indigo-600 text-white group-hover:bg-indigo-700 rounded-lg shadow-2xs flex-shrink-0 flex items-center gap-1"
                        >
                          <span>Select</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              disabled={loading || (!selectedBp && (!toBpId || Number(toBpId) <= 0))}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>Refer Lead Now</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
