import React from 'react'

export default function Card({ children, className = '', glass = true, ...props }) {
  return (
    <div
      className={`${glass ? 'glass-card' : 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800'} p-5 sm:p-6 animate-fade-in ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
