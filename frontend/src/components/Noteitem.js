import React, { useContext } from "react";
import noteContext from "../context/notes/noteContext";
import DarkModeContext from "../context/mode/DarkModeContext";
import Swal from "sweetalert2";

const Noteitem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;
  const { isDarkMode } = useContext(DarkModeContext);
  const { note, updateNote } = props;

  const formattedDate = note.date
    ? new Date(note.date).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: isDarkMode ? "#333" : "#fff",
      color: isDarkMode ? "#fff" : "#333",
    });

    if (result.isConfirmed) {
      deleteNote(note._id);
      props.showAlert("Deleted Successfully", "success");
    }
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(note.description).then(() => {
      props.showAlert("Description copied to clipboard", "success");
    });
  };

  return (
    <div className={`card my-3 ${isDarkMode ? "bg-dark text-light" : ""}`}>
      <div className="card-body">
        <h5 className="card-title">
          <strong>Title:</strong> {note.title}
        </h5>
        <h6 className="text-muted">
          <strong>Created Date:</strong> {formattedDate}
        </h6>
        <p className="card-text">
          <strong>Description:</strong> {note.description}
        </p>
        {note.tag && note.tag.trim() !== "" && (
          <p>
            <strong>Tag:</strong> {note.tag}
          </p>
        )}
        <i
          className={`fa-solid fa-pen-to-square mx-2 ${
            isDarkMode ? "text-light" : "text-dark"
          }`}
          style={{ cursor: "pointer" }}
          onClick={() => updateNote(note)}
        ></i>

        <i
          className={`fa-solid fa-trash mx-2 ${
            isDarkMode ? "text-light" : "text-dark"
          }`}
          style={{ cursor: "pointer" }}
          onClick={handleDelete}
        ></i>

        <i
          className={`fa-solid fa-copy mx-2 ${
            isDarkMode ? "text-light" : "text-dark"
          }`}
          style={{ cursor: "pointer" }}
          onClick={handleCopyDescription}
          title="Copy Description"
        ></i>
      </div>
    </div>
  );
};

export default Noteitem;
