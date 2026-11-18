export function milestoneTargetPoints(level: number) {
  const multiplier = level <= 16 ? 1 : level <= 31 ? 2.5 : 4.5;
  return Math.ceil(multiplier * level ** 2);
}

export function milestoneRewardKarma(level: number) {
  if (level === 1) return 500;
  if (level === 2) return 1_000;
  return 2_000;
}
