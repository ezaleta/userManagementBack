// backend/index.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", authRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
