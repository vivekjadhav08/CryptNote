import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
import Swal from "sweetalert2";

const baseUrl = process.env.REACT_APP_API_BASE_URL;
const token = () => localStorage.getItem("token");
const CATEGORIES = ["Home Loan", "Car Loan", "Personal Loan", "Education", "Credit Card", "Other"];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// ── ADD / EDIT MODAL ───────────────────────────────────────
const EMIFormModal = ({ existing, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: existing?.name || "",
    totalAmount: existing?.totalAmount || "",
    emiAmount: existing?.emiAmount || "",
    durationMonths: existing?.durationMonths || "",
    startDate: existing?.startDate ? new Date(existing.startDate).toISOString().slice(0, 10) : "",
    interestRate: existing?.interestRate || "",
    lender: existing?.lender || "",
    category: existing?.category || "Other",
  });
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useContext(DarkModeContext);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-calculate EMI if total + duration filled
  useEffect(() => {
    if (form.totalAmount && form.durationMonths && !form.emiAmount) {
      f("emiAmount", Math.ceil(form.totalAmount / form.durationMonths));
    }
  }, [form.totalAmount, form.durationMonths]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.totalAmount || !form.emiAmount || !form.durationMonths || !form.startDate) {
      alert("Please fill all required fields."); return;
    }
    setLoading(true);
    try {
      const url = existing ? `${baseUrl}/emi/update/${existing._id}` : `${baseUrl}/emi/add`;
      const method = existing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "auth-token": token() }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { onSaved(data); onClose(); }
      else alert(data.error || "Failed");
    } catch { alert("Server error"); }
    setLoading(false);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.classList.add("modal-open");
    return () => { window.removeEventListener("keydown", h); document.body.classList.remove("modal-open"); };
  }, [onClose]);

  return (
    <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ maxWidth: 520 }}>
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--gk-border)', paddingBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{existing ? "Edit EMI" : "Add New EMI"}</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '18px 24px' }}>
          <div className="gk-form-group">
            <label>EMI Name *</label>
            <input className="gk-form-input" placeholder="e.g. Home Loan, Car EMI" value={form.name} onChange={e => f("name", e.target.value)} required />
          </div>
          <div className="gk-form-row">
            <div className="gk-form-group">
              <label>Total Amount (₹) *</label>
              <input className="gk-form-input" type="number" placeholder="500000" value={form.totalAmount} onChange={e => f("totalAmount", e.target.value)} required />
            </div>
            <div className="gk-form-group">
              <label>Duration (Months) *</label>
              <input className="gk-form-input" type="number" placeholder="24" value={form.durationMonths} onChange={e => f("durationMonths", e.target.value)} required />
            </div>
          </div>
          <div className="gk-form-row">
            <div className="gk-form-group">
              <label>Monthly EMI (₹) *</label>
              <input className="gk-form-input" type="number" placeholder="Auto-calculated" value={form.emiAmount} onChange={e => f("emiAmount", e.target.value)} required />
            </div>
            <div className="gk-form-group">
              <label>Interest Rate (%)</label>
              <input className="gk-form-input" type="number" step="0.1" placeholder="8.5" value={form.interestRate} onChange={e => f("interestRate", e.target.value)} />
            </div>
          </div>
          <div className="gk-form-row">
            <div className="gk-form-group">
              <label>Start Date *</label>
              <input className="gk-form-input" type="date" value={form.startDate} onChange={e => f("startDate", e.target.value)} required />
            </div>
            <div className="gk-form-group">
              <label>Category</label>
              <select className="gk-form-input" value={form.category} onChange={e => f("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="gk-form-group">
            <label>Lender / Bank</label>
            <input className="gk-form-input" placeholder="e.g. HDFC Bank, SBI" value={form.lender} onChange={e => f("lender", e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="gk-btn gk-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="gk-btn gk-btn-primary" disabled={loading}>{loading ? "Saving…" : existing ? "Update EMI" : "Add EMI"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── ADD PAYMENT MODAL ──────────────────────────────────────
const AddPaymentModal = ({ emi, onClose, onSaved }) => {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(emi.emiAmount);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.classList.add("modal-open");
    return () => { window.removeEventListener("keydown", h); document.body.classList.remove("modal-open"); };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/emi/payment/${emi._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": token() },
        body: JSON.stringify({ paidDate, amount, note })
      });
      const data = await res.json();
      if (res.ok) { onSaved(data); onClose(); }
      else alert(data.error || "Failed");
    } catch { alert("Server error"); }
    setLoading(false);
  };

  return (
    <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ maxWidth: 400 }}>
        <div style={{ padding: '18px 24px 0', borderBottom: '1px solid var(--gk-border)', paddingBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Mark Payment — {emi.name}</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px' }}>
          <div className="gk-form-group">
            <label>Paid Date</label>
            <input className="gk-form-input" type="date" value={paidDate} onChange={e => setPaidDate(e.target.value)} required />
          </div>
          <div className="gk-form-group">
            <label>Amount Paid (₹)</label>
            <input className="gk-form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="gk-form-group">
            <label>Note (optional)</label>
            <input className="gk-form-input" placeholder="e.g. Paid via UPI" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="gk-btn gk-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="gk-btn gk-btn-success" disabled={loading}>{loading ? "Saving…" : "Mark Paid"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── EMI DETAIL MODAL ───────────────────────────────────────
const EMIDetailModal = ({ emi, onClose, onDeletePayment, onPaymentAdded, onEdit, isDarkMode }) => {
  const [addingPayment, setAddingPayment] = useState(false);
  const paidCount = emi.payments?.length || 0;
  const paidTotal = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const remaining = Math.max(0, emi.totalAmount - paidTotal);
  const progress = Math.min(100, Math.round((paidTotal / emi.totalAmount) * 100));

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.classList.add("modal-open");
    return () => { window.removeEventListener("keydown", h); document.body.classList.remove("modal-open"); };
  }, [onClose]);

  const handleDeletePayment = async (paymentId) => {
    const r = await Swal.fire({ title: "Remove payment?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d93025", confirmButtonText: "Remove", background: isDarkMode ? "#242526" : "#fff", color: isDarkMode ? "#e8eaed" : "#202124" });
    if (r.isConfirmed) onDeletePayment(emi._id, paymentId);
  };

  const progressColor = progress >= 100 ? '#137333' : progress >= 60 ? '#1a73e8' : progress >= 30 ? '#fbbc04' : '#d93025';

  return (
    <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ maxWidth: 560 }}>
        {addingPayment && <AddPaymentModal emi={emi} onClose={() => setAddingPayment(false)} onSaved={(updated) => { onPaymentAdded(updated); setAddingPayment(false); }} />}

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--gk-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{emi.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gk-text-secondary)', marginTop: 2 }}>{emi.lender || emi.category}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="gk-btn gk-btn-outline gk-btn-sm" onClick={onEdit}>✏️ Edit</button>
            <button className="gk-nav-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--gk-border)' }}>
          {[
            { label: "Total Amount", value: fmt(emi.totalAmount) },
            { label: "Monthly EMI", value: fmt(emi.emiAmount) },
            { label: "Duration", value: `${emi.durationMonths} months` },
            { label: "Paid", value: fmt(paidTotal), color: '#137333' },
            { label: "Remaining", value: fmt(remaining), color: remaining > 0 ? '#d93025' : '#137333' },
            { label: "EMIs Paid", value: `${paidCount} / ${emi.durationMonths}` },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--gk-surface)', padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--gk-text-secondary)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color || 'var(--gk-text)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--gk-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--gk-text-secondary)' }}>Progress</span>
            <span style={{ fontWeight: 600, color: progressColor }}>{progress}%</span>
          </div>
          <div className="emi-progress-bar">
            <div className="emi-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gk-text-secondary)', marginTop: 4 }}>
            <span>Start: {fmtDate(emi.startDate)}</span>
            <span>End: {fmtDate(emi.endDate)}</span>
          </div>
        </div>

        {/* Payment history */}
        <div style={{ padding: '14px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Payment History</span>
            <button className="gk-btn gk-btn-success gk-btn-sm" onClick={() => setAddingPayment(true)}>+ Mark Paid</button>
          </div>
          {(!emi.payments || emi.payments.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gk-text-secondary)', fontSize: 14 }}>No payments recorded yet</div>
          ) : (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {[...emi.payments].sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate)).map((p, i) => (
                <div key={p._id || i} className="emi-payment-item">
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{fmtDate(p.paidDate)}</div>
                    {p.note && <div style={{ fontSize: 11, color: 'var(--gk-text-secondary)' }}>{p.note}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="emi-payment-amount">{fmt(p.amount)}</span>
                    <button className="gk-note-action-btn" style={{ fontSize: 13 }} title="Remove" onClick={() => handleDeletePayment(p._id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '0 22px 18px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="gk-btn gk-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── MAIN EMI PAGE ──────────────────────────────────────────
const EMITracker = ({ showAlert }) => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEMI, setEditingEMI] = useState(null);
  const [detailEMI, setDetailEMI] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const fetchEMIs = useCallback(async () => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    try {
      const res = await fetch(`${baseUrl}/emi/all`, { headers: { "auth-token": token() } });
      const data = await res.json();
      setEmis(Array.isArray(data) ? data : []);
    } catch { showAlert("Failed to load EMIs", "error"); }
    setLoading(false);
  }, [navigate, showAlert]);

  useEffect(() => { fetchEMIs(); }, [fetchEMIs]);

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title: "Delete EMI?", text: "All payment history will be lost.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d93025", confirmButtonText: "Delete", background: isDarkMode ? "#242526" : "#fff", color: isDarkMode ? "#e8eaed" : "#202124" });
    if (!r.isConfirmed) return;
    try {
      await fetch(`${baseUrl}/emi/delete/${id}`, { method: "DELETE", headers: { "auth-token": token() } });
      setEmis(prev => prev.filter(e => e._id !== id));
      showAlert("EMI deleted", "success");
    } catch { showAlert("Failed to delete", "error"); }
  };

  const handleDeletePayment = async (emiId, paymentId) => {
    try {
      const res = await fetch(`${baseUrl}/emi/payment/${emiId}/${paymentId}`, { method: "DELETE", headers: { "auth-token": token() } });
      const updated = await res.json();
      setEmis(prev => prev.map(e => e._id === emiId ? updated : e));
      if (detailEMI?._id === emiId) setDetailEMI(updated);
      showAlert("Payment removed", "success");
    } catch { showAlert("Failed", "error"); }
  };

  const getStatus = (emi) => {
    const paidTotal = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0;
    if (paidTotal >= emi.totalAmount) return "completed";
    if (new Date(emi.endDate) < new Date()) return "overdue";
    return "active";
  };

  const getProgress = (emi) => {
    const paidTotal = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0;
    return Math.min(100, Math.round((paidTotal / emi.totalAmount) * 100));
  };

  const filtered = emis.filter(e => filter === "all" || getStatus(e) === filter);

  // Summary stats
  const totalEMIPerMonth = emis.filter(e => getStatus(e) === "active").reduce((s, e) => s + e.emiAmount, 0);
  const totalOutstanding = emis.reduce((s, e) => {
    const paid = e.payments?.reduce((a, p) => a + p.amount, 0) || 0;
    return s + Math.max(0, e.totalAmount - paid);
  }, 0);
  const completedCount = emis.filter(e => getStatus(e) === "completed").length;
  const activeCount = emis.filter(e => getStatus(e) === "active").length;

  if (loading) return <div className="gk-page"><div className="gk-empty"><div className="gk-empty-icon" style={{ fontSize: 40 }}>⏳</div><p>Loading EMIs…</p></div></div>;

  return (
    <div className="gk-page">
      {showForm && (
        <EMIFormModal
          existing={editingEMI}
          onClose={() => { setShowForm(false); setEditingEMI(null); }}
          onSaved={(data) => {
            if (editingEMI) setEmis(prev => prev.map(e => e._id === data._id ? data : e));
            else setEmis(prev => [data, ...prev]);
            showAlert(editingEMI ? "EMI updated!" : "EMI added!", "success");
          }}
        />
      )}

      {detailEMI && (
        <EMIDetailModal
          emi={detailEMI}
          isDarkMode={isDarkMode}
          onClose={() => setDetailEMI(null)}
          onDeletePayment={handleDeletePayment}
          onPaymentAdded={(updated) => {
            setEmis(prev => prev.map(e => e._id === updated._id ? updated : e));
            setDetailEMI(updated);
            showAlert("Payment recorded!", "success");
          }}
          onEdit={() => { setEditingEMI(detailEMI); setDetailEMI(null); setShowForm(true); }}
        />
      )}

      {/* Header */}
      <div className="emi-header">
        <div>
          <h2 style={{ margin: 0, fontWeight: 500 }}>💳 EMI Tracker</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--gk-text-secondary)', fontSize: 14 }}>Track all your loans and EMI payments</p>
        </div>
        <button className="gk-btn gk-btn-primary" onClick={() => { setEditingEMI(null); setShowForm(true); }}>
          + Add EMI
        </button>
      </div>

      {/* Stats */}
      {emis.length > 0 && (
        <div className="emi-stats-row">
          <div className="emi-stat-card">
            <div className="emi-stat-label">Total EMIs</div>
            <div className="emi-stat-value primary">{emis.length}</div>
          </div>
          <div className="emi-stat-card">
            <div className="emi-stat-label">Active</div>
            <div className="emi-stat-value">{activeCount}</div>
          </div>
          <div className="emi-stat-card">
            <div className="emi-stat-label">Monthly Outflow</div>
            <div className="emi-stat-value danger">{fmt(totalEMIPerMonth)}</div>
          </div>
          <div className="emi-stat-card">
            <div className="emi-stat-label">Total Outstanding</div>
            <div className="emi-stat-value danger">{fmt(totalOutstanding)}</div>
          </div>
          <div className="emi-stat-card">
            <div className="emi-stat-label">Completed</div>
            <div className="emi-stat-value success">{completedCount}</div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {emis.length > 0 && (
        <div className="gk-tabs">
          {[["all","All"],["active","Active"],["overdue","Overdue"],["completed","Completed"]].map(([v,l]) => (
            <button key={v} className={`gk-tab ${filter===v?'active':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      )}

      {/* Empty */}
      {emis.length === 0 && (
        <div className="gk-empty">
          <div className="gk-empty-icon">💳</div>
          <h3>No EMIs yet</h3>
          <p>Click "Add EMI" to start tracking your loans</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 && emis.length > 0 && (
        <div className="gk-empty">
          <div className="gk-empty-icon" style={{ fontSize: 48 }}>📭</div>
          <h3>No {filter} EMIs</h3>
        </div>
      )}

      <div className="emi-grid">
        {filtered.map(emi => {
          const status = getStatus(emi);
          const progress = getProgress(emi);
          const paidCount = emi.payments?.length || 0;
          const paidTotal = emi.payments?.reduce((s, p) => s + p.amount, 0) || 0;
          const remaining = Math.max(0, emi.totalAmount - paidTotal);
          const nextDue = (() => {
            if (status === "completed") return null;
            const last = emi.payments?.length
              ? new Date(Math.max(...emi.payments.map(p => new Date(p.paidDate))))
              : new Date(emi.startDate);
            const next = new Date(last); next.setMonth(next.getMonth() + 1);
            return next;
          })();
          const progressColor = progress >= 100 ? '#137333' : progress >= 60 ? '#1a73e8' : progress >= 30 ? '#fbbc04' : '#d93025';

          return (
            <div className="emi-card" key={emi._id} onClick={() => setDetailEMI(emi)} style={{ cursor: 'pointer' }}>
              <div className="emi-card-header">
                <div>
                  <div className="emi-card-title">{emi.name}</div>
                  <div className="emi-card-lender">{emi.lender || emi.category}</div>
                </div>
                <span className={`emi-badge ${status}`}>
                  {status === "active" ? "🟢 Active" : status === "completed" ? "✅ Done" : "🔴 Overdue"}
                </span>
              </div>

              <div className="emi-card-body">
                <div className="emi-info-row"><span>Total Amount</span><span>{fmt(emi.totalAmount)}</span></div>
                <div className="emi-info-row"><span>Monthly EMI</span><span style={{ color: 'var(--gk-primary)', fontWeight: 600 }}>{fmt(emi.emiAmount)}</span></div>
                <div className="emi-info-row"><span>Paid</span><span style={{ color: '#137333' }}>{fmt(paidTotal)} ({paidCount}/{emi.durationMonths})</span></div>
                <div className="emi-info-row"><span>Remaining</span><span style={{ color: remaining > 0 ? 'var(--gk-danger)' : '#137333' }}>{fmt(remaining)}</span></div>
                {nextDue && <div className="emi-info-row"><span>Next Due</span><span>{fmtDate(nextDue)}</span></div>}
                {emi.interestRate > 0 && <div className="emi-info-row"><span>Interest Rate</span><span>{emi.interestRate}%</span></div>}

                <div className="emi-progress-bar">
                  <div className="emi-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gk-text-secondary)' }}>
                  <span>{fmtDate(emi.startDate)}</span>
                  <span style={{ fontWeight: 600, color: progressColor }}>{progress}%</span>
                  <span>{fmtDate(emi.endDate)}</span>
                </div>
              </div>

              <div className="emi-card-footer" onClick={e => e.stopPropagation()}>
                <button className="gk-btn gk-btn-success gk-btn-sm"
                  onClick={e => { e.stopPropagation(); setDetailEMI(emi); }}
                  disabled={status === "completed"}>
                  💰 Pay
                </button>
                <button className="gk-btn gk-btn-outline gk-btn-sm"
                  onClick={e => { e.stopPropagation(); setEditingEMI(emi); setShowForm(true); }}>
                  ✏️ Edit
                </button>
                <button className="gk-btn gk-btn-sm" style={{ background: '#fce8e6', color: '#d93025' }}
                  onClick={e => { e.stopPropagation(); handleDelete(emi._id); }}>
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EMITracker;
