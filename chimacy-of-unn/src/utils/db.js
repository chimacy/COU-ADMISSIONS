import { supabase } from '../lib/supabaseClient.js'

/* =============================== PROGRAMMES =============================== */

export async function getProgrammes() {
  const { data, error } = await supabase.from('programmes').select('*').order('grade').order('name')
  if (error) throw error
  return (data || []).map(mapProgrammeFromDb)
}

export async function saveProgramme(programme) {
  const payload = mapProgrammeToDb(programme)
  if (programme.id) {
    const { data, error } = await supabase.from('programmes').update(payload).eq('id', programme.id).select().single()
    if (error) throw error
    return mapProgrammeFromDb(data)
  }
  const { data, error } = await supabase.from('programmes').insert(payload).select().single()
  if (error) throw error
  return mapProgrammeFromDb(data)
}

export async function deleteProgramme(id) {
  const { error } = await supabase.from('programmes').delete().eq('id', id)
  if (error) throw error
}

function mapProgrammeFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    price: Number(row.price),
    doublePrice: Number(row.double_price),
    minimumScore: row.minimum_score,
    preferredScore: row.preferred_score,
    doubleWorkingScore: row.double_working_score,
    normalBenchmark: row.normal_benchmark,
    doubleBenchmark: row.double_benchmark,
    priceEstimated: row.price_estimated,
    benchmarkDefault: row.benchmark_default,
  }
}

function mapProgrammeToDb(p) {
  return {
    name: p.name,
    grade: p.grade,
    price: Number(p.price) || 0,
    double_price: Number(p.doublePrice) || 0,
    minimum_score: Number(p.minimumScore) || 0,
    preferred_score: Number(p.preferredScore) || 0,
    double_working_score: Number(p.doubleWorkingScore) || 0,
    normal_benchmark: p.normalBenchmark || '',
    double_benchmark: p.doubleBenchmark || '',
    price_estimated: !!p.priceEstimated,
    benchmark_default: !!p.benchmarkDefault,
  }
}

export const GRADE_ORDER = [
  'First Grade',
  'Second Grade Grade I',
  'Second Grade Grade II',
  'Third Grade',
  'Fourth Grade',
]

/* ================================== RULES ================================== */

export async function getRules() {
  const { data, error } = await supabase.from('rules').select('*').order('sort_order')
  if (error) throw error
  return (data || []).map((r) => ({ id: r.id, title: r.title, text: r.body }))
}

export async function saveRule(rule, sortOrder = 0) {
  const payload = { title: rule.title || '', body: rule.text, sort_order: sortOrder }
  if (rule.id) {
    const { data, error } = await supabase.from('rules').update(payload).eq('id', rule.id).select().single()
    if (error) throw error
    return { id: data.id, title: data.title, text: data.body }
  }
  const { data, error } = await supabase.from('rules').insert(payload).select().single()
  if (error) throw error
  return { id: data.id, title: data.title, text: data.body }
}

export async function deleteRule(id) {
  const { error } = await supabase.from('rules').delete().eq('id', id)
  if (error) throw error
}

/* ============================== QUOTATIONS/CLIENTS ============================== */

export async function getQuotations() {
  const { data, error } = await supabase.from('quotations').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapQuotationFromDb)
}

export async function getQuotationById(id) {
  const { data, error } = await supabase.from('quotations').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapQuotationFromDb(data) : null
}

export async function saveQuotation(quotation) {
  const payload = mapQuotationToDb(quotation)
  if (quotation.id) {
    const { data, error } = await supabase.from('quotations').update(payload).eq('id', quotation.id).select().single()
    if (error) throw error
    return mapQuotationFromDb(data)
  }
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('quotations')
    .insert({ ...payload, created_by: userData?.user?.id || null })
    .select()
    .single()
  if (error) throw error
  return mapQuotationFromDb(data)
}

export async function deleteQuotation(id) {
  const { error } = await supabase.from('quotations').delete().eq('id', id)
  if (error) throw error
}

export async function markQuotationPaid(id, { amount, method, date, invoiceNumber }) {
  const payload = {
    paid: true,
    paid_amount: amount,
    payment_method: method,
    paid_date: date,
    invoice_number: invoiceNumber,
  }
  const { data, error } = await supabase.from('quotations').update(payload).eq('id', id).select().single()
  if (error) throw error
  return mapQuotationFromDb(data)
}

function mapQuotationFromDb(row) {
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    clientName: row.client_name,
    parentName: row.parent_name,
    phone: row.phone,
    email: row.email,
    jambRegNumber: row.jamb_reg_number,
    jambScore: row.jamb_score,
    programmeId: row.programme_id,
    programme: row.programme_name,
    programmeGrade: row.programme_grade,
    workingType: row.working_type,
    price: Number(row.price) || 0,
    status: row.status,
    benchmarkStatus: row.benchmark_status,
    recommendation: row.recommendation,
    category: row.category,
    remarks: row.remarks,
    date: row.quote_date,
    rulesSnapshot: row.rules_snapshot || [],
    paid: row.paid,
    paidAmount: Number(row.paid_amount) || 0,
    paidDate: row.paid_date,
    paymentMethod: row.payment_method,
    invoiceNumber: row.invoice_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapQuotationToDb(q) {
  return {
    client_name: q.clientName,
    parent_name: q.parentName || '',
    phone: q.phone || '',
    email: q.email || '',
    jamb_reg_number: q.jambRegNumber || '',
    jamb_score: Number(q.jambScore) || 0,
    programme_id: q.programmeId || null,
    programme_name: q.programme || '',
    programme_grade: q.programmeGrade || '',
    working_type: q.workingType || '',
    price: Number(q.price) || 0,
    status: q.status || '',
    benchmark_status: q.benchmarkStatus || '',
    recommendation: q.recommendation || '',
    category: q.category || 'New Application',
    remarks: q.remarks || '',
    quote_date: q.date || new Date().toISOString().slice(0, 10),
    rules_snapshot: q.rulesSnapshot || [],
  }
}

/* ============================== BACKUP (export only) ============================== */

export async function exportAllData() {
  const [programmes, rules, quotations] = await Promise.all([
    getProgrammes(), getRules(), getQuotations(),
  ])
  return { programmes, rules, quotations, exportedAt: new Date().toISOString() }
}
