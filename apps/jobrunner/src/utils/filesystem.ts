import { temporaryDirectoryTask } from 'tempy';
import * as path from 'path';

export function resolveInTempDir(baseDir: string, filename: string): string {
  const base = path.basename(filename.replace(/\\/g, '/'));
  if (!base || base === '.' || base === '..' || base.includes('\0')) {
    throw new Error('Invalid upload filename');
  }
  return path.join(baseDir, base);
}

export async function withTempDirectory<T>(
  prefix: string,
  task: (tempDir: string) => Promise<T>
): Promise<T> {
  const options = {
    prefix: `${prefix}-`,
  };

  return temporaryDirectoryTask(task, options);
}
