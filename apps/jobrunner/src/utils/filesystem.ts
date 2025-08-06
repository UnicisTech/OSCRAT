import { temporaryDirectoryTask } from 'tempy';

export async function withTempDirectory<T>(
  prefix: string,
  task: (tempDir: string) => Promise<T>
): Promise<T> {
  const options = {
    prefix: `${prefix}-`,
  };

  return temporaryDirectoryTask(task, options);
}
