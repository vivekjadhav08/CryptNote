import React, { useContext, useState, useRef } from "react";
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";
import Swal from "sweetalert2";

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

const Noteitem = ({ note, updateNote, showAlert }) => {
  const { deleteNote, togglePin, editNote } = useContext(noteContext);
  const { isDarkMode } = useContext(DarkModeContext);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorRef = useRef(null);

  const cardColor = (!note.color || note.color === "#ffffff")
    ? (isDarkMode ? "#2d2e30" : "#ffffff")
    : note.color;

  const textColor = (!note.color || note.color === "#ffffff") ? "var(--gk-text)" : "#202124";

  const formattedReminder = note.reminder
    ? new Date(note.reminder).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const formattedDate = note.date
    ? new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "";

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Delete note?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d93025",
      cancelButtonColor: "#5f6368",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: isDarkMode ? "#2d2e30" : "#fff",
      color: isDarkMode ? "#e8eaed" : "#202124",
    });
    if (result.isConfirmed) { deleteNote(note._id); showAlert("Note deleted", "success"); }
  };

  const handleColorChange = (color) => {
    editNote(note._id, note.title, note.description, note.tag, color, note.reminder, note.image);
    setShowColorPicker(false);
  };

  return (
    <div className="gk-note-card" 
  style={{ background: cardColor, color: textColor }} 
  data-color={note.color || "#ffffff"}
  onClick={() => updateNote(note)}
>
  <button
    className={`gk-pin-btn ${note.isPinned ? 'pinned' : ''}`}
    title={note.isPinned ? "Unpin" : "Pin note"}
    onClick={e => { e.stopPropagation(); togglePin(note._id); }}
    style={{ color: note.isPinned ? '#1a73e8' : textColor }}
  >
    📌
  </button>

  {note.image && <img src={note.image} alt="" className="gk-note-img" />}

  <div className="gk-note-body">
    {note.title && <div className="gk-note-title" style={{ color: textColor }}>{note.title}</div>}
    {note.description && <div className="gk-note-text" style={{ color: textColor }}>{note.description}</div>}
    {note.tag && note.tag.trim() && (
      <div className="gk-note-tag" style={{ color: textColor, background: 'rgba(0,0,0,.1)' }}>🏷️ {note.tag}</div>
    )}
    {formattedReminder && (
      <div className="gk-note-reminder" style={{ color: textColor }}>
        ⏰ {formattedReminder}
      </div>
    )}
    <div className="gk-note-date" style={{ color: textColor, opacity: .7 }}>{formattedDate}</div>
  </div>

  <div className="gk-note-actions" onClick={e => e.stopPropagation()}>
    {/* <button className="gk-note-action-btn" title="Delete note" onClick={handleDelete} style={{ color: textColor }}>🗑️</button> */}
    <button className="gk-note-action-btn" title="Copy text"
      onClick={() => { navigator.clipboard.writeText(note.description); showAlert("Copied!", "success"); }}
      style={{ color: textColor }}>📋</button>
    <div style={{ position: 'relative' }} ref={colorRef}>
      <button className="gk-note-action-btn" title="Change color"
        onClick={() => setShowColorPicker(p => !p)} style={{ color: textColor }}>🎨</button>
      {showColorPicker && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0,
          background: 'var(--gk-surface)',
          border: '1px solid var(--gk-border)',
          borderRadius: 8, padding: 8,
          display: 'flex', gap: 4, flexWrap: 'wrap', width: 170,
          boxShadow: 'var(--gk-shadow)', zIndex: 100
        }}>
          {COLORS.map(c => (
            <button key={c.value}
              className={`gk-color-dot ${(note.color || '#ffffff') === c.value ? 'selected' : ''}`}
              style={{ background: c.value === '#ffffff' ? 'var(--gk-surface)' : c.value, border: `2px solid ${(note.color || '#ffffff') === c.value ? 'var(--gk-text)' : 'var(--gk-border)'}` }}
              title={c.label}
              onClick={() => handleColorChange(c.value)}
            />
          ))}
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default Noteitem;
