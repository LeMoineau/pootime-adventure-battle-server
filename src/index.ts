import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { SocketEvent } from "./types/SocketEvent";
import { MathUtils } from "./utils/math-utils";
import { Room } from "./types/Room";
import { Server } from "socket.io";
import onConnection from "./socket";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(bodyParser.json());
app.use(cors());

export const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { ...cors() } });

app.get("/", (_: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

io.on(SocketEvent.CONNECTION, onConnection);

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
