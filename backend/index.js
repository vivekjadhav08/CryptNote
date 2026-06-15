const ConnectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

ConnectToMongo();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/emi", require("./routes/emi"));

app.listen(port, () => console.log(`🚀 Server running on ${port}`));
