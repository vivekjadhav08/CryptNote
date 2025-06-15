const ConnectToMongo = require("./db");
const express = require("express");
var cors = require("cors");

ConnectToMongo();
const app = express();
const port = 5000;

//middle ware
app.use(express.json());
app.use(cors());

// app.use(
//   cors({
//     origin: "http://192.168.31.158:1001",
//   })
// );

//Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})

// app.listen(port, "0.0.0.0", () => {
//   console.log(`Server running at http://192.168.31.158:${port}`);
// });
