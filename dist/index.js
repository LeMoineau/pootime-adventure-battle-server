"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const SocketEvent_1 = require("./types/SocketEvent");
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./socket"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
exports.httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(exports.httpServer, { cors: Object.assign({}, (0, cors_1.default)()) });
app.get("/", (_, res) => {
    res.send("Express + TypeScript Server");
});
io.on(SocketEvent_1.SocketEvent.CONNECTION, socket_1.default);
exports.httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
