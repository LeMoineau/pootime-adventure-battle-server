export const xpNeededForNextLevel = (currentLevel: number): number => {
  return Math.round(1.5 + currentLevel * 1.2);
};
