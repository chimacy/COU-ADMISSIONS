import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, UserPlus, Users, FileText, Database, Settings, GraduationCap,
  X, ScrollText, CreditCard, LogOut,
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/new-client', label: 'New Client', icon: UserPlus },
  { to: '/clients', label: 'Client Records', icon: Users },
  { to: '/quotation', label: 'Generate Quotation', icon: FileText },
  { to: '/checkout', label: 'Checkout & Invoices', icon: CreditCard },
  { to: '/pricing', label: 'Pricing Database', icon: Database },
  { to: '/rules', label: 'Rules', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { settings } = useSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full m-0 lg:m-3 lg:rounded-2xl glass-card !p-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-5 border-b border-primary-100/60 dark:border-slate-700/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 brand-surface overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.company_name} className="h-full w-full object-cover" />
                ) : (
                  <GraduationCap className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm leading-tight text-slate-800 dark:text-white truncate">{settings.company_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">{settings.institution_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden btn-ghost !p-1.5 rounded-full shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-lg brand-surface'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="shrink-0" size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-primary-100/60 dark:border-slate-700/50 space-y-3">
            {user?.email && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate px-1">Signed in as <strong>{user.email}</strong></p>
            )}
            <button onClick={handleLogout} className="btn-ghost w-full !justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              &copy; {new Date().getFullYear()} {settings.company_name}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
