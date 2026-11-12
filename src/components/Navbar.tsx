import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { ThemeToggle } from './ThemeToggle.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import {
  Sparkles,
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
  BookOpen,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInterviewQuick: () => void;
  onOpenATSModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSRSModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  activeTab,
  setActiveTab,
  onOpenInterviewQuick,
  onOpenATSModal,
  onOpenAuthModal,
  onOpenSRSModal,
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
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
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center shadow-xs border border-neutral-800 dark:border-neutral-700">
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

          {/* Right Controls: Tools & Specs, Role Switcher, then Notifications, then Theme Toggle, then Profile */}
          <div className="flex items-center space-x-2.5 ml-auto pl-4">
            {/* Single Tools & Specs Menu Option */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border shadow-2xs ${
                  isToolsOpen
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                }`}
                title="Quick Tools & Specifications"
              >
                <Sparkles className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
                <span className="font-semibold text-[11px]">Tools & Specs</span>
                <ChevronDown className={`w-2.5 h-2.5 ml-1 text-neutral-400 transition-transform duration-150 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Single Option Popover Menu */}
              {isToolsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 mb-1 flex items-center justify-between">
                    <span>Recruitment & AI Tools</span>
                    <span className="text-emerald-500 font-bold">3 Options</span>
                  </div>

                  {/* Option 1: Free ATS Resume Checker */}
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenATSModal();
                    }}
                    className="w-full flex items-start space-x-2.5 p-2 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-left transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center space-x-1.5">
                        <span>Free ATS Checker</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500 text-neutral-950 font-black">AI</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                        Instant scan for ATS compliance, keywords & gaps
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Live Interview Room */}
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenInterviewQuick();
                    }}
                    className="w-full flex items-start space-x-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group mt-0.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                      <Video className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        Interview Room
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                        Launch WebRTC video call with AI question agent
                      </div>
                    </div>
                  </button>

                  {/* Option 3: SRS Specs & Architecture */}
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      onOpenSRSModal();
                    }}
                    className="w-full flex items-start space-x-2.5 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group mt-0.5 border-t border-neutral-100 dark:border-neutral-800/80 pt-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center space-x-1.5">
                        <span>SRS Specs & Architecture</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                        B.Tech IEEE 830 specs, NLP pipeline & test cases
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Single Option Button for Role Switcher (Candidate, Recruiter, Admin in one dropdown) */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border shadow-2xs ${
                  isRoleOpen
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white ring-2 ring-emerald-500/30'
                    : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                }`}
                title="Switch User Role"
              >
                <UserCheck className="w-3 h-3 mr-1 text-emerald-500 shrink-0" />
                <span className="text-neutral-400 dark:text-neutral-400 font-normal mr-1">Role:</span>
                <span className="font-bold capitalize">{currentUser.role}</span>
                <ChevronDown className={`w-2.5 h-2.5 ml-1 text-neutral-400 transition-transform duration-150 ${isRoleOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Single Option Role Popover Menu */}
              {isRoleOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    Select Platform Role
                  </div>

                  {/* Option 1: Candidate */}
                  <button
                    onClick={() => {
                      onSwitchRole('candidate');
                      setIsRoleOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                      currentUser.role === 'candidate'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Candidate</span>
                    </div>
                    {currentUser.role === 'candidate' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>

                  {/* Option 2: Recruiter */}
                  <button
                    onClick={() => {
                      onSwitchRole('recruiter');
                      setIsRoleOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors mt-0.5 ${
                      currentUser.role === 'recruiter'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Recruiter</span>
                    </div>
                    {currentUser.role === 'recruiter' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>

                  {/* Option 3: Admin */}
                  <button
                    onClick={() => {
                      onSwitchRole('admin');
                      setIsRoleOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors mt-0.5 ${
                      currentUser.role === 'admin'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Admin</span>
                    </div>
                    {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notification and Switch Mode icons shifted on the RIGHT side of Role button */}
            <div className="flex items-center space-x-1">
              {/* Notifications Dropdown (SRS Section 24) */}
              <NotificationDropdown userId={currentUser.id} onNavigateTab={setActiveTab} />

              {/* Theme Toggle Button (Switch to Light / Dark Mode) */}
              <ThemeToggle />
            </div>

            {/* User display with Clickable Sign-In / Account Switch modal trigger (Separated by border & gap) */}
            <div className="flex items-center space-x-1.5 pl-3 border-l border-neutral-200 dark:border-neutral-800">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group"
                title="Click to Switch Account or Sign In"
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
                    {currentUser.role} • Switch
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Login / Create Account"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center space-x-2 py-2.5 overflow-x-auto border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <ThemeToggle />
          <button
            onClick={onOpenATSModal}
            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-neutral-950 font-bold whitespace-nowrap flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free ATS Checker</span>
          </button>
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
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};
