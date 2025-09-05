import fs from 'fs-extra';

/** Copied and adapted from Playwright's Apache-2.0-licensed fileUtils.ts */
export async function removeFolders(dirs: string[]): Promise<(Error | undefined)[]> {
  return await Promise.all(dirs.map(async (dir: string) => {
    try {
      await fs.promises.rm(dir, { recursive: true, force: true, maxRetries: 10 });
      return undefined;
    } catch (e: unknown) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }));
}
