import roomController from "../controller/room.controller";
import { SocketId } from "../types/Identifier";
import { Player } from "../types/player/Player.impl";
import { Room } from "../types/room/Room.impl";

class QueueService {
  queue: Player[];

  constructor() {
    this.queue = [];
  }

  /**
   * Join the queue.
   * @param player the new player to add to the queue
   * @param onRoomCreated if enough players in queue when joining, will call this callback with the created room
   */
  join(player: Player, onRoomCreated: (room: Room) => void) {
    if (this.queue.length >= 1) {
      const adv = this.remove({ index: 0 })!;
      const room = roomController.create({ owner: player });
      room.add(adv);
      onRoomCreated(room);
    } else {
      this.queue.push(player);
      console.log(`#${player.socketId} join the queue`);
    }
  }

  /**
   * Remove a player from the queue
   * @param socketId socketId of the targeted player to remove from the queue
   * @param index index of the targeted player to remove from the queue
   * @returns the removed player if found
   */
  remove({
    socketId,
    index,
  }: {
    socketId?: SocketId;
    index?: number;
  }): Player | undefined {
    if (socketId === undefined && index === undefined) return;
    const _index =
      index ?? this.queue.findIndex((p) => p.socketId === socketId);
    if (typeof _index === "number" && _index !== -1) {
      return this.queue.splice(_index, 1)[0];
    }
  }
}

export default new QueueService();
