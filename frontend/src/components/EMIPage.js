import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/mode/DarkModeContext";
import Swal from "sweetalert2";

const baseUrl = process.env.REACT_APP_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

const EMI_COLORS = [
  "#cbf0f8", "#d7aefb", "#fdcfe8", "#ccff90",
  "#fff475", "#fbbc04", "#f28b82", "#a7ffeb",
];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

// ── ADD/EDIT EMI MODAL ─────────────────────────────────────────
const EMIFormModal = ({ emi, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: emi?.name || "",
    totalAmount: emi?.totalAmount || "",
    emiAmount: emi?.emiAmount || "",
    durationMonths: emi?.durationMonths || "",
    startDate: emi?.startDate ? new Date(emi.startDate).toISOString().slice(0, 10) : "",
    interestRate: emi?.interestRate || "",
    lender: emi?.lender || "",
    color: emi?.color || "#cbf0f8",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.totalAmount || !form.emiAmount || !form.durationMonths || !form.startDate) {
      alert("Please fill all required fields."); return;
    }
    setSaving(true);
    try {
      const url = emi ? `${baseUrl}/emi/update/${emi._id}` : `${baseUrl}/emi/add`;
      const method = emi ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "auth-token": getToken() }, body: JSON.stringify(form) });
      const data = await res.json();
      onSave(data, !!emi);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const inp = { className: "gk-input", style: { marginBottom: 0 } };

  return (
    <div className="gk-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ maxWidth: 520 }}>
        <div className="emi-detail-header">
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{emi ? "Edit EMI" : "Add New EMI"}</h2>
          <button className="gk-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="gk-modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="gk-modal-field" style={{ gridColumn: '1/-1' }}>
              <label>EMI Name *</label>
              <input {...inp} type="text" placeholder="e.g. Home Loan, Car Loan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Total Amount (₹) *</label>
              <input {...inp} type="number" placeholder="500000" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Monthly EMI (₹) *</label>
              <input {...inp} type="number" placeholder="10000" value={form.emiAmount} onChange={e => setForm(p => ({ ...p, emiAmount: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Duration (months) *</label>
              <input {...inp} type="number" placeholder="60" value={form.durationMonths} onChange={e => setForm(p => ({ ...p, durationMonths: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Start Date *</label>
              <input {...inp} type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Interest Rate (% p.a.)</label>
              <input {...inp} type="number" placeholder="8.5" value={form.interestRate} onChange={e => setForm(p => ({ ...p, interestRate: e.target.value }))} />
            </div>
            <div className="gk-modal-field">
              <label>Lender / Bank</label>
              <input {...inp} type="text" placeholder="SBI, HDFC…" value={form.lender} onChange={e => setForm(p => ({ ...p, lender: e.target.value }))} />
            </div>
            <div className="gk-modal-field" style={{ gridColumn: '1/-1' }}>
              <label>Card Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {EMI_COLORS.map(c => (
                  <button key={c} className={`gk-color-dot ${form.color === c ? 'active' : ''}`}
                    style={{ background: c, border: `2px solid ${form.color === c ? '#202124' : 'var(--gk-border)'}`, width: 32, height: 32 }}
                    onClick={() => setForm(p => ({ ...p, color: c }))} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="gk-modal-footer">
          <button className="gk-btn gk-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="gk-btn gk-btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : emi ? "Update" : "Add EMI"}</button>
        </div>
      </div>
    </div>
  );
};

// ── EMI DETAIL MODAL ───────────────────────────────────────────
const EMIDetailModal = ({ emi, onClose, onPaymentAdd, onPaymentDelete, onEdit, onDelete }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [payForm, setPayForm] = useState({ paidDate: new Date().toISOString().slice(0, 10), amount: emi.emiAmount, note: "" });
  const [adding, setAdding] = useState(false);

  const paidTotal = emi.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = emi.totalAmount - paidTotal;
  const paidCount = emi.payments.length;
  const remainingCount = Math.max(0, emi.durationMonths - paidCount);
  const progress = Math.min(100, Math.round((paidTotal / emi.totalAmount) * 100));
  const isDone = remainingCount === 0 || remaining <= 0;

  const handleAddPayment = async () => {
    if (!payForm.paidDate || !payForm.amount) return;
    setAdding(true);
    try {
      const res = await fetch(`${baseUrl}/emi/payment/${emi._id}`, { method: "POST", headers: { "Content-Type": "application/json", "auth-token": getToken() }, body: JSON.stringify(payForm) });
      const data = await res.json();
      onPaymentAdd(data);
      setPayForm({ paidDate: new Date().toISOString().slice(0, 10), amount: emi.emiAmount, note: "" });
    } catch (e) { console.error(e); }
    setAdding(false);
  };

  const handleDeletePayment = async (paymentId) => {
    const r = await Swal.fire({ title: "Remove payment?", icon: "warning", showCancelButton: true, confirmButtonColor: "#d93025", confirmButtonText: "Remove", background: isDarkMode ? "#242526" : "#fff", color: isDarkMode ? "#e4e6eb" : "#202124" });
    if (!r.isConfirmed) return;
    const res = await fetch(`${baseUrl}/emi/payment/${emi._id}/${paymentId}`, { method: "DELETE", headers: { "auth-token": getToken() } });
    const data = await res.json();
    onPaymentDelete(data);
  };

  const sortedPayments = [...emi.payments].sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));

  return (
    <div className="gk-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal emi-detail-modal" style={{ maxWidth: 640, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="emi-detail-header" style={{ background: emi.color || '#cbf0f8' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#202124' }}>{emi.name}</h2>
            {emi.lender && <div style={{ fontSize: 13, color: '#5f6368', marginTop: 2 }}>{emi.lender}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`emi-badge ${isDone ? 'emi-badge-done' : 'emi-badge-active'}`}>
              {isDone ? "✅ Completed" : "🔄 Active"}
            </span>
            <button className="gk-icon-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="gk-modal-body">
          {/* Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total Amount", value: fmt(emi.totalAmount), cls: "" },
              { label: "Monthly EMI", value: fmt(emi.emiAmount), cls: "blue" },
              { label: "Paid", value: fmt(paidTotal), cls: "green" },
              { label: "Remaining", value: fmt(Math.max(0, remaining)), cls: remaining <= 0 ? "green" : "orange" },
              { label: "Paid EMIs", value: `${paidCount} / ${emi.durationMonths}`, cls: "" },
              { label: "Remaining EMIs", value: remainingCount, cls: remainingCount === 0 ? "green" : "red" },
            ].map((s, i) => (
              <div key={i} className="emi-stat" style={{ padding: '12px 14px' }}>
                <div className="emi-stat-label">{s.label}</div>
                <div className={`emi-stat-value ${s.cls}`} style={{ fontSize: 18 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--gk-text-secondary)', marginBottom: 6 }}>
              <span>Progress</span><span style={{ fontWeight: 600 }}>{progress}%</span>
            </div>
            <div className="emi-progress-bar">
              <div className={`emi-progress-fill ${isDone ? 'done' : ''}`} style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gk-text-secondary)', marginTop: 4 }}>
              <span>Start: {fmtDate(emi.startDate)}</span>
              <span>End: {fmtDate(emi.endDate)}</span>
            </div>
          </div>

          {/* Add payment */}
          {!isDone && (
            <div className="emi-add-payment">
              <h4>➕ Mark Payment</h4>
              <div className="emi-pay-row">
                <input className="gk-input" type="date" value={payForm.paidDate} onChange={e => setPayForm(p => ({ ...p, paidDate: e.target.value }))} style={{ flex: 1, minWidth: 130, padding: '9px 12px', fontSize: 14 }} />
                <input className="gk-input" type="number" placeholder="Amount ₹" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} style={{ flex: 1, minWidth: 110, padding: '9px 12px', fontSize: 14 }} />
                <input className="gk-input" type="text" placeholder="Note (optional)" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))} style={{ flex: 2, minWidth: 120, padding: '9px 12px', fontSize: 14 }} />
                <button className="gk-btn gk-btn-success" onClick={handleAddPayment} disabled={adding} style={{ whiteSpace: 'nowrap' }}>
                  {adding ? "…" : "✓ Paid"}
                </button>
              </div>
            </div>
          )}

          {/* Payment history */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--gk-text)' }}>
              Payment History ({emi.payments.length})
            </h4>
            {sortedPayments.length === 0 ? (
              <p style={{ color: 'var(--gk-text-secondary)', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>No payments recorded yet</p>
            ) : (
              <div className="emi-payment-list">
                {sortedPayments.map((p, i) => (
                  <div key={p._id || i} className="emi-payment-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <div>
                        <div style={{ fontWeight: 500 }}>{fmt(p.amount)}</div>
                        <div style={{ fontSize: 12, color: 'var(--gk-text-secondary)' }}>{fmtDate(p.paidDate)}{p.note ? ` · ${p.note}` : ''}</div>
                      </div>
                    </div>
                    <button className="gk-card-btn" title="Remove payment" onClick={() => handleDeletePayment(p._id)} style={{ color: 'var(--gk-danger)', fontSize: 14 }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="gk-modal-footer">
          <button className="gk-btn gk-btn-danger" onClick={onDelete}>Delete EMI</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gk-btn gk-btn-outline" onClick={onEdit}>✏️ Edit</button>
            <button className="gk-btn gk-btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── EMI CARD ───────────────────────────────────────────────────
const EMICard = ({ emi, onClick }) => {
  const paidTotal = emi.payments.reduce((s, p) => s + p.amount, 0);
  const progress = Math.min(100, Math.round((paidTotal / emi.totalAmount) * 100));
  const paidCount = emi.payments.length;
  const remainingCount = Math.max(0, emi.durationMonths - paidCount);
  const isDone = remainingCount === 0 || paidTotal >= emi.totalAmount;
  const isOverdue = !isDone && new Date(emi.endDate) < new Date();

  return (
    <div className="emi-card" onClick={onClick} style={{ borderTop: `4px solid ${emi.color || '#cbf0f8'}` }}>
      <div className="emi-card-header">
        <div>
          <div className="emi-card-name">{emi.name}</div>
          {emi.lender && <div className="emi-card-lender">🏦 {emi.lender}</div>}
        </div>
        <span className={`emi-badge ${isDone ? 'emi-badge-done' : isOverdue ? 'emi-badge-overdue' : 'emi-badge-active'}`}>
          {isDone ? "✅ Done" : isOverdue ? "⚠️ Overdue" : "🔄 Active"}
        </span>
      </div>

      <div className="emi-card-body">
        <div className="emi-info-row"><span>Total</span><strong>{fmt(emi.totalAmount)}</strong></div>
        <div className="emi-info-row"><span>Monthly EMI</span><strong>{fmt(emi.emiAmount)}</strong></div>
        <div className="emi-info-row"><span>Paid</span><strong style={{ color: '#137333' }}>{fmt(paidTotal)}</strong></div>
        <div className="emi-info-row"><span>Remaining</span><strong style={{ color: isDone ? '#137333' : '#e37400' }}>{fmt(Math.max(0, emi.totalAmount - paidTotal))}</strong></div>

        <div className="emi-progress-bar">
          <div className={`emi-progress-fill ${isDone ? 'done' : ''}`} style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gk-text-secondary)' }}>
          <span>{paidCount}/{emi.durationMonths} EMIs paid</span>
          <span>{progress}%</span>
        </div>

        <div style={{ fontSize: 12, color: 'var(--gk-text-secondary)', marginTop: 8, display: 'flex', gap: 12 }}>
          <span>📅 {fmtDate(emi.startDate)}</span>
          <span>🏁 {fmtDate(emi.endDate)}</span>
        </div>
      </div>
    </div>
  );
};

// ── MAIN EMI PAGE ──────────────────────────────────────────────
const EMIPage = ({ showAlert }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEMI, setSelectedEMI] = useState(null);
  const [editingEMI, setEditingEMI] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchEMIs();
  }, []); // eslint-disable-line

  const fetchEMIs = async () => {
    try {
      const res = await fetch(`${baseUrl}/emi/fetchall`, { headers: { "auth-token": getToken() } });
      const data = await res.json();
      setEmis(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = (data, isEdit) => {
    if (isEdit) { setEmis(prev => prev.map(e => e._id === data._id ? data : e)); showAlert("EMI updated!", "success"); }
    else { setEmis(prev => [data, ...prev]); showAlert("EMI added!", "success"); }
    setShowAddModal(false); setEditingEMI(null);
    if (selectedEMI && isEdit) setSelectedEMI(data);
  };

  const handleDelete = async () => {
    const r = await Swal.fire({ title: "Delete this EMI?", text: "All payment history will be lost.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d93025", confirmButtonText: "Delete", background: isDarkMode ? "#242526" : "#fff", color: isDarkMode ? "#e4e6eb" : "#202124" });
    if (!r.isConfirmed) return;
    await fetch(`${baseUrl}/emi/delete/${selectedEMI._id}`, { method: "DELETE", headers: { "auth-token": getToken() } });
    setEmis(prev => prev.filter(e => e._id !== selectedEMI._id));
    setSelectedEMI(null); showAlert("EMI deleted", "success");
  };

  const handlePaymentAdd = (updated) => { setEmis(prev => prev.map(e => e._id === updated._id ? updated : e)); setSelectedEMI(updated); };
  const handlePaymentDelete = (updated) => { setEmis(prev => prev.map(e => e._id === updated._id ? updated : e)); setSelectedEMI(updated); };

  // Summary stats
  const totalLoan = emis.reduce((s, e) => s + e.totalAmount, 0);
  const totalPaid = emis.reduce((s, e) => s + e.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalRemaining = totalLoan - totalPaid;
  const activeCount = emis.filter(e => {
    const paid = e.payments.reduce((s, p) => s + p.amount, 0);
    return paid < e.totalAmount && e.payments.length < e.durationMonths;
  }).length;

  const filteredEmis = emis.filter(e => {
    const paid = e.payments.reduce((s, p) => s + p.amount, 0);
    const isDone = paid >= e.totalAmount || e.payments.length >= e.durationMonths;
    const isOverdue = !isDone && new Date(e.endDate) < new Date();
    if (filter === "active") return !isDone && !isOverdue;
    if (filter === "completed") return isDone;
    if (filter === "overdue") return isOverdue;
    return true;
  });

  return (
    <div className="gk-main emi-page">
      {/* Summary */}
      <div className="emi-summary-bar">
        <div className="emi-stat"><div className="emi-stat-label">Total Loans</div><div className="emi-stat-value blue">{emis.length}</div></div>
        <div className="emi-stat"><div className="emi-stat-label">Active</div><div className="emi-stat-value blue">{activeCount}</div></div>
        <div className="emi-stat"><div className="emi-stat-label">Total Amount</div><div className="emi-stat-value">{fmt(totalLoan)}</div></div>
        <div className="emi-stat"><div className="emi-stat-label">Total Paid</div><div className="emi-stat-value green">{fmt(totalPaid)}</div></div>
        <div className="emi-stat"><div className="emi-stat-label">Remaining</div><div className="emi-stat-value orange">{fmt(totalRemaining)}</div></div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {["all", "active", "completed", "overdue"].map(f => (
            <button key={f} className={`gk-nav-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
              {f === "all" ? "All" : f === "active" ? "🔄 Active" : f === "completed" ? "✅ Done" : "⚠️ Overdue"}
            </button>
          ))}
        </div>
        <button className="gk-btn gk-btn-primary" onClick={() => setShowAddModal(true)}>+ Add EMI</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="gk-empty"><div className="gk-empty-icon">⏳</div><h3>Loading…</h3></div>
      ) : filteredEmis.length === 0 ? (
        <div className="gk-empty">
          <div className="gk-empty-icon">💳</div>
          <h3>{filter === "all" ? "No EMIs yet" : `No ${filter} EMIs`}</h3>
          <p>{filter === "all" ? "Click \"Add EMI\" to track your first loan" : "Change the filter to see more"}</p>
          {filter === "all" && <button className="gk-btn gk-btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>+ Add First EMI</button>}
        </div>
      ) : (
        <div className="emi-grid">
          {filteredEmis.map(e => <EMICard key={e._id} emi={e} onClick={() => setSelectedEMI(e)} />)}
        </div>
      )}

      {/* Modals */}
      {showAddModal && <EMIFormModal onClose={() => setShowAddModal(false)} onSave={handleSave} />}
      {editingEMI && <EMIFormModal emi={editingEMI} onClose={() => setEditingEMI(null)} onSave={handleSave} />}
      {selectedEMI && !editingEMI && (
        <EMIDetailModal
          emi={selectedEMI}
          onClose={() => setSelectedEMI(null)}
          onPaymentAdd={handlePaymentAdd}
          onPaymentDelete={handlePaymentDelete}
          onEdit={() => { setEditingEMI(selectedEMI); setSelectedEMI(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default EMIPage;
