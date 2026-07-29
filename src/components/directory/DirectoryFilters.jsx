// components/directory/DirectoryFilters.jsx
import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  MapPin,
  Briefcase,
  UserCheck,
  Clock,
  Building,
  RotateCcw,
} from 'lucide-react';
import {
  BUSINESS_SECTORS,
  POSITIONS,
  BUSINESS_AGES,
  FRANCHISE_TYPES,
} from './DirectoryConstants';
import {
  getCountries,
  getStates,
  getCities,
} from '../../utils/locationData';

export default function DirectoryFilters({
  filters,
  onChange,
  onReset,
  isOperatorView = false,
  totalResults = 0,
  loading = false,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.country,
    filters.state,
    filters.city,
    !isOperatorView && filters.businessSector,
    !isOperatorView && filters.position,
    !isOperatorView && filters.businessAge,
    filters.franchiseType,
  ].filter(Boolean).length;

  const countries = getCountries();
  const availableStates = getStates(filters.country);
  const availableCities = getCities(filters.country, filters.state);

  const handleCountryChange = (val) => {
    onChange({
      ...filters,
      country: val,
      state: '',
      city: '',
      page: 0,
    });
  };

  const handleStateChange = (val) => {
    onChange({
      ...filters,
      state: val,
      city: '',
      page: 0,
    });
  };

  const handleCityChange = (val) => {
    onChange({
      ...filters,
      city: val,
      page: 0,
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-emerald-900/10 p-4 md:p-5 mb-6 shadow-sm">
      {/* Top Search Bar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Free text search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700/60" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 0 })}
            placeholder={
              isOperatorView
                ? 'Search operator name or franchise name...'
                : 'Search members by full name or company name...'
            }
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '', page: 0 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toggle Filters Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fadeIn">
          {/* Country Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              Country
            </label>
            <select
              value={filters.country || ''}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* State / Region Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              State / Region
            </label>
            {availableStates.length > 0 ? (
              <select
                value={filters.state || ''}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="">All States / Regions</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={filters.state || ''}
                onChange={(e) => handleStateChange(e.target.value)}
                placeholder={filters.country ? 'Type State/Region' : 'Select Country first'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            )}
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              City
            </label>
            {availableCities.length > 0 ? (
              <select
                value={filters.city || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="">All Cities</option>
                {availableCities.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder={filters.state ? 'Type City' : 'Select State first'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            )}
          </div>

          {/* Franchise Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building className="w-3 h-3 text-emerald-600" />
              Franchise Type
            </label>
            <select
              value={filters.franchiseType || ''}
              onChange={(e) => onChange({ ...filters, franchiseType: e.target.value, page: 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">All Franchise Types</option>
              {FRANCHISE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Member-Only Business Filters */}
          {!isOperatorView && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-emerald-600" />
                  Business Sector
                </label>
                <select
                  value={filters.businessSector || ''}
                  onChange={(e) => onChange({ ...filters, businessSector: e.target.value, page: 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="">All Business Sectors</option>
                  {BUSINESS_SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  Position
                </label>
                <select
                  value={filters.position || ''}
                  onChange={(e) => onChange({ ...filters, position: e.target.value, page: 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="">All Positions</option>
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  Business Age
                </label>
                <select
                  value={filters.businessAge || ''}
                  onChange={(e) => onChange({ ...filters, businessAge: e.target.value, page: 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option value="">All Business Ages</option>
                  {BUSINESS_AGES.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
