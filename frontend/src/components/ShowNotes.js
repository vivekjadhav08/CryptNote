import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";
import Noteitem from "./Noteitem";

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

// const EditModal = ({ note, onClose, onSave, isDarkMode }) => {
//   const [form, setForm] = useState({
//     etitle: note.title || "",
//     edescription: note.description || "",
//     etag: note.tag || "",
//     ecolor: note.color || "#ffffff",
//     ereminder: note.reminder ? new Date(note.reminder).toISOString().slice(0, 16) : "",
//     eimage: note.image || null,
//   });
//   const fileRef = useRef(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => setForm(f => ({ ...f, eimage: reader.result }));
//     reader.readAsDataURL(file);
//   };

//   const cardBg = (!form.ecolor || form.ecolor === "#ffffff") ? "var(--gk-surface)" : form.ecolor;
//   const textColor = (!form.ecolor || form.ecolor === "#ffffff") ? "var(--gk-text)" : "#202124";

//   return (
//     <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="gk-modal" style={{ background: cardBg, color: textColor }}>
//         {form.eimage && (
//           <div className="gk-img-preview" style={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', margin: 0 }}>
//             <img src={form.eimage} alt="preview" style={{ maxHeight: 180 }} />
//             <button className="gk-img-remove" onClick={() => setForm(f => ({ ...f, eimage: null }))}>✕</button>
//           </div>
//         )}
//         <div className="gk-modal-body">
//           <input
//             className="gk-modal-input gk-modal-title"
//             type="text"
//             placeholder="Title"
//             value={form.etitle}
//             onChange={e => setForm(f => ({ ...f, etitle: e.target.value }))}
//             style={{ color: textColor }}
//           />
//           <textarea
//             className="gk-modal-input gk-modal-desc"
//             placeholder="Take a note…"
//             value={form.edescription}
//             onChange={e => setForm(f => ({ ...f, edescription: e.target.value }))}
//             style={{ color: textColor }}
//           />
//           <div className="gk-modal-section">
//             <label style={{ color: textColor }}>Tag</label>
//             <input type="text" value={form.etag} onChange={e => setForm(f => ({ ...f, etag: e.target.value }))}
//               placeholder="Tag (e.g. Work)" style={{ color: textColor, background: 'transparent', borderColor: 'rgba(0,0,0,.2)' }} />
//           </div>
//           <div className="gk-modal-section">
//             <label style={{ color: textColor }}>Reminder</label>
//             <input type="datetime-local" value={form.ereminder}
//               onChange={e => setForm(f => ({ ...f, ereminder: e.target.value }))}
//               style={{ color: textColor, background: 'transparent', borderColor: 'rgba(0,0,0,.2)' }} />
//           </div>
//           <div className="gk-modal-section">
//             <label style={{ color: textColor }}>Color</label>
//             <div className="gk-colors">
//               {COLORS.map(c => (
//                 <button key={c.value}
//                   className={`gk-color-dot ${form.ecolor === c.value ? 'selected' : ''}`}
//                   style={{ background: c.value === '#ffffff' ? 'var(--gk-surface)' : c.value, border: `2px solid ${form.ecolor === c.value ? textColor : 'var(--gk-border)'}` }}
//                   title={c.label}
//                   onClick={() => setForm(f => ({ ...f, ecolor: c.value }))}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="gk-modal-footer">
//           <div style={{ display: 'flex', gap: 4 }}>
//             <button className="gk-note-action-btn" title="Add image" onClick={() => fileRef.current?.click()} style={{ color: textColor }}>🖼️</button>
//             <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
//           </div>
//           <div style={{ display: 'flex', gap: 8 }}>
//             <button className="gk-btn gk-btn-ghost" onClick={onClose} style={{ color: textColor === '#202124' ? '#1a73e8' : 'var(--gk-primary)' }}>Close</button>
//             <button className="gk-btn gk-btn-primary"
//               disabled={form.etitle.length < 3 || form.edescription.length < 5}
//               onClick={() => onSave(form)}>Save</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
const EditModal = ({ note, onClose, onSave, isDarkMode }) => {
  const [form, setForm] = useState({
    etitle: note.title || "",
    edescription: note.description || "",
    etag: note.tag || "",
    ecolor: note.color || "#ffffff",
    ereminder: note.reminder ? new Date(note.reminder).toISOString().slice(0, 16) : "",
    eimage: note.image || null,
  });
  const fileRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, eimage: reader.result }));
    reader.readAsDataURL(file);
  };

  const cardBg = (!form.ecolor || form.ecolor === "#ffffff") ? "var(--gk-surface)" : form.ecolor;
  const textColor = (!form.ecolor || form.ecolor === "#ffffff") ? "var(--gk-text)" : "#202124";

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="gk-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="gk-modal" style={{ background: cardBg, color: textColor, maxWidth: 600 }}>

        {/* Image at top */}
        {form.eimage && (
          <div style={{ position: 'relative', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
            <img src={form.eimage} alt="note" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => setForm(f => ({ ...f, eimage: null }))}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.5)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>
        )}

        <div className="gk-modal-body" style={{ padding: '16px 20px' }}>
          {/* Title */}
          <input
            className="gk-modal-input gk-modal-title"
            type="text"
            placeholder="Title"
            value={form.etitle}
            onChange={e => setForm(f => ({ ...f, etitle: e.target.value }))}
            style={{ color: textColor, fontSize: 20, fontWeight: 500, width: '100%', marginBottom: 12 }}
            autoFocus
          />

          {/* Description */}
          <textarea
            className="gk-modal-input gk-modal-desc"
            placeholder="Take a note…"
            value={form.edescription}
            onChange={e => setForm(f => ({ ...f, edescription: e.target.value }))}
            style={{ color: textColor, width: '100%', minHeight: 120, fontSize: 15, lineHeight: 1.6, resize: 'vertical' }}
          />

          {/* Tag + Reminder row */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, color: textColor, opacity: .7, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Tag</label>
              <input type="text" value={form.etag}
                onChange={e => setForm(f => ({ ...f, etag: e.target.value }))}
                placeholder="e.g. Work, Personal"
                style={{ width: '100%', border: `1px solid rgba(0,0,0,.2)`, borderRadius: 4, padding: '8px 10px', background: 'transparent', color: textColor, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 11, color: textColor, opacity: .7, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: .5 }}>Reminder</label>
              <input type="datetime-local" value={form.ereminder}
                onChange={e => setForm(f => ({ ...f, ereminder: e.target.value }))}
                style={{ width: '100%', border: `1px solid rgba(0,0,0,.2)`, borderRadius: 4, padding: '8px 10px', background: 'transparent', color: textColor, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Color row */}
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 11, color: textColor, opacity: .7, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>Color</label>
            <div className="gk-colors">
              {COLORS.map(c => (
                <button key={c.value}
                  className={`gk-color-dot ${form.ecolor === c.value ? 'selected' : ''}`}
                  style={{ background: c.value === '#ffffff' ? 'var(--gk-surface)' : c.value, border: `2px solid ${form.ecolor === c.value ? textColor : 'var(--gk-border)'}`, width: 32, height: 32 }}
                  title={c.label}
                  onClick={() => setForm(f => ({ ...f, ecolor: c.value }))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gk-modal-footer" style={{ padding: '8px 16px 16px', borderTop: `1px solid rgba(0,0,0,.1)` }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="gk-note-action-btn" title="Add image" onClick={() => fileRef.current?.click()} style={{ color: textColor }}>🖼️</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="gk-btn gk-btn-ghost" onClick={onClose}
              style={{ color: textColor === '#202124' ? '#1a73e8' : 'var(--gk-primary)' }}>
              Close
            </button>
            <button className="gk-btn gk-btn-primary"
              disabled={form.etitle.length < 3 || form.edescription.length < 5}
              onClick={() => onSave(form)}>
              Save
            </button>
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
    if (!localStorage.getItem("token")) navigate("/login");
    else getNotes();
  }, []); // eslint-disable-line

  // const updateNote = (note) => setEditingNote(note);

  const updateNote = (note) => {
  setEditingNote(note);
  document.body.classList.add("modal-open");   
};

  // const handleSave = (form) => {
  //   editNote(editingNote._id, form.etitle, form.edescription, form.etag, form.ecolor, form.ereminder || null, form.eimage);
  //   showAlert("Note updated!", "success");
  //   setEditingNote(null);
  // };
  
  const handleSave = (form) => {
  editNote(editingNote._id, form.etitle, form.edescription, form.etag, form.ecolor, form.ereminder || null, form.eimage);
  showAlert("Note updated!", "success");
  setEditingNote(null);
  document.body.classList.remove("modal-open"); 
};

  const filteredNotes = (notes || []).filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q) || n.tag?.toLowerCase().includes(q);
  });

  const pinned = filteredNotes.filter(n => n.isPinned);
  const others = filteredNotes.filter(n => !n.isPinned);

  if (!Array.isArray(notes) || notes.length === 0) {
    return (
      <div className="gk-empty">
        <div className="gk-empty-icon">💡</div>
        <h3>Notes you add appear here</h3>
        <p>Add a note using the box above</p>
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="gk-empty">
        <div className="gk-empty-icon">🔍</div>
        <h3>No matching notes</h3>
        <p>Try a different search term</p>
      </div>
    );
  }

  return (
    <>
      {editingNote && (
        <EditModal
          note={editingNote}
          onClose={() => {
              setEditingNote(null);
              document.body.classList.remove("modal-open"); 
            }}
          onSave={handleSave}
          isDarkMode={isDarkMode}
        />
      )}

      {pinned.length > 0 && (
        <>
          <div className="gk-section-label">Pinned</div>
          <div className="gk-notes-grid">
            {pinned.map(note => (
              <Noteitem key={note._id} note={note} updateNote={updateNote} showAlert={showAlert} />
            ))}
          </div>
        </>
      )}

      {pinned.length > 0 && others.length > 0 && (
        <div className="gk-section-label">Others</div>
      )}

      {others.length > 0 && (
        <div className="gk-notes-grid">
          {others.map(note => (
            <Noteitem key={note._id} note={note} updateNote={updateNote} showAlert={showAlert} />
          ))}
        </div>
      )}
    </>
  );
};

export default ShowNotes;
