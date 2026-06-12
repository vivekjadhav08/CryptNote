import NoteContext from "./noteContext";
import { useState } from "react";

const NoteState = (props) => {
  const host = process.env.REACT_APP_API_BASE_URL;
  const [notes, setNotes] = useState([]);
  const getToken = () => localStorage.getItem("token");

  const getNotes = async () => {
    try {
      const response = await fetch(`${host}/notes/fetchallnotes`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
      });
      const json = await response.json();
      setNotes(Array.isArray(json) ? json : []);
    } catch (err) { console.error(err); }
  };

  const addNote = async (title, description, tag, color, reminder, image) => {
    try {
      const response = await fetch(`${host}/notes/addnote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
        body: JSON.stringify({ title, description, tag, color, reminder, image }),
      });
      const note = await response.json();
      setNotes((prev) => [note, ...prev]);
    } catch (err) { console.error(err); }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${host}/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) { console.error(err); }
  };

  const editNote = async (id, title, description, tag, color, reminder, image) => {
    try {
      await fetch(`${host}/notes/updatenote/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
        body: JSON.stringify({ title, description, tag, color, reminder, image }),
      });
      setNotes((prev) =>
        prev.map((n) => n._id === id ? { ...n, title, description, tag, color, reminder, image } : n)
      );
    } catch (err) { console.error(err); }
  };

  const togglePin = async (id) => {
    try {
      const response = await fetch(`${host}/notes/togglepin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": getToken() },
      });
      const { note } = await response.json();
      setNotes((prev) =>
        [...prev.map((n) => (n._id === id ? note : n))].sort((a, b) => b.isPinned - a.isPinned)
      );
    } catch (err) { console.error(err); }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes, togglePin }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
