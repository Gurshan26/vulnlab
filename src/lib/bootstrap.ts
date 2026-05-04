import { seedDatabase } from '../../db/seed';

let seeded = false;

export function ensureSeeded(): void {
  if (seeded) return;
  seedDatabase();
  seeded = true;
}
