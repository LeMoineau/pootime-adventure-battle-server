import { RoomId, SocketId } from "../types/Identifier";
import { Player } from "../types/player/Player.impl";
import { Room } from "../types/room/Room.impl";
import { MathUtils } from "../utils/math-utils";
import playerController from "./player.controller";

class RoomController {
  rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  /**
   * create a new room, save it in all rooms then return it
   * @param owner owner socket id
   * @returns created room
   */
  create({ owner, ranked }: { owner: Player; ranked?: boolean }): Room {
    const alreadyExistingRoom = this.get({ ownerId: owner.socketId });
    if (alreadyExistingRoom) return alreadyExistingRoom;
    const room = new Room({
      id: MathUtils.generateRoomId(),
      owner,
      ranked,
    });
    this.rooms.push(room);
    return room;
  }

  /**
   * Get a specific room
   * @param id targeted room id
   * @returns the found room or undefined
   */
  get({ id, ownerId }: { id?: RoomId; ownerId?: SocketId }): Room | undefined {
    return id !== undefined || ownerId != undefined
      ? this.rooms.find((r) => (id ? r.id === id : r.ownerId === ownerId))
      : undefined;
  }

  exists({ id, ownerId }: { id?: RoomId; ownerId?: SocketId }): boolean {
    return !!this.get({ id, ownerId });
  }

  /**
   * Destroy a room and return it
   * @param id targeted room id
   * @param ownerId ownerId of the targeted room id
   * @returns the removed room if found, else undefined
   */
  remove({
    id,
    ownerId,
    playerId,
  }: {
    id?: RoomId;
    ownerId?: SocketId;
    playerId?: SocketId;
  }): Room | undefined {
    if (id === undefined && ownerId === undefined && playerId === undefined) {
      return;
    }
    const index = this.rooms.findIndex((r) => {
      if (id) return r.id === id;
      if (ownerId) return r.ownerId === ownerId;
      if (playerId) return r.contains({ socketId: playerId });
    });
    if (index !== -1) {
      for (let p of this.rooms[index].players) {
        playerController.remove({ socketId: p.socketId });
      }
      console.log(`room #${this.rooms[index].id} destroyed`);
      return this.rooms.splice(index, 1)[0];
    }
  }
}

export default new RoomController();
