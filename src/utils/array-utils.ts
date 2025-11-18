import { MathUtils } from "./math-utils";

export namespace ArrayUtils {
  export function includesAll<T>(arrSrc: T[], arrTarget: T[]): boolean {
    for (let t of arrSrc) {
      if (!arrTarget.includes(t)) {
        return false;
      }
    }
    return true;
  }

  export function getRandomItem<T>(arr: T[]): T {
    const index = MathUtils.getRandomInt(arr.length);
    return arr[index];
  }

  export function shuffle<T>(arr: T[]): T[] {
    let array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
