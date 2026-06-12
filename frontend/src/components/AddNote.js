import React, { useState, useContext, useRef } from "react";
import noteContext from "../context/notes/noteContext";

const COLORS = [
  { label: "Default", value: "#ffffff" },
  { label: "Red", value: "#f28b82" },
  { label: "Orange", value: "#fbbc04" },
  { label: "Yellow", value: "#fff475" },
  { label: "Green", value: "#ccff90" },
  { label: "Teal", value: "#a7ffeb" },
  { label: "Blue", value: "#cbf0f8" },
  { label: "Purple", value: "#d7aefb" },
  { label: "Pink", value: "#fdcfe8" },
];

const AddNote = ({ showAlert }) => {
  const { addNote } = useContext(noteContext);
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState({ title: "", description: "", tag: "", color: "#ffffff", reminder: "" });
  const [image, setImage] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const boxRef = useRef(null);
  const fileRef = useRef(null);

  const handleSubmit = async () => {
    if (note.description.length < 5 && note.title.length < 3) return;
    const title = note.title || note.description.slice(0, 30);
    const description = note.description || note.title;
    if (title.length < 3 || description.length < 5) {
      showAlert("Title min 3 chars, description min 5 chars", "error"); return;
    }
    await addNote(title, description, note.tag, note.color, note.reminder || null, image);
    setNote({ title: "", description: "", tag: "", color: "#ffffff", reminder: "" });
    setImage(null); setExpanded(false); setShowColorPicker(false);
    showAlert("Note added!", "success");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { setExpanded(false); setShowColorPicker(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const cardBg = note.color === "#ffffff" ? "var(--gk-surface)" : note.color;

  return (
    <div className="gk-add-note-box" ref={boxRef} style={{ background: cardBg }} onKeyDown={handleKeyDown}>
      {!expanded ? (
        <div className="gk-add-note-collapsed" onClick={() => setExpanded(true)}>
          <span>Take a note…</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gk-nav-icon" style={{ fontSize: 18 }} title="New list" onClick={e => { e.stopPropagation(); setExpanded(true); }}>☑️</button>
            <button className="gk-nav-icon" style={{ fontSize: 18 }} title="New note with image" onClick={e => { e.stopPropagation(); setExpanded(true); fileRef.current?.click(); }}>🖼️</button>
          </div>
        </div>
      ) : (
        <>
          {image && (
            <div className="gk-img-preview" style={{ margin: 0, borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
              <img src={image} alt="preview" style={{ maxHeight: 180 }} />
              <button className="gk-img-remove" onClick={() => setImage(null)}>✕</button>
            </div>
          )}
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
              onChange={e => setNote({ ...note, description: e.target.value })}
              rows={3}
            />
            {note.tag !== undefined && note.reminder !== undefined && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <input
                  type="text"
                  placeholder="Tag (e.g. Work)"
                  value={note.tag}
                  onChange={e => setNote({ ...note, tag: e.target.value })}
                  style={{ border: '1px solid var(--gk-border)', borderRadius: 16, padding: '4px 12px', fontSize: 13, background: 'transparent', color: 'var(--gk-text)', outline: 'none', width: 140 }}
                />
                <input
                  type="datetime-local"
                  value={note.reminder}
                  onChange={e => setNote({ ...note, reminder: e.target.value })}
                  style={{ border: '1px solid var(--gk-border)', borderRadius: 4, padding: '4px 8px', fontSize: 13, background: 'transparent', color: 'var(--gk-text)', outline: 'none' }}
                />
              </div>
            )}
          </div>

          {showColorPicker && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--gk-border)' }}>
              <div className="gk-colors">
                {COLORS.map(c => (
                  <button key={c.value} className={`gk-color-dot ${note.color === c.value ? 'selected' : ''}`}
                    style={{ background: c.value === "#ffffff" ? "var(--gk-surface)" : c.value, border: `2px solid ${note.color === c.value ? 'var(--gk-text)' : 'var(--gk-border)'}` }}
                    title={c.label}
                    onClick={() => setNote({ ...note, color: c.value })}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="gk-add-note-footer">
            <div style={{ display: 'flex', gap: 2 }}>
              <button className="gk-note-action-btn" title="Add reminder" onClick={() => {}}>⏰</button>
              <button className="gk-note-action-btn" title="Background color" onClick={() => setShowColorPicker(p => !p)}>🎨</button>
              <button className="gk-note-action-btn" title="Add image" onClick={() => fileRef.current?.click()}>🖼️</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gk-btn gk-btn-ghost" onClick={() => { setExpanded(false); setShowColorPicker(false); }}>Close</button>
              <button className="gk-btn gk-btn-primary" onClick={handleSubmit}
                disabled={note.title.length < 3 && note.description.length < 5}>
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddNote;
