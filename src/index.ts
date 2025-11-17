import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { SocketListener } from "./socket.listener";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(bodyParser.json());
app.use(cors());

const httpServer = createServer(app);
const socketListener = new SocketListener(httpServer);

app.get("/", (_: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

socketListener.listen();
