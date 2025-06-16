export function getReputationLevel(points: number): string {
  if (points >= 1000) return 'Legend';
  if (points >= 500) return 'Expert';
  if (points >= 250) return 'Advanced';
  if (points >= 100) return 'Intermediate';
  if (points >= 50) return 'Contributor';
  return 'Beginner';
} 