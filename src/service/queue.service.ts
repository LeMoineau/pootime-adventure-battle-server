import { DefaultValues } from "../config/DefaultValues";
import roomController from "../controller/room.controller";
import botFactory from "../factories/bot.factory";
import { SocketId } from "../types/Identifier";
import { Bot } from "../types/player/Bot.impl";
import { Player } from "../types/player/Player.impl";
import { Room } from "../types/room/Room.impl";
import { BattleSocketServer } from "../types/socket/BattleSocketServer";

export class QueueService {
  queue: Player[];
  _io: BattleSocketServer;
  _intervalId?: NodeJS.Timeout;

  constructor(io: BattleSocketServer) {
    this.queue = [];
    this._io = io;
  }

  /**
   * State if the queue is currently looking for matching players
   */
  get running(): boolean {
    return !!this._intervalId;
  }

  /**
   * Start the queue matcher.
   *
   * *Method*:
   * - will look each 5 seconds
   * -
   */
  start() {
    console.log("queue matcher starting");
    this._intervalId = setInterval(() => {
      const now = new Date();

      //trier les players selon leur trophees
      const playersByTrophees = [...this._sortPlayersByTrophees()];

      //si des personnes a moins de 50 trophees -> direct match en commençant par les plus hauts trophées
      for (let i = 0; i < playersByTrophees.length - 1; i++) {
        const stronger = playersByTrophees[i];
        const weaker = playersByTrophees[i + 1];
        if (
          stronger.pooTrophees - weaker.pooTrophees <=
          DefaultValues.TROPHEE_BEST_DISTANCE
        ) {
          this._matchPlayersTogether(stronger, weaker);
          i++;
        }
      }

      //pour les autres sans trophee-match: tri par durée d'attente > 4s et on match ensemble les joueurs qui attendes depuis le plus de temps
      const playersByJoiningDate = [...this._sortPlayersByJoiningDate()];
      for (let i = 0; i < playersByJoiningDate.length - 1; i += 2) {
        if (
          now.getTime() - playersByJoiningDate[i].joiningDate!.getTime() >=
          DefaultValues.MAX_WAITING_TIME
        ) {
          const waitmore = playersByJoiningDate[i];
          const waitless = playersByJoiningDate[i + 1];
          this._matchPlayersTogether(waitmore, waitless);
          i++;
        } else {
          break;
        }
      }

      //si qu'un seul joueur depuis plus de 15s -> bot
      if (this.queue.length === 1) {
        const lastPlayer = this.queue[0];
        if (
          now.getTime() - this.queue[0].joiningDate!.getTime() >=
          DefaultValues.CREATING_BOT_DURATION
        ) {
          this._matchPlayerWithABot(lastPlayer);
        }
      }
    }, DefaultValues.QUEUE_MATCHER_INTERVAL_DURATION);
  }

  _matchPlayerWithABot(player: Player) {
    this.remove({ socketId: player.socketId });
    const room = roomController.create({ owner: player, ranked: true });
    const bot = botFactory.create({ player, room });
    room.add(bot);
    this._io.to(room.id).emit("find-the-room", room.toDTO());
  }

  _sortPlayersByJoiningDate(): Player[] {
    return this.queue.sort(
      (a, b) => b.joiningDate!.getTime() - a.joiningDate!.getTime()
    );
  }

  _matchPlayersTogether(p1: Player, p2: Player) {
    this.remove({ socketId: p1.socketId });
    this.remove({ socketId: p2.socketId });
    const room = roomController.create({ owner: p1, ranked: true });
    room.add(p2);
    this._io.to(room.id).emit("find-the-room", room.toDTO());
  }

  _sortPlayersByTrophees(): Player[] {
    return this.queue.sort((a, b) => b.pooTrophees - a.pooTrophees);
  }

  /**
   * Stop the queue matcher
   */
  stop() {
    console.log("queue matcher stopping");
    clearInterval(this._intervalId);
    this._intervalId = undefined;
  }

  /**
   * Join the queue.
   * @param player the new player to add to the queue
   * @param onRoomCreated if enough players in queue when joining, will call this callback with the created room
   */
  join(player: Player) {
    if (!this.running) this.start();
    if (!this.contains({ socketId: player.socketId })) {
      player.joiningDate = new Date();
      this.queue.push(player);
      console.log(`#${player.socketId} join the queue`);
    }
    // if (this.queue.length >= 1) {
    //   const adv = this.remove({ index: 0 })!;
    //   const room = roomController.create({ owner: player, ranked: true });
    //   room.add(adv);
    //   onRoomCreated(room);
    // } else {
    //   this.queue.push(player);
    //   console.log(`#${player.socketId} join the queue`);
    // }
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
      const res = this.queue.splice(_index, 1)[0];
      if (this.queue.length <= 0 && this.running) {
        this.stop();
      }
      return res;
    }
  }

  contains({ socketId }: { socketId: SocketId }) {
    return !!this.queue.find((p) => p.socketId === socketId);
  }
}
