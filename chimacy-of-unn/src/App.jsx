import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ConfigNeeded from './pages/ConfigNeeded.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { isSupabaseConfigured } from './lib/supabaseClient.js'

// Every route is lazy-loaded: a public visitor never downloads the admin
// dashboard's JS, and an admin never downloads the client assessment flow's
// JS until they actually navigate there. This is the single biggest lever
// for a fast first paint on a slow mobile connection.
const Landing = lazy(() => import('./pages/client/Landing.jsx'))
const Assessment = lazy(() => import('./pages/client/Assessment.jsx'))
const TrackRequest = lazy(() => import('./pages/client/TrackRequest.jsx'))

const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const NewClient = lazy(() => import('./pages/NewClient.jsx'))
const ClientRecords = lazy(() => import('./pages/ClientRecords.jsx'))
const GenerateQuotation = lazy(() => import('./pages/GenerateQuotation.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const Requests = lazy(() => import('./pages/Requests.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const PricingDatabase = lazy(() => import('./pages/PricingDatabase.jsx'))
const RulesPage = lazy(() => import('./pages/RulesPage.jsx'))
const Administrators = lazy(() => import('./pages/Administrators.jsx'))
const AggregateSettings = lazy(() => import('./pages/AggregateSettings.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
    </div>
  )
}

function AdminArea({ children }) {
  // Realtime notifications + sound are only needed inside the Admin Portal -
  // scoping the subscription here keeps the public Client Portal free of it.
  return <NotificationProvider>{children}</NotificationProvider>
}

export default function App() {
  // Show a friendly explanation instead of a blank white screen whenever the
  // Supabase environment variables haven't been set yet.
  if (!isSupabaseConfigured) {
    return <ConfigNeeded />
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* -------- Public Client Portal -------- */}
        <Route path="/" element={<Landing />} />
        <Route path="/check-eligibility" element={<Assessment />} />
        <Route path="/request-assistance" element={<Assessment />} />
        <Route path="/track-request" element={<TrackRequest />} />

        {/* -------- Admin Portal -------- */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminArea><Dashboard /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute><AdminArea><Requests /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute><AdminArea><Notifications /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/new-client" element={<ProtectedRoute><AdminArea><NewClient /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/clients" element={<ProtectedRoute><AdminArea><ClientRecords /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/quotation" element={<ProtectedRoute><AdminArea><GenerateQuotation /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute><AdminArea><Checkout /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute requireSuperAdmin><AdminArea><PricingDatabase /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/benchmarks" element={<ProtectedRoute requireSuperAdmin><AdminArea><PricingDatabase /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/rules" element={<ProtectedRoute requireSuperAdmin><AdminArea><RulesPage /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/aggregate-settings" element={<ProtectedRoute requireSuperAdmin><AdminArea><AggregateSettings /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/administrators" element={<ProtectedRoute requireSuperAdmin><AdminArea><Administrators /></AdminArea></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireSuperAdmin><AdminArea><Settings /></AdminArea></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
