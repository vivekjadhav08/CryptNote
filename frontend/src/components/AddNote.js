import React, { useContext, useState } from "react";
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";



const AddNote = (props) => {
  const context = useContext(noteContext);
  const { isDarkMode } = useContext(DarkModeContext);  

  const [note, setNote] = useState({ title: "", description: "", tag: "" });

  const handleClick = (e) => {
    e.preventDefault();
    context.addNote(note.title, note.description, note.tag);
    setNote({ title: "", description: "", tag: "" });
    props.showAlert("Note added successfully!", "success");
  };

  const onChange = (e) => setNote({ ...note, [e.target.name]: e.target.value });

  return (
    <div className={`container mt-4 px-2 px-sm-4 ${isDarkMode ? "text-light" : "text-dark"}`}>
  <div className={`card shadow-sm p-3 p-md-4 ${isDarkMode ? "bg-dark text-light" : "bg-white"}`}>
    <h3 className="text-center mb-4">Add a New Note</h3>
    <form>
      {["title", "description", "tag"].map((field, idx) => (
        <div className="mb-3" key={idx}>
          <label htmlFor={field} className="form-label">{field[0].toUpperCase() + field.slice(1)}</label>
          {field === "description" ? (
            <textarea
              className={`form-control ${isDarkMode ? "bg-secondary text-light border-0" : ""}`}
              id={field}
              name={field}
              value={note[field]}
              onChange={onChange}
              rows="3"
            />
          ) : (
            <input
              type="text"
              className={`form-control ${isDarkMode ? "bg-secondary text-light border-0" : ""}`}
              id={field}
              name={field}
              value={note[field]}
              onChange={onChange}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="btn btn-success w-100 py-2"
        onClick={handleClick}
        disabled={note.title.length < 3 || note.description.length < 5}
      >
        Add Note
      </button>
    </form>
  </div>
</div>

  );
};

export default AddNote;
