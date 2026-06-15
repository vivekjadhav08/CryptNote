import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";
import Noteitem from "./Noteitem";

const COLORS = [
  { label: "Default", value: "#ffffff" }, { label: "Red", value: "#f28b82" },
  { label: "Orange", value: "#fbbc04" }, { label: "Yellow", value: "#fff475" },
  { label: "Green", value: "#ccff90" }, { label: "Teal", value: "#a7ffeb" },
  { label: "Blue", value: "#cbf0f8" }, { label: "Purple", value: "#d7aefb" },
  { label: "Pink", value: "#fdcfe8" },
];

const EditModal = ({ note, onClose, onSave }) => {
  const [form, setForm] = useState({
    etitle: note.title || "", edescription: note.description || "",
    etag: note.tag || "", ecolor: note.color || "#ffffff",
    ereminder: note.reminder ? new Date(note.reminder).toISOString().slice(0, 16) : "",
    eimage: note.image || null,
  });
  const fileRef = useRef(null);
  const isDefault = !form.ecolor || form.ecolor === "#ffffff";
  const cardBg = isDefault ? "var(--gk-surface)" : form.ecolor;
  const textColor = isDefault ? "var(--gk-text)" : "#202124";

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.classList.add("modal-open");
    return () => { window.removeEventListener("keydown", handler); document.body.classList.remove("modal-open"); };
  }, [onClose]);

  const handleImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, eimage: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ background: cardBg, color: textColor }}>
        {form.eimage && (
          <div className="gk-img-preview" style={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
            <img src={form.eimage} alt="" style={{ maxHeight: 220, objectFit: 'cover' }} />
            <button className="gk-img-remove" onClick={() => setForm(f => ({ ...f, eimage: null }))}>✕</button>
          </div>
        )}
        <div style={{ padding: '18px 20px' }}>
          <input className="gk-modal-input gk-modal-title" type="text" placeholder="Title"
            value={form.etitle} autoFocus
            onChange={e => setForm(f => ({ ...f, etitle: e.target.value }))}
            style={{ color: textColor, marginBottom: 10, fontSize: 20 }} />
          <textarea className="gk-modal-input gk-modal-desc" placeholder="Take a note…"
            value={form.edescription}
            onChange={e => setForm(f => ({ ...f, edescription: e.target.value }))}
            style={{ color: textColor, minHeight: 120, lineHeight: 1.65 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: textColor, opacity: .6, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Tag</label>
              <input type="text" value={form.etag} placeholder="e.g. Work"
                onChange={e => setForm(f => ({ ...f, etag: e.target.value }))}
                style={{ width: '100%', border: `1px solid rgba(0,0,0,.2)`, borderRadius: 8, padding: '8px 12px', background: 'transparent', color: textColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: textColor, opacity: .6, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .6 }}>Reminder</label>
              <input type="datetime-local" value={form.ereminder}
                onChange={e => setForm(f => ({ ...f, ereminder: e.target.value }))}
                style={{ width: '100%', border: `1px solid rgba(0,0,0,.2)`, borderRadius: 8, padding: '8px 12px', background: 'transparent', color: textColor, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 11, color: textColor, opacity: .6, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .6 }}>Color</label>
            <div className="gk-colors">
              {COLORS.map(c => (
                <button key={c.value} className={`gk-color-dot ${form.ecolor === c.value ? 'selected' : ''}`}
                  style={{ background: c.value === '#ffffff' ? 'var(--gk-surface)' : c.value, border: `2px solid ${form.ecolor===c.value?textColor:'var(--gk-border)'}`, width: 30, height: 30 }}
                  title={c.label} onClick={() => setForm(f => ({ ...f, ecolor: c.value }))} />
              ))}
            </div>
          </div>
        </div>

        <div className="gk-modal-footer" style={{ borderTop: `1px solid rgba(0,0,0,.1)` }}>
          <div>
            <button className="gk-note-action-btn" title="Add image" onClick={() => fileRef.current?.click()} style={{ color: textColor }}>🖼️</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gk-btn gk-btn-ghost" onClick={onClose}>Close</button>
            <button className="gk-btn gk-btn-primary"
              disabled={form.etitle.length < 3 || form.edescription.length < 5}
              onClick={() => onSave(form)}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShowNotes = ({ showAlert, searchQuery }) => {
  const { notes = [], getNotes, editNote } = useContext(noteContext);
  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login"); else getNotes();
  }, []); // eslint-disable-line

  const updateNote = (note) => setEditingNote(note);
  const handleSave = (form) => {
    editNote(editingNote._id, form.etitle, form.edescription, form.etag, form.ecolor, form.ereminder || null, form.eimage);
    showAlert("Note updated!", "success"); setEditingNote(null);
  };

  const filtered = (notes || []).filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q) || n.tag?.toLowerCase().includes(q);
  });
  const pinned = filtered.filter(n => n.isPinned);
  const others = filtered.filter(n => !n.isPinned);

  if (!Array.isArray(notes) || notes.length === 0) return (
    <div className="gk-empty">
      <div className="gk-empty-icon">💡</div>
      <h3>Notes you add appear here</h3>
      <p>Click "Take a note…" above to get started</p>
    </div>
  );
  if (filtered.length === 0) return (
    <div className="gk-empty">
      <div className="gk-empty-icon">🔍</div>
      <h3>No matching notes</h3>
      <p>Try different keywords</p>
    </div>
  );

  return (
    <>
      {editingNote && <EditModal note={editingNote} onClose={() => setEditingNote(null)} onSave={handleSave} />}
      {pinned.length > 0 && <>
        <div className="gk-section-label">📌 Pinned</div>
        <div className="gk-notes-grid">{pinned.map(n => <Noteitem key={n._id} note={n} updateNote={updateNote} showAlert={showAlert} />)}</div>
      </>}
      {pinned.length > 0 && others.length > 0 && <div className="gk-section-label">Others</div>}
      {others.length > 0 && <div className="gk-notes-grid">{others.map(n => <Noteitem key={n._id} note={n} updateNote={updateNote} showAlert={showAlert} />)}</div>}
    </>
  );
};

export default ShowNotes;
