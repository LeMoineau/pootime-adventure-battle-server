import { describe, expect, jest, test } from "@jest/globals";
import { Player } from "../types/player/Player.impl";
import MockedSocket from "socket.io-mock";
import { QueueService } from "./queue.service";
import { BattleSocketServer } from "../types/socket/BattleSocketServer";

describe("queue.service", () => {
  test("sort players by trophees", () => {
    const p1 = new Player({ socket: MockedSocket, pooTrophees: 120 });
    const p2 = new Player({ socket: MockedSocket, pooTrophees: 100 });
    const p3 = new Player({ socket: MockedSocket, pooTrophees: 140 });

    const queueService = new QueueService({} as BattleSocketServer);

    queueService.join(p1);
    queueService.join(p2);
    queueService.join(p3);
    queueService.stop();

    expect(queueService._sortPlayersByTrophees()).toStrictEqual([p3, p2, p1]);
  });
});
