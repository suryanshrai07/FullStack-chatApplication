import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./DB/index.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import cors from "cors";
import { app, server, io } from "./utils/socket.js";
import path from "path";

const PORT = process.env.PORT;
const __dirname = path.resolve();

//middlewares
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// auth routes
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("hello world");
});

connectDB()
  .then(() => {
    server.on("error", (error) => {
      console.log("Error :", error);
    });

    server.listen(PORT , () => {
      console.log(`App is listening on PORT:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDb connection Error:", error);
  });
