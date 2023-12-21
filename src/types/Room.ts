export type SocketId = string;
export type RoomId = string;

export interface Room {
  id: RoomId;
  owner: SocketId;
  players: SocketId[];
}
