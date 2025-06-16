const ConnectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

ConnectToMongo();
const app = express();

// Use PORT from environment or default to 5000
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: "https://cryptnote.netlify.app"
  // origin:"http://localhost:3000"
}));


// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// Start server
app.listen(port, () => {
  // console.log(`🚀 Server running on http://localhost:${port}`);
  console.log("🚀 Server running ");

});
