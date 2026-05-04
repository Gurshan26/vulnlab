import '@testing-library/jest-dom';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, vi } from 'vitest';
import { closeDb } from '../src/lib/db';

process.env.TEST_DB_PATH = path.join(os.tmpdir(), 'vulnlab.test.db');
try {
  fs.unlinkSync(process.env.TEST_DB_PATH);
} catch {
  // ignore
}

vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
  cb();
  return 0;
});

afterAll(() => {
  closeDb();
});
