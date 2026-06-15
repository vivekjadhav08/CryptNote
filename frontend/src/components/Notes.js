import AddNote from "./AddNote";
import ShowNotes from "./ShowNotes";

const Notes = ({ showAlert, searchQuery }) => (
  <div className="gk-page">
    <AddNote showAlert={showAlert} />
    <ShowNotes showAlert={showAlert} searchQuery={searchQuery} />
  </div>
);

export default Notes;
