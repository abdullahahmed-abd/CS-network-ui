// components/directory/DirectoryTab.jsx 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, BookOpen, Network } from 'lucide-react';
import { getUserData } from '../../api/auth';
import MemberDirectory from './MemberDirectory';
import OperatorDirectory from './OperatorDirectory';

export default function DirectoryTab({ onNavigateToPlans }) {
  const user = getUserData() || {};
  const roles = user.roles || [];

  const canAccessOperators =
    roles.includes('GLOBAL_ADMIN') ||
    roles.includes('OPERATOR') ||
    roles.includes('MASTER_OPERATOR') ||
    roles.includes('GENERAL_OPERATOR') ||
    roles.includes('ADMIN') ||
    user?.isOperator === true ||
    user?.membershipType === 'OPERATOR';

  const [activeSubTab, setActiveSubTab] = useState('members'); // 'members' | 'operators'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Directory Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-600" />
            Network Directory
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Search verified members and internal franchise operator org charts.
          </p>
        </div>

        {/* Sub-Tab Navigation (if user has operator access) */}
        {canAccessOperators && (
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('members')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'members'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Member Directory</span>
            </button>

            <button
              onClick={() => setActiveSubTab('operators')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'operators'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-4 h-4 text-indigo-600" />
              <span>Operator Org Chart</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tab Content */}
      <div>
        {activeSubTab === 'members' || !canAccessOperators ? (
          <MemberDirectory onUpgradeClick={onNavigateToPlans} />
        ) : (
          <OperatorDirectory />
        )}
      </div>
    </div>
  );
}
