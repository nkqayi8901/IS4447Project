type Activity = { date: string };

export function calculateStreak(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const uniqueDays = [...new Set(activities.map(a => a.date))].sort().reverse();
  if (uniqueDays.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function formatStreak(count: number): string {
  if (count === 0) return '';
  return `${count} day streak`;
}
