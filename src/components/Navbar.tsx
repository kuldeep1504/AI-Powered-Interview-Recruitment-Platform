import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { ThemeToggle } from './ThemeToggle.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import {
  Video,
  Briefcase,
  UserCheck,
  ShieldCheck,
  LogOut,
  FileText,
  Building2,
  BrainCircuit,
  LogIn,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInterviewQuick: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  activeTab,
  setActiveTab,
  onOpenInterviewQuick,
  onOpenAuthModal,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Container: Logo & Platform Title + Left-Aligned Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Logo & Platform Title */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setActiveTab(
                  currentUser.role === 'recruiter'
                    ? 'recruiter-dashboard'
                    : currentUser.role === 'admin'
                      ? 'admin-dashboard'
                      : 'candidate-dashboard'
                );
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab(
                    currentUser.role === 'recruiter'
                      ? 'recruiter-dashboard'
                      : currentUser.role === 'admin'
                        ? 'admin-dashboard'
                        : 'candidate-dashboard'
                  );
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              title="Go to Dashboard"
              className="flex items-center space-x-2.5 shrink-0 cursor-pointer select-none group rounded-xl p-1 -m-1 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center shadow-xs border border-neutral-800 dark:border-neutral-700 group-hover:border-emerald-500/50 transition-colors">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-neutral-900 dark:text-white text-base tracking-tight">TalentPulse</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider leading-none rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    AI
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links shifted to left side of title bar, compact text and clean gaps */}
            <nav className="hidden md:flex items-center space-x-1 border-l border-neutral-200 dark:border-neutral-800 pl-4">
              {currentUser.role === 'candidate' && (
                <>
                  <button
                    onClick={() => setActiveTab('candidate-dashboard')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'candidate-dashboard'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('job-board')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'job-board'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Job Board
                  </button>
                  <button
                    onClick={() => setActiveTab('candidate-profile')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'candidate-profile'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    My Resume
                  </button>
                </>
              )}

              {currentUser.role === 'recruiter' && (
                <>
                  <button
                    onClick={() => setActiveTab('recruiter-dashboard')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'recruiter-dashboard'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Candidate Pipeline
                  </button>
                  <button
                    onClick={() => setActiveTab('recruiter-jobs')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'recruiter-jobs'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Job Postings
                  </button>
                  <button
                    onClick={() => setActiveTab('recruiter-interviews')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'recruiter-interviews'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Interviews
                  </button>
                </>
              )}

              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('admin-dashboard')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                      activeTab === 'admin-dashboard'
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-2xs'
                        : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Platform Health & Users
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Controls: Interview Room button, Notifications, Theme Toggle, Account Menu */}
          <div className="flex items-center space-x-2.5 ml-auto pl-4">
            {currentUser.role !== 'recruiter' && (
              <button
                type="button"
                onClick={onOpenInterviewQuick}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border shadow-2xs bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 hover:border-emerald-500/50 cursor-pointer"
                title="Launch WebRTC video call with AI question agent"
              >
                <Video className="w-3 h-3 mr-1.5 text-emerald-500 shrink-0" />
                <span className="font-semibold text-[11px]">Interview Room</span>
              </button>
            )}

            {/* Notification and Switch Mode icons */}
            <div className="flex items-center space-x-1">
              {/* Notifications Dropdown (SRS Section 24) */}
              <NotificationDropdown userId={currentUser.id} onNavigateTab={setActiveTab} />

              {/* Theme Toggle Button (Switch to Light / Dark Mode) */}
              <ThemeToggle />
            </div>

            {/* User display with Account Menu Dropdown (Dashboard, Profile, Switch Account, Sign Out) */}
            <div className="relative flex items-center space-x-1.5 pl-3 border-l border-neutral-200 dark:border-neutral-800" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className={`flex items-center space-x-1.5 p-1 pr-2 rounded-lg transition-colors text-left group cursor-pointer ${
                  isUserMenuOpen
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Account Menu (Dashboard, Profile, Sign Out)"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 group-hover:ring-2 group-hover:ring-neutral-900 dark:group-hover:ring-neutral-200 transition-all"
                />
                <div className="hidden sm:block">
                  <div className="text-[11px] font-bold text-neutral-900 dark:text-white leading-tight flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[9.5px] text-neutral-500 dark:text-neutral-400 capitalize leading-none mt-0.5">
                    {currentUser.role} • Menu
                  </div>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      {currentUser.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (currentUser.role === 'recruiter') {
                        setActiveTab('recruiter-dashboard');
                      } else if (currentUser.role === 'admin') {
                        setActiveTab('admin-dashboard');
                      } else {
                        setActiveTab('candidate-dashboard');
                      }
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveTab('user-profile');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Profile</span>
                  </button>

                  {currentUser.role === 'candidate' && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('job-board');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>Job Board</span>
                    </button>
                  )}

                  {currentUser.role === 'recruiter' && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setActiveTab('recruiter-jobs');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Job Postings</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
                  >
                    <LogIn className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>Switch Account</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center space-x-2 py-2.5 overflow-x-auto border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <ThemeToggle />
          <button
            onClick={() => onSwitchRole('candidate')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              currentUser.role === 'candidate'
                ? 'bg-neutral-900 text-white font-bold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => onSwitchRole('recruiter')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              currentUser.role === 'recruiter'
                ? 'bg-neutral-900 text-white font-bold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            Recruiter
          </button>
          <button
            onClick={onOpenAuthModal}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold whitespace-nowrap ml-auto"
          >
            Switch
          </button>
          <button
            onClick={onLogout}
            className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
