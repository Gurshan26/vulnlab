import { diffLines } from 'diff';

export interface DiffLine {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeLineDiff(beforeCode: string, afterCode: string): DiffLine[] {
  return diffLines(beforeCode, afterCode);
}
