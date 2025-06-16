import AddNote from "./AddNote";
import ShowNotes from "./ShowNotes";

const Notes = (props) => {
  return (
    <div className="container mt-4 px-2 px-sm-3">
      <div className="row">
        {/* Sidebar - AddNote */}
        <div
          className="col-12 col-md-4 mb-4"
          style={{
            borderRight: "1px solid #ddd",
            height: "100%",
            overflowY: "auto",
            position: "sticky",
            top: "70px",
          }}
        >
          <AddNote showAlert={props.showAlert} />
        </div>

        {/* Main content - ShowNotes */}
        <div
          className="col-12 col-md-8"
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "15px",
          }}
        >
          <ShowNotes showAlert={props.showAlert} />
        </div>
      </div>
    </div>
  );
};

export default Notes;
