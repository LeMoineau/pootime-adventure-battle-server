export namespace MathUtils {
  export function generateRoomId() {
    return Math.random().toString(36).toUpperCase().substring(2, 6);
  }

  export function getRandomInt(max: number, min: number = 0) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Calculate linear interpolation between 2 bornes.
   *
   * Examples:
   * - lerp(20, 80, 0) = 20
   * - lerp(20, 80, 1) = 80
   * - lerp(20, 80, 0.5) = 50
   * @param borneMin
   * @param borneMax
   * @param currentValue
   * @returns
   */
  export function lerp(
    borneMin: number,
    borneMax: number,
    currentValue: number
  ): number {
    return borneMin * (1 - currentValue) + borneMax * currentValue;
  }

  /**
   * Examples:
   * clamp(24, 20, 30) = 24
   * clamp(12, 20, 30) = 20
   * clamp(32, 20, 30) = 30
   * @param a current value
   * @param min
   * @param max
   */
  export function clamp(a: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, a));
  }

  /**
   * Examples:
   * - invlerp(50, 100, 75) = 0.5
   * - invlerp(50, 100, 25) = 0
   * - invlerp(50, 100, 125) = 1
   * @param x borne min
   * @param y borne max
   * @param a current value
   */
  export function invlerp(x: number, y: number, a: number) {
    return clamp((a - x) / (y - x));
  }

  /**
   * Example:
   * - range(10, 100, 2000, 20000, 50) = 10000
   *   where [10, 100] is base range and [2000, 20000] is transposition range
   * @param x1 borne min base range
   * @param y1 borne max base range
   * @param x2 borne min transposition range
   * @param y2 borne max transposition range
   * @param a current val in base range
   * @returns current val in transposition range
   */
  export function range(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    a: number
  ) {
    return lerp(x2, y2, invlerp(x1, y1, a));
  }
}
