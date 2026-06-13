export function formatFollowers(n: number | null | undefined): string {
  if (n == null) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
}

export function getInfluencerInitials(firstname?: string, lastname?: string): string {
  return ((firstname?.[0] ?? '') + (lastname?.[0] ?? '')) || '?';
}
