import AddNote from "./AddNote";
import ShowNotes from "./ShowNotes";

const Notes = ({ showAlert, searchQuery }) => {
  return (
    <div className="gk-main">
      <AddNote showAlert={showAlert} />
      <ShowNotes showAlert={showAlert} searchQuery={searchQuery} />
    </div>
  );
};

export default Notes;
