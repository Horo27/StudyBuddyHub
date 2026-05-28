const AVATAR_GRADIENTS: [string, string][] = [
  ['#1a1f5e', '#ff6b35'],
  ['#2a3180', '#ff8c5c'],
  ['#1a1f5e', '#5c66c4'],
  ['#0f8a5f', '#1a1f5e'],
  ['#b35900', '#ff6b35'],
  ['#1a1f5e', '#c44a89'],
  ['#2d5f8f', '#1a1f5e'],
  ['#ff6b35', '#c44a89'],
  ['#3b3f9c', '#0f8a5f'],
];

export function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(s => s[0] ?? '').join('').toUpperCase();
}

export function gradientFor(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

export function avatarStyle(name: string): string {
  const [a, b] = gradientFor(name);
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
