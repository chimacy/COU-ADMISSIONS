import React, { useEffect, useRef, useState } from 'react'
import {
  Save, Upload, Trash2, Download, Building2, Loader2, Palette,
} from 'lucide-react'
import DashboardLayout from '../components/Layout/DashboardLayout.jsx'
import Card from '../components/UI/Card.jsx'
import { Input, Textarea, Select } from '../components/UI/FormField.jsx'
import { useSettings } from '../context/SettingsContext.jsx'
import { exportAllData } from '../utils/db.js'

export default function Settings() {
  const { settings, updateSettings, uploadBrandingImage, loading } = useSettings()
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [exporting, setExporting] = useState(false)
  const logoInputRef = useRef(null)
  const signatureInputRef = useRef(null)

  useEffect(() => { setForm(settings) }, [settings])

  function handleChange(key) {
    return (e) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setSaved(false)
    }
  }

  async function handleUpload(kind) {
    return async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(kind)
      try {
        const url = await uploadBrandingImage(file, kind)
        setForm((f) => ({ ...f, [kind === 'logo' ? 'logo_url' : 'signature_url']: url }))
      } catch (err) {
        alert(err.message || 'Upload failed.')
      } finally {
        setUploading('')
      }
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // updateSettings writes to Supabase - a realtime event then pushes this
      // exact change out to every other logged-in device/browser instantly,
      // which is what makes branding permanent no matter where it's viewed.
      await updateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chimacy-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Settings">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-600" />
            <div>
              <h3 className="font-bold font-display text-slate-800 dark:text-white">Company & Institution Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Changes here apply everywhere — every admin, every device, every generated PDF — the moment you save.</p>
            </div>
          </div>

          <Input label="Company / Brand Name" value={form.company_name} onChange={handleChange('company_name')} />
          <Input label="Tagline" value={form.tagline} onChange={handleChange('tagline')} />
          <Input label="Institution Name" value={form.institution_name} onChange={handleChange('institution_name')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Phone Number" value={form.phone} onChange={handleChange('phone')} />
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
          </div>
          <Textarea label="Address" value={form.address} onChange={handleChange('address')} rows={2} />
          <Textarea label="Footer Text (appears on every PDF page)" value={form.footer_text} onChange={handleChange('footer_text')} rows={2} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Currency" value={form.currency} onChange={handleChange('currency')}>
              <option value="NGN">Nigerian Naira (NGN)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="GBP">British Pound (GBP)</option>
            </Select>
            <Input label="Currency Symbol" value={form.currency_symbol} onChange={handleChange('currency_symbol')} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
            </button>
            {saved && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 self-center">Settings saved — synced to all devices ✓</span>}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold font-display text-slate-800 dark:text-white">Brand Colors</h3>
            </div>
            <div className="space-y-4">
              <ColorField label="Primary Color" value={form.primary_color} onChange={handleChange('primary_color')} />
              <ColorField label="Accent Color" value={form.accent_color} onChange={handleChange('accent_color')} />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold font-display text-slate-800 dark:text-white mb-4">Branding Assets</h3>
            <div className="space-y-4">
              <div>
                <p className="label-field">Company Logo</p>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-primary-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-primary-100 dark:border-slate-700">
                    {form.logo_url ? <img src={form.logo_url} alt="Logo" className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6 text-primary-300" />}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => logoInputRef.current?.click()} className="btn-secondary !px-3" disabled={uploading === 'logo'}>
                      {uploading === 'logo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </button>
                    {form.logo_url && <button onClick={() => setForm((f) => ({ ...f, logo_url: '' }))} className="btn-danger !px-3"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload('logo')} />
                </div>
              </div>

              <div>
                <p className="label-field">Authorized Signature</p>
                <div className="flex items-center gap-3">
                  <div className="h-16 w-28 rounded-xl bg-primary-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-primary-100 dark:border-slate-700">
                    {form.signature_url ? <img src={form.signature_url} alt="Signature" className="h-full w-full object-contain" /> : <span className="text-xs text-slate-400">No signature</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => signatureInputRef.current?.click()} className="btn-secondary !px-3" disabled={uploading === 'signature'}>
                      {uploading === 'signature' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </button>
                    {form.signature_url && <button onClick={() => setForm((f) => ({ ...f, signature_url: '' }))} className="btn-danger !px-3"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload('signature')} />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Uploaded here, save Settings to publish it everywhere.</p>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold font-display text-slate-800 dark:text-white mb-2">Backup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Download a full JSON snapshot of programmes, rules, and client/quotation records for offline reporting or record-keeping. The live data itself always lives in your Supabase database, accessible from any device.
            </p>
            <button onClick={handleExport} disabled={exporting} className="btn-secondary w-full">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export Full Backup (JSON)
            </button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <p className="label-field">{label}</p>
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#15803d'} onChange={onChange} className="h-10 w-14 rounded-lg border border-primary-100 dark:border-slate-700 cursor-pointer bg-transparent" />
        <input type="text" value={value || ''} onChange={onChange} className="input-field flex-1" placeholder="#15803d" />
      </div>
    </div>
  )
}
