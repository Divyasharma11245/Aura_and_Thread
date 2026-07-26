import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";

dotenv.config();

import connectDb from "./config/db.js";
import { initializeSocket, getIO } from "./config/socket.js";

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

connectDb();
const server = http.createServer(app);

initializeSocket(server);

// app.get("/", (req, res) => {
//   res.send("Hello world from divya!");
// });

server.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
