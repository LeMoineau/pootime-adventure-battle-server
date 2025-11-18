import { RoomId } from "../Identifier";
import { Room } from "../room/Room.impl";
import { Player } from "./Player.impl";
import { v4 as uuidv4 } from "uuid";
import { UltiDetails } from "./UltiDetails";
import battleManager from "../../manager/battle.manager";
import botFactory from "../../factories/bot.factory";
import { ultis } from "../../config/constants/stats/utlis";

export class Bot extends Player {
  botId: string;
  room: Room;
  ulti?: UltiDetails;
  hittingRate: number;
  intervalId?: NodeJS.Timeout;

  constructor({
    pooTrophees,
    room,
    hittingRate,
  }: {
    pooTrophees: number;
    room: Room;
    hittingRate: number;
  }) {
    super({ pooTrophees });
    this.botId = uuidv4();
    this.room = room;
    this.hittingRate = hittingRate;
  }

  get socketId() {
    return this.botId;
  }

  get roomId() {
    return this.room.id;
  }

  join(_: RoomId): void {}

  /**
   * generate the bot stats according to the player battle state
   * @param player bot adv
   */
  generate(player: Player) {
    const battleState = botFactory.generateBattleState(player);
    if (battleState.stats.ultiSelected) {
      this.ulti = Object.entries(ultis).find(
        ([k, _]) => k === battleState.stats.ultiSelected
      )?.[1].details;
    }
    battleManager.sendingPlayerInfos(this.roomId, this.socketId, battleState);
  }

  start() {
    this.intervalId = setInterval(() => {
      battleManager.hit(this.roomId, this.socketId);
      if (this.ulti && this.canSpell(this.ulti)) {
        battleManager.spell(this.roomId, this.socketId, this.ulti);
      }
    }, this.hittingRate);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
}
