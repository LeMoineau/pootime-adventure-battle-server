import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { BattleSocketServer } from "./types/socket/BattleSocketServer";
import battleManager from "./manager/battle.manager";
import roomManager from "./manager/room.manager";
import routeSockets from "./sockets/routes";

dotenv.config();
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(bodyParser.json());
app.use(cors());

const httpServer = createServer(app);

app.get("/", (_: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export const io = new BattleSocketServer(httpServer, { cors: { ...cors() } });
battleManager.use(io);
roomManager.use(io);
routeSockets(io);

// const socketListener = new SocketListener(httpServer);
// socketListener.listen();
