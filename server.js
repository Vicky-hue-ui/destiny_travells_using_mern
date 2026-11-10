require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const destinationRoutes = require("./routes/destinationRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to Destiny Travels API" });
});

app.use("/api/destinations", destinationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
