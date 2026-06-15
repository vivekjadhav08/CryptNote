import React, { useState, useContext, useRef, useEffect } from "react";
import noteContext from "../context/notes/noteContext";

const COLORS = [
  { label: "Default", value: "#ffffff" },
  { label: "Red",     value: "#f28b82" },
  { label: "Orange",  value: "#fbbc04" },
  { label: "Yellow",  value: "#fff475" },
  { label: "Green",   value: "#ccff90" },
  { label: "Teal",    value: "#a7ffeb" },
  { label: "Blue",    value: "#cbf0f8" },
  { label: "Purple",  value: "#d7aefb" },
  { label: "Pink",    value: "#fdcfe8" },
];

const AddNote = ({ showAlert }) => {
  const { addNote } = useContext(noteContext);
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState({ title: "", description: "", tag: "", color: "#ffffff", reminder: "" });
  const [image, setImage] = useState(null);
  const [showColors, setShowColors] = useState(false);
  const fileRef = useRef(null);
  const boxRef = useRef(null);

  const reset = () => {
    setNote({ title: "", description: "", tag: "", color: "#ffffff", reminder: "" });
    setImage(null); setExpanded(false); setShowColors(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (expanded && boxRef.current && !boxRef.current.contains(e.target)) reset();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  const handleSave = async () => {
    const title = note.title.trim() || note.description.trim().slice(0, 30);
    const desc = note.description.trim() || note.title.trim();
    if (title.length < 3 || desc.length < 5) {
      showAlert("Title ≥ 3 chars, description ≥ 5 chars", "error"); return;
    }
    await addNote(title, desc, note.tag, note.color, note.reminder || null, image);
    reset(); showAlert("Note added!", "success");
  };

  const handleImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setImage(r.result);
    r.readAsDataURL(f);
  };

  const isDefault = note.color === "#ffffff";
  const cardBg = isDefault ? "var(--gk-surface)" : note.color;
  const canSave = note.title.trim().length >= 3 || note.description.trim().length >= 5;

  return (
    <div
      ref={boxRef}
      className="gk-add-note-box"
      style={{ background: cardBg }}
      onKeyDown={e => e.key === "Escape" && reset()}
    >
      {/* ── COLLAPSED ── */}
      {!expanded && (
        <div className="gk-add-note-collapsed" onClick={() => setExpanded(true)}>
          <span>Take a note…</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="gk-note-action-btn"
              title="New note with image"
              onClick={e => { e.stopPropagation(); setExpanded(true); setTimeout(() => fileRef.current?.click(), 100); }}
            >🖼️</button>
          </div>
        </div>
      )}

      {/* ── EXPANDED ── */}
      {expanded && (
        <>
          {/* Image preview */}
          {image && (
            <div style={{ position: 'relative' }}>
              <img src={image} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block', borderRadius: '12px 12px 0 0' }} />
              <button onClick={() => setImage(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.55)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          )}

          {/* Title + description */}
          <div className="gk-add-note-expanded">
            <input
              type="text"
              placeholder="Title"
              value={note.title}
              autoFocus
              onChange={e => setNote({ ...note, title: e.target.value })}
            />
            <textarea
              placeholder="Take a note…"
              value={note.description}
              rows={3}
              onChange={e => setNote({ ...note, description: e.target.value })}
            />
          </div>

          {/* Tag + reminder — only visible once user starts typing */}
          {(note.title || note.description) && (
            <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🏷️ Tag"
                value={note.tag}
                onChange={e => setNote({ ...note, tag: e.target.value })}
                style={{
                  border: '1px solid var(--gk-border)', borderRadius: 16,
                  padding: '5px 14px', fontSize: 13, background: 'transparent',
                  color: 'var(--gk-text)', outline: 'none', width: 140,
                }}
              />
              <input
                type="datetime-local"
                value={note.reminder}
                onChange={e => setNote({ ...note, reminder: e.target.value })}
                title="Set reminder"
                style={{
                  border: '1px solid var(--gk-border)', borderRadius: 8,
                  padding: '5px 10px', fontSize: 13, background: 'transparent',
                  color: 'var(--gk-text)', outline: 'none',
                }}
              />
            </div>
          )}

          {/* Color palette */}
          {showColors && (
            <div style={{ padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--gk-border)' }}>
              {COLORS.map(c => (
                <button
                  key={c.value}
                  className={`gk-color-dot ${note.color === c.value ? 'selected' : ''}`}
                  style={{
                    background: c.value === "#ffffff" ? "var(--gk-surface)" : c.value,
                    border: `2px solid ${note.color === c.value ? '#202124' : 'var(--gk-border)'}`,
                  }}
                  title={c.label}
                  onClick={() => setNote({ ...note, color: c.value })}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="gk-add-note-footer">
            <div style={{ display: 'flex', gap: 2 }}>
              <button className="gk-note-action-btn" title="Background color" onClick={() => setShowColors(p => !p)}>🎨</button>
              <button className="gk-note-action-btn" title="Add image" onClick={() => fileRef.current?.click()}>🖼️</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gk-btn gk-btn-ghost" onClick={reset}>Close</button>
              <button className="gk-btn gk-btn-primary" onClick={handleSave} disabled={!canSave}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddNote;
