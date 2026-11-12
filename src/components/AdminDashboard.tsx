import React, { useState, useEffect } from 'react';
import { User, AdminMetrics } from '../types.ts';
import {
  Shield,
  Users,
  Activity,
  Server,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Search,
  UserCheck,
  UserX,
  FileCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, uRes] = await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/admin/users'),
        ]);
        const mData = await mRes.json();
        const uData = await uRes.json();
        setMetrics(mData.metrics);
        setUsers(uData.users);
      } catch (e) {
        console.error('Error fetching admin data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            System Administration
          </span>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-1">
            Platform Health & AI Governance
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor infrastructure uptime, inspect algorithmic fairness compliance, and manage role access.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All AI Services Operational</span>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Users</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{metrics.totalUsers}</div>
            <div className="text-[11px] text-neutral-500 mt-1">
              {metrics.activeCandidates} Candidates • {metrics.activeRecruiters} Recruiters
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Published Openings</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{metrics.totalJobs}</div>
            <div className="text-[11px] text-neutral-500 mt-1">100% active positions</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Applications</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{metrics.totalApplications}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">AI Evaluated & Scored</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Interviews Conducted</div>
            <div className="text-2xl font-black text-neutral-900 mt-1">{metrics.interviewsConducted}</div>
            <div className="text-[11px] text-neutral-500 mt-1">WebRTC video transcripts stored</div>
          </div>
        </div>
      )}

      {/* AI Fairness & Auditing Assurance Box */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Shield className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">AI Fairness & Non-Discrimination Audit</h3>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          In strict compliance with statutory recruitment guidelines and ethical AI standards, the TalentPulse system enforces algorithmic fairness through the following architectural guardrails:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <div className="font-bold text-white mb-1">Zero Protected Attributes</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Age, gender, race, religion, nationality, and marital status are strictly excluded from all feature vectors, embeddings, and prompting rubrics.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <div className="font-bold text-white mb-1">Strict Advisory Status</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Neither the resume match score nor the interview score can auto-reject or auto-select candidates. Every stage advancement requires human confirmation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
            <div className="font-bold text-white mb-1">Explainable Contributing Factors</div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              No opaque scores. Match percentages are explicitly broken into Verified Skills (40%), Experience (30%), Education (15%), and Domain Alignment (15%).
            </p>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">User Directory & Role Authorization</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review registered candidates, recruiters, and administrative operators.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-6 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200"
                      />
                      <div>
                        <div className="font-bold text-neutral-900">{u.name}</div>
                        <div className="text-neutral-500 text-[11px]">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'recruiter'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        u.status === 'active'
                          ? 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend Access' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
