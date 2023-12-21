export namespace MathUtils {
  export function generateRoomId() {
    return Math.random().toString(36).toUpperCase().substring(2, 6);
  }
}
