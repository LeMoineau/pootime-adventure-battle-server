import { BattleState } from "../battle/BattleState";
import { RoomDTO } from "./Room.dto";
import { RoomId, SocketId } from "../Identifier";
import { Player } from "../player/Player.impl";

export class Room {
  id: RoomId;
  owner: Player;
  players: Player[];

  constructor({ id, owner }: { id: RoomId; owner: Player }) {
    this.id = id;
    this.owner = owner;
    this.players = [];
    this.add(owner);
  }

  get ownerId() {
    return this.owner.socketId;
  }

  get playerIds() {
    return this.players.map((p) => p.socketId);
  }

  get playerBattleStates() {
    return Object.keys(this.battleStateByPlayerId);
  }

  get battleStateByPlayerId() {
    let res: { [socketId: SocketId]: BattleState } = {};
    for (let p of this.players) {
      if (p.battleState) res[p.socketId] = p.battleState;
    }
    return res;
  }

  add(player: Player) {
    if (!this.contains({ socketId: player.socketId })) {
      this.players.push(player);
      player.join(this.id);
    }
  }

  get({ socketId }: { socketId: SocketId }): Player | undefined {
    return this.players.find((p) => p.socketId === socketId);
  }

  contains({ socketId }: { socketId: SocketId }): boolean {
    return !!this.get({ socketId });
  }

  /**
   * Get the adv of targeted socket player
   * @param socketId current player
   * @returns adv socket or undefined if current player is alone
   */
  getAdvOf({ socketId }: { socketId: SocketId }): Player | undefined {
    return this.players.find((p) => p.socketId !== socketId);
  }

  /**
   * Get the current player and its adv
   * @param socketId the current player socket id
   * @returns [current player, adv] where both can be undefined if not found
   */
  getPlayerAndAdv({
    socketId,
  }: {
    socketId: SocketId;
  }): [Player | undefined, Player | undefined] {
    return [this.get({ socketId }), this.getAdvOf({ socketId })];
  }

  getWinner(): Player | undefined {
    return this.finish()
      ? this.players.find(
          (p) => p.battleState && p.battleState.currentState.currentPv > 0
        )
      : undefined;
  }

  ready() {
    return this.players.every((p) => p.ready);
  }

  finish() {
    return !!this.players.find((p) => p.died);
  }

  toDTO(): RoomDTO {
    return {
      id: this.id,
      owner: this.ownerId,
      players: this.playerIds,
      battleState: this.battleStateByPlayerId,
      battleFinish: this.finish(),
    };
  }
}
