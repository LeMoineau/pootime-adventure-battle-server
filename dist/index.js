"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const BattleSocketServer_1 = require("./types/socket/BattleSocketServer");
const battle_manager_1 = __importDefault(require("./manager/battle.manager"));
const room_manager_1 = __importDefault(require("./manager/room.manager"));
const routes_1 = __importDefault(require("./sockets/routes"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
app.get("/", (_, res) => {
    res.send("Express + TypeScript Server");
});
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
exports.io = new BattleSocketServer_1.BattleSocketServer(httpServer, { cors: Object.assign({}, (0, cors_1.default)()) });
battle_manager_1.default.use(exports.io);
room_manager_1.default.use(exports.io);
(0, routes_1.default)(exports.io);
// const socketListener = new SocketListener(httpServer);
// socketListener.listen();
