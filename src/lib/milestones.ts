export function milestoneTargetPoints(level: number) {
  return 500 * level;
}

export function milestoneRewardKarma(level: number) {
  if (level === 1) return 500;
  if (level === 2) return 1_000;
  return 2_000;
}
