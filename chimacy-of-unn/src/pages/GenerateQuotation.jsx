import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDown, Search, Sparkles, UserPlus, Loader2 } from 'lucide-react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import Card from '../components/UI/Card.jsx'
import { Select, Input } from '../components/UI/FormField.jsx'
import { getProgrammes, getQuotations } from '../utils/db.js'
import { evaluateCandidate, statusBadgeStyle } from '../utils/evaluation.js'
import { formatCurrency, formatDate } from '../utils/format.js'
import { useSettings } from '../context/SettingsContext.jsx'
import { downloadQuotationPDF } from '../utils/pdfGenerator.js'

export default function GenerateQuotation() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [programmes, setProgrammes] = useState([])
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [programmeId, setProgrammeId] = useState('')
  const [score, setScore] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.all([getProgrammes(), getQuotations()])
      .then(([p, q]) => { setProgrammes(p); setQuotations(q) })
      .finally(() => setLoading(false))
  }, [])

  const selectedProgramme = useMemo(
    () => programmes.find((p) => p.id === programmeId) || null,
    [programmes, programmeId],
  )
  const evaluation = useMemo(() => evaluateCandidate(selectedProgramme, score), [selectedProgramme, score])

  const filteredQuotations = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return quotations.slice(0, 8)
    return quotations.filter((r) =>
      [r.clientName, r.quotationNumber, r.programme].filter(Boolean).some((f) => f.toLowerCase().includes(q))).slice(0, 8)
  }, [quotations, query])

  return (
    <DashboardLayout title="Generate Quotation">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <h3 className="font-bold font-display text-slate-800 dark:text-white">Quick Eligibility Checker</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Check a programme's benchmark and price instantly. To save this as a client record and produce a full quotation PDF, use the <strong>New Client</strong> form.
          </p>

          <div className="space-y-4">
            <Select label="Programme" value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}>
              <option value="">-- Select a programme --</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.grade})</option>
              ))}
            </Select>
            <Input label="JAMB Score" type="number" min="0" max="400" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 272" />
          </div>

          {selectedProgramme && (
            <div className="mt-5 glass-panel p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</span>
                <span className={`badge ${statusBadgeStyle(evaluation.status)}`}>{evaluation.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Working Type</span>
                <span className="font-medium text-slate-800 dark:text-white">{evaluation.workingType || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Price</span>
                <span className="font-bold text-primary-700 dark:text-primary-400">{formatCurrency(evaluation.price, settings.currency_symbol)}</span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Recommendation</span>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{evaluation.recommendation}</p>
              </div>
              <button
                onClick={() => navigate(`/new-client?prefill=${selectedProgramme.id}`)}
                className="btn-primary w-full mt-2"
              >
                <UserPlus className="h-4 w-4" /> Continue to Full Quotation
              </button>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-bold font-display text-slate-800 dark:text-white mb-4">Regenerate a Saved Quotation</h3>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved clients..."
              className="input-field !pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary-500 mx-auto" /></div>
          ) : filteredQuotations.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No saved quotations found.</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filteredQuotations.map((r) => (
                <div key={r.id} className="glass-panel p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{r.clientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {r.programme} &middot; {formatDate(r.date)} &middot; {formatCurrency(r.price, settings.currency_symbol)}
                    </p>
                  </div>
                  <button onClick={() => downloadQuotationPDF(r, settings)} className="btn-secondary !px-3 shrink-0">
                    <FileDown className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
