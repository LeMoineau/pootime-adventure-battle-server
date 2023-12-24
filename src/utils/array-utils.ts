export namespace ArrayUtils {
  export function includesAll<T>(arrSrc: T[], arrTarget: T[]): boolean {
    for (let t of arrSrc) {
      if (!arrTarget.includes(t)) {
        return false;
      }
    }
    return true;
  }
}
