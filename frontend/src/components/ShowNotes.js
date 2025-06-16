import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Added
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";
import Noteitem from "./Noteitem";
import Swal from "sweetalert2";

const ShowNotes = (props) => {
  const context = useContext(noteContext);
  const { notes = [], getNotes, editNote } = context;
  const { isDarkMode } = useContext(DarkModeContext);

  const navigate = useNavigate(); 

  const ref = useRef(null);
  const refClose = useRef(null);

  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
  } else {
    getNotes();
  }
}, [navigate, getNotes]);

  const updateNote = (currentnote) => {
    setNote({
      id: currentnote._id,
      etitle: currentnote.title,
      edescription: currentnote.description,
      etag: currentnote.tag,
    });
    ref.current?.click();
  };

  const handleClick = (e) => {
    e.preventDefault();
    editNote(note.id, note.etitle, note.edescription, note.etag);
    refClose.current?.click();
    props.showAlert("Updated Successfully", "success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <>
      {/* Hidden Modal Trigger */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#editNoteModal"
      >
        Launch modal
      </button>

      {/* Edit Note Modal */}
      <div
        className={`modal fade ${isDarkMode ? "modal-dark" : ""}`} // add class based on dark mode
        id="editNoteModal"
        tabIndex="-1"
        aria-labelledby="editNoteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form onSubmit={handleClick}>
            <div className={`modal-content ${isDarkMode ? "bg-dark text-light" : ""}`}>
              <div className="modal-header">
                <h5
                  className="modal-title w-100 text-center"
                  id="editNoteModalLabel"
                >
                  Edit Note
                </h5>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="etitle" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? "bg-secondary text-light border-0" : ""}`}
                    id="etitle"
                    name="etitle"
                    value={note.etitle}
                    onChange={onChange}
                    required
                    minLength={3}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="edescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className={`form-control ${isDarkMode ? "bg-secondary text-light border-0" : ""}`}
                    id="edescription"
                    name="edescription"
                    rows="3"
                    value={note.edescription}
                    onChange={onChange}
                    required
                    minLength={5}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="etag" className="form-label">
                    Tag (optional)
                  </label>
                  <input
                    type="text"
                    className={`form-control ${isDarkMode ? "bg-secondary text-light border-0" : ""}`}
                    id="etag"
                    name="etag"
                    value={note.etag}
                    onChange={onChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className={`btn btn-secondary ${isDarkMode ? "btn-outline-light" : ""}`}
                  data-bs-dismiss="modal"
                  ref={refClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Notes Section */}
      <div className={`container mt-4 ${isDarkMode ? "text-light" : ""}`}>
        <div className={`card shadow-sm p-4 ${isDarkMode ? "bg-dark" : ""}`}>
          <h3 className="text-center mb-4">Your Notes</h3>
          {!Array.isArray(notes) || notes.length === 0 ? (
            <p className="text-muted text-center">No Notes To Display</p>
          ) : (
            <div className="d-flex flex-column" style={{ gap: "20px" }}>
              {[...notes]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((note) => (
                  <Noteitem
                    key={note._id}
                    updateNote={updateNote}
                    showAlert={props.showAlert}
                    note={note}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShowNotes;
