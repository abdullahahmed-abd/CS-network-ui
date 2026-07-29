// components/businesspartner/modals/AddLeadModal.jsx
import React, { useState } from 'react';
import {
  X, ArrowLeft, AlertCircle,
  Loader2, Globe, FileEdit, Link2,
  Building2, User, Phone, Mail, Package,
  DollarSign, Clock, Calendar, FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  createExternalLead,
  createInternalLead,
  createTradeIntentForMember,
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
    category: 'TEXTILE',
    title: '',
    description: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    currency: 'USD',
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
    category: 'FOOD_AND_BEVERAGE',
    title: '',
    description: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    currency: 'USD',
    expiresAt: '',
  });

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
          expiresAt: extForm.expiresAt ? new Date(extForm.expiresAt).toISOString() : undefined,
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
          expiresAt: memIntForm.expiresAt ? new Date(memIntForm.expiresAt).toISOString() : undefined,
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
                    <input
                      type="text"
                      value={extForm.phone}
                      onChange={(e) => setExtForm({ ...extForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="+971500000001"
                    />
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
                  <div className="mb-2">
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

                  <div className="mb-2">
                    <label className="block font-bold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={extForm.title}
                      onChange={(e) => setExtForm({ ...extForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="e.g. Bulk Cotton Import"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={extForm.quantity}
                        onChange={(e) => setExtForm({ ...extForm, quantity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Price / Unit *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={extForm.pricePerUnit}
                        onChange={(e) => setExtForm({ ...extForm, pricePerUnit: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        placeholder="12.50"
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
                        placeholder="kg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={extForm.followUpDate}
                    onChange={(e) => setExtForm({ ...extForm, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </>
            )}

            {/* 2. Internal Lead Form */}
            {selected?.id === 'CREATE_INTERNAL_LEAD' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member ID *</label>
                  <input
                    type="number"
                    value={intForm.memberId}
                    onChange={(e) => setIntForm({ ...intForm, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="e.g. 506"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trade Intent ID (Optional)</label>
                  <input
                    type="number"
                    value={intForm.tradeIntentId}
                    onChange={(e) => setIntForm({ ...intForm, tradeIntentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="e.g. 77"
                  />
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
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member ID *</label>
                  <input
                    type="number"
                    value={memIntForm.memberId}
                    onChange={(e) => setMemIntForm({ ...memIntForm, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    placeholder="e.g. 506"
                    required
                  />
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
                    placeholder="e.g. Export Quality Rice"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={memIntForm.quantity}
                      onChange={(e) => setMemIntForm({ ...memIntForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="1000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price / Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={memIntForm.pricePerUnit}
                      onChange={(e) => setMemIntForm({ ...memIntForm, pricePerUnit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                      placeholder="3.20"
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
                      placeholder="kg"
                    />
                  </div>
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