import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <div className="glass-card p-10 text-center max-w-sm">
        <GraduationCap className="h-10 w-10 text-primary-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold font-display text-slate-800 dark:text-white mb-2">404</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Page not found.</p>
        <Link to="/" className="btn-primary inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  )
}
