/************************************
        Diff Stats
*************************************/

import dedent from "dedent";

export class DiffStats {
  /** Examples of stuff that this should parse
   * ```
    ❯ git diff -M 3a339ed eee60d4 | diffstat -tm
    INSERTED,DELETED,MODIFIED,FILENAME
    0,1,0,"b"
    1,0,0,"b/d"
    ```
  *
  * ```
    ❯ git diff -M | diffstat -tm
    INSERTED,DELETED,MODIFIED,FILENAME
    0,1,0,"path/somefile.txt"
    3,0,1,"path/someotherfile.txt"
    ```
 */

  static mempty(): DiffStats {
    return new DiffStats({ filesChanged: 0, linesChanged: 0 }, []);
  }

  static makeFromDiffstat(diffstatOutput: string): DiffStats {
    const lines = diffstatOutput.trim().split("\n");

    // Validate header
    const header = lines[0].trim();
    const expectedHeader = "INSERTED,DELETED,MODIFIED,FILENAME";
    if (header !== expectedHeader) {
      throw new Error("Invalid diffstat output format");
    }

    // Parse each file's statistics (skip header at index 0)
    const perFileStats = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => parseFileStatLine(line));

    // Calculate summary statistics
    const filesChanged = perFileStats.length;
    const linesChanged = perFileStats.reduce(
      (total, file) =>
        total + file.insertions + file.deletions + file.modifications,
      0,
    );

    return new DiffStats({ filesChanged, linesChanged }, perFileStats);
  }

  constructor(
    private readonly summaryStats: DiffSummaryStats,
    private readonly perFileStats: DiffPerFileStats[],
  ) {}

  getSummaryStats(): DiffSummaryStats {
    return this.summaryStats;
  }

  getNumFilesChanged() {
    return this.summaryStats.filesChanged;
  }

  getNumLinesChanged() {
    return this.summaryStats.linesChanged;
  }

  getDetailedStats() {
    return this.perFileStats;
  }

  toPretty(): string {
    const summary = `${this.summaryStats.filesChanged} files, ${this.summaryStats.linesChanged} lines`;

    if (this.perFileStats.length === 0) {
      return summary;
    }

    const perFileDetails = this.perFileStats
      .map(
        (f) =>
          `  ${f.filename}: +${f.insertions}/-${f.deletions}/~${f.modifications}`,
      )
      .join("\n");

    return dedent`
      ${summary}
      ${perFileDetails}
    `;
  }
}

export interface DiffSummaryStats {
  filesChanged: number;
  /** A changed line can be a modification, a non-modification insertion, or a non-modification deletion. */
  linesChanged: number;
}

// TODO: check how exactly we want to count file renames
export interface DiffPerFileStats {
  /** For now we don't bother with explicit structure for whether it's, e.g., a rename -- we just get the string from diffstat */
  filename: string;
  /** Non-modification insertions, according to diffstat -m */
  insertions: number;
  /** Non-modification deletions, according to diffstat -m */
  deletions: number;
  modifications: number;
}

/*************************
    Parsing helper
**************************/

/**
 * Parses a single CSV line from `diffstat -tm` output into file statistics.
 *
 * @param line - CSV line in format: INSERTED,DELETED,MODIFIED,FILENAME
 * @returns Parsed file statistics
 *
 * @example
 * parseFileStatLine('0,1,0,"b"')
 * // Returns: { filename: "b", insertions: 0, deletions: 1, modifications: 0 }
 *
 * @example
 * parseFileStatLine('3,0,1,"path/someotherfile.txt"')
 * // Returns: { filename: "path/someotherfile.txt", insertions: 3, deletions: 0, modifications: 1 }
 *
 * @example
 * parseFileStatLine('1,2,0,path/file,with,commas.txt')
 * // Returns: { filename: "path/file,with,commas.txt", insertions: 1, deletions: 2, modifications: 0 }
 */
function parseFileStatLine(line: string): DiffPerFileStats {
  const COL_INDEX = {
    insertions: 0,
    deletions: 1,
    modifications: 2,
    filename: 3,
  } as const;
  const MIN_CSV_COLUMNS = Object.keys(COL_INDEX).length;

  const parts = line.split(",");
  if (parts.length < MIN_CSV_COLUMNS) {
    throw new Error(`Invalid CSV line: ${line}`);
  }

  const insertions = parseInt(parts[COL_INDEX.insertions], 10);
  const deletions = parseInt(parts[COL_INDEX.deletions], 10);
  const modifications = parseInt(parts[COL_INDEX.modifications], 10);

  // Filename is everything after the third comma (handles filenames with commas)
  const filenameRaw = parts.slice(COL_INDEX.filename).join(",");
  const filename =
    filenameRaw.startsWith('"') && filenameRaw.endsWith('"')
      ? filenameRaw.slice(1, -1)
      : filenameRaw;

  return {
    filename,
    insertions,
    deletions,
    modifications,
  };
}
