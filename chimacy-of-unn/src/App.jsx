import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ConfigNeeded from './pages/ConfigNeeded.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewClient from './pages/NewClient.jsx'
import ClientRecords from './pages/ClientRecords.jsx'
import GenerateQuotation from './pages/GenerateQuotation.jsx'
import Checkout from './pages/Checkout.jsx'
import PricingDatabase from './pages/PricingDatabase.jsx'
import RulesPage from './pages/RulesPage.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

export default function App() {
  // Show a friendly explanation instead of a blank white screen whenever the
  // Supabase environment variables haven't been set yet (e.g. right after a
  // first Netlify deploy, before the backend setup steps are done).
  if (!isSupabaseConfigured) {
    return <ConfigNeeded />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/new-client" element={<ProtectedRoute><NewClient /></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><ClientRecords /></ProtectedRoute>} />
      <Route path="/quotation" element={<ProtectedRoute><GenerateQuotation /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><PricingDatabase /></ProtectedRoute>} />
      <Route path="/rules" element={<ProtectedRoute><RulesPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
