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

  const isDefault = !note.color || note.color === "#ffffff";
  const cardColor = isDefault ? (isDarkMode ? "#242526" : "#ffffff") : note.color;
  const textColor = isDefault ? "var(--gk-text)" : "#202124";

  const formattedReminder = note.reminder
    ? new Date(note.reminder).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
  const formattedDate = note.date
    ? new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "";

  const handleDelete = async (e) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Delete note?", text: "This cannot be undone.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d93025", cancelButtonColor: "#5f6368",
      confirmButtonText: "Delete", cancelButtonText: "Cancel",
      background: isDarkMode ? "#242526" : "#fff", color: isDarkMode ? "#e8eaed" : "#202124",
    });
    if (result.isConfirmed) { deleteNote(note._id); showAlert("Note deleted", "success"); }
  };

  const handleColorChange = (color) => {
    editNote(note._id, note.title, note.description, note.tag, color, note.reminder, note.image);
    setShowColorPicker(false);
  };

  return (
    <div className="gk-note-card" style={{ background: cardColor, color: textColor }}
      onClick={() => updateNote(note)}>

      <button className={`gk-pin-btn ${note.isPinned ? 'pinned' : ''}`}
        title={note.isPinned ? "Unpin" : "Pin"}
        onClick={e => { e.stopPropagation(); togglePin(note._id); }}
        style={{ color: note.isPinned ? 'var(--gk-primary)' : textColor }}>
        📌
      </button>

      {note.image && <img src={note.image} alt="" className="gk-note-img" />}

      <div className="gk-note-body">
        {note.title && <div className="gk-note-title">{note.title}</div>}
        {note.description && (
          <div className="gk-note-text" style={{ opacity: .85 }}>
            {note.description.length > 200 ? note.description.slice(0, 200) + '…' : note.description}
          </div>
        )}
        {note.tag?.trim() && (
          <div className="gk-note-tag" style={{ background: 'rgba(0,0,0,.1)' }}>🏷️ {note.tag}</div>
        )}
        {formattedReminder && <div className="gk-note-reminder">⏰ {formattedReminder}</div>}
        <div className="gk-note-date">{formattedDate}</div>
      </div>

      <div className="gk-note-actions" onClick={e => e.stopPropagation()}>
        <button className="gk-note-action-btn" title="Delete" onClick={handleDelete}>🗑️</button>
        <button className="gk-note-action-btn" title="Copy"
          onClick={() => { navigator.clipboard.writeText(note.description); showAlert("Copied!", "success"); }}>📋</button>
        <div style={{ position: 'relative' }} ref={colorRef}>
          <button className="gk-note-action-btn" title="Color"
            onClick={e => { e.stopPropagation(); setShowColorPicker(p => !p); }}>🎨</button>
          {showColorPicker && (
            <div onClick={e => e.stopPropagation()} style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--gk-surface)', border: '1px solid var(--gk-border)',
              borderRadius: 10, padding: 10, display: 'flex', gap: 6, flexWrap: 'wrap',
              width: 178, boxShadow: 'var(--gk-shadow)', zIndex: 200, marginBottom: 4
            }}>
              {COLORS.map(c => (
                <button key={c.value} className={`gk-color-dot ${(note.color || '#ffffff') === c.value ? 'selected' : ''}`}
                  style={{ background: c.value === '#ffffff' ? 'var(--gk-surface)' : c.value, border: `2px solid ${(note.color||'#ffffff')===c.value?'#202124':'var(--gk-border)'}` }}
                  title={c.label} onClick={() => handleColorChange(c.value)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Noteitem;
