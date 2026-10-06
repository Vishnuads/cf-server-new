const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const workshopRoutes = require("./routes/workshopRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const bookOrdersRoutes = require("./routes/bookOrdersRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const placementRoutes = require("./routes/placementRoutes");
const admissionRoutes = require("./routes/admissionRoutes");
const workshopRegistrationRoutes = require("./routes/workshopRegistrationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoute");
const mentorsRoute = require("./routes/mentorsRoute")


const path = require("path");
dotenv.config();
const app = express();
connectDB();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://www.admin.cinemafactoryacademy.com",
      "https://admin.cinemafactoryacademy.com",
      "https://www.cinemafactoryacademy.com",
      "https://cinemafactoryacademy.com",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-App-Secret",
      "X-App-Client",
    ],
  }),
);

app.use("/api/workshops", workshopRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/bookOrders", bookOrdersRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/admission", admissionRoutes);
app.use("/api/workshop-registration", workshopRegistrationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/mentors", mentorsRoute)
app.use("/api/auth", adminRoutes);

app.get("/", (req, res) => {
  res.send("CFA New API is Working...!");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
